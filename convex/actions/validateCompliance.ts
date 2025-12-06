/**
 * Compliance Validation Action
 * 
 * Wraps the validation query with caching logic
 * Actions can use Node.js APIs like crypto
 */

"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { createHash } from "crypto";

// Type for validation results
interface ComplianceResults {
  overallScore: number;
  status: string;
  violations: any[];
  warnings: any[];
  passes: any[];
  summary: {
    criticalCount: number;
    totalViolations: number;
    totalWarnings: number;
    checksPerformed: number;
  };
}

export const validateWithCache = action({
  args: {
    geometry: v.any(),
    specifications: v.any(),
  },
  handler: async (ctx, args): Promise<ComplianceResults> => {
    // Create hash of geometry + specs for caching
    const geometryHash = createHash("sha256")
      .update(JSON.stringify({ geometry: args.geometry, specs: args.specifications }))
      .digest("hex");

    // Check cache (if Redis is available)
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      const cachedResults = await redis.get(`compliance:${geometryHash}`);
      if (cachedResults) {
        console.log("✅ Cache HIT for compliance validation");
        return JSON.parse(cachedResults as string);
      }
      console.log("❌ Cache MISS - Running validation");
    } catch (error) {
      console.log("Redis not available, proceeding without cache");
    }

    // Run validation query
    const results: ComplianceResults = await ctx.runQuery(api.validators.standards.validateCompliance, {
      geometry: args.geometry,
      specifications: args.specifications,
    });

    // Cache for 2 hours (if Redis is available)
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      await redis.setex(
        `compliance:${geometryHash}`,
        7200, // 2 hours TTL
        JSON.stringify(results)
      );
    } catch (error) {
      console.log("Redis not available, skipping cache");
    }

    return results;
  },
});

