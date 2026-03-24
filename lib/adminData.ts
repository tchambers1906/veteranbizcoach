/**
 * File-based data persistence for admin dashboard.
 * Append-only JSON files stored in /data/ directory.
 *
 * PRODUCTION NOTES:
 * - For production at scale, migrate to a proper database.
 * - File locking is not implemented; acceptable for single-user admin.
 * - Files are append-only arrays; reads parse the entire file.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface LeadRecord {
  id: string;
  timestamp: string;
  firstName: string;
  email: string;
  phone: string;
  magnet: string;
  locale: string;
  resultId: string;
  source: string; // 'lead-magnet' | 'chatbot' | 'footer' | 'quiz-lead'
  downloaded: boolean;
}

export interface QuizRecord {
  id: string;
  timestamp: string;
  quiz: string;
  resultId: string;
  locale: string;
  answers: Record<string, string>;
  emailCaptured: boolean;
  email: string;
}

export interface BookingRecord {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  sessionType: string;
  startTime: string;
  bookedAt: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  event: string;
}

export interface ActivityRecord {
  id: string;
  timestamp: string;
  type: 'lead' | 'quiz' | 'booking' | 'chatbot' | 'footer';
  detail: string;
  email: string;
}

/* ------------------------------------------------------------------ */
/*  File helpers                                                      */
/* ------------------------------------------------------------------ */

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string): T[] {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function appendToJsonFile<T>(filename: string, record: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  const existing = readJsonFile<T>(filename);
  existing.push(record);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/* ------------------------------------------------------------------ */
/*  Leads                                                             */
/* ------------------------------------------------------------------ */

export function appendLead(lead: Omit<LeadRecord, 'id'>): LeadRecord {
  const record: LeadRecord = { id: generateId(), ...lead };
  appendToJsonFile('leads.json', record);
  // Also record activity
  appendActivity({
    timestamp: record.timestamp,
    type: record.source === 'chatbot' ? 'chatbot' : record.source === 'footer' ? 'footer' : 'lead',
    detail: `${record.firstName || record.email} downloaded ${record.magnet || record.source}`,
    email: record.email,
  });
  return record;
}

export function getLeads(filters?: {
  startDate?: string;
  endDate?: string;
  magnet?: string;
  locale?: string;
  search?: string;
  page?: number;
  limit?: number;
}): { leads: LeadRecord[]; total: number; page: number; totalPages: number } {
  let leads = readJsonFile<LeadRecord>('leads.json');

  // Sort newest first
  leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.startDate) {
    const start = new Date(filters.startDate).getTime();
    leads = leads.filter(l => new Date(l.timestamp).getTime() >= start);
  }
  if (filters?.endDate) {
    const end = new Date(filters.endDate).getTime();
    leads = leads.filter(l => new Date(l.timestamp).getTime() <= end);
  }
  if (filters?.magnet && filters.magnet !== 'all') {
    leads = leads.filter(l => l.magnet === filters.magnet);
  }
  if (filters?.locale && filters.locale !== 'all') {
    leads = leads.filter(l => l.locale === filters.locale);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    leads = leads.filter(l =>
      l.firstName.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q)
    );
  }

  const total = leads.length;
  const limit = filters?.limit || 25;
  const page = filters?.page || 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const paged = leads.slice(start, start + limit);

  return { leads: paged, total, page, totalPages };
}

export function markLeadDownloaded(email: string, magnet: string): void {
  const leads = readJsonFile<LeadRecord>('leads.json');
  let changed = false;
  for (const lead of leads) {
    if (lead.email === email && lead.magnet === magnet && !lead.downloaded) {
      lead.downloaded = true;
      changed = true;
    }
  }
  if (changed) writeJsonFile('leads.json', leads);
}

/* ------------------------------------------------------------------ */
/*  Quizzes                                                           */
/* ------------------------------------------------------------------ */

