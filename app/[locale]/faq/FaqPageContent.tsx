'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import FaqSection from '@/components/sections/FaqSection';
import { track } from '@/lib/analytics';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function FaqPageContent() {
  const t = useTranslations('faqPage');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'faq-page',
      pillar: 'faq',
      locale,
    });
  };

  return (
    <>
      {/* Hero block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h1 className="font-heading font-extrabold text-[34px] lg:text-[54px] leading-[1.05] text-white">
            {t('headline')}
          </h1>
        </div>
      </section>

      {/* FAQ section (reused from homepage) */}
      <FaqSection />

      {/* CTA block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-[28px] lg:text-[36px] text-white mb-8">
              {t('ctaHeading')}
            </h2>
            <Link
              href="/book"
              onClick={() => handleCtaClick('Book a Free Strategy Call - FAQ Page')}
              className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all"
            >
              {t('ctaButton')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
