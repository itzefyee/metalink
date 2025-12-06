"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { createHash } from "crypto";
// Dynamic imports for large packages to reduce bundle size
// import Anthropic from "@anthropic-ai/sdk";
// import { ml } from "@kittycad/lib";

/**
 * Enhanced CAD Generation Action
 * Incorporates service layer business logic with Convex backend
 * Provides validation, caching, and Zoo Dev API integration with polling support
 */

// Polling configuration
const MAX_POLL_ATTEMPTS = 150; // 5 minutes (150 * 2s)
const POLL_INTERVAL = 2000; // 2 seconds
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Validation helper - validates description
 * Note: Full validation with format/units is done at API route level
 */
function validateDescription(description: string): void {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  if (description.length > 1000) {
    throw new Error('Description too long (max 1000 characters)');
  }
}

/**
 * Poll Zoo Dev API operation until completion using KittyCAD library
 * Handles async operations that return status: 'queued' or 'processing'
 */
async function pollZooDevOperation(
  operationId: string,
  format: string
): Promise<Blob> {
  // Dynamic import to avoid bundling large package
  const { ml } = await import("@kittycad/lib");
  
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    try {
      // Check operation status using KittyCAD library
      const operation = await (ml as any).get_text_to_cad_part_for_user({
        id: operationId,
      });

      // Check if completed
      if (operation.status === 'completed') {
        // Extract model data from outputs
        const outputKey = `source.${format}`;
        
        if (operation.outputs && operation.outputs[outputKey]) {
          const output = operation.outputs[outputKey];
          
          // Handle different output formats
          if (typeof output === 'string') {
            // Base64 encoded string - convert to blob
            const binaryString = atob(output);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return new Blob([bytes], { type: `model/${format}` });
          } else if (output && typeof output === 'object' && 'content' in output) {
            // Object with content property
            const content = (output as any).content;
            if (typeof content === 'string') {
              const binaryString = atob(content);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return new Blob([bytes], { type: `model/${format}` });
            } else if (content?.url) {
              // URL to download
              const fileResponse = await fetch(content.url, {
                signal: AbortSignal.timeout(API_TIMEOUT),
              });
              if (!fileResponse.ok) {
                throw new Error('Failed to download completed file');
              }
              return await fileResponse.blob();
            }
          } else if (output?.url) {
            // Direct URL in output
            const fileResponse = await fetch(output.url, {
              signal: AbortSignal.timeout(API_TIMEOUT),
            });
            if (!fileResponse.ok) {
              throw new Error('Failed to download completed file');
            }
            return await fileResponse.blob();
          }
        } else if (operation.outputs) {
          // Fallback: try any available output
          const availableKeys = Object.keys(operation.outputs);
          for (const key of availableKeys) {
            const output = operation.outputs[key];
            if (output && typeof output === 'object' && 'url' in output) {
              const fileResponse = await fetch((output as any).url, {
                signal: AbortSignal.timeout(API_TIMEOUT),
              });
              if (fileResponse.ok) {
                return await fileResponse.blob();
              }
            }
          }
        }
        
        throw new Error('Completed operation but no file data found in outputs');
      }

      // Check if failed
      if (operation.status === 'failed') {
        const errorMessage = (operation as any).error || 'Generation failed';
        throw new Error(errorMessage);
      }

      // Still in progress (queued or processing), wait and retry
      if (attempt < MAX_POLL_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    } catch (error: any) {
      // If it's a known error (not network), throw immediately
      if (error.message && !error.message.includes('fetch') && !error.message.includes('network') && !error.message.includes('timeout')) {
        throw error;
      }

      // For network/timeout errors, log and continue
      console.warn(`Poll attempt ${attempt} encountered error:`, error.message);

      if (attempt === MAX_POLL_ATTEMPTS) {
        throw new Error(`Polling failed after ${MAX_POLL_ATTEMPTS} attempts: ${error.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  }

  throw new Error(
    `Operation ${operationId} did not complete within ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL) / 1000} seconds`
  );
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
    validateDescription(args.description);
    
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
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (redisUrl && redisToken) {
      try {
        const { Redis } = await import("@upstash/redis");
        const redis = new Redis({
          url: redisUrl,
          token: redisToken,
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
    } else {
      console.log("Redis not configured, proceeding without cache");
    }
    
    // Step 1: Claude optimizes the prompt for Zoo Dev
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    // Dynamic import to avoid bundling large package
    const { Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });
    
    const materialGrade = specifications.material?.grade || "steel";
    const dimensionsStr = JSON.stringify(specifications.dimensions || {});
    
    const optimizedPrompt = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
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

    // Step 2: Call Zoo Dev API using KittyCAD library
    // The library uses ZOO_API_TOKEN or ZOO_DEV_API_KEY from environment variables
    const zooApiKey = process.env.ZOO_DEV_API_KEY || process.env.ZOO_API_TOKEN;
    if (!zooApiKey) {
      throw new Error("ZOO_DEV_API_KEY or ZOO_API_TOKEN environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    // Initialize KittyCAD library with API key
    // Note: The library may use environment variables automatically, but we ensure it's set
    if (!process.env.ZOO_API_TOKEN && zooApiKey) {
      // Set it for the library if not already set
      process.env.ZOO_API_TOKEN = zooApiKey;
    }
    
    let stepFileBlob: Blob;
    const format = (args.format || "step") as "step" | "stl" | "obj" | "gltf" | "glb";
    
    try {
      // Dynamic import to avoid bundling large package
      const { ml } = await import("@kittycad/lib");
      
      // Call Zoo Dev API using KittyCAD library
      const result = await ml.create_text_to_cad({
        body: {
          prompt: zooPrompt,
        },
        output_format: format,
      } as any);

      // Check for API errors
      if ('error_code' in result) {
        throw new Error(`CAD generation failed: ${(result as any).message || 'Unknown error'}`);
      }

      // Check if async operation (needs polling) or completed
      if (result && 'status' in result && result.status !== 'completed' && result.id) {
        // Async operation - poll until completion
        console.log(`Starting polling for operation ${result.id}, status: ${result.status}`);
        stepFileBlob = await pollZooDevOperation(result.id, format);
      } else if (result && 'status' in result && result.status === 'completed') {
        // Already completed, extract model data
        const outputKey = `source.${format}`;
        
        if (result.outputs && result.outputs[outputKey]) {
          const output = result.outputs[outputKey];
          
          // Handle different output formats
          if (typeof output === 'string') {
            // Base64 encoded string - convert to blob
            const binaryString = atob(output);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            stepFileBlob = new Blob([bytes], { type: `model/${format}` });
          } else if (output && typeof output === 'object' && 'content' in output) {
            const content = (output as any).content;
            if (typeof content === 'string') {
              const binaryString = atob(content);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              stepFileBlob = new Blob([bytes], { type: `model/${format}` });
            } else if (content && typeof content === 'object' && 'url' in content) {
              const fileResponse = await fetch((content as any).url);
              stepFileBlob = await fileResponse.blob();
            } else {
              throw new Error('Completed operation but no file data found in outputs');
            }
          } else if (output && typeof output === 'object' && 'url' in output) {
            const fileResponse = await fetch((output as any).url);
            stepFileBlob = await fileResponse.blob();
          } else {
            throw new Error('Completed operation but no file data found in outputs');
          }
        } else {
          throw new Error('No model data received from Zoo Dev API');
        }
      } else {
        throw new Error(`Unexpected response format from Zoo Dev API: ${JSON.stringify(result)}`);
      }
    } catch (error: any) {
      // Re-throw with helpful message
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
    if (redisUrl && redisToken) {
      try {
        const { Redis } = await import("@upstash/redis");
        const redis = new Redis({
          url: redisUrl,
          token: redisToken,
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
    }

    return result;
  },
});

