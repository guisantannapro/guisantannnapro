import { motion } from "framer-motion";
import { Trophy, Dumbbell, Users, Target, Medal } from "lucide-react";

const stats = [
  { icon: Dumbbell, value: "20+", label: "Anos de experiência" },
  { icon: Medal, value: "IFBB PRO", label: "Atleta profissional" },
  {
    icon: Trophy,
    value: "15x",
    label: "Campeão",
    subItems: [
      "Brasileiro IFBB",
      "Musclecontest Correia Classic",
      "Musclecontest Iron Games",
      "Musclecontest Masters Brasil 2x",
    ],
  },
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
              {"subItems" in stat && stat.subItems && (
                <div className="mt-2 space-y-0.5">
                  {stat.subItems.map((item: string) => (
                    <p key={item} className="text-[10px] md:text-xs text-muted-foreground font-body normal-case">
                      {item}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuthoritySection;
