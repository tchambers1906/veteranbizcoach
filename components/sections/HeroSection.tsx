'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';

const CREDIBILITY_KEYS = ['cred1', 'cred2', 'cred3', 'cred4', 'cred5'] as const;

/** Photo with fallback to styled "TC" initials placeholder */
function PhotoPlaceholder({ imgLoaded, onImgLoad }: { imgLoaded: boolean; onImgLoad: () => void }) {
  return (
    <div className="relative w-[180px] h-[180px] lg:w-[420px] lg:h-[500px] rounded-full lg:rounded-2xl overflow-hidden border-2 border-gold/40 shadow-[0_0_60px_rgba(201,168,76,0.15)]">
      {/* Try loading real image in background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/tc-headshot.jpg"
        alt="T.C. Chambers"
        onLoad={onImgLoad}
        onError={() => {}} // silently fail
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Placeholder — visible until real image loads */}
      <div
        className={`absolute inset-0 bg-navy flex items-center justify-center transition-opacity duration-500 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`}
      >
        <span className="font-heading font-extrabold text-gold text-5xl lg:text-7xl select-none">
          TC
        </span>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const t = useTranslations('home.hero');
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [stage, setStage] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const headlineWords = t('headline').split(' ');
  const headlineDuration = headlineWords.length * 50 + 400;

  useEffect(() => {
    setMounted(true);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(prefersReduced);

    if (prefersReduced) {
      setStage(5);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage(1), 100));
    timers.push(setTimeout(() => setStage(2), 100 + headlineDuration + 300));
    timers.push(setTimeout(() => setStage(3), 100 + headlineDuration + 500));
    timers.push(setTimeout(() => setStage(4), 100 + headlineDuration + 700));
    timers.push(setTimeout(() => setStage(5), 100 + headlineDuration + 1100));
    return () => timers.forEach(clearTimeout);
  }, [headlineDuration]);

  // Animation helpers
  const vis = (atStage: number) => ({
    opacity: !mounted ? 1 : stage >= atStage ? 1 : 0,
    transform: !mounted ? 'none' : stage >= atStage ? 'translateY(0)' : 'translateY(20px)',
    transition: reduced ? 'none' : 'opacity 0.5s ease-out, transform 0.5s ease-out',
  });

  const wordVis = (index: number) => ({
    opacity: !mounted ? 1 : stage >= 1 ? 1 : 0,
    transform: !mounted ? 'none' : stage >= 1 ? 'translateY(0)' : 'translateY(20px)',
    transition: reduced
      ? 'none'
      : `opacity 0.4s ease-out ${index * 50}ms, transform 0.4s ease-out ${index * 50}ms`,
    display: 'inline-block',
  });

  return (
    <section className="relative bg-navy overflow-hidden">
      {/* Grain texture overlay */}
      <div className="hero-grain" aria-hidden="true" />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(201,168,76,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(0,180,166,0.04) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Main hero content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left column — text */}
          <div className="order-1">
            {/* Eyebrow */}
            <p
              className="font-heading font-semibold text-[14px] text-gold uppercase tracking-widest mb-6"
              style={vis(1)}
            >
              {t('eyebrow')}
            </p>

            {/* Headline */}
            <h1 className="font-heading font-extrabold text-[36px] lg:text-[60px] leading-[1.05] text-white mb-6">
              {headlineWords.map((word, i) => (
                <span key={i} className="mr-[0.3em]" style={wordVis(i)}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Subheadline */}
            <p
              className="font-body font-normal text-[17px] lg:text-[20px] leading-[1.6] text-off-white max-w-[560px] mb-10"
              style={vis(2)}
            >
              {t('subheadline')}
            </p>

            {/* CTA group */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={vis(3)}
            >
              <Link
                href="/book"
                className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all"
              >
                {t('ctaPrimary')}
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center font-heading font-semibold text-base bg-transparent text-gold border-2 border-gold px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:bg-gold/10 transition-all"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Right column — photo */}
          <div className="order-2 flex justify-center lg:justify-end" style={vis(4)}>
            <div className="relative">
              {/* Gold glow behind */}
              <div
                className="absolute -inset-4 rounded-full lg:rounded-[20px] opacity-20 blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              {/* Photo container — placeholder (replace with Image when headshot available) */}
              <PhotoPlaceholder imgLoaded={imgLoaded} onImgLoad={() => setImgLoaded(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Credibility bar */}
      <div
        className="relative z-10 bg-charcoal"
        style={{
          opacity: !mounted ? 1 : stage >= 5 ? 1 : 0,
          transform: !mounted ? 'none' : stage >= 5 ? 'translateY(0)' : 'translateY(30px)',
          transition: reduced ? 'none' : 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Desktop: centered row */}
          <div className="hidden md:flex items-center justify-center gap-0 py-4 px-4">
            {CREDIBILITY_KEYS.map((key, i) => (
              <span key={key} className="flex items-center">
                {i > 0 && (
                  <span className="text-gold mx-3 select-none" aria-hidden="true">
                    ·
                  </span>
                )}
                <span className="font-body font-medium text-[14px] text-off-white uppercase tracking-widest whitespace-nowrap">
                  {t(key)}
                </span>
              </span>
            ))}
          </div>
          {/* Mobile: horizontal scroll with fade mask */}
          <div className="md:hidden credibility-scroll py-4 px-4">
            <div className="flex items-center gap-0 w-max">
              {CREDIBILITY_KEYS.map((key, i) => (
                <span key={key} className="flex items-center">
                  {i > 0 && (
                    <span className="text-gold mx-3 select-none" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <span className="font-body font-medium text-[14px] text-off-white uppercase tracking-widest whitespace-nowrap">
                    {t(key)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
