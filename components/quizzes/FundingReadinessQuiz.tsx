'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import QuizEngine from './QuizEngine';
import type { QuizQuestion, QuizResult } from './QuizEngine';

interface FundingReadinessQuizProps {
  pdfUrl: string;
}

export default function FundingReadinessQuiz({ pdfUrl }: FundingReadinessQuizProps) {
  const t = useTranslations('fundingQuiz');

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
          { value: 'e', label: t('q1.o5') },
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
        type: 'multiple-choice' as const,
        text: t('q4.text'),
        options: [
          { value: 'a', label: t('q4.o1') },
          { value: 'b', label: t('q4.o2') },
          { value: 'c', label: t('q4.o3') },
          { value: 'd', label: t('q4.o4') },
          { value: 'e', label: t('q4.o5') },
        ],
      },
      {
        id: 'q5',
        type: 'textarea' as const,
        text: t('q5.text'),
        placeholder: t('q5.placeholder'),
        maxLength: 300,
        rows: 3,
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
    const q2 = answers.q2;
    const q3 = answers.q3;
    const q4 = answers.q4;

    const hasEntity = q1 === 'a' || q1 === 'b' || q1 === 'c';
    const noEntity = q1 === 'd' || q1 === 'e';
    const hasAccount = q2 === 'a' || q2 === 'b';
    const noAccount = q2 === 'c' || q2 === 'd';
    const lowCredit = q3 === 'd' || q3 === 'e';
    const neverApplied = q4 === 'c' || q4 === 'd' || q4 === 'e';

    // Foundation missing: no entity + no business account
    if (noEntity && noAccount) {
      return {
        id: 'foundation_missing',
        headline: t('results.foundation_missing.headline'),
        body: t('results.foundation_missing.body'),
      };
    }

    // Credit positioning: has entity + low/unknown credit
    if (hasEntity && lowCredit) {
      return {
        id: 'credit_positioning',
        headline: t('results.credit_positioning.headline'),
        body: t('results.credit_positioning.body'),
      };
    }

    // Declined before
    if (q4 === 'b') {
      return {
        id: 'declined_before',
        headline: t('results.declined_before.headline'),
        body: t('results.declined_before.body'),
      };
    }

    // Ready to apply: has entity + has account + never applied
    if (hasEntity && hasAccount && neverApplied) {
      return {
        id: 'ready_to_apply',
        headline: t('results.ready_to_apply.headline'),
        body: t('results.ready_to_apply.body'),
      };
    }

    // Scale ready: previously approved
    if (q4 === 'a') {
      return {
        id: 'scale_ready',
        headline: t('results.scale_ready.headline'),
        body: t('results.scale_ready.body'),
      };
    }

    // Default
    return {
      id: 'foundation_missing',
      headline: t('results.foundation_missing.headline'),
      body: t('results.foundation_missing.body'),
    };
  };

  return (
    <QuizEngine
      quizId="funding"
      heroHeadline={t('hero.headline')}
      heroSubheadline={t('hero.subheadline')}
      questions={questions}
      computeResult={computeResult}
      magnet={{
        key: 'business-funding-blueprint',
        name: t('magnet.name'),
        description: t('magnet.description'),
        buttonLabel: t('magnet.buttonLabel'),
        successHeadline: t('magnet.successHeadline'),
        downloadFilename: 'TC-Chambers-Funding-Blueprint.pdf',
        bookingCtaUrl: '/book?session=funding',
        bookingCtaLabel: t('magnet.bookingCtaLabel'),
      }}
      disclaimer={t('disclaimer')}
      pdfUrl={pdfUrl}
    />
  );
}
