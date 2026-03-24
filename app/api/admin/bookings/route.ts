import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/adminAuth';
import { getBookings } from '@/lib/adminData';

export async function GET(request: Request) {
  if (!(await verifyAdminSession(request))) return unauthorizedResponse();

  try {
    const bookings = getBookings();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = bookings.length;
    const thisWeek = bookings.filter(b => new Date(b.timestamp) >= weekAgo).length;

    // Most booked session type
    const typeCounts: Record<string, number> = {};
    for (const b of bookings) {
      typeCounts[b.sessionType] = (typeCounts[b.sessionType] || 0) + 1;
    }
    let mostBooked = 'N/A';
    let maxCount = 0;
    for (const [t, c] of Object.entries(typeCounts)) {
      if (c > maxCount) { maxCount = c; mostBooked = t; }
    }

    // Distribution by session type
    const byType = Object.entries(typeCounts).map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      total,
      thisWeek,
      mostBooked,
      noShowRate: 'N/A',
      byType,
      bookings,
    }, { status: 200 });
  } catch (err) {
    console.error('[admin/bookings]', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Could not load bookings.' }, { status: 500 });
  }
}
