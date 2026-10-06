import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Fallback logic in case Upstash is not yet configured
let redis: Redis | null = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes('placeholder')) {
    redis = Redis.fromEnv()
  }
} catch (e) {
  console.warn('Upstash Redis is not configured properly. Rate limiting will be disabled.')
}

// 10 requests per 15 minutes
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
    })
  : null
