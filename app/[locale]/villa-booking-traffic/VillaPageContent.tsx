'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import VillaBookingSection from '@/components/sections/VillaBookingSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

export default function VillaPageContent() {
  const t = useTranslations('villaPage');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'villa-page',
      pillar: 'villa',
      locale,
    });
  };

  return (
    <>
      {/* Hero block */}
      <section
        className="relative bg-cover bg-scroll min-h-[320px] md:min-h-[480px] md:bg-[center_40%] bg-[center_35%]"
        style={{ backgroundImage: "url('/images/villa-bali-bg.jpg')" }}
      >
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
        <div className="relative z-[1] mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center flex flex-col justify-center min-h-[320px] md:min-h-[480px]">
          <h1 className="font-heading font-extrabold text-[30px] lg:text-[54px] leading-[1.05] text-white mb-6">
            {t('headline')}
          </h1>
          <p className="font-body font-normal text-[18px] lg:text-[20px] leading-[1.7] text-off-white max-w-[640px] mx-auto">
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Full section content */}
      <VillaBookingSection />

      {/* CTA block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <ScrollReveal>
            <h2 className="font-heading font-extrabold text-[28px] lg:text-[36px] text-white mb-8">
              {t('ctaHeading')}
            </h2>
            <Link
              href="/book?session=villa"
              onClick={() => handleCtaClick('Book a Free Strategy Call - Villa Page')}
              className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all"
            >
              {t('ctaButton')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
