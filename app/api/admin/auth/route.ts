import { NextResponse } from 'next/server';
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  isLoginRateLimited,
  recordLoginAttempt,
} from '@/lib/adminAuth';
import { getClientIp } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate limit check
    if (isLoginRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 },
      );
    }

    let body: { password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 },
      );
    }

    const password = body?.password;
    if (!password || typeof password !== 'string') {
      recordLoginAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 },
      );
    }

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
      console.error('[admin/auth] ADMIN_PASSWORD or ADMIN_SESSION_SECRET not configured.');
      return NextResponse.json(
        { success: false, error: 'Admin access is not configured.' },
        { status: 500 },
      );
    }

    if (!verifyPassword(password)) {
      recordLoginAttempt(ip, false);
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 },
      );
    }

    // Success
    recordLoginAttempt(ip, true);
    const token = createSessionToken();
    const response = NextResponse.json({ success: true }, { status: 200 });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error('[admin/auth] Unexpected error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Authentication failed.' },
      { status: 500 },
    );
  }
}
