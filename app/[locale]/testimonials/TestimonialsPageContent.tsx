'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

const FILTER_KEYS = ['all', 'villa', 'superpower', 'websites', 'funding', 'strategy'] as const;

// PLACEHOLDER - replace with real testimonials before launch
const PLACEHOLDER_CARDS = [
  { key: 'p1', initials: 'VB' },
  { key: 'p2', initials: 'VL' },
  { key: 'p3', initials: 'SP' },
  { key: 'p4', initials: 'SE' },
  { key: 'p5', initials: 'WB' },
  { key: 'p6', initials: 'EC' },
];

export default function TestimonialsPageContent() {
  const t = useTranslations('testimonialsPage');
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'testimonials-page',
      pillar: 'testimonials',
      locale,
    });
  };

  const filteredCards =
    activeFilter === 'all'
      ? PLACEHOLDER_CARDS
      : PLACEHOLDER_CARDS.filter((c) => t(`placeholders.${c.key}.pillar`) === activeFilter);

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

      {/* Testimonials grid */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Filter tabs */}
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {FILTER_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`font-body text-[14px] px-4 py-2 rounded-full transition-all ${
                    activeFilter === key
                      ? 'text-navy border-b-2 border-teal bg-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t(`filters.${key}`)}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Cards grid */}
          {/* PLACEHOLDER - replace with real testimonials before launch */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredCards.map((card, idx) => (
              <ScrollReveal key={card.key} delay={idx * 60}>
                <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-sm h-full">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-charcoal flex items-center justify-center shrink-0">
                      <span className="font-heading font-bold text-[15px] text-gold leading-none">
                        {card.initials}
                      </span>
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-[15px] text-navy">
                        {t(`placeholders.${card.key}.name`)}
                      </p>
                      <p className="font-body text-[13px] text-gray-400">
                        {t(`placeholders.${card.key}.business`)}
                      </p>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="font-body text-[15px] leading-[1.6] text-text-secondary italic mb-4">
                    &ldquo;{t(`placeholders.${card.key}.quote`)}&rdquo;
                  </p>

                  {/* Result badge */}
                  <span className="inline-block font-body text-[12px] text-white bg-teal px-3 py-1 rounded-full">
                    {t(`placeholders.${card.key}.result`)}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="font-body text-[12px] leading-[1.5] text-text-secondary/60 text-center">
            {t('disclaimer')}
          </p>
        </div>
      </section>

      {/* CTA block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-[28px] lg:text-[36px] text-white mb-8">
              {t('ctaHeading')}
            </h2>
            <Link
              href="/book"
              onClick={() => handleCtaClick('Book a Free Strategy Call - Testimonials Page')}
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
