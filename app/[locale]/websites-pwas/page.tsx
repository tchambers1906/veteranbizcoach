import { getTranslations } from 'next-intl/server';
import WebsitesPageContent from './WebsitesPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'websitesPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function WebsitesPwasPage() {
  return <WebsitesPageContent />;
}
