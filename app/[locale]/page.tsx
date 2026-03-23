'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function HomePage() {
  const t = useTranslations('home.hero');

  return (
    <section className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <ScrollReveal className="text-center max-w-2xl">
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy mb-6 leading-tight">
          {t('title')}
        </h1>
        <div className="max-w-[680px] mx-auto mb-10">
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-y-2 sm:gap-y-1 font-body text-[18px] text-text-secondary leading-[1.6]">
            {(['pillar1', 'pillar2', 'pillar3', 'pillar4', 'pillar5'] as const).map((key, i) => (
              <span key={key} className="flex items-center">
                {i > 0 && <span className="hidden sm:inline text-gold mx-2 select-none" aria-hidden="true">·</span>}
                <span>{t(key)}</span>
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/book"
          className="inline-block bg-gold text-navy font-heading font-bold text-lg px-8 py-4 rounded-[var(--radius-button)] hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          {t('cta')}
        </Link>
      </ScrollReveal>
    </section>
  );
}
