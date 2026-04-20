import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, CloudOff, RefreshCw, Cloud } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileDayAccordion from "./MobileDayAccordion";
import { enqueueEdit, getAllQueued, removeQueued, queueSize } from "@/lib/offlineQueue";
import { toast } from "sonner";

interface ExerciseData {
  id: string;
  protocolo_id: string;
  user_id: string;
  week_number: number;
  day_label: string;
  sort_order: number;
  table_type: string;
  exercise_name: string;
  metodo: string;
  admin_obs: string;
  client_top_set: string;
  client_back_off: string;
  client_resultado: string;
  client_obs: string;
  client_carga_rep: string;
}

interface InteractiveTrainingTableProps {
  protocoloId: string;
  userId: string;
  isAdmin?: boolean;
  regrasGerais?: string;
}

const InteractiveTrainingTable = ({ protocoloId, userId, isAdmin = false, regrasGerais }: InteractiveTrainingTableProps) => {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase
        .from("protocol_exercises")
        .select("*")
        .eq("protocolo_id", protocoloId)
        .order("week_number")
        .order("sort_order");

      if (error) {
        console.error("Error fetching exercises:", error);
        setLoading(false);
        return;
      }
      setExercises((data as any[]) || []);
      setLoading(false);
    };
    fetchExercises();
  }, [protocoloId]);

  const handleClientFieldChange = useCallback((exerciseId: string, field: string, value: string) => {
    setExercises(prev => prev.map(e => e.id === exerciseId ? { ...e, [field]: value } : e));

    const key = `${exerciseId}-${field}`;
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(async () => {
      const { error } = await supabase
        .from("protocol_exercises")
        .update({ [field]: value } as any)
        .eq("id", exerciseId);
      if (error) {
        console.error("Erro ao salvar:", error);
        return;
      }
      setSavedFields(prev => new Set(prev).add(key));
      setTimeout(() => setSavedFields(prev => { const n = new Set(prev); n.delete(key); return n; }), 2000);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (exercises.length === 0) return null;

  const weeks = [...new Set(exercises.map(e => e.week_number))].sort((a, b) => a - b);

  const groupByDay = (weekExercises: ExerciseData[]) => {
    const dayMap = new Map<string, ExerciseData[]>();
    weekExercises.forEach(e => {
      const arr = dayMap.get(e.day_label) || [];
      arr.push(e);
      dayMap.set(e.day_label, arr);
    });
    return dayMap;
  };

  return (
    <div className="space-y-3 w-full">
      {regrasGerais && (
        <details className="pdf-section pdf-collapsible w-full" data-pdf-section data-pdf-collapsible>
          <summary className="pdf-section-header pdf-collapsible-summary">
            <span className="pdf-section-icon">📋</span>
            <h3 className="pdf-section-title">TREINO - REGRAS GERAIS</h3>
            <span className="pdf-collapsible-chevron" aria-hidden="true">▾</span>
          </summary>
          <div className="pdf-section-body text-sm" style={{ whiteSpace: "pre-line" }}>
            {regrasGerais}
          </div>
        </details>
      )}

      <details className="pdf-section pdf-collapsible w-full" data-pdf-section data-pdf-collapsible>
        <summary className="pdf-section-header pdf-collapsible-summary">
          <span className="pdf-section-icon">🏋️</span>
          <h3 className="pdf-section-title flex-1">TREINO - LOGBOOK {weeks.length} SEMANA{weeks.length > 1 ? "S" : ""}</h3>
          <span className="pdf-collapsible-chevron" aria-hidden="true">▾</span>
        </summary>
        <div className="pdf-section-body space-y-6">
          {weeks.filter(w => w === selectedWeek).map(weekNum => {
            const weekExercises = exercises.filter(e => e.week_number === weekNum);
            const dayMap = groupByDay(weekExercises);

            return (
              <div key={weekNum} className="space-y-4" data-pdf-section>
                <div className="flex items-center justify-between gap-3 border-b border-primary/20 pb-2">
                  <h4 className="text-lg font-bold uppercase text-primary">
                    📅 SEMANA {weekNum}
                  </h4>
                  {weeks.length > 1 && (
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      data-html2canvas-ignore="true"
                      className="print:hidden h-8 rounded-md border border-primary/40 bg-background text-foreground text-xs font-semibold uppercase px-2 cursor-pointer hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {weeks.map(w => (
                        <option key={w} value={w}>Semana {w}</option>
                      ))}
                    </select>
                  )}
                </div>

                {isMobile ? (
                  <div className="space-y-2">
                    {[...dayMap.entries()].map(([dayLabel, dayExercises]) => (
                      <MobileDayAccordion
                        key={dayLabel}
                        dayLabel={dayLabel}
                        exercises={dayExercises as any}
                        isAdmin={isAdmin}
                        savedFields={savedFields}
                        defaultOpen={false}
                        onFieldChange={handleClientFieldChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...dayMap.entries()].map(([dayLabel, dayExercises]) => {
                      const tableType = dayExercises[0]?.table_type || "standard";
                      const isComplementar = tableType === "complementar";

                      return (
                        <details key={dayLabel} className="border border-border rounded-lg overflow-hidden bg-card/40">
                          <summary className="cursor-pointer select-none flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                            <span className="inline-block w-3 h-3 rounded-full bg-primary" />
                            <h5 className="text-sm font-bold uppercase text-foreground flex-1">
                              {dayLabel}
                            </h5>
                            <span className="pdf-collapsible-chevron" aria-hidden="true">▾</span>
                          </summary>
                          <div className="p-3">
                            <div className="border border-border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="text-xs font-bold h-9 min-w-[180px]">Exercício</TableHead>
                                    {isComplementar ? (
                                      <>
                                        <TableHead className="text-xs font-bold h-9 min-w-[140px]">Método</TableHead>
                                        <TableHead className="text-xs font-bold h-9 w-32">Carga/Rep</TableHead>
                                      </>
                                    ) : (
                                      <>
                                        <TableHead className="text-xs font-bold h-9 w-28">Top Set (6–8)</TableHead>
                                        <TableHead className="text-xs font-bold h-9 w-28">Back-off (8–10)</TableHead>
                                      </>
                                    )}
                                    {!isComplementar && (
                                      <TableHead className="text-xs font-bold h-9 w-28">Resultado</TableHead>
                                    )}
                                    <TableHead className="text-xs font-bold h-9 w-32">Obs Cliente</TableHead>
                                    <TableHead className="text-xs font-bold h-9 min-w-[120px]">Obs (Coach)</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {dayExercises.map(ex => {
                                    const topSetKey = `${ex.id}-client_top_set`;
                                    const backOffKey = `${ex.id}-client_back_off`;
                                    const resultadoKey = `${ex.id}-client_resultado`;
                                    const obsKey = `${ex.id}-client_obs`;

                                    return (
                                      <TableRow key={ex.id} className="hover:bg-muted/30">
                                        <TableCell className="text-sm font-medium py-2 min-w-[180px] whitespace-normal break-words">
                                          {ex.exercise_name}
                                        </TableCell>
                                        {isComplementar ? (
                                          <>
                                            <TableCell className="text-sm text-muted-foreground py-2">
                                              {ex.metodo}
                                            </TableCell>
                                            <TableCell className="py-1">
                                              <div className="relative">
                                                <Input
                                                  value={ex.client_carga_rep || ""}
                                                  onChange={(e) => handleClientFieldChange(ex.id, "client_carga_rep", e.target.value)}
                                                  placeholder="—"
                                                  className="h-8 text-xs border-muted bg-background"
                                                  readOnly={isAdmin}
                                                />
                                                {savedFields.has(`${ex.id}-client_carga_rep`) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
                                              </div>
                                            </TableCell>
                                          </>
                                        ) : (
                                          <>
                                            <TableCell className="py-1">
                                              <div className="relative">
                                                <Input
                                                  value={ex.client_top_set}
                                                  onChange={(e) => handleClientFieldChange(ex.id, "client_top_set", e.target.value)}
                                                  placeholder="—"
                                                  className="h-8 text-xs border-muted bg-background"
                                                  readOnly={isAdmin}
                                                />
                                                {savedFields.has(topSetKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
                                              </div>
                                            </TableCell>
                                            <TableCell className="py-1">
                                              <div className="relative">
                                                <Input
                                                  value={ex.client_back_off}
                                                  onChange={(e) => handleClientFieldChange(ex.id, "client_back_off", e.target.value)}
                                                  placeholder="—"
                                                  className="h-8 text-xs border-muted bg-background"
                                                  readOnly={isAdmin}
                                                />
                                                {savedFields.has(backOffKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
                                              </div>
                                            </TableCell>
                                            <TableCell className="py-1">
                                              <div className="relative">
                                                <Input
                                                  value={ex.client_resultado}
                                                  onChange={(e) => handleClientFieldChange(ex.id, "client_resultado", e.target.value)}
                                                  placeholder="—"
                                                  className="h-8 text-xs border-muted bg-background"
                                                  readOnly={isAdmin}
                                                />
                                                {savedFields.has(resultadoKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
                                              </div>
                                            </TableCell>
                                          </>
                                        )}
                                        <TableCell className="py-1">
                                          <div className="relative">
                                            <Input
                                              value={ex.client_obs}
                                              onChange={(e) => handleClientFieldChange(ex.id, "client_obs", e.target.value)}
                                              placeholder="—"
                                              className="h-8 text-xs border-muted bg-background"
                                              readOnly={isAdmin}
                                            />
                                            {savedFields.has(obsKey) && <CheckCircle size={12} className="absolute right-2 top-2 text-green-500" />}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground italic py-2">
                                          {ex.admin_obs || "—"}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
};

export default InteractiveTrainingTable;
