import { motion } from "framer-motion";

const FinalCTA = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/20 relative overflow-hidden" id="cta">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-display mb-8">
            Sua Transformação{" "}
            <span className="text-gradient-gold">Começa Agora</span>
          </h2>

          <a
            href="#planos"
            className="inline-block bg-gradient-gold text-primary-foreground px-10 py-5 rounded-lg font-display text-xl font-bold tracking-wider uppercase hover:opacity-90 transition-opacity glow-gold"
          >
            Quero Começar Minha Evolução
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
