'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizData {
  total: number;
  captureRate: number;
  mostCommonResult: string;
  resultDist: Record<string, number>;
  answerDist: Record<string, Record<string, number>>;
  recent: {
    id: string;
    timestamp: string;
    quiz: string;
    resultId: string;
    emailCaptured: boolean;
    locale: string;
  }[];
}

const QUIZ_TABS = [
  { value: 'all', label: 'All' },
  { value: 'villa', label: 'Villa' },
  { value: 'superpower', label: 'Superpower' },
  { value: 'website', label: 'Website' },
  { value: 'funding', label: 'Funding' },
];

export default function AdminQuizzesPage() {
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quiz, setQuiz] = useState('all');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (quiz !== 'all') params.set('quiz', quiz);
      const res = await fetch(`/api/admin/quizzes?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [quiz]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {QUIZ_TABS.map(t => (
            <Skeleton key={t.value} className="h-8 w-20 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Skeleton className="h-8 w-16 mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton className="h-4 w-28" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Skeleton className="h-[240px] w-full rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center py-20">
        <ClipboardList size={48} className="text-off-white/20 mb-4" />
        <p className="font-body text-[16px] text-white mb-1">Could not load quiz data</p>
        <p className="font-body text-[14px] text-off-white/40 mb-4">Check your connection and try again.</p>
        <button onClick={fetchData} className="flex items-center gap-2 font-body text-teal hover:underline">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const resultBars = Object.entries(data.resultDist).map(([name, count]) => ({ name, count }));
  const answerQuestions = Object.entries(data.answerDist);

  return (
    <div className="space-y-6">
      {/* Quiz selector tabs with gold underline */}
      <div className="flex gap-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {QUIZ_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => { setQuiz(t.value); setOpenQuestion(null); }}
            className="font-body text-[14px] pb-3 px-1 transition-colors relative"
            style={{
              color: quiz === t.value ? '#FFFFFF' : 'rgba(248,249,250,0.4)',
              fontWeight: quiz === t.value ? 600 : 400,
            }}
          >
            {t.label}
            {quiz === t.value && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ backgroundColor: '#C9A84C' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[36px] text-white leading-none mb-1">{data.total}</p>
          <p className="font-body text-[14px] text-off-white/70">Total completions</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[36px] text-teal leading-none mb-1">{data.captureRate}%</p>
          <p className="font-body text-[14px] text-off-white/70">Email capture rate</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-heading font-[800] text-[22px] text-gold leading-tight mb-1 truncate">{data.mostCommonResult}</p>
          <p className="font-body text-[14px] text-off-white/70">Most common result</p>
        </div>
      </div>

      {/* Result distribution chart */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-heading font-bold text-[16px] text-white mb-4">Result Distribution</h3>
        {resultBars.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(240, resultBars.length * 48)}>
            <BarChart data={resultBars} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(248,249,250,0.5)', fontSize: 12, fontFamily: 'Source Sans 3' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#F8F9FA', fontSize: 12, fontFamily: 'Source Sans 3' }} width={140} axisLine={false} tickLine={false} />
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
              <Bar dataKey="count" fill="#C9A84C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList size={48} className="text-off-white/20 mb-3" />
            <p className="font-body text-[16px] text-white mb-1">No quiz completions yet</p>
            <p className="font-body text-[14px] text-off-white/40">Quiz links are live on each service pillar section.</p>
          </div>
        )}
      </div>

      {/* Answer breakdown accordion */}
      <div className="rounded-xl" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-heading font-bold text-[16px] text-white px-6 pt-6 pb-3">Answer Breakdown</h3>
        {answerQuestions.length > 0 ? (
          <div>
            {answerQuestions.map(([qId, answers]) => {
              const total = Object.values(answers).reduce((a, b) => a + b, 0);
              const barData = Object.entries(answers)
                .map(([answer, count]) => ({
                  answer,
                  answerShort: answer.length > 50 ? answer.substring(0, 50) + '...' : answer,
                  count,
                  pct: total > 0 ? Math.round((count / total) * 100) : 0,
                }))
                .sort((a, b) => b.count - a.count);
              const isOpen = openQuestion === qId;
              const maxCount = barData[0]?.count || 0;

              return (
                <div key={qId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <button
                    onClick={() => setOpenQuestion(isOpen ? null : qId)}
                    className="w-full text-left px-6 py-3.5 font-body text-[14px] text-off-white hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                  >
                    <span>Question: <span className="text-gold/80">{qId}</span></span>
                    {isOpen ? <ChevronUp size={18} className="text-off-white/30" /> : <ChevronDown size={18} className="text-off-white/30" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 space-y-3">
                      {barData.map((d, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-body text-[13px] text-off-white/70 flex-1 truncate mr-4">{d.answerShort}</span>
                            <span className="font-body text-[13px] text-off-white/50 shrink-0">{d.count} ({d.pct}%)</span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${d.pct}%`,
                                backgroundColor: d.count === maxCount ? '#C9A84C' : '#00B4A6',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <ClipboardList size={48} className="text-off-white/20 mb-3" />
            <p className="font-body text-[16px] text-white mb-1">No answer data yet</p>
            <p className="font-body text-[14px] text-off-white/40">Answer breakdowns appear after quiz completions.</p>
          </div>
        )}
      </div>

      {/* Recent quiz submissions */}
      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-heading font-bold text-[16px] text-white px-6 pt-6 pb-3" style={{ backgroundColor: '#1A1A2E' }}>Recent Submissions</h3>
        {data.recent.length > 0 ? (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: '#111827' }}>
                {['Date', 'Quiz', 'Result', 'Email Captured', 'Locale'].map(h => (
                  <th key={h} className="font-body text-[12px] text-off-white/50 font-medium text-left px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent.slice(0, 25).map((r, idx) => (
                <tr key={r.id} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)' }}>
                  <td className="font-body text-[13px] text-off-white/70 px-4 py-3">
                    {new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="font-body text-[13px] text-gold/80 px-4 py-3 capitalize">{r.quiz}</td>
                  <td className="font-body text-[13px] text-off-white px-4 py-3">{r.resultId}</td>
                  <td className="font-body text-[13px] px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={
                        r.emailCaptured
                          ? { backgroundColor: 'rgba(0,180,166,0.15)', color: '#00B4A6' }
                          : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(248,249,250,0.4)' }
                      }
                    >
                      {r.emailCaptured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="font-body text-[13px] text-off-white/50 px-4 py-3 uppercase">{r.locale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12" style={{ backgroundColor: '#1A1A2E' }}>
            <ClipboardList size={48} className="text-off-white/20 mb-3" />
            <p className="font-body text-[16px] text-white mb-1">No quiz submissions yet</p>
            <p className="font-body text-[14px] text-off-white/40">Quiz links are live on each service pillar section.</p>
          </div>
        )}
      </div>
    </div>
  );
}
