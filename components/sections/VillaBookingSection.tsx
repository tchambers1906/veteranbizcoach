'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';
import { DollarSign, Users, ShieldCheck, TrendingUp } from 'lucide-react';

export default function VillaBookingSection() {
  const t = useTranslations('villa');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'villa-booking-traffic',
      pillar: 'villa',
      locale,
    });
  };

  return (
    <section id="villa-booking-traffic">
      {/* Section hero — Bali villa background */}
      <div
        className="relative bg-cover bg-scroll min-h-[320px] md:min-h-[480px] md:bg-[center_40%] bg-[center_35%]"
        style={{
          backgroundImage: "url('/images/villa-bali-bg.jpg')",
        }}
      >
        {/* Gradient overlay — mobile 0.65 top for small-text contrast, desktop 0.55 to show teal pool and purple sky */}
        <div
          className="absolute inset-0 z-0 md:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.70) 55%, rgba(10,22,40,0.95) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-0 hidden md:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.55) 0%, rgba(10,22,40,0.70) 55%, rgba(10,22,40,0.95) 100%)',
          }}
        />
        <div className="relative z-[1] mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
          <ScrollReveal>
            <p className="font-heading font-semibold text-[12px] text-teal uppercase tracking-widest mb-4">
              {t('eyebrow')}
            </p>
            <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white">
              {t('headline')}
            </h2>
          </ScrollReveal>
        </div>
      </div>

      {/* Block 1 — The Problem */}
      <div className="bg-navy">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <h3 className="font-heading font-bold text-[24px] lg:text-[28px] text-gold mb-4">
              {t('problem.heading')}
            </h3>
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white">
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

      {/* Block 3 — The Solution / Meta Traffic — with traffic streams background */}
      <div
        className="relative bg-cover bg-scroll bg-center"
        style={{
          backgroundImage: "url('/images/meta-traffic-bg.jpg')",
        }}
      >
        {/* Solid overlay — mobile 5% stronger for contrast */}
        <div
          className="absolute inset-0 z-0 md:hidden"
          style={{ backgroundColor: 'rgba(10,22,40,0.73)' }}
        />
        <div
          className="absolute inset-0 z-0 hidden md:block"
          style={{ backgroundColor: 'rgba(10,22,40,0.78)' }}
        />
        <div className="relative z-[1] mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <h3 className="font-heading font-bold text-[24px] lg:text-[28px] text-gold mb-4">
              {t('solution.heading')}
            </h3>
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white">
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
              onClick={() => handleCtaClick('Book a Villa Traffic Strategy Call')}
              className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all"
            >
              {t('cta.button')}
            </Link>
            <div className="mt-3">
              <Link
                href="/quiz/villa"
                className="font-body font-medium text-[14px] text-teal hover:underline transition-colors"
              >
                Take the Villa Readiness Quiz
              </Link>
            </div>
            <p className="font-body text-[14px] text-text-secondary mt-4">
              {t('cta.note')}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
