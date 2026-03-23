import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, MessageCircle, Mail, X, Users, FileText, ArrowLeft, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import ProtocolUpload from "@/components/dashboard/ProtocolUpload";
import ClientFilters from "@/components/dashboard/ClientFilters";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FormSubmission {
  id: string;
  created_at: string;
  form_data: any;
  photo_front: string | null;
  photo_side: string | null;
  photo_back: string | null;
  photo_assessment: string | null;
  selected_equipment: string[] | null;
  user_id: string;
  plan: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  plan: string | null;
}

interface ClientData extends FormSubmission {
  profile?: Profile;
}

const planLabels: Record<string, string> = {
  base: "Base",
  transformacao: "Transformação",
  elite: "Elite",
};

const Dashboard = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientProtocols, setClientProtocols] = useState<any[]>([]);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 20;

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (searchTerm) {
        const name = (client.form_data?.fullName || "").toLowerCase();
        const email = (client.form_data?.email || "").toLowerCase();
        const term = searchTerm.toLowerCase();
        if (!name.includes(term) && !email.includes(term)) return false;
      }
      if (planFilter !== "all" && (client.plan || client.profile?.plan) !== planFilter) return false;
      if (periodFilter !== "all") {
        const days = parseInt(periodFilter);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(client.created_at) < cutoff) return false;
      }
      return true;
    });
  }, [clients, searchTerm, planFilter, periodFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, planFilter, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data: submissions, error } = await supabase
        .from("form_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set((submissions || []).map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, plan")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      const enriched: ClientData[] = (submissions || []).map((s) => ({
        ...s,
        profile: profileMap.get(s.user_id),
      }));

      setClients(enriched);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const getField = (client: ClientData, field: string) => {
    return client.form_data?.[field] || "—";
  };

  const getGoals = (client: ClientData) => {
    const goals = client.form_data?.mainGoal;
    if (Array.isArray(goals)) return goals.join(", ");
    return goals || "—";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openWhatsApp = (client: ClientData) => {
    const phone = client.form_data?.whatsapp?.replace(/\D/g, "") || "";
    const message = encodeURIComponent(
      "Olá, recebemos seu formulário e em breve iniciaremos seu acompanhamento."
    );
    window.open(`https://wa.me/55${phone}?text=${message}`, "_blank");
  };

  const sendEmail = (client: ClientData) => {
    const email = getField(client, "email");
    const subject = encodeURIComponent("Formulário recebido");
    const body = encodeURIComponent(
      "Recebemos suas informações com sucesso. Em breve entraremos em contato para iniciar seu plano."
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  const getPhotoUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("client-photos").getPublicUrl(path);
    return data?.publicUrl || null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase text-gradient-gold">
                Dashboard de Clientes
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Acompanhamento dos formulários preenchidos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary gap-1.5 px-3 py-1.5">
              <Users size={14} />
              {clients.length} clientes
            </Badge>
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
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl uppercase text-muted-foreground mb-2">Nenhum formulário enviado</h3>
            <p className="text-muted-foreground/60 text-sm">
              Os formulários dos clientes aparecerão aqui.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DashboardStats clients={clients} />
            <ClientFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              planFilter={planFilter}
              onPlanFilterChange={setPlanFilter}
              periodFilter={periodFilter}
              onPeriodFilterChange={setPeriodFilter}
              totalResults={filteredClients.length}
            />
            {/* Desktop Table */}
            <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-primary font-semibold uppercase text-xs tracking-wider">Nome</TableHead>
                    <TableHead className="text-primary font-semibold uppercase text-xs tracking-wider">Email</TableHead>
                    <TableHead className="text-primary font-semibold uppercase text-xs tracking-wider">Plano</TableHead>
                    <TableHead className="text-primary font-semibold uppercase text-xs tracking-wider">Objetivo</TableHead>
                    <TableHead className="text-primary font-semibold uppercase text-xs tracking-wider">Data</TableHead>
                    <TableHead className="text-primary font-semibold uppercase text-xs tracking-wider text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client) => (
                    <TableRow key={client.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {getField(client, "fullName")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {getField(client, "email")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary text-xs"
                        >
                          {planLabels[client.plan || client.profile?.plan || ""] || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {getGoals(client)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(client.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                          className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                        >
                          <Eye size={14} />
                          Ver detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {paginatedClients.map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{getField(client, "fullName")}</h3>
                      <p className="text-muted-foreground text-sm">{getField(client, "email")}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                      {planLabels[client.plan || client.profile?.plan || ""] || "—"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{getGoals(client)}</span>
                    <span className="text-muted-foreground/60 text-xs">{formatDate(client.created_at)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                    className="w-full border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                  >
                    <Eye size={14} />
                    Ver detalhes
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)} de {filteredClients.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-border gap-1"
                  >
                    <ChevronLeft size={14} />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-border gap-1"
                  >
                    Próxima
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Client Detail Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gradient-gold uppercase">
              {selectedClient && getField(selectedClient, "fullName")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Detalhes do formulário enviado em{" "}
              {selectedClient && formatDate(selectedClient.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6 mt-4">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="Nome" value={getField(selectedClient, "fullName")} />
                <InfoItem label="Email" value={getField(selectedClient, "email")} />
                <InfoItem label="WhatsApp" value={getField(selectedClient, "whatsapp")} />
                <InfoItem label="Plano" value={planLabels[selectedClient.plan || selectedClient.profile?.plan || ""] || "—"} />
                <InfoItem label="Período" value={
                  { mensal: "Mensal", trimestral: "Trimestral", semestral: "Semestral" }[selectedClient.form_data?.billingPeriod] || "—"
                } />
                {(selectedClient.plan === "base" || selectedClient.profile?.plan === "base") && (
                  <InfoItem label="Modalidade" value={
                    { dieta: "Dieta", treino: "Treino", ambos: "Dieta + Treino" }[selectedClient.form_data?.billingModality] || "—"
                  } />
                )}
                <InfoItem label="Objetivo" value={getGoals(selectedClient)} />
                {selectedClient.form_data?.mainGoalOther && (
                  <InfoItem label="Objetivo (outro)" value={getField(selectedClient, "mainGoalOther")} />
                )}
                <InfoItem label="Tempo para objetivo" value={getField(selectedClient, "timeline")} />
                <InfoItem label="Comprometimento" value={`${getField(selectedClient, "commitment")}/10`} />
                <InfoItem label="Peso" value={getField(selectedClient, "weight")} />
                <InfoItem label="Altura" value={getField(selectedClient, "height")} />
                <InfoItem label="Idade" value={getField(selectedClient, "age")} />
                <InfoItem label="Cidade/UF" value={
                  `${getField(selectedClient, "city")}${selectedClient.form_data?.state ? ` - ${selectedClient.form_data.state}` : ""}`
                } />
                <InfoItem label="Instagram" value={getField(selectedClient, "instagram")} />
              </div>

              {/* Training Info */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold uppercase text-primary mb-3">Treino</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Modalidades" value={
                    Array.isArray(selectedClient.form_data?.trainingModalities)
                      ? selectedClient.form_data.trainingModalities.join(", ")
                      : "—"
                  } />
                   {selectedClient.form_data?.musculacaoFrequency && (
                    <InfoItem label="Freq. Musculação" value={getField(selectedClient, "musculacaoFrequency")} />
                   )}
                   {selectedClient.form_data?.ciclismoFrequency && (
                    <InfoItem label="Freq. Ciclismo" value={getField(selectedClient, "ciclismoFrequency")} />
                  )}
                  {selectedClient.form_data?.caminhadaFrequency && (
                    <InfoItem label="Freq. Caminhada" value={getField(selectedClient, "caminhadaFrequency")} />
                  )}
                  {selectedClient.form_data?.corridaFrequency && (
                    <InfoItem label="Freq. Corrida" value={getField(selectedClient, "corridaFrequency")} />
                  )}
                  {selectedClient.form_data?.sportFrequency && (
                    <InfoItem label="Freq. Esporte coletivo" value={getField(selectedClient, "sportFrequency")} />
                  )}
                  {selectedClient.form_data?.trainingModalitiesOther && (
                    <InfoItem label="Modalidade (outro)" value={getField(selectedClient, "trainingModalitiesOther")} />
                  )}
                  <InfoItem label="Frequência" value={getField(selectedClient, "trainingFrequency")} />
                  <InfoItem label="Duração" value={getField(selectedClient, "trainingDuration")} />
                  <InfoItem label="Experiência" value={getField(selectedClient, "trainingExperience")} />
                  <InfoItem label="Esforço no trabalho" value={getField(selectedClient, "workEffort")} />
                  <InfoItem label="Horário disponível" value={getField(selectedClient, "availableSchedule")} />
                  <InfoItem label="Já teve acompanhamento profissional" value={getField(selectedClient, "hadProfessionalCoaching")} />
                </div>
              </div>

              {/* Health Info */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold uppercase text-primary mb-3">Saúde</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Condições de saúde" value={
                    Array.isArray(selectedClient.form_data?.healthConditions)
                      ? selectedClient.form_data.healthConditions.join(", ")
                      : "—"
                  } />
                  {selectedClient.form_data?.healthConditionsOther && (
                    <InfoItem label="Condição (outro)" value={getField(selectedClient, "healthConditionsOther")} />
                  )}
                  <InfoItem label="Medicação" value={getField(selectedClient, "usesMedication")} />
                  {selectedClient.form_data?.medicationDetails && (
                    <InfoItem label="Detalhes da medicação" value={getField(selectedClient, "medicationDetails")} />
                  )}
                  <InfoItem label="Hormônios" value={getField(selectedClient, "usesHormones")} />
                  {selectedClient.form_data?.hormoneDetails && (
                    <InfoItem label="Detalhes dos hormônios" value={getField(selectedClient, "hormoneDetails")} />
                  )}
                  <InfoItem label="Restrições alimentares" value={
                    Array.isArray(selectedClient.form_data?.foodRestrictions)
                      ? selectedClient.form_data.foodRestrictions.join(", ")
                      : getField(selectedClient, "foodRestrictions")
                  } />
                  {selectedClient.form_data?.allergyDetails && (
                    <InfoItem label="Alergia alimentar" value={getField(selectedClient, "allergyDetails")} />
                  )}
                  {selectedClient.form_data?.foodRestrictionsOther && (
                    <InfoItem label="Restrição (outro)" value={getField(selectedClient, "foodRestrictionsOther")} />
                  )}
                  <InfoItem label="Suplementos" value={getField(selectedClient, "usesSupplements")} />
                  {selectedClient.form_data?.supplementDetails && (
                    <InfoItem label="Detalhes dos suplementos" value={getField(selectedClient, "supplementDetails")} />
                  )}
                  <InfoItem label="Sono" value={`${getField(selectedClient, "sleepHours")} horas`} />
                  <InfoItem label="Qualidade do sono" value={`${getField(selectedClient, "sleepQuality")}/10`} />
                  <InfoItem label="Nível de estresse" value={getField(selectedClient, "stressLevel")} />
                </div>
              </div>

              {/* Nutrition */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold uppercase text-primary mb-3">Alimentação</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Refeições/dia" value={getField(selectedClient, "mealsPerDay")} />
                  <InfoItem label="Horários fixos" value={getField(selectedClient, "fixedMealTimes")} />
                  <InfoItem label="Água/dia" value={getField(selectedClient, "waterIntake")} />
                  <InfoItem label="Compulsão alimentar" value={getField(selectedClient, "bingEating")} />
                </div>
                <div className="mt-3">
                  <InfoItem label="Dieta diária" value={getField(selectedClient, "dailyDiet")} />
                </div>
              </div>

              {/* Hábitos */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold uppercase text-primary mb-3">Hábitos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem label="Tabagismo" value={getField(selectedClient, "smoking")} />
                  {selectedClient.form_data?.smokingAmount && (
                    <InfoItem label="Quantidade (cigarro)" value={getField(selectedClient, "smokingAmount")} />
                  )}
                  <InfoItem label="Álcool" value={getField(selectedClient, "alcohol")} />
                  {selectedClient.form_data?.alcoholFrequency && (
                    <InfoItem label="Frequência (álcool)" value={getField(selectedClient, "alcoholFrequency")} />
                  )}
                  <InfoItem label="Outras substâncias" value={getField(selectedClient, "otherSubstances")} />
                  {selectedClient.form_data?.otherSubstancesDetails && (
                    <InfoItem label="Detalhes (substâncias)" value={getField(selectedClient, "otherSubstancesDetails")} />
                  )}
                </div>
              </div>

              {/* Photos */}
              {(selectedClient.photo_front || selectedClient.photo_side || selectedClient.photo_back || selectedClient.photo_assessment) && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold uppercase text-primary mb-3">Fotos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedClient.photo_front && (
                      <PhotoThumb label="Frente" path={selectedClient.photo_front} />
                    )}
                    {selectedClient.photo_side && (
                      <PhotoThumb label="Lado" path={selectedClient.photo_side} />
                    )}
                    {selectedClient.photo_back && (
                      <PhotoThumb label="Costas" path={selectedClient.photo_back} />
                    )}
                    {selectedClient.photo_assessment && (
                      <PhotoThumb label="Avaliação" path={selectedClient.photo_assessment} />
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-border pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => openWhatsApp(selectedClient)}
                  className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2"
                >
                  <MessageCircle size={16} />
                  Enviar WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendEmail(selectedClient)}
                  className="flex-1 border-primary/30 text-primary hover:bg-primary/10 gap-2"
                >
                  <Mail size={16} />
                  Enviar Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    <p className="text-foreground text-sm mt-0.5">{value}</p>
  </div>
);

const PhotoThumb = ({ label, path }: { label: string; path: string }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      const { data, error } = await supabase.storage
        .from("client-photos")
        .createSignedUrl(path, 3600); // 1 hour expiry
      if (data?.signedUrl) setUrl(data.signedUrl);
    };
    getSignedUrl();
  }, [path]);

  if (!url) return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={label}
          className="w-full aspect-[3/4] object-cover rounded-md border border-border hover:border-primary/50 transition-colors"
        />
      </a>
    </div>
  );
};

export default Dashboard;
