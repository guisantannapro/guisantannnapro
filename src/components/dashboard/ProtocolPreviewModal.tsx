import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientData {
  form_data: any;
  plan: string | null;
  user_id: string;
  profile?: { plan: string | null; full_name: string | null };
}

const planLabels: Record<string, string> = {
  base: "Base",
  transformacao: "Transformação",
  elite: "Elite",
};

type ProtocolType = "bulking" | "cutting" | "recomp";

const protocolTypeLabels: Record<ProtocolType, string> = {
  bulking: "Bulking",
  cutting: "Cutting",
  recomp: "Recomposição Corporal",
};

interface ProtocolPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientData;
}

const dietTextTemplates: Record<ProtocolType, string> = {
  bulking: `Refeição 1 — Café da manhã (07:00)
• 4 ovos mexidos + 3 fatias de pão integral + 1 banana + pasta de amendoim

Refeição 2 — Lanche da manhã (10:00)
• Shake: whey + aveia + leite integral + banana

Refeição 3 — Almoço (12:30)
• 200g frango grelhado + 150g arroz + 100g feijão + salada + azeite

Refeição 4 — Lanche da tarde (15:30)
• Batata doce + frango desfiado + suco natural

Refeição 5 — Pré-treino (17:30)
• Tapioca com queijo + café preto

Refeição 6 — Jantar (20:00)
• 200g carne vermelha + macarrão integral + legumes refogados`,

  cutting: `Refeição 1 — Café da manhã (07:00)
• 3 claras + 1 ovo inteiro + 1 fatia pão integral + café sem açúcar

Refeição 2 — Lanche da manhã (10:00)
• Iogurte natural desnatado + 10g chia + morangos

Refeição 3 — Almoço (12:30)
• 150g frango grelhado + 80g arroz integral + salada volumosa + limão

Refeição 4 — Lanche da tarde (15:30)
• Whey isolado com água + 1 maçã

Refeição 5 — Jantar (19:00)
• 150g peixe grelhado + legumes no vapor + azeite`,

  recomp: `Refeição 1 — Café da manhã (07:00)
• 3 ovos mexidos + 2 fatias de pão integral + 1 fruta

Refeição 2 — Lanche da manhã (10:00)
• Iogurte natural + 30g granola + 1 banana

Refeição 3 — Almoço (12:30)
• 150g frango grelhado + 100g arroz + 80g feijão + salada à vontade

Refeição 4 — Lanche da tarde (15:30)
• Whey protein + 1 fruta + 20g castanhas

Refeição 5 — Jantar (19:00)
• 150g carne vermelha magra + batata doce + legumes refogados`,
};

const trainingTextTemplates: Record<ProtocolType, string> = {
  bulking: `Segunda — Peito / Tríceps (Volume)
• Supino reto 4x8 | Supino inclinado 4x10 | Crucifixo 3x12 | Tríceps testa 4x10

Terça — Costas / Bíceps (Volume)
• Barra fixa 4x8 | Remada curvada 4x10 | Pulley 3x12 | Rosca Scott 4x10

Quarta — Pernas (Força)
• Agachamento livre 5x6 | Leg press 4x10 | Extensora 3x12 | Panturrilha 4x15

Quinta — Ombros / Trapézio
• Desenvolvimento militar 4x8 | Elevação lateral 4x12 | Encolhimento 4x12

Sexta — Posterior / Glúteos (Volume)
• Stiff 4x8 | Cadeira flexora 4x10 | Hip thrust 4x10 | Abdômen 3x20`,

  cutting: `Segunda — Full Upper (Circuito)
• Supino reto 3x12 | Remada 3x12 | Desenvolvimento 3x12 | Tríceps/Bíceps 2x15

Terça — Full Lower + HIIT
• Agachamento 3x12 | Leg press 3x12 | Stiff 3x12 | 15min HIIT bike

Quarta — Cardio moderado
• 40min esteira inclinada ou elíptico

Quinta — Full Upper (Circuito)
• Puxada 3x12 | Supino inclinado 3x12 | Elevação lateral 3x15 | Abdômen 3x20

Sexta — Full Lower + HIIT
• Hip thrust 3x12 | Extensora 3x15 | Flexora 3x15 | 15min HIIT`,

  recomp: `Segunda — Peito / Tríceps
• Supino reto 4x10 | Crucifixo 3x12 | Tríceps corda 3x12

Terça — Costas / Bíceps
• Puxada frontal 4x10 | Remada curvada 3x12 | Rosca direta 3x12

Quarta — Pernas
• Agachamento livre 4x10 | Leg press 3x12 | Extensora 3x15

Quinta — Ombros / Abdômen
• Desenvolvimento 4x10 | Elevação lateral 3x12 | Prancha 3x45s

Sexta — Posterior / Glúteos
• Stiff 4x10 | Cadeira flexora 3x12 | Hip thrust 3x12`,
};

const defaultSupplementacao = `Whey Protein - nas refeições indicadas
Creatina - 10g/dia (qualquer horário)
Ômega 3 3g - 1x ao dia junto a primeira refeição
Multivitamínico 1 caps - 1x ao dia junto a primeira refeição
Vit C - 1g ao dia junto a primeira refeição
Vita D - 30mil ui 1x na semana
Vita E - 400ui ao dia junto a primeira refeição
Zinco - 50mg ao dia junto a ultima refeição
Os molhos, caldas, temperos zero liberados com moderação`;

