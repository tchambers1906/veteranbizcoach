import { getTranslations } from 'next-intl/server';
import TeamPageContent from './TeamPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'teamPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function TeamPage() {
  return <TeamPageContent />;
}
