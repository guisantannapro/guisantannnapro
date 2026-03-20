import ApplicationForm from "@/components/ApplicationForm";

const Formulario = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ApplicationForm />
      <footer className="py-8 text-center border-t border-border">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Guilherme Sant'Anna IFBBPRO — Consultoria Fitness
        </p>
      </footer>
    </div>
  );
};

export default Formulario;
