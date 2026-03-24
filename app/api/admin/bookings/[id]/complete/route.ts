import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/adminAuth';
import { updateBookingStatus } from '@/lib/adminData';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminSession(request))) return unauthorizedResponse();

  try {
    const { id } = await params;
    const success = updateBookingStatus(id, 'completed');

    if (!success) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[admin/bookings/complete]', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Could not update booking.' }, { status: 500 });
  }
}
