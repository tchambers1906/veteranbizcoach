'use client';

import { useTranslations } from 'next-intl';

const DISCLAIMER_KEYS = ['general', 'funding', 'program', 'testimonial', 'villa'] as const;

export default function DisclaimerContent() {
  const t = useTranslations('disclaimerPage');

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h1 className="font-heading font-bold text-[32px] lg:text-[42px] text-navy mb-10">
          {t('heading')}
        </h1>

        <div className="space-y-8">
          {DISCLAIMER_KEYS.map((key) => (
            <div key={key}>
              <h2 className="font-heading font-bold text-[20px] lg:text-[22px] text-navy mb-3">
                {t(`${key}.heading`)}
              </h2>
              <p className="font-body text-[16px] leading-[1.7] text-text-secondary">
                {t(`${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
