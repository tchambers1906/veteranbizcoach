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
      page: 1,
      limit: 999999, // Get all for export
    };

    const { leads } = getLeads(filters);
    const date = new Date().toISOString().split('T')[0];

    // Build CSV
    const headers = ['date', 'firstName', 'email', 'phone', 'magnet', 'locale', 'result_id', 'downloaded'];
    const rows = leads.map(l => [
      l.timestamp,
      `"${(l.firstName || '').replace(/"/g, '""')}"`,
      l.email,
      l.phone || '',
      l.magnet,
      l.locale,
      l.resultId || '',
      l.downloaded ? 'yes' : 'no',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${date}.csv"`,
      },
    });
  } catch (err) {
    console.error('[admin/leads/export]', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Could not export leads.' }, { status: 500 });
  }
}
