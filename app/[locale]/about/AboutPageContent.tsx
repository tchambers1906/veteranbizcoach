'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';
import { Check, Instagram, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';

const CREDENTIAL_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://www.instagram.com/miamitc/', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/t.c.chambers.2025', label: 'Facebook' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/t-c-chambers-55b33223/', label: 'LinkedIn' },
];

export default function AboutPageContent() {
  const t = useTranslations('aboutPage');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'about-page',
      pillar: 'about',
      locale,
    });
  };

  return (
    <>
      {/* Hero block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <p className="font-heading font-semibold text-[13px] text-gold uppercase tracking-[0.2em] mb-4">
            {t('eyebrow')}
          </p>
          <h1 className="font-heading font-extrabold text-[34px] lg:text-[54px] leading-[1.05] text-white mb-6">
            {t('headline')}
          </h1>
          <p className="font-body font-normal text-[18px] lg:text-[20px] leading-[1.7] text-off-white max-w-[600px] mx-auto">
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Photo + Bio layout */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 lg:gap-14">
            {/* Photo */}
            <ScrollReveal>
              <div className="flex justify-center lg:justify-start">
                <div className="w-full max-w-[400px] rounded-2xl overflow-hidden border-2 border-gold shadow-lg">
                  <Image
                    src="/images/tc-headshot.jpg"
                    alt="T.C. Chambers - Amazon Bestselling Author and AI-First Business Strategist"
                    width={400}
                    height={500}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </ScrollReveal>

            <div>
              <ScrollReveal delay={100}>
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num}>
                      <h2 className="font-heading font-bold text-[22px] text-gold mb-4">
                        {t(`sh${num}`)}
                      </h2>
                      <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-text-secondary">
                        {t(`p${num}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Mission callout */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <ScrollReveal>
            <blockquote className="border-l-4 border-gold pl-6 lg:pl-8">
              <p className="font-body text-[18px] lg:text-[20px] leading-[1.7] text-white italic">
                {t('mission')}
              </p>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* Credentials grid */}
      <section className="bg-charcoal">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <ScrollReveal>
            <h2 className="font-heading font-bold text-[24px] lg:text-[28px] text-gold mb-8">
              {t('credentials.heading')}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CREDENTIAL_KEYS.map((num) => (
              <ScrollReveal key={num} delay={num * 60}>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="font-body text-[16px] leading-[1.5] text-white/90">
                    {t(`credentials.c${num}`)}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Social links */}
          <ScrollReveal delay={500}>
            <div className="flex items-center gap-5 mt-10">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </ScrollReveal>

          {/* Funding disclaimer */}
          <ScrollReveal delay={600}>
            <p className="font-body text-[12px] leading-[1.5] text-white/40 mt-10">
              {t('fundingDisclaimer')}
            </p>
            <p className="font-body text-[12px] leading-[1.5] text-white/40 mt-3">
              {t('programDisclaimer')}
            </p>
          </ScrollReveal>
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
              onClick={() => handleCtaClick('Book a Free Strategy Call - About Page')}
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
