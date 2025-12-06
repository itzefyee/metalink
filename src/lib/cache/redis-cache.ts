import { redis } from "../../../lib/redis";

/**
 * Get cached value or compute and cache it
 */
export async function getCached<T>(
  key: string,
  computeFn: () => Promise<T>,
  ttl: number = 3600 // Default 1 hour
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Cache HIT for key: ${key}`);
      return JSON.parse(cached as string) as T;
    }

    console.log(`❌ Cache MISS for key: ${key}`);
    
    // Compute value
    const value = await computeFn();
    
    // Cache it
    await redis.setex(key, ttl, JSON.stringify(value));
    
    return value;
  } catch (error) {
    console.error('Redis cache error, computing without cache:', error);
    // If Redis fails, just compute without caching
    return computeFn();
  }
}

/**
 * Invalidate cache by key
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating cache pattern:', error);
  }
}

