import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter configurations
export const cadGenerationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 generations per hour
  analytics: true,
  prefix: "ratelimit:cad",
});

export const aiAnalysisLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 analyses per hour
  analytics: true,
  prefix: "ratelimit:ai",
});

export const chatbotLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 h"), // 50 messages per hour
  analytics: true,
  prefix: "ratelimit:chat",
});

// Cache helpers
export const cacheHelpers = {
  // Cache STEP geometry analysis (expensive operation)
  async cacheGeometry(stepFileId: string, geometry: any) {
    await redis.setex(
      `geometry:${stepFileId}`,
      3600, // 1 hour TTL
      JSON.stringify(geometry)
    );
  },

  async getGeometry(stepFileId: string) {
    const cached = await redis.get(`geometry:${stepFileId}`);
    return cached ? JSON.parse(cached as string) : null;
  },

  // Cache compliance validation results
  async cacheCompliance(geometryHash: string, results: any) {
    await redis.setex(
      `compliance:${geometryHash}`,
      7200, // 2 hours TTL
      JSON.stringify(results)
    );
  },

  async getCompliance(geometryHash: string) {
    const cached = await redis.get(`compliance:${geometryHash}`);
    return cached ? JSON.parse(cached as string) : null;
  },

  // Cache AI analysis (most expensive)
  async cacheAIAnalysis(contentHash: string, analysis: string) {
    await redis.setex(
      `ai:${contentHash}`,
      86400, // 24 hours TTL
      analysis
    );
  },

  async getAIAnalysis(contentHash: string) {
    return await redis.get(`ai:${contentHash}`);
  },

  // Session management
  async setUserSession(userId: string, sessionData: any) {
    await redis.setex(
      `session:${userId}`,
      1800, // 30 minutes TTL
      JSON.stringify(sessionData)
    );
  },

  async getUserSession(userId: string) {
    const cached = await redis.get(`session:${userId}`);
    return cached ? JSON.parse(cached as string) : null;
  },

  // Track API usage
  async incrementAPIUsage(userId: string, apiName: string) {
    const key = `usage:${userId}:${apiName}:${new Date().toISOString().split('T')[0]}`;
    await redis.incr(key);
    await redis.expire(key, 86400 * 30); // Keep 30 days
  },

  async getAPIUsage(userId: string, apiName: string, date?: string) {
    const dateStr = date || new Date().toISOString().split('T')[0];
    return await redis.get(`usage:${userId}:${apiName}:${dateStr}`) || 0;
  },
};


