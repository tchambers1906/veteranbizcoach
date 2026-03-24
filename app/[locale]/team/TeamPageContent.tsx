'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';
import Image from 'next/image';
import { Plus } from 'lucide-react';

function AvatarPlaceholder({ initials, isPlaceholderCard, size = 24 }: { initials: string; isPlaceholderCard?: boolean; size?: number }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-charcoal flex items-center justify-center shrink-0`}
      style={{ width: size * 4, height: size * 4 }}>
      {isPlaceholderCard ? (
        <Plus className="w-8 h-8 text-gold" strokeWidth={2} />
      ) : (
        <span className="font-heading font-bold text-[26px] text-gold leading-none">{initials}</span>
      )}
    </div>
  );
}

function PhotoAvatar({ src, alt, initials, size = 96 }: { src: string; alt: string; initials: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <AvatarPlaceholder initials={initials} />;
  }

  return (
    <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 bg-charcoal">
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        style={{ objectPosition: 'center top' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

const MEMBERS = [
  { key: 'm1', photo: '/images/tc-team.jpg', initials: 'TC', hasPhoto: true },
  { key: 'm2', photo: '/images/rita-rosita.jpg', initials: 'RR', hasPhoto: true },
  { key: 'm3', photo: '/images/tami-rini.jpg', initials: 'TR', hasPhoto: true },
  { key: 'm4', photo: '/images/tobias-kaiuth.jpg', initials: 'TK', hasPhoto: true },
];

export default function TeamPageContent() {
  const t = useTranslations('teamPage');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'team-page',
      pillar: 'team',
      locale,
    });
  };

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

      {/* Team cards */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MEMBERS.map((member, idx) => {
              const isPlaceholder = member.isPlaceholder;

              return (
                <ScrollReveal key={member.key} delay={idx * 100}>
                  <div
                    className={`bg-white rounded-[var(--radius-card)] p-8 h-full transition-shadow ${
                      isPlaceholder
                        ? 'border-2 border-dashed border-gray-300 opacity-60'
                        : 'border border-gray-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-5 mb-6">
                      {member.hasPhoto ? (
                        <PhotoAvatar
                          src={member.photo!}
                          alt={t(`${member.key}.name`)}
                          initials={member.initials!}
                        />
                      ) : (
                        <AvatarPlaceholder
                          initials={member.initials!}
                          isPlaceholderCard={isPlaceholder}
                        />
                      )}
                      <div>
                        <h2 className="font-heading font-bold text-[20px] text-navy">
                          {t(`${member.key}.name`)}
                        </h2>
                        <p className="font-body font-medium text-[15px] text-teal">
                          {t(`${member.key}.title`)}
                        </p>
                      </div>
                    </div>

                    {/* Full bio */}
                    <p className="font-body text-[15px] leading-[1.7] text-text-secondary mb-6">
                      {t(`${member.key}.bio`)}
                    </p>

                    {/* Expertise tags */}
                    <div className="flex flex-wrap gap-2">
                      {(t.raw(`${member.key}.tags`) as string[]).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-block font-body text-[12px] text-gold bg-gold/10 px-3 py-1.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
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
              onClick={() => handleCtaClick('Book a Free Strategy Call - Team Page')}
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
