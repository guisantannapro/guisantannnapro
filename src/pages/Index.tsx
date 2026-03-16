import HeroSection from "@/components/landing/HeroSection";
import TransformationSection from "@/components/landing/TransformationSection";
import BenefitsSection from "@/components/landing/BenefitsSection";

import AuthoritySection from "@/components/landing/AuthoritySection";
import AboutSection from "@/components/landing/AboutSection";
import AudienceSection from "@/components/landing/AudienceSection";
import ResultsSection from "@/components/landing/ResultsSection";
import PricingSection from "@/components/landing/PricingSection";
import FinalCTA from "@/components/landing/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sant'Anna Fit sections */}
      <HeroSection />
      <TransformationSection />
      <BenefitsSection />
      <ApplicationForm />

      {/* Original project sections */}
      <AuthoritySection />
      <AboutSection />
      <AudienceSection />
      <ResultsSection />
      <PricingSection />
      <FinalCTA />

      <footer className="py-8 text-center border-t border-border">
        <p className="text-muted-foreground text-sm font-body normal-case">
          © {new Date().getFullYear()} Guilherme Sant'Anna — Assessoria Fitness Online
        </p>
      </footer>
    </div>
  );
};

export default Index;
