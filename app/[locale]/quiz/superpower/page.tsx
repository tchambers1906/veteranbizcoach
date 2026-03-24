import { getTranslations } from 'next-intl/server';
import SuperpowerDiscoveryQuiz from '@/components/quizzes/SuperpowerDiscoveryQuiz';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'superpowerQuiz' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function SuperpowerQuizPage() {
  const pdfUrl = process.env.SUPERPOWER_WORKBOOK_PDF_URL || '';
  return <SuperpowerDiscoveryQuiz pdfUrl={pdfUrl} />;
}
