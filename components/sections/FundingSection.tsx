'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

const PROOF_KEYS = [1, 2, 3] as const;

export default function FundingSection() {
  const t = useTranslations('funding');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'funding-structuring',
      pillar: 'funding',
      locale,
    });
  };

  return (
    <section id="funding-structuring" className="bg-navy">
      {/* Section Header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <ScrollReveal>
          <p className="font-heading font-semibold text-[12px] text-gold uppercase tracking-widest mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white">
            {t('headline')}
          </h2>
          <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white/80 mt-6 max-w-2xl mx-auto">
            {t('subheadline')}
          </p>
        </ScrollReveal>
      </div>

      {/* Proof Point Cards — 3 in a row */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROOF_KEYS.map((num) => (
            <ScrollReveal key={num} delay={num * 80}>
              <div className="bg-charcoal rounded-[var(--radius-card)] p-6 h-full">
                <h3 className="font-heading font-bold text-[17px] text-gold mb-2">
                  {t(`proofCards.p${num}.heading`)}
                </h3>
                <p className="font-body text-[15px] leading-[1.6] text-white/80">
                  {t(`proofCards.p${num}.body`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Body Copy Block */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12">
        <ScrollReveal>
          <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white/80">
            {t('bodyCopy')}
          </p>
        </ScrollReveal>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-8 text-center">
        <ScrollReveal>
          <Link
            href="/book?session=funding"
            onClick={() => handleCtaClick('Get Your Funding Roadmap. Book a Call.')}
            className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all"
          >
            {t('cta.button')}
          </Link>
        </ScrollReveal>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20">
        <p className="font-body text-[12px] leading-[1.5] text-gold/60">
          {t('disclaimer')}
        </p>
      </div>
    </section>
  );
}
