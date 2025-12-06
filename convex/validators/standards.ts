import { v } from "convex/values";
import { query } from "../_generated/server";

// AISC 360 Rules
const AISC_EDGE_DISTANCE = {
  rolled: (holeDia: number) => holeDia * 1.25,
  sheared: (holeDia: number) => holeDia * 1.75,
} as const;

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
    const violations: any[] = [];
    const warnings: any[] = [];
    const passes: any[] = [];

    const { holes, dimensions, edgeDistances } = args.geometry;
    const { material, edgeType } = args.specifications;

    // Check 1: AISC Edge Distance (Table J3.4)
    const requiredEdgeDist = AISC_EDGE_DISTANCE[edgeType as keyof typeof AISC_EDGE_DISTANCE];
    
    if (requiredEdgeDist && holes && edgeDistances) {
      edgeDistances.forEach((edge: any, idx: number) => {
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
    }

    // Check 2: Hole Spacing (Section J3.3)
    if (holes) {
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
    }

    // Check 3: Weld Sizing (Table J2.4)
    const thickness = dimensions?.thickness;
    if (thickness) {
      const weldRule = AISC_WELD_SIZES.find(r => thickness <= r.maxThickness);
      
      if (weldRule && thickness > 0.25) {
        passes.push({
          code: "AISC_360_J2.4",
          message: `Recommended weld: ${weldRule.minWeld}" min, ${weldRule.maxWeld}" max`,
        });
      }
    }

    // Check 4: AWS D1.1 Preheat (Table 3.2)
    if (thickness) {
      const requiresPreheat = thickness > 1.0;
      if (requiresPreheat) {
        warnings.push({
          code: "AWS_D1.1_3.2",
          severity: "HIGH",
          message: `Thickness ${thickness}" may require preheat (see AWS D1.1 Table 3.2)`,
          recommendation: "Consult WPS for preheat temperature based on material grade and ambient conditions",
        });
      }
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

