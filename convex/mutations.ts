import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Auth Mutations
export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      emailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return userId;
  },
});

export const createProfile = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profileId = await ctx.db.insert("profiles", {
      userId: args.userId,
      email: args.email,
      company: args.company,
      phone: args.phone,
      role: args.role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      company: args.company,
      phone: args.phone,
      role: args.role,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      token: args.token,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
    return sessionId;
  },
});

export const deleteSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// CAD Generation Mutations
export const createGeneration = mutation({
  args: {
    description: v.string(),
    specifications: v.any(),
    stepFileId: v.optional(v.id("_storage")),
    status: v.string(),
    userId: v.optional(v.string()),
    category: v.optional(v.string()),
    format: v.optional(v.string()),
    units: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const generationId = await ctx.db.insert("cadGenerations", {
      description: args.description,
      specifications: args.specifications,
      stepFileId: args.stepFileId,
      status: args.status,
      userId: args.userId,
      category: args.category,
      format: args.format,
      units: args.units,
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

// Drawing Analyses Mutations
export const createDrawingAnalysis = mutation({
  args: {
    userId: v.id("users"),
    fileName: v.string(),
    storageId: v.optional(v.id("_storage")),
    fileType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    extractedSpecs: v.optional(v.any()),
    recommendedProducts: v.optional(v.array(v.any())),
    confidence: v.optional(v.number()),
    reasoning: v.optional(v.string()),
    claudeResponse: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("drawingAnalyses", {
      userId: args.userId,
      fileName: args.fileName,
      storageId: args.storageId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      extractedSpecs: args.extractedSpecs,
      recommendedProducts: args.recommendedProducts,
      confidence: args.confidence,
      reasoning: args.reasoning,
      claudeResponse: args.claudeResponse,
      analyzedAt: Date.now(),
    });
  },
});

// Note: File storage is handled via actions, not mutations
// See convex/files.ts for the upload action

