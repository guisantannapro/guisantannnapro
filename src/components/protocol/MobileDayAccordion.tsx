import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, CheckCircle } from "lucide-react";

interface ExerciseData {
  id: string;
  exercise_name: string;
  metodo: string | null;
  admin_obs: string | null;
  client_top_set: string | null;
  client_back_off: string | null;
  client_obs: string | null;
  client_carga_rep: string | null;
  table_type: string;
}

interface MobileDayAccordionProps {
  dayLabel: string;
  exercises: ExerciseData[];
  isAdmin: boolean;
  savedFields: Set<string>;
  defaultOpen?: boolean;
  onFieldChange: (id: string, field: string, value: string) => void;
}

const MobileDayAccordion = ({
  dayLabel,
  exercises,
  isAdmin,
  savedFields,
  defaultOpen = false,
  onFieldChange,
}: MobileDayAccordionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  const tableType = exercises[0]?.table_type || "standard";
  const isComplementar = tableType === "complementar";

  // A "Obs Cliente do dia" é armazenada no client_obs do último exercício do dia
  const lastExercise = exercises[exercises.length - 1];
  const dayObsKey = lastExercise ? `${lastExercise.id}-client_obs` : "";
  const dayObsValue = lastExercise?.client_obs || "";

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-sm font-bold uppercase text-foreground tracking-wide">
            {dayLabel}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            ({exercises.length})
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="p-2.5 space-y-2">
          {/* Cabeçalho de colunas (apenas standard) */}
          {!isComplementar && (
            <div className="grid grid-cols-12 gap-1.5 px-1 pb-1 border-b border-border/50">
              <div className="col-span-4 text-[9px] font-bold uppercase text-muted-foreground">
                Exercício
              </div>
              <div className="col-span-3 text-[9px] font-bold uppercase text-muted-foreground">
                Top Set 6–8
              </div>
              <div className="col-span-3 text-[9px] font-bold uppercase text-muted-foreground">
                Back-off 8–10
              </div>
              <div className="col-span-2 text-[9px] font-bold uppercase text-muted-foreground">
                Coach
              </div>
            </div>
          )}

          {exercises.map((ex) => {
            const topSetKey = `${ex.id}-client_top_set`;
            const backOffKey = `${ex.id}-client_back_off`;

            if (isComplementar) {
              const cargaKey = `${ex.id}-client_carga_rep`;
              return (
                <div
                  key={ex.id}
                  className="border border-border/60 rounded-md p-2 space-y-1.5 bg-background/50"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground leading-tight">
                        {ex.exercise_name}
                      </div>
                      {ex.metodo && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {ex.metodo}
                        </div>
                      )}
                    </div>
                    <div className="w-24 shrink-0">
                      <label className="text-[9px] font-bold uppercase text-muted-foreground block leading-none mb-0.5">
                        Carga/Rep
                      </label>
                      <div className="relative">
                        <Input
                          value={ex.client_carga_rep || ""}
                          onChange={(e) =>
                            onFieldChange(ex.id, "client_carga_rep", e.target.value)
                          }
                          placeholder="—"
                          className="h-7 text-[11px] px-1.5 border-muted bg-background"
                          readOnly={isAdmin}
                        />
                        {savedFields.has(cargaKey) && (
                          <CheckCircle
                            size={10}
                            className="absolute right-1 top-2 text-green-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  {ex.admin_obs && (
                    <div className="text-[10px] text-muted-foreground italic">
                      <span className="font-semibold text-foreground/70">Coach:</span>{" "}
                      {ex.admin_obs}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={ex.id}
                className="grid grid-cols-12 gap-1.5 items-center py-1 border-b border-border/30 last:border-0"
              >
                <div className="col-span-4 text-[11px] font-medium text-foreground leading-tight">
                  {ex.exercise_name}
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <Input
                      value={ex.client_top_set || ""}
                      onChange={(e) =>
                        onFieldChange(ex.id, "client_top_set", e.target.value)
                      }
                      placeholder="—"
                      className="h-7 text-[11px] px-1.5 border-muted bg-background"
                      readOnly={isAdmin}
                    />
                    {savedFields.has(topSetKey) && (
                      <CheckCircle
                        size={10}
                        className="absolute right-1 top-2 text-green-500"
                      />
                    )}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <Input
                      value={ex.client_back_off || ""}
                      onChange={(e) =>
                        onFieldChange(ex.id, "client_back_off", e.target.value)
                      }
                      placeholder="—"
                      className="h-7 text-[11px] px-1.5 border-muted bg-background"
                      readOnly={isAdmin}
                    />
                    {savedFields.has(backOffKey) && (
                      <CheckCircle
                        size={10}
                        className="absolute right-1 top-2 text-green-500"
                      />
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-[10px] text-muted-foreground italic leading-tight">
                  {ex.admin_obs || "—"}
                </div>
              </div>
            );
          })}

          {/* Obs Cliente do dia (única, no final) */}
          {lastExercise && (
            <div className="pt-2 border-t border-border/50">
              <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">
                Obs Cliente (do dia)
              </label>
              <div className="relative">
                <Textarea
                  value={dayObsValue}
                  onChange={(e) =>
                    onFieldChange(lastExercise.id, "client_obs", e.target.value)
                  }
                  placeholder="Como foi o treino hoje? Sensações, ajustes, etc."
                  className="min-h-[60px] text-[11px] px-2 py-1.5 border-muted bg-background resize-none"
                  readOnly={isAdmin}
                />
                {savedFields.has(dayObsKey) && (
                  <CheckCircle
                    size={12}
                    className="absolute right-2 top-2 text-green-500"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileDayAccordion;
