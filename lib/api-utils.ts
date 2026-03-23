/**
 * Shared utilities for API routes: rate limiting, validation, sanitisation.
 */

/* ------------------------------------------------------------------ */
/*  Rate limiter (in-memory, per-route key namespace)                 */
/* ------------------------------------------------------------------ */

const stores = new Map<string, Map<string, number[]>>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_HITS = 5;

function getStore(namespace: string): Map<string, number[]> {
  if (!stores.has(namespace)) stores.set(namespace, new Map());
  return stores.get(namespace)!;
}

export function isRateLimited(ip: string, namespace: string): boolean {
  const store = getStore(namespace);
  const now = Date.now();
  const timestamps = store.get(ip) ?? [];
  const recent = timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (recent.length >= MAX_HITS) {
    store.set(ip, recent);
    return true;
  }

  recent.push(now);
  store.set(ip, recent);
  return false;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}
