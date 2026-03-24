import { getTranslations } from 'next-intl/server';
import WebsiteDiagnosticQuiz from '@/components/quizzes/WebsiteDiagnosticQuiz';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'websiteQuiz' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function WebsiteQuizPage() {
  const pdfUrl = process.env.WEBSITE_CHECKLIST_PDF_URL || '';
  return <WebsiteDiagnosticQuiz pdfUrl={pdfUrl} />;
}
