import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home.hero');

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <h1 className="font-heading text-4xl font-bold text-navy mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          {t('subtitle')}
        </p>
        <p className="text-sm text-text-secondary">
          Foundation &amp; Config — veteranbizcoach.com
        </p>
      </div>
    </main>
  );
}
