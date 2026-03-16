import { motion } from "framer-motion";
import { Dumbbell, Flame, Target, TrendingUp, UserCheck, Zap } from "lucide-react";

const items = [
  { icon: Dumbbell, text: "Ganhar massa muscular" },
  { icon: Flame, text: "Perder gordura" },
  { icon: Target, text: "Melhorar definição corporal" },
  { icon: TrendingUp, text: "Evoluir no treino de musculação" },
  { icon: UserCheck, text: "Ter acompanhamento profissional" },
  { icon: Zap, text: "Sair da estagnação física" },
];

const AudienceSection = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/20" id="para-quem">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            Para Quem É <span className="text-gradient-gold">A Consultoria</span>
          </h2>
          <p className="text-muted-foreground font-body normal-case max-w-xl mx-auto">
            Esta consultoria é para quem quer:
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 p-5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-body normal-case text-foreground/90 font-medium">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
