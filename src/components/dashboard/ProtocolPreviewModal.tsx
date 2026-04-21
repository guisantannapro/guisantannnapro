import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExerciseTableEditor, { DayBlock, DEFAULT_DAYS } from "@/components/protocol/ExerciseTableEditor";

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
  bulking: `Refeição 1

1 - Mingau
30g whey protein
60g aveia
200g iogurte desnatado
40g pasta de amendoim integral
200g frutas (mamão, melão, morango, melancia)
Obs: escolher uma fruta ou misturar de sua preferencia

1 OU 2

2 - 4 fatias de pão de forma tradicional
3 ovos inteiros + 2 claras
200ml leite desnatado s/lac
200g frutas (mamão, melão, morango, melancia)
Obs: escolher uma fruta ou misturar de sua preferencia


Refeição 2

120g frango, peixe branco ou carne magra (patinho)
250g arroz, macarrão ou aipim ou 400g batata inglesa ou doce assada
100g feijão
10g azeite de oliva
100g abacaxi ou 150g mamão
100g vegetais
Salada verde a vontade

Pre treino

30g palatinose
1 banana


Pós treino

6 Pães de forma tradicional
60g sucrilhos
30g whey protein ou 4 claras 1 ovo inteiro
200ml leite desnatado s/lac
1 banana

Refeição 3

120g frango, peixe branco ou carne magra (patinho)
250g arroz, macarrão ou aipim ou 400g batata inglesa ou doce assada
Salada verde a vontade
1 maçã

Ou

40g whey protein
90g farinha de aveia
200ml leite
1 maçã

Refeição 4

150g peixe branco ou frango ou carne magra(patinho) ou 1 ovo inteiro +6 claras,
250g arroz, macarrão ou aipim ou 400 batata inglesa ou doce assada
100g vegetais
10g azeite de oliva
Salada verde a vontade
200g frutas (mamão, melão, morango, melancia)
Obs: escolher uma fruta ou misturar de sua preferencia

OU

120g tapioca
3 ovos inteiros
80g frango desfiado
Salada verde a vontade
200g frutas (mamão, melão, morango, melancia)
Obs: escolher uma fruta ou misturar de sua preferencia


Consumo de água: 4,5 a 5L dia


Refeição livre

Uma vez por semana trocar a refeição 4 por uma refeição livre`,

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

const defaultRegrasGerais = `1º Exercício do Músculo: 2x Aquecimento (30% carga) + 1x Feeder Set (80% carga).

Exercícios Subsequentes (mesmo músculo): Realizar apenas 1x Feeder Set antes das séries de trabalho.

1 Top Set até falha absoluta
1 Back-off (RIR 0–1) 10-15% menos carga

RIR (Reserva)
RIR 0: Até a falha.
RIR 1: 1 na reserva.

Rest-pause: 3 x 10-12 (Última série: falha → 20s descanso → falha)

Progressão: bate topo da faixa → sobe carga

Logbook obrigatório (anotar tudo)`;


const defaultSupplementacao = `Whey Protein - nas refeições indicadas
Creatina - 10g/dia (qualquer horário)
Ômega 3 3g - 1x ao dia junto a primeira refeição
Multivitamínico 1 caps - 1x ao dia junto a primeira refeição
Vit C - 1g ao dia junto a primeira refeição
Vita D - 30mil ui 1x na semana
Vita E - 400ui ao dia junto a primeira refeição
Zinco - 50mg ao dia junto a ultima refeição`;

const defaultCardio = `Semana: 7x qualquer horário
Intensidade: média/moderada
Duração: 30/30 min 2x ao dia
Média de 200-300 Kcals por sessão
Frequência Cardíaca Média: 120-130bpm
Tipo: Qualquer um de sua preferência. O importante é manter a frequência cardíaca indicada (intensidade elevada) durante a sessão. O elíptico (transfer) é uma ótima opção por não envolver nenhum tipo de impacto ou estresse nos ligamentos (joelhos)`;

