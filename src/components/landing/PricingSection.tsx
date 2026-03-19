import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Star, Zap, ChevronDown } from "lucide-react";

type BaseOption = "dieta" | "treino";
type BillingPeriod = "mensal" | "trimestral" | "semestral";

interface PlanPricing {
  value: string;
  period: string;
  label: string;
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
  hasSelector: boolean;
}

const plans: Plan[] = [
  {
    name: "Base",
    subtitle: "Ideal para quem quer começar com estratégia e direcionamento profissional.",
    pricing: {
      mensal: { value: "129,90", period: "/mês", label: "Mensal" },
      trimestral: { value: "129,90", period: "/mês", label: "Mensal" },
      semestral: { value: "129,90", period: "/mês", label: "Mensal" },
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
    hasSelector: false,
  },
  {
    name: "Transformação",
    subtitle: "Para quem quer resultados visíveis com estratégia completa e acompanhamento.",
    pricing: {
      mensal: { value: "329,90", period: "/mês", label: "Mensal" },
      trimestral: { value: "867,90", period: "/trimestre", label: "Trimestral", savingsText: "Você economiza R$ 121,80 no total" },
      semestral: { value: "1.679,90", period: "/semestre", label: "Semestral", savingsText: "Você economiza R$ 299,50 no total" },
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
    hasSelector: true,
  },
  {
    name: "Elite",
    subtitle: "Acompanhamento próximo e estratégico para máxima evolução física.",
    pricing: {
      mensal: { value: "449,90", period: "/mês", label: "Mensal" },
      trimestral: { value: "1.169,90", period: "/trimestre", label: "Trimestral", savingsText: "Você economiza R$ 179,80 no total" },
      semestral: { value: "2.249,90", period: "/semestre", label: "Semestral", savingsText: "Você economiza R$ 449,50 no total" },
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
    hasSelector: true,
  },
];

const billingKeys: BillingPeriod[] = ["mensal", "trimestral", "semestral"];

const guarantees = [
  "Acompanhamento 100% personalizado",
  "Estratégias baseadas em experiência real no fisiculturismo",
  "Método focado em resultados consistentes",
];

/* ── Per-card price selector dropdown ── */
const PriceSelector = ({
  plan,
  billing,
  onSelect,
}: {
  plan: Plan;
  billing: BillingPeriod;
  onSelect: (b: BillingPeriod) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = plan.pricing[billing];
  const [intPart, centPart] = current.value.split(",");

  return (
    <div className="mb-8 relative" ref={ref}>
      {/* Price row: clickable button + period label outside */}
      <div className="flex items-baseline flex-wrap gap-x-1">
        <span className="text-sm text-muted-foreground font-body normal-case">R$</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={billing}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-baseline gap-x-0.5"
          >
            <span className="text-5xl font-bold font-display text-gradient-gold">{intPart}</span>
            <span className="text-lg font-bold font-display text-gradient-gold">,{centPart}</span>
          </motion.span>
        </AnimatePresence>
        {plan.hasSelector && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 cursor-pointer group ml-1"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={billing}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-muted-foreground font-body normal-case text-sm group-hover:text-primary transition-colors"
              >
                {current.period}
              </motion.span>
            </AnimatePresence>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""} group-hover:text-primary`}
            />
          </button>
        )}
        {!plan.hasSelector && (
          <span className="text-muted-foreground font-body normal-case text-sm">{current.period}</span>
        )}
      </div>

        {/* Savings text */}
        <AnimatePresence>
          {current.savingsText && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="text-[11px] font-body normal-case mt-2"
              style={{ color: "hsl(var(--gold-light))" }}
            >
              {current.savingsText}
            </motion.p>
          )}
        </AnimatePresence>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-30 rounded-lg border border-border bg-secondary/95 backdrop-blur-sm overflow-hidden shadow-lg"
          >
            {billingKeys.map((key) => {
              const p = plan.pricing[key];
              const isActive = key === billing;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSelect(key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  <span className="font-display text-sm font-bold uppercase tracking-wider shrink-0">
                    {p.label}
                  </span>
                  <span className="font-body text-xs normal-case text-right whitespace-nowrap">
                    R$ {p.value}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main Section ── */
const PricingSection = () => {
  const [billings, setBillings] = useState<Record<string, BillingPeriod>>({
    Base: "mensal",
    Transformação: "trimestral",
    Elite: "trimestral",
  });
  const [baseOption, setBaseOption] = useState<BaseOption>("dieta");

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
          <p className="text-muted-foreground font-body normal-case max-w-2xl mx-auto">
            Todos os planos incluem estratégia personalizada e acompanhamento
            profissional para evolução real.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
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

              {/* Base plan option selector */}
              {plan.name === "Base" && (
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground font-body normal-case mb-2">
                    Escolha sua modalidade:
                  </p>
                  <div className="flex gap-2">
                    {(["dieta", "treino"] as BaseOption[]).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBaseOption(opt)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all ${
                          baseOption === opt
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {opt === "dieta" ? "Dieta" : "Treino"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <PriceSelector
                plan={plan}
                billing={billings[plan.name]}
                onSelect={(b) => setBillings((prev) => ({ ...prev, [plan.name]: b }))}
              />

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-body normal-case text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`#cta${plan.name === "Base" ? `?plano=base&modalidade=${baseOption}` : `?plano=${encodeURIComponent(plan.name.toLowerCase())}&periodo=${billings[plan.name]}`}`}
                className={`block text-center py-4 rounded-lg font-display font-bold uppercase tracking-wider transition-all ${
                  plan.featured
                    ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                    : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
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
