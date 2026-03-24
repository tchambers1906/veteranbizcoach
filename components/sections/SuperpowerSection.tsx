'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { track } from '@/lib/analytics';

/* ------------------------------------------------------------------ */
/*  Static data — kept outside the component to avoid re-creation     */
/* ------------------------------------------------------------------ */

const STATS_KEYS = [
  'weeks',
  'sessions',
  'hours',
  'participants',
  'deliverables',
  'online',
] as const;

const DELIVERABLE_KEYS = [1, 2, 3, 4, 5, 6] as const;

const WEEK_KEYS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function SuperpowerSection() {
  const t = useTranslations('superpower');
  const locale = useLocale();

  const handleCtaClick = (ctaLabel: string) => {
    track('cta_clicked', {
      cta_label: ctaLabel,
      section_id: 'superpower-program',
      pillar: 'superpower',
      locale,
    });
  };

  return (
    <section id="superpower-program" className="bg-navy">
      {/* ───────────────── Section Header ───────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <ScrollReveal>
          <p className="font-heading font-semibold text-[12px] text-teal uppercase tracking-widest mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white">
            {t('headline')}
          </h2>
          <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white/80 mt-6 max-w-2xl mx-auto">
            {t('subheadline')}
          </p>
        </ScrollReveal>
      </div>

      {/* ───────────────── Stats Bar ───────────────── */}
      <div className="bg-gold">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-start lg:justify-center gap-4 lg:gap-6 min-w-max">
            {STATS_KEYS.map((key, i) => (
              <div key={key} className="flex items-center gap-4 lg:gap-6">
                <span className="font-heading font-bold text-[14px] lg:text-[15px] text-navy whitespace-nowrap">
                  {t(`stats.${key}`)}
                </span>
                {i < STATS_KEYS.length - 1 && (
                  <span className="text-navy/40 font-light text-lg select-none" aria-hidden="true">
                    ·
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────── Deliverable Cards ───────────────── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal>
          <h3 className="font-heading font-bold text-[22px] lg:text-[28px] text-white text-center mb-10">
            {t('deliverablesHeading')}
          </h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DELIVERABLE_KEYS.map((num) => (
            <ScrollReveal key={num} delay={num * 60}>
              <div className="group bg-charcoal rounded-[var(--radius-card)] p-6 h-full transition-all border-b-2 border-transparent hover:border-teal">
                <span className="block font-heading font-[800] text-[48px] leading-none text-gold mb-3">
                  {String(num).padStart(2, '0')}
                </span>
                <h4 className="font-heading font-bold text-[17px] text-white mb-2">
                  {t(`deliverables.d${num}.heading`)}
                </h4>
                <p className="font-body text-[15px] leading-[1.6] text-off-white/75">
                  {t(`deliverables.d${num}.body`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ───────────────── Week-by-Week Table ───────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-16">
        <ScrollReveal>
          <h3 className="font-heading font-bold text-[22px] lg:text-[28px] text-white text-center mb-8">
            {t('scheduleHeading')}
          </h3>
        </ScrollReveal>

        <ScrollReveal>
          <div className="overflow-x-auto rounded-[var(--radius-card)]">
            <table className="w-full min-w-[500px] text-left">
              <thead>
                <tr className="bg-charcoal">
                  <th className="font-heading font-bold text-[13px] uppercase tracking-wider text-gold px-5 py-3 w-[100px]">
                    {t('tableWeek')}
                  </th>
                  <th className="font-heading font-bold text-[13px] uppercase tracking-wider text-white/70 px-5 py-3">
                    {t('tableTopic')}
                  </th>
                  <th className="font-heading font-bold text-[13px] uppercase tracking-wider text-teal px-5 py-3">
                    {t('tableDeliverable')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {WEEK_KEYS.map((week) => (
                  <tr
                    key={week}
                    className={week % 2 === 1 ? 'bg-navy' : 'bg-charcoal'}
                  >
                    <td className="font-heading font-bold text-[15px] text-gold px-5 py-3.5 whitespace-nowrap">
                      {t(`schedule.w${week}.week`)}
                    </td>
                    <td className="font-body text-[15px] text-white/90 px-5 py-3.5">
                      {t(`schedule.w${week}.topic`)}
                    </td>
                    <td className="font-body text-[15px] text-teal px-5 py-3.5">
                      {t(`schedule.w${week}.deliverable`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>

      {/* ───────────────── How It Works ───────────────── */}
      <div className="bg-charcoal">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <ScrollReveal>
            <h3 className="font-heading font-bold text-[22px] lg:text-[26px] text-white mb-4">
              {t('howItWorks.heading')}
            </h3>
            <p className="font-body text-[17px] lg:text-[18px] leading-[1.7] text-off-white/80">
              {t('howItWorks.body')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* ───────────────── Enrollment CTA — Waitlist ───────────────── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ScrollReveal>
          <h3 className="font-heading font-bold text-[24px] lg:text-[32px] text-white mb-4">
            {t('cta.heading')}
          </h3>
          <p className="font-body text-[17px] leading-[1.7] text-off-white/80 mb-8 max-w-xl mx-auto">
            {t('cta.subtext')}
          </p>
          <Link
            href="/resources?waitlist=superpower"
            onClick={() => handleCtaClick('Join the Waitlist')}
            className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-[var(--radius-button)] min-h-[44px] hover:brightness-110 transition-all"
          >
            {t('cta.button')}
          </Link>
          <div className="mt-3">
            <Link
              href="/quiz/superpower"
              className="font-body font-medium text-[14px] text-teal hover:underline transition-colors"
            >
              Discover Your Superpower
            </Link>
          </div>
          <p className="font-body text-[14px] text-off-white/60 mt-5">
            {t('cta.note')}
          </p>
        </ScrollReveal>
      </div>

      {/* ───────────────── Disclaimer ───────────────── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-8">
        <p className="font-body text-[12px] leading-[1.5] text-off-white/40">
          {t('disclaimer')}
        </p>
      </div>
    </section>
  );
}