export function appendQuizResult(result: Omit<QuizRecord, 'id'>): QuizRecord {
  const record: QuizRecord = { id: generateId(), ...result };
  appendToJsonFile('quizzes.json', record);
  appendActivity({
    timestamp: record.timestamp,
    type: 'quiz',
    detail: `${record.quiz} quiz completed with result: ${record.resultId}`,
    email: record.email || '',
  });
  return record;
}

export function getQuizResults(filters?: {
  quiz?: string;
  startDate?: string;
  endDate?: string;
}): QuizRecord[] {
  let results = readJsonFile<QuizRecord>('quizzes.json');
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.quiz && filters.quiz !== 'all') {
    results = results.filter(r => r.quiz === filters.quiz);
  }
  if (filters?.startDate) {
    const start = new Date(filters.startDate).getTime();
    results = results.filter(r => new Date(r.timestamp).getTime() >= start);
  }
  if (filters?.endDate) {
    const end = new Date(filters.endDate).getTime();
    results = results.filter(r => new Date(r.timestamp).getTime() <= end);
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  Bookings                                                          */
/* ------------------------------------------------------------------ */

export function appendBooking(booking: Omit<BookingRecord, 'id'>): BookingRecord {
  const record: BookingRecord = { id: generateId(), ...booking };
  appendToJsonFile('bookings.json', record);
  appendActivity({
    timestamp: record.timestamp,
    type: 'booking',
    detail: `${record.name} booked ${record.sessionType}`,
    email: record.email,
  });
  return record;
}

export function getBookings(): BookingRecord[] {
  const bookings = readJsonFile<BookingRecord>('bookings.json');
  bookings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return bookings;
}

export function updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled' | 'completed'): boolean {
  const bookings = readJsonFile<BookingRecord>('bookings.json');
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return false;
  booking.status = status;
  writeJsonFile('bookings.json', bookings);
  return true;
}

/* ------------------------------------------------------------------ */
/*  Activity feed                                                     */
/* ------------------------------------------------------------------ */

export function appendActivity(activity: Omit<ActivityRecord, 'id'>): void {
  const record: ActivityRecord = { id: generateId(), ...activity };
  appendToJsonFile('activity.json', record);
}

export function getRecentActivity(limit: number = 10): ActivityRecord[] {
  const activity = readJsonFile<ActivityRecord>('activity.json');
  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return activity.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/*  Stats                                                             */
/* ------------------------------------------------------------------ */

export function getStats() {
  const leads = readJsonFile<LeadRecord>('leads.json');
  const quizzes = readJsonFile<QuizRecord>('quizzes.json');
  const bookings = readJsonFile<BookingRecord>('bookings.json');

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalLeads = leads.length;
  const leadsThisWeek = leads.filter(l => new Date(l.timestamp) >= weekAgo).length;

  const quizCompletions = quizzes.length;
  const quizCompletionsThisWeek = quizzes.filter(q => new Date(q.timestamp) >= weekAgo).length;

  const callsBooked = bookings.length;
  const callsBookedThisWeek = bookings.filter(b => new Date(b.timestamp) >= weekAgo).length;

  const conversionRate = totalLeads > 0 ? Number(((callsBooked / totalLeads) * 100).toFixed(1)) : 0;

  // Leads by pillar
  const pillarCounts: Record<string, number> = {};
  for (const lead of leads) {
    const key = lead.magnet || lead.source || 'unknown';
    pillarCounts[key] = (pillarCounts[key] || 0) + 1;
  }
  const leadsByPillar = Object.entries(pillarCounts).map(([name, count]) => ({ name, count }));

  // Quiz result distribution
  const quizResultDist: Record<string, Record<string, number>> = {};
  for (const q of quizzes) {
    if (!quizResultDist[q.quiz]) quizResultDist[q.quiz] = {};
    quizResultDist[q.quiz][q.resultId] = (quizResultDist[q.quiz][q.resultId] || 0) + 1;
  }

  const recentActivity = getRecentActivity(10);

  return {
    totalLeads,
    leadsThisWeek,
    quizCompletions,
    quizCompletionsThisWeek,
    callsBooked,
    callsBookedThisWeek,
    conversionRate,
    leadsByPillar,
    quizResultDist,
    recentActivity,
  };
}
