import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isRateLimited, stripHtml, isValidEmail, getClientIp } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(ip, 'chatbot-lead')) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again shortly.' },
        { status: 429 },
      );
    }

    let body: { email?: string; context?: string; locale?: string };
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

    const context = stripHtml(String(body?.context ?? '')).trim();
    const locale = stripHtml(String(body?.locale ?? 'en')).trim();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[chatbot-lead] RESEND_API_KEY is not configured.');
      return NextResponse.json(
        { success: false, error: 'Submission failed. Please try again.' },
        { status: 500 },
      );
    }

    const resend = new Resend(apiKey);
    const timestamp = new Date().toISOString();

    await resend.emails.send({
      from: 'T.C. Chambers <tc@veteranbizcoach.com>',
      to: [email],
      subject: 'Got it. T.C. will be in touch',
      text: [
        'Thanks for reaching out. T.C. or a team member will follow up shortly.',
        'In the meantime, book directly at veteranbizcoach.com/book.',
        '',
        'T.C. Chambers',
        'veteranbizcoach.com',
      ].join('\n'),
    });

    await resend.emails.send({
      from: 'VeteranBizCoach System <tc@veteranbizcoach.com>',
      to: ['tc@veteranbizcoach.com'],
      subject: `New chatbot lead - ${email}`,
      text: `Email: ${email}\nContext: ${context}\nLocale: ${locale}\nTime: ${timestamp}`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[chatbot-lead] Unexpected error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Submission failed. Please try again.' },
      { status: 500 },
    );
  }
}
