'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';
import { Check, CheckCircle2, Download, Loader2 } from 'lucide-react';

const BULLET_KEYS = [1, 2, 3, 4, 5] as const;

interface LeadMagnetSectionProps {
  pdfUrl?: string;
}

export default function LeadMagnetSection({ pdfUrl = '' }: LeadMagnetSectionProps) {
  const t = useTranslations('leadMagnet');
  const locale = useLocale();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setSuccessVisible(true);
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSuccessVisible(true);
          });
        });
      }
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    if (status === 'loading') return;

    setStatus('loading');

    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          magnet: 'funding-blueprint',
          locale,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedEmail(email.trim());
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

  const handleDownloadClick = () => {
    track('lead_magnet_downloaded', {
      magnet: 'funding-blueprint',
      locale,
      source: 'immediate_download',
    });
  };

  const hasPdfUrl = Boolean(pdfUrl && pdfUrl.trim());

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#C9A84C';
  };
  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
  };

  return (
    <section id="resources" className="bg-navy">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT  Copy */}
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

          {/* RIGHT  Form */}
          <div>
            <ScrollReveal delay={150}>
              <div className="bg-charcoal rounded-[var(--radius-card)] p-6 lg:p-8">
                {status === 'success' ? (
                  /* Success State */
                  <div
                    className="text-center"
                    style={{
                      opacity: successVisible ? 1 : 0,
                      transform: successVisible ? 'translateY(0)' : 'translateY(12px)',
                      transition: 'opacity 300ms ease-out, transform 300ms ease-out',
                    }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-gold mx-auto mb-4" strokeWidth={1.5} />

                    <h3 className="font-heading font-bold text-[22px] text-white mb-4">
                      Your Business Funding Blueprint is on its way.
                    </h3>

                    <p className="font-body text-[15px] text-off-white leading-[1.7] mb-6">
                      Check your inbox. We sent it to{' '}
                      <span className="text-gold font-medium">{submittedEmail}</span>.
                      While you wait, download your copy right now using the button below.
                    </p>

                    {hasPdfUrl ? (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download="TC-Chambers-Funding-Blueprint.pdf"
                        onClick={handleDownloadClick}
                        className="inline-flex items-center justify-center gap-2 font-heading font-semibold text-[16px] bg-gold text-navy rounded-lg px-10 py-4 hover:brightness-110 transition-all w-full sm:w-auto"
                      >
                        <Download className="w-[18px] h-[18px]" />
                        Download Now
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 font-heading font-semibold text-[16px] bg-gold text-navy rounded-lg px-10 py-4 w-full sm:w-auto opacity-50 cursor-not-allowed"
                      >
                        <Download className="w-[18px] h-[18px]" />
                        Download Coming Soon
                      </button>
                    )}

                    <p className="font-body text-[13px] text-off-white/60 mt-3">
                      A copy has also been sent to your email for safekeeping.
                    </p>

                    <div
                      className="my-6"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                    />

                    <p className="font-body text-[14px] text-off-white mb-2">
                      Ready to take the next step?
                    </p>
                    <a
                      href="/book"
                      className="font-body font-medium text-[14px] text-teal hover:underline transition-colors"
                    >
                      Book a Free Strategy Call
                    </a>
                  </div>
                ) : (
                  /* Form State */
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4 mb-5">
                      <div>
                        <label
                          htmlFor="lead-firstName"
                          className="block font-body text-[13px] text-off-white/70 mb-1.5"
                        >
                          First Name
                        </label>
                        <input
                          id="lead-firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Your first name"
                          maxLength={100}
                          required
                          className="w-full font-body text-[16px] text-off-white placeholder:text-white/30 rounded-lg px-4 py-4 focus:outline-none transition-colors duration-150"
                          style={{
                            backgroundColor: '#1A1A2E',
                            border: '1px solid rgba(255,255,255,0.12)',
                          }}
                          onFocus={inputFocusHandler}
                          onBlur={inputBlurHandler}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lead-email"
                          className="block font-body text-[13px] text-off-white/70 mb-1.5"
                        >
                          Email Address
                        </label>
                        <input
                          id="lead-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          maxLength={254}
                          required
                          className="w-full font-body text-[16px] text-off-white placeholder:text-white/30 rounded-lg px-4 py-4 focus:outline-none transition-colors duration-150"
                          style={{
                            backgroundColor: '#1A1A2E',
                            border: '1px solid rgba(255,255,255,0.12)',
                          }}
                          onFocus={inputFocusHandler}
                          onBlur={inputBlurHandler}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lead-phone"
                          className="block font-body text-[13px] text-off-white/70 mb-1.5"
                        >
                          Phone / WhatsApp
                        </label>
                        <input
                          id="lead-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +62 812 3456 7890"
                          maxLength={20}
                          className="w-full font-body text-[16px] text-off-white placeholder:text-white/30 rounded-lg px-4 py-4 focus:outline-none transition-colors duration-150"
                          style={{
                            backgroundColor: '#1A1A2E',
                            border: '1px solid rgba(255,255,255,0.12)',
                          }}
                          onFocus={inputFocusHandler}
                          onBlur={inputBlurHandler}
                        />
                        <p className="font-body text-[12px] text-off-white/60 mt-1">
                          We use WhatsApp for follow-up in Southeast Asia. Optional but recommended.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full font-heading font-semibold text-[16px] bg-gold text-navy px-6 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Send Me the Blueprint'
                      )}
                    </button>

                    {status === 'error' && (
                      <p className="font-body text-[13px] text-red-400 mt-3 text-center">
                        {t('errorMessage')}
                      </p>
                    )}

                    <p className="font-body text-[12px] text-off-white/60 mt-3 text-center">
                      No spam. Unsubscribe anytime.
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
