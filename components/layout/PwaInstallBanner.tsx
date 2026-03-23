'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Download } from 'lucide-react';

const DISMISS_KEY = 'pwa-install-dismissed';
const VISIT_KEY = 'pwa-visit-count';
const SUPPRESS_DAYS = 7;

export default function PwaInstallBanner() {
  const t = useTranslations('pwa');
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(
        DISMISS_KEY,
        JSON.stringify({ dismissed: true, until: Date.now() + SUPPRESS_DAYS * 86400000 })
      );
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    // Check if already dismissed
    try {
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored) {
        const { until } = JSON.parse(stored);
        if (Date.now() < until) return; // Still suppressed
        localStorage.removeItem(DISMISS_KEY);
      }
    } catch {
      // continue
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Track visits
    let visitCount = 1;
    try {
      visitCount = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1;
      localStorage.setItem(VISIT_KEY, String(visitCount));
    } catch {
      // continue
    }

    // Listen for beforeinstallprompt
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    // Show after 30 seconds OR on second visit
    if (visitCount >= 2) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(true), 30000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handlePrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt && 'prompt' in deferredPrompt) {
      (deferredPrompt as any).prompt();
      const result = await (deferredPrompt as any).userChoice;
      if (result.outcome === 'accepted') {
        dismiss();
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: just dismiss and let the user use browser's add to home screen
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 animate-slide-down"
      role="alert"
    >
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="bg-charcoal border border-gold/30 rounded-[var(--radius-card)] shadow-2xl px-5 py-4 flex items-center gap-4">
          <div className="shrink-0 hidden sm:flex items-center justify-center w-10 h-10 bg-gold/20 rounded-full">
            <Download className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-heading font-bold text-sm">
              {t('heading')}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {t('subheading')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="bg-gold text-navy font-heading font-semibold text-xs px-4 py-2 rounded-[var(--radius-button)] hover:bg-gold-light transition-colors whitespace-nowrap"
            >
              {t('addButton')}
            </button>
            <button
              onClick={dismiss}
              className="text-white/50 hover:text-white p-1 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
