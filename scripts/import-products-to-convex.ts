/**
 * Import Products Data to Convex
 * 
 * This script imports product data from exported JSON files into Convex.
 * 
 * Prerequisites:
 *   1. Run export script first: npx tsx scripts/export-products-from-supabase.ts
 *   2. Set up Convex: npx convex dev (in another terminal)
 *   3. Ensure NEXT_PUBLIC_CONVEX_URL is set in .env.local
 * 
 * Usage:
 *   npx tsx scripts/import-products-to-convex.ts
 */

import { ConvexHttpClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    console.error("❌ Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
    console.error("   Run 'npx convex dev' to get your Convex URL");
    process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);
const dataDir = path.join(process.cwd(), "scripts", "migration-data");

interface ImportStats {
    componentTaxonomy: number;
    materialSynonyms: number;
    products: number;
    productSpecs: number;
    productEmbeddings: number;
}

// Map to store UUID to Convex ID for component taxonomy
const componentTaxonomyMap = new Map<string, string>();

async function importComponentTaxonomy() {
    console.log("🏷️  Importing component taxonomy...");

    const filePath = path.join(dataDir, "component-taxonomy.json");
    if (!fs.existsSync(filePath)) {
        console.log("   ⚠️  No component taxonomy data found, skipping...");
        return 0;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const batchSize = 10;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const result = await client.mutation("componentTaxonomy:batchCreate", {
            entries: batch,
        });

        // Map original UUIDs to Convex IDs (if we had UUIDs, we'd map them here)
        // For now, we'll rely on canonicalName matching
        imported += batch.length;
        console.log(`   ✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} entries)`);
    }

    console.log(`   ✅ Total: ${imported} component taxonomy entries imported`);
    return imported;
}

async function importMaterialSynonyms() {
    console.log("📝 Importing material synonyms...");

    const filePath = path.join(dataDir, "material-synonyms.json");
    if (!fs.existsSync(filePath)) {
        console.log("   ⚠️  No material synonyms data found, skipping...");
        return 0;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const batchSize = 10;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await client.mutation("materialSynonyms:batchCreate", {
            entries: batch,
        });
        imported += batch.length;
        console.log(`   ✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} entries)`);
    }

    console.log(`   ✅ Total: ${imported} material synonym entries imported`);
    return imported;
}

async function importProducts() {
    console.log("📦 Importing products...");

    const filePath = path.join(dataDir, "products.json");
    if (!fs.existsSync(filePath)) {
        console.error("   ❌ Products data file not found!");
        throw new Error("products.json not found");
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const batchSize = 10;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        // Convert componentTypeId from UUID string to Convex ID if needed
        // For now, we'll set it to undefined if it exists but can't be mapped
        const transformedBatch = batch.map((product: any) => ({
            ...product,
            componentTypeId: product.componentTypeId
                ? (componentTaxonomyMap.get(product.componentTypeId) as any)
                : undefined,
        }));

        await client.mutation("products:batchCreate", {
            products: transformedBatch,
        });
        imported += batch.length;
        console.log(`   ✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} products)`);
    }

    console.log(`   ✅ Total: ${imported} products imported`);
    return imported;
}

async function importProductSpecs() {
    console.log("📊 Importing product specs...");

    const filePath = path.join(dataDir, "product-specs.json");
    if (!fs.existsSync(filePath)) {
        console.log("   ⚠️  No product specs data found, skipping...");
        return 0;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const batchSize = 10;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await client.mutation("productSpecs:batchCreate", {
            specs: batch,
        });
        imported += batch.length;
        console.log(`   ✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} specs)`);
    }

    console.log(`   ✅ Total: ${imported} product specs imported`);
    return imported;
}

async function importProductEmbeddings() {
    console.log("🔢 Importing product embeddings...");

    const filePath = path.join(dataDir, "product-embeddings.json");
    if (!fs.existsSync(filePath)) {
        console.log("   ⚠️  No product embeddings data found, skipping...");
        return 0;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const batchSize = 10;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await client.mutation("productEmbeddings:batchCreate", {
            embeddings: batch,
        });
        imported += batch.length;
        console.log(`   ✅ Imported batch ${Math.floor(i / batchSize) + 1} (${batch.length} embeddings)`);
    }

    console.log(`   ✅ Total: ${imported} product embeddings imported`);
    return imported;
}

async function verifyConvexConnection() {
    console.log("🔍 Verifying Convex connection...");

    try {
        // Try to query products to verify connection
        const products = await client.query("products:list", { limit: 1 });
        console.log("✅ Connected to Convex\n");
    } catch (error: any) {
        console.error("❌ Convex connection failed:", error.message);
        console.error("   Make sure:");
        console.error("   1. Convex is running: npx convex dev");
        console.error("   2. NEXT_PUBLIC_CONVEX_URL is set correctly in .env.local");
        process.exit(1);
    }
}

async function main() {
    console.log("🚀 Starting product data import to Convex...\n");

    await verifyConvexConnection();

    if (!fs.existsSync(dataDir)) {
        console.error(`❌ Migration data directory not found: ${dataDir}`);
        console.error("   Run the export script first: npx tsx scripts/export-products-from-supabase.ts");
        process.exit(1);
    }

    const stats: ImportStats = {
        componentTaxonomy: 0,
        materialSynonyms: 0,
        products: 0,
        productSpecs: 0,
        productEmbeddings: 0,
    };

    try {
        // Import in order: taxonomy first, then products, then related data
        stats.componentTaxonomy = await importComponentTaxonomy();
        stats.materialSynonyms = await importMaterialSynonyms();
        stats.products = await importProducts();
        stats.productSpecs = await importProductSpecs();
        stats.productEmbeddings = await importProductEmbeddings();

        console.log("\n📊 Import Summary:");
        console.log(`   Component Taxonomy: ${stats.componentTaxonomy}`);
        console.log(`   Material Synonyms: ${stats.materialSynonyms}`);
        console.log(`   Products: ${stats.products}`);
        console.log(`   Product Specs: ${stats.productSpecs}`);
        console.log(`   Product Embeddings: ${stats.productEmbeddings}`);
        console.log("\n✨ Migration completed successfully!");
        console.log("\n📋 Next steps:");
        console.log("   1. Verify data in Convex dashboard");
        console.log("   2. Update your application code to use Convex instead of Supabase");
        console.log("   3. Test product queries and mutations");
    } catch (error: any) {
        console.error("\n❌ Import failed:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();

