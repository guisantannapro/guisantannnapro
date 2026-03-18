import { motion } from "framer-motion";
import heroImg from "@/assets/hero-bg.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Coach Guilherme Sant'Anna - Atleta Profissional de Fisiculturismo"
          className="w-full h-full object-cover object-top opacity-50"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/60 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-primary uppercase tracking-[0.3em] text-sm md:text-base mb-4"
        >
          Guilherme Sant'Anna
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-tight mb-6 max-w-4xl mx-auto"
        >
          Assessoria Fitness Online
          <br />
          <span className="text-gradient-gold">Treino & Nutrição</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-4 normal-case"
        >
          Transforme seu corpo com estratégia, disciplina e acompanhamento profissional.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-body text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-10 normal-case"
        >
          Mais de 20 anos de experiência no fisiculturismo aplicados para ajudar
          cada pessoa a construir sua melhor versão física.
        </motion.p>

        <motion.a
          href="#planos"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="inline-block bg-gradient-gold text-primary-foreground px-10 py-4 rounded-lg font-display text-lg font-bold tracking-wider uppercase hover:opacity-90 transition-opacity glow-gold"
        >
          Quero Começar Minha Transformação
        </motion.a>
      </div>
    </section>
  );
};

export default HeroSection;
