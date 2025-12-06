/* eslint-disable @typescript-eslint/no-explicit-any */
// OpenCascade.js doesn't provide TypeScript types, so we need to use 'any' for its APIs

import { ManufacturingAnalyzer } from './cad-manufacturing-analyzer';

export interface HoleInfo {
  center: { x: number; y: number; z: number };
  diameter: number;
  radius: number;
  axis: { x: number; y: number; z: number };
  isStandardSize: boolean;
}

export interface HoleAnalysis {
  holes: HoleInfo[];
  count: number;
  edgeDistances: EdgeDistanceInfo[];
  spacingViolations: SpacingViolation[];
  nonStandardSizes: NonStandardSize[];
}

export interface EdgeDistanceInfo {
  holeIndex: number;
  holeDiameter: number;
  minEdgeDistance: number;
  distances: {
    toXMin: number;
    toXMax: number;
    toYMin: number;
    toYMax: number;
    toZMin: number;
    toZMax: number;
  };
  compliance: {
    rolled: boolean;
    sheared: boolean;
    requiredRolled: number;
    requiredSheared: number;
    margin: number;
    standard: string;
  };
  closestEdge: string;
}

export interface SpacingViolation {
  hole1: number;
  hole2: number;
  actual: number;
  minimum: number;
  preferred: number;
  violation: string;
  standard: string;
}

export interface NonStandardSize {
  holeIndex: number;
  actual: number;
  nearest: number;
  requiresSpecialTooling: boolean;
}

export interface ThicknessAnalysis {
  estimatedThickness: number;
  minDimension: number;
  samples: number[];
  isStandardGauge: boolean;
  minWeldSize: number;
  maxWeldSize: number;
  requiresPreheat: boolean;
}

export interface EdgeInfo {
  type: 'straight' | 'circular';
  length?: number;
  direction?: { x: number; y: number; z: number };
  radius?: number;
  isSharpCorner?: boolean;
  isFillet?: boolean;
}

export interface SharpCorner {
  radius: number;
  location: { x: number; y: number; z: number };
  warning: string;
}

export interface EdgeAnalysis {
  edges: EdgeInfo[];
  totalEdges: number;
  sharpCorners: SharpCorner[];
  warnings: string[];
}

export interface WeldJoint {
  type: string;
  angle: number;
  accessible: boolean;
  minIncludedAngle: number;
  meetsAWSRequirement: boolean;
  clearanceRequired: number;
  sharedEdgeLength: number;
}

export interface WeldRecommendation {
  jointIndex: number;
  issue: string;
  recommendation: string;
  standard: string;
}

export interface WeldJointAnalysis {
  joints: WeldJoint[];
  totalJoints: number;
  accessibilityIssues: number;
  recommendations: WeldRecommendation[];
}

export interface BendInfo {
  index: number;
  radius: number;
  minRequired: number;
  compliant: boolean;
  material: string;
  thickness: number;
  margin: number;
  warning: string | null;
}

export interface BendAnalysis {
  bends: BendInfo[];
  totalBends: number;
  violations: number;
  materialGrade: string;
  minBendRadius: number;
}

export interface BoundingBoxWithTolerance {
  length: number;
  width: number;
  height: number;
  bounds: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  tolerance: number;
}

export interface CADModelData {
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  faces: number;
  edges: number;
  vertices_count: number;
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  volume?: number;
  surfaceArea?: number;
  parts: CADPart[];
  // Unit information
  unitScale?: number; // Scale factor used to convert to inches
  detectedUnit?: string; // Original unit detected (e.g., "METRE", "MILLIMETRE")
  // Manufacturing analysis data (computed on-demand)
  boundingBoxWithTolerance?: BoundingBoxWithTolerance;
  holeAnalysis?: HoleAnalysis;
  thicknessAnalysis?: ThicknessAnalysis;
  edgeAnalysis?: EdgeAnalysis;
  weldJointAnalysis?: WeldJointAnalysis;
  bendAnalysis?: BendAnalysis;
  // Internal: cached shape for on-demand analysis
  _internalShapeData?: {
    fileContent: ArrayBuffer;
    fileType: string;
  };
}

export interface CADPart {
  id: string;
  name: string;
  type: 'solid' | 'face' | 'edge' | 'vertex';
  volume?: number;
  surfaceArea?: number;
  mass?: number;
  centerOfMass?: { x: number; y: number; z: number };
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}

