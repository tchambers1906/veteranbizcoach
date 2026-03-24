'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import QuizEngine from './QuizEngine';
import type { QuizQuestion, QuizResult } from './QuizEngine';

interface VillaReadinessQuizProps {
  pdfUrl: string;
}

export default function VillaReadinessQuiz({ pdfUrl }: VillaReadinessQuizProps) {
  const t = useTranslations('villaQuiz');

  const questions: QuizQuestion[] = useMemo(
    () => [
      {
        id: 'q1',
        type: 'text' as const,
        text: t('q1.text'),
        placeholder: t('q1.placeholder'),
        maxLength: 20,
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
        ],
      },
      {
        id: 'q3',
        type: 'text' as const,
        text: t('q3.text'),
        placeholder: t('q3.placeholder'),
        maxLength: 30,
      },
      {
        id: 'q4',
        type: 'multiple-choice' as const,
        text: t('q4.text'),
        options: [
          { value: 'a', label: t('q4.o1') },
          { value: 'b', label: t('q4.o2') },
          { value: 'c', label: t('q4.o3') },
          { value: 'd', label: t('q4.o4') },
        ],
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
        type: 'text' as const,
        text: t('q6.text'),
        placeholder: t('q6.placeholder'),
        maxLength: 100,
      },
    ],
    [t],
  );

  const computeResult = (answers: Record<string, string>): QuizResult => {
    const q2 = answers.q2;
    const q4 = answers.q4;

    // Critical: entirely OTA dependent + formal or informal notice
    if (q4 === 'd' && (q2 === 'a' || q2 === 'b')) {
      return {
        id: 'critical',
        headline: t('results.critical.headline'),
        body: t('results.critical.body'),
      };
    }

    // Moderate: working on it or weak one
    if (q4 === 'c' || q4 === 'b') {
      return {
        id: 'moderate',
        headline: t('results.moderate.headline'),
        body: t('results.moderate.body'),
      };
    }

    // Low: strong one
    if (q4 === 'a') {
      return {
        id: 'low',
        headline: t('results.low.headline'),
        body: t('results.low.body'),
      };
    }

    // Default
    return {
      id: 'general',
      headline: t('results.general.headline'),
      body: t('results.general.body'),
    };
  };

  return (
    <QuizEngine
      quizId="villa"
      heroHeadline={t('hero.headline')}
      heroSubheadline={t('hero.subheadline')}
      questions={questions}
      computeResult={computeResult}
      magnet={{
        key: 'villa-survival-guide',
        name: t('magnet.name'),
        description: t('magnet.description'),
        buttonLabel: t('magnet.buttonLabel'),
        successHeadline: t('magnet.successHeadline'),
        downloadFilename: 'TC-Chambers-Villa-Survival-Guide.pdf',
        bookingCtaUrl: '/book?session=villa',
        bookingCtaLabel: t('magnet.bookingCtaLabel'),
      }}
      disclaimer={t('disclaimer')}
      pdfUrl={pdfUrl}
    />
  );
}
