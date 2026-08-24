type Bucket = { fails: number; firstAt: number; blockedUntil: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const BLOCK_MS = 15 * 60 * 1000;

function key(ip: string, email: string) {
  return `${ip}|${email.toLowerCase()}`;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function assertLoginAllowed(ip: string, email: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key(ip, email));
  if (!bucket) return { ok: true };
  if (bucket.blockedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.blockedUntil - now) / 1000) };
  }
  if (now - bucket.firstAt > WINDOW_MS) {
    buckets.delete(key(ip, email));
  }
  return { ok: true };
}

export function recordLoginFailure(ip: string, email: string) {
  const now = Date.now();
  const id = key(ip, email);
  const current = buckets.get(id);
  if (!current || now - current.firstAt > WINDOW_MS) {
    buckets.set(id, { fails: 1, firstAt: now, blockedUntil: 0 });
    return;
  }
  current.fails += 1;
  if (current.fails >= MAX_FAILS) {
    current.blockedUntil = now + BLOCK_MS;
  }
  buckets.set(id, current);
}

export function recordLoginSuccess(ip: string, email: string) {
  buckets.delete(key(ip, email));
}
