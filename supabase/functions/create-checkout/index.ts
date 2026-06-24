import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Price ID mapping
const PRICE_MAP: Record<string, string> = {
  // Base
  "base-dieta-mensal": "price_1TLXIwD7JC4bhIaaGd8KWDwU",
  "base-treino-mensal": "price_1TLXK8D7JC4bhIaaIm3VwLmi",
  "base-dieta+treino-mensal": "price_1TEaQYD7JC4bhIaaCaYtk0GJ",
  // Transformação
  "transformação-mensal": "price_1TEaQYD7JC4bhIaaWiYhiSXs",
  "transformação-trimestral": "price_1TEaQYD7JC4bhIaaDY6ZYWJM",
  "transformação-semestral": "price_1TEaQWD7JC4bhIaa4kdp2Y5J",
  // Elite
  "elite-mensal": "price_1TEaQYD7JC4bhIaaMHDW0e3f",
  "elite-trimestral": "price_1TEaQWD7JC4bhIaakd5j4CkL",
  "elite-semestral": "price_1TEaQXD7JC4bhIaa3PrSd7l8",
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

    // Identify the authenticated user (required for renewals — used by activate-plan)
    let userId: string | null = null;
    let userEmail: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data?.user) {
          userId = data.user.id;
          userEmail = data.user.email ?? null;
        }
      } catch (_) {
        // ignore — guest checkout for first purchase
      }
    }

    if (renewal && !userId) {
      return new Response(
        JSON.stringify({ error: "Authentication required for renewal" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const successParams = new URLSearchParams({ plan: planType, period });
    if (modality) successParams.set("modality", modality);
    if (renewal) successParams.set("renewal", "true");
    // Stripe replaces this placeholder with the actual session id on redirect
    successParams.set("session_id", "{CHECKOUT_SESSION_ID}");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_MAP[priceKey], quantity: 1 }],
      mode: "payment",
      customer_email: userEmail ?? undefined,
      success_url: `${req.headers.get("origin")}/pagamento-sucesso?${successParams.toString()}`,
      cancel_url: `${req.headers.get("origin")}/#planos`,
      metadata: {
        plan: planType,
        period,
        modality,
        renewal: renewal ? "true" : "false",
        user_id: userId ?? "",
        price_key: priceKey,
      },
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
