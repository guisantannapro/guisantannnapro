import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Ban duration: ~100 years (effectively permanent until re-enabled)
const BAN_DURATION = "876000h";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const anon = createClient(SUPABASE_URL, ANON_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await anon.auth.getUser(token);
    if (authErr || !user) return json({ error: "Invalid session" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleErr) return json({ error: roleErr.message }, 500);
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const { email, user_id, enable } = await req.json();
    if (!email && !user_id) {
      return json({ error: "Informe email ou user_id" }, 400);
    }

    let targetId: string | null = user_id ?? null;

    // Look up by email if needed (paginate)
    if (!targetId && email) {
      const normalized = String(email).trim().toLowerCase();
      let page = 1;
      while (page < 20 && !targetId) {
        const { data: list, error: listErr } = await admin.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (listErr) return json({ error: listErr.message }, 500);
        const found = list.users.find(
          (u) => (u.email || "").toLowerCase() === normalized
        );
        if (found) targetId = found.id;
        if (list.users.length < 200) break;
        page++;
      }
      if (!targetId) return json({ error: "Usuário não encontrado" }, 404);
    }

    if (!targetId) return json({ error: "Usuário não encontrado" }, 404);

    if (enable) {
      // Re-enable: unban
      const { error } = await admin.auth.admin.updateUserById(targetId, {
        ban_duration: "none",
      });
      if (error) return json({ error: error.message }, 500);
      return json({ user_id: targetId, status: "enabled" });
    }

    // Disable: ban the user
    const { error } = await admin.auth.admin.updateUserById(targetId, {
      ban_duration: BAN_DURATION,
    });
    if (error) return json({ error: error.message }, 500);

    return json({ user_id: targetId, status: "disabled" });
  } catch (err) {
    console.error("admin-toggle-client-access error:", err);
    return json({ error: (err as Error).message || "Unexpected error" }, 500);
  }
});