export class CADParser {
  private oc: any = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('CAD parser can only be used in browser environment');
    }
    
    try {
      // Dynamically import OpenCascade.js - only works client-side
      const initOpenCascade = (await import('opencascade.js')).default;
      this.oc = await initOpenCascade();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenCascade.js:', error);
      throw new Error('Failed to initialize CAD parser');
    }
  }

  async parseSTEP(fileContent: ArrayBuffer): Promise<CADModelData> {
    if (!this.oc) throw new Error('OpenCascade not initialized');

    const filename = 'model.step';
    let reader: any = null;
    let shape: any = null;

    try {
      // Write file to virtual filesystem
      const fileData = new Uint8Array(fileContent);
      this.oc.FS.writeFile(filename, fileData);

      // Read STEP file
      reader = new this.oc.STEPControl_Reader_1();
      const status = reader.ReadFile(filename);
      

      if (status !== this.oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
        // Get more details about the failure
        const statusNames = Object.keys(this.oc.IFSelect_ReturnStatus);
        const statusName = statusNames.find((key: string) => 
          this.oc.IFSelect_ReturnStatus[key] === status
        ) || 'Unknown';
        
        console.error('STEP ReadFile failed:', {
          status,
          statusName,
          fileSize: fileContent.byteLength
        });
        
        throw new Error(`Failed to read STEP file. Status: ${statusName} (${status}). The file may be corrupted or incomplete.`);
      }

      reader.TransferRoots(new this.oc.Message_ProgressRange_1());
      
      // Check number of roots transferred
      const nbRoots = reader.NbRootsForTransfer();
      
      if (nbRoots === 0) {
        throw new Error('No geometric data found in STEP file. The file may be empty or contain only metadata.');
      }

      shape = reader.OneShape();
      
      if (!shape || shape.IsNull()) {
        throw new Error('STEP file contains no valid geometric shape. The file may be incomplete or contain only non-geometric data.');
      }

      // CRITICAL: Detect and convert units from STEP file
      const unitScale = this.detectSTEPUnits(reader, fileContent);
      console.log(`STEP file units detected: scale factor = ${unitScale} (to inches)`);

      // Extract geometry data with unit conversion
      const modelData = this.extractGeometry(shape, unitScale);

      // CRITICAL: Run manufacturing analysis BEFORE deleting shape
      console.log('Running manufacturing analysis...');
      const analyzer = new ManufacturingAnalyzer(this.oc);
      const manufacturingData = analyzer.analyzeManufacturing(shape, 'A36');

      // Apply unit scaling to manufacturing data
      const scaledManufacturingData = this.scaleManufacturingData(manufacturingData, unitScale);

      // Merge manufacturing data into model data
      Object.assign(modelData, scaledManufacturingData);

      console.log('Manufacturing analysis complete:', {
        holes: modelData.holeAnalysis?.count || 0,
        thickness: modelData.thicknessAnalysis?.estimatedThickness || 0,
        welds: modelData.weldJointAnalysis?.totalJoints || 0,
        bends: modelData.bendAnalysis?.totalBends || 0
      });

      // Cleanup
      this.oc.FS.unlink(filename);
      if (shape) shape.delete();
      if (reader) reader.delete();

      return modelData;
    } catch (error: any) {
      console.error('Error parsing STEP file:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        fileSize: fileContent.byteLength
      });
      
      // Cleanup on error
      try {
        if (this.oc) {
          try { this.oc.FS.unlink(filename); } catch {}
          if (shape) try { shape.delete(); } catch {}
          if (reader) try { reader.delete(); } catch {}
        }
      } catch (cleanupError) {
        console.warn('Error during cleanup:', cleanupError);
      }
      
      throw new Error(`STEP parsing failed: ${error.message}`);
    }
  }

  /**
   * Detect units from STEP file and return scale factor to convert to inches
   * STEP files can be in: mm, cm, m, inches, feet
   * Our system uses inches as the standard unit
   */
  private detectSTEPUnits(reader: any, fileContent: ArrayBuffer): number {
    try {
      // Method 1: Parse STEP file text to find LENGTH_UNIT
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(fileContent);
      
      // Look for LENGTH_UNIT declaration in STEP file
      // Example: #10=LENGTH_UNIT()*SI_UNIT($,.METRE.);
      const lengthUnitMatch = text.match(/LENGTH_UNIT\(\)\*[^;]*\.(METRE|MILLIMETRE|CENTIMETRE|INCH|FOOT)\./i);
      
      if (lengthUnitMatch) {
        const unit = lengthUnitMatch[1].toUpperCase();
        console.log(`✓ Unit detected from STEP file: ${unit}`);
        
        switch (unit) {
          case 'METRE':
            return 39.3701; // 1 meter = 39.3701 inches
          case 'MILLIMETRE':
            return 0.0393701; // 1 mm = 0.0393701 inches
          case 'CENTIMETRE':
            return 0.393701; // 1 cm = 0.393701 inches
          case 'INCH':
            return 1.0; // Already in inches
          case 'FOOT':
            return 12.0; // 1 foot = 12 inches
        }
      }

      // Method 2: Heuristic detection based on geometry size
      // This is a fallback if unit declaration is not found
      console.warn('⚠ Unit not found in STEP file, using heuristic detection');
      
      // Default: assume millimeters (most common for STEP files)
      console.warn('→ Defaulting to MILLIMETERS');
      return 0.0393701;
      
    } catch (error) {
      console.error('Error detecting STEP units:', error);
      // Safe default: millimeters
      console.warn('→ Defaulting to MILLIMETERS due to error');
      return 0.0393701;
    }
  }

  /**
   * Scale manufacturing analysis data to match unit conversion
   * All linear dimensions need to be scaled
   */
  private scaleManufacturingData(data: any, unitScale: number): any {
    if (!data) return {};

    const scaled: any = {};

    // Scale bounding box with tolerance
    if (data.boundingBoxWithTolerance) {
      scaled.boundingBoxWithTolerance = {
        ...data.boundingBoxWithTolerance,
        length: data.boundingBoxWithTolerance.length * unitScale,
        width: data.boundingBoxWithTolerance.width * unitScale,
        height: data.boundingBoxWithTolerance.height * unitScale,
        bounds: {
          min: {
            x: data.boundingBoxWithTolerance.bounds.min.x * unitScale,
            y: data.boundingBoxWithTolerance.bounds.min.y * unitScale,
            z: data.boundingBoxWithTolerance.bounds.min.z * unitScale,
          },
          max: {
            x: data.boundingBoxWithTolerance.bounds.max.x * unitScale,
            y: data.boundingBoxWithTolerance.bounds.max.y * unitScale,
            z: data.boundingBoxWithTolerance.bounds.max.z * unitScale,
          },
        },
        tolerance: data.boundingBoxWithTolerance.tolerance * unitScale,
      };
    }

    // Scale hole analysis
    if (data.holeAnalysis) {
      scaled.holeAnalysis = {
        ...data.holeAnalysis,
        holes: data.holeAnalysis.holes?.map((hole: any) => ({
          ...hole,
          center: {
            x: hole.center.x * unitScale,
            y: hole.center.y * unitScale,
            z: hole.center.z * unitScale,
          },
          diameter: hole.diameter * unitScale,
          radius: hole.radius * unitScale,
        })),
        edgeDistances: data.holeAnalysis.edgeDistances?.map((ed: any) => ({
          ...ed,
          holeDiameter: ed.holeDiameter * unitScale,
          minEdgeDistance: ed.minEdgeDistance * unitScale,
          distances: {
            toXMin: ed.distances.toXMin * unitScale,
            toXMax: ed.distances.toXMax * unitScale,
            toYMin: ed.distances.toYMin * unitScale,
            toYMax: ed.distances.toYMax * unitScale,
            toZMin: ed.distances.toZMin * unitScale,
            toZMax: ed.distances.toZMax * unitScale,
          },
          compliance: {
            ...ed.compliance,
            requiredRolled: ed.compliance.requiredRolled * unitScale,
            requiredSheared: ed.compliance.requiredSheared * unitScale,
            margin: ed.compliance.margin * unitScale,
          },
        })),
        spacingViolations: data.holeAnalysis.spacingViolations?.map((sv: any) => ({
          ...sv,
          actual: sv.actual * unitScale,
          minimum: sv.minimum * unitScale,
          preferred: sv.preferred * unitScale,
        })),
        nonStandardSizes: data.holeAnalysis.nonStandardSizes?.map((ns: any) => ({
          ...ns,
          actual: ns.actual * unitScale,
          nearest: ns.nearest * unitScale,
        })),
      };
    }

    // Scale thickness analysis
    if (data.thicknessAnalysis) {
      scaled.thicknessAnalysis = {
        ...data.thicknessAnalysis,
        estimatedThickness: data.thicknessAnalysis.estimatedThickness * unitScale,
        minDimension: data.thicknessAnalysis.minDimension * unitScale,
        samples: data.thicknessAnalysis.samples?.map((s: number) => s * unitScale),
        minWeldSize: data.thicknessAnalysis.minWeldSize * unitScale,
        maxWeldSize: data.thicknessAnalysis.maxWeldSize * unitScale,
      };
    }

    // Scale edge analysis
    if (data.edgeAnalysis) {
      scaled.edgeAnalysis = {
        ...data.edgeAnalysis,
        edges: data.edgeAnalysis.edges?.map((edge: any) => ({
          ...edge,
          length: edge.length ? edge.length * unitScale : undefined,
          radius: edge.radius ? edge.radius * unitScale : undefined,
        })),
        sharpCorners: data.edgeAnalysis.sharpCorners?.map((corner: any) => ({
          ...corner,
          radius: corner.radius * unitScale,
          location: {
            x: corner.location.x * unitScale,
            y: corner.location.y * unitScale,
            z: corner.location.z * unitScale,
          },
        })),
      };
    }

    // Scale weld joint analysis
    if (data.weldJointAnalysis) {
      scaled.weldJointAnalysis = {
        ...data.weldJointAnalysis,
        joints: data.weldJointAnalysis.joints?.map((joint: any) => ({
          ...joint,
          clearanceRequired: joint.clearanceRequired * unitScale,
          sharedEdgeLength: joint.sharedEdgeLength * unitScale,
        })),
      };
    }

    // Scale bend analysis
    if (data.bendAnalysis) {
      scaled.bendAnalysis = {
        ...data.bendAnalysis,
        bends: data.bendAnalysis.bends?.map((bend: any) => ({
          ...bend,
          radius: bend.radius * unitScale,
          minRequired: bend.minRequired * unitScale,
          thickness: bend.thickness * unitScale,
          margin: bend.margin * unitScale,
        })),
        minBendRadius: data.bendAnalysis.minBendRadius * unitScale,
      };
    }

    return scaled;
  }


  private extractGeometry(shape: any, unitScale: number = 1.0): CADModelData {
    if (!this.oc) throw new Error('OpenCascade not initialized');

    console.log(`Extracting geometry with unit scale: ${unitScale}`);

    try {
      // Triangulate the shape
      const triangulation = new this.oc.BRepMesh_IncrementalMesh_2(
        shape, 
        0.1, // deflection
        false, 
        0.5, 
        true
      );
      // Perform triangulation with progress range
      triangulation.Perform(new this.oc.Message_ProgressRange_1());

      const vertices: number[] = [];
      const normals: number[] = [];
      const indices: number[] = [];
      const parts: CADPart[] = [];

      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

      // Get bounding box
      const bbox = new this.oc.Bnd_Box_1();
      this.oc.BRepBndLib.Add(shape, bbox, false);
      
      const bboxMin = bbox.CornerMin();
      const bboxMax = bbox.CornerMax();
      
      // CRITICAL: Apply unit conversion to bounding box
      minX = bboxMin.X() * unitScale;
      minY = bboxMin.Y() * unitScale;
      minZ = bboxMin.Z() * unitScale;
      maxX = bboxMax.X() * unitScale;
      maxY = bboxMax.Y() * unitScale;
      maxZ = bboxMax.Z() * unitScale;

      // Extract faces
      const faceExp = new this.oc.TopExp_Explorer_2(
        shape,
        this.oc.TopAbs_ShapeEnum.TopAbs_FACE,
        this.oc.TopAbs_ShapeEnum.TopAbs_SHAPE
      );

      let faceCount = 0;
      let edgeCount = 0;

      while (faceExp.More()) {
        const face = this.oc.TopoDS.Face_1(faceExp.Current());
        const location = new this.oc.TopLoc_Location_1();
        const triangles = this.oc.BRep_Tool.Triangulation(face, location, 0);

        if (!triangles.IsNull()) {
          const transform = location.Transformation();
          const nodeCount = triangles.get().NbNodes();
          const triCount = triangles.get().NbTriangles();

          const vertexOffset = vertices.length / 3;

          // Extract vertices with unit conversion
          for (let i = 1; i <= nodeCount; i++) {
            const node = triangles.get().Node(i);
            const transformed = node.Transformed(transform);
            // CRITICAL: Apply unit conversion to all coordinates
            vertices.push(
              transformed.X() * unitScale,
              transformed.Y() * unitScale,
              transformed.Z() * unitScale
            );
            normals.push(0, 0, 1); // Placeholder normal
          }

          // Extract triangles
          for (let i = 1; i <= triCount; i++) {
            const triangle = triangles.get().Triangle(i);
            const [i1, i2, i3] = [triangle.Value(1), triangle.Value(2), triangle.Value(3)];
            indices.push(
              vertexOffset + i1 - 1,
              vertexOffset + i2 - 1,
              vertexOffset + i3 - 1
            );
          }

          faceCount++;
        }

        faceExp.Next();
      }

      // Count edges
      const edgeExp = new this.oc.TopExp_Explorer_2(
        shape,
        this.oc.TopAbs_ShapeEnum.TopAbs_EDGE,
        this.oc.TopAbs_ShapeEnum.TopAbs_SHAPE
      );

      while (edgeExp.More()) {
        edgeCount++;
        edgeExp.Next();
      }

      // Calculate volume and surface area
      const props = new this.oc.GProp_GProps_1();
      this.oc.BRepGProp.VolumeProperties_1(shape, props, false, false, false);
      const volumeRaw = props.Mass();
      
      const surfaceProps = new this.oc.GProp_GProps_1();
      this.oc.BRepGProp.SurfaceProperties_1(shape, surfaceProps, false, false);
      const surfaceAreaRaw = surfaceProps.Mass();

      // CRITICAL: Apply unit conversion to volume and surface area
      // Volume scales with cube of linear dimension
      const volume = volumeRaw * Math.pow(unitScale, 3);
      // Surface area scales with square of linear dimension
      const surfaceArea = surfaceAreaRaw * Math.pow(unitScale, 2);

      console.log(`Volume: ${volumeRaw} (raw) → ${volume} cubic inches`);
      console.log(`Surface Area: ${surfaceAreaRaw} (raw) → ${surfaceArea} square inches`);

      // Create main part
      parts.push({
        id: 'main',
        name: 'Main Body',
        type: 'solid',
        volume,
        surfaceArea,
        boundingBox: {
          min: { x: minX, y: minY, z: minZ },
          max: { x: maxX, y: maxY, z: maxZ },
        },
      });

      // Note: Manufacturing analysis is now deferred until requested
      // This saves ~1-2s on initial parse and reduces resource usage
      console.log('Geometry extraction completed. Manufacturing analysis deferred.');

      // Cleanup
      triangulation.delete();
      faceExp.delete();
      edgeExp.delete();
      bbox.delete();
      props.delete();
      surfaceProps.delete();

      // Determine detected unit name for logging
      let detectedUnit = 'UNKNOWN';
      if (Math.abs(unitScale - 39.3701) < 0.001) detectedUnit = 'METRE';
      else if (Math.abs(unitScale - 0.0393701) < 0.0001) detectedUnit = 'MILLIMETRE';
      else if (Math.abs(unitScale - 0.393701) < 0.001) detectedUnit = 'CENTIMETRE';
      else if (Math.abs(unitScale - 1.0) < 0.001) detectedUnit = 'INCH';
      else if (Math.abs(unitScale - 12.0) < 0.001) detectedUnit = 'FOOT';

      console.log(`Geometry extracted in ${detectedUnit} (scale: ${unitScale})`);

      return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint32Array(indices),
        faces: faceCount,
        edges: edgeCount,
        vertices_count: vertices.length / 3,
        boundingBox: {
          min: { x: minX, y: minY, z: minZ },
          max: { x: maxX, y: maxY, z: maxZ },
        },
        volume,
        surfaceArea,
        parts,
        unitScale,
        detectedUnit,
      };
    } catch (error: any) {
      console.error('Error extracting geometry:', error);
      throw new Error(`Geometry extraction failed: ${error.message}`);
    }
  }


  private detectFileFormat(arrayBuffer: ArrayBuffer, declaredExtension?: string): string {
    // Convert first 1KB to text to check for magic strings/headers
    const bytes = new Uint8Array(arrayBuffer.slice(0, 1024));
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    
    // STEP files start with ISO-10303-21 header
    if (text.includes('ISO-10303-21') || text.includes('HEADER;')) {
      return 'step';
    }
    
    // Check if declared extension is STEP
    if (declaredExtension === 'step' || declaredExtension === 'stp') {
      return 'step';
    }
    
    // If not detected as STEP, return unknown
    console.warn(`File does not appear to be a STEP file. First 100 chars: ${text.substring(0, 100)}`);
    return 'unknown';
  }

  async parseFile(file: File): Promise<CADModelData> {
    await this.initialize();

    const declaredExtension = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    // Validate file has content
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File is empty');
    }

    // Detect actual format from content
    const detectedFormat = this.detectFileFormat(arrayBuffer, declaredExtension);
    
    let modelData: CADModelData;
    
    // Log first few bytes for debugging
    const preview = new Uint8Array(arrayBuffer.slice(0, 100));
    const previewText = new TextDecoder('utf-8', { fatal: false }).decode(preview);

    // Only support STEP files
    if (detectedFormat === 'step' || detectedFormat === 'stp') {
      modelData = await this.parseSTEP(arrayBuffer);
    } else {
      throw new Error(`Unsupported file format. Only STEP (.step, .stp) files are supported. Declared: ${declaredExtension}, Detected: ${detectedFormat}.`);
    }

    // Store file content for on-demand manufacturing analysis
    modelData._internalShapeData = {
      fileContent: arrayBuffer,
      fileType: detectedFormat,
    };

    return modelData;
  }

  /**
   * Run manufacturing analysis on a previously parsed model (on-demand)
   * This avoids running expensive analysis during initial parse
   */
  async analyzeManufacturing(
    modelData: CADModelData,
    materialGrade: string = 'A36'
  ): Promise<CADModelData> {
    await this.initialize();

    if (!modelData._internalShapeData) {
      console.warn('Cannot run manufacturing analysis: no internal shape data available');
      return modelData;
    }

    // Check if already analyzed
    if (modelData.holeAnalysis !== undefined) {
      console.log('Manufacturing analysis already complete');
      return modelData;
    }

    console.log('Running on-demand manufacturing analysis...');

    try {
      const { fileContent, fileType } = modelData._internalShapeData;

      // Re-parse to get shape object for analysis
      // Only STEP files support detailed manufacturing analysis
      if (fileType === 'step' || fileType === 'stp') {
        const filename = 'model_analysis.step';
        const fileData = new Uint8Array(fileContent);
        this.oc.FS.writeFile(filename, fileData);

        const reader = new this.oc.STEPControl_Reader_1();
        const status = reader.ReadFile(filename);

        if (status === this.oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
          reader.TransferRoots(new this.oc.Message_ProgressRange_1());
          const shape = reader.OneShape();

          if (!shape.IsNull()) {
            const manufacturingAnalyzer = new ManufacturingAnalyzer(this.oc);
            const manufacturingResults = manufacturingAnalyzer.analyzeManufacturing(
              shape,
              materialGrade
            );

            // Add manufacturing data to model
            modelData.boundingBoxWithTolerance = manufacturingResults.boundingBoxWithTolerance;
            modelData.holeAnalysis = manufacturingResults.holeAnalysis;
            modelData.thicknessAnalysis = manufacturingResults.thicknessAnalysis;
            modelData.edgeAnalysis = manufacturingResults.edgeAnalysis;
            modelData.weldJointAnalysis = manufacturingResults.weldJointAnalysis;
            modelData.bendAnalysis = manufacturingResults.bendAnalysis;

            console.log('Manufacturing analysis completed:', {
              holes: manufacturingResults.holeAnalysis.count,
              edges: manufacturingResults.edgeAnalysis.totalEdges,
              thickness: manufacturingResults.thicknessAnalysis.estimatedThickness,
            });

            // Cleanup
            shape.delete();
            reader.delete();
            this.oc.FS.unlink(filename);
          }
        }
      } else {
        console.warn(`Manufacturing analysis not supported for ${fileType} format. Use STEP files for full analysis.`);
      }
    } catch (error: any) {
      console.error('Manufacturing analysis failed:', error);
      // Don't throw - return model with whatever data we have
    }

    return modelData;
  }

  dispose(): void {
    this.oc = null;
    this.initialized = false;
  }
}

// Singleton instance
let parserInstance: CADParser | null = null;

export function getCADParser(): CADParser {
  // Ensure we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('CAD parser can only be used in browser environment');
  }
  
  if (!parserInstance) {
    parserInstance = new CADParser();
  }
  return parserInstance;
}

