'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import QuizEngine from './QuizEngine';
import type { QuizQuestion, QuizResult } from './QuizEngine';

interface SuperpowerDiscoveryQuizProps {
  pdfUrl: string;
}

export default function SuperpowerDiscoveryQuiz({ pdfUrl }: SuperpowerDiscoveryQuizProps) {
  const t = useTranslations('superpowerQuiz');

  const questions: QuizQuestion[] = useMemo(
    () => [
      {
        id: 'q1',
        type: 'textarea' as const,
        text: t('q1.text'),
        placeholder: t('q1.placeholder'),
        maxLength: 300,
        rows: 3,
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
        type: 'textarea' as const,
        text: t('q4.text'),
        placeholder: t('q4.placeholder'),
        maxLength: 300,
        rows: 3,
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
        type: 'textarea' as const,
        text: t('q6.text'),
        placeholder: t('q6.placeholder'),
        maxLength: 300,
        rows: 3,
      },
    ],
    [t],
  );

  const computeResult = (answers: Record<string, string>): QuizResult => {
    const q2 = answers.q2;
    const q3 = answers.q3;
    const q5 = answers.q5;

    // System needed: people recognize value + stuck or don't know where to start
    if ((q2 === 'a' || q2 === 'c') && (q3 === 'a' || q3 === 'c')) {
      return {
        id: 'system_needed',
        headline: t('results.system_needed.headline'),
        body: t('results.system_needed.body'),
      };
    }

    // Discovery needed: uncertain reactions + doubt about monetization
    if ((q2 === 'e' || q2 === 'd') && q3 === 'b') {
      return {
        id: 'discovery_needed',
        headline: t('results.discovery_needed.headline'),
        body: t('results.discovery_needed.body'),
      };
    }

    // Underutilized: already making money or established
    if (q5 === 'c' || q5 === 'd') {
      return {
        id: 'underutilized',
        headline: t('results.underutilized.headline'),
        body: t('results.underutilized.body'),
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
      quizId="superpower"
      heroHeadline={t('hero.headline')}
      heroSubheadline={t('hero.subheadline')}
      questions={questions}
      computeResult={computeResult}
      magnet={{
        key: 'superpower-discovery-workbook',
        name: t('magnet.name'),
        description: t('magnet.description'),
        buttonLabel: t('magnet.buttonLabel'),
        successHeadline: t('magnet.successHeadline'),
        downloadFilename: 'TC-Chambers-Superpower-Workbook.pdf',
        bookingCtaUrl: '/resources?waitlist=superpower',
        bookingCtaLabel: t('magnet.bookingCtaLabel'),
      }}
      disclaimer={t('disclaimer')}
      pdfUrl={pdfUrl}
    />
  );
}
