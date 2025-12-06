# Battle-Tested Rebuild Strategy for 24-Hour Hackathon

## 🎯 Strategic Approach Overview

**Core Philosophy:** Leverage your existing architecture knowledge + modern tooling to rebuild faster and better.

**Time Allocation (24 hours):**
- **Hours 0-2:** Environment setup + Core infrastructure
- **Hours 2-8:** CAD generation pipeline + STEP parsing
- **Hours 8-14:** Compliance validation + AI analysis
- **Hours 14-20:** UI/UX + 3D visualization
- **Hours 20-23:** Chatbot + Polish
- **Hour 23-24:** Testing + Deployment

---

## 🏗️ Modern Tech Stack Mapping

### Your New Stack vs. Original

| Component | Original | New Stack | Rationale |
|-----------|----------|-----------|-----------|
| **Framework** | Next.js 15 | **Next.js 15 App Router** | Stick with what works, use Server Actions |
| **Backend** | API Routes | **Convex** | Real-time sync, built-in auth, zero backend code |
| **AI Integration** | Gemini | **Claude API (via Anthropic SDK)** | Better reasoning, MCP support, your expertise |
| **CAD Generation** | Zoo Dev | **Zoo Dev** (keep) | Already validated, no time to rebuild |
| **STEP Parsing** | OpenCascade.js | **OpenCascade.js** (keep) | No better alternative |
| **3D Rendering** | Three.js | **React Three Fiber (R3F)** | Declarative, faster dev, better React integration |
| **Storage** | Local files | **Convex File Storage** | Seamless integration, CDN-backed |
| **Chatbot** | Scripted JSON | **Claude + MCP Context** | Real conversational AI, context-aware |
| **Code Review** | Manual | **CodeRabbit** | Automated PR reviews, catch issues fast |
| **Data Scraping** | N/A | **Apify** (if needed) | Standards docs, material databases |

---

## 📦 Phase-by-Phase Implementation Plan

### **PHASE 1: Foundation (Hours 0-2)**

#### 1.1 Project Initialization (30 min)
```bash
# Use Cursor's built-in templates
npx create-next-app@latest metalink-v2 --typescript --tailwind --app
cd metalink-v2

# Install core dependencies
npm install convex @anthropic-ai/sdk opencascade.js @react-three/fiber @react-three/drei three dxf-parser
npm install -D @coderabbit-ai/cli
```

#### 1.2 Convex Setup (30 min)
```bash
npx convex dev
```

**Define Convex Schema (`convex/schema.ts`):**
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cadGenerations: defineTable({
    userId: v.optional(v.string()),
    description: v.string(),
    specifications: v.object({
      dimensions: v.object({
        length: v.number(),
        width: v.number(),
        height: v.number(),
        thickness: v.number(),
      }),
      material: v.object({
        grade: v.string(),
        edgeType: v.string(),
      }),
    }),
    stepFileId: v.optional(v.id("_storage")), // Convex file storage
    complianceScore: v.optional(v.number()),
    status: v.string(), // "generating" | "completed" | "failed"
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  complianceReports: defineTable({
    generationId: v.id("cadGenerations"),
    overallScore: v.number(),
    violations: v.array(v.any()),
    warnings: v.array(v.any()),
    aiAnalysis: v.string(),
    reportPdfId: v.optional(v.id("_storage")),
  }).index("by_generation", ["generationId"]),

  chatSessions: defineTable({
    userId: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    })),
    contextDocuments: v.array(v.string()), // MCP context IDs
  }).index("by_user", ["userId"]),
});
```

#### 1.3 Environment Variables (15 min)
```bash
# .env.local
CONVEX_DEPLOYMENT=<your-deployment>
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>

# Zoo Dev API
ZOO_DEV_API_KEY=<your-key>
ZOO_DEV_API_URL=https://api.zoo.dev/v1

# Anthropic Claude
ANTHROPIC_API_KEY=<your-key>

# (Optional) Apify for standards scraping
APIFY_TOKEN=<your-token>
```

#### 1.4 CodeRabbit Integration (15 min)
```yaml
# .coderabbit.yaml
language: "en-US"
early_access: true
reviews:
  profile: "assertive"
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false
  auto_review:
    enabled: true
    drafts: false
  path_filters:
    - "!**/*.lock"
    - "!**/dist/**"
  
chat:
  auto_reply: true

