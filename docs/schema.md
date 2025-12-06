import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for SteelSmart Products
 * 
 * This schema defines the data structure for products migrated from Supabase.
 * Run `npx convex dev` to apply this schema to your Convex deployment.
 */

export default defineSchema({
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
    .index("by_id", ["id"])
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

