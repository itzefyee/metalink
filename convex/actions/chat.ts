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
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in your Convex dashboard under Settings > Environment Variables.");
    }
    
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    // Get chat history
    const session = await ctx.runQuery(api.queries.getChatSession, {
      userId: args.userId,
    });

    const previousMessages: Array<{ role: string; content: string; timestamp: number }> = session?.messages || [];

    // System prompt with MCP context
    const systemPrompt = `You are SteelBot, an expert assistant for SteelSmart CAD Generator.

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

