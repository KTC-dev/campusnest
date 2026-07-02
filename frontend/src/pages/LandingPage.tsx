import { MarketingNav } from "@/components/landing/MarketingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedPropertiesSection } from "@/components/landing/FeaturedPropertiesSection";
import {
  WhyChooseSection,
  HowItWorksSection,
  RoommateMatchingSection,
  BecomeLandlordSection,
} from "@/components/landing/MarketingSections";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/Footer";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <HeroSection />
      <FeaturedPropertiesSection />
      <WhyChooseSection />
      <HowItWorksSection />
      <RoommateMatchingSection />
      <StatsSection />
      <BecomeLandlordSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
