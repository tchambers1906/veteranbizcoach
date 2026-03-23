'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { track } from '@/lib/analytics';

const SESSION_TYPES = ['strategy', 'villa', 'ai-strategy', 'website', 'funding'] as const;
type SessionType = (typeof SESSION_TYPES)[number];

function BookPageContent() {
  const t = useTranslations('book');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const paramSession = searchParams.get('session') as SessionType | null;
  const initialSession: SessionType = paramSession && SESSION_TYPES.includes(paramSession) ? paramSession : 'strategy';

  const [activeSession, setActiveSession] = useState<SessionType>(initialSession);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || '';

  useEffect(() => {
    track('booking_page_viewed', {
      session_type: activeSession,
      locale,
      source: typeof document !== 'undefined' ? document.referrer : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-navy min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header */}
        <h1 className="font-heading font-extrabold text-[32px] lg:text-[48px] leading-[1.1] text-white text-center mb-4">
          {t('headline')}
        </h1>
        <p className="font-body text-[18px] lg:text-[20px] leading-[1.7] text-off-white/80 text-center max-w-[600px] mx-auto mb-12">
          {t('subheadline')}
        </p>

        {/* Session type tabs */}
        <div className="flex flex-wrap justify-center gap-1 mb-10">
          {SESSION_TYPES.map((session) => (
            <button
              key={session}
              onClick={() => {
                setActiveSession(session);
                setIframeLoaded(false);
                track('cta_clicked', {
                  cta_label: t(`tabs.${session}`),
                  section_id: 'book',
                  pillar: session,
                  locale,
                });
              }}
              className={`font-body text-[14px] lg:text-[15px] px-4 py-2.5 rounded-md transition-all whitespace-nowrap ${
                activeSession === session
                  ? 'text-gold border-b-2 border-gold bg-white/5'
                  : 'text-off-white/60 hover:text-off-white/80'
              }`}
            >
              {t(`tabs.${session}`)}
            </button>
          ))}
        </div>

        {/* Calendly embed */}
        <div className="bg-charcoal rounded-[var(--radius-card)] overflow-hidden mb-8">
          {calendlyUrl ? (
            <div className="relative min-h-[700px]">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-md px-6">
                    <div className="h-4 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    <div className="h-10 bg-white/5 rounded animate-pulse mt-6" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-12 bg-gold/10 rounded animate-pulse mt-4" />
                  </div>
                </div>
              )}
              <iframe
                src={`${calendlyUrl}?session=${activeSession}`}
                title={t(`tabs.${activeSession}`)}
                className="w-full min-h-[700px] border-0"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-16 text-center">
              <p className="font-heading font-bold text-[20px] text-white mb-4">
                {t('placeholder.heading')}
              </p>
              <p className="font-body text-[16px] text-off-white/70">
                {t('placeholder.body')}
              </p>
              <a
                href="mailto:tc@veteranbizcoach.com"
                className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all mt-6"
              >
                {t('placeholder.cta')}
              </a>
            </div>
          )}
        </div>

        {/* Small text */}
        <p className="font-body text-[14px] text-off-white/50 text-center">
          {t('footnote')}
        </p>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <main className="bg-navy min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-md px-6">
          <div className="h-8 bg-white/5 rounded" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
        </div>
      </main>
    }>
      <BookPageContent />
    </Suspense>
  );
}
