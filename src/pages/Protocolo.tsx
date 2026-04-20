import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProtocolPdfContent } from "@/components/protocol/ProtocolPdfContent";
import ProtocoloSkeleton from "@/components/skeletons/ProtocoloSkeleton";
import InteractiveTrainingTable from "@/components/protocol/InteractiveTrainingTable";

const Protocolo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [protocolo, setProtocolo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("Cliente");
  const [clientInfo, setClientInfo] = useState<{ idade?: string; peso?: string; altura?: string }>({});
  const [planInfo, setPlanInfo] = useState<{ plan?: string; duration?: string }>({});
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
        toast.error("Protocolo não encontrado ou você não tem permissão para acessá-lo.");
        navigate("/area-do-cliente");
        return;
      }

      const protocolUserId = data.user_id;

      const [{ data: profile }, { data: formSubs }] = await Promise.all([
        supabase.from("profiles").select("full_name, plan, plan_duration").eq("id", protocolUserId).single(),
        supabase
          .from("form_submissions")
          .select("form_data, plan")
          .eq("user_id", protocolUserId)
          .order("created_at", { ascending: false }),
      ]);

      const latestSubmissionWithPlan = (formSubs || []).find(
        (sub) => typeof sub?.plan === "string" && sub.plan.trim() !== ""
      );
      const latestSubmissionWithPeriod = (formSubs || []).find((sub) => {
        const period = (sub?.form_data as any)?.billingPeriod;
        return typeof period === "string" && period.trim() !== "";
      });

      const resolvedPlan =
        profile?.plan ||
        latestSubmissionWithPlan?.plan ||
        localStorage.getItem("purchased_plan") ||
        undefined;
      const resolvedDuration =
        profile?.plan_duration ||
        (latestSubmissionWithPeriod?.form_data as any)?.billingPeriod ||
        localStorage.getItem("purchased_period") ||
        undefined;

      setClientName(profile?.full_name || session.user.email || "Cliente");
      setPlanInfo({ plan: resolvedPlan, duration: resolvedDuration });

      const latestSubmissionWithBodyInfo = (formSubs || []).find((sub) => {
        const data = sub?.form_data as any;
        return Boolean(data?.age || data?.weight || data?.height);
      });
      const fd = latestSubmissionWithBodyInfo?.form_data as any;
      const idade = fd?.age || undefined;
      const peso = fd?.weight || undefined;
      const altura = fd?.height || undefined;

      if (fd) {
        setClientInfo({ idade, peso, altura });
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
    return <ProtocoloSkeleton />;
  }

  const formattedDate = new Date(protocolo.updated_at || protocolo.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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

      <ProtocolPdfContent protocolo={protocolo} clientName={clientName} formattedDate={formattedDate} clientInfo={clientInfo} planInfo={planInfo} />

      {/* Interactive Training Table — wrapper mais largo no desktop pra caber as colunas */}
      <div className="w-full max-w-[700px] md:max-w-[1100px] mx-auto px-4 pb-8">
        <InteractiveTrainingTable protocoloId={id!} userId={protocolo.user_id} regrasGerais={protocolo.treino} />
      </div>

      {/* Footer */}
      <div className="w-full max-w-[700px] mx-auto px-4 pb-8">
        <div className="pdf-footer" data-pdf-section>
          <div className="pdf-footer-divider" />
          <p className="pdf-footer-text">Protocolo exclusivo — Guilherme Sant'Anna Consultoria Esportiva</p>
          <p className="pdf-footer-text pdf-footer-disclaimer">
            Este documento é pessoal e intransferível. Proibida a reprodução sem autorização.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Protocolo;
