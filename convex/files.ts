"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const upload = action({
  args: {
    fileName: v.string(),
    fileData: v.array(v.number()),
    contentType: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Convert array back to Uint8Array
    const uint8Array = new Uint8Array(args.fileData);
    const blob = new Blob([uint8Array], { type: args.contentType });
    
    // Store in Convex storage (only takes blob, no path argument)
    const storageId = await ctx.storage.store(blob);
    
    return storageId;
  },
});

