import { Link } from "react-router-dom";
import HeroSection from "@/components/landing/HeroSection";
import AuthoritySection from "@/components/landing/AuthoritySection";
import AboutSection from "@/components/landing/AboutSection";
import AudienceSection from "@/components/landing/AudienceSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ResultsSection from "@/components/landing/ResultsSection";
import PricingSection from "@/components/landing/PricingSection";
import FinalCTA from "@/components/landing/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <AuthoritySection />
      <AboutSection />
      <AudienceSection />
      <BenefitsSection />
      <ResultsSection />
      <PricingSection />
      <FinalCTA />
      <footer className="py-4 text-center">
        <Link to="/login" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          Área administrativa
        </Link>
      </footer>
    </div>
  );
};

export default Index;
