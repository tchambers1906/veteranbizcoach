import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/adminAuth';
import { getStats } from '@/lib/adminData';

export async function GET(request: Request) {
  if (!(await verifyAdminSession(request))) return unauthorizedResponse();

  try {
    const stats = getStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (err) {
    console.error('[admin/stats]', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      { error: 'Could not load stats.' },
      { status: 500 },
    );
  }
}
