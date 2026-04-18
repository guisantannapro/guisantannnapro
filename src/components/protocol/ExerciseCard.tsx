import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

interface ExerciseCardProps {
  exercise: {
    id: string;
    exercise_name: string;
    metodo: string;
    admin_obs: string;
    client_top_set: string;
    client_back_off: string;
    client_resultado: string;
    client_obs: string;
  };
  isComplementar: boolean;
  isAdmin: boolean;
  savedFields: Set<string>;
  onFieldChange: (id: string, field: string, value: string) => void;
}

const ExerciseCard = ({ exercise: ex, isComplementar, isAdmin, savedFields, onFieldChange }: ExerciseCardProps) => {
  const topSetKey = `${ex.id}-client_top_set`;
  const backOffKey = `${ex.id}-client_back_off`;
  const resultadoKey = `${ex.id}-client_resultado`;
  const obsKey = `${ex.id}-client_obs`;

  return (
    <div className="border border-border rounded-lg p-2.5 space-y-2 bg-card">
      {/* Linha 1: Exercício + (Top Set | Back-off | Obs Coach) */}
      {isComplementar ? (
        <>
          <div className="font-semibold text-sm text-foreground">{ex.exercise_name}</div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/70">Método:</span> {ex.metodo}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-12 gap-1.5 items-start">
          <div className="col-span-4">
            <label className="text-[9px] font-bold uppercase text-muted-foreground mb-1 block">Exercício</label>
            <div className="text-xs font-semibold text-foreground leading-tight pt-1">{ex.exercise_name}</div>
          </div>
          <div className="col-span-3">
            <label className="text-[9px] font-bold uppercase text-muted-foreground mb-1 block">Top Set 6–8</label>
            <div className="relative">
              <Input
                value={ex.client_top_set}
                onChange={(e) => onFieldChange(ex.id, "client_top_set", e.target.value)}
                placeholder="—"
                className="h-7 text-[11px] px-1.5 border-muted bg-background"
                readOnly={isAdmin}
              />
              {savedFields.has(topSetKey) && <CheckCircle size={10} className="absolute right-1 top-2 text-green-500" />}
            </div>
          </div>
          <div className="col-span-3">
            <label className="text-[9px] font-bold uppercase text-muted-foreground mb-1 block">Back-off 8–10</label>
            <div className="relative">
              <Input
                value={ex.client_back_off}
                onChange={(e) => onFieldChange(ex.id, "client_back_off", e.target.value)}
                placeholder="—"
                className="h-7 text-[11px] px-1.5 border-muted bg-background"
                readOnly={isAdmin}
              />
              {savedFields.has(backOffKey) && <CheckCircle size={10} className="absolute right-1 top-2 text-green-500" />}
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-[9px] font-bold uppercase text-muted-foreground mb-1 block">Coach</label>
            <div className="text-[10px] text-muted-foreground italic leading-tight pt-1">
              {ex.admin_obs || "—"}
            </div>
          </div>
        </div>
      )}

      {/* Linha 2 (full width): Resultado + Obs Cliente */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-border/50">
        <div>
          <label className="text-[9px] font-bold uppercase text-muted-foreground mb-1 block">Resultado</label>
          <div className="relative">
            <Input
              value={ex.client_resultado}
              onChange={(e) => onFieldChange(ex.id, "client_resultado", e.target.value)}
              placeholder="—"
              className="h-7 text-[11px] px-1.5 border-muted bg-background"
              readOnly={isAdmin}
            />
            {savedFields.has(resultadoKey) && <CheckCircle size={10} className="absolute right-1 top-2 text-green-500" />}
          </div>
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase text-muted-foreground mb-1 block">Obs Cliente</label>
          <div className="relative">
            <Input
              value={ex.client_obs}
              onChange={(e) => onFieldChange(ex.id, "client_obs", e.target.value)}
              placeholder="—"
              className="h-7 text-[11px] px-1.5 border-muted bg-background"
              readOnly={isAdmin}
            />
            {savedFields.has(obsKey) && <CheckCircle size={10} className="absolute right-1 top-2 text-green-500" />}
          </div>
        </div>
      </div>

      {isComplementar && ex.admin_obs && (
        <div className="text-[10px] text-muted-foreground italic border-t border-border pt-1.5">
          <span className="font-semibold text-foreground/70">Coach:</span> {ex.admin_obs}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
