import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Loader2, Calendar, User, FileText, ClipboardList, Eye, EyeOff, History, AlertTriangle, Download, TrendingUp, Scale, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import EvolutionSection from "@/components/minha-area/EvolutionSection";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import { ProtocolPdfContent } from "@/components/protocol/ProtocolPdfContent";

interface ClientViewTabProps {
  userId: string;
  clientName: string;
}

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

const periodLabels: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
};

const ClientViewTab = ({ userId, clientName }: ClientViewTabProps) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [protocoloAtual, setProtocoloAtual] = useState<any>(null);
  const [protocolosHistorico, setProtocolosHistorico] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProtocol, setPdfProtocol] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, submissionsRes, protocolsRes, protocoloRes, evolutionsRes, checkinsRes, feedbacksRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("form_submissions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_protocols").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("protocolos").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_evolutions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_checkins" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_feedbacks" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (submissionsRes.data) setSubmissions(submissionsRes.data);
      if (protocolsRes.data) setProtocols(protocolsRes.data);
      if (protocoloRes.data && protocoloRes.data.length > 0) {
        setProtocoloAtual(protocoloRes.data[0]);
        setProtocolosHistorico(protocoloRes.data.slice(1));
      }
      if (evolutionsRes.data) setEvolutions(evolutionsRes.data);
      if (checkinsRes.data) setCheckins(checkinsRes.data as any[]);
      if (feedbacksRes.data) setFeedbacks(feedbacksRes.data as any[]);
    } catch (err) {
      console.error("Error fetching client view data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPhotoSignedUrl = async (path: string): Promise<string | null> => {
    const { data } = await supabase.storage.from("client-photos").createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  };

  const loadPhotos = async () => {
    const photoFields = ["photo_front", "photo_side", "photo_back", "photo_assessment"];
    const urls: Record<string, string> = {};
    for (const sub of submissions) {
      for (const field of photoFields) {
        if (sub[field]) {
          const url = await getPhotoSignedUrl(sub[field]);
          if (url) urls[`${sub.id}-${field}`] = url;
        }
      }
    }
    setPhotoUrls(urls);
  };

  useEffect(() => {
    if (showPhotos && submissions.length > 0) {
      loadPhotos();
    }
  }, [showPhotos, submissions]);

  const resolvedPlan = profile?.plan || submissions?.[0]?.plan || null;
  const submissionPeriod = submissions?.[0]?.form_data?.billingPeriod || null;
  const resolvedPeriod = profile?.plan_duration || submissionPeriod || null;

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
  const daysRemaining = estimatedExpiry
    ? Math.ceil((estimatedExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  const photoFields = ["photo_front", "photo_side", "photo_back", "photo_assessment"];
  const photoLabels: Record<string, string> = {
    photo_front: "Frente",
    photo_side: "Lado",
    photo_back: "Costas",
    photo_assessment: "Avaliação",
  };
  const submissionsWithPhotos = submissions.filter((sub) => photoFields.some((f) => sub[f]));
  const totalPhotos = submissionsWithPhotos.reduce(
    (acc, sub) => acc + photoFields.filter((f) => sub[f]).length, 0
  );

  const handleDownloadPdf = async (proto: any) => {
    if (isDownloadingPdf) return;
    try {
      setPdfProtocol(proto);
      setIsDownloadingPdf(true);
      toast.info("Gerando PDF...");
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const filename = `protocolo-${proto.nome || "personalizado"}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
      const ok = await generateProtocolPdf("protocolo-content-client-view", filename);
      if (!ok) { toast.error("Não foi possível gerar o PDF."); return; }
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o PDF.");
    } finally {
      setIsDownloadingPdf(false);
      setPdfProtocol(null);
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Plano */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Plano</h3>
        </div>
        {resolvedPlan ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">{planLabels[resolvedPlan] || resolvedPlan}</Badge>
              {resolvedPeriod && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {periodLabels[resolvedPeriod.toLowerCase()] || resolvedPeriod}
                </Badge>
              )}
            </div>
            {estimatedExpiry && (
              <div className={`flex items-center gap-1.5 text-xs ${isExpired ? "text-destructive" : isExpiringSoon ? "text-yellow-500" : "text-muted-foreground"}`}>
                {(isExpired || isExpiringSoon) && <AlertTriangle size={12} />}
                <Calendar size={12} />
                {isExpired ? (
                  <span>Expirou em {estimatedExpiry.toLocaleDateString("pt-BR")}</span>
                ) : (
                  <span>{daysRemaining} dias restantes — vence em {estimatedExpiry.toLocaleDateString("pt-BR")}</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Nenhum plano ativo.</p>
        )}
      </div>

      {/* Protocolo Atual */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Protocolo Atual</h3>
        </div>
        {protocoloAtual ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                {tipoProtocoloLabels[protocoloAtual.tipo_protocolo] || protocoloAtual.tipo_protocolo}
              </Badge>
              <span className="text-xs font-medium text-foreground">{protocoloAtual.nome}</span>
            </div>
            <span className="text-xs text-muted-foreground block">
              Atualizado em: {new Date(protocoloAtual.updated_at || protocoloAtual.created_at).toLocaleDateString("pt-BR")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadPdf(protocoloAtual)}
              disabled={isDownloadingPdf}
              className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 text-xs h-7"
            >
              {isDownloadingPdf ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              {isDownloadingPdf ? "Gerando..." : "Baixar PDF"}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Protocolo ainda não disponibilizado.</p>
        )}
      </div>

      {/* Histórico de Protocolos */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Histórico de Protocolos</h3>
        </div>
        {protocolosHistorico.length > 0 ? (
          <div className="space-y-2">
            {protocolosHistorico.map((proto) => (
              <div key={proto.id} className="flex items-center justify-between p-2 border border-border rounded-md text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-1.5 py-0">{tipoProtocoloLabels[proto.tipo_protocolo] || proto.tipo_protocolo}</Badge>
                  <span className="font-medium text-foreground">{proto.nome}</span>
                  <span className="text-muted-foreground">{new Date(proto.updated_at || proto.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Nenhum protocolo anterior.</p>
        )}
      </div>

      {/* Arquivos Enviados */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Arquivos Enviados</h3>
        </div>
        {protocols.length > 0 ? (
          <div className="space-y-2">
            {protocols.map((protocol) => (
              <div key={protocol.id} className="flex items-center justify-between p-2 border border-border rounded-md">
                <div>
                  <p className="text-foreground text-xs font-medium">{protocol.file_name}</p>
                  <p className="text-muted-foreground text-xs">{new Date(protocol.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => downloadProtocol(protocol)} className="text-primary h-7 text-xs gap-1">
                  <Download size={12} />
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Nenhum arquivo enviado.</p>
        )}
      </div>

      {/* Fotos */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase text-foreground">Fotos ({totalPhotos})</h3>
          </div>
          {totalPhotos > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPhotos(!showPhotos)}
              className="text-xs text-muted-foreground h-7 gap-1"
            >
              {showPhotos ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPhotos ? "Ocultar" : "Mostrar"}
            </Button>
          )}
        </div>
        {totalPhotos > 0 ? (
          showPhotos && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {submissionsWithPhotos.map((sub) =>
                photoFields.map((field) => {
                  if (!sub[field]) return null;
                  const key = `${sub.id}-${field}`;
                  const url = photoUrls[key];
                  return (
                    <div key={key} className="space-y-1">
                      <span className="text-xs text-muted-foreground">{photoLabels[field]}</span>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={photoLabels[field]} className="w-full aspect-[3/4] object-cover rounded-md border border-border" />
                        </a>
                      ) : (
                        <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted animate-pulse" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )
        ) : (
          <p className="text-muted-foreground text-xs">Nenhuma foto enviada.</p>
        )}
      </div>

      {/* Evolução */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Evolução</h3>
        </div>
        {evolutions.length > 0 ? (
          <EvolutionSection evolutions={evolutions} />
        ) : (
          <p className="text-muted-foreground text-xs">Nenhuma evolução registrada.</p>
        )}
      </div>

      {/* Check-ins de Progresso */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Check-ins ({checkins.length})</h3>
        </div>
        {checkins.length > 0 ? (
          <div className="space-y-3">
            {checkins.map((checkin: any) => {
              const hasPhotos = checkin.photo_front || checkin.photo_side || checkin.photo_back;
              return (
                <div key={checkin.id} className="border border-border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(checkin.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                    {checkin.weight && (
                      <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                        <Scale size={12} className="text-primary" />
                        {checkin.weight} kg
                      </div>
                    )}
                  </div>
                  {checkin.notes && <p className="text-xs text-muted-foreground">{checkin.notes}</p>}
                  {hasPhotos && <CheckinPhotos checkin={checkin} />}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Nenhum check-in registrado.</p>
        )}
      </div>

      {/* Feedbacks */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Feedbacks ({feedbacks.length})</h3>
        </div>
        {feedbacks.length > 0 ? (
          <div className="space-y-3">
            {feedbacks.map((fb: any) => (
              <div key={fb.id} className="border border-border rounded-md p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(fb.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className={fb.rating <= 3 ? "text-destructive" : fb.rating <= 6 ? "text-yellow-500" : "text-green-500"} />
                    <span className={`text-xs font-bold ${fb.rating <= 3 ? "text-destructive" : fb.rating <= 6 ? "text-yellow-500" : "text-green-500"}`}>
                      {fb.rating}/10
                    </span>
                  </div>
                </div>
                <p className="text-xs text-foreground">{fb.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Nenhum feedback recebido.</p>
        )}
      </div>

      {pdfProtocol && (
        <div className="fixed -left-[200vw] top-0 opacity-0 pointer-events-none" aria-hidden="true">
          <ProtocolPdfContent
            wrapperId="protocolo-content-client-view"
            protocolo={pdfProtocol}
            clientName={clientName}
            formattedDate={new Date(pdfProtocol.updated_at || pdfProtocol.created_at).toLocaleDateString("pt-BR")}
          />
        </div>
      )}
    </div>
  );
};

const CheckinPhotos = ({ checkin }: { checkin: any }) => {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const photoLabels: Record<string, string> = { photo_front: "Frente", photo_side: "Lado", photo_back: "Costas" };

  useEffect(() => {
    const load = async () => {
      const result: Record<string, string> = {};
      for (const field of ["photo_front", "photo_side", "photo_back"]) {
        if (checkin[field]) {
          const { data } = await supabase.storage.from("client-photos").createSignedUrl(checkin[field], 3600);
          if (data?.signedUrl) result[field] = data.signedUrl;
        }
      }
      setUrls(result);
    };
    load();
  }, [checkin]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {["photo_front", "photo_side", "photo_back"].map((field) => {
        if (!checkin[field]) return null;
        const url = urls[field];
        return (
          <div key={field} className="space-y-1">
            <span className="text-xs text-muted-foreground">{photoLabels[field]}</span>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={photoLabels[field]} className="w-full aspect-[3/4] object-cover rounded-md border border-border" />
              </a>
            ) : (
              <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClientViewTab;
