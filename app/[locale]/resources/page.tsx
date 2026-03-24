import { getTranslations } from 'next-intl/server';
import ResourcesPageContent from './ResourcesPageContent';
import { Suspense } from 'react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'resourcesPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function ResourcesPage() {
  const pdfUrl = process.env.LEAD_MAGNET_PDF_URL || '';

  return (
    <Suspense fallback={
      <main className="bg-navy min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-md px-6">
          <div className="h-8 bg-white/5 rounded" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
        </div>
      </main>
    }>
      <ResourcesPageContent pdfUrl={pdfUrl} />
    </Suspense>
  );
}
