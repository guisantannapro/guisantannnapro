import { motion } from "framer-motion";
import heroImg from "@/assets/hero-bg.webp";

const HeroSectionUSD = () => {
  return (
    <section className="relative min-h-[65vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Coach Guilherme Sant'Anna - IFBB Pro Athlete"
          loading="eager"
          className="w-full h-full object-cover object-[center_20%] md:object-top opacity-50"
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
          20 Anos de Disciplina,
          <br />
          <span className="text-gradient-gold">Padrão IFBB Pro.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-foreground/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-2 normal-case px-2 md:whitespace-nowrap"
        >
          <span className="whitespace-nowrap">🇧🇷 Consultoria online para</span>{" "}
          <span className="whitespace-nowrap">brasileiros que vivem</span>{" "}
          <span className="whitespace-nowrap">nos Estados Unidos 🇺🇸</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-body text-foreground/60 text-base md:text-lg max-w-2xl mx-auto mb-8 normal-case"
        >
          Treino e dieta personalizados para sua rotina nos EUA.
        </motion.p>

        <motion.a
          href="https://wa.me/55489995017233?text=Olá!%20Tenho%20interesse%20nos%20planos%20de%20consultoria."
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="inline-block bg-gradient-gold text-primary-foreground px-10 py-4 rounded-lg font-display text-lg font-bold tracking-wider uppercase hover:opacity-90 transition-opacity glow-gold"
        >
          Falar com o Coach no WhatsApp
        </motion.a>
      </div>
    </section>
  );
};

export default HeroSectionUSD;
