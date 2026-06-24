import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id || typeof session_id !== "string" || !session_id.startsWith("cs_")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid session_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate caller
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Idempotency: if this session was already processed, return the previous result
    const { data: alreadyProcessed } = await supabaseAdmin
      .from("processed_stripe_sessions")
      .select("user_id, plan, period")
      .eq("session_id", session_id)
      .maybeSingle();

    if (alreadyProcessed) {
      if (alreadyProcessed.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: "Session belongs to another user" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Re-fetch profile so the client can show the expiry/renewal banner
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("plan_expires_at, renewal_starts_at")
        .eq("id", user.id)
        .single();
      return new Response(
        JSON.stringify({
          success: true,
          already_processed: true,
          renewal_starts_at: profile?.renewal_starts_at ?? null,
          expires_at: profile?.plan_expires_at ?? null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Verify payment with Stripe (source of truth)
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (err) {
      console.error("Stripe retrieve error:", err);
      return new Response(
        JSON.stringify({ error: "Stripe session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", payment_status: session.payment_status }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const meta = session.metadata ?? {};
    const metaUserId = meta.user_id as string | undefined;
    const sessionEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase();
    const userEmail = (user.email || "").toLowerCase();

    // Ownership check: metadata user_id must match OR email must match
    const userIdMatches = metaUserId && metaUserId === user.id;
    const emailMatches = sessionEmail && userEmail && sessionEmail === userEmail;
    if (!userIdMatches && !emailMatches) {
      console.error("Ownership mismatch", { metaUserId, authUserId: user.id, sessionEmail, userEmail });
      return new Response(
        JSON.stringify({ error: "Session does not belong to this user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = (meta.plan as string) || "";
    const period = ((meta.period as string) || "mensal").toLowerCase();
    if (!["base", "transformacao", "elite"].includes(plan)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan in session metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apply activation/renewal — date accumulation logic
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("plan_expires_at")
      .eq("id", user.id)
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
      .eq("id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to activate plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record session as processed (idempotency)
    await supabaseAdmin
      .from("processed_stripe_sessions")
      .insert({ session_id, user_id: user.id, plan, period });

    return new Response(
      JSON.stringify({
        success: true,
        renewal_starts_at: renewalStartsAt,
        expires_at: expiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Activate plan error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
