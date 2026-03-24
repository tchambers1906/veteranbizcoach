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
    <section id="websites-pwas">
      {/* Section Header — background image */}
      <div
        className="relative bg-cover bg-scroll min-h-[280px] md:min-h-[420px] md:bg-[center_25%] bg-[center_20%]"
        style={{
          backgroundImage: "url('/images/websites-pwas-bg.jpg')",
        }}
      >
        {/* Gradient overlay — mobile 0.72 top for contrast, desktop 0.65 to show Agung and terraces */}
        <div
          className="absolute inset-0 z-0 md:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.72) 0%, rgba(10,22,40,0.80) 60%, rgba(10,22,40,0.97) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-0 hidden md:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.80) 60%, rgba(10,22,40,0.97) 100%)',
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
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white mt-6 max-w-2xl mx-auto">
              {t('subheadline')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Feature Cards — 2x2 grid on deep navy */}
      <div className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {CARD_KEYS.map((num, idx) => {
              const Icon = CARD_ICONS[idx];
              return (
                <ScrollReveal key={num} delay={num * 60}>
                  <div
                    className="group rounded-xl p-6 h-full transition-all"
                    style={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid rgba(201,168,76,0.15)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#C9A84C';
                      e.currentTarget.style.borderBottom = '3px solid #00B4A6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)';
                      e.currentTarget.style.borderBottom = '1px solid rgba(201,168,76,0.15)';
                    }}
                  >
                    <Icon className="w-8 h-8 text-gold mb-4" strokeWidth={1.5} />
                    <h3 className="font-heading font-bold text-[17px] text-white mb-2">
                      {t(`cards.c${num}.heading`)}
                    </h3>
                    <p className="font-body text-[15px] leading-[1.6] text-off-white">
                      {t(`cards.c${num}.body`)}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* CTA — gold block */}
        <div className="bg-gold">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-center">
            <ScrollReveal>
              <Link
                href="/book?session=website"
                onClick={() => handleCtaClick('Book a Website/PWA Discovery Call')}
                className="inline-flex items-center justify-center font-heading font-semibold text-base text-white px-8 py-4 rounded-lg min-h-[44px] transition-all hover:bg-charcoal"
                style={{ backgroundColor: '#0A1628' }}
              >
                {t('cta.button')}
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
