import { getTranslations } from 'next-intl/server';
import TermsContent from './TermsContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'termsPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function TermsPage() {
  return <TermsContent />;
}
