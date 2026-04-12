import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// USD Price ID mapping — replace placeholder values with real Stripe USD price IDs
const PRICE_MAP: Record<string, string> = {
  // Base
  "base-dieta-mensal": "price_1TLVtuD7JC4bhIaakcTKe1nx",
  "base-treino-mensal": "price_1TLVtuD7JC4bhIaakcTKe1nx",
  "base-dieta+treino-mensal": "price_1TLVxDD7JC4bhIaagYUn9QD1",
  // Transformação
  "transformação-mensal": "price_1TLVzYD7JC4bhIaa1gTCNtid",
  "transformação-trimestral": "price_1TLW1zD7JC4bhIaaPgzIWZzd",
  "transformação-semestral": "price_1TLW1zD7JC4bhIaaPgzIWZzd",
  // Elite
  "elite-mensal": "price_1TLW4BD7JC4bhIaatJeVB0CE",
  "elite-trimestral": "price_1TLW5CD7JC4bhIaaLfxYkawm",
  "elite-semestral": "price_1TLW6AD7JC4bhIaa02GdRXj4",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceKey, renewal } = await req.json();

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
    if (renewal) successParams.set("renewal", "true");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_MAP[priceKey], quantity: 1 }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/pagamento-sucesso?${successParams.toString()}`,
      cancel_url: `${req.headers.get("origin")}/checkout-usd#planos`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("USD Checkout error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
