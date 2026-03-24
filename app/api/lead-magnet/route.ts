import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isRateLimited, stripHtml, isValidEmail, getClientIp } from '@/lib/api-utils';
import { appendLead } from '@/lib/adminData';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(ip, 'lead-magnet')) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again shortly.' },
        { status: 429 },
      );
    }

    let body: { firstName?: string; email?: string; phone?: string; magnet?: string; locale?: string; result_id?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    // --- Validate firstName ---
    const rawFirst = body?.firstName;
    if (!rawFirst || typeof rawFirst !== 'string') {
      return NextResponse.json(
        { success: false, error: 'First name is required.' },
        { status: 400 },
      );
    }
    const firstName = stripHtml(rawFirst).trim();
    if (firstName.length === 0 || firstName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid first name.' },
        { status: 400 },
      );
    }

    // --- Validate email ---
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

    // --- Validate phone (optional) ---
    let phone = '';
    const rawPhone = body?.phone;
    if (rawPhone && typeof rawPhone === 'string') {
      // Strip all chars except digits, +, (, ), -, and spaces
      phone = rawPhone.replace(/[^\d+() \-]/g, '').trim();
      if (phone.length > 20) {
        phone = phone.substring(0, 20);
      }
    }

    const magnet = stripHtml(String(body?.magnet ?? 'funding-blueprint')).trim();
    const locale = stripHtml(String(body?.locale ?? 'en')).trim();
    const resultId = stripHtml(String(body?.result_id ?? '')).trim();

    // --- Persist lead data ---
    try {
      appendLead({
        timestamp: new Date().toISOString(),
        firstName,
        email,
        phone,
        magnet,
        locale,
        resultId,
        source: 'lead-magnet',
        downloaded: false,
      });
    } catch (err) {
      console.error('[lead-magnet] Data persistence error:', err instanceof Error ? err.message : 'Unknown');
    }

    // --- Resend ---
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[lead-magnet] RESEND_API_KEY is not configured.');
      // Return success to client — lead is still captured in data files
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const resend = new Resend(apiKey);
    const timestamp = new Date().toISOString();
    const pdfUrl = process.env.LEAD_MAGNET_PDF_URL || 'https://veteranbizcoach.com/resources';

    // Email 1 - to user
    await resend.emails.send({
      from: 'T.C. Chambers <tc@veteranbizcoach.com>',
      to: [email],
      subject: 'Your Business Funding Blueprint is inside',
      text: [
        `Hi ${firstName}, here is your copy of the 5-Step Business Funding Blueprint.`,
        `Download here: ${pdfUrl}`,
        '',
        'Most people download this and don\'t act. The ones who do are usually funded within 30 days.',
        'If you want to talk through it, book a free call at veteranbizcoach.com/book.',
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

    // Email 2 - internal notification
    await resend.emails.send({
      from: 'VeteranBizCoach System <tc@veteranbizcoach.com>',
      to: ['tc@veteranbizcoach.com'],
      subject: `New lead magnet download - ${firstName} ${email}`,
      text: `Name: ${firstName}\nEmail: ${email}\nPhone/WhatsApp: ${phone || 'Not provided'}\nMagnet: ${magnet}\nResult ID: ${resultId || 'N/A'}\nLocale: ${locale}\nTime: ${timestamp}`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[lead-magnet] Unexpected error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Submission failed. Please try again.' },
      { status: 500 },
    );
  }
}
