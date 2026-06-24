import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// Webhook recebe POST do Stripe — sem CORS de browser, sem auth JWT.
// A assinatura do header `stripe-signature` é o que autentica a chamada.
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!signature || !webhookSecret || !stripeKey) {
    console.error("Missing signature or secrets");
    return new Response("Configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  // Só nos interessa o evento de checkout concluído e pago
  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    console.log("Session not paid, skipping:", session.id, session.payment_status);
    return new Response(JSON.stringify({ received: true, skipped: "not_paid" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const meta = session.metadata ?? {};
  const userId = meta.user_id as string | undefined;
  const plan = (meta.plan as string) || "";
  const period = ((meta.period as string) || "mensal").toLowerCase();

  if (!userId || !["base", "transformacao", "elite"].includes(plan)) {
    console.error("Webhook missing/invalid metadata:", { userId, plan, period, sessionId: session.id });
    // Retornamos 200 mesmo assim para o Stripe não ficar reenviando — não há nada a fazer.
    return new Response(JSON.stringify({ received: true, skipped: "invalid_metadata" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Idempotência: se já foi processado (pelo PaymentSuccess ou por reenvio do Stripe), não faz nada.
  const { data: alreadyProcessed } = await supabaseAdmin
    .from("processed_stripe_sessions")
    .select("session_id")
    .eq("session_id", session.id)
    .maybeSingle();

  if (alreadyProcessed) {
    return new Response(JSON.stringify({ received: true, already_processed: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  // Mesma lógica de acumulação de datas usada em activate-plan
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan_expires_at")
    .eq("id", userId)
    .single();

  const now = new Date();
  const periodMonths: Record<string, number> = { mensal: 1, trimestral: 3, semestral: 6 };
  const months = periodMonths[period] || 1;

  let startDate = now;
  let renewalStartsAt: string | null = null;
  if (profile?.plan_expires_at) {
    const currentExpiry = new Date(profile.plan_expires_at);
    if (currentExpiry > now) {
      startDate = currentExpiry;
      renewalStartsAt = currentExpiry.toISOString();
    }
  }

  const expiresAt = new Date(startDate);
  expiresAt.setMonth(expiresAt.getMonth() + months);

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      plan,
      plan_activated_at: now.toISOString(),
      plan_expires_at: expiresAt.toISOString(),
      plan_duration: period,
      renewal_starts_at: renewalStartsAt,
      updated_at: now.toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Webhook update error:", updateError);
    // Devolve 500 para o Stripe reenviar
    return new Response(JSON.stringify({ error: "db_update_failed" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  await supabaseAdmin
    .from("processed_stripe_sessions")
    .insert({ session_id: session.id, user_id: userId, plan, period });

  console.log("Plan activated via webhook:", { userId, plan, period, sessionId: session.id });

  return new Response(JSON.stringify({ received: true, activated: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
