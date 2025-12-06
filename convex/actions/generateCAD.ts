"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";

export const generateFromDescription = action({
  args: {
    description: v.string(),
    specifications: v.any(),
  },
  handler: async (ctx, args): Promise<{ generationId: Id<"cadGenerations">; stepFileId: Id<"_storage"> }> => {
    // Step 1: Claude optimizes the prompt for Zoo Dev
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });
    
    const optimizedPrompt = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
      max_tokens: 50,
      messages: [{
        role: "user",
        content: `Generate a concise CAD prompt (under 10 words) for: "${args.description}" with ${args.specifications.material.grade} steel, dimensions ${JSON.stringify(args.specifications.dimensions)}. Return ONLY the prompt.`
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

    // Step 4: Create database record
    const generationId: Id<"cadGenerations"> = await ctx.runMutation(
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

