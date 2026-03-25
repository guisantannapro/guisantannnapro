import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RenewalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string | null;
  currentPeriod: string | null;
  currentModality: string | null;
}

const plans = [
  { value: "base", label: "Base", description: "Dieta ou Treino" },
  { value: "transformacao", label: "Transformação", description: "Dieta + Treino + Suplementação" },
  { value: "elite", label: "Elite", description: "Acompanhamento completo" },
];

const periods = [
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
];

const modalities = [
  { value: "dieta", label: "Dieta" },
  { value: "treino", label: "Treino" },
  { value: "ambos", label: "Dieta + Treino" },
];

// Preços em R$ por combinação
const prices: Record<string, number> = {
  "base-dieta-mensal": 129.90,
  "base-treino-mensal": 129.90,
  "base-dieta+treino-mensal": 259.80,
  "transformação-mensal": 199.90,
  "transformação-trimestral": 549.90,
  "transformação-semestral": 999.90,
  "elite-mensal": 299.90,
  "elite-trimestral": 849.90,
  "elite-semestral": 1499.90,
};

const normalizePeriod = (p: string) => {
  const lower = p.toLowerCase();
  if (lower === "monthly") return "mensal";
  if (lower === "quarterly") return "trimestral";
  if (lower === "semiannual") return "semestral";
  return lower;
};

const RenewalModal = ({ open, onOpenChange, currentPlan, currentPeriod, currentModality }: RenewalModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || "base");
  const [selectedPeriod, setSelectedPeriod] = useState(normalizePeriod(currentPeriod || "mensal"));
  const [selectedModality, setSelectedModality] = useState(currentModality || "dieta");
  const [loading, setLoading] = useState(false);

  // Base only has mensal
  const availablePeriods = selectedPlan === "base" ? [periods[0]] : periods;

  // Reset period if switching to base and period isn't mensal
  const handlePlanChange = (plan: string) => {
    setSelectedPlan(plan);
    if (plan === "base" && selectedPeriod !== "mensal") {
      setSelectedPeriod("mensal");
    }
  };

  const buildPriceKey = () => {
    if (selectedPlan === "base") {
      const mod = selectedModality === "ambos" ? "dieta+treino" : selectedModality;
      return `base-${mod}-${selectedPeriod}`;
    }
    const planName = selectedPlan === "transformacao" ? "transformação" : selectedPlan;
    return `${planName}-${selectedPeriod}`;
  };

  const currentPrice = prices[buildPriceKey()] || null;

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const priceKey = buildPriceKey();
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
      } else {
        toast.error("Erro ao gerar link de pagamento.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Erro ao iniciar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold uppercase">Renovar Plano</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecione o plano desejado para continuar seu acompanhamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Plan Selection */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Plano</span>
            <div className="grid gap-2">
              {plans.map((plan) => (
                <button
                  key={plan.value}
                  onClick={() => handlePlanChange(plan.value)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                    selectedPlan === plan.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div>
                    <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  {selectedPlan === plan.value && currentPlan === plan.value && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">Atual</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modality (Base only) */}
          {selectedPlan === "base" && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Modalidade</span>
              <div className="flex gap-2">
                {modalities.map((mod) => (
                  <button
                    key={mod.value}
                    onClick={() => setSelectedModality(mod.value)}
                    className={`flex-1 text-center py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      selectedModality === mod.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Period Selection */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Período</span>
            <div className="flex gap-2">
              {availablePeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`flex-1 text-center py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Checkout */}
          {currentPrice && (
            <div className="text-center py-2">
              <span className="text-2xl font-bold text-foreground">{formatPrice(currentPrice)}</span>
              {selectedPeriod !== "mensal" && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({formatPrice(currentPrice / (selectedPeriod === "trimestral" ? 3 : 6))}/mês)
                </span>
              )}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {loading ? "Processando..." : "Ir para pagamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RenewalModal;
