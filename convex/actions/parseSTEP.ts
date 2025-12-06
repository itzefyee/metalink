"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";

export const extractGeometry = action({
  args: { stepFileId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Check cache first (if Redis is available)
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      const cached = await redis.get(`geometry:${args.stepFileId}`);
      if (cached) {
        console.log("✅ Cache HIT for geometry extraction");
        return JSON.parse(cached as string);
      }
      console.log("❌ Cache MISS - Parsing STEP file");
    } catch (error) {
      console.log("Redis not available, proceeding without cache");
    }

    // Load STEP file from Convex storage
    const stepBlob = await ctx.storage.get(args.stepFileId);
    if (!stepBlob) {
      throw new Error("STEP file not found in storage");
    }
    const stepBuffer = await stepBlob.arrayBuffer();

    // Initialize OpenCascade WASM - use dynamic import to avoid esbuild issues
    const opencascadeModule = await import("opencascade.js");
    const initOpenCascade = opencascadeModule.default || opencascadeModule;
    const oc = await initOpenCascade();

    // Declare WASM objects for cleanup
    let reader: any = null;
    let props: any = null;
    let bbox: any = null;
    let faceExplorer: any = null;
    let shape: any = null;

    try {
      // Read STEP file
      reader = new oc.STEPControl_Reader_1();
      const readStatus = reader.ReadStream(
        new oc.Standard_IStream(new Uint8Array(stepBuffer))
      );

      if (readStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
        throw new Error("Failed to read STEP file");
      }

      reader.TransferRoots(new oc.Message_ProgressRange_1());
      shape = reader.OneShape();

      // Extract geometry data
      props = new oc.GProp_GProps_1();
      oc.BRepGProp.VolumeProperties_2(shape, props, false, false, false);
      
      const volume = props.Mass();
      const centerOfMass = props.CentreOfMass();

      // Bounding box
      bbox = new oc.Bnd_Box_1();
      oc.BRepBndLib.Add(shape, bbox, false);
      const [xMin, yMin, zMin, xMax, yMax, zMax] = [
        bbox.CornerMin().X(), bbox.CornerMin().Y(), bbox.CornerMin().Z(),
        bbox.CornerMax().X(), bbox.CornerMax().Y(), bbox.CornerMax().Z(),
      ];

      // Detect holes (cylindrical faces)
      const holes = [];
      faceExplorer = new oc.TopExp_Explorer_2(
        shape,
        oc.TopAbs_ShapeEnum.TopAbs_FACE,
        oc.TopAbs_ShapeEnum.TopAbs_SHAPE
      );

      while (faceExplorer.More()) {
        const face = oc.TopoDS.Face_1(faceExplorer.Current());
        const surface = oc.BRep_Tool.Surface_2(face);

        if (surface.DynamicType().Name() === "Geom_CylindricalSurface") {
          const cylinder = new oc.Geom_CylindricalSurface(surface);
          const radius = cylinder.Radius();
          const axis = cylinder.Axis();
          
          holes.push({
            center: {
              x: axis.Location().X(),
              y: axis.Location().Y(),
              z: axis.Location().Z(),
            },
            diameter: radius * 2,
            axis: {
              x: axis.Direction().X(),
              y: axis.Direction().Y(),
              z: axis.Direction().Z(),
            },
          });
        }

        faceExplorer.Next();
      }

      // Calculate edge distances
      const edgeDistances = holes.map(hole => ({
        holeCenter: hole.center,
        distanceToMinX: Math.abs(hole.center.x - xMin),
        distanceToMaxX: Math.abs(xMax - hole.center.x),
        distanceToMinY: Math.abs(hole.center.y - yMin),
        distanceToMaxY: Math.abs(yMax - hole.center.y),
      }));

      // Estimate thickness (difference between min/max Z)
      const thickness = zMax - zMin;

      const geometryData = {
        dimensions: {
          width: xMax - xMin,
          height: yMax - yMin,
          length: zMax - zMin,
          volume,
          thickness,
          bounds: { min: {xMin, yMin, zMin}, max: {xMax, yMax, zMax} },
        },
        holes,
        edgeDistances,
        centerOfMass: {
          x: centerOfMass.X(),
          y: centerOfMass.Y(),
          z: centerOfMass.Z(),
        },
      };

      // Cache for 1 hour (if Redis is available)
      try {
        const { Redis } = await import("@upstash/redis");
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        
        await redis.setex(
          `geometry:${args.stepFileId}`,
          3600,
          JSON.stringify(geometryData)
        );
      } catch (error) {
        console.log("Redis not available, skipping cache");
      }

      return geometryData;
    } finally {
      // Cleanup WASM objects to prevent memory leaks
      if (faceExplorer) {
        try {
          faceExplorer.delete();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (bbox) {
        try {
          bbox.delete();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (props) {
        try {
          props.delete();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (reader) {
        try {
          reader.delete();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  },
});

