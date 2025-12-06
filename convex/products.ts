import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: {
    category: v.optional(v.string()),
    materialFamily: v.optional(v.string()),
    componentType: v.optional(v.string()),
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