tone_instructions: "Focus on: 1) Type safety violations, 2) Performance issues in 3D rendering, 3) Standards compliance logic errors, 4) API error handling"
```

---

### **PHASE 2: CAD Generation Pipeline (Hours 2-8)**

#### 2.1 Zoo Dev Integration (90 min)

**Convex Action (`convex/actions/generateCAD.ts`):**
```typescript
"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";

export const generateFromDescription = action({
  args: {
    description: v.string(),
    specifications: v.any(),
  },
  handler: async (ctx, args) => {
    // Step 1: Claude optimizes the prompt for Zoo Dev
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const optimizedPrompt = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are a CAD prompt engineer specializing in steel components.
        
User description: "${args.description}"
Material: ${args.specifications.material.grade}
Dimensions: ${JSON.stringify(args.specifications.dimensions)}

Generate an optimized prompt for Zoo Dev API that:
1. Uses precise geometric language (extrude, revolve, fillet)
2. Includes exact dimensions with units
3. Specifies hole patterns clearly
4. Mentions material grade for context
5. Requests STEP format output

Return ONLY the optimized prompt, nothing else.`
      }]
    });

    const zooPrompt = optimizedPrompt.content[0].text;

    // Step 2: Call Zoo Dev API
    const zooResponse = await fetch("https://api.zoo.dev/cad/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ZOO_DEV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: zooPrompt,
        format: "step", // Request STEP file
        units: "inches",
      }),
    });

    if (!zooResponse.ok) {
      throw new Error(`Zoo Dev failed: ${await zooResponse.text()}`);
    }

    const stepFileBlob = await zooResponse.blob();

    // Step 3: Store in Convex file storage
    const stepFileId = await ctx.storage.store(stepFileBlob);

    // Step 4: Create database record
    const generationId = await ctx.runMutation(
      api.mutations.createGeneration,
      {
        description: args.description,
        specifications: args.specifications,
        stepFileId,
        status: "completed",
      }
    );

    return { generationId, stepFileId };
  },
});
```

#### 2.2 STEP File Parsing (2 hours)

**Convex Action (`convex/actions/parseSTEP.ts`):**
```typescript
"use node";
import { action } from "../_generated/server";
import initOpenCascade from "opencascade.js";

export const extractGeometry = action({
  args: { stepFileId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Load STEP file from Convex storage
    const stepBlob = await ctx.storage.get(args.stepFileId);
    const stepBuffer = await stepBlob.arrayBuffer();

    // Initialize OpenCascade WASM
    const oc = await initOpenCascade();

    // Read STEP file
    const reader = new oc.STEPControl_Reader_1();
    const readStatus = reader.ReadStream(
      new oc.Standard_IStream(new Uint8Array(stepBuffer))
    );

    if (readStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
      throw new Error("Failed to read STEP file");
    }

    reader.TransferRoots(new oc.Message_ProgressRange_1());
    const shape = reader.OneShape();

    // Extract geometry data
    const props = new oc.GProp_GProps_1();
    oc.BRepGProp.VolumeProperties_2(shape, props, false, false, false);
    
    const volume = props.Mass();
    const centerOfMass = props.CentreOfMass();

    // Bounding box
    const bbox = new oc.Bnd_Box_1();
    oc.BRepBndLib.Add(shape, bbox, false);
    const [xMin, yMin, zMin, xMax, yMax, zMax] = [
      bbox.CornerMin().X(), bbox.CornerMin().Y(), bbox.CornerMin().Z(),
      bbox.CornerMax().X(), bbox.CornerMax().Y(), bbox.CornerMax().Z(),
    ];

    // Detect holes (cylindrical faces)
    const holes = [];
    const faceExplorer = new oc.TopExp_Explorer_2(
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

    return {
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
  },
});
```

#### 2.3 Template System (90 min)

**Create hardcoded templates in Convex:**
```typescript
// convex/templates.ts
export const TEMPLATES = {
  "l-bracket": {
    id: "l-bracket",
    name: "L-Bracket",
    description: "Standard 90° angle bracket",
    defaultParams: {
      height: 6,
      width: 4,
      thickness: 0.25,
      holeCount: 4,
      holeDiameter: 0.5,
      material: "A36",
      edgeType: "rolled",
    },
    zooPrompt: (params) => 
      `Create an L-shaped steel bracket with:
- Vertical leg: ${params.height} inches tall
- Horizontal leg: ${params.width} inches wide  
- Thickness: ${params.thickness} inches throughout
- ${params.holeCount} holes, ${params.holeDiameter}" diameter
- Material: ASTM ${params.material} steel
- Generate in STEP format with precise dimensions`,
  },
  // Add more templates...
};
```

---

### **PHASE 3: Compliance Validation (Hours 8-14)**

#### 3.1 Rule-Based Validation Engine (2 hours)

**Convex Query (`convex/validators/standards.ts`):**
```typescript
import { v } from "convex/values";
import { query } from "../_generated/server";

// AISC 360 Rules
const AISC_EDGE_DISTANCE = {
  rolled: (holeDia: number) => holeDia * 1.25,
  sheared: (holeDia: number) => holeDia * 1.75,
};

const AISC_HOLE_SPACING = {
  minimum: (holeDia: number) => holeDia * 2.67,
  preferred: (holeDia: number) => holeDia * 3.0,
};

const AISC_WELD_SIZES = [
  { maxThickness: 0.25, minWeld: 0.125, maxWeld: 0.1875 },
  { maxThickness: 0.5, minWeld: 0.1875, maxWeld: 0.4375 },
  { maxThickness: 0.75, minWeld: 0.25, maxWeld: 0.6875 },
  { maxThickness: Infinity, minWeld: 0.3125, maxWeld: Infinity },
];

export const validateCompliance = query({
  args: {
    geometry: v.any(),
    specifications: v.any(),
  },
  handler: async (ctx, args) => {
    const violations = [];
    const warnings = [];
    const passes = [];

    const { holes, dimensions, edgeDistances } = args.geometry;
    const { material, edgeType } = args.specifications;

    // Check 1: AISC Edge Distance (Table J3.4)
    const requiredEdgeDist = AISC_EDGE_DISTANCE[edgeType];
    
    edgeDistances.forEach((edge, idx) => {
      const minDist = Math.min(
        edge.distanceToMinX,
        edge.distanceToMaxX,
        edge.distanceToMinY,
        edge.distanceToMaxY
      );
      
      const required = requiredEdgeDist(holes[idx].diameter);
      
      if (minDist < required) {
        violations.push({
          code: "AISC_360_J3.4",
          severity: "CRITICAL",
          standard: "AISC 360 Table J3.4 - Edge Distance",
          message: `Hole ${idx + 1} edge distance (${minDist.toFixed(3)}") < required ${required.toFixed(3)}"`,
          location: holes[idx].center,
          recommendation: `Increase edge distance by ${(required - minDist).toFixed(3)}" or reduce hole diameter`,
        });
      } else {
        passes.push({
          code: "AISC_360_J3.4",
          message: `Hole ${idx + 1} edge distance: ${minDist.toFixed(3)}" ✓`,
        });
      }
    });

    // Check 2: Hole Spacing (Section J3.3)
    for (let i = 0; i < holes.length; i++) {
      for (let j = i + 1; j < holes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(holes[i].center.x - holes[j].center.x, 2) +
          Math.pow(holes[i].center.y - holes[j].center.y, 2)
        );
        
        const avgDia = (holes[i].diameter + holes[j].diameter) / 2;
        const minSpacing = AISC_HOLE_SPACING.minimum(avgDia);
        const prefSpacing = AISC_HOLE_SPACING.preferred(avgDia);

        if (dist < minSpacing) {
          violations.push({
            code: "AISC_360_J3.3",
            severity: "CRITICAL",
            message: `Holes ${i+1} and ${j+1} spacing (${dist.toFixed(3)}") < minimum ${minSpacing.toFixed(3)}"`,
            recommendation: `Increase spacing by ${(minSpacing - dist).toFixed(3)}"`,
          });
        } else if (dist < prefSpacing) {
          warnings.push({
            code: "AISC_360_J3.3",
            severity: "MEDIUM",
            message: `Holes ${i+1} and ${j+1} spacing below preferred (${prefSpacing.toFixed(3)}")`,
          });
        }
      }
    }

    // Check 3: Weld Sizing (Table J2.4)
    const thickness = dimensions.thickness;
    const weldRule = AISC_WELD_SIZES.find(r => thickness <= r.maxThickness);
    
    if (thickness > 0.25) {
      passes.push({
        code: "AISC_360_J2.4",
        message: `Recommended weld: ${weldRule.minWeld}" min, ${weldRule.maxWeld}" max`,
      });
    }

    // Check 4: AWS D1.1 Preheat (Table 3.2)
    const requiresPreheat = thickness > 1.0;
    if (requiresPreheat) {
      warnings.push({
        code: "AWS_D1.1_3.2",
        severity: "HIGH",
        message: `Thickness ${thickness}" may require preheat (see AWS D1.1 Table 3.2)`,
        recommendation: "Consult WPS for preheat temperature based on material grade and ambient conditions",
      });
    }

    // Calculate score
    const criticalCount = violations.filter(v => v.severity === "CRITICAL").length;
    const score = Math.max(0, 100 - (criticalCount * 20) - (warnings.length * 5));

    let status = "FULLY_COMPLIANT";
    if (criticalCount > 0) status = "NON_COMPLIANT";
    else if (score < 90) status = "ACCEPTABLE_WITH_NOTES";

    return {
      overallScore: score,
      status,
      violations,
      warnings,
      passes,
      summary: {
        criticalCount,
        totalViolations: violations.length,
        totalWarnings: warnings.length,
        checksPerformed: passes.length + violations.length + warnings.length,
      },
    };
  },
});
```

#### 3.2 Claude AI Analysis (90 min)

**Convex Action (`convex/actions/aiAnalysis.ts`):**
```typescript
"use node";
import { action } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";

