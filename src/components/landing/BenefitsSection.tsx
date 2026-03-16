import { motion } from "framer-motion";
import { Dumbbell, Utensils, MessageCircle, TrendingUp, Shield, Clock } from "lucide-react";

const benefits = [
  { icon: Dumbbell, title: "Treino Personalizado", desc: "Plano de treino individualizado baseado nos seus objetivos e experiência." },
  { icon: Utensils, title: "Plano Alimentar", desc: "Dieta personalizada com macros e opções flexíveis para o seu dia a dia." },
  { icon: MessageCircle, title: "Suporte Direto", desc: "Acesso via WhatsApp para dúvidas, ajustes e acompanhamento." },
  { icon: TrendingUp, title: "Acompanhamento", desc: "Check-ins regulares e ajustes no plano para progresso contínuo." },
  { icon: Shield, title: "Saúde em Primeiro", desc: "Abordagem baseada em evidências respeitando sua saúde e limitações." },
  { icon: Clock, title: "Flexibilidade", desc: "Programas adaptados à sua rotina e equipamentos disponíveis." },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase mb-4">
            Por Que Escolher <span className="text-gradient-gold">Minha Assessoria</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto normal-case">
            Mais do que um plano — uma parceria completa para a sua transformação.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-8 rounded-lg border border-border hover:border-primary/30 transition-colors shadow-lg"
            >
              <b.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl uppercase mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed normal-case">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
