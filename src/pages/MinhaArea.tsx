import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LogOut, Download, Calendar, User, FileText, Camera, AlertTriangle, ClipboardList, Eye, History, RefreshCw, Scale, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import EvolutionSection from "@/components/minha-area/EvolutionSection";
import RenewalModal from "@/components/minha-area/RenewalModal";
import CheckinForm from "@/components/minha-area/CheckinForm";
import CheckinHistory from "@/components/minha-area/CheckinHistory";
import MinhaAreaSkeleton from "@/components/skeletons/MinhaAreaSkeleton";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import InteractiveTrainingTable from "@/components/protocol/InteractiveTrainingTable";

const resolveCurrentProtocol = <T extends { id: string }>(protocols: T[], structuredProtocolIds: Set<string>) => {
  const current = protocols.find((protocol) => structuredProtocolIds.has(protocol.id)) ?? protocols[0] ?? null;

  return {
    protocoloAtual: current,
    protocolosHistorico: current ? protocols.filter((protocol) => protocol.id !== current.id) : [],
  };
};

const planLabels: Record<string, string> = {
  base: "Base",
  transformacao: "Transformação",
  elite: "Elite",
};

const tipoProtocoloLabels: Record<string, string> = {
  bulking: "Bulking",
  cutting: "Cutting",
  recomp: "Recomposição Corporal",
};

const MinhaArea = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [protocoloAtual, setProtocoloAtual] = useState<any>(null);
  const [protocolosHistorico, setProtocolosHistorico] = useState<any[]>([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [checkins, setCheckins] = useState<any[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const applySession = (nextSession: Session | null) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setSubmissions([]);
        setProtocols([]);
        setProtocoloAtual(null);
        setProtocolosHistorico([]);
      }
      setAuthReady(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!session?.user) {
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }
    fetchData(session.user.id);
  }, [authReady, session?.user?.id, navigate]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      const [profileRes, submissionsRes, protocolsRes, protocoloRes, checkinsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("form_submissions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_protocols").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("protocolos").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_checkins" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (submissionsRes.data) setSubmissions(submissionsRes.data);
      if (protocolsRes.data) setProtocols(protocolsRes.data);
      if (protocoloRes.data && protocoloRes.data.length > 0) {
        const protocolIds = protocoloRes.data.map((protocol) => protocol.id);
        const { data: exerciseProtocols } = await supabase
          .from("protocol_exercises")
          .select("protocolo_id")
          .in("protocolo_id", protocolIds);

        const structuredProtocolIds = new Set((exerciseProtocols || []).map((exercise) => exercise.protocolo_id));
        const { protocoloAtual, protocolosHistorico } = resolveCurrentProtocol(protocoloRes.data, structuredProtocolIds);

        setProtocoloAtual(protocoloAtual);
        setProtocolosHistorico(protocolosHistorico);
      }
      if (checkinsRes.data) setCheckins(checkinsRes.data as any[]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (proto: any) => {
    if (isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      toast.info("Gerando PDF...");
      const filename = `protocolo-${proto.nome || "personalizado"}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
      const ok = await generateProtocolPdf("protocolo-content-inline", filename);
      if (!ok) toast.error("Não foi possível gerar o PDF.");
      else toast.success("Download iniciado!");
    } catch (error) {
      toast.error("Erro ao gerar o PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const latestSubmissionWithPlan = submissions.find((sub) => typeof sub?.plan === "string" && sub.plan.trim() !== "");
  const resolvedPlan = profile?.plan || latestSubmissionWithPlan?.plan || null;
  const estimatedExpiry = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null;

  const [renewModalOpen, setRenewModalOpen] = useState(false);

  if (loading) return <MinhaAreaSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <PwaInstallBanner />
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase text-gradient-gold">Área do Cliente</h1>
            <p className="text-muted-foreground text-sm mt-1">Olá, {profile?.full_name || session?.user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }} className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5">
            <LogOut size={14} /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold uppercase text-foreground">Meu Plano</h2>
          </div>
          {resolvedPlan ? (
            <div className="space-y-4">
              <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">{planLabels[resolvedPlan] || resolvedPlan}</Badge>
              {estimatedExpiry && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>Vence em {estimatedExpiry.toLocaleDateString("pt-BR")}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum plano ativo.</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold uppercase text-foreground">Meu Protocolo</h2>
          </div>
          {protocoloAtual ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">{tipoProtocoloLabels[protocoloAtual.tipo_protocolo] || protocoloAtual.tipo_protocolo}</Badge>
                <span className="text-sm font-medium text-foreground">{protocoloAtual.nome}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate(`/protocolo/${protocoloAtual.id}`)} className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5">
                  <FileText size={14} /> Abrir protocolo completo
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadPdf(protocoloAtual)} disabled={isDownloadingPdf} className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5">
                  {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {isDownloadingPdf ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase text-foreground">Treino - Logbook</h3>
                </div>
                <InteractiveTrainingTable protocoloId={protocoloAtual.id} userId={session?.user?.id || protocoloAtual.user_id} regrasGerais={protocoloAtual.treino} />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Protocolo ainda não disponível.</p>
          )}
        </motion.div>

        <EvolutionSection evolutions={submissions} />
      </main>
      <RenewalModal open={renewModalOpen} onOpenChange={setRenewModalOpen} plan={resolvedPlan} />
    </div>
  );
};

export default MinhaArea;
