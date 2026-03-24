'use client';

import { useTranslations } from 'next-intl';

const SECTION_KEYS = ['dataCollect', 'howWeUse', 'thirdParty', 'yourRights', 'dataSecurity'] as const;

export default function PrivacyPolicyContent() {
  const t = useTranslations('privacyPolicy');

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h1 className="font-heading font-bold text-[32px] lg:text-[42px] text-navy mb-2">
          {t('heading')}
        </h1>
        <p className="font-body text-[14px] text-text-secondary mb-10">
          {t('lastUpdated')}
        </p>

        <div className="space-y-8">
          {SECTION_KEYS.map((key) => (
            <div key={key}>
              <h2 className="font-heading font-bold text-[20px] lg:text-[22px] text-navy mb-3">
                {t(`sections.${key}.heading`)}
              </h2>
              <p className="font-body text-[16px] leading-[1.7] text-text-secondary">
                {t(`sections.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
