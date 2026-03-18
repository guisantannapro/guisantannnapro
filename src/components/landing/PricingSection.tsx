import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Star, Zap } from "lucide-react";

type BillingPeriod = "mensal" | "trimestral" | "semestral";

const billingOptions: { key: BillingPeriod; label: string }[] = [
  { key: "mensal", label: "Mensal" },
  { key: "trimestral", label: "Trimestral" },
  { key: "semestral", label: "Semestral" },
];

interface PlanPricing {
  value: string;
  period: string;
  savingsText?: string;
}

interface Plan {
  name: string;
  subtitle: string;
  pricing: Record<BillingPeriod, PlanPricing>;
  features: string[];
  cta: string;
  badge: string | null;
  featured: boolean;
  icon: typeof Zap;
}

const plans: Plan[] = [
  {
    name: "Base",
    subtitle: "Ideal para quem quer começar com estratégia e direcionamento profissional.",
    pricing: {
      mensal: { value: "129,90", period: "/mês" },
      trimestral: { value: "129,90", period: "/mês" },
      semestral: { value: "129,90", period: "/mês" },
    },
    features: [
      "Escolha entre dieta OU treino individualizado",
      "Estrutura personalizada inicial",
      "Direcionamento profissional",
    ],
    cta: "Começar Agora",
    badge: null,
    featured: false,
    icon: Zap,
  },
  {
    name: "Transformação",
    subtitle: "Para quem quer resultados visíveis com estratégia completa e acompanhamento.",
    pricing: {
      mensal: { value: "329,90", period: "/mês" },
      trimestral: { value: "867,90", period: "/trimestre", savingsText: "Você economiza R$ 121,80 comparado ao mensal" },
      semestral: { value: "1.679,90", period: "/semestre", savingsText: "Você economiza R$ 299,50 comparado ao mensal" },
    },
    features: [
      "Dieta individualizada completa",
      "Periodização de treino personalizada",
      "Feedbacks mensais",
      "Sugestão de suplementos e manipulados",
      "Avaliação de exames",
      "Ajustes conforme evolução",
      "Atualização mensal",
    ],
    cta: "Quero Minha Transformação",
    badge: "Mais escolhido pelos clientes",
    featured: true,
    icon: Star,
  },
  {
    name: "Elite",
    subtitle: "Acompanhamento próximo e estratégico para máxima evolução física.",
    pricing: {
      mensal: { value: "449,90", period: "/mês" },
      trimestral: { value: "1.169,90", period: "/trimestre", savingsText: "Você economiza R$ 179,80 comparado ao mensal" },
      semestral: { value: "2.249,90", period: "/semestre", savingsText: "Você economiza R$ 449,50 comparado ao mensal" },
    },
    features: [
      "Dieta individualizada completa",
      "Periodização de treino avançada",
      "Feedback semanal via WhatsApp",
      "Correção de exercícios por vídeo",
      "Atualização quinzenal",
      "Sugestão de suplementos e manipulados",
      "Avaliação de exames com ajustes",
      "Resposta prioritária",
    ],
    cta: "Quero Acompanhamento Elite",
    badge: "Plano Premium",
    featured: false,
    icon: Crown,
  },
];

const guarantees = [
  "Acompanhamento 100% personalizado",
  "Estratégias baseadas em experiência real no fisiculturismo",
  "Método focado em resultados consistentes",
];

const PricingSection = () => {
  const [billing, setBilling] = useState<BillingPeriod>("trimestral");

  return (
    <section className="py-20 md:py-32" id="planos">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            Escolha Seu Nível de{" "}
            <span className="text-gradient-gold">Transformação</span>
          </h2>
          <p className="text-muted-foreground font-body normal-case max-w-2xl mx-auto mb-8">
            Todos os planos incluem estratégia personalizada e acompanhamento
            profissional para evolução real.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 gap-1">
            {billingOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setBilling(opt.key)}
                className={`px-5 py-2 rounded-md text-sm font-display font-bold uppercase tracking-wider transition-all ${
                  billing === opt.key
                    ? "bg-gradient-gold text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => {
            const currentPricing = plan.pricing[billing];
            const [intPart, centPart] = currentPricing.value.split(",");

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative flex flex-col rounded-xl border p-8 transition-all ${
                  plan.featured
                    ? "border-primary bg-card glow-gold scale-[1.02] md:scale-105"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                      plan.featured
                        ? "bg-gradient-gold text-primary-foreground"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6 mt-2">
                  <plan.icon
                    className={`w-8 h-8 mb-4 ${
                      plan.featured ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <h3 className="text-2xl font-bold font-display">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm font-body normal-case mt-2">
                    {plan.subtitle}
                  </p>
                </div>

                <div className="mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={billing}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-baseline flex-wrap gap-x-1">
                        <span className="text-sm text-muted-foreground font-body normal-case">
                          R$
                        </span>
                        <span className="text-5xl font-bold font-display text-gradient-gold">
                          {intPart}
                        </span>
                        <span className="text-lg font-bold font-display text-gradient-gold">
                          ,{centPart}
                        </span>
                        <span className="text-muted-foreground font-body normal-case text-sm">
                          {currentPricing.period}
                        </span>
                      </div>
                      {currentPricing.savings && (
                        <p className="text-xs text-primary/70 font-body normal-case mt-1.5">
                          {currentPricing.savings}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-body normal-case text-foreground/80">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#cta"
                  className={`block text-center py-4 rounded-lg font-display font-bold uppercase tracking-wider transition-all ${
                    plan.featured
                      ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                      : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-16"
        >
          {guarantees.map((g) => (
            <div
              key={g}
              className="flex items-center gap-2 text-sm text-muted-foreground font-body normal-case"
            >
              <Check className="w-4 h-4 text-primary" />
              {g}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
