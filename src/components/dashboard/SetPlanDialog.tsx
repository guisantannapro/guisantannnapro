import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

interface SetPlanDialogProps {
  userId: string;
  currentPlan?: string | null;
  currentPeriod?: string | null;
  onSaved: () => void;
}

const planOptions = [
  { value: "base", label: "Base" },
  { value: "transformacao", label: "Transformação" },
  { value: "elite", label: "Elite" },
];

const periodOptions = [
  { value: "mensal", label: "Mensal (1 mês)", months: 1 },
  { value: "trimestral", label: "Trimestral (3 meses)", months: 3 },
  { value: "semestral", label: "Semestral (6 meses)", months: 6 },
];

const SetPlanDialog = ({ userId, currentPlan, currentPeriod, onSaved }: SetPlanDialogProps) => {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(currentPlan || "");
  const [period, setPeriod] = useState((currentPeriod || "").toLowerCase());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!plan || !period) {
      toast.error("Selecione plano e período");
      return;
    }
    const months = periodOptions.find((p) => p.value === period)?.months;
    if (!months) {
      toast.error("Período inválido");
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const expires = new Date(now);
      expires.setMonth(expires.getMonth() + months);

      const { error } = await supabase
        .from("profiles")
        .update({
          plan,
          plan_duration: period,
          plan_activated_at: now.toISOString(),
          plan_expires_at: expires.toISOString(),
          renewal_starts_at: null,
        })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Plano definido com sucesso");
      setOpen(false);
      onSaved();
    } catch (err: any) {
      console.error("Erro ao definir plano:", err);
      toast.error(err?.message || "Erro ao definir plano");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Pencil className="w-3 h-3 mr-1" />
          {currentPlan ? "Editar Plano" : "Definir Plano"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Definir Plano do Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Plano</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger><SelectValue placeholder="Selecione o plano" /></SelectTrigger>
              <SelectContent>
                {planOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger><SelectValue placeholder="Selecione o período" /></SelectTrigger>
              <SelectContent>
                {periodOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            A data de ativação será hoje e a expiração calculada conforme o período.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetPlanDialog;
