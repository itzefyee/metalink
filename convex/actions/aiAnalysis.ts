"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";

const geometryValidator = v.object({
  dimensions: v.object({
    width: v.number(),
    height: v.number(),
    length: v.number(),
    volume: v.number(),
    thickness: v.number(),
    bounds: v.object({
      min: v.object({
        xMin: v.number(),
        yMin: v.number(),
        zMin: v.number(),
      }),
      max: v.object({
        xMax: v.number(),
        yMax: v.number(),
        zMax: v.number(),
      }),
    }),
  }),
  holes: v.array(v.any()),
  edgeDistances: v.array(v.any()),
  centerOfMass: v.object({
    x: v.number(),
    y: v.number(),
    z: v.number(),
  }),
});

const complianceResultsValidator = v.object({
  overallScore: v.number(),
  violations: v.array(v.any()),
  warnings: v.array(v.any()),
});

const specificationsValidator = v.object({
  material: v.object({
    grade: v.string(),
    edgeType: v.string(),
  }),
});

export const generateManufacturingInsights = action({
  args: {
    geometry: geometryValidator,
    complianceResults: complianceResultsValidator,
    specifications: specificationsValidator,
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId || "anonymous";
    
    // Create content hash for caching
    const { createHash } = await import("crypto");
    const contentHash = createHash("sha256")
      .update(JSON.stringify({
        geometry: args.geometry,
        compliance: args.complianceResults,
        specs: args.specifications,
      }))
      .digest("hex");

    // Check cache (AI analysis is expensive, cache for 24 hours)
    try {
      const { Redis } = await import("@upstash/redis");
      const { Ratelimit } = await import("@upstash/ratelimit");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      // Rate limiting
      const aiAnalysisLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        analytics: true,
        prefix: "ratelimit:ai",
      });

      const { success, remaining } = await aiAnalysisLimiter.limit(userId);
      if (!success) {
        throw new Error(`AI analysis rate limit exceeded. ${remaining} requests remaining this hour.`);
      }

      const cached = await redis.get(`ai:${contentHash}`);
      if (cached) {
        console.log("✅ Cache HIT for AI analysis");
        return cached as string;
      }
      console.log("❌ Cache MISS - Calling Claude API");
    } catch (error) {
      console.log("Redis not available, proceeding without cache/rate limiting");
    }
    
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    const prompt = `You are a steel manufacturing expert. Analyze this component:

**Geometry:**
${JSON.stringify(args.geometry, null, 2)}

**Compliance Results:**
- Score: ${args.complianceResults?.overallScore ?? 'N/A'}/100
- Violations: ${args.complianceResults?.violations?.length ?? 0}
- Warnings: ${args.complianceResults?.warnings?.length ?? 0}

**Specifications:**
- Material: ${args.specifications?.material?.grade ?? 'Unknown'}
- Edge Type: ${args.specifications?.material?.edgeType ?? 'Unknown'}

Provide:
1. **Fabrication Sequence:** Step-by-step manufacturing process
2. **Cost Optimization:** Ways to reduce material waste and labor time
3. **Design Improvements:** Suggestions to enhance manufacturability
4. **Risk Assessment:** Potential issues and mitigation strategies
5. **Complexity Score:** 0-100 rating with time estimate

Format as markdown with clear sections.`;

    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const firstContent = response.content[0];
    if (firstContent.type !== "text") {
      throw new Error("Unexpected response type from Anthropic API");
    }
    
    const analysis = firstContent.text;

    // Cache for 24 hours and track usage (if Redis is available)
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      await redis.setex(`ai:${contentHash}`, 86400, analysis);
      
      // Track usage
      const key = `usage:${userId}:claude_analysis:${new Date().toISOString().split('T')[0]}`;
      await redis.incr(key);
      await redis.expire(key, 86400 * 30);
    } catch (error) {
      console.log("Redis not available, skipping cache");
    }

    return analysis;
  },
});