const defaultCardio = `Semana: 7x qualquer horário
Intensidade: média/moderada
Duração: 30/30 min 2x ao dia
Média de 200-300 Kcals por sessão
Frequência Cardíaca Média: 120-130bpm
Tipo: Qualquer um de sua preferência. O importante é manter a frequência cardíaca indicada (intensidade elevada) durante a sessão. O elíptico (transfer) é uma ótima opção por não envolver nenhum tipo de impacto ou estresse nos ligamentos (joelhos)`;

const ProtocolPreviewModal = ({ open, onOpenChange, client }: ProtocolPreviewModalProps) => {
  const [protocolType, setProtocolType] = useState<ProtocolType | null>(null);
  const [planoAlimentar, setPlanoAlimentar] = useState("");
  const [treino, setTreino] = useState("");
  const [suplementacao, setSuplementacao] = useState("");
  const [cardio, setCardio] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  const getField = (field: string) => client.form_data?.[field] || "—";
  const plan = client.plan || client.profile?.plan || "";
  const clientGoal = Array.isArray(client.form_data?.mainGoal)
    ? client.form_data.mainGoal.join(", ")
    : getField("mainGoal");

  // Load template when type is selected
  useEffect(() => {
    if (protocolType) {
      setPlanoAlimentar(dietTextTemplates[protocolType]);
      setTreino(trainingTextTemplates[protocolType]);
      setSuplementacao(defaultSupplementacao);
      setCardio(defaultCardio);
      setObservacoes("");
    }
  }, [protocolType]);

  const handleClose = (value: boolean) => {
    if (!value) {
      setProtocolType(null);
      setPlanoAlimentar("");
      setTreino("");
      setSuplementacao("");
      setCardio("");
      setObservacoes("");
    }
    onOpenChange(value);
  };

  const handleSave = async () => {
    if (!protocolType) return;
    setSaving(true);
    try {
      const nome = `Protocolo ${protocolTypeLabels[protocolType]} — ${getField("fullName")}`;
      const { error } = await (supabase.from("protocolos") as any).insert({
        user_id: client.user_id,
        nome,
        tipo_protocolo: protocolType,
        plano_alimentar: planoAlimentar,
        treino,
        suplementacao,
        cardio,
        observacoes,
      });
      if (error) throw error;
      toast.success("Protocolo salvo com sucesso!");
      handleClose(false);
    } catch (err: any) {
      console.error("Error saving protocol:", err);
      toast.error("Erro ao salvar protocolo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient-gold uppercase">
            {protocolType ? `Protocolo ${protocolTypeLabels[protocolType]}` : "Gerar Protocolo"} — {getField("fullName")}
          </DialogTitle>
        </DialogHeader>

        {!protocolType ? (
          <div className="space-y-6 mt-4">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <span className="text-xs text-muted-foreground uppercase">Objetivo informado pelo cliente (referência)</span>
              <p className="text-sm text-foreground mt-1">{clientGoal}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase text-foreground mb-3">
                Selecione o tipo de protocolo <span className="text-destructive">*</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(protocolTypeLabels) as ProtocolType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setProtocolType(type)}
                    className="group border border-border rounded-lg p-5 text-center hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <ClipboardList className="w-6 h-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-semibold text-foreground">{protocolTypeLabels[type]}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type === "bulking" && "Superávit calórico"}
                      {type === "cutting" && "Déficit calórico"}
                      {type === "recomp" && "Equilíbrio calórico"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-4 text-foreground">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-primary-foreground">{protocolTypeLabels[protocolType]}</Badge>
              <Button variant="ghost" size="sm" onClick={() => setProtocolType(null)} className="text-xs text-muted-foreground">
                Alterar tipo
              </Button>
            </div>

            {/* Dados do Aluno */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Dados do Aluno</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Nome</span>
                  <p>{getField("fullName")}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Plano</span>
                  <p>{planLabels[plan] || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Peso</span>
                  <p>{getField("weight")}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Altura</span>
                  <p>{getField("height")}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground uppercase">Objetivo (referência)</span>
                  <p className="text-muted-foreground">{clientGoal}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Plano Alimentar */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Plano Alimentar</h3>
              <Textarea
                value={planoAlimentar}
                onChange={(e) => setPlanoAlimentar(e.target.value)}
                rows={14}
                className="bg-muted/50 border-border text-sm text-foreground resize-y min-h-[200px]"
              />
            </section>

            <Separator />

            {/* Suplementação */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Suplementação</h3>
              <Textarea
                value={suplementacao}
                onChange={(e) => setSuplementacao(e.target.value)}
                rows={10}
                className="bg-muted/50 border-border text-sm text-foreground resize-y min-h-[150px]"
              />
            </section>

            <Separator />

            {/* Cardio */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Cardio</h3>
              <Textarea
                value={cardio}
                onChange={(e) => setCardio(e.target.value)}
                rows={8}
                className="bg-muted/50 border-border text-sm text-foreground resize-y min-h-[150px]"
              />
            </section>

            <Separator />

            {/* Treino */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Treino</h3>
              <Textarea
                value={treino}
                onChange={(e) => setTreino(e.target.value)}
                rows={14}
                className="bg-muted/50 border-border text-sm text-foreground resize-y min-h-[200px]"
              />
            </section>

            <Separator />

            {/* Observações */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Observações</h3>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                placeholder="Adicione observações sobre o protocolo..."
                className="bg-muted/50 border-border text-sm text-foreground resize-y"
              />
            </section>

            {/* Salvar */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              <Save size={16} />
              {saving ? "Salvando..." : "Salvar Protocolo"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProtocolPreviewModal;