export const generateManufacturingInsights = action({
  args: {
    geometry: v.any(),
    complianceResults: v.any(),
    specifications: v.any(),
  },
  handler: async (ctx, args) => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are a steel manufacturing expert. Analyze this component:

**Geometry:**
${JSON.stringify(args.geometry, null, 2)}

**Compliance Results:**
- Score: ${args.complianceResults.overallScore}/100
- Violations: ${args.complianceResults.violations.length}
- Warnings: ${args.complianceResults.warnings.length}

**Specifications:**
- Material: ${args.specifications.material.grade}
- Edge Type: ${args.specifications.material.edgeType}

Provide:
1. **Fabrication Sequence:** Step-by-step manufacturing process
2. **Cost Optimization:** Ways to reduce material waste and labor time
3. **Design Improvements:** Suggestions to enhance manufacturability
4. **Risk Assessment:** Potential issues and mitigation strategies
5. **Complexity Score:** 0-100 rating with time estimate

Format as markdown with clear sections.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].text;
  },
});
```

---

### **PHASE 4: UI/UX (Hours 14-20)**

#### 4.1 React Three Fiber 3D Viewer (2 hours)

**Component (`components/CADViewer.tsx`):**
```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

function Model({ stepFileUrl }: { stepFileUrl: string }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    // Convert STEP to STL on server, then load
    fetch(`/api/convert-to-stl?stepFileUrl=${encodeURIComponent(stepFileUrl)}`)
      .then(res => res.blob())
      .then(blob => {
        const loader = new STLLoader();
        loader.load(URL.createObjectURL(blob), (geo) => {
          geo.center();
          setGeometry(geo);
        });
      });
  }, [stepFileUrl]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#64748b"
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

