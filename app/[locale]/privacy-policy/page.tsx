import { getTranslations } from 'next-intl/server';
import PrivacyPolicyContent from './PrivacyPolicyContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacyPolicy' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
