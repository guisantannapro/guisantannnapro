import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LogOut, Download, Calendar, User, FileText, Camera, AlertTriangle, ClipboardList } from "lucide-react";
import { generateProtocolPdf } from "@/lib/generateProtocolPdf";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [protocolo, setProtocolo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchData(session.user.id);
    }
  }, [session]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      const [profileRes, submissionsRes, protocolsRes, protocoloRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("form_submissions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("client_protocols").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("protocolos").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (submissionsRes.data) setSubmissions(submissionsRes.data);
      if (protocolsRes.data) setProtocols(protocolsRes.data);
      if (protocoloRes.data && protocoloRes.data.length > 0) setProtocolo(protocoloRes.data[0]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadProtocol = async (protocol: any) => {
    try {
      const { data, error } = await supabase.storage
        .from("client-protocols")
        .download(protocol.file_path);

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

  const handleDownloadPdf = (proto: any) => {
    const content = `${proto.nome}\nTipo: ${tipoProtocoloLabels[proto.tipo_protocolo] || proto.tipo_protocolo}\n\n--- PLANO ALIMENTAR ---\n${proto.plano_alimentar || ""}\n\n--- TREINO ---\n${proto.treino || ""}\n\n--- OBSERVAÇÕES ---\n${proto.observacoes || ""}`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protocolo-${proto.nome || "meu-protocolo"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPhotoSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("client-photos")
      .createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  };

  const getDaysRemaining = () => {
    if (!profile?.plan_expires_at) return null;
    const now = new Date();
    const expires = new Date(profile.plan_expires_at);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();
  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase text-gradient-gold">
              Área do Cliente
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Olá, {profile?.full_name || session?.user?.email}
            </p>
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
        {/* Plan Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold uppercase text-foreground">Meu Plano</h2>
          </div>

          {profile?.plan ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                  {planLabels[profile.plan] || profile.plan}
                </Badge>
                {profile.plan_duration && (
                  <span className="text-muted-foreground text-sm">
                    Período: {profile.plan_duration}
                  </span>
                )}
              </div>

              {daysRemaining !== null && (
                <div className={`flex items-center gap-2 text-sm ${
                  isExpired ? "text-destructive" : isExpiringSoon ? "text-yellow-500" : "text-muted-foreground"
                }`}>
                  {(isExpired || isExpiringSoon) && <AlertTriangle size={16} />}
                  <Calendar size={16} />
                  {isExpired ? (
                    <span>Seu plano expirou. Entre em contato para renovar.</span>
                  ) : (
                    <span>
                      {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"} — expira em{" "}
                      {new Date(profile.plan_expires_at).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum plano ativo no momento.</p>
          )}
        </motion.div>

        {/* Meu Protocolo */}
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

          {protocolo ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                    {tipoProtocoloLabels[protocolo.tipo_protocolo] || protocolo.tipo_protocolo}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{protocolo.nome}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Atualizado em: {new Date(protocolo.updated_at || protocolo.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/protocolo/${protocolo.id}`)}
                  className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                >
                  <FileText size={14} />
                  Abrir protocolo completo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(protocolo)}
                  className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                >
                  <Download size={14} />
                  Baixar PDF
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Seu protocolo ainda não foi disponibilizado.</p>
          )}
        </motion.div>

        {/* Protocols / Downloads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold uppercase text-foreground">Meus Protocolos</h2>
          </div>

          {protocols.length > 0 ? (
            <div className="space-y-3">
              {protocols.map((protocol) => (
                <div
                  key={protocol.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">{protocol.file_name}</p>
                    <p className="text-muted-foreground text-xs">
                      Enviado em {new Date(protocol.created_at).toLocaleDateString("pt-BR")}
                    </p>
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
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum protocolo disponível ainda.</p>
          )}
        </motion.div>

        {/* Photos History */}
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

          {submissions.length > 0 ? (
            <div className="space-y-6">
              {submissions.map((sub) => (
                <SubmissionPhotos key={sub.id} submission={sub} getPhotoSignedUrl={getPhotoSignedUrl} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma foto enviada ainda.</p>
          )}
        </motion.div>
      </main>
    </div>
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
      <p className="text-xs text-muted-foreground mb-3">
        Enviadas em {new Date(submission.created_at).toLocaleDateString("pt-BR")}
      </p>
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
