import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ApplicationForm from "@/components/ApplicationForm";
import { Loader2 } from "lucide-react";

const Formulario = () => {
  const [loading, setLoading] = useState(true);
  const [isElite, setIsElite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();

      setIsElite(profile?.plan === "elite");
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    checkUser();
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isLoggedIn && (
        <div className="bg-muted border-b border-border py-3 text-center">
          <p className="text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/auth")}
              className="text-primary hover:underline font-semibold"
            >
              Faça login
            </button>
            {" "}para desbloquear recursos exclusivos do Plano Elite.
          </p>
        </div>
      )}
      <ApplicationForm isElite={isElite} />
      <footer className="py-8 text-center border-t border-border">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Guilherme Sant'Anna IFBBPRO — Consultoria Fitness
        </p>
      </footer>
    </div>
  );
};

export default Formulario;