const ProtocolPreviewModal = ({ open, onOpenChange, client }: ProtocolPreviewModalProps) => {
  const [protocolType, setProtocolType] = useState<ProtocolType | null>(null);
  const [planoAlimentar, setPlanoAlimentar] = useState("");
  const [regrasGerais, setRegrasGerais] = useState("");
  const [suplementacao, setSuplementacao] = useState("");
  const [cardio, setCardio] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  // Exercise table state
  const [exerciseDays, setExerciseDays] = useState<DayBlock[]>(DEFAULT_DAYS);
  const [exerciseWeeks, setExerciseWeeks] = useState(4);

  const getField = (field: string) => client.form_data?.[field] || "—";
  const plan = client.plan || client.profile?.plan || "";
  const clientGoal = Array.isArray(client.form_data?.mainGoal)
    ? client.form_data.mainGoal.join(", ")
    : getField("mainGoal");

  useEffect(() => {
    if (protocolType) {
      setPlanoAlimentar(dietTextTemplates[protocolType]);
      setRegrasGerais(defaultRegrasGerais);
      setSuplementacao(defaultSupplementacao);
      setCardio(defaultCardio);
      setObservacoes("");
      setExerciseDays(DEFAULT_DAYS.map(d => ({ ...d, id: crypto.randomUUID(), exercises: d.exercises.map(e => ({ ...e, id: crypto.randomUUID() })) })));
      setExerciseWeeks(4);
    }
  }, [protocolType]);

  const handleClose = (value: boolean) => {
    if (!value) {
      setProtocolType(null);
      setPlanoAlimentar("");
      setRegrasGerais("");
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

      const daysPayload = exerciseDays.map(d => ({
        day_label: d.day_label,
        table_type: d.table_type,
        exercises: d.exercises.map(e => ({
          exercise_name: e.exercise_name,
          metodo: e.metodo || "",
          admin_obs: e.admin_obs || "",
        })),
      }));

      const { data, error } = await supabase.rpc("create_structured_protocol", {
        _user_id: client.user_id,
        _nome: nome,
        _tipo_protocolo: protocolType,
        _plano_alimentar: planoAlimentar,
        _treino: regrasGerais,
        _suplementacao: suplementacao,
        _cardio: cardio,
        _observacoes: observacoes,
        _exercise_weeks: exerciseWeeks,
        _exercise_days: daysPayload as any,
      });

      if (error) throw error;

      toast.success("Protocolo salvo com sucesso!");
      handleClose(false);
    } catch (err: any) {
      console.error("Error saving protocol:", err);
      toast.error(err?.message || "Erro ao salvar protocolo.");
    } finally {
      setSaving(false);
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleWheel = (e: WheelEvent) => {
      const el = contentRef.current;
      if (!el) return;
      // Se o evento não veio de dentro do modal, repassa o scroll
      if (!el.contains(e.target as Node)) {
        e.preventDefault();
        el.scrollTop += e.deltaY;
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        ref={contentRef}
        className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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

            {/* Observações */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">📝 Observações</h3>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                placeholder="Adicione observações sobre o protocolo..."
                className="bg-muted/50 border-border text-sm text-foreground resize-y min-h-[100px]"
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

            {/* Regras Gerais do Treino */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">📋 Regras Gerais do Treino</h3>
              <Textarea
                value={regrasGerais}
                onChange={(e) => setRegrasGerais(e.target.value)}
                rows={12}
                className="bg-muted/50 border-border text-sm text-foreground resize-y min-h-[200px]"
              />
            </section>

            <Separator />

            {/* Exercise Table Editor */}
            <section>
              <ExerciseTableEditor
                days={exerciseDays}
                onChange={setExerciseDays}
                weeks={exerciseWeeks}
                onWeeksChange={setExerciseWeeks}
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
