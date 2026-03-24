import { getTranslations } from 'next-intl/server';
import TestimonialsPageContent from './TestimonialsPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'testimonialsPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function TestimonialsPage() {
  return <TestimonialsPageContent />;
}
