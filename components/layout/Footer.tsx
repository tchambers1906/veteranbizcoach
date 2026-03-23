'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { Instagram, Facebook, Linkedin, Mail, MapPin } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com/miamitc', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/t.c.chambers.2025', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com/in/t-c-chambers-55b33223', label: 'LinkedIn' },
];

const FOOTER_NAV = [
  { key: 'villaBooking', href: '/villa-booking-traffic' },
  { key: 'superpower', href: '/superpower' },
  { key: 'websites', href: '/websites-pwas' },
  { key: 'funding', href: '/funding-structuring' },
  { key: 'about', href: '/about' },
  { key: 'team', href: '/team' },
  { key: 'faq', href: '/faq' },
  { key: 'book', href: '/book' },
];

export default function Footer() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      setEmail('');
    } catch {
      // Fail gracefully
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-navy text-text-inverse">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl text-gold mb-2">
              T.C. Chambers
            </h3>
            <p className="text-white/70 text-sm mb-5">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-gold transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-gold mb-4">
              {t('footer.navHeading')}
            </h4>
            <nav className="flex flex-col gap-2">
              {FOOTER_NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-white/70 hover:text-gold text-sm transition-colors"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Lead Magnet */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-gold mb-4">
              {t('footer.leadMagnet.heading')}
            </h4>
            {submitted ? (
              <p className="text-success text-sm font-medium">
                {t('footer.leadMagnet.success')}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.leadMagnet.placeholder')}
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-[var(--radius-button)] text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold text-navy font-heading font-semibold text-sm px-4 py-2.5 rounded-[var(--radius-button)] hover:bg-gold-light disabled:opacity-50 transition-colors"
                >
                  {t('footer.leadMagnet.submit')}
                </button>
              </form>
            )}
            <p className="text-white/40 text-xs mt-3">
              {t('footer.leadMagnet.privacy')}
            </p>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-gold mb-4">
              {t('footer.contactHeading')}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:tc@veteranbizcoach.com"
                className="flex items-center gap-2 text-white/70 hover:text-gold text-sm transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                tc@veteranbizcoach.com
              </a>
              <div className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t('footer.location')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal strip */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-white/50">
              <span>{t('footer.copyright')}</span>
              <div className="flex items-center gap-3">
                <a href="#" className="hover:text-gold transition-colors">{t('footer.privacy')}</a>
                <span>·</span>
                <a href="#" className="hover:text-gold transition-colors">{t('footer.disclaimer')}</a>
                <span>·</span>
                <a href="#" className="hover:text-gold transition-colors">{t('footer.terms')}</a>
              </div>
            </div>
            <p className="text-xs text-white/40">
              {t('footer.pwaNote')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
