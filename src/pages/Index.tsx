import HeroSection from "@/components/landing/HeroSection";
import TransformationSection from "@/components/landing/TransformationSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ApplicationForm from "@/components/landing/ApplicationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <TransformationSection />
      <BenefitsSection />
      <ApplicationForm />
      <footer className="py-8 text-center border-t border-border">
        <p className="text-muted-foreground text-sm font-body normal-case">
          © {new Date().getFullYear()} Guilherme Sant'Anna — Assessoria Fitness Online
        </p>
      </footer>
    </div>
  );
};

export default Index;
