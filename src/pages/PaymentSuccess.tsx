import { Check } from "lucide-react";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display mb-4">
          Pagamento <span className="text-gradient-gold">Confirmado!</span>
        </h1>
        <p className="text-muted-foreground font-body normal-case mb-8">
          Seu pagamento foi processado com sucesso. Entraremos em contato em breve
          para iniciar sua consultoria personalizada.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-4 rounded-lg bg-gradient-gold text-primary-foreground font-display font-bold uppercase tracking-wider hover:opacity-90 transition-all"
        >
          Voltar ao Início
        </a>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
