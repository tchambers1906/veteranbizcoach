'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Minus,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Lead {
  id: string;
  timestamp: string;
  firstName: string;
  email: string;
  phone: string;
  magnet: string;
  locale: string;
  resultId: string;
  downloaded: boolean;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

const MAGNET_OPTIONS = [
  { value: 'all', label: 'All Magnets' },
  { value: 'villa-survival-guide', label: 'Villa Guide' },
  { value: 'superpower-discovery-workbook', label: 'Superpower Workbook' },
  { value: 'website-audit-checklist', label: 'Website Checklist' },
  { value: 'business-funding-blueprint', label: 'Funding Blueprint' },
  { value: 'funding-blueprint', label: 'Funding (Homepage)' },
  { value: 'chatbot', label: 'Chatbot' },
  { value: 'footer-signup', label: 'Footer Signup' },
];

const DATE_RANGE_OPTIONS = [
  { value: '7', label: '7d' },
  { value: '30', label: '30d' },
  { value: '90', label: '90d' },
  { value: 'all', label: 'All' },
];

export default function AdminLeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [magnet, setMagnet] = useState('all');
  const [locale, setLocale] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (magnet !== 'all') params.set('magnet', magnet);
      if (locale !== 'all') params.set('locale', locale);
      if (searchDebounced) params.set('search', searchDebounced);
      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        params.set('startDate', start);
      }
      const res = await fetch(`/api/admin/leads?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, magnet, locale, dateRange, searchDebounced]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (magnet !== 'all') params.set('magnet', magnet);
    if (locale !== 'all') params.set('locale', locale);
    if (searchDebounced) params.set('search', searchDebounced);
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      params.set('startDate', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    }
    const res = await fetch(`/api/admin/leads/export?${params}`, { credentials: 'include' });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#1A1A2E',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  // Generate page numbers
  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    if (total > 1) pages.push(total);
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date range pills */}
        <div className="flex items-center gap-1">
          {DATE_RANGE_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => { setDateRange(o.value); setPage(1); }}
              className="font-body text-[13px] px-4 py-2 rounded-lg transition-colors"
              style={
                dateRange === o.value
                  ? { backgroundColor: '#C9A84C', color: '#0A1628', fontWeight: 600 }
                  : { backgroundColor: '#1A1A2E', color: 'rgba(248,249,250,0.7)' }
              }
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Magnet filter */}
        <select
          value={magnet}
          onChange={(e) => { setMagnet(e.target.value); setPage(1); }}
          className="font-body text-[13px] text-off-white rounded-lg px-3 py-2 focus:outline-none"
          style={selectStyle}
        >
          {MAGNET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Locale filter */}
        <select
          value={locale}
          onChange={(e) => { setLocale(e.target.value); setPage(1); }}
          className="font-body text-[13px] text-off-white rounded-lg px-3 py-2 focus:outline-none"
          style={selectStyle}
        >
          <option value="all">All Locales</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="id">Indonesian</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/40" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full font-body text-[13px] text-off-white placeholder:text-white/30 rounded-lg pl-9 pr-4 py-2 focus:outline-none transition-colors"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>

        {/* Export CSV */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 font-body text-[13px] text-white rounded-lg px-4 py-2 transition-colors hover:bg-teal/10"
          style={{ border: '1px solid rgba(0,180,166,0.4)' }}
        >
          <Download size={14} className="text-teal" /> Export CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: '#111827' }}>
            <Skeleton className="h-4 w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="px-4 py-3" style={{ backgroundColor: i % 2 === 0 ? '#0A1628' : '#1A1A2E' }}>
              <Skeleton className="h-4 w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 rounded-xl" style={{ backgroundColor: '#1A1A2E' }}>
          <RefreshCw size={48} className="text-off-white/20 mb-4" />
          <p className="font-body text-[16px] text-white mb-1">Could not load leads</p>
          <p className="font-body text-[14px] text-off-white/40 mb-4">Check your connection and try again.</p>
          <button onClick={fetchLeads} className="flex items-center gap-2 font-body text-teal hover:underline">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      ) : data && data.leads.length > 0 ? (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full min-w-[800px]">
            <thead>
              <tr style={{ backgroundColor: '#111827' }}>
                {['Date', 'Name', 'Email', 'Phone', 'Magnet', 'Locale', 'Result', 'Downloaded'].map(h => (
                  <th key={h} className="font-body text-[12px] text-off-white/50 font-medium text-left px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.leads.map((lead, idx) => (
                <React.Fragment key={lead.id}>
                  <tr
                    onClick={() => setExpandedRow(expandedRow === lead.id ? null : lead.id)}
                    className="cursor-pointer hover:bg-white/[0.03] transition-colors"
                    style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)' }}
                  >
                    <td className="font-body text-[13px] text-off-white/70 px-4 py-3 whitespace-nowrap">
                      {new Date(lead.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="font-body text-[14px] text-off-white px-4 py-3">{lead.firstName || '-'}</td>
                    <td className="font-body text-[13px] text-off-white/80 px-4 py-3">{lead.email}</td>
                    <td className="font-body text-[13px] text-off-white/60 px-4 py-3">{lead.phone || '-'}</td>
                    <td className="font-body text-[13px] text-gold/80 px-4 py-3">{lead.magnet}</td>
                    <td className="font-body text-[13px] text-off-white/50 px-4 py-3 uppercase">{lead.locale}</td>
                    <td className="font-body text-[13px] text-off-white/60 px-4 py-3">{lead.resultId || '-'}</td>
                    <td className="px-4 py-3">
                      {lead.downloaded
                        ? <CheckCircle2 size={16} className="text-teal" />
                        : <Minus size={16} className="text-off-white/20" />
                      }
                    </td>
                  </tr>
                  {expandedRow === lead.id && (
                    <tr style={{ backgroundColor: '#111827' }}>
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-body text-[13px]">
                          <div>
                            <span className="text-off-white/40 block text-[11px] uppercase tracking-wider mb-1">Full Timestamp</span>
                            <span className="text-off-white">{new Date(lead.timestamp).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-off-white/40 block text-[11px] uppercase tracking-wider mb-1">Phone</span>
                            <span className="text-off-white">{lead.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-off-white/40 block text-[11px] uppercase tracking-wider mb-1">Result ID</span>
                            <span className="text-off-white">{lead.resultId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-off-white/40 block text-[11px] uppercase tracking-wider mb-1">Downloaded</span>
                            <span className="text-off-white">{lead.downloaded ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: '#1A1A2E' }}>
          <Users size={48} className="text-off-white/20 mb-3" />
          <p className="font-body text-[16px] text-white mb-1">No leads captured yet</p>
          <p className="font-body text-[14px] text-off-white/40">Share your quiz links to start building your list.</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-body text-[13px] text-off-white/50">
            Showing {((data.page - 1) * 25) + 1}–{Math.min(data.page * 25, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={data.page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg text-off-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#1A1A2E' }}
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers(data.page, data.totalPages).map((pn, i) =>
              typeof pn === 'string' ? (
                <span key={`ellipsis-${i}`} className="px-2 font-body text-[13px] text-off-white/30">...</span>
              ) : (
                <button
                  key={pn}
                  onClick={() => setPage(pn)}
                  className="font-body text-[13px] w-8 h-8 rounded-lg transition-colors"
                  style={
                    pn === data.page
                      ? { backgroundColor: '#C9A84C', color: '#0A1628', fontWeight: 600 }
                      : { backgroundColor: '#1A1A2E', color: 'rgba(248,249,250,0.6)' }
                  }
                >
                  {pn}
                </button>
              ),
            )}
            <button
              disabled={data.page >= data.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg text-off-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#1A1A2E' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
