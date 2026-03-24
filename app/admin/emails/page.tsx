'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw,
  Search,
  Mail,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailEntry {
  id: string;
  created_at: string;
  to: string[];
  subject: string;
  last_event?: string;
}

interface EmailsData {
  connected: boolean;
  emails: EmailEntry[];
  total: number;
  openRate: number;
  sentThisWeek: number;
}

function getEmailType(subject: string): { label: string; color: string } {
  const s = (subject || '').toLowerCase();
  if (s.includes('lead magnet') || s.includes('guide') || s.includes('workbook') || s.includes('checklist') || s.includes('blueprint'))
    return { label: 'Lead magnet', color: '#C9A84C' };
  if (s.includes('quiz'))
    return { label: 'Quiz result', color: '#00B4A6' };
  if (s.includes('booking') || s.includes('confirmed') || s.includes('call'))
    return { label: 'Booking confirm', color: '#C9A84C' };
  if (s.includes('notification') || s.includes('new lead'))
    return { label: 'Internal', color: 'rgba(248,249,250,0.4)' };
  if (s.includes('chatbot'))
    return { label: 'Chatbot', color: '#00B4A6' };
  return { label: 'Other', color: 'rgba(248,249,250,0.4)' };
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'opened': return '#C9A84C';
    case 'delivered': return '#00B4A6';
    case 'bounced':
    case 'failed': return '#E53E3E';
    default: return 'rgba(248,249,250,0.3)';
  }
}

export default function AdminEmailsPage() {
  const [data, setData] = useState<EmailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/emails', { credentials: 'include' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Skeleton className="h-8 w-16 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-4 w-28" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Skeleton className="h-[300px] w-full rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20">
        <Mail size={48} className="text-off-white/20 mb-4" />
        <p className="font-body text-[16px] text-white mb-1">Could not load email data</p>
        <p className="font-body text-[14px] text-off-white/40 mb-4">Check your connection and try again.</p>
        <button onClick={fetchData} className="flex items-center gap-2 font-body text-teal hover:underline">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const filteredEmails = search
    ? data.emails.filter(e =>
        e.to?.join(',').toLowerCase().includes(search.toLowerCase()) ||
        e.subject?.toLowerCase().includes(search.toLowerCase())
      )
    : data.emails;

  return (
    <div className="space-y-6">
      {/* Connection status */}
      <div className="flex items-center gap-2">
        {data.connected ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00B4A6' }} />
            <span className="font-body text-[14px]" style={{ color: '#00B4A6' }}>
              Resend Connected
            </span>
          </>
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E53E3E' }} />
            <span className="font-body text-[14px] text-off-white/40">
              Resend API key not configured
            </span>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[36px] text-white leading-none mb-1">{data.total}</p>
          <p className="font-body text-[14px] text-off-white/70">Total Emails Sent</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[36px] text-gold leading-none mb-1">{data.sentThisWeek}</p>
          <p className="font-body text-[14px] text-off-white/70">Emails This Week</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            {data.connected ? (
              <Wifi size={28} className="text-teal" />
            ) : (
              <WifiOff size={28} className="text-off-white/30" />
            )}
            <p className="font-heading font-[800] text-[20px] text-white leading-none">
              {data.connected ? 'Connected' : 'Not Connected'}
            </p>
          </div>
          <p className="font-body text-[14px] text-off-white/70">Connection Status</p>
        </div>
      </div>

      {/* Search */}
      {data.connected && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-off-white/40" />
          <input
            type="text"
            placeholder="Search by email or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full font-body text-[13px] text-off-white placeholder:text-white/30 rounded-lg pl-9 pr-4 py-2 focus:outline-none transition-colors"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>
      )}

      {/* Email log */}
      {!data.connected ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Mail size={48} className="text-off-white/20 mx-auto mb-3" />
          <p className="font-body text-[16px] text-white mb-1">Resend API key not configured</p>
          <p className="font-body text-[14px] text-off-white/40 mb-3">Add your RESEND_API_KEY to see email logs.</p>
          <p className="font-body text-[12px] text-off-white/30">Email tracking requires domain verification in Resend dashboard.</p>
        </div>
      ) : filteredEmails.length > 0 ? (
        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ backgroundColor: '#111827' }}>
                {['Date', 'To', 'Subject', 'Type', 'Status'].map(h => (
                  <th key={h} className="font-body text-[12px] text-off-white/50 font-medium text-left px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmails.map((e, idx) => {
                const emailType = getEmailType(e.subject || '');
                const status = e.last_event || 'sent';
                return (
                  <tr key={e.id || idx} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)' }}>
                    <td className="font-body text-[13px] text-off-white/70 px-4 py-3 whitespace-nowrap">
                      {e.created_at ? new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="font-body text-[13px] text-off-white/80 px-4 py-3">{e.to?.join(', ') || '-'}</td>
                    <td className="font-body text-[13px] text-off-white px-4 py-3 max-w-[300px] truncate">{e.subject || '-'}</td>
                    <td className="font-body text-[13px] px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ backgroundColor: '#1A1A2E', color: emailType.color }}
                      >
                        {emailType.label}
                      </span>
                    </td>
                    <td className="font-body text-[13px] text-off-white/60 px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: statusDotColor(status) }}
                        />
                        <span className="capitalize">{status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Mail size={48} className="text-off-white/20 mx-auto mb-3" />
          <p className="font-body text-[16px] text-white mb-1">No emails found</p>
          <p className="font-body text-[14px] text-off-white/40">Emails will appear here as they are sent through Resend.</p>
        </div>
      )}

      {/* Tracking note */}
      {data.connected && (
        <p className="font-body text-[12px] text-off-white/30">
          Open and click tracking requires Resend tracking to be enabled on your domain. Configure at resend.com/domains.
        </p>
      )}
    </div>
  );
}
