import { Tool, SchemaConstraint } from "@leanmcp/core";

/**
 * Chat Service
 * Provides AI-powered chat with access to standards and CAD generation
 * 
 * Note: The actual Convex chat action is called from the Next.js API route
 * (/api/mcp/chat/route.ts) to avoid import path issues. This MCP tool
 * provides the interface for the chat functionality.
 */

class ChatInput {
  @SchemaConstraint({ 
    description: "User message to send to the AI assistant",
    minLength: 1,
    maxLength: 2000
  })
  message!: string;

  @SchemaConstraint({ 
    description: "User ID for session management",
    default: "anonymous"
  })
  userId!: string;
}

export class ChatService {
  @Tool({ 
    description: "Chat with Metalink AI assistant. The assistant has access to AISC 360, AWS D1.1, and ASTM standards, and can help with CAD generation, compliance questions, and design guidance.",
    inputClass: ChatInput
  })
  async chat(input: ChatInput) {
    try {
      // The Next.js API route (/api/mcp/chat/route.ts) handles the actual Convex call
      // This MCP tool provides the interface and returns the request for processing
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            message: input.message,
            userId: input.userId,
            note: "Chat request received. The Next.js API route will call Convex chat action."
          }, null, 2)
        }]
      };
    } catch (error: any) {
      console.error("MCP Chat Service Error:", error);
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: error.message || "Chat failed"
          }, null, 2)
        }]
      };
    }
  }
}

