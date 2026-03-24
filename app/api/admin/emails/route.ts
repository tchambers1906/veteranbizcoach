import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: Request) {
  if (!(await verifyAdminSession(request))) return unauthorizedResponse();

  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        connected: false,
        emails: [],
        total: 0,
        openRate: 0,
        sentThisWeek: 0,
      }, { status: 200 });
    }

    // Fetch emails from Resend API
    const res = await fetch('https://api.resend.com/emails', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('[admin/emails] Resend API error:', res.status);
      return NextResponse.json({
        connected: false,
        emails: [],
        total: 0,
        openRate: 0,
        sentThisWeek: 0,
      }, { status: 200 });
    }

    const data = await res.json();
    const emails = Array.isArray(data?.data) ? data.data : [];

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sentThisWeek = emails.filter((e: { created_at?: string }) =>
      e.created_at && new Date(e.created_at) >= weekAgo
    ).length;

    return NextResponse.json({
      connected: true,
      emails: emails.slice(0, 100),
      total: emails.length,
      openRate: 0, // Resend requires domain tracking config
      sentThisWeek,
    }, { status: 200 });
  } catch (err) {
    console.error('[admin/emails]', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({
      connected: false,
      emails: [],
      total: 0,
      openRate: 0,
      sentThisWeek: 0,
    }, { status: 200 });
  }
}
