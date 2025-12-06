import { query } from "./_generated/server";
import { v } from "convex/values";

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

