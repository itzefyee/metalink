"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";

/**
 * Enhanced CAD Generation Action
 * Incorporates service layer business logic with Convex backend
 * Provides validation, caching, error handling, and Zoo Dev API integration
 */

/**
 * Validation helper
 */
function validateGenerationRequest(description: string): void {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  if (description.length > 1000) {
    throw new Error('Description too long (max 1000 characters)');
  }
}

export const generateFromDescription = action({
  args: {
    description: v.string(),
    specifications: v.optional(v.object({
      dimensions: v.optional(v.object({
        length: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        thickness: v.optional(v.number()),
      })),
      material: v.optional(v.object({
        grade: v.optional(v.string()),
        edgeType: v.optional(v.string()),
      })),
    })),
    userId: v.optional(v.string()),
    category: v.optional(v.string()),
    format: v.optional(v.string()),
    units: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ generationId: Id<"cadGenerations">; stepFileId: Id<"_storage">; cached?: boolean }> => {
    // Business Logic: Validate input
    validateGenerationRequest(args.description);
    
    const userId = args.userId || "anonymous";
    const specifications = args.specifications || {
      dimensions: { length: 6, width: 4, height: 0.25, thickness: 0.25 },
      material: { grade: "A36", edgeType: "rolled" },
    };
    
    // Create content hash for caching
    const contentHash = createHash("sha256")
      .update(JSON.stringify({ description: args.description, specifications }))
      .digest("hex");

    // Check Redis cache for identical previous generations (if Redis is available)
    let cachedResult: any = null;
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      cachedResult = await redis.get(`generation:${contentHash}`);
      if (cachedResult) {
        console.log("✅ Cache HIT for CAD generation");
        const parsed = JSON.parse(cachedResult as string);
        return { ...parsed, cached: true };
      }
      console.log("❌ Cache MISS - Generating new CAD");
      
      // Business Logic: Check rate limiting
      const { Ratelimit } = await import("@upstash/ratelimit");
      const cadGenerationLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "ratelimit:cad",
      });

      const { success, remaining } = await cadGenerationLimiter.limit(userId);
      if (!success) {
        throw new Error(`Rate limit exceeded. ${remaining} generations remaining this hour. Please try again later.`);
      }
    } catch (error) {
      console.log("Redis not available, proceeding without cache");
    }
    
    // Step 1: Claude optimizes the prompt for Zoo Dev
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });
    
    const materialGrade = specifications.material?.grade || "steel";
    const dimensionsStr = JSON.stringify(specifications.dimensions || {});
    
    const optimizedPrompt = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
      max_tokens: 50,
      messages: [{
        role: "user",
        content: `Generate a concise CAD prompt (under 10 words) for: "${args.description}" with ${materialGrade} steel, dimensions ${dimensionsStr}. Return ONLY the prompt.`
      }]
    });

    const firstContent = optimizedPrompt.content[0];
    if (firstContent.type !== "text") {
      throw new Error("Unexpected response type from Anthropic API");
    }
    const zooPrompt = firstContent.text;

    // Step 2: Call Zoo Dev API
    const zooApiKey = process.env.ZOO_DEV_API_KEY;
    if (!zooApiKey) {
      throw new Error("ZOO_DEV_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    // Step 2: Call Zoo Dev API (or alternative CAD generation service)
    // Note: If Zoo Dev API is not available, you may need to:
    // 1. Use an alternative CAD generation service
    // 2. Implement your own CAD generation using OpenCascade.js
    // 3. Use a different API endpoint
    
    // Try the Zoo Dev API endpoint
    let stepFileBlob: Blob;
    try {
      const zooResponse = await fetch("https://api.zoo.dev/cad/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${zooApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: zooPrompt,
          format: "step", // Request STEP file
          units: "inches",
        }),
      });

      if (!zooResponse.ok) {
        const errorText = await zooResponse.text();
        
        if (zooResponse.status === 404) {
          throw new Error(
            `Zoo Dev API endpoint not found (404). The API may have changed or the endpoint URL is incorrect.\n` +
            `Error details: ${errorText}\n\n` +
            `Possible solutions:\n` +
            `1. Check Zoo Dev API documentation for the correct endpoint\n` +
            `2. Verify your API key has access to CAD generation endpoints\n` +
            `3. Consider using an alternative CAD generation service\n` +
            `4. Implement a fallback using OpenCascade.js for basic shapes`
          );
        }
        
        throw new Error(`Zoo Dev API failed with status ${zooResponse.status}: ${errorText}`);
      }

      stepFileBlob = await zooResponse.blob();
    } catch (error) {
      // If Zoo Dev fails, you could implement a fallback here
      // For now, we'll re-throw with a helpful message
      if (error instanceof Error) {
        throw new Error(`CAD generation failed: ${error.message}`);
      }
      throw error;
    }

    // Step 3: Store in Convex file storage
    const stepFileId = await ctx.storage.store(stepFileBlob);

    // Step 4: Create database record with enhanced metadata
    const generationId: Id<"cadGenerations"> = await ctx.runMutation(
      api.mutations.createGeneration,
      {
        description: args.description,
        specifications,
        stepFileId,
        status: "completed",
        userId: args.userId,
        category: args.category,
        format: args.format || "step",
        units: args.units || "mm",
      }
    );

    const result = { generationId, stepFileId, cached: false };

    // Cache the result for 1 hour (if Redis is available)
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      await redis.setex(
        `generation:${contentHash}`,
        3600,
        JSON.stringify(result)
      );

      // Track API usage
      const key = `usage:${userId}:zoo_dev:${new Date().toISOString().split('T')[0]}`;
      await redis.incr(key);
      await redis.expire(key, 86400 * 30);
    } catch (error) {
      console.log("Redis not available, skipping cache");
    }

    return result;
  },
});

