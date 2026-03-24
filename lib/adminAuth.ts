/**
 * Admin authentication utilities.
 * Session signing/verification using HMAC-SHA256.
 * Cookie management for admin_session.
 *
 * PRODUCTION HARDENING NOTES:
 * - Rate limiting is in-memory and resets on server restart.
 *   For production, use Redis or similar persistent store.
 * - Session tokens are HMAC-signed, not encrypted.
 *   For production with sensitive data, consider JWT with encryption.
 */

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 86400; // 24 hours

/* ------------------------------------------------------------------ */
/*  Login rate limiter (in-memory, resets on restart)                  */
/* ------------------------------------------------------------------ */

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt) return false;

  // Check if locked out
  if (attempt.lockedUntil > now) return true;

  // Reset if window expired
  if (now - attempt.firstAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }

  return attempt.count >= MAX_LOGIN_ATTEMPTS;
}

export function recordLoginAttempt(ip: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }

  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now - attempt.firstAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lockedUntil: 0,
    });
    return;
  }

  attempt.count += 1;
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  loginAttempts.set(ip, attempt);
}

/* ------------------------------------------------------------------ */
/*  Password verification (timing-safe)                               */
/* ------------------------------------------------------------------ */

export function verifyPassword(inputPassword: string): boolean {
  const storedPassword = process.env.ADMIN_PASSWORD;
  if (!storedPassword || !inputPassword) return false;

  const inputBuf = Buffer.from(inputPassword);
  const storedBuf = Buffer.from(storedPassword);

  if (inputBuf.length !== storedBuf.length) {
    // Do a timing-safe compare anyway to avoid leaking length info
    // Use a fixed-length buffer for both
    const maxLen = Math.max(inputBuf.length, storedBuf.length);
    const a = Buffer.alloc(maxLen);
    const b = Buffer.alloc(maxLen);
    inputBuf.copy(a);
    storedBuf.copy(b);
    crypto.timingSafeEqual(a, b);
    return false;
  }

  return crypto.timingSafeEqual(inputBuf, storedBuf);
}

/* ------------------------------------------------------------------ */
/*  Session token signing & verification                              */
/* ------------------------------------------------------------------ */

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return secret;
}

export function createSessionToken(): string {
  const secret = getSecret();
  const payload = JSON.stringify({
    sub: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  });

  const payloadBase64 = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const secret = getSecret();
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return false;

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');

    // Timing-safe signature comparison
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    // Check expiry
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (payload.sub !== 'admin') return false;

    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Cookie helpers                                                    */
/* ------------------------------------------------------------------ */

export function setSessionCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
}

/* ------------------------------------------------------------------ */
/*  API route session verification                                    */
/* ------------------------------------------------------------------ */

export async function verifyAdminSession(request: Request): Promise<boolean> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return false;
    return verifySessionToken(match[1]);
  } catch {
    return false;
  }
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 },
  );
}
