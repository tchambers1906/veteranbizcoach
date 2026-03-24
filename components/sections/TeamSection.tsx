'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Image from 'next/image';
import { Plus } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Avatar placeholder with initials                                  */
/* ------------------------------------------------------------------ */
function AvatarPlaceholder({ initials, isPlaceholderCard }: { initials: string; isPlaceholderCard?: boolean }) {
  return (
    <div className="w-20 h-20 rounded-full bg-charcoal flex items-center justify-center shrink-0">
      {isPlaceholderCard ? (
        <Plus className="w-7 h-7 text-gold" strokeWidth={2} />
      ) : (
        <span className="font-heading font-bold text-[22px] text-gold leading-none">{initials}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Photo avatar with fallback to initials                            */
/* ------------------------------------------------------------------ */
function PhotoAvatar({ src, alt, initials }: { src: string; alt: string; initials: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <AvatarPlaceholder initials={initials} />;
  }

  return (
    <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 bg-charcoal">
      <Image
        src={src}
        alt={alt}
        width={80}
        height={80}
        className="w-full h-full object-cover object-center-top"
        style={{ objectPosition: 'center top' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function TeamSection() {
  const t = useTranslations('team');

  const members = [
    { key: 'm1', photo: '/images/tc-headshot.jpg', initials: 'TC', hasPhoto: true },
    { key: 'm2', photo: '/images/rita-rosita.jpg', initials: 'RR', hasPhoto: true },
    { key: 'm3', photo: '/images/tami-rini.jpg', initials: 'TR', hasPhoto: true },
    { key: 'placeholder', initials: '+', hasPhoto: false, isPlaceholder: true },
  ];

  return (
    <section id="team" className="bg-white">
      {/* Eyebrow bar */}
      <div className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="font-body text-[14px] lg:text-[15px] text-off-white/80 uppercase tracking-wide">
            {t('eyebrowBar')}
          </p>
        </div>
      </div>

      {/* Headline */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-navy">
            {t('headline')}
          </h2>
        </ScrollReveal>
      </div>

      {/* Team Cards — 2x2 grid */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member, idx) => {
            const isPlaceholder = member.isPlaceholder;

            return (
              <ScrollReveal key={member.key} delay={idx * 80}>
                <div
                  className={`bg-white rounded-[var(--radius-card)] p-6 h-full transition-shadow ${
                    isPlaceholder
                      ? 'border-2 border-dashed border-gray-300 opacity-60'
                      : 'border border-gray-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Avatar + Name row */}
                  <div className="flex items-center gap-4 mb-4">
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
                      <h3 className="font-heading font-bold text-[17px] text-navy">
                        {t(`${member.key}.name`)}
                      </h3>
                      <p className="font-body font-medium text-[14px] text-teal">
                        {t(`${member.key}.title`)}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="font-body text-[15px] leading-[1.6] text-text-secondary mb-4">
                    {t(`${member.key}.bio`)}
                  </p>

                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-2">
                    {(t.raw(`${member.key}.tags`) as string[]).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block font-body text-[12px] text-gold bg-gold/10 px-2.5 py-1 rounded-full"
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
  );
}
