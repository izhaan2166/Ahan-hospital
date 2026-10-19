import "server-only";

/**
 * Caps how many appointment requests one visitor can send, so a bot cannot
 * flood the hospital's inbox. Counts live in server memory: they reset when
 * the server restarts and are per instance, which is enough for one server.
 * A multi-instance deployment would need a shared store such as Redis.
 */

export interface RateLimiter {
  /** Records one attempt and returns whether it is allowed. */
  take(key: string, now?: number): { allowed: true } | { allowed: false; retryAfterSeconds: number };
}

export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: { limit: number; windowMs: number; maxKeys?: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    take(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000) };
      }
      recent.push(now);
      hits.delete(key);
      hits.set(key, recent);
      // Drop the oldest visitor once the map is full, so memory stays bounded.
      if (hits.size > maxKeys) hits.delete(hits.keys().next().value!);
      return { allowed: true };
    },
  };
}

/** Five bookings per visitor per hour. */
export const appointmentRateLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

/** The visitor's IP from the proxy headers set by the host, or "unknown". */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
