import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { appendLead } from '@/lib/adminData';

// ---------------------------------------------------------------------------
// Rate-limit store (in-memory – resets on cold start, which is acceptable for
// a low-traffic marketing site). Key = IP, Value = array of request timestamps
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];

  // Discard entries older than the window
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  // RFC-5322 simplified – good enough for a lead-magnet form
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed);
}

// ---------------------------------------------------------------------------
// POST /api/footer-email
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    // --- IP extraction (works behind most proxies / Vercel / K8s) ----------
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // --- Rate limiting -----------------------------------------------------
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again shortly.' },
        { status: 429 },
      );
    }

    // --- Parse & validate body ---------------------------------------------
    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const rawEmail = body?.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 },
      );
    }

    // Sanitize
    const email = stripHtml(rawEmail).trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    // --- Persist lead data ---
    try {
      appendLead({
        timestamp: new Date().toISOString(),
        firstName: '',
        email,
        phone: '',
        magnet: 'footer-signup',
        locale: 'en',
        resultId: '',
        source: 'footer',
        downloaded: false,
      });
    } catch (err) {
      console.error('[footer-email] Data persistence error:', err instanceof Error ? err.message : 'Unknown');
    }

    // --- Resend integration ------------------------------------------------
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[footer-email] RESEND_API_KEY is not configured.');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const resend = new Resend(apiKey);
    const timestamp = new Date().toISOString();

    // Email 1 – Confirmation to the subscriber
    await resend.emails.send({
      from: 'T.C. Chambers <tc@veteranbizcoach.com>',
      to: [email],
      subject: 'Your free funding blueprint is on its way',
      text: [
        'Thanks for reaching out. Your copy of the 5-Step Business Funding Blueprint is coming shortly.',
        'In the meantime, you can book a free strategy call at veteranbizcoach.com/book.',
        '',
        'T.C. Chambers',
        'AI-First Business Success Strategist',
        'veteranbizcoach.com',
        '',
        '---',
        'For educational purposes only. Results vary based on individual circumstances.',
        "To unsubscribe, reply with 'unsubscribe'.",
      ].join('\n'),
    });

    // Email 2 – Internal notification
    await resend.emails.send({
      from: 'VeteranBizCoach System <tc@veteranbizcoach.com>',
      to: ['tc@veteranbizcoach.com'],
      subject: `New footer email signup - ${email}`,
      text: `Email: ${email}\nSource: footer form\nTime: ${timestamp}`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    // Log server-side for debugging – never expose to client
    console.error('[footer-email] Unexpected error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Submission failed. Please try again.' },
      { status: 500 },
    );
  }
}
