import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isRateLimited, stripHtml, isValidEmail, getClientIp } from '@/lib/api-utils';
import { appendLead } from '@/lib/adminData';

const PILLAR_LABELS: Record<string, string> = {
  superpower: 'Superpower Program',
  funding: 'Funding & Structuring',
  website: 'Websites & PWAs',
  'ai-strategy': 'AI Strategy',
  villa: 'Villa Booking Traffic',
  strategy: 'General Business Strategy',
};

const PILLAR_CTAS: Record<string, string> = {
  superpower: 'Join the Superpower Waitlist at veteranbizcoach.com/resources?waitlist=superpower',
  funding: 'Book a Funding Discovery Call at veteranbizcoach.com/book?session=funding',
  website: 'Book a Website/PWA Discovery Call at veteranbizcoach.com/book?session=website',
  'ai-strategy': 'Book an AI Strategy Session at veteranbizcoach.com/book?session=ai-strategy',
  villa: 'Book a Villa Traffic Strategy Call at veteranbizcoach.com/book?session=villa',
  strategy: 'Book a Free Strategy Call at veteranbizcoach.com/book?session=strategy',
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(ip, 'quiz-lead')) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again shortly.' },
        { status: 429 },
      );
    }

    let body: { email?: string; result_pillar?: string; locale?: string };
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
    const email = stripHtml(rawEmail).trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    const resultPillar = stripHtml(String(body?.result_pillar ?? 'strategy')).trim();
    const locale = stripHtml(String(body?.locale ?? 'en')).trim();
    const pillarLabel = PILLAR_LABELS[resultPillar] || 'General Business Strategy';
    const pillarCta = PILLAR_CTAS[resultPillar] || PILLAR_CTAS.strategy;

    // --- Persist lead data ---
    try {
      appendLead({
        timestamp: new Date().toISOString(),
        firstName,
        email,
        phone: '',
        magnet: `quiz-${resultPillar}`,
        locale,
        resultId: resultPillar,
        source: 'quiz-lead',
        downloaded: false,
      });
    } catch (err) {
      console.error('[quiz-lead] Data persistence error:', err instanceof Error ? err.message : 'Unknown');
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[quiz-lead] RESEND_API_KEY is not configured.');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const resend = new Resend(apiKey);
    const timestamp = new Date().toISOString();

    // Email 1 - to user
    await resend.emails.send({
      from: 'T.C. Chambers <tc@veteranbizcoach.com>',
      to: [email],
      subject: 'Your Business Readiness Quiz Result',
      text: [
        `Here is your result: ${pillarLabel}.`,
        `Based on your answers, the recommended next step is: ${pillarCta}.`,
        '',
        'T.C. Chambers',
        'veteranbizcoach.com',
        '',
        '---',
        'For educational purposes only. Results vary based on individual circumstances.',
        "To unsubscribe, reply with 'unsubscribe'.",
      ].join('\n'),
    });

    // Email 2 - internal notification
    await resend.emails.send({
      from: 'VeteranBizCoach System <tc@veteranbizcoach.com>',
      to: ['tc@veteranbizcoach.com'],
      subject: `New quiz lead - ${email} - Result: ${resultPillar}`,
      text: `Email: ${email}\nResult Pillar: ${resultPillar}\nLocale: ${locale}\nTime: ${timestamp}`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[quiz-lead] Unexpected error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Submission failed. Please try again.' },
      { status: 500 },
    );
  }
}
