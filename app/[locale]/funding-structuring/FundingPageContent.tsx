'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import FundingSection from '@/components/sections/FundingSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

export default function FundingPageContent() {
  const t = useTranslations('fundingPage');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'funding-page',
      pillar: 'funding',
      locale,
    });
  };

  return (
    <>
      {/* Hero block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h1 className="font-heading font-extrabold text-[30px] lg:text-[54px] leading-[1.05] text-white mb-6">
            {t('headline')}
          </h1>
          <p className="font-body font-normal text-[18px] lg:text-[20px] leading-[1.7] text-off-white max-w-[640px] mx-auto">
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Full section content */}
      <FundingSection />

      {/* CTA block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-[28px] lg:text-[36px] text-white mb-8">
              {t('ctaHeading')}
            </h2>
            <Link
              href="/book?session=funding"
              onClick={() => handleCtaClick('Book a Funding Strategy Call - Funding Page')}
              className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all"
            >
              {t('ctaButton')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
