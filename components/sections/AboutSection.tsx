'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';
import { Check, Instagram, Facebook, Linkedin } from 'lucide-react';

const CREDENTIAL_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://www.instagram.com/miamitc/', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/t.c.chambers.2025', label: 'Facebook' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/t-c-chambers-55b33223/', label: 'LinkedIn' },
];

export default function AboutSection() {
  const t = useTranslations('about');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'about',
      pillar: 'about',
      locale,
    });
  };

  return (
    <section
      id="about"
      className="relative bg-cover bg-scroll bg-[center_15%] md:bg-[center_top]"
      style={{
        backgroundImage: "url('/images/tc-about-bg.jpg')",
        minHeight: undefined,
      }}
    >
      {/* Overlay — mobile: solid dark for legibility; desktop: gradient left-heavy to reveal T.C. on right */}
      <div
        className="absolute inset-0 z-0 md:hidden"
        style={{ backgroundColor: 'rgba(10,22,40,0.88)' }}
      />
      <div
        className="absolute inset-0 z-0 hidden md:block"
        style={{
          background:
            'linear-gradient(105deg, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.85) 40%, rgba(10,22,40,0.55) 65%, rgba(10,22,40,0.30) 100%)',
        }}
      />

      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:min-h-[600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">
          {/* LEFT — Narrative */}
          <div>
            <ScrollReveal>
              <p className="font-heading font-semibold text-[12px] text-teal uppercase tracking-widest mb-4">
                {t('eyebrow')}
              </p>
              <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white mb-8">
                {t('headline')}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="space-y-5">
                <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white">
                  {t('p1')}
                </p>
                <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white">
                  {t('p2')}
                </p>
                <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white">
                  {t('p3')}
                </p>
                <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white">
                  {t('p4')}
                </p>
              </div>
            </ScrollReveal>

            {/* Mission Callout */}
            <ScrollReveal delay={200}>
              <blockquote className="mt-10 bg-navy border-l-4 border-gold rounded-r-[var(--radius-card)] px-6 py-5">
                <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-white italic">
                  {t('mission')}
                </p>
              </blockquote>
            </ScrollReveal>
          </div>

          {/* RIGHT — Credentials Sidebar */}
          <div>
            <ScrollReveal delay={150}>
              <div className="bg-charcoal rounded-[var(--radius-card)] p-8 lg:sticky lg:top-28">
                <h3 className="font-heading font-bold text-[18px] text-gold mb-6">
                  {t('credentials.heading')}
                </h3>

                <ul className="space-y-3.5 mb-8">
                  {CREDENTIAL_KEYS.map((num) => (
                    <li key={num} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="font-body text-[15px] leading-[1.5] text-white/90">
                        {t(`credentials.c${num}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Social Links */}
                <div className="flex items-center gap-4 mb-5">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold-light transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>

                {/* Read the full story */}
                <Link
                  href="/about"
                  onClick={() => handleCtaClick('Read the full story')}
                  className="font-body text-[15px] text-teal hover:text-teal-dark transition-colors underline underline-offset-2"
                >
                  {t('readMore')}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
