import { query } from "./_generated/server";
import { v } from "convex/values";

// Auth Queries
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return profile;
  },
});

export const getSessionByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    return session;
  },
});

// CAD Generation Queries
export const getGeneration = query({
  args: { id: v.id("cadGenerations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getComplianceReport = query({
  args: { generationId: v.id("cadGenerations") },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("complianceReports")
      .withIndex("by_generation", (q) => q.eq("generationId", args.generationId))
      .first();
    return report;
  },
});

export const getChatSession = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return session;
  },
});

export const listGenerations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("cadGenerations")
      .order("desc")
      .take(limit);
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Drawing Analyses Queries
export const getDrawingAnalysis = query({
  args: { id: v.id("drawingAnalyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getDrawingAnalysesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drawingAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Products Queries
export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const searchProducts = query({
  args: {
    category: v.optional(v.string()),
    materialFamily: v.optional(v.string()),
    componentType: v.optional(v.id("componentTaxonomy")),
  },
  handler: async (ctx, args) => {
    // Use conditional logic to build the correct query
    if (args.category) {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(100);
    } else if (args.materialFamily) {
      return await ctx.db
        .query("products")
        .withIndex("by_material_family", (q) => q.eq("materialFamily", args.materialFamily!))
        .take(100);
    } else if (args.componentType) {
      return await ctx.db
        .query("products")
        .withIndex("by_component_type", (q) => q.eq("componentTypeId", args.componentType!))
        .take(100);
    }
    
    // Default: return all products (limited)
    return await ctx.db
      .query("products")
      .take(100);
  },
});

