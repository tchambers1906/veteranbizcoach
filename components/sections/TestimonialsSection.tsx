'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

const FILTER_KEYS = ['all', 'villa', 'superpower', 'websites', 'funding', 'strategy'] as const;

// PLACEHOLDER — replace with real testimonials before launch
const PLACEHOLDER_CARDS = [
  { key: 'p1', initials: 'JD', pillar: 'villa' },
  { key: 'p2', initials: 'SK', pillar: 'superpower' },
  { key: 'p3', initials: 'AM', pillar: 'websites' },
];

export default function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'testimonials',
      pillar: 'testimonials',
      locale,
    });
  };

  const filteredCards =
    activeFilter === 'all'
      ? PLACEHOLDER_CARDS
      : PLACEHOLDER_CARDS.filter((c) => c.pillar === activeFilter);

  return (
    <section id="testimonials" className="bg-charcoal">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Headline */}
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white text-center mb-8">
            {t('headline')}
          </h2>
        </ScrollReveal>

        {/* Filter tabs */}
        <ScrollReveal delay={80}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {FILTER_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`font-body text-[14px] px-4 py-2 rounded-full transition-all ${
                  activeFilter === key
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-off-white/60 hover:text-off-white'
                }`}
              >
                {t(`filters.${key}`)}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Cards grid */}
        {/* PLACEHOLDER — replace with real testimonials before launch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {filteredCards.map((card) => (
            <ScrollReveal key={card.key} delay={60}>
              <div
                className="rounded-xl p-6 h-full transition-all"
                style={{
                  backgroundColor: '#0A1628',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00B4A6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center shrink-0">
                    <span className="font-heading font-bold text-[14px] text-gold leading-none">
                      {card.initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-[15px] text-white">
                      {t(`placeholders.${card.key}.name`)}
                    </p>
                    <p className="font-body text-[13px] text-off-white/60">
                      {t(`placeholders.${card.key}.business`)}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <p className="font-body text-[15px] leading-[1.6] text-off-white italic mb-4">
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
        <p className="font-body text-[12px] leading-[1.5] text-off-white/50 text-center mb-6">
          {t('disclaimer')}
        </p>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/testimonials"
            onClick={() => handleCtaClick('See All Testimonials')}
            className="font-body text-[15px] text-teal hover:text-teal-dark transition-colors underline underline-offset-2"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
