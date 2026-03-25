import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LogOut, Download, Calendar, User, FileText, Camera, AlertTriangle, ClipboardList, Eye, EyeOff, History, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import { ProtocolPdfContent } from "@/components/protocol/ProtocolPdfContent";
import EvolutionSection from "@/components/minha-area/EvolutionSection";

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
  const [pdfProtocol, setPdfProtocol] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<any[]>([]);
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
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
      const [profileRes, submissionsRes, protocolsRes, protocoloRes, evolutionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("form_submissions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_protocols").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("protocolos").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_evolutions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (submissionsRes.data) setSubmissions(submissionsRes.data);
      if (protocolsRes.data) setProtocols(protocolsRes.data);
      if (protocoloRes.data && protocoloRes.data.length > 0) {
        setProtocoloAtual(protocoloRes.data[0]);
        setProtocolosHistorico(protocoloRes.data.slice(1));
      } else {
        setProtocoloAtual(null);
        setProtocolosHistorico([]);
      }
      if (evolutionsRes.data) setEvolutions(evolutionsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadProtocol = async (protocol: any) => {
    try {
      const { data, error } = await supabase.storage.from("client-protocols").download(protocol.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = protocol.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Erro ao baixar o arquivo.");
    }
  };

  const handleDownloadPdf = async (proto: any) => {
    if (isDownloadingPdf) return;

    try {
      setPdfProtocol(proto);
      setIsDownloadingPdf(true);
      toast.info("Gerando PDF...");

      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const filename = `protocolo-${proto.nome || "personalizado"}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
      const ok = await generateProtocolPdf("protocolo-content-inline", filename);

      if (!ok) {
        toast.error("Não foi possível gerar o PDF.");
        return;
      }

      toast.success("Download iniciado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o PDF.");
    } finally {
      setIsDownloadingPdf(false);
      setPdfProtocol(null);
    }
  };

  const getPhotoSignedUrl = async (path: string) => {
    const { data } = await supabase.storage.from("client-photos").createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  };

  const getDaysRemaining = () => {
    if (!profile?.plan_expires_at) return null;
    const now = new Date();
    const expires = new Date(profile.plan_expires_at);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Resolve o plano: prioriza profiles, fallback para form_submissions
  const resolvedPlan = profile?.plan || submissions?.[0]?.plan || null;

  // Resolve período: prioriza profiles, fallback para form_data.billingPeriod
  const submissionPeriod = submissions?.[0]?.form_data?.billingPeriod || null;
  const resolvedPeriod = profile?.plan_duration || submissionPeriod || null;

  const periodLabels: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    semiannual: "Semestral",
    mensal: "Mensal",
    trimestral: "Trimestral",
    semestral: "Semestral",
  };

  // Calcula data de vencimento estimada se não houver no profiles
  const getEstimatedExpiry = () => {
    if (profile?.plan_expires_at) return new Date(profile.plan_expires_at);
    const baseDate = submissions?.[0]?.created_at ? new Date(submissions[0].created_at) : null;
    if (!baseDate || !resolvedPeriod) return null;
    const period = resolvedPeriod.toLowerCase();
    const months = period === "monthly" || period === "mensal" ? 1
      : period === "quarterly" || period === "trimestral" ? 3
      : period === "semiannual" || period === "semestral" ? 6
      : null;
    if (!months) return null;
    const expiry = new Date(baseDate);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry;
  };

  const estimatedExpiry = getEstimatedExpiry();

  const getDaysRemainingResolved = () => {
    const expiryDate = estimatedExpiry;
    if (!expiryDate) return null;
    const now = new Date();
    return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemainingResolved();
  // TODO: TEMPORÁRIO - forçar banner de renovação para visualização. Remover depois!
  const isExpired = true; // daysRemaining !== null && daysRemaining <= 0;
  const isExpiringSoon = false; // daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  const [renewLoading, setRenewLoading] = useState(false);

  const buildPriceKey = () => {
    const plan = resolvedPlan;
    const period = (resolvedPeriod || "mensal").toLowerCase();
    const normalizedPeriod = period === "monthly" ? "mensal" : period === "quarterly" ? "trimestral" : period === "semiannual" ? "semestral" : period;

    if (plan === "base") {
      const modality = submissions?.[0]?.form_data?.billingModality || "dieta";
      const mod = modality === "ambos" ? "dieta+treino" : modality;
      return `base-${mod}-${normalizedPeriod}`;
    }
    const planName = plan === "transformacao" ? "transformação" : plan;
    return `${planName}-${normalizedPeriod}`;
  };

  const handleRenewPlan = async () => {
    setRenewLoading(true);
    try {
      const priceKey = buildPriceKey();
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Erro ao gerar link de pagamento.");
      }
    } catch (err) {
      console.error("Renewal error:", err);
      toast.error("Erro ao iniciar renovação.");
    } finally {
      setRenewLoading(false);
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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase text-gradient-gold">Área do Cliente</h1>
            <p className="text-muted-foreground text-sm mt-1">Olá, {profile?.full_name || session?.user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login");
            }}
            className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <LogOut size={14} />
            Sair
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
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">{planLabels[resolvedPlan] || resolvedPlan}</Badge>
                {resolvedPeriod && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {periodLabels[resolvedPeriod.toLowerCase()] || resolvedPeriod}
                  </Badge>
                )}
              </div>

              {estimatedExpiry && (
                <div className={`flex items-center gap-2 text-sm ${isExpired ? "text-destructive" : isExpiringSoon ? "text-yellow-500" : "text-muted-foreground"}`}>
                  {(isExpired || isExpiringSoon) && <AlertTriangle size={16} />}
                  <Calendar size={16} />
                  {isExpired ? (
                    <span>Seu plano expirou em {estimatedExpiry.toLocaleDateString("pt-BR")}.</span>
                  ) : (
                    <span>
                      {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"} — vence em{" "}
                      {estimatedExpiry.toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              )}

              {(isExpired || isExpiringSoon) && (
                <div className={`rounded-lg p-4 border ${isExpired ? "bg-destructive/5 border-destructive/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
                  <p className={`text-sm font-medium mb-3 ${isExpired ? "text-destructive" : "text-yellow-500"}`}>
                    {isExpired
                      ? "Seu plano expirou. Renove para continuar com o acompanhamento."
                      : "Seu plano está prestes a vencer. Renove agora para não perder o acesso."}
                  </p>
                  <Button
                    onClick={handleRenewPlan}
                    disabled={renewLoading}
                    size="sm"
                    className="gap-1.5"
                  >
                    {renewLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {renewLoading ? "Processando..." : "Renovar Plano"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum plano ativo no momento.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold uppercase text-foreground">Meu Protocolo</h2>
          </div>

          {protocoloAtual ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                    {tipoProtocoloLabels[protocoloAtual.tipo_protocolo] || protocoloAtual.tipo_protocolo}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{protocoloAtual.nome}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Atualizado em: {new Date(protocoloAtual.updated_at || protocoloAtual.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/protocolo/${protocoloAtual.id}`)}
                  className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                >
                  <FileText size={14} />
                  Abrir protocolo completo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(protocoloAtual)}
                  disabled={isDownloadingPdf}
                  className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 disabled:opacity-80"
                >
                  {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {isDownloadingPdf ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Seu protocolo ainda não foi disponibilizado.</p>
          )}
        </motion.div>

        {protocolosHistorico.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold uppercase text-foreground">Histórico de Protocolos</h2>
            </div>

            <div className="space-y-3">
              {protocolosHistorico.map((proto) => (
                <div
                  key={proto.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 w-fit">
                      {tipoProtocoloLabels[proto.tipo_protocolo] || proto.tipo_protocolo}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{proto.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(proto.updated_at || proto.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/protocolo/${proto.id}`)}
                    className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                  >
                    <Eye size={14} />
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {protocols.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold uppercase text-foreground">Arquivos Enviados</h2>
            </div>

            <div className="space-y-3">
              {protocols.map((protocol) => (
                <div
                  key={protocol.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">{protocol.file_name}</p>
                    <p className="text-muted-foreground text-xs">Enviado em {new Date(protocol.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadProtocol(protocol)}
                    className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                  >
                    <Download size={14} />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <PhotosSection submissions={submissions} getPhotoSignedUrl={getPhotoSignedUrl} />

        <EvolutionSection evolutions={evolutions} />
      </main>

      {pdfProtocol && (
        <div className="fixed -left-[200vw] top-0 opacity-0 pointer-events-none" aria-hidden="true">
          <ProtocolPdfContent
            wrapperId="protocolo-content-inline"
            protocolo={pdfProtocol}
            clientName={profile?.full_name || session?.user?.email || "Cliente"}
            formattedDate={new Date(pdfProtocol.updated_at || pdfProtocol.created_at).toLocaleDateString("pt-BR")}
          />
        </div>
      )}
    </div>
  );
};

const PhotosSection = ({
  submissions,
  getPhotoSignedUrl,
}: {
  submissions: any[];
  getPhotoSignedUrl: (path: string) => Promise<string | null>;
}) => {
  const [showPhotos, setShowPhotos] = useState(false);

  const photoFields = ["photo_front", "photo_side", "photo_back", "photo_assessment"];
  const submissionsWithPhotos = submissions.filter((sub) => photoFields.some((f) => sub[f]));
  const totalPhotos = submissionsWithPhotos.reduce(
    (acc, sub) => acc + photoFields.filter((f) => sub[f]).length,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-lg p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <Camera className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold uppercase text-foreground">Minhas Fotos</h2>
      </div>

      {submissionsWithPhotos.length > 0 ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPhotos(!showPhotos)}
            className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 mb-4"
          >
            {showPhotos ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPhotos ? "Ocultar fotos" : "Ver fotos"}
          </Button>
          <p className="text-muted-foreground text-xs mb-4">
            {totalPhotos} {totalPhotos === 1 ? "foto disponível" : "fotos disponíveis"}.
          </p>
          {showPhotos && (
            <div className="space-y-6">
              {submissionsWithPhotos.map((sub) => (
                <SubmissionPhotos key={sub.id} submission={sub} getPhotoSignedUrl={getPhotoSignedUrl} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-sm">Nenhuma foto enviada ainda.</p>
      )}
    </motion.div>
  );
};

const SubmissionPhotos = ({
  submission,
  getPhotoSignedUrl,
}: {
  submission: any;
  getPhotoSignedUrl: (path: string) => Promise<string | null>;
}) => {
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const photoFields = [
    { key: "photo_front", label: "Frente" },
    { key: "photo_side", label: "Lado" },
    { key: "photo_back", label: "Costas" },
    { key: "photo_assessment", label: "Avaliação" },
  ];

  const hasPhotos = photoFields.some((f) => submission[f.key]);

  useEffect(() => {
    const loadUrls = async () => {
      const result: Record<string, string | null> = {};
      for (const field of photoFields) {
        if (submission[field.key]) {
          result[field.key] = await getPhotoSignedUrl(submission[field.key]);
        }
      }
      setUrls(result);
    };
    if (hasPhotos) loadUrls();
  }, [submission]);

  if (!hasPhotos) return null;

  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <p className="text-xs text-muted-foreground mb-3">Enviadas em {new Date(submission.created_at).toLocaleDateString("pt-BR")}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photoFields.map((field) =>
          submission[field.key] ? (
            <div key={field.key} className="space-y-1">
              <span className="text-xs text-muted-foreground">{field.label}</span>
              {urls[field.key] ? (
                <a href={urls[field.key]!} target="_blank" rel="noopener noreferrer">
                  <img
                    src={urls[field.key]!}
                    alt={field.label}
                    className="w-full aspect-[3/4] object-cover rounded-md border border-border hover:border-primary/50 transition-colors"
                  />
                </a>
              ) : (
                <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted animate-pulse" />
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default MinhaArea;
