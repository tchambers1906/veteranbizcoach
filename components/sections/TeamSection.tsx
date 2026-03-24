'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Image from 'next/image';

/* ------------------------------------------------------------------ */
/*  Photo avatar with fallback to initials                            */
/* ------------------------------------------------------------------ */
function PhotoAvatar({ src, alt, initials }: { src: string; alt: string; initials: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-20 h-20 rounded-full bg-charcoal flex items-center justify-center shrink-0 border-2 border-gold">
        <span className="font-heading font-bold text-[22px] text-gold leading-none">{initials}</span>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 bg-charcoal border-2 border-gold">
      <Image
        src={src}
        alt={alt}
        width={80}
        height={80}
        className="w-full h-full object-cover"
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
    { key: 'm1', photo: '/images/tc-team.jpg', initials: 'TC', hasPhoto: true },
    { key: 'm2', photo: '/images/rita-rosita.jpg', initials: 'RR', hasPhoto: true },
    { key: 'm3', photo: '/images/tami-rini.jpg', initials: 'TR', hasPhoto: true },
    { key: 'm4', photo: '/images/tobias-kaiuth.jpg', initials: 'TK', hasPhoto: true },
  ];

  return (
    <section id="team" className="bg-navy">
      {/* Eyebrow bar */}
      <div className="bg-charcoal">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="font-body font-medium text-[14px] lg:text-[15px] text-off-white uppercase tracking-wide">
            {t('eyebrowBar')}
          </p>
        </div>
      </div>

      {/* Headline */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white">
            {t('headline')}
          </h2>
        </ScrollReveal>
      </div>

      {/* Team Cards — 2x2 grid */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member, idx) => (
            <ScrollReveal key={member.key} delay={idx * 80}>
              <div
                className="rounded-xl p-6 h-full transition-all"
                style={{
                  backgroundColor: '#1A1A2E',
                  border: '1px solid rgba(201,168,76,0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C9A84C';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Avatar + Name row */}
                <div className="flex items-center gap-4 mb-4">
                  <PhotoAvatar
                    src={member.photo}
                    alt={t(`${member.key}.name`)}
                    initials={member.initials}
                  />
                  <div>
                    <h3 className="font-heading font-bold text-[17px] text-white">
                      {t(`${member.key}.name`)}
                    </h3>
                    <p className="font-body font-medium text-[14px] text-teal">
                      {t(`${member.key}.title`)}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="font-body text-[15px] leading-[1.6] text-off-white mb-4">
                  {t(`${member.key}.bio`)}
                </p>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-2">
                  {(t.raw(`${member.key}.tags`) as string[]).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-block font-body text-[12px] text-gold px-2.5 py-1 rounded-[20px]"
                      style={{
                        backgroundColor: 'rgba(201,168,76,0.12)',
                        border: '1px solid rgba(201,168,76,0.3)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
