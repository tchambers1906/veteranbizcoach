import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PwaInstallBanner from '@/components/layout/PwaInstallBanner';
import ChatbotWidget from '@/components/ChatbotWidget';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <PwaInstallBanner />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      <Footer />
      <ChatbotWidget />
    </NextIntlClientProvider>
  );
}
