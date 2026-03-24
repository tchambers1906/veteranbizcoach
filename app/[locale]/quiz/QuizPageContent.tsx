'use client';

import { useTranslations } from 'next-intl';
import QuizSection from '@/components/sections/QuizSection';

export default function QuizPageContent() {
  const t = useTranslations('quizPage');

  return (
    <>
      {/* Hero block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h1 className="font-heading font-extrabold text-[34px] lg:text-[54px] leading-[1.05] text-white mb-6">
            {t('headline')}
          </h1>
          <p className="font-body font-normal text-[18px] lg:text-[20px] leading-[1.7] text-off-white max-w-[600px] mx-auto">
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Quiz component */}
      <QuizSection />
    </>
  );
}
