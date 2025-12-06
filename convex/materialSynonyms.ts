import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Material Synonyms Mutations
 * Handles batch creation of material synonym entries
 */

export const batchCreate = mutation({
  args: {
    entries: v.array(
      v.object({
        family: v.string(),
        synonyms: v.array(v.string()),
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
      
      // Check if entry already exists by family
      const existing = await ctx.db
        .query("materialSynonyms")
        .withIndex("by_family", (q) => q.eq("family", entry.family))
        .first();

      if (existing) {
        // Update existing entry
        await ctx.db.patch(existing._id, {
          synonyms: entryData.synonyms,
          updatedAt: entryData.updatedAt,
        });
        results.push(existing._id);
      } else {
        // Create new entry
        const newId = await ctx.db.insert("materialSynonyms", entryData);
        results.push(newId);
      }
    }
    return results;
  },
});
