'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { ChevronDown } from 'lucide-react';

const CATEGORIES = [
  { key: 'villa', count: 4 },
  { key: 'superpower', count: 4 },
  { key: 'websites', count: 3 },
  { key: 'funding', count: 3 },
  { key: 'working', count: 3 },
] as const;

export default function FaqSection() {
  const t = useTranslations('faq');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-navy text-center mb-12">
            {t('headline')}
          </h2>
        </ScrollReveal>

        <div className="space-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <ScrollReveal>
                <h3 className="font-heading font-bold text-[18px] lg:text-[20px] text-teal mb-4 pb-2 border-b border-gray-200">
                  {t(`categories.${cat.key}`)}
                </h3>
              </ScrollReveal>

              <div className="divide-y divide-gray-100">
                {Array.from({ length: cat.count }, (_, i) => {
                  const itemId = `${cat.key}-${i + 1}`;
                  const isOpen = openItem === itemId;

                  return (
                    <div key={itemId}>
                      <button
                        onClick={() => toggle(itemId)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${itemId}`}
                        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
                      >
                        <span className="font-body font-medium text-[15px] lg:text-[16px] text-navy leading-[1.5] group-hover:text-teal transition-colors">
                          {t(`items.${cat.key}.q${i + 1}.q`)}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gold shrink-0 mt-0.5 transition-transform duration-200 motion-reduce:transition-none ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div
                        id={`faq-answer-${itemId}`}
                        role="region"
                        className={`overflow-hidden transition-all duration-300 motion-reduce:transition-none ${
                          isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p className="font-body text-[15px] leading-[1.7] text-text-secondary pr-10">
                          {t(`items.${cat.key}.q${i + 1}.a`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
