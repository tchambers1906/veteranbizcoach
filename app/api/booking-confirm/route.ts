import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { appendBooking } from '@/lib/adminData';

/**
 * POST /api/booking-confirm
 * Calendly webhook receiver for booking confirmations.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ error: 'Empty request body.' }, { status: 400 });
    }

    // --- Webhook signature verification ---
    const secret = process.env.CALENDLY_WEBHOOK_SECRET;
    if (secret) {
      const signature = request.headers.get('x-calendly-webhook-signature') ||
                        request.headers.get('Calendly-Webhook-Signature') || '';

      // Calendly signs: t=<timestamp>,v1=<signature>
      const parts = signature.split(',');
      const tPart = parts.find((p) => p.startsWith('t='));
      const v1Part = parts.find((p) => p.startsWith('v1='));

      if (!tPart || !v1Part) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
      }

      const timestamp = tPart.replace('t=', '');
      const providedSig = v1Part.replace('v1=', '');
      const toSign = `${timestamp}.${rawBody}`;
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(toSign)
        .digest('hex');

      if (providedSig !== expectedSig) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
      }
    }

    // --- Parse body ---
    let body: {
      event?: string;
      payload?: {
        event_type?: { name?: string };
        invitee?: { name?: string; email?: string };
        scheduled_event?: { start_time?: string };
      };
    };

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const inviteeName = body?.payload?.invitee?.name || 'Guest';
    const inviteeEmail = body?.payload?.invitee?.email;
    const eventType = body?.payload?.event_type?.name || 'Strategy Session';
    const startTime = body?.payload?.scheduled_event?.start_time;

    if (!inviteeEmail) {
      return NextResponse.json({ error: 'Missing invitee email.' }, { status: 400 });
    }

    // --- Persist booking data ---
    try {
      appendBooking({
        timestamp: new Date().toISOString(),
        name: inviteeName,
        email: inviteeEmail,
        sessionType: eventType,
        startTime: startTime || '',
        bookedAt: new Date().toISOString(),
        status: 'confirmed',
        event: body?.event || 'invitee.created',
      });
    } catch (err) {
      console.error('[booking-confirm] Data persistence error:', err instanceof Error ? err.message : 'Unknown');
    }

    // Format date/time
    let formattedTime = startTime || 'TBD';
    if (startTime) {
      try {
        formattedTime = new Date(startTime).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        });
      } catch {
        formattedTime = startTime;
      }
    }

    // --- Send emails via Resend ---
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_EMAIL_FROM || 'T.C. Chambers <tc@veteranbizcoach.com>';

    if (!apiKey) {
      console.error('[booking-confirm] RESEND_API_KEY is not configured.');
      return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const timestamp = new Date().toISOString();

    // Email 1 - confirmation to invitee
    await resend.emails.send({
      from: fromAddress,
      to: [inviteeEmail],
      subject: 'Your call with T.C. Chambers is confirmed',
      text: [
        `Hi ${inviteeName}, your ${eventType} is confirmed for ${formattedTime}.`,
        '',
        'Come ready to talk about your business. T.C. will come ready with ideas.',
        '',
        'Add to your calendar using the link in your original Calendly confirmation email.',
        '',
        'T.C. Chambers',
        'veteranbizcoach.com',
      ].join('\n'),
    });

    // Email 2 - internal notification
    await resend.emails.send({
      from: fromAddress.includes('<') ? fromAddress.replace(/.*</, 'VeteranBizCoach System <').replace(/>.*/, '>') : `VeteranBizCoach System <${fromAddress}>`,
      to: ['tc@veteranbizcoach.com'],
      subject: `New call booked - ${inviteeName} - ${eventType}`,
      text: `Name: ${inviteeName}\nEmail: ${inviteeEmail}\nType: ${eventType}\nTime: ${formattedTime}\nBooked at: ${timestamp}`,
    });

    // --- Server-side PostHog event (optional) ---
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      try {
        const phRes = await fetch(
          `${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'}/capture/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
              event: 'call_booked',
              distinct_id: inviteeEmail,
              properties: {
                session_type: eventType,
                source: 'calendly_webhook',
              },
            }),
          },
        );
        if (!phRes.ok) {
          console.error('[booking-confirm] PostHog capture failed:', phRes.status);
        }
      } catch {
        // PostHog failure is non-fatal
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[booking-confirm] Unexpected error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
