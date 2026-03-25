import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const period = searchParams.get("period");
  const modality = searchParams.get("modality");
  const isRenewal = searchParams.get("renewal") === "true";
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (plan) localStorage.setItem("purchased_plan", plan);
    if (period) localStorage.setItem("purchased_period", period);
    if (modality) localStorage.setItem("purchased_modality", modality);
  }, [plan, period, modality]);

  // Auto-activate plan on renewal
  useEffect(() => {
    if (!isRenewal || !plan || activated || activating) return;

    const activatePlan = async () => {
      setActivating(true);
      try {
        const { data, error } = await supabase.functions.invoke("activate-plan", {
          body: { plan, period: period || "mensal" },
        });

        if (error) {
          console.error("Activate plan error:", error);
          toast.error("Erro ao atualizar o plano. Entre em contato com o suporte.");
        } else {
          setActivated(true);
          toast.success("Plano atualizado com sucesso!");
        }
      } catch (err) {
        console.error("Activate plan error:", err);
        toast.error("Erro ao atualizar o plano.");
      } finally {
        setActivating(false);
      }
    };

    activatePlan();
  }, [isRenewal, plan, period, activated, activating]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {activating ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          ) : (
            <Check className="w-10 h-10 text-primary" />
          )}
        </div>
        <h1 className="text-3xl font-bold font-display mb-4">
          Pagamento <span className="text-gradient-gold">Confirmado!</span>
        </h1>
        <p className="text-muted-foreground font-body normal-case mb-8">
          {isRenewal
            ? activating
              ? "Atualizando seu plano..."
              : "Sua renovação foi processada com sucesso. Seu plano foi atualizado!"
            : "Seu pagamento foi processado com sucesso. Entraremos em contato em breve para iniciar sua consultoria personalizada."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isRenewal ? (
            <a
              href="/area-do-cliente"
              className="inline-block px-8 py-4 rounded-lg bg-gradient-gold text-primary-foreground font-display font-bold uppercase tracking-wider hover:opacity-90 transition-all"
            >
              Voltar à Área do Cliente
            </a>
          ) : (
            <>
              <a
                href="/"
                className="inline-block px-8 py-4 rounded-lg bg-gradient-gold text-primary-foreground font-display font-bold uppercase tracking-wider hover:opacity-90 transition-all"
              >
                Voltar ao Início
              </a>
              {plan && (
                <a
                  href="/formulario"
                  className="inline-block px-8 py-4 rounded-lg border border-primary text-primary font-display font-bold uppercase tracking-wider hover:bg-primary/10 transition-all"
                >
                  Preencher Formulário
                </a>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
