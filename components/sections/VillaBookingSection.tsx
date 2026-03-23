'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function VillaBookingSection() {
  const t = useTranslations('villa');

  return (
    <section id="villa-booking-traffic" className="bg-off-white">
      {/* Section header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <ScrollReveal>
          <p className="font-heading font-semibold text-[12px] text-teal uppercase tracking-widest mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-navy">
            {t('headline')}
          </h2>
        </ScrollReveal>
      </div>

      {/* Block 1 — The Problem */}
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <h3 className="font-heading font-bold text-[24px] lg:text-[28px] text-navy mb-4">
              {t('problem.heading')}
            </h3>
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-text-secondary">
              {t('problem.body')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Block 2 — Cost of Inaction */}
      <div className="bg-navy">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <h3 className="font-heading font-bold text-[24px] lg:text-[28px] text-gold mb-4">
              {t('cost.heading')}
            </h3>
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white">
              {t('cost.bodyBefore')}
              <span className="text-teal font-medium">{t('cost.highlight')}</span>
              {t('cost.bodyAfter')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Block 3 — The Solution */}
      <div className="bg-off-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <h3 className="font-heading font-bold text-[24px] lg:text-[28px] text-navy mb-4">
              {t('solution.heading')}
            </h3>
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-text-secondary">
              {t('solution.body')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Block 4 — Why It Works */}
      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {(['card1', 'card2', 'card3', 'card4'] as const).map((key) => (
                <div
                  key={key}
                  className="border-l-4 border-teal bg-off-white rounded-r-[var(--radius-card)] px-6 py-5"
                >
                  <p className="font-heading font-bold text-[16px] text-navy mb-1">
                    {t(`whyWorks.${key}`)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Block 5 — Who It's For */}
      <div className="bg-off-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-text-secondary mb-4">
              {t('whoFor.body')}
            </p>
            <p className="font-body text-[15px] leading-[1.6] text-text-secondary/80 italic">
              {t('whoFor.secondary')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-4">
        <p className="font-body text-[12px] leading-[1.5] text-text-secondary/60">
          {t('disclaimer')}
        </p>
      </div>

      {/* CTA Block */}
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <ScrollReveal>
            <h3 className="font-heading font-bold text-[24px] lg:text-[32px] text-navy mb-6">
              {t('cta.heading')}
            </h3>
            <Link
              href="/book?session=villa"
              className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all"
            >
              {t('cta.button')}
            </Link>
            <p className="font-body text-[14px] text-text-secondary mt-4">
              {t('cta.note')}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
