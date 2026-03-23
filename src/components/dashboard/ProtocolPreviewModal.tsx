import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

interface ProtocolPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientData;
}

const ProtocolPreviewModal = ({ open, onOpenChange, client }: ProtocolPreviewModalProps) => {
  const getField = (field: string) => client.form_data?.[field] || "—";
  const plan = client.plan || client.profile?.plan || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient-gold uppercase">
            Protocolo — {getField("fullName")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4 text-foreground">
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
                <span className="text-xs text-muted-foreground uppercase">Objetivo</span>
                <p>{Array.isArray(client.form_data?.mainGoal) ? client.form_data.mainGoal.join(", ") : getField("mainGoal")}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Plano Alimentar */}
          <section>
            <h3 className="text-sm font-semibold uppercase text-primary mb-3">Plano Alimentar</h3>
            <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-2">
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
              <p className="text-xs italic mt-3">* Template exemplo — substituir pelo plano personalizado do cliente.</p>
            </div>
          </section>

          <Separator />

          {/* Treino */}
          <section>
            <h3 className="text-sm font-semibold uppercase text-primary mb-3">Treino</h3>
            <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-2">
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
              <p className="text-xs italic mt-3">* Template exemplo — substituir pelo treino personalizado do cliente.</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProtocolPreviewModal;
