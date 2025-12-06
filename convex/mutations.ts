import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createGeneration = mutation({
  args: {
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
    stepFileId: v.optional(v.id("_storage")),
    status: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const generationId = await ctx.db.insert("cadGenerations", {
      description: args.description,
      specifications: args.specifications,
      stepFileId: args.stepFileId,
      status: args.status,
      userId: args.userId,
      createdAt: Date.now(),
    });
    return generationId;
  },
});

export const appendChatMessage = mutation({
  args: {
    userId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingSession = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        messages: [...existingSession.messages, ...args.messages],
      });
      return existingSession._id;
    } else {
      const sessionId = await ctx.db.insert("chatSessions", {
        userId: args.userId,
        messages: args.messages,
        contextDocuments: [],
      });
      return sessionId;
    }
  },
});