export default function CADViewer({ stepFileId }: { stepFileId: string }) {
  const stepFileUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${stepFileId}`;

  return (
    <div className="w-full h-[600px] rounded-2xl border-2 border-gray-200 overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[50, 50, 50]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={20}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, 5, -5]} intensity={0.3} color="#3b82f6" />
        
        {/* Ground plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>

        {/* Model */}
        <Suspense fallback={null}>
          <Model stepFileUrl={stepFileUrl} />
        </Suspense>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
```

#### 4.2 Main Generation Page (2 hours)

**Page (`app/generate/page.tsx`):**
```tsx
"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CADViewer from "@/components/CADViewer";
import ComplianceReport from "@/components/ComplianceReport";

export default function GeneratePage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generationId, setGenerationId] = useState<Id<"cadGenerations"> | null>(null);

  const generateCAD = useMutation(api.actions.generateCAD.generateFromDescription);
  const generation = useQuery(api.queries.getGeneration, 
    generationId ? { id: generationId } : "skip"
  );

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateCAD({
        description,
        specifications: {
          dimensions: { length: 6, width: 4, height: 0.25, thickness: 0.25 },
          material: { grade: "A36", edgeType: "rolled" },
        },
      });
      setGenerationId(result.generationId);
    } catch (error) {
      console.error(error);
      alert("Generation failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Generate CAD Drawing</h1>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <label className="block text-lg font-semibold mb-4">
          Describe your component:
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-32 p-4 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="e.g., L-bracket, 6 inches tall, 4 inches wide, 1/4 inch thick, four 1/2 inch holes"
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !description}
          className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate CAD"}
        </button>
      </div>

      {/* Results */}
      {generation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Viewer */}
          <div>
            <h2 className="text-2xl font-bold mb-4">3D Preview</h2>
            <CADViewer stepFileId={generation.stepFileId} />
          </div>

          {/* Compliance Report */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Compliance Analysis</h2>
            <ComplianceReport generationId={generation._id} />
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 4.3 Compliance Report Component (90 min)

**Component (`components/ComplianceReport.tsx`):**
```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ComplianceReport({ generationId }) {
  const report = useQuery(api.queries.getComplianceReport, { generationId });

  if (!report) return <div>Loading report...</div>;

  const scoreColor = 
    report.overallScore >= 90 ? "text-green-600" :
    report.overallScore >= 70 ? "text-blue-600" :
    report.overallScore >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Score Badge */}
      <div className="text-center mb-8">
        <div className={`text-6xl font-bold ${scoreColor}`}>
          {report.overallScore}
        </div>
        <div className="text-gray-600 mt-2">{report.status.replace(/_/g, " ")}</div>
      </div>

      {/* Violations */}
      {report.violations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-red-600 mb-4">
            Critical Issues ({report.violations.length})
          </h3>
          {report.violations.map((v, i) => (
            <div key={i} className="bg-red-50 border-l-4 border-red-600 p-4 mb-3">
              <div className="font-semibold">{v.code}: {v.message}</div>
              <div className="text-sm text-gray-600 mt-1">{v.standard}</div>
              <div className="text-sm text-blue-600 mt-2">
                💡 {v.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-yellow-600 mb-4">
            Warnings ({report.warnings.length})
          </h3>
          {report.warnings.map((w, i) => (
            <div key={i} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-3">
              <div className="font-semibold">{w.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Passes */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-green-600 mb-4">
          Passing Checks ({report.passes.length})
        </h3>
        <div className="space-y-2">
          {report.passes.map((p, i) => (
            <div key={i} className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              {p.message}
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      {report.aiAnalysis && (
        <div className="mt-8 prose prose-sm max-w-none">
          <h3 className="text-xl font-bold mb-4">Manufacturing Insights</h3>
          <div dangerouslySetInnerHTML={{ __html: marked(report.aiAnalysis) }} />
        </div>
      )}
    </div>
  );
}
```

---

### **PHASE 5: Intelligent Chatbot (Hours 20-23)**

#### 5.1 MCP Context Setup (45 min)

**Create MCP Server for Standards Docs:**
```typescript
// mcp-server/standards.ts
import { McpServer } from "@modelcontextprotocol/sdk";

const server = new McpServer({
  name: "metalink-standards",
  version: "1.0.0",
});

// Define resources (standards documents)
server.resource({
  uri: "standards://aisc-360-edge-distance",
  name: "AISC 360 - Edge Distance Requirements",
  mimeType: "text/markdown",
  async read() {
    return `# AISC 360 Table J3.4: Edge Distance Requirements

## Minimum Edge Distance (inches)

| Edge Condition | Minimum Distance |
|----------------|------------------|
| Rolled edges   | 1.25 × hole diameter |
| Sheared/gas-cut edges | 1.75 × hole diameter |

## Example Calculations:
- 1/2" hole, rolled edge: 1.25 × 0.5 = 0.625" minimum
- 3/4" hole, sheared edge: 1.75 × 0.75 = 1.3125" minimum

## References:
- AISC 360-16 Section J3.4
- AISC Manual Table J3.4
`;
  },
});

server.resource({
  uri: "standards://aws-d1.1-preheat",
  name: "AWS D1.1 - Preheat Requirements",
  // ... more standards content
});

server.start();
```

**Register in Convex:**
```typescript
// convex/mcp/config.ts
export const MCP_STANDARDS = [
  "standards://aisc-360-edge-distance",
  "standards://aisc-360-hole-spacing",
  "standards://aws-d1.1-preheat",
  "standards://astm-a36-properties",
  // ... all standards
];
```

#### 5.2 Claude-Powered Chatbot (2 hours)

**Convex Action (`convex/actions/chat.ts`):**
```typescript
"use node";
import { action } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";
import { MCP_STANDARDS } from "../mcp/config";

export const sendMessage = action({
  args: {
    userId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Get chat history
    const session = await ctx.runQuery(api.queries.getChatSession, {
      userId: args.userId,
    });

    const previousMessages = session?.messages || [];

    // System prompt with MCP context
    const systemPrompt = `You are SteelBot, an expert assistant for Metalink CAD Generator.

You have access to these steel manufacturing standards:
${MCP_STANDARDS.map(uri => `- ${uri}`).join("\n")}

Your role:
1. Help users generate CAD drawings from descriptions
2. Explain compliance requirements (AISC 360, AWS D1.1, ASTM)
3. Guide users through the generation process
4. Troubleshoot issues
5. Suggest design improvements

Be conversational, helpful, and technically accurate. Use emojis sparingly.`;

    // Build message history
    const messages = [
      ...previousMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: args.message,
      },
    ];

    // Call Claude with MCP context
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      // Enable MCP (if SDK supports it)
      tools: [
        {
          name: "get_standard",
          description: "Retrieve specific steel manufacturing standard details",
          input_schema: {
            type: "object",
            properties: {
              standard_uri: {
                type: "string",
                enum: MCP_STANDARDS,
              },
            },
            required: ["standard_uri"],
          },
        },
      ],
    });

    const assistantMessage = response.content[0].text;

    // Save to conversation history
    await ctx.runMutation(api.mutations.appendChatMessage, {
      userId: args.userId,
      messages: [
        { role: "user", content: args.message, timestamp: Date.now() },
        { role: "assistant", content: assistantMessage, timestamp: Date.now() },
      ],
    });

    return { message: assistantMessage };
  },
});
```

**React Component (`components/Chatbot.tsx`):**
```tsx
"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs"; // Or your auth system

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { user } = useUser();

  const sendMessage = useMutation(api.actions.chat.sendMessage);
  const session = useQuery(api.queries.getChatSession, {
    userId: user?.id || "anonymous",
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage({
      userId: user?.id || "anonymous",
      message: input,
    });
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform z-50"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl mr-3">
              🤖
            </div>
            <div>
              <div className="font-bold">SteelBot Assistant</div>
              <div className="text-xs opacity-90">Online</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {session?.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

### **PHASE 6: Testing & Deployment (Hours 23-24)**

#### 6.1 CodeRabbit Automated Testing (15 min)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial Metalink v2 implementation"
git remote add origin <your-repo>
git push -u origin main

# CodeRabbit will auto-review your PR
# Address critical issues flagged
```

#### 6.2 Convex Deployment (15 min)

```bash
# Deploy backend
npx convex deploy

# Deploy Next.js to Vercel
vercel --prod
```

#### 6.3 Final Testing Checklist (30 min)

- [ ] Generate CAD from description (test 3 variations)
- [ ] Verify STEP file parsing extracts holes/dimensions
- [ ] Check compliance validation shows violations
- [ ] Confirm AI analysis returns meaningful insights
- [ ] Test 3D viewer loads and rotates smoothly
- [ ] Verify chatbot responds with context-aware answers
- [ ] Download DXF/STEP files and open in FreeCAD
- [ ] Test mobile responsiveness
- [ ] Check error handling (invalid input, API failures)
- [ ] Verify Zoo Dev API credits remaining

---

## 🚀 Hackathon-Specific Optimizations

### Time-Saving Strategies

**1. Reuse Your Existing Logic:**
- Copy-paste your validation rules directly
- Use your proven Zoo Dev prompt engineering
- Keep your color scheme and design tokens

**2. Let Cursor AI Handle Boilerplate:**
```
// Example Cursor prompt:
"Generate a Convex mutation to store CAD generation results with fields: description, stepFileId, complianceScore, status, createdAt"
```

**3. Use Pre-built Components:**
```bash
npm install @shadcn/ui
npx shadcn-ui@latest add button card input textarea
```

**4. Mock Data for Testing:**
```typescript
// Create sample STEP file data
const MOCK_GEOMETRY = {
  dimensions: { width: 6, height: 4, thickness: 0.25 },
  holes: [{ center: {x: 1, y: 1}, diameter: 0.5 }],
  // ...
};
```

### Fallback Plans

**If Zoo Dev API Fails:**
- Switch to hardcoded sample STEP files
- Generate simple geometries with Three.js primitives
- Focus on compliance validation demo

**If OpenCascade.js is Too Slow:**
- Pre-compute geometry analysis server-side
- Cache results in Convex
- Use Web Workers for parsing

**If Claude API Limits Hit:**
- Prepare pre-generated AI analysis responses
- Fall back to template-based insights
- Show "Analyzing..." placeholder

---

## 📊 Success Metrics for Judges

**Live Demo Script (5 minutes):**
1. **Input:** "Create an L-bracket, 6 inches tall, 4 inches wide, quarter-inch thick, with four half-inch holes"
2. **Show:** Real-time CAD generation (<5 sec)
3. **Highlight:** 3D model renders with metallic material
4. **Point Out:** Red violation markers on edge distances
5. **Read:** AI-generated fabrication sequence
6. **Ask Chatbot:** "Why does AISC require 1.75x edge distance for sheared edges?"
7. **Download:** STEP file and open in FreeCAD on screen

**Key Talking Points:**
- "70% time savings vs. manual CAD"
- "Automatic compliance with 3 industry standards"
- "No CAD skills required – just plain English"
- "Real-time validation prevents costly mistakes"
- "Seamless procurement integration" (if time permits demo)

---

## 🛡️ Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Zoo Dev API quota exceeded | Medium | Create backup account, cache results |
| OpenCascade.js crashes | Low | Wrap in try-catch, show graceful error |
| Slow 3D rendering | Medium | Optimize geometry, reduce poly count |
| Claude API rate limit | Low | Pre-generate analysis for demos |
| Deployment issues | Low | Test Vercel/Convex 2 hours before deadline |

---

## 🎓 Learning from V1 Mistakes

**What Worked:**
- Zoo Dev API reliability
- OpenCascade.js geometry extraction
- Three.js visualization
- AISC/AWS standards validation logic

**What to Improve:**
- **Replace DXF parser:** Only use STEP (OpenCascade.js)
- **Add real chatbot:** Not scripted menus
- **Better error handling:** Show user-friendly messages
- **Responsive design:** Test on mobile early
- **State management:** Use Convex for real-time sync

**New Additions:**
- **Convex:** Eliminates backend complexity
- **React Three Fiber:** Cleaner 3D code
- **CodeRabbit:** Catches bugs automatically
- **MCP Context:** Makes chatbot actually useful

---

## 📝 Final Pre-Hackathon Checklist

**24 Hours Before:**
- [ ] Verify all API keys work (Zoo Dev, Claude, Convex)
- [ ] Clone starter templates (Next.js, Convex)
- [ ] Download OpenCascade.js WASM files
- [ ] Test Zoo Dev API with sample prompts
- [ ] Prepare demo STEP files as backup
- [ ] Set up GitHub repo with CodeRabbit
- [ ] Charge laptop, bring backup power bank

**During Hackathon:**
- [ ] Commit every hour to GitHub
- [ ] Review CodeRabbit suggestions every 2 hours
- [ ] Test in production environment every 4 hours
- [ ] Take 5-minute breaks every hour (avoid burnout)
- [ ] Start demo prep at Hour 22 (not Hour 24!)

**Presentation Prep:**
- [ ] Record 30-second demo video (backup if live fails)
- [ ] Prepare 3 demo scenarios (simple/medium/complex)
- [ ] Write judge Q&A answers (cost, scalability, accuracy)
- [ ] Design 1-slide architecture diagram
- [ ] Practice 5-minute pitch (time yourself!)

---

## 🏆 Winning Strategy

**Why This Will Win:**
1. **Solves Real Problem:** $2.3B productivity loss in steel industry
2. **Technical Sophistication:** AI + CAD + Standards validation
3. **Polished UX:** Professional UI, not hackathon wireframes
4. **Live Demo:** Actually works (not just slides)
5. **Business Viability:** Clear monetization, enterprise demand
6. **Scalability:** Convex handles growth, APIs are composable

**Judge Appeal:**
- **Technical Judges:** OpenCascade.js WASM, MCP context, real-time 3D
- **Business Judges:** Market size, pricing strategy, B2B potential
- **Design Judges:** Cohesive UI, smooth animations, accessibility

**Differentiation:**
- Not another "ChatGPT wrapper"
- Industry-specific (steel manufacturing)
- Compliance validation (unique moat)
- Actually generates CAD files (not just mockups)

---

Good luck! You've got the architecture knowledge, the right tools, and a proven concept. Focus on execution, trust your debugging skills, and remember: **working beats perfect**. Ship the core workflow first, polish later. 🚀
