import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  priceKey: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge: string | null;
}

const plans: PricingPlan[] = [
  {
    name: "Protocolo Mensal",
    description: "Acesso total por 30 dias",
    price: "$129",
    priceKey: "transformação-mensal",
    features: [
      "Treino Individualizado (App)",
      "Planejamento Alimentar",
      "Suporte Direto",
    ],
    cta: "COMPRAR ACESSO 30 DIAS",
    featured: false,
    badge: null,
  },
  {
    name: "Protocolo Trimestral",
    description: "Acesso total por 90 dias",
    price: "$329",
    priceKey: "transformação-trimestral",
    features: [
      "Tudo do Plano Mensal",
      "Ajustes Periódicos de Protocolo",
      "Prioridade no Suporte",
    ],
    cta: "COMPRAR ACESSO 90 DIAS",
    featured: true,
    badge: "Mais Procurado",
  },
  {
    name: "Protocolo Semestral",
    description: "Acesso total por 180 dias",
    price: "$449",
    priceKey: "transformação-semestral",
    features: [
      "Acompanhamento de Longo Prazo",
      "Estratégia de Off-Season e Cutting",
      "Melhor Custo-Benefício",
    ],
    cta: "COMPRAR ACESSO 180 DIAS",
    featured: false,
    badge: null,
  },
];

const PricingSection = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (plan: PricingPlan) => {
    console.log("Checkout initiated:", { priceKey: plan.priceKey });

    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "begin_checkout", {
        items: [{ item_name: plan.name, price: plan.price }],
      });
    }

    setLoadingPlan(plan.priceKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceKey: plan.priceKey },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned", data);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="planos" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold font-display mb-4 uppercase tracking-tighter">
            Escolha seu Protocolo
          </h2>
          <p className="text-muted-foreground">
            Pagamento único e seguro via Stripe. Sem cobranças automáticas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.priceKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.featured
                  ? "border-2 border-primary bg-card scale-[1.02] md:scale-105"
                  : "border-border bg-card/50 hover:border-primary transition-all"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-bold font-display mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

              <div className="text-5xl font-extrabold font-display mb-6 text-gradient-gold">
                {plan.price}
              </div>

              <ul className="text-left space-y-4 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-foreground/80 text-sm">
                    • {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={loadingPlan === plan.priceKey}
                className={`w-full py-4 font-bold font-display rounded-full uppercase tracking-wider transition-all disabled:opacity-70 ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {loadingPlan === plan.priceKey ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  plan.cta
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-muted-foreground text-xs italic">
          *Ao clicar em comprar, você será redirecionado para o checkout seguro do Stripe. O acesso é liberado imediatamente após a confirmação.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
