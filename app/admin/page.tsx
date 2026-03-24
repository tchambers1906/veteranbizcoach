'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  MessageCircle,
  Mail,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const CHART_COLORS = ['#C9A84C', '#00B4A6', '#F8F9FA', '#E8C97A'];

interface Stats {
  totalLeads: number;
  leadsThisWeek: number;
  quizCompletions: number;
  quizCompletionsThisWeek: number;
  callsBooked: number;
  callsBookedThisWeek: number;
  conversionRate: number;
  leadsByPillar: { name: string; count: number }[];
  quizResultDist: Record<string, Record<string, number>>;
  recentActivity: {
    id: string;
    timestamp: string;
    type: string;
    detail: string;
    email: string;
  }[];
}

const PILLAR_SHORT: Record<string, string> = {
  'villa-survival-guide': 'Villa',
  'superpower-discovery-workbook': 'Superpower',
  'website-audit-checklist': 'Website',
  'business-funding-blueprint': 'Funding',
  'funding-blueprint': 'Funding',
  'footer-signup': 'Homepage',
  chatbot: 'Chatbot',
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ActivityIcon({ type }: { type: string }) {
  const configs: Record<string, { bg: string; icon: React.ReactNode }> = {
    lead: { bg: '#C9A84C', icon: <Users size={16} className="text-navy" /> },
    quiz: { bg: '#00B4A6', icon: <ClipboardCheck size={16} className="text-white" /> },
    booking: { bg: '#C9A84C', icon: <Calendar size={16} className="text-navy" /> },
    chatbot: { bg: '#00B4A6', icon: <MessageCircle size={16} className="text-white" /> },
    footer: { bg: '#1A1A2E', icon: <Mail size={16} className="text-off-white/60" /> },
  };
  const cfg = configs[type] || configs.lead;
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: 32, height: 32, backgroundColor: cfg.bg }}
    >
      {cfg.icon}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="font-body text-[13px] px-3 py-2 rounded-lg"
      style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid rgba(201,168,76,0.3)',
        color: '#FFFFFF',
      }}
    >
      <p className="font-semibold">{label}</p>
      <p className="text-gold">{payload[0].value} leads</p>
    </div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
      // Set default quiz selection
      const quizNames = Object.keys(data.quizResultDist || {});
      if (quizNames.length > 0 && !selectedQuiz) {
        setSelectedQuiz(quizNames[0]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Skeleton className="h-9 w-20 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-4 w-24" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-3 w-16 mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Skeleton className="h-5 w-40 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-[280px] w-full rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))}
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Skeleton className="h-5 w-32 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-12 w-full mb-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-off-white/20 mb-4" />
        <p className="font-body text-[16px] text-white mb-1">Could not load dashboard</p>
        <p className="font-body text-[14px] text-off-white/40 mb-4">Please check your connection and try again.</p>
        <button onClick={fetchStats} className="flex items-center gap-2 font-body text-[14px] text-teal hover:underline">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const pillarData = stats.leadsByPillar.map(p => ({
    name: PILLAR_SHORT[p.name] || p.name,
    count: p.count,
  }));

  // Merge duplicates (e.g. both "funding" sources)
  const mergedPillarData: Record<string, number> = {};
  for (const p of pillarData) {
    mergedPillarData[p.name] = (mergedPillarData[p.name] || 0) + p.count;
  }
  const finalPillarData = Object.entries(mergedPillarData).map(([name, count]) => ({ name, count }));

  // Quiz result distribution
  const quizNames = Object.keys(stats.quizResultDist);
  const quizToShow = selectedQuiz || quizNames[0] || '';
  const resultDist = stats.quizResultDist[quizToShow] || {};
  const pieData = Object.entries(resultDist).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={stats.totalLeads}
          trend={stats.leadsThisWeek}
          trendPositive={true}
          icon={<Users size={24} className="text-gold" />}
        />
        <StatCard
          label="Quiz Completions"
          value={stats.quizCompletions}
          trend={stats.quizCompletionsThisWeek}
          trendPositive={true}
          icon={<ClipboardCheck size={24} className="text-gold" />}
        />
        <StatCard
          label="Calls Booked"
          value={stats.callsBooked}
          trend={stats.callsBookedThisWeek}
          trendPositive={true}
          icon={<Calendar size={24} className="text-gold" />}
        />
        <StatCard
          label="Lead to Call Rate"
          value={`${stats.conversionRate}%`}
          trend={null}
          trendPositive={true}
          icon={<TrendingUp size={24} className="text-teal" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Pillar */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-heading font-bold text-[16px] text-white mb-4">Leads by Service Pillar</h3>
          {finalPillarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={finalPillarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#F8F9FA', fontSize: 12, fontFamily: 'Source Sans 3' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(248,249,250,0.5)', fontSize: 12, fontFamily: 'Source Sans 3' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<Users size={48} className="text-off-white/20" />}
              heading="No leads yet"
              subtext="Share your quiz links to start capturing leads."
            />
          )}
        </div>

        {/* Quiz Result Distribution */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-[16px] text-white">Quiz Result Distribution</h3>
            {quizNames.length > 0 && (
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="font-body text-[13px] text-off-white rounded-lg px-3 py-1.5 focus:outline-none"
                style={{ backgroundColor: '#0A1628', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {quizNames.map(q => (
                  <option key={q} value={q}>{q.charAt(0).toUpperCase() + q.slice(1)}</option>
                ))}
              </select>
            )}
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 8,
                    color: '#F8F9FA',
                    fontFamily: 'Source Sans 3',
                    fontSize: 13,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value: string) => (
                    <span className="font-body text-[12px] text-off-white/70">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<ClipboardCheck size={48} className="text-off-white/20" />}
              heading="No quiz data yet"
              subtext="Quizzes populate this chart automatically."
            />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-heading font-bold text-[16px] text-white px-6 pt-6 pb-3">Recent Activity</h3>
        {stats.recentActivity.length > 0 ? (
          <div>
            {stats.recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <ActivityIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[14px] text-white truncate">{a.detail}</p>
                  {a.email && (
                    <p className="font-body text-[13px] text-off-white/50 truncate">{a.email}</p>
                  )}
                </div>
                <time className="font-body text-[12px] text-off-white/30 shrink-0">
                  {formatRelativeTime(a.timestamp)}
                </time>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 pb-6">
            <EmptyState
              icon={<RefreshCw size={48} className="text-off-white/20" />}
              heading="No activity yet"
              subtext="Events appear here as leads, quizzes, and bookings come in."
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  trendPositive,
  icon,
}: {
  label: string;
  value: string | number;
  trend: number | null;
  trendPositive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-6 relative"
      style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}
    >
      <div className="absolute top-4 right-4">{icon}</div>
      <p className="font-heading font-[800] text-[36px] text-white leading-none mb-1">{value}</p>
      <p className="font-body font-normal text-[14px] text-off-white/70">{label}</p>
      {trend !== null && (
        <p
          className="font-body text-[13px] mt-2"
          style={{ color: trendPositive ? '#00B4A6' : '#E53E3E' }}
        >
          +{trend} this week
        </p>
      )}
    </div>
  );
}

function EmptyState({ icon, heading, subtext }: { icon: React.ReactNode; heading: string; subtext: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3">{icon}</div>
      <p className="font-body text-[16px] text-white mb-1">{heading}</p>
      <p className="font-body text-[14px] text-off-white/40 max-w-[280px]">{subtext}</p>
    </div>
  );
}
