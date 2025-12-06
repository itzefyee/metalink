import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),

  profiles: defineTable({
    userId: v.id("users"),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  cadGenerations: defineTable({
    userId: v.optional(v.string()),
    description: v.string(),
    specifications: v.any(), // Flexible for different spec structures
    stepFileId: v.optional(v.id("_storage")), // Convex file storage
    complianceScore: v.optional(v.number()),
    status: v.string(), // "generating" | "completed" | "failed"
    category: v.optional(v.string()),
    format: v.optional(v.string()),
    units: v.optional(v.string()),
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

  drawingAnalyses: defineTable({
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
    analyzedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_analyzed_at", ["analyzedAt"]),

  products: defineTable({
    name: v.string(),
    category: v.string(),
    material: v.optional(v.string()),
    materialFamily: v.optional(v.string()),
    componentTypeId: v.optional(v.string()),
    specifications: v.any(),
    inStock: v.boolean(),
    price: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_material_family", ["materialFamily"])
    .index("by_component_type", ["componentTypeId"]),
});

