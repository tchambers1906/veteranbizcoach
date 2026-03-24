'use client';

import { useState, useMemo } from 'react';
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

  // Build JSON-LD FAQPage schema
  const jsonLd = useMemo(() => {
    const mainEntity: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[] = [];
    for (const cat of CATEGORIES) {
      for (let i = 1; i <= cat.count; i++) {
        mainEntity.push({
          '@type': 'Question',
          name: t(`items.${cat.key}.q${i}.q`),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(`items.${cat.key}.q${i}.a`),
          },
        });
      }
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    };
  }, [t]);

  return (
    <section id="faq" className="bg-charcoal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <h2 className="font-heading font-extrabold text-[28px] lg:text-[42px] leading-[1.1] text-white text-center mb-12">
            {t('headline')}
          </h2>
        </ScrollReveal>

        <div className="space-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <ScrollReveal>
                <h3
                  className="font-heading font-bold text-[18px] lg:text-[20px] text-gold mb-4 pb-2"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}
                >
                  {t(`categories.${cat.key}`)}
                </h3>
              </ScrollReveal>

              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#0A1628' }}
              >
                {Array.from({ length: cat.count }, (_, i) => {
                  const itemId = `${cat.key}-${i + 1}`;
                  const isOpen = openItem === itemId;

                  return (
                    <div
                      key={itemId}
                      style={{
                        borderBottom:
                          i < cat.count - 1
                            ? '1px solid rgba(255,255,255,0.06)'
                            : 'none',
                      }}
                    >
                      <button
                        onClick={() => toggle(itemId)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${itemId}`}
                        className="w-full flex items-start justify-between gap-4 py-4 px-5 text-left group"
                      >
                        <span
                          className={`font-body font-medium text-[15px] lg:text-[16px] leading-[1.5] transition-colors ${
                            isOpen
                              ? 'text-white'
                              : 'text-off-white group-hover:text-white'
                          }`}
                        >
                          {t(`items.${cat.key}.q${i + 1}.q`)}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 shrink-0 mt-0.5 transition-all duration-200 motion-reduce:transition-none ${
                            isOpen
                              ? 'rotate-180 text-teal'
                              : 'text-gold'
                          }`}
                        />
                      </button>
                      <div
                        id={`faq-answer-${itemId}`}
                        role="region"
                        className={`overflow-hidden transition-all duration-300 motion-reduce:transition-none ${
                          isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p className="font-body text-[15px] leading-[1.7] text-off-white/85 px-5 pt-0 pr-10">
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
