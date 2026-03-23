'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';
import { Check } from 'lucide-react';

const BULLET_KEYS = [1, 2, 3, 4, 5] as const;

export default function LeadMagnetSection() {
  const t = useTranslations('leadMagnet');
  const locale = useLocale();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
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
          magnet: 'funding-blueprint',
          locale,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        track('lead_magnet_submitted', {
          magnet: 'funding-blueprint',
          locale,
          source_section: 'homepage',
        });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="resources" className="bg-navy">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT — Copy */}
          <div>
            <ScrollReveal>
              <p className="font-heading font-semibold text-[12px] text-gold uppercase tracking-widest mb-4">
                {t('eyebrow')}
              </p>
              <h2 className="font-heading font-extrabold text-[26px] lg:text-[36px] leading-[1.15] text-white mb-4">
                {t('headline')}
              </h2>
              <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white/80 mb-8">
                {t('subheadline')}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <ul className="space-y-3 mb-6">
                {BULLET_KEYS.map((num) => (
                  <li key={num} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-teal shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="font-body text-[15px] leading-[1.6] text-off-white/80">
                      {t(`bullets.b${num}`)}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="font-body text-[12px] leading-[1.5] text-off-white/40">
                {t('disclaimer')}
              </p>
            </ScrollReveal>
          </div>

          {/* RIGHT — Form */}
          <div>
            <ScrollReveal delay={150}>
              <div className="bg-charcoal rounded-[var(--radius-card)] p-6 lg:p-8">
                {status === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-7 h-7 text-teal" strokeWidth={2.5} />
                    </div>
                    <p className="font-heading font-bold text-[18px] text-white mb-2">
                      {t('successHeading')}
                    </p>
                    <p className="font-body text-[15px] text-off-white/70">
                      {t('successBody')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4 mb-5">
                      <div>
                        <label
                          htmlFor="lead-firstName"
                          className="block font-body text-[13px] text-off-white/70 mb-1.5"
                        >
                          {t('form.firstNameLabel')}
                        </label>
                        <input
                          id="lead-firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={t('form.firstNamePlaceholder')}
                          maxLength={100}
                          required
                          className="w-full bg-navy border border-white/10 rounded-[var(--radius-button)] px-4 py-3 font-body text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal/50"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lead-email"
                          className="block font-body text-[13px] text-off-white/70 mb-1.5"
                        >
                          {t('form.emailLabel')}
                        </label>
                        <input
                          id="lead-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('form.emailPlaceholder')}
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
                      {status === 'loading' ? t('form.sending') : t('form.button')}
                    </button>

                    {status === 'error' && (
                      <p className="font-body text-[13px] text-red-400 mt-3 text-center">
                        {t('errorMessage')}
                      </p>
                    )}

                    <p className="font-body text-[12px] text-off-white/40 mt-3 text-center">
                      {t('form.privacy')}
                    </p>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
