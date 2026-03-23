import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

interface ClientData {
  form_data: any;
  plan: string | null;
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

const dietTemplates: Record<ProtocolType, React.ReactNode> = {
  bulking: (
    <>
      <p><strong className="text-foreground">Refeição 1 — Café da manhã (07:00)</strong></p>
      <p>• 4 ovos mexidos + 3 fatias de pão integral + 1 banana + pasta de amendoim</p>
      <p><strong className="text-foreground">Refeição 2 — Lanche da manhã (10:00)</strong></p>
      <p>• Shake: whey + aveia + leite integral + banana</p>
      <p><strong className="text-foreground">Refeição 3 — Almoço (12:30)</strong></p>
      <p>• 200g frango grelhado + 150g arroz + 100g feijão + salada + azeite</p>
      <p><strong className="text-foreground">Refeição 4 — Lanche da tarde (15:30)</strong></p>
      <p>• Batata doce + frango desfiado + suco natural</p>
      <p><strong className="text-foreground">Refeição 5 — Pré-treino (17:30)</strong></p>
      <p>• Tapioca com queijo + café preto</p>
      <p><strong className="text-foreground">Refeição 6 — Jantar (20:00)</strong></p>
      <p>• 200g carne vermelha + macarrão integral + legumes refogados</p>
      <p className="text-xs italic mt-3">* Template Bulking — superávit calórico para ganho de massa.</p>
    </>
  ),
  cutting: (
    <>
      <p><strong className="text-foreground">Refeição 1 — Café da manhã (07:00)</strong></p>
      <p>• 3 claras + 1 ovo inteiro + 1 fatia pão integral + café sem açúcar</p>
      <p><strong className="text-foreground">Refeição 2 — Lanche da manhã (10:00)</strong></p>
      <p>• Iogurte natural desnatado + 10g chia + morangos</p>
      <p><strong className="text-foreground">Refeição 3 — Almoço (12:30)</strong></p>
      <p>• 150g frango grelhado + 80g arroz integral + salada volumosa + limão</p>
      <p><strong className="text-foreground">Refeição 4 — Lanche da tarde (15:30)</strong></p>
      <p>• Whey isolado com água + 1 maçã</p>
      <p><strong className="text-foreground">Refeição 5 — Jantar (19:00)</strong></p>
      <p>• 150g peixe grelhado + legumes no vapor + azeite</p>
      <p className="text-xs italic mt-3">* Template Cutting — déficit calórico para perda de gordura.</p>
    </>
  ),
  recomp: (
    <>
      <p><strong className="text-foreground">Refeição 1 — Café da manhã (07:00)</strong></p>
      <p>• 3 ovos mexidos + 2 fatias de pão integral + 1 fruta</p>
      <p><strong className="text-foreground">Refeição 2 — Lanche da manhã (10:00)</strong></p>
      <p>• Iogurte natural + 30g granola + 1 banana</p>
      <p><strong className="text-foreground">Refeição 3 — Almoço (12:30)</strong></p>
      <p>• 150g frango grelhado + 100g arroz + 80g feijão + salada à vontade</p>
      <p><strong className="text-foreground">Refeição 4 — Lanche da tarde (15:30)</strong></p>
      <p>• Whey protein + 1 fruta + 20g castanhas</p>
      <p><strong className="text-foreground">Refeição 5 — Jantar (19:00)</strong></p>
      <p>• 150g carne vermelha magra + batata doce + legumes refogados</p>
      <p className="text-xs italic mt-3">* Template Recomposição — equilíbrio entre ganho muscular e perda de gordura.</p>
    </>
  ),
};

const trainingTemplates: Record<ProtocolType, React.ReactNode> = {
  bulking: (
    <>
      <p><strong className="text-foreground">Segunda — Peito / Tríceps (Volume)</strong></p>
      <p>• Supino reto 4x8 | Supino inclinado 4x10 | Crucifixo 3x12 | Tríceps testa 4x10</p>
      <p><strong className="text-foreground">Terça — Costas / Bíceps (Volume)</strong></p>
      <p>• Barra fixa 4x8 | Remada curvada 4x10 | Pulley 3x12 | Rosca Scott 4x10</p>
      <p><strong className="text-foreground">Quarta — Pernas (Força)</strong></p>
      <p>• Agachamento livre 5x6 | Leg press 4x10 | Extensora 3x12 | Panturrilha 4x15</p>
      <p><strong className="text-foreground">Quinta — Ombros / Trapézio</strong></p>
      <p>• Desenvolvimento militar 4x8 | Elevação lateral 4x12 | Encolhimento 4x12</p>
      <p><strong className="text-foreground">Sexta — Posterior / Glúteos (Volume)</strong></p>
      <p>• Stiff 4x8 | Cadeira flexora 4x10 | Hip thrust 4x10 | Abdômen 3x20</p>
      <p className="text-xs italic mt-3">* Template Bulking — foco em cargas progressivas e volume alto.</p>
    </>
  ),
  cutting: (
    <>
      <p><strong className="text-foreground">Segunda — Full Upper (Circuito)</strong></p>
      <p>• Supino reto 3x12 | Remada 3x12 | Desenvolvimento 3x12 | Tríceps/Bíceps 2x15</p>
      <p><strong className="text-foreground">Terça — Full Lower + HIIT</strong></p>
      <p>• Agachamento 3x12 | Leg press 3x12 | Stiff 3x12 | 15min HIIT bike</p>
      <p><strong className="text-foreground">Quarta — Cardio moderado</strong></p>
      <p>• 40min esteira inclinada ou elíptico</p>
      <p><strong className="text-foreground">Quinta — Full Upper (Circuito)</strong></p>
      <p>• Puxada 3x12 | Supino inclinado 3x12 | Elevação lateral 3x15 | Abdômen 3x20</p>
      <p><strong className="text-foreground">Sexta — Full Lower + HIIT</strong></p>
      <p>• Hip thrust 3x12 | Extensora 3x15 | Flexora 3x15 | 15min HIIT</p>
      <p className="text-xs italic mt-3">* Template Cutting — foco em manutenção muscular e gasto calórico.</p>
    </>
  ),
  recomp: (
    <>
      <p><strong className="text-foreground">Segunda — Peito / Tríceps</strong></p>
      <p>• Supino reto 4x10 | Crucifixo 3x12 | Tríceps corda 3x12</p>
      <p><strong className="text-foreground">Terça — Costas / Bíceps</strong></p>
      <p>• Puxada frontal 4x10 | Remada curvada 3x12 | Rosca direta 3x12</p>
      <p><strong className="text-foreground">Quarta — Pernas</strong></p>
      <p>• Agachamento livre 4x10 | Leg press 3x12 | Extensora 3x15</p>
      <p><strong className="text-foreground">Quinta — Ombros / Abdômen</strong></p>
      <p>• Desenvolvimento 4x10 | Elevação lateral 3x12 | Prancha 3x45s</p>
      <p><strong className="text-foreground">Sexta — Posterior / Glúteos</strong></p>
      <p>• Stiff 4x10 | Cadeira flexora 3x12 | Hip thrust 3x12</p>
      <p className="text-xs italic mt-3">* Template Recomposição — equilíbrio entre força e condicionamento.</p>
    </>
  ),
};

const ProtocolPreviewModal = ({ open, onOpenChange, client }: ProtocolPreviewModalProps) => {
  const [protocolType, setProtocolType] = useState<ProtocolType | null>(null);
  const getField = (field: string) => client.form_data?.[field] || "—";
  const plan = client.plan || client.profile?.plan || "";
  const clientGoal = Array.isArray(client.form_data?.mainGoal)
    ? client.form_data.mainGoal.join(", ")
    : getField("mainGoal");

  const handleClose = (value: boolean) => {
    if (!value) setProtocolType(null);
    onOpenChange(value);
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
            {/* Objetivo como referência */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <span className="text-xs text-muted-foreground uppercase">Objetivo informado pelo cliente (referência)</span>
              <p className="text-sm text-foreground mt-1">{clientGoal}</p>
            </div>

            {/* Seleção de tipo */}
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
            {/* Tipo selecionado */}
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
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Plano Alimentar — {protocolTypeLabels[protocolType]}</h3>
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                {dietTemplates[protocolType]}
              </div>
            </section>

            <Separator />

            {/* Treino */}
            <section>
              <h3 className="text-sm font-semibold uppercase text-primary mb-3">Treino — {protocolTypeLabels[protocolType]}</h3>
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                {trainingTemplates[protocolType]}
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProtocolPreviewModal;
