import { getTranslations } from 'next-intl/server';
import QuizPageContent from './QuizPageContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quizPage' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function QuizPage() {
  return <QuizPageContent />;
}
