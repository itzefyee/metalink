# Redis Caching Setup Guide

## Overview

Metalink uses **Upstash Redis** for high-performance caching and rate limiting. Redis integration is **optional** - the application will work without it, but you'll benefit from:

- ✅ **10x faster responses** - Cache hits return in <10ms
- ✅ **70% cost reduction** - Reduces API calls to external services
- ✅ **Rate limiting** - Prevents abuse and manages API quotas
- ✅ **Session management** - Fast chat history access

## What Gets Cached?

| Data Type | TTL | Purpose |
|-----------|-----|---------|
| CAD Generations | 1 hour | Identical requests return instantly |
| STEP Geometry | 1 hour | Expensive OpenCascade parsing |
| Compliance Results | 2 hours | Standards validation |
| AI Analysis | 24 hours | Most expensive operation |
| Chat Sessions | 30 min | Fast message history |

## Setup Instructions

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in (free tier available)
3. Click **Create Database**
4. Choose:
   - **Name:** metalink-cache
   - **Type:** Regional
   - **Region:** Closest to your users
   - **TLS:** Enabled
5. Click **Create**

### 2. Get Connection Details

After creating the database:

1. Go to your database dashboard
2. Scroll to **REST API** section
3. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Configure Environment Variables

#### For Local Development (`.env.local`)

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

#### For Convex Backend

1. Open [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add both variables:
   - Key: `UPSTASH_REDIS_REST_URL`, Value: `https://...`
   - Key: `UPSTASH_REDIS_REST_TOKEN`, Value: `...`
5. Click **Save**

#### For Production (Vercel)

1. Open Vercel Dashboard
2. Go to your project > **Settings** > **Environment Variables**
3. Add both variables for all environments
4. Redeploy

## Rate Limits

Default limits (configurable in `lib/redis.ts`):

| Service | Limit |
|---------|-------|
| CAD Generation | 10 per hour |
| AI Analysis | 20 per hour |
| Chatbot | 50 messages per hour |

## Monitoring

Check Redis usage:

```bash
# Install Upstash CLI
npm install -g @upstash/cli

# Connect to your database
upstash redis connect

# View keys
KEYS *

# Check cache hit rate
INFO stats

# View specific cached generation
GET generation:abc123...
```

## Cache Debugging

To see cache hits/misses in your logs:

```bash
# Run Convex dev mode
npx convex dev

# Watch for cache messages
# ✅ Cache HIT for CAD generation
# ❌ Cache MISS - Generating new CAD
```

## Troubleshooting

### App works without Redis
If Redis credentials are missing or invalid, the app gracefully falls back to no caching. You'll see:
```
Redis not available, proceeding without cache
```

### Clear all cache
```bash
# Using Upstash CLI
FLUSHALL

# Or via REST API
curl -X POST https://your-redis-url.upstash.io/flushall \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Rate limit exceeded
Users will see error messages:
```
Rate limit exceeded. 0/10 requests remaining. Reset in 3600s
```

## Cost Optimization

Upstash charges per:
- **Commands:** 100K free per day
- **Storage:** 256MB free

**Estimated usage:**
- 1 generation = ~5 commands (cache check + store + usage tracking)
- 100 generations/day = 500 commands
- Well within free tier for hackathons/demos

## Production Best Practices

1. **Enable TLS** - Already enabled by default
2. **Set appropriate TTLs** - Balance freshness vs hit rate
3. **Monitor memory usage** - Upstash dashboard shows usage
4. **Use Redis for hot data** - Convex for cold storage
5. **Implement cache warming** - Pre-cache common requests

## Disabling Redis

To run without Redis:
1. Simply don't set the environment variables
2. App will automatically skip all caching/rate limiting
3. All features remain functional (just slower/more expensive)

## Support

- [Upstash Docs](https://docs.upstash.com/)
- [Upstash Discord](https://discord.gg/upstash)
- Check `lib/redis.ts` for implementation details

