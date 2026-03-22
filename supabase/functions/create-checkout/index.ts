import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Price ID mapping
const PRICE_MAP: Record<string, string> = {
  // Base
  "base-dieta-mensal": "price_1TClTIRYQWJHE7ZJ5ec2BJgc",
  "base-treino-mensal": "price_1TClTIRYQWJHE7ZJ5ec2BJgc",
  "base-dieta+treino-mensal": "price_1TClZxRYQWJHE7ZJmv7abwpd",
  // Transformação
  "transformação-mensal": "price_1TClUhRYQWJHE7ZJqL9QVHDV",
  "transformação-trimestral": "price_1TClVZRYQWJHE7ZJxvQIDdFN",
  "transformação-semestral": "price_1TClWmRYQWJHE7ZJ8xdw6a05",
  // Elite
  "elite-mensal": "price_1TClXQRYQWJHE7ZJfRfErreJ",
  "elite-trimestral": "price_1TClYHRYQWJHE7ZJ7wwQhglH",
  "elite-semestral": "price_1TClYxRYQWJHE7ZJj9iPjQoi",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceKey } = await req.json();

    if (!priceKey || !PRICE_MAP[priceKey]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan selection" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let planType = "base";
    if (priceKey.startsWith("elite")) planType = "elite";
    else if (priceKey.startsWith("transformação")) planType = "transformacao";

    let period = "mensal";
    if (priceKey.includes("trimestral")) period = "trimestral";
    else if (priceKey.includes("semestral")) period = "semestral";

    let modality = "";
    if (planType === "base") {
      if (priceKey.includes("dieta+treino")) modality = "ambos";
      else if (priceKey.includes("dieta")) modality = "dieta";
      else if (priceKey.includes("treino")) modality = "treino";
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const successParams = new URLSearchParams({ plan: planType, period });
    if (modality) successParams.set("modality", modality);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      line_items: [{ price: PRICE_MAP[priceKey], quantity: 1 }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/pagamento-sucesso?${successParams.toString()}`,
      cancel_url: `${req.headers.get("origin")}/#planos`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Checkout error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
