import HeroSection from '@/components/sections/HeroSection';
import VillaBookingSection from '@/components/sections/VillaBookingSection';
import SuperpowerSection from '@/components/sections/SuperpowerSection';
import WebsitesPwasSection from '@/components/sections/WebsitesPwasSection';
import FundingSection from '@/components/sections/FundingSection';
import AboutSection from '@/components/sections/AboutSection';
import TeamSection from '@/components/sections/TeamSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import LeadMagnetSection from '@/components/sections/LeadMagnetSection';
import QuizSection from '@/components/sections/QuizSection';
import FaqSection from '@/components/sections/FaqSection';

export default function HomePage() {
  const pdfUrl = process.env.LEAD_MAGNET_PDF_URL || '';

  return (
    <>
      <HeroSection />
      <VillaBookingSection />
      <SuperpowerSection />
      <WebsitesPwasSection />
      <FundingSection />
      <AboutSection />
      <TeamSection />
      <TestimonialsSection />
      <LeadMagnetSection pdfUrl={pdfUrl} />
      <QuizSection />
      <FaqSection />
    </>
  );
}
