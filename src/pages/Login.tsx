import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import PwaInstallModal, { usePwaInstall } from "@/components/PwaInstallModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const navigate = useNavigate();
  const { shouldShow, isIos, deferredPrompt, triggerInstall } = usePwaInstall();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Credenciais inválidas. Tente novamente.");
      setLoading(false);
      return;
    }

    // Check if user is admin to decide where to redirect
    const userId = authData.user?.id;
    let redirectTo = "/area-do-cliente";
    if (userId) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (isAdmin) {
        redirectTo = "/dashboard";
      }
    }

    // Show PWA install modal after login (temporarily forced for all users)
    if (shouldShow) {
      setPendingRedirect(redirectTo);
      setShowPwaModal(true);
      setLoading(false);
    } else {
      navigate(redirectTo);
    }
  };

  const handlePwaModalClose = (open: boolean) => {
    setShowPwaModal(open);
    if (!open && pendingRedirect) {
      navigate(pendingRedirect);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold uppercase text-gradient-gold">Área Restrita</h1>
          <p className="text-muted-foreground text-sm">Faça login para acessar o dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Entrar
          </Button>
        </form>
      </div>

      <PwaInstallModal
        open={showPwaModal}
        onOpenChange={handlePwaModalClose}
        isIos={isIos}
        onInstall={triggerInstall}
        hasNativePrompt={!!deferredPrompt}
      />
    </div>
  );
};

export default Login;
