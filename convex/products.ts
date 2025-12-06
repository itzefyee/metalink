import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Functions for Products
 * 
 * These functions handle product data operations after migration from Supabase.
 */

// Query: Get a single product by ID (string ID from Supabase)
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("id", args.id))
      .first();
  },
});

// Query: Get a single product by Convex ID
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: List all products with optional filters
export const list = query({
  args: {
    category: v.optional(v.string()),
    materialFamily: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.category) {
      results = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.materialFamily) {
      results = await ctx.db
        .query("products")
        .withIndex("by_material_family", (q) => q.eq("materialFamily", args.materialFamily!))
        .collect();
    } else if (args.inStock !== undefined) {
      results = await ctx.db
        .query("products")
        .withIndex("by_in_stock", (q) => q.eq("inStock", args.inStock!))
        .collect();
    } else {
      results = await ctx.db.query("products").collect();
    }

    // Apply in-memory filters for fields not covered by indexes
    let filtered = results;
    if (args.materialFamily && !args.category && args.inStock === undefined) {
      filtered = filtered.filter((p) => p.materialFamily === args.materialFamily);
    }
    if (args.inStock !== undefined && !args.category && !args.materialFamily) {
      filtered = filtered.filter((p) => p.inStock === args.inStock);
    }

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }
    return filtered;
  },
});

// Query: Search products by name or description
export const search = query({
  args: { 
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    materialFamily: v.optional(v.string()),
    componentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Use conditional logic to build the correct query
    if (args.category) {
      const results = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(100);
      
      if (args.query) {
        const searchLower = args.query.toLowerCase();
        return results.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.material?.toLowerCase().includes(searchLower)
        );
      }
      return results;
    } else if (args.materialFamily) {
      const results = await ctx.db
        .query("products")
        .withIndex("by_material_family", (q) => q.eq("materialFamily", args.materialFamily!))
        .take(100);
      
      if (args.query) {
        const searchLower = args.query.toLowerCase();
        return results.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.material?.toLowerCase().includes(searchLower)
        );
      }
      return results;
    } else if (args.componentType) {
      const results = await ctx.db
        .query("products")
        .withIndex("by_component_type", (q) => q.eq("componentTypeId", args.componentType as any))
        .take(100);
      
      if (args.query) {
        const searchLower = args.query.toLowerCase();
        return results.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.material?.toLowerCase().includes(searchLower)
        );
      }
      return results;
    }
    
    // Default: return all products (limited) and filter by query if provided
    const allProducts = await ctx.db
      .query("products")
      .take(100);
    
    if (args.query) {
      const searchLower = args.query.toLowerCase();
      return allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.material?.toLowerCase().includes(searchLower)
      );
    }
    
    return allProducts;
  },
});

// Mutation: Create a product (for migration)
export const create = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    category: v.string(),
    material: v.optional(v.string()),
    materialFamily: v.optional(v.string()),
    componentTypeId: v.optional(v.id("componentTaxonomy")),
    specifications: v.any(),
    price: v.number(),
    images: v.array(v.string()),
    description: v.optional(v.string()),
    technicalDetails: v.optional(v.string()),
    compatibleWith: v.array(v.string()),
    inStock: v.boolean(),
    leadTime: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if product already exists
    const existing = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      // Update existing product
      return await ctx.db.patch(existing._id, {
        name: args.name,
        category: args.category,
        material: args.material,
        materialFamily: args.materialFamily,
        componentTypeId: args.componentTypeId,
        specifications: args.specifications,
        price: args.price,
        images: args.images,
        description: args.description,
        technicalDetails: args.technicalDetails,
        compatibleWith: args.compatibleWith,
        inStock: args.inStock,
        leadTime: args.leadTime,
        updatedAt: args.updatedAt,
      });
    }

    // Create new product
    return await ctx.db.insert("products", {
      id: args.id,
      name: args.name,
      category: args.category,
      material: args.material,
      materialFamily: args.materialFamily,
      componentTypeId: args.componentTypeId,
      specifications: args.specifications,
      price: args.price,
      images: args.images,
      description: args.description,
      technicalDetails: args.technicalDetails,
      compatibleWith: args.compatibleWith,
      inStock: args.inStock,
      leadTime: args.leadTime,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

// Mutation: Batch create products (for migration)
export const batchCreate = mutation({
  args: {
    products: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        category: v.string(),
        material: v.optional(v.union(v.string(), v.null())),
        materialFamily: v.optional(v.union(v.string(), v.null())),
        componentTypeId: v.optional(v.union(v.id("componentTaxonomy"), v.null())),
        specifications: v.any(),
        price: v.number(),
        images: v.array(v.string()),
        description: v.optional(v.union(v.string(), v.null())),
        technicalDetails: v.optional(v.union(v.string(), v.null())),
        compatibleWith: v.array(v.string()),
        inStock: v.boolean(),
        leadTime: v.optional(v.union(v.string(), v.null())),
        createdAt: v.string(),
        updatedAt: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const product of args.products) {
      // Convert null values to undefined for optional fields, handle missing fields
      const cleanedProduct = {
        id: product.id,
        name: product.name,
        category: product.category,
        material: product.material ?? undefined,
        materialFamily: product.materialFamily ?? undefined,
        componentTypeId: product.componentTypeId ?? undefined,
        specifications: product.specifications,
        price: product.price,
        images: product.images,
        description: product.description ?? undefined,
        technicalDetails: product.technicalDetails ?? undefined,
        compatibleWith: product.compatibleWith,
        inStock: product.inStock,
        leadTime: product.leadTime ?? undefined,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      const existing = await ctx.db
        .query("products")
        .withIndex("by_product_id", (q) => q.eq("id", product.id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, cleanedProduct);
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert("products", cleanedProduct);
        results.push(id);
      }
    }
    return results;
  },
});
