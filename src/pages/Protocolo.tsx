import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logoGS from "@/assets/logo-gs.png";

const tipoProtocoloLabels: Record<string, string> = {
  bulking: "Bulking",
  cutting: "Cutting",
  recomp: "Recomposição Corporal",
};

const Protocolo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [protocolo, setProtocolo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("Cliente");
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  useEffect(() => {
    const fetchProtocolo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const [{ data, error }, { data: profile }] = await Promise.all([
        supabase.from("protocolos").select("*").eq("id", id!).single(),
        supabase.from("profiles").select("full_name").eq("id", session.user.id).single(),
      ]);

      if (error || !data) {
        navigate("/area-do-cliente");
        return;
      }

      setClientName(profile?.full_name || session.user.email || "Cliente");
      setProtocolo(data);
      setLoading(false);
    };

    fetchProtocolo();
  }, [id, navigate]);

  const handleDownloadPdf = async () => {
    if (!protocolo) return;
    const filename = `protocolo-${protocolo.nome || "personalizado"}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
    toast.info("Gerando PDF...");
    const ok = await generateProtocolPdf("protocolo-content", filename);
    if (!ok) toast.error("Não foi possível gerar o PDF.");
    else toast.success("PDF gerado com sucesso!");
  };

  useEffect(() => {
    if (loading || !protocolo || autoDownloaded) return;
    if (searchParams.get("download") !== "1") return;

    const timer = setTimeout(async () => {
      setAutoDownloaded(true);
      const filename = `protocolo-${protocolo.nome || "personalizado"}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
      const ok = await generateProtocolPdf("protocolo-content", filename);
      if (!ok) {
        toast.error("Não foi possível gerar o PDF.");
        return;
      }
      toast.success("PDF gerado com sucesso!");
    }, 1500);

    return () => clearTimeout(timer);
  }, [loading, protocolo, autoDownloaded, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const formattedDate = new Date(protocolo.updated_at || protocolo.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation header - hidden in PDF */}
      <header className="border-b border-border bg-card print:hidden">
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

      {/* PDF Content */}
      <div id="protocolo-content" className="pdf-protocol-wrapper">
        {/* PDF Cover Header */}
        <div className="pdf-cover-header">
          <div className="pdf-cover-logo-row">
            <img src={logoGS} alt="GS" className="pdf-cover-logo" />
            <div className="pdf-cover-brand">
              <span className="pdf-brand-name">GUILHERME SANT'ANNA</span>
              <span className="pdf-brand-sub">CONSULTORIA ESPORTIVA</span>
            </div>
          </div>
          <div className="pdf-cover-divider" />
          <div className="pdf-cover-info">
            <div className="pdf-cover-info-left">
              <span className="pdf-cover-label">PROTOCOLO</span>
              <span className="pdf-cover-title">{protocolo.nome}</span>
            </div>
            <div className="pdf-cover-info-right">
              <div className="pdf-cover-meta">
                <span className="pdf-cover-label">CLIENTE</span>
                <span className="pdf-cover-value">{clientName}</span>
              </div>
              <div className="pdf-cover-meta">
                <span className="pdf-cover-label">TIPO</span>
                <span className="pdf-cover-value">{tipoProtocoloLabels[protocolo.tipo_protocolo] || protocolo.tipo_protocolo}</span>
              </div>
              <div className="pdf-cover-meta">
                <span className="pdf-cover-label">DATA</span>
                <span className="pdf-cover-value">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Sections */}
        {protocolo.plano_alimentar && (
          <div className="pdf-section">
            <div className="pdf-section-header">
              <span className="pdf-section-icon">🍽</span>
              <h3 className="pdf-section-title">Plano Alimentar</h3>
            </div>
            <div className="pdf-section-body">
              {protocolo.plano_alimentar}
            </div>
          </div>
        )}

        {protocolo.treino && (
          <div className="pdf-section">
            <div className="pdf-section-header">
              <span className="pdf-section-icon">🏋️</span>
              <h3 className="pdf-section-title">Treino</h3>
            </div>
            <div className="pdf-section-body">
              {protocolo.treino}
            </div>
          </div>
        )}

        {protocolo.observacoes && (
          <div className="pdf-section">
            <div className="pdf-section-header">
              <span className="pdf-section-icon">📋</span>
              <h3 className="pdf-section-title">Observações</h3>
            </div>
            <div className="pdf-section-body">
              {protocolo.observacoes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pdf-footer">
          <div className="pdf-footer-divider" />
          <p className="pdf-footer-text">
            Protocolo exclusivo — Guilherme Sant'Anna Consultoria Esportiva
          </p>
          <p className="pdf-footer-text pdf-footer-disclaimer">
            Este documento é pessoal e intransferível. Proibida a reprodução sem autorização.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Protocolo;
