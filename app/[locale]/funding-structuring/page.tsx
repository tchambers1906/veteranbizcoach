import { getTranslations } from 'next-intl/server';
import FundingPageContent from './FundingPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'fundingPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function FundingStructuringPage() {
  return <FundingPageContent />;
}
