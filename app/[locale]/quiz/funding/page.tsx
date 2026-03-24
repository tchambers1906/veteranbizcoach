import { getTranslations } from 'next-intl/server';
import FundingReadinessQuiz from '@/components/quizzes/FundingReadinessQuiz';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'fundingQuiz' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function FundingQuizPage() {
  const pdfUrl = process.env.LEAD_MAGNET_PDF_URL || '';
  return <FundingReadinessQuiz pdfUrl={pdfUrl} />;
}
