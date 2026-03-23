'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { MessageCircle, X } from 'lucide-react';

type ChatStep = 'intro' | 'response' | 'emailCapture' | 'emailSent';

export default function ChatbotWidget() {
  const t = useTranslations('chatbot');
  const locale = useLocale();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [step, setStep] = useState<ChatStep>('intro');
  const [selectedOption, setSelectedOption] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* ---------------------------------------------------------------- */
  /*  Auto-trigger logic: 15s OR 50% scroll, whichever first          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (dismissed || autoTriggered) return;

    const timer = setTimeout(() => {
      if (!dismissed && !autoTriggered) {
        setIsOpen(true);
        setAutoTriggered(true);
        track('chatbot_opened', { trigger_type: 'auto', locale });
      }
    }, 15_000);

    const handleScroll = () => {
      if (dismissed || autoTriggered) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) {
        setIsOpen(true);
        setAutoTriggered(true);
        track('chatbot_opened', { trigger_type: 'scroll', locale });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dismissed, autoTriggered, locale]);

  /* ---------------------------------------------------------------- */
  /*  ESC key close                                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWidget();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ---------------------------------------------------------------- */
  /*  Focus trap                                                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) focusable[0].focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, step]);

  /* ---------------------------------------------------------------- */
  /*  Actions                                                         */
  /* ---------------------------------------------------------------- */
  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setDismissed(true);
    toggleRef.current?.focus();
  }, []);

  const openWidget = () => {
    setIsOpen(true);
    track('chatbot_opened', { trigger_type: 'click', locale });
  };

  const handleQuickReply = (option: string) => {
    setSelectedOption(option);
    setStep('response');
    track('cta_clicked', {
      cta_label: option,
      section_id: 'chatbot',
      pillar: 'chatbot',
      locale,
    });
  };

  const handleActionButton = (href: string, label: string) => {
    track('cta_clicked', {
      cta_label: label,
      section_id: 'chatbot',
      pillar: 'chatbot',
      locale,
    });
    router.push(`/${locale}${href}`);
    closeWidget();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailStatus('loading');
    try {
      const res = await fetch('/api/chatbot-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), context: selectedOption, locale }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('emailSent');
        track('chatbot_lead_captured', { locale });
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  };

  const QUICK_REPLIES = ['business', 'funded', 'website', 'villa', 'other'] as const;

  interface ActionBtn { label: string; href: string }
  const RESPONSE_ACTIONS: Record<string, ActionBtn[]> = {
    business: [
      { label: t('responses.business.btn1'), href: '/resources?waitlist=superpower' },
      { label: t('responses.business.btn2'), href: '/#superpower-program' },
    ],
    funded: [
      { label: t('responses.funded.btn1'), href: '/book?session=funding' },
      { label: t('responses.funded.btn2'), href: '/#funding-structuring' },
    ],
    website: [
      { label: t('responses.website.btn1'), href: '/book?session=website' },
      { label: t('responses.website.btn2'), href: '/#websites-pwas' },
    ],
    villa: [
      { label: t('responses.villa.btn1'), href: '/book?session=villa' },
      { label: t('responses.villa.btn2'), href: '/#villa-booking-traffic' },
    ],
    other: [
      { label: t('responses.other.btn1'), href: '/book?session=strategy' },
    ],
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <>
      {/* Toggle button */}
      {!isOpen && (
        <button
          ref={toggleRef}
          onClick={openWidget}
          aria-label={t('toggleLabel')}
          aria-expanded={false}
          className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-teal text-white rounded-full shadow-lg flex items-center justify-center hover:brightness-110 transition-all motion-safe:animate-pulse"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t('header')}
          className="fixed bottom-6 right-6 z-[999] w-[380px] max-w-[calc(100vw-2rem)] bg-navy rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100vh - 3rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="font-heading font-semibold text-[16px] text-gold">
              {t('header')}
            </span>
            <button
              onClick={closeWidget}
              aria-label={t('close')}
              className="w-11 h-11 flex items-center justify-center text-off-white/60 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Opening message always shows */}
            <div className="bg-charcoal rounded-xl px-4 py-3">
              <p className="font-body text-[14px] leading-[1.6] text-off-white/90">
                {t('greeting')}
              </p>
            </div>

            {step === 'intro' && (
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleQuickReply(key)}
                    className="font-body text-[13px] bg-teal/15 text-teal border border-teal/30 px-3.5 py-2 rounded-full hover:bg-teal/25 transition-all"
                  >
                    {t(`quickReplies.${key}`)}
                  </button>
                ))}
              </div>
            )}

            {(step === 'response' || step === 'emailCapture' || step === 'emailSent') && (
              <>
                {/* User's selection */}
                <div className="flex justify-end">
                  <span className="bg-gold/20 text-gold font-body text-[13px] px-3.5 py-2 rounded-full">
                    {t(`quickReplies.${selectedOption}`)}
                  </span>
                </div>

                {/* Bot response */}
                <div className="bg-charcoal rounded-xl px-4 py-3">
                  <p className="font-body text-[14px] leading-[1.6] text-off-white/90">
                    {t(`responses.${selectedOption}.text`)}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {RESPONSE_ACTIONS[selectedOption]?.map((btn) => (
                    <button
                      key={btn.href}
                      onClick={() => handleActionButton(btn.href, btn.label)}
                      className="font-body text-[13px] bg-gold/15 text-gold border border-gold/30 px-3.5 py-2 rounded-full hover:bg-gold/25 transition-all"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Email capture */}
                {step === 'response' && (
                  <div className="pt-2">
                    <p className="font-body text-[13px] text-off-white/60 mb-2">
                      {t('emailPrompt')}
                    </p>
                    <form onSubmit={handleEmailSubmit} className="flex gap-2">
                      <label htmlFor="chatbot-email" className="sr-only">
                        {t('emailLabel')}
                      </label>
                      <input
                        id="chatbot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        maxLength={254}
                        required
                        className="flex-1 bg-charcoal border border-white/10 rounded-lg px-3 py-2 font-body text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-teal/50"
                      />
                      <button
                        type="submit"
                        disabled={emailStatus === 'loading'}
                        className="font-body text-[13px] bg-gold text-navy px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 whitespace-nowrap"
                      >
                        {emailStatus === 'loading' ? '...' : t('emailButton')}
                      </button>
                    </form>
                    {emailStatus === 'error' && (
                      <p className="font-body text-[12px] text-red-400 mt-1">{t('emailError')}</p>
                    )}
                  </div>
                )}

                {step === 'emailSent' && (
                  <div className="bg-teal/10 rounded-xl px-4 py-3">
                    <p className="font-body text-[14px] text-teal">{t('emailConfirmation')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
