import { motion } from "framer-motion";
import { Award, Shield, Flame } from "lucide-react";
import heroImg from "@/assets/hero-bg.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Coach Guilherme Sant'Anna - Atleta Profissional de Fisiculturismo"
          className="w-full h-full object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          {/* Trigger badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {[
              { icon: Award, text: "Autoridade" },
              { icon: Flame, text: "Transformação" },
              { icon: Shield, text: "Exclusividade" },
            ].map((badge) => (
              <span
                key={badge.text}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase"
              >
                <badge.icon className="w-3.5 h-3.5" />
                {badge.text}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 font-display"
          >
            Transforme Seu Corpo com{" "}
            <span className="text-gradient-gold">Estratégia, Disciplina</span> e
            Acompanhamento Profissional
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-foreground/80 mb-4 font-body max-w-2xl normal-case"
          >
            Consultoria online personalizada para quem quer ganhar massa muscular,
            perder gordura e alcançar resultados reais.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-sm md:text-base text-muted-foreground mb-10 font-body max-w-xl normal-case"
          >
            Mais de 20 anos de experiência no fisiculturismo aplicados para ajudar
            cada pessoa a construir sua melhor versão física.
          </motion.p>

          <motion.a
            href="#planos"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="inline-block bg-gradient-gold text-primary-foreground px-8 py-4 rounded-lg font-display text-lg font-bold tracking-wider uppercase hover:opacity-90 transition-opacity glow-gold"
          >
            Quero Começar Minha Transformação
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
