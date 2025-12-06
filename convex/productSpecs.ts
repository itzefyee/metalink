import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Product Specs Mutations
 * Handles batch creation of product specification entries
 */

export const batchCreate = mutation({
  args: {
    specs: v.array(
      v.object({
        productId: v.string(),
        widthMm: v.optional(v.union(v.number(), v.null())),
        heightMm: v.optional(v.union(v.number(), v.null())),
        depthMm: v.optional(v.union(v.number(), v.null())),
        diameterMm: v.optional(v.union(v.number(), v.null())),
        thicknessMm: v.optional(v.union(v.number(), v.null())),
        lengthMm: v.optional(v.union(v.number(), v.null())),
        loadMinKn: v.optional(v.union(v.number(), v.null())),
        loadMaxKn: v.optional(v.union(v.number(), v.null())),
        weightKg: v.optional(v.union(v.number(), v.null())),
        metadata: v.optional(v.any()),
        updatedAt: v.string(),
        // Allow but ignore id field from Supabase export
        id: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const spec of args.specs) {
      // Strip the id field if present and convert null to undefined
      const { id, ...specData } = spec;
      
      // Convert null values to undefined for optional numeric fields
      const cleanedSpec = {
        productId: specData.productId,
        widthMm: specData.widthMm ?? undefined,
        heightMm: specData.heightMm ?? undefined,
        depthMm: specData.depthMm ?? undefined,
        diameterMm: specData.diameterMm ?? undefined,
        thicknessMm: specData.thicknessMm ?? undefined,
        lengthMm: specData.lengthMm ?? undefined,
        loadMinKn: specData.loadMinKn ?? undefined,
        loadMaxKn: specData.loadMaxKn ?? undefined,
        weightKg: specData.weightKg ?? undefined,
        metadata: specData.metadata,
        updatedAt: specData.updatedAt,
      };
      
      // Check if spec already exists by productId
      const existing = await ctx.db
        .query("productSpecs")
        .withIndex("by_product_id", (q) => q.eq("productId", spec.productId))
        .first();

      if (existing) {
        // Update existing spec
        await ctx.db.patch(existing._id, cleanedSpec);
        results.push(existing._id);
      } else {
        // Create new spec
        const newId = await ctx.db.insert("productSpecs", cleanedSpec);
        results.push(newId);
      }
    }
    return results;
  },
});
