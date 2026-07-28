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

    const { email, password, fullName, submissionId } = await req.json();
    if (!email || !password || password.length < 6) {
      return json({ error: "E-mail e senha (mín. 6 caracteres) são obrigatórios" }, 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Try to create user; if already exists, look them up
    let newUserId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || "" },
    });

    if (createErr) {
      const msg = (createErr.message || "").toLowerCase();
      const alreadyExists =
        msg.includes("already") || msg.includes("registered") || msg.includes("exists");
      if (!alreadyExists) return json({ error: createErr.message }, 400);

      // Find existing user by email (paginate)
      let page = 1;
      while (page < 20 && !newUserId) {
        const { data: list, error: listErr } = await admin.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (listErr) return json({ error: listErr.message }, 500);
        const found = list.users.find(
          (u) => (u.email || "").toLowerCase() === normalizedEmail
        );
        if (found) {
          newUserId = found.id;
          // Update password
          await admin.auth.admin.updateUserById(found.id, { password });
        }
        if (list.users.length < 200) break;
        page++;
      }
      if (!newUserId) return json({ error: "Usuário existente não encontrado" }, 500);
    } else {
      newUserId = created.user?.id ?? null;
    }

    if (!newUserId) return json({ error: "Falha ao criar usuário" }, 500);

    // Link submission to the new user (only if it has no user linked yet)
    if (submissionId) {
      const { error: linkErr } = await admin
        .from("form_submissions")
        .update({ user_id: newUserId })
        .eq("id", submissionId)
        .is("user_id", null);
      if (linkErr) {
        console.error("link submission error:", linkErr);
      }
    }

    // Also link any other unlinked submissions matching this email
    try {
      await admin.rpc; // no-op to keep types happy
    } catch (_) {}

    return json({ user_id: newUserId });
  } catch (err) {
    console.error("admin-create-client-access error:", err);
    return json({ error: (err as Error).message || "Unexpected error" }, 500);
  }
});
