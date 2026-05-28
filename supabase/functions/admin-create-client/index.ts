import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { email, password, full_name, plan, period, form_data, provision_token } = body;

    if (provision_token !== Deno.env.get("ADMIN_PROVISION_TOKEN")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create auth user
    const { data: userData, error: userErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (userErr) throw userErr;
    const userId = userData.user!.id;

    // Compute plan expiry
    const periodMonths: Record<string, number> = { mensal: 1, trimestral: 3, semestral: 6 };
    const months = periodMonths[period?.toLowerCase()] ?? 1;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + months);

    // Wait briefly for handle_new_user trigger then update profile
    await new Promise((r) => setTimeout(r, 500));
    const { error: profErr } = await admin
      .from("profiles")
      .update({
        full_name,
        plan,
        plan_duration: period?.toLowerCase(),
        plan_activated_at: now.toISOString(),
        plan_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", userId);
    if (profErr) throw profErr;

    // Insert form submission
    if (form_data) {
      const { error: fErr } = await admin.from("form_submissions").insert({
        user_id: userId,
        plan,
        form_data,
      });
      if (fErr) throw fErr;
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
