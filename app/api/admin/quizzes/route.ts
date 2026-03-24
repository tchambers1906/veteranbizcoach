import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/adminAuth';
import { getQuizResults } from '@/lib/adminData';

export async function GET(request: Request) {
  if (!(await verifyAdminSession(request))) return unauthorizedResponse();

  try {
    const url = new URL(request.url);
    const filters = {
      quiz: url.searchParams.get('quiz') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    };

    const results = getQuizResults(filters);

    // Compute distributions
    const resultDist: Record<string, number> = {};
    const answerDist: Record<string, Record<string, number>> = {};
    let emailCaptured = 0;

    for (const r of results) {
      resultDist[r.resultId] = (resultDist[r.resultId] || 0) + 1;
      if (r.emailCaptured) emailCaptured++;

      // Build answer distribution per question
      if (r.answers) {
        for (const [qId, answer] of Object.entries(r.answers)) {
          if (!answerDist[qId]) answerDist[qId] = {};
          answerDist[qId][answer] = (answerDist[qId][answer] || 0) + 1;
        }
      }
    }

    const total = results.length;
    const captureRate = total > 0 ? Number(((emailCaptured / total) * 100).toFixed(1)) : 0;

    // Most common result
    let mostCommonResult = 'N/A';
    let maxCount = 0;
    for (const [rid, cnt] of Object.entries(resultDist)) {
      if (cnt > maxCount) { maxCount = cnt; mostCommonResult = rid; }
    }

    return NextResponse.json({
      total,
      captureRate,
      mostCommonResult,
      resultDist,
      answerDist,
      recent: results.slice(0, 50),
    }, { status: 200 });
  } catch (err) {
    console.error('[admin/quizzes]', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Could not load quiz data.' }, { status: 500 });
  }
}
