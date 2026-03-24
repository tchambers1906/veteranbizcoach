import { getTranslations } from 'next-intl/server';
import VillaPageContent from './VillaPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'villaPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function VillaBookingTrafficPage() {
  return <VillaPageContent />;
}
