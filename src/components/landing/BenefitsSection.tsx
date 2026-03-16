import { motion } from "framer-motion";
import { Dumbbell, Apple, ClipboardCheck, RefreshCw, MessageCircle } from "lucide-react";

const benefits = [
  {
    icon: Dumbbell,
    title: "Treinamento Personalizado",
    desc: "Treino estruturado de acordo com seu objetivo e nível.",
  },
  {
    icon: Apple,
    title: "Estratégia Nutricional",
    desc: "Plano alimentar direcionado para evolução constante.",
  },
  {
    icon: ClipboardCheck,
    title: "Acompanhamento Profissional",
    desc: "Avaliações e ajustes estratégicos.",
  },
  {
    icon: RefreshCw,
    title: "Atualizações no Plano",
    desc: "Seu planejamento evolui junto com seus resultados.",
  },
  {
    icon: MessageCircle,
    title: "Suporte Direto",
    desc: "Canal para dúvidas e orientações.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 md:py-32" id="beneficios">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            O Que Você Recebe <span className="text-gradient-gold">Na Consultoria</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-lg bg-card border border-border hover:border-primary/50 transition-all hover:glow-gold"
            >
              <div className="w-14 h-14 rounded-lg bg-gradient-gold flex items-center justify-center mb-6">
                <b.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">{b.title}</h3>
              <p className="text-muted-foreground font-body normal-case text-sm">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
