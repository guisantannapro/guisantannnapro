import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PricingCard {
  name: string;
  price: string;
  access: string;
  priceKey: string;
  featured?: boolean;
}

interface PlanGroup {
  title: string;
  cards: PricingCard[];
}

const planGroups: PlanGroup[] = [
  {
    title: "Planos Base",
    cards: [
      { name: "Dieta Base", price: "49.90", access: "Acesso 30 dias", priceKey: "base-dieta-mensal" },
      { name: "Treino Base", price: "49.90", access: "Acesso 30 dias", priceKey: "base-treino-mensal" },
      { name: "Dieta + Treino", price: "99.80", access: "Acesso 30 dias", priceKey: "base-dieta+treino-mensal", featured: true },
    ],
  },
  {
    title: "Plano Transformação",
    cards: [
      { name: "30 dias", price: "109.00", access: "Acesso 30 dias", priceKey: "transformação-mensal" },
      { name: "90 dias", price: "289.90", access: "Acesso 90 dias", priceKey: "transformação-trimestral", featured: true },
      { name: "180 dias", price: "529.90", access: "Acesso 180 dias", priceKey: "transformação-semestral" },
    ],
  },
  {
    title: "Plano Elite (IFBB Pro Coach)",
    cards: [
      { name: "30 dias", price: "149.90", access: "Acesso 30 dias", priceKey: "elite-mensal" },
      { name: "90 dias", price: "399.90", access: "Acesso 90 dias", priceKey: "elite-trimestral", featured: true },
      { name: "180 dias", price: "719.90", access: "Acesso 180 dias", priceKey: "elite-semestral" },
    ],
  },
];

const guarantees = [
  "Coaching 100% personalizado",
  "Estratégias baseadas em experiência real no fisiculturismo",
  "Método focado em resultados consistentes",
];

const PricingSectionUSD = () => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleCheckout = async (card: PricingCard) => {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "begin_checkout", {
        currency: "USD",
        items: [{ item_name: card.name, price: card.price }],
      });
    }

    setLoadingKey(card.priceKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-usd", {
        body: { priceKey: card.priceKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned", data);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <section className="py-20 md:py-32" id="planos">
      <div className="container mx-auto px-4 max-w-5xl">
        {planGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: gi * 0.1 }}
            className={gi < planGroups.length - 1 ? "mb-20" : ""}
          >
            <h3 className="text-2xl md:text-3xl font-bold font-display text-center uppercase tracking-widest mb-10">
              {group.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {group.cards.map((card, ci) => (
                <motion.div
                  key={card.priceKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: ci * 0.1 }}
                  className={`relative flex flex-col rounded-xl border p-8 transition-all ${
                    card.featured
                      ? "border-primary bg-card glow-gold scale-[1.02] md:scale-105"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {card.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-gradient-gold text-primary-foreground">
                      Mais popular
                    </div>
                  )}

                  <h4 className="text-xl font-bold font-display mb-4 mt-1">{card.name}</h4>

                  <div className="flex items-baseline gap-x-1 mb-2">
                    <span className="text-sm text-muted-foreground font-body">$</span>
                    <span className="text-5xl font-bold font-display text-gradient-gold">
                      {card.price.split(".")[0]}
                    </span>
                    <span className="text-lg font-bold font-display text-gradient-gold">
                      .{card.price.split(".")[1]}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground font-body normal-case mb-8">
                    {card.access} · Pagamento único
                  </p>

                  <div className="flex-1" />

                  <button
                    onClick={() => handleCheckout(card)}
                    disabled={loadingKey === card.priceKey}
                    className={`w-full py-4 rounded-lg font-display font-bold uppercase tracking-wider transition-all disabled:opacity-70 ${
                      card.featured
                        ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                        : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    {loadingKey === card.priceKey ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "COMPRAR AGORA"
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-16"
        >
          {guarantees.map((g) => (
            <div key={g} className="flex items-center gap-2 text-sm text-muted-foreground font-body normal-case">
              <Check className="w-4 h-4 text-primary" />
              {g}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSectionUSD;
