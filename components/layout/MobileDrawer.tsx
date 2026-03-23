'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { X, Instagram, Facebook, Linkedin } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: readonly { key: string; href: string }[];
  currentLocale: string;
  pathname: string;
}

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com/miamitc', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/t.c.chambers.2025', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com/in/t-c-chambers-55b33223', label: 'LinkedIn' },
];

export default function MobileDrawer({
  isOpen,
  onClose,
  navLinks,
  currentLocale,
  pathname,
}: MobileDrawerProps) {
  const t = useTranslations('nav');

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Lock body scroll + listen ESC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, handleEsc]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-navy lg:hidden"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div className="flex flex-col h-full px-6 py-5">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 rounded-md text-text-inverse hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-2 mt-4 mb-6">
            {(['en', 'es', 'id'] as const).map((locale, i) => (
              <span key={locale} className="flex items-center">
                {i > 0 && <span className="text-white/30 mx-1">|</span>}
                <Link
                  href={pathname}
                  locale={locale}
                  onClick={onClose}
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    currentLocale === locale
                      ? 'text-gold font-bold bg-white/10'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {locale.toUpperCase()}
                </Link>
              </span>
            ))}
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={onClose}
                  className={`px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-gold bg-white/10'
                      : 'text-text-inverse hover:text-gold hover:bg-white/5'
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          {/* CTA button */}
          <Link
            href="/book"
            onClick={onClose}
            className="w-full bg-gold text-navy font-heading font-semibold text-center text-lg px-6 py-4 rounded-[var(--radius-button)] hover:bg-gold-light transition-colors mt-6"
          >
            {t('bookStrategy')}
          </Link>

          {/* Social icons */}
          <div className="flex items-center justify-center gap-6 mt-6 mb-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-gold transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
