import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/adminAuth';
import { getLeads } from '@/lib/adminData';

export async function GET(request: Request) {
  if (!(await verifyAdminSession(request))) return unauthorizedResponse();

  try {
    const url = new URL(request.url);
    const filters = {
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      magnet: url.searchParams.get('magnet') || undefined,
      locale: url.searchParams.get('locale') || undefined,
      search: url.searchParams.get('search') || undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 25,
    };

    const result = getLeads(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[admin/leads]', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Could not load leads.' }, { status: 500 });
  }
}
