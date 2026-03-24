'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import QuizEngine from './QuizEngine';
import type { QuizQuestion, QuizResult } from './QuizEngine';

interface WebsiteDiagnosticQuizProps {
  pdfUrl: string;
}

export default function WebsiteDiagnosticQuiz({ pdfUrl }: WebsiteDiagnosticQuizProps) {
  const t = useTranslations('websiteQuiz');

  const questions: QuizQuestion[] = useMemo(
    () => [
      {
        id: 'q1',
        type: 'multiple-choice' as const,
        text: t('q1.text'),
        options: [
          { value: 'a', label: t('q1.o1') },
          { value: 'b', label: t('q1.o2') },
          { value: 'c', label: t('q1.o3') },
          { value: 'd', label: t('q1.o4') },
        ],
      },
      {
        id: 'q2',
        type: 'multiple-choice' as const,
        text: t('q2.text'),
        options: [
          { value: 'a', label: t('q2.o1') },
          { value: 'b', label: t('q2.o2') },
          { value: 'c', label: t('q2.o3') },
          { value: 'd', label: t('q2.o4') },
          { value: 'e', label: t('q2.o5') },
        ],
      },
      {
        id: 'q3',
        type: 'multiple-choice' as const,
        text: t('q3.text'),
        options: [
          { value: 'a', label: t('q3.o1') },
          { value: 'b', label: t('q3.o2') },
          { value: 'c', label: t('q3.o3') },
          { value: 'd', label: t('q3.o4') },
          { value: 'e', label: t('q3.o5') },
        ],
      },
      {
        id: 'q4',
        type: 'text' as const,
        text: t('q4.text'),
        placeholder: t('q4.placeholder'),
        maxLength: 100,
      },
      {
        id: 'q5',
        type: 'multiple-choice' as const,
        text: t('q5.text'),
        options: [
          { value: 'a', label: t('q5.o1') },
          { value: 'b', label: t('q5.o2') },
          { value: 'c', label: t('q5.o3') },
          { value: 'd', label: t('q5.o4') },
        ],
      },
      {
        id: 'q6',
        type: 'multiple-choice' as const,
        text: t('q6.text'),
        options: [
          { value: 'a', label: t('q6.o1') },
          { value: 'b', label: t('q6.o2') },
          { value: 'c', label: t('q6.o3') },
          { value: 'd', label: t('q6.o4') },
          { value: 'e', label: t('q6.o5') },
        ],
      },
    ],
    [t],
  );

  const computeResult = (answers: Record<string, string>): QuizResult => {
    const q1 = answers.q1;
    const q3 = answers.q3;
    const q5 = answers.q5;

    // Invisible: no website or social media only
    if (q1 === 'd' || q1 === 'c') {
      return {
        id: 'invisible',
        headline: t('results.invisible.headline'),
        body: t('results.invisible.body'),
      };
    }

    // Losing clients: underperforms or slow/broken mobile
    if (q1 === 'b' || q3 === 'b' || q3 === 'c') {
      return {
        id: 'losing_clients',
        headline: t('results.losing_clients.headline'),
        body: t('results.losing_clients.body'),
      };
    }

    // Not mobile: cannot be installed or don't know
    if (q5 === 'b' || q5 === 'c') {
      return {
        id: 'not_mobile',
        headline: t('results.not_mobile.headline'),
        body: t('results.not_mobile.body'),
      };
    }

    // Solid foundation: converts well
    if (q1 === 'a') {
      return {
        id: 'solid_foundation',
        headline: t('results.solid_foundation.headline'),
        body: t('results.solid_foundation.body'),
      };
    }

    // Fallback default
    return {
      id: 'losing_clients',
      headline: t('results.losing_clients.headline'),
      body: t('results.losing_clients.body'),
    };
  };

  return (
    <QuizEngine
      quizId="website"
      heroHeadline={t('hero.headline')}
      heroSubheadline={t('hero.subheadline')}
      questions={questions}
      computeResult={computeResult}
      magnet={{
        key: 'website-audit-checklist',
        name: t('magnet.name'),
        description: t('magnet.description'),
        buttonLabel: t('magnet.buttonLabel'),
        successHeadline: t('magnet.successHeadline'),
        downloadFilename: 'TC-Chambers-Website-Audit-Checklist.pdf',
        bookingCtaUrl: '/book?session=website',
        bookingCtaLabel: t('magnet.bookingCtaLabel'),
      }}
      disclaimer={t('disclaimer')}
      pdfUrl={pdfUrl}
    />
  );
}
