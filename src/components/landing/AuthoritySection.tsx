import { motion } from "framer-motion";
import { Trophy, Dumbbell, Users, Target, Medal } from "lucide-react";

const stats = [
  { icon: Dumbbell, value: "20+", label: "Anos de experiência" },
  { icon: Medal, value: "PRO", label: "Atleta profissional" },
  { icon: Trophy, value: "6x", label: "Campeão (Estreante, Estadual, Brasileiro, Eduardo Corrêa Classic, Iron Games, Masters Brasil)" },
  { icon: Users, value: "100+", label: "Atletas e clientes atendidos" },
  { icon: Target, value: "100%", label: "Método baseado em prática real" },
];

const AuthoritySection = () => {
  return (
    <section className="py-16 md:py-24 border-y border-border bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <stat.icon className="w-8 h-8 text-primary mb-3" />
              <span className="text-3xl md:text-4xl font-bold font-display text-gradient-gold">
                {stat.value}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground mt-1 font-body normal-case">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuthoritySection;
