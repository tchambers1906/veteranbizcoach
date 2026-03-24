'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import LeadMagnetSection from '@/components/sections/LeadMagnetSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

export default function ResourcesPageContent() {
  const t = useTranslations('resourcesPage');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const showWaitlist = searchParams.get('waitlist') === 'superpower';

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          magnet: 'superpower-waitlist',
          locale,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        track('lead_magnet_submitted', {
          magnet: 'superpower-waitlist',
          locale,
          source_section: 'resources-page',
        });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Hero block */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h1 className="font-heading font-extrabold text-[34px] lg:text-[54px] leading-[1.05] text-white">
            {t('headline')}
          </h1>
        </div>
      </section>

      {/* Waitlist section (conditional) */}
      {showWaitlist && (
        <section className="bg-charcoal">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <ScrollReveal>
              <h2 className="font-heading font-bold text-[24px] lg:text-[28px] text-gold mb-4 text-center">
                {t('waitlist.heading')}
              </h2>
              <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white/80 text-center mb-8 max-w-lg mx-auto">
                {t('waitlist.body')}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              {status === 'success' ? (
                <p className="font-body text-[16px] text-teal text-center py-6">
                  {t('waitlist.success')}
                </p>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto" noValidate>
                  <div className="space-y-4 mb-5">
                    <div>
                      <label
                        htmlFor="waitlist-firstName"
                        className="block font-body text-[13px] text-off-white/70 mb-1.5"
                      >
                        {t('waitlist.firstNameLabel')}
                      </label>
                      <input
                        id="waitlist-firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t('waitlist.firstNamePlaceholder')}
                        maxLength={100}
                        required
                        className="w-full bg-navy border border-white/10 rounded-[var(--radius-button)] px-4 py-3 font-body text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="waitlist-email"
                        className="block font-body text-[13px] text-off-white/70 mb-1.5"
                      >
                        {t('waitlist.emailLabel')}
                      </label>
                      <input
                        id="waitlist-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('waitlist.emailPlaceholder')}
                        maxLength={254}
                        required
                        className="w-full bg-navy border border-white/10 rounded-[var(--radius-button)] px-4 py-3 font-body text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full font-heading font-semibold text-[16px] bg-gold text-navy px-6 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? t('waitlist.sending') : t('waitlist.button')}
                  </button>

                  {status === 'error' && (
                    <p className="font-body text-[13px] text-red-400 mt-3 text-center">
                      {t('waitlist.error')}
                    </p>
                  )}
                </form>
              )}
            </ScrollReveal>

            {/* Disclaimer */}
            <ScrollReveal delay={200}>
              <p className="font-body text-[12px] leading-[1.5] text-off-white/40 text-center mt-8">
                {t('waitlist.disclaimer')}
              </p>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Lead Magnet section (reused from homepage) */}
      <LeadMagnetSection />
    </>
  );
}
