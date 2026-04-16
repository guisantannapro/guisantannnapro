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
    <div className="border border-border rounded-lg p-3 space-y-3 bg-card">
      <div className="font-medium text-sm text-foreground">{ex.exercise_name}</div>

      {isComplementar ? (
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/70">Método:</span> {ex.metodo}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Top Set (6–8)</label>
            <div className="relative">
              <Input
                value={ex.client_top_set}
                onChange={(e) => onFieldChange(ex.id, "client_top_set", e.target.value)}
                placeholder="—"
                className="h-8 text-xs border-muted bg-background"
                readOnly={isAdmin}
              />
              {savedFields.has(topSetKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Back-off (8–10)</label>
            <div className="relative">
              <Input
                value={ex.client_back_off}
                onChange={(e) => onFieldChange(ex.id, "client_back_off", e.target.value)}
                placeholder="—"
                className="h-8 text-xs border-muted bg-background"
                readOnly={isAdmin}
              />
              {savedFields.has(backOffKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Resultado</label>
          <div className="relative">
            <Input
              value={ex.client_resultado}
              onChange={(e) => onFieldChange(ex.id, "client_resultado", e.target.value)}
              placeholder="—"
              className="h-8 text-xs border-muted bg-background"
              readOnly={isAdmin}
            />
            {savedFields.has(resultadoKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Obs Cliente</label>
          <div className="relative">
            <Input
              value={ex.client_obs}
              onChange={(e) => onFieldChange(ex.id, "client_obs", e.target.value)}
              placeholder="—"
              className="h-8 text-xs border-muted bg-background"
              readOnly={isAdmin}
            />
            {savedFields.has(obsKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
          </div>
        </div>
      </div>

      {ex.admin_obs && (
        <div className="text-xs text-muted-foreground italic border-t border-border pt-2">
          <span className="font-semibold text-foreground/70">Coach:</span> {ex.admin_obs}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
