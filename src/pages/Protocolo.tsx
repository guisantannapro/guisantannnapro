import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProtocolPdfContent } from "@/components/protocol/ProtocolPdfContent";

const Protocolo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [protocolo, setProtocolo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("Cliente");
  const [clientInfo, setClientInfo] = useState<{ idade?: string; peso?: string; altura?: string }>({});
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  useEffect(() => {
    const fetchProtocolo = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.from("protocolos").select("*").eq("id", id!).single();

      if (error || !data) {
        navigate("/area-do-cliente");
        return;
      }

      const protocolUserId = data.user_id;

      const [{ data: profile }, { data: formSub }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", protocolUserId).single(),
        supabase.from("form_submissions").select("form_data").eq("user_id", protocolUserId).order("created_at", { ascending: false }).limit(1).single(),
      ]);

      setClientName(profile?.full_name || session.user.email || "Cliente");
      
      const fd = formSub?.form_data as any;
      if (fd) {
        setClientInfo({
          idade: fd.age || undefined,
          peso: fd.weight || undefined,
          altura: fd.height || undefined,
        });
      }
      
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
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/area-do-cliente")} className="gap-1.5">
              <ArrowLeft size={14} />
              Voltar
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold uppercase text-gradient-gold">Meu Protocolo</h1>
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

      <ProtocolPdfContent protocolo={protocolo} clientName={clientName} formattedDate={formattedDate} clientInfo={clientInfo} />
    </div>
  );
};

export default Protocolo;
