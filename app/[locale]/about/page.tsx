import { getTranslations } from 'next-intl/server';
import AboutPageContent from './AboutPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aboutPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function AboutPage() {
  return <AboutPageContent />;
}
