import { Link } from "react-router-dom";
import HeroSectionUSD from "@/components/landing/HeroSectionUSD";
import AuthoritySection from "@/components/landing/AuthoritySection";
import AboutSection from "@/components/landing/AboutSection";
import AudienceSection from "@/components/landing/AudienceSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ResultsSection from "@/components/landing/ResultsSection";
import PricingSectionUSD from "@/components/landing/PricingSectionUSD";
import FinalCTA from "@/components/landing/FinalCTA";

const CheckoutUSD = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSectionUSD />
      <AuthoritySection />
      <AboutSection />
      <AudienceSection />
      <BenefitsSection />
      <ResultsSection />
      <PricingSectionUSD />
      <FinalCTA />
      <footer className="py-4 text-center">
        <Link to="/login" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          Área administrativa
        </Link>
      </footer>
    </div>
  );
};

export default CheckoutUSD;
