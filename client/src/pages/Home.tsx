import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import DemoSection from "@/components/DemoSection";
import WaitlistSection from "@/components/WaitlistSection";
import CTASection from "@/components/CTASection";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-slate-50 py-8">
          <div className="container mx-auto px-4">
            <ChatInterface />
          </div>
        </div>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DemoSection />
        <TestimonialsSection />
        <FAQSection />
        <WaitlistSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
