import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Redis is available
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 503 }
      );
    }

    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const today = new Date().toISOString().split('T')[0];

    // Get cache statistics
    const [cacheHits, cacheMisses] = await Promise.all([
      redis.get(`stats:cache:hits:${today}`) || 0,
      redis.get(`stats:cache:misses:${today}`) || 0,
    ]);

    const totalRequests = (cacheHits as number) + (cacheMisses as number);
    const hitRate = totalRequests > 0 ? ((cacheHits as number) / totalRequests) * 100 : 0;

    // Get all keys to count cached items
    const keys = await redis.keys('*');
    const cachedGenerations = keys.filter((k: string) => k.startsWith('generation:')).length;
    const cachedGeometry = keys.filter((k: string) => k.startsWith('geometry:')).length;
    const cachedCompliance = keys.filter((k: string) => k.startsWith('compliance:')).length;
    const cachedAI = keys.filter((k: string) => k.startsWith('ai:')).length;

    return NextResponse.json({
      totalGenerations: cachedGenerations,
      cacheHitRate: hitRate,
      avgResponseTime: hitRate > 50 ? 1.2 : 3.5, // Estimated based on cache hit rate
      cacheBreakdown: {
        generations: cachedGenerations,
        geometry: cachedGeometry,
        compliance: cachedCompliance,
        aiAnalysis: cachedAI,
      },
      stats: {
        hits: cacheHits,
        misses: cacheMisses,
        total: totalRequests,
      },
    });
  } catch (error) {
    console.error('Failed to fetch cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache stats' },
      { status: 500 }
    );
  }
}

