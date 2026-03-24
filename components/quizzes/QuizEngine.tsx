'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { track } from '@/lib/analytics';
import ScrollReveal from '@/components/ui/ScrollReveal';
import LeadMagnetForm from './LeadMagnetForm';

/* ─── Types ─── */

export interface QuizQuestion {
  id: string;
  type: 'text' | 'textarea' | 'multiple-choice';
  text: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  options?: { value: string; label: string }[];
}

export interface QuizResult {
  id: string;
  headline: string;
  body: string;
}

export interface MagnetConfig {
  key: string;
  name: string;
  description: string;
  buttonLabel: string;
  successHeadline: string;
  downloadFilename: string;
  bookingCtaUrl: string;
  bookingCtaLabel: string;
}

export interface QuizEngineProps {
  quizId: string;
  heroHeadline: string;
  heroSubheadline: string;
  questions: QuizQuestion[];
  computeResult: (answers: Record<string, string>) => QuizResult;
  magnet: MagnetConfig;
  disclaimer: string;
  pdfUrl: string;
}

/* ─── Component ─── */

export default function QuizEngine({
  quizId,
  heroHeadline,
  heroSubheadline,
  questions,
  computeResult,
  magnet,
  disclaimer,
  pdfUrl,
}: QuizEngineProps) {
  const locale = useLocale();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [textValue, setTextValue] = useState('');

  const totalQuestions = questions.length;
  const progress = result ? 100 : Math.round((currentStep / totalQuestions) * 100);
  const currentQuestion = questions[currentStep];

  const finishQuiz = useCallback(
    (finalAnswers: Record<string, string>) => {
      const computed = computeResult(finalAnswers);
      setResult(computed);
      track('quiz_completed', {
        quiz: quizId,
        result_id: computed.id,
        locale,
      });
    },
    [computeResult, quizId, locale],
  );

  const handleMultipleChoiceAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    setTextValue('');

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handleTextSubmit = () => {
    if (!textValue.trim()) return;
    const questionId = currentQuestion.id;
    const newAnswers = { ...answers, [questionId]: textValue.trim() };
    setAnswers(newAnswers);
    setTextValue('');

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const selectedValue = answers[currentQuestion?.id] || '';

  return (
    <div className="bg-navy min-h-screen">
      {/* ─── Hero Block ─── */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-10 text-center">
          <ScrollReveal>
            <h1 className="font-heading font-[800] text-[30px] lg:text-[48px] leading-[1.1] text-white mb-4">
              {heroHeadline}
            </h1>
            <p className="font-body font-normal text-[18px] leading-[1.7] text-off-white max-w-[620px] mx-auto">
              {heroSubheadline}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Quiz Body ─── */}
      <section className="pb-20">
        <div className="mx-auto max-w-[720px] px-4 sm:px-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-body text-[13px] text-off-white/60 mt-2 text-center">
              {result
                ? 'Quiz complete'
                : `Question ${currentStep + 1} of ${totalQuestions}`}
            </p>
          </div>

          {!result ? (
            /* ─── Question Card ─── */
            <div
              className="rounded-2xl"
              style={{
                backgroundColor: '#1A1A2E',
                borderRadius: '16px',
                padding: 'clamp(24px, 4vw, 40px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <h2 className="font-heading font-bold text-[18px] lg:text-[22px] text-white mb-6">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleMultipleChoiceAnswer(currentQuestion.id, opt.value)}
                      className="w-full text-left font-body text-[16px] text-off-white rounded-lg px-6 py-4 transition-all duration-150"
                      style={{
                        backgroundColor:
                          selectedValue === opt.value
                            ? 'rgba(201,168,76,0.15)'
                            : '#1A1A2E',
                        border:
                          selectedValue === opt.value
                            ? '2px solid #C9A84C'
                            : '1px solid rgba(255,255,255,0.12)',
                        color: selectedValue === opt.value ? '#FFFFFF' : '#F8F9FA',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedValue !== opt.value) {
                          e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.08)';
                          e.currentTarget.style.borderColor = '#C9A84C';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedValue !== opt.value) {
                          e.currentTarget.style.backgroundColor = '#1A1A2E';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'text' || currentQuestion.type === 'textarea') && (
                <div>
                  <label htmlFor={`quiz-input-${currentQuestion.id}`} className="sr-only">
                    {currentQuestion.text}
                  </label>
                  {currentQuestion.type === 'textarea' ? (
                    <>
                      <textarea
                        id={`quiz-input-${currentQuestion.id}`}
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        placeholder={currentQuestion.placeholder || ''}
                        maxLength={currentQuestion.maxLength || 300}
                        rows={currentQuestion.rows || 3}
                        className="w-full font-body text-[16px] text-off-white placeholder:text-white/30 rounded-lg px-4 py-4 focus:outline-none transition-colors duration-150 resize-none"
                        style={{
                          backgroundColor: '#1A1A2E',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#C9A84C';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        }}
                      />
                      <p className="font-body text-[12px] text-off-white/40 mt-1 text-right">
                        {(currentQuestion.maxLength || 300) - textValue.length} characters remaining
                      </p>
                    </>
                  ) : (
                    <input
                      id={`quiz-input-${currentQuestion.id}`}
                      type="text"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder={currentQuestion.placeholder || ''}
                      maxLength={currentQuestion.maxLength || 100}
                      className="w-full font-body text-[16px] text-off-white placeholder:text-white/30 rounded-lg px-4 py-4 focus:outline-none transition-colors duration-150"
                      style={{
                        backgroundColor: '#1A1A2E',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#C9A84C';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTextSubmit();
                        }
                      }}
                    />
                  )}

                  <button
                    onClick={handleTextSubmit}
                    disabled={!textValue.trim()}
                    className="mt-4 w-full font-heading font-semibold text-[16px] bg-gold text-navy px-6 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {currentStep < totalQuestions - 1 ? 'Next' : 'See My Results'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ─── Result + Form ─── */
            <div>
              {/* Result Card */}
              <div
                style={{
                  backgroundColor: '#0A1628',
                  borderRadius: '16px',
                  padding: 'clamp(24px, 4vw, 40px)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  marginBottom: '32px',
                }}
              >
                <h2 className="font-heading font-[800] text-[24px] text-gold mb-4">
                  {result.headline}
                </h2>
                <p className="font-body text-[16px] text-off-white leading-[1.7]">
                  {result.body}
                </p>
              </div>

              {/* Lead Magnet Intro */}
              <div
                className="mb-4"
                style={{
                  backgroundColor: '#1A1A2E',
                  borderRadius: '16px',
                  padding: 'clamp(24px, 4vw, 40px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <h3 className="font-heading font-bold text-[20px] text-gold mb-2">
                  {magnet.name}
                </h3>
                <p className="font-body text-[15px] text-off-white/80 leading-[1.7] mb-6">
                  {magnet.description}
                </p>

                <LeadMagnetForm
                  magnetKey={magnet.key}
                  buttonLabel={magnet.buttonLabel}
                  successHeadline={magnet.successHeadline}
                  pdfUrl={pdfUrl}
                  downloadFilename={magnet.downloadFilename}
                  bookingCtaUrl={magnet.bookingCtaUrl}
                  bookingCtaLabel={magnet.bookingCtaLabel}
                  disclaimer={disclaimer}
                  resultId={result.id}
                  quizId={quizId}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
