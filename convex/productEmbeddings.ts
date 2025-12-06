import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Product Embeddings Mutations
 * Handles batch creation of product embedding entries
 */

export const batchCreate = mutation({
  args: {
    embeddings: v.array(
      v.object({
        productId: v.string(),
        embedding: v.optional(v.array(v.number())),
        source: v.optional(v.string()),
        updatedAt: v.string(),
        // Allow but ignore id field from Supabase export
        id: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const embedding of args.embeddings) {
      // Strip the id field if present (we don't store it in Convex)
      const { id, ...embeddingData } = embedding;
      
      // Check if embedding already exists by productId
      const existing = await ctx.db
        .query("productEmbeddings")
        .withIndex("by_product_id", (q) => q.eq("productId", embedding.productId))
        .first();

      if (existing) {
        // Update existing embedding
        await ctx.db.patch(existing._id, {
          embedding: embeddingData.embedding,
          source: embeddingData.source,
          updatedAt: embeddingData.updatedAt,
        });
        results.push(existing._id);
      } else {
        // Create new embedding
        const newId = await ctx.db.insert("productEmbeddings", embeddingData);
        results.push(newId);
      }
    }
    return results;
  },
});
