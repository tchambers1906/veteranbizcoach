'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Check,
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  X,
  StickyNote,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Booking {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  sessionType: string;
  startTime: string;
  bookedAt: string;
  status: string;
}

interface BookingsData {
  total: number;
  thisWeek: number;
  mostBooked: string;
  noShowRate: string;
  byType: { name: string; count: number }[];
  bookings: Booking[];
}

function getStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'confirmed':
      return { backgroundColor: '#00B4A6', color: '#FFFFFF' };
    case 'completed':
      return { backgroundColor: '#C9A84C', color: '#0A1628' };
    case 'cancelled':
      return { backgroundColor: '#E53E3E', color: '#FFFFFF' };
    default:
      return { backgroundColor: 'rgba(255,255,255,0.1)', color: '#F8F9FA' };
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminBookingsPage() {
  const [data, setData] = useState<BookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_booking_notes');
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, []);

  const saveNote = (bookingId: string) => {
    const updated = { ...notes, [bookingId]: noteText };
    setNotes(updated);
    localStorage.setItem('admin_booking_notes', JSON.stringify(updated));
    setEditingNote(null);
    setNoteText('');
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/bookings', { credentials: 'include' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/admin/bookings/${id}/complete`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) fetchData();
  };

  // Bookings by date for calendar
  const bookingsByDate = useMemo(() => {
    if (!data) return {};
    const map: Record<string, Booking[]> = {};
    for (const b of data.bookings) {
      const date = new Date(b.startTime || b.timestamp).toISOString().split('T')[0];
      if (!map[date]) map[date] = [];
      map[date].push(b);
    }
    return map;
  }, [data]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days: { date: string; day: number; inMonth: boolean }[] = [];

    // Previous month padding
    const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
    const prevYear = calMonth === 0 ? calYear - 1 : calYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, inMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, inMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
    const nextYear = calMonth === 11 ? calYear + 1 : calYear;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, inMonth: false });
    }

    return days;
  }, [calYear, calMonth]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <Skeleton className="h-9 w-28 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
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

  if (error || !data) {
    return (
      <div className="flex flex-col items-center py-20">
        <CalIcon size={48} className="text-off-white/20 mb-4" />
        <p className="font-body text-[16px] text-white mb-1">Could not load bookings</p>
        <p className="font-body text-[14px] text-off-white/40 mb-4">Check your connection and try again.</p>
        <button onClick={fetchData} className="flex items-center gap-2 font-body text-teal hover:underline">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('table')}
          className="font-body text-[13px] px-5 py-2 rounded-lg transition-colors"
          style={view === 'table'
            ? { backgroundColor: '#C9A84C', color: '#0A1628', fontWeight: 600 }
            : { backgroundColor: '#1A1A2E', color: 'rgba(248,249,250,0.7)' }
          }
        >
          Table View
        </button>
        <button
          onClick={() => setView('calendar')}
          className="font-body text-[13px] px-5 py-2 rounded-lg transition-colors"
          style={view === 'calendar'
            ? { backgroundColor: '#C9A84C', color: '#0A1628', fontWeight: 600 }
            : { backgroundColor: '#1A1A2E', color: 'rgba(248,249,250,0.7)' }
          }
        >
          Calendar View
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[36px] text-white leading-none mb-1">{data.total}</p>
          <p className="font-body text-[14px] text-off-white/70">Total Bookings</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[36px] text-teal leading-none mb-1">{data.thisWeek}</p>
          <p className="font-body text-[14px] text-off-white/70">This Week</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[20px] text-gold leading-tight mb-1 truncate">{data.mostBooked}</p>
          <p className="font-body text-[14px] text-off-white/70">Most Booked</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[36px] text-off-white/50 leading-none mb-1">{data.noShowRate}</p>
          <p className="font-body text-[14px] text-off-white/70">No-show Rate</p>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <>
          {/* Mobile message */}
          <div className="md:hidden rounded-xl p-6 text-center" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CalIcon size={32} className="text-off-white/30 mx-auto mb-2" />
            <p className="font-body text-[14px] text-off-white/50">Switch to desktop for calendar view.</p>
          </div>

          {/* Desktop calendar */}
          <div className="hidden md:flex gap-6">
            <div className="flex-1 rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Calendar header */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-lg text-off-white/50 hover:text-white hover:bg-white/5 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <h3 className="font-heading font-bold text-[16px] text-white">
                  {MONTH_NAMES[calMonth]} {calYear}
                </h3>
                <button onClick={nextMonth} className="p-1.5 rounded-lg text-off-white/50 hover:text-white hover:bg-white/5 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="font-body text-[11px] text-off-white/30 text-center py-1.5">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                {calendarDays.map((d, i) => {
                  const hasBooking = bookingsByDate[d.date]?.length > 0;
                  const isToday = d.date === todayStr;
                  const isSelected = d.date === selectedDate;
                  return (
                    <button
                      key={i}
                      onClick={() => hasBooking && setSelectedDate(isSelected ? null : d.date)}
                      className={`text-center py-2.5 transition-colors ${hasBooking ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
                      style={{
                        backgroundColor: isSelected ? 'rgba(201,168,76,0.2)' : '#0A1628',
                        outline: isToday ? '1px solid #C9A84C' : 'none',
                        outlineOffset: -1,
                      }}
                    >
                      <span
                        className={`font-body text-[13px] ${
                          !d.inMonth ? 'text-off-white/15' :
                          hasBooking ? 'text-gold font-semibold' :
                          'text-off-white/40'
                        }`}
                      >
                        {d.day}
                      </span>
                      {hasBooking && d.inMonth && (
                        <div className="flex justify-center mt-0.5">
                          <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side panel for selected date */}
            {selectedDate && (
              <div className="w-80 rounded-xl p-5 shrink-0" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-heading font-bold text-[14px] text-white">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  <button onClick={() => setSelectedDate(null)} className="text-off-white/40 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                {selectedBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBookings.map(b => (
                      <div key={b.id} className="rounded-lg p-3" style={{ backgroundColor: '#0A1628', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="font-body text-[14px] text-white font-medium">{b.name}</p>
                        <p className="font-body text-[12px] text-off-white/50 mt-0.5">{b.email}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-body text-[12px] text-gold/80">{b.sessionType}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={getStatusStyle(b.status)}
                          >
                            {b.status}
                          </span>
                        </div>
                        {b.startTime && (
                          <p className="font-body text-[11px] text-off-white/40 mt-1">
                            {new Date(b.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-[13px] text-off-white/40">No bookings on this date.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {data.bookings.length > 0 ? (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  {['Date/Time', 'Name', 'Email', 'Session Type', 'Status', 'Actions'].map(h => (
                    <th key={h} className="font-body text-[12px] text-off-white/50 font-medium text-left px-4 py-3 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.bookings.map((b, idx) => (
                  <React.Fragment key={b.id}>
                    <tr
                      className="group hover:bg-white/[0.03] transition-colors"
                      style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)' }}
                    >
                      <td className="font-body text-[13px] text-off-white/70 px-4 py-3 whitespace-nowrap">
                        {b.startTime
                          ? new Date(b.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                          : new Date(b.timestamp).toLocaleDateString()
                        }
                      </td>
                      <td className="font-body text-[14px] text-off-white px-4 py-3">{b.name}</td>
                      <td className="font-body text-[13px] text-off-white/80 px-4 py-3">{b.email}</td>
                      <td className="font-body text-[13px] text-gold/80 px-4 py-3">{b.sessionType}</td>
                      <td className="font-body text-[13px] px-4 py-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                          style={getStatusStyle(b.status)}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleComplete(b.id)}
                              className="flex items-center gap-1 font-body text-[12px] text-teal hover:underline px-2 py-1 rounded"
                            >
                              <Check size={14} /> Mark Complete
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingNote(editingNote === b.id ? null : b.id);
                              setNoteText(notes[b.id] || '');
                            }}
                            className="flex items-center gap-1 font-body text-[12px] text-off-white/40 hover:text-white px-2 py-1 rounded transition-colors"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <StickyNote size={12} /> {notes[b.id] ? 'Edit Note' : 'Add Note'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingNote === b.id && (
                      <tr style={{ backgroundColor: '#111827' }}>
                        <td colSpan={6} className="px-6 py-3">
                          <div className="flex gap-3">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="flex-1 font-body text-[13px] text-off-white rounded-lg px-3 py-2 resize-none focus:outline-none"
                              style={{ backgroundColor: '#0A1628', border: '1px solid rgba(255,255,255,0.12)' }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                              rows={2}
                              placeholder="Add a note..."
                            />
                            <button
                              onClick={() => saveNote(b.id)}
                              className="font-body text-[13px] text-teal hover:underline self-end shrink-0"
                            >
                              Save
                            </button>
                          </div>
                          {notes[b.id] && (
                            <p className="font-body text-[12px] text-off-white/40 mt-2">
                              Current note: {notes[b.id]}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16" style={{ backgroundColor: '#1A1A2E' }}>
              <CalIcon size={48} className="text-off-white/20 mb-3" />
              <p className="font-body text-[16px] text-white mb-1">No bookings recorded yet</p>
              <p className="font-body text-[14px] text-off-white/40">Bookings are logged when Calendly webhook is configured.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
