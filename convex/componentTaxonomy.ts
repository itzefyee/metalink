import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Component Taxonomy Mutations
 * Handles batch creation of component taxonomy entries
 */

export const batchCreate = mutation({
  args: {
    entries: v.array(
      v.object({
        canonicalName: v.string(),
        category: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.array(v.string()),
        createdAt: v.string(),
        updatedAt: v.string(),
        // Allow but ignore id field from Supabase export
        id: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const entry of args.entries) {
      // Strip the id field if present (we don't store it in Convex)
      const { id, ...entryData } = entry;
      
      // Check if entry already exists by canonicalName
      const existing = await ctx.db
        .query("componentTaxonomy")
        .withIndex("by_canonical_name", (q) => q.eq("canonicalName", entry.canonicalName))
        .first();

      if (existing) {
        // Update existing entry
        await ctx.db.patch(existing._id, {
          category: entryData.category,
          description: entryData.description,
          keywords: entryData.keywords,
          updatedAt: entryData.updatedAt,
        });
        results.push(existing._id);
      } else {
        // Create new entry
        const newId = await ctx.db.insert("componentTaxonomy", entryData);
        results.push(newId);
      }
    }
    return results;
  },
});
