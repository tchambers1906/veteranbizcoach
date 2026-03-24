'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import WebsitesPwasSection from '@/components/sections/WebsitesPwasSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

export default function WebsitesPageContent() {
  const t = useTranslations('websitesPage');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'websites-page',
      pillar: 'websites',
      locale,
    });
  };

  return (
    <>
      {/* Hero block — villa bg matching homepage section */}
      <section
        className="relative bg-cover bg-scroll min-h-[380px] md:min-h-[560px] md:bg-[center_65%] bg-[center_70%]"
        style={{ backgroundImage: "url('/images/websites-pwas-bg.jpg')" }}
      >
        <div
          className="absolute inset-0 z-0 md:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.45) 0%, rgba(10,22,40,0.50) 40%, rgba(10,22,40,0.92) 85%, rgba(10,22,40,0.98) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-0 hidden md:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.35) 0%, rgba(10,22,40,0.50) 40%, rgba(10,22,40,0.92) 85%, rgba(10,22,40,0.98) 100%)',
          }}
        />
        <div className="relative z-[1] mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center flex flex-col justify-center min-h-[380px] md:min-h-[560px]">
          <h1
            className="font-heading font-extrabold text-[30px] lg:text-[54px] leading-[1.05] text-white mb-6"
            style={{ textShadow: '0 2px 12px rgba(10,22,40,0.8)' }}
          >
            {t('headline')}
          </h1>
          <p
            className="font-body font-normal text-[18px] lg:text-[20px] leading-[1.7] text-off-white max-w-[640px] mx-auto"
            style={{ textShadow: '0 2px 12px rgba(10,22,40,0.8)' }}
          >
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Full section content */}
      <WebsitesPwasSection />

      {/* CTA block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-[28px] lg:text-[36px] text-white mb-8">
              {t('ctaHeading')}
            </h2>
            <Link
              href="/book?session=website"
              onClick={() => handleCtaClick('Book a Discovery Call - Websites Page')}
              className="inline-flex items-center justify-center font-heading font-semibold text-base bg-teal text-white px-8 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all"
            >
              {t('ctaButton')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
