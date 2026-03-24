'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

/* ------------------------------------------------------------------ */
/*  Quiz data structure                                               */
/* ------------------------------------------------------------------ */
const QUESTIONS = [
  { key: 'q1', options: ['a', 'b', 'c', 'd'] },
  { key: 'q2', options: ['a', 'b', 'c', 'd', 'e'] },
  { key: 'q3', options: ['a', 'b', 'c'] },
  { key: 'q4', options: ['a', 'b', 'c'] },
  { key: 'q5', options: ['a', 'b', 'c', 'd'] },
  { key: 'q6', options: ['a', 'b', 'c', 'd', 'e'] },
] as const;

type Answers = Record<string, string>;

/* ------------------------------------------------------------------ */
/*  Routing logic                                                     */
/* ------------------------------------------------------------------ */
interface QuizResult {
  pillar: string;
  ctaKey: string;
  href: string;
}

function computeResult(answers: Answers): QuizResult {
  const stage = answers.q1;
  const challenge = answers.q2;
  const entity = answers.q3;
  const website = answers.q4;
  const ai = answers.q5;
  const goal = answers.q6;

  if (stage === 'a' && (challenge === 'a' || goal === 'a')) {
    return { pillar: 'superpower', ctaKey: 'superpower', href: '/resources?waitlist=superpower' };
  }
  if ((stage === 'c' || stage === 'd') && (challenge === 'b' || goal === 'b')) {
    return { pillar: 'funding', ctaKey: 'funding', href: '/book?session=funding' };
  }
  if ((stage === 'b' || stage === 'c' || stage === 'd') && (website === 'c' || website === 'b' || challenge === 'c' || goal === 'c')) {
    return { pillar: 'website', ctaKey: 'website', href: '/book?session=website' };
  }
  if ((stage === 'b' || stage === 'c' || stage === 'd') && (ai === 'c' || ai === 'd' || challenge === 'd' || goal === 'd')) {
    return { pillar: 'ai-strategy', ctaKey: 'ai', href: '/book?session=ai-strategy' };
  }
  if (stage === 'b' && challenge === 'a') {
    return { pillar: 'superpower', ctaKey: 'superpower', href: '/resources?waitlist=superpower' };
  }
  if (challenge === 'b' || goal === 'b' || entity === 'b') {
    return { pillar: 'funding', ctaKey: 'funding', href: '/book?session=funding' };
  }
  return { pillar: 'strategy', ctaKey: 'strategy', href: '/book?session=strategy' };
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function QuizSection() {
  const t = useTranslations('quiz');
  const locale = useLocale();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const [quizEmail, setQuizEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const totalSteps = QUESTIONS.length;
  const progress = result ? 100 : Math.round((currentStep / totalSteps) * 100);

  const handleAnswer = (questionKey: string, option: string) => {
    const newAnswers = { ...answers, [questionKey]: option };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const computed = computeResult(newAnswers);
      setResult(computed);
      track('quiz_completed', {
        result_pillar: computed.pillar,
        locale,
        answers: JSON.stringify(newAnswers),
      });
    }
  };

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'quiz',
      pillar: result?.pillar || 'quiz',
      locale,
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizEmail.trim() || !result) return;

    setEmailStatus('loading');
    try {
      const res = await fetch('/api/quiz-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: quizEmail.trim(),
          result_pillar: result.pillar,
          locale,
        }),
      });
      const data = await res.json();
      setEmailStatus(data.success ? 'success' : 'error');
    } catch {
      setEmailStatus('error');
    }
  };

  const restartQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
    setQuizEmail('');
    setEmailStatus('idle');
  };

  return (
    <section id="quiz" className="bg-navy">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white text-center mb-2">
            {t('headline')}
          </h2>
          <p className="font-body font-medium text-[18px] lg:text-[20px] text-teal text-center mb-10">
            {t('subheadline')}
          </p>
        </ScrollReveal>

        {/* Progress bar */}
        <div className="mb-8">
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-body text-[13px] text-off-white/60 mt-2 text-center">
            {result ? t('complete') : t('progress', { current: currentStep + 1, total: totalSteps })}
          </p>
        </div>

        {/* Quiz body */}
        {!result ? (
          /* ---------- Question step ---------- */
          <div
            className="rounded-2xl p-6 lg:p-10"
            style={{
              backgroundColor: '#1A1A2E',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <h3 className="font-heading font-bold text-[20px] lg:text-[22px] text-white mb-6">
              {t(`questions.${QUESTIONS[currentStep].key}.text`)}
            </h3>
            <div className="space-y-3">
              {QUESTIONS[currentStep].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(QUESTIONS[currentStep].key, opt)}
                  className="w-full text-left font-body text-[15px] lg:text-[16px] text-off-white rounded-lg px-5 lg:px-6 py-4 transition-all duration-150"
                  style={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.10)';
                    e.currentTarget.style.borderColor = '#C9A84C';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1A2E';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = '#F8F9FA';
                  }}
                >
                  {t(`questions.${QUESTIONS[currentStep].key}.${opt}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ---------- Result card ---------- */
          <div>
            <div
              className="rounded-2xl p-6 lg:p-8 text-center mb-6"
              style={{
                backgroundColor: '#1A1A2E',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <h3 className="font-heading font-bold text-[22px] lg:text-[26px] text-gold mb-4">
                {t(`results.${result.ctaKey}.heading`)}
              </h3>
              <p className="font-body text-[17px] leading-[1.7] text-white/80 mb-8 max-w-lg mx-auto">
                {t(`results.${result.ctaKey}.body`)}
              </p>
              <Link
                href={result.href}
                onClick={() => handleCtaClick(t(`results.${result.ctaKey}.cta`))}
                className="inline-flex items-center justify-center font-heading font-semibold text-base bg-teal text-white px-8 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all"
              >
                {t(`results.${result.ctaKey}.cta`)}
              </Link>
            </div>

            {/* Email capture */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: '#1A1A2E',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {emailStatus === 'success' ? (
                <p className="font-body text-[15px] text-teal text-center py-4">
                  {t('emailSuccess')}
                </p>
              ) : (
                <>
                  <p className="font-body text-[15px] text-off-white/70 text-center mb-4">
                    {t('emailPrompt')}
                  </p>
                  <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
                    <label htmlFor="quiz-email" className="sr-only">
                      {t('emailLabel')}
                    </label>
                    <input
                      id="quiz-email"
                      type="email"
                      value={quizEmail}
                      onChange={(e) => setQuizEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      maxLength={254}
                      required
                      className="flex-1 bg-navy border border-white/10 rounded-lg px-4 py-3 font-body text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal/50"
                    />
                    <button
                      type="submit"
                      disabled={emailStatus === 'loading'}
                      className="font-heading font-semibold text-[15px] bg-gold text-navy px-6 py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 whitespace-nowrap"
                    >
                      {emailStatus === 'loading' ? t('emailSending') : t('emailButton')}
                    </button>
                  </form>
                  {emailStatus === 'error' && (
                    <p className="font-body text-[13px] text-red-400 mt-2 text-center">
                      {t('emailError')}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Restart */}
            <div className="text-center mt-6">
              <button
                onClick={restartQuiz}
                className="font-body text-[14px] text-off-white/60 hover:text-white underline underline-offset-2 transition-colors"
              >
                {t('restart')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
