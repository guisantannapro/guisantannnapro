import { motion } from "framer-motion";
import heroCoach from "@/assets/hero-coach.jpg";

const Transformacao = () => {
  const scrollToForm = () => {
    document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroCoach})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-primary uppercase tracking-[0.3em] text-sm md:text-base mb-4"
          >
            Guilherme Sant'Anna — IFBB PRO
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-tight mb-6"
          >
            Transforme Seu Corpo
            <br />
            <span className="text-gradient-gold">Com Estratégia, Disciplina</span>
            <br />
            E Acompanhamento Profissional
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-body text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 normal-case"
          >
            Mais de 20 anos de experiência no fisiculturismo aplicados ao seu objetivo.
            Treino e nutrição personalizados para resultados reais e duradouros.
          </motion.p>

          <motion.a
            href="/"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-gold font-display uppercase tracking-widest text-primary-foreground px-10 py-4 text-lg font-semibold glow-gold rounded-md"
          >
            Conhecer os Planos
          </motion.a>
        </div>
      </section>
    </div>
  );
};

export default Transformacao;
