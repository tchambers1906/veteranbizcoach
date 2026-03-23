'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';
import { useParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

const NAV_LINKS = [
  { key: 'villaBooking', href: '/villa-booking-traffic' },
  { key: 'superpower', href: '/superpower' },
  { key: 'websites', href: '/websites-pwas' },
  { key: 'funding', href: '/funding-structuring' },
  { key: 'team', href: '/team' },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'en';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-navy transition-shadow duration-300 ${
          scrolled ? 'shadow-lg shadow-black/20' : ''
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link
              href="/"
              className="font-heading font-bold text-gold text-xl tracking-tight hover:text-gold-light transition-colors"
            >
              T.C. Chambers
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-gold bg-white/10'
                        : 'text-text-inverse/80 hover:text-gold hover:bg-white/5'
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                );
              })}
            </div>

            {/* Desktop right section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language toggle */}
              <div className="flex items-center gap-0.5 text-sm">
                {(['en', 'es', 'id'] as const).map((locale, i) => (
                  <span key={locale} className="flex items-center">
                    {i > 0 && (
                      <span className="text-white/30 mx-0.5">|</span>
                    )}
                    <Link
                      href={pathname}
                      locale={locale}
                      className={`px-1.5 py-1 rounded transition-colors ${
                        currentLocale === locale
                          ? 'text-gold font-semibold'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {locale.toUpperCase()}
                    </Link>
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href="/book"
                className="bg-gold text-navy font-heading font-semibold text-sm px-5 py-2.5 rounded-[var(--radius-button)] hover:bg-gold-light transition-colors"
              >
                {t('book')}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-md text-text-inverse hover:bg-white/10 transition-colors"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={NAV_LINKS}
        currentLocale={currentLocale}
        pathname={pathname}
      />
    </>
  );
}
