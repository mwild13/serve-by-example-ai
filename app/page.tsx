import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/homepage/HeroSection";
import StatsSection from "@/components/homepage/StatsSection";
import ObjectionsSection from "@/components/homepage/ObjectionsSection";
import HowItWorksSection from "@/components/homepage/HowItWorksSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import VideoSection from "@/components/homepage/VideoSection";
import FAQSection from "@/components/homepage/FAQSection";
import CTASection from "@/components/homepage/CTASection";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar showActions={false} showTextLogin showNavbarLanguageOnMobile={false} />

      <main>
        <HeroSection />
        <StatsSection />
        <ObjectionsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <VideoSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
