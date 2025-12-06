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

  // Component Taxonomy - canonical component types and aliases
  componentTaxonomy: defineTable({
    canonicalName: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_category", ["category"])
    .index("by_canonical_name", ["canonicalName"]),

  // Material Synonyms - maps freeform text to normalized families
  materialSynonyms: defineTable({
    family: v.string(),
    synonyms: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_family", ["family"]),

  // Products - main product catalog
  products: defineTable({
    id: v.string(), // Keep original ID from Supabase
    name: v.string(),
    category: v.string(), // 'robotic', 'structural', 'fasteners', 'custom'
    material: v.optional(v.string()),
    materialFamily: v.optional(v.string()),
    componentTypeId: v.optional(v.id("componentTaxonomy")),
    specifications: v.any(), // JSON object
    price: v.number(),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    technicalDetails: v.optional(v.string()),
    compatibleWith: v.array(v.string()),
    inStock: v.boolean(),
    leadTime: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_product_id", ["id"])
    .index("by_category", ["category"])
    .index("by_material_family", ["materialFamily"])
    .index("by_component_type", ["componentTypeId"])
    .index("by_in_stock", ["inStock"]),

  // Product Specs - structured specifications per product
  productSpecs: defineTable({
    productId: v.string(), // Reference to products.id (not a foreign key in Convex)
    widthMm: v.optional(v.number()),
    heightMm: v.optional(v.number()),
    depthMm: v.optional(v.number()),
    diameterMm: v.optional(v.number()),
    thicknessMm: v.optional(v.number()),
    lengthMm: v.optional(v.number()),
    loadMinKn: v.optional(v.number()),
    loadMaxKn: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    metadata: v.optional(v.any()), // JSON object
    updatedAt: v.string(),
  })
    .index("by_product_id", ["productId"])
    .index("by_dimensions", ["widthMm", "heightMm", "depthMm", "diameterMm"])
    .index("by_load", ["loadMinKn", "loadMaxKn"]),

  // Product Embeddings - vector embeddings for similarity search
  productEmbeddings: defineTable({
    productId: v.string(), // Reference to products.id
    embedding: v.optional(v.array(v.number())), // Vector embedding array
    source: v.optional(v.string()),
    updatedAt: v.string(),
  })
    .index("by_product_id", ["productId"])
    .index("by_source", ["source"]),
});

