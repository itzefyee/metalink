"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { MCP_STANDARDS } from "../mcp/config";

export const sendMessage = action({
  args: {
    userId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{ message: string }> => {
    // Rate limiting (if Redis is available)
    let previousMessages: Array<{ role: string; content: string; timestamp: number }> = [];
    
    try {
      const { Redis } = await import("@upstash/redis");
      const { Ratelimit } = await import("@upstash/ratelimit");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      // Rate limiting
      const chatbotLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(50, "1 h"),
        analytics: true,
        prefix: "ratelimit:chat",
      });

      const { success, remaining } = await chatbotLimiter.limit(args.userId);
      if (!success) {
        return {
          message: `You've reached the message limit. ${remaining} messages remaining this hour.`,
        };
      }

      // Get chat history from Redis (faster than Convex for hot data)
      const cachedSession = await redis.get(`session:${args.userId}`);
      if (cachedSession) {
        const sessionData = JSON.parse(cachedSession as string);
        previousMessages = sessionData.messages || [];
        console.log("✅ Cache HIT for chat session");
      } else {
        console.log("❌ Cache MISS - Fetching from Convex");
      }
    } catch (error) {
      console.log("Redis not available, using Convex for session data");
    }

    // Fallback to Convex if Redis cache miss or unavailable
    if (previousMessages.length === 0) {
      const session = await ctx.runQuery(api.queries.getChatSession, {
        userId: args.userId,
      });
      previousMessages = session?.messages || [];
    }
    
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    // System prompt with MCP context
    const systemPrompt = `You are Metalink Assistant, an expert assistant for Metalink CAD Generator.

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
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...previousMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: args.message,
      },
    ];

    // Call Claude
    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const firstContent = response.content[0];
    const assistantMessage: string = firstContent.type === "text" 
      ? firstContent.text 
      : "";

    // Save conversation to Redis (fast access) and Convex (persistence)
    const newMessages = [
      { role: "user", content: args.message, timestamp: Date.now() },
      { role: "assistant", content: assistantMessage, timestamp: Date.now() },
    ];

    await ctx.runMutation(api.mutations.appendChatMessage, {
      userId: args.userId,
      messages: newMessages,
    });

    // Update Redis session (if available)
    try {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      await redis.setex(
        `session:${args.userId}`,
        1800, // 30 min TTL
        JSON.stringify({
          messages: [...previousMessages, ...newMessages].slice(-20), // Keep last 20
        })
      );

      // Track usage
      const key = `usage:${args.userId}:chatbot:${new Date().toISOString().split('T')[0]}`;
      await redis.incr(key);
      await redis.expire(key, 86400 * 30);
    } catch (error) {
      console.log("Redis not available, skipping session cache");
    }

    return { message: assistantMessage };
  },
});

