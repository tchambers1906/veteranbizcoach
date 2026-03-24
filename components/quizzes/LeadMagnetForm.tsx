'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { track } from '@/lib/analytics';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';

export interface LeadMagnetFormProps {
  magnetKey: string;
  buttonLabel: string;
  successHeadline: string;
  pdfUrl: string;
  downloadFilename: string;
  bookingCtaUrl: string;
  bookingCtaLabel: string;
  disclaimer: string;
  resultId?: string;
  quizId?: string;
}

export default function LeadMagnetForm({
  magnetKey,
  buttonLabel,
  successHeadline,
  pdfUrl,
  downloadFilename,
  bookingCtaUrl,
  bookingCtaLabel,
  disclaimer,
  resultId,
  quizId,
}: LeadMagnetFormProps) {
  const locale = useLocale();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Animate success state in
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
          magnet: magnetKey,
          locale,
          result_id: resultId || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedEmail(email.trim());
        setStatus('success');
        track('lead_magnet_submitted', {
          magnet: magnetKey,
          locale,
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
      magnet: magnetKey,
      locale,
      source: 'immediate_download',
    });
  };

  const hasPdfUrl = Boolean(pdfUrl && pdfUrl.trim());

  const inputClasses =
    'w-full font-body text-[16px] text-off-white placeholder:text-white/30 rounded-lg px-4 py-4 focus:outline-none transition-colors duration-150';
  const inputStyle = {
    backgroundColor: '#1A1A2E',
    border: '1px solid rgba(255,255,255,0.12)',
  };
  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#C9A84C';
  };
  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
  };

  return (
    <div>
      {status === 'success' ? (
        /* ─── Success State ─── */
        <div
          ref={successRef}
          className="text-center"
          style={{
            backgroundColor: '#1A1A2E',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '16px',
            padding: 'clamp(24px, 4vw, 40px)',
            maxWidth: '560px',
            margin: '0 auto',
            opacity: successVisible ? 1 : 0,
            transform: successVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 300ms ease-out, transform 300ms ease-out',
          }}
        >
          {/* Check Icon */}
          <CheckCircle2 className="w-12 h-12 text-gold mx-auto mb-4" strokeWidth={1.5} />

          {/* Headline */}
          <h3 className="font-heading font-bold text-[22px] text-white mb-4">
            {successHeadline}
          </h3>

          {/* Body */}
          <p className="font-body text-[15px] text-off-white leading-[1.7] mb-6">
            Check your inbox. We sent it to{' '}
            <span className="text-gold font-medium">{submittedEmail}</span>.
            While you wait, download your copy right now using the button below.
          </p>

          {/* Download Button */}
          {hasPdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={downloadFilename}
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

          {/* Secondary text */}
          <p className="font-body text-[13px] text-off-white/60 mt-3">
            A copy has also been sent to your email for safekeeping.
          </p>

          {/* Divider */}
          <div
            className="my-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          />

          {/* Secondary CTA */}
          <p className="font-body text-[14px] text-off-white mb-2">
            Ready to take the next step?
          </p>
          <a
            href={bookingCtaUrl}
            className="font-body font-medium text-[14px] text-teal hover:underline transition-colors"
          >
            {bookingCtaLabel}
          </a>
        </div>
      ) : (
        /* ─── Form State ─── */
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 mb-5">
            {/* First Name */}
            <div>
              <label
                htmlFor={`${magnetKey}-firstName`}
                className="block font-body text-[13px] text-off-white/70 mb-1.5"
              >
                First Name
              </label>
              <input
                id={`${magnetKey}-firstName`}
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                maxLength={100}
                required
                className={inputClasses}
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor={`${magnetKey}-email`}
                className="block font-body text-[13px] text-off-white/70 mb-1.5"
              >
                Email Address
              </label>
              <input
                id={`${magnetKey}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                maxLength={254}
                required
                className={inputClasses}
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
              />
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label
                htmlFor={`${magnetKey}-phone`}
                className="block font-body text-[13px] text-off-white/70 mb-1.5"
              >
                Phone / WhatsApp
              </label>
              <input
                id={`${magnetKey}-phone`}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +62 812 3456 7890"
                maxLength={20}
                className={inputClasses}
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
              />
              <p className="font-body text-[12px] text-off-white/60 mt-1">
                We use WhatsApp for follow-up in Southeast Asia. Optional but recommended.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full font-heading font-semibold text-[16px] bg-gold text-navy px-8 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              buttonLabel
            )}
          </button>

          {/* Error */}
          {status === 'error' && (
            <p className="font-body text-[13px] text-red-400 mt-3 text-center">
              Something went wrong. Please try again.
            </p>
          )}

          {/* Privacy */}
          <p className="font-body text-[12px] text-off-white/60 mt-3 text-center">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      )}

      {/* Disclaimer — always visible */}
      <p className="font-body text-[12px] leading-[1.5] text-off-white/40 mt-6">
        {disclaimer}
      </p>
    </div>
  );
}
