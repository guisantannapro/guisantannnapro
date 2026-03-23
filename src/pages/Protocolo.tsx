import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const tipoProtocoloLabels: Record<string, string> = {
  bulking: "Bulking",
  cutting: "Cutting",
  recomp: "Recomposição Corporal",
};

const Protocolo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [protocolo, setProtocolo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProtocolo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("protocolos")
        .select("*")
        .eq("id", id!)
        .single();

      if (error || !data) {
        navigate("/area-do-cliente");
        return;
      }

      setProtocolo(data);
      setLoading(false);
    };

    fetchProtocolo();
  }, [id, navigate]);

  const handleDownloadPdf = async () => {
    if (!protocolo) return;
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", session?.user?.id || "").single();
    const clientName = profile?.full_name || session?.user?.email || "Cliente";
    const ok = generateProtocolPdf(protocolo, clientName);
    if (!ok) {
      toast.error("Não foi possível gerar o PDF.");
      return;
    }

    if (window.self !== window.top) {
      toast.info("Se o download não iniciar aqui, use o botão de download na aba do PDF que abriu.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/area-do-cliente")}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              Voltar
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold uppercase text-gradient-gold">
              Meu Protocolo
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
          >
            <Download size={14} />
            Baixar PDF
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
              {tipoProtocoloLabels[protocolo.tipo_protocolo] || protocolo.tipo_protocolo}
            </Badge>
            <span className="text-sm font-medium text-foreground">{protocolo.nome}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Atualizado em: {new Date(protocolo.updated_at || protocolo.created_at).toLocaleDateString("pt-BR")}
          </span>
        </motion.div>

        {protocolo.plano_alimentar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="bg-secondary px-4 py-2.5 border-b border-border">
              <h3 className="text-sm font-semibold uppercase text-primary tracking-wide">Plano Alimentar</h3>
            </div>
            <div className="p-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {protocolo.plano_alimentar}
            </div>
          </motion.div>
        )}

        {protocolo.treino && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="bg-secondary px-4 py-2.5 border-b border-border">
              <h3 className="text-sm font-semibold uppercase text-primary tracking-wide">Treino</h3>
            </div>
            <div className="p-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {protocolo.treino}
            </div>
          </motion.div>
        )}

        {protocolo.observacoes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="bg-secondary px-4 py-2.5 border-b border-border">
              <h3 className="text-sm font-semibold uppercase text-primary tracking-wide">Observações</h3>
            </div>
            <div className="p-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {protocolo.observacoes}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Protocolo;
