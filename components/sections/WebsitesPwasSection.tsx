'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';
import { Smartphone, Cpu, BarChart3, Globe } from 'lucide-react';

const CARD_ICONS = [Smartphone, Cpu, BarChart3, Globe] as const;
const CARD_KEYS = [1, 2, 3, 4] as const;

export default function WebsitesPwasSection() {
  const t = useTranslations('websites');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'websites-pwas',
      pillar: 'websites',
      locale,
    });
  };

  return (
    <section id="websites-pwas" className="bg-off-white">
      {/* Section Header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <ScrollReveal>
          <p className="font-heading font-semibold text-[12px] text-teal uppercase tracking-widest mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-navy">
            {t('headline')}
          </h2>
          <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-text-secondary mt-6 max-w-2xl mx-auto">
            {t('subheadline')}
          </p>
        </ScrollReveal>
      </div>

      {/* Feature Cards — 2x2 grid */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CARD_KEYS.map((num, idx) => {
            const Icon = CARD_ICONS[idx];
            return (
              <ScrollReveal key={num} delay={num * 60}>
                <div className="group bg-white rounded-[var(--radius-card)] p-6 shadow-sm border border-transparent hover:border-teal transition-all h-full">
                  <Icon className="w-8 h-8 text-gold mb-4" strokeWidth={1.5} />
                  <h3 className="font-heading font-bold text-[17px] text-navy mb-2">
                    {t(`cards.c${num}.heading`)}
                  </h3>
                  <p className="font-body text-[15px] leading-[1.6] text-text-secondary">
                    {t(`cards.c${num}.body`)}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <ScrollReveal>
          <Link
            href="/book?session=website"
            onClick={() => handleCtaClick('Book a Website/PWA Discovery Call')}
            className="inline-flex items-center justify-center font-heading font-semibold text-base bg-teal text-white px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all"
          >
            {t('cta.button')}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
