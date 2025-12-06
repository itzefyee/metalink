import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }
    client = new ConvexHttpClient(url);
  }
  return client;
}

// For server-side usage (Next.js API routes)
export function getConvexServerClient() {
  return getConvexClient();
}

