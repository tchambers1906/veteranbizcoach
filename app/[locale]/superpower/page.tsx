import { getTranslations } from 'next-intl/server';
import SuperpowerPageContent from './SuperpowerPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'superpowerPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function SuperpowerPage() {
  return <SuperpowerPageContent />;
}
