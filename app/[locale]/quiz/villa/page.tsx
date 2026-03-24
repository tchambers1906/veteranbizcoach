import { getTranslations } from 'next-intl/server';
import VillaReadinessQuiz from '@/components/quizzes/VillaReadinessQuiz';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'villaQuiz' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function VillaQuizPage() {
  const pdfUrl = process.env.VILLA_GUIDE_PDF_URL || '';
  return <VillaReadinessQuiz pdfUrl={pdfUrl} />;
}
