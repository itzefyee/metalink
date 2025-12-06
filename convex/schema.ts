import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cadGenerations: defineTable({
    userId: v.optional(v.string()),
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
    stepFileId: v.optional(v.id("_storage")), // Convex file storage
    complianceScore: v.optional(v.number()),
    status: v.string(), // "generating" | "completed" | "failed"
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  complianceReports: defineTable({
    generationId: v.id("cadGenerations"),
    overallScore: v.number(),
    violations: v.array(v.any()),
    warnings: v.array(v.any()),
    aiAnalysis: v.string(),
    reportPdfId: v.optional(v.id("_storage")),
  }).index("by_generation", ["generationId"]),

  chatSessions: defineTable({
    userId: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    })),
    contextDocuments: v.array(v.string()), // MCP context IDs
  }).index("by_user", ["userId"]),
});

