import { motion } from "framer-motion";
import { Check, Crown, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Base",
    subtitle: "Ideal para quem quer começar com estratégia e direcionamento profissional.",
    price: "129",
    priceCents: "90",
    extraPrices: null,
    savingsNote: null,
    features: [
      "Escolha entre dieta OU treino individualizado",
      "Estrutura personalizada inicial",
      "Direcionamento profissional",
      "Atualização mensal",
    ],
    cta: "Começar Agora",
    badge: null,
    featured: false,
    icon: Zap,
  },
  {
    name: "Transformação",
    subtitle: "Para quem quer resultados visíveis com estratégia completa e acompanhamento.",
    price: "329",
    priceCents: "90",
    extraPrices: [
      { value: "R$ 867,90", period: "/trimestre" },
      { value: "R$ 1.679,90", period: "/semestre" },
    ],
    savingsNote: "Economize até R$ 299 no plano semestral",
    features: [
      "Dieta individualizada completa",
      "Periodização de treino personalizada",
      "Feedbacks mensais",
      "Sugestão de suplementos e manipulados",
      "Avaliação de exames",
      "Ajustes conforme evolução",
    ],
    cta: "Quero Minha Transformação",
    badge: "Mais escolhido pelos clientes",
    featured: true,
    icon: Star,
  },
  {
    name: "Elite",
    subtitle: "Acompanhamento próximo e estratégico para máxima evolução física.",
    price: "449",
    priceCents: "90",
    extraPrices: [
      { value: "R$ 1.169,90", period: "/trimestre" },
      { value: "R$ 2.249,90", period: "/semestre" },
    ],
    savingsNote: "Maior economia nos planos longos",
    features: [
      "Dieta individualizada completa",
      "Periodização de treino avançada",
      "Feedback semanal via WhatsApp",
      "Correção de exercícios por vídeo",
      "Atualização de fotos quinzenal",
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
            Todos os planos incluem acompanhamento profissional e estratégia
            personalizada para evolução real.
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
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
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
                <span className="text-sm text-muted-foreground font-body normal-case">
                  R$
                </span>
                <span className="text-5xl font-bold font-display text-gradient-gold ml-1">
                  {plan.price}
                </span>
                <span className="text-muted-foreground font-body normal-case text-sm">
                  /mês
                </span>
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
