import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dumbbell, Plus, Trash2, Save, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type TrainingLogEntry = {
  id?: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  difficulty: number | null;
  notes: string | null;
  training_date: string;
  protocolo_id: string;
  user_id: string;
  isNew?: boolean;
  isDirty?: boolean;
};

type Props = {
  protocoloId: string;
  userId: string;
  treino: string | null;
};

const difficultyLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Fácil", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  2: { label: "Moderado", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  3: { label: "Normal", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  4: { label: "Difícil", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  5: { label: "Máximo", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

function parseExercisesFromTreino(treino: string): string[] {
  if (!treino) return [];
  const lines = treino.split("\n").map((l) => l.trim()).filter(Boolean);
  const exercises: string[] = [];
  for (const line of lines) {
    // Match lines that look like exercise names (e.g., "1. Supino Reto", "- Leg Press", "Agachamento Livre")
    const match = line.match(/^(?:\d+[\.\)\-\s]*|[\-•]\s*)(.+)/);
    if (match) {
      const name = match[1].trim();
      // Skip lines that are just headers or instructions
      if (name.length > 2 && name.length < 80 && !name.toLowerCase().startsWith("dia ") && !name.toLowerCase().startsWith("técnica") && !name.toLowerCase().startsWith("progressão")) {
        exercises.push(name);
      }
    }
  }
  return exercises;
}

const today = () => new Date().toISOString().split("T")[0];

export default function TrainingLog({ protocoloId, userId, treino }: Props) {
  const [entries, setEntries] = useState<TrainingLogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const exerciseNames = useMemo(() => parseExercisesFromTreino(treino || ""), [treino]);

  useEffect(() => {
    fetchLogs();
  }, [selectedDate, protocoloId]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("training_logs")
      .select("*")
      .eq("protocolo_id", protocoloId)
      .eq("user_id", userId)
      .eq("training_date", selectedDate)
      .order("exercise_name")
      .order("set_number");

    if (error) {
      console.error("Error fetching training logs:", error);
      setEntries([]);
    } else {
      setEntries((data || []).map((d: any) => ({ ...d, isNew: false, isDirty: false })));
    }
    setLoading(false);
  };

  const addExerciseSet = (exerciseName?: string) => {
    const name = exerciseName || "";
    const existingSets = entries.filter((e) => e.exercise_name === name);
    const nextSet = existingSets.length > 0 ? Math.max(...existingSets.map((e) => e.set_number)) + 1 : 1;

    setEntries((prev) => [
      ...prev,
      {
        exercise_name: name,
        set_number: nextSet,
        weight_kg: null,
        reps: null,
        difficulty: null,
        notes: null,
        training_date: selectedDate,
        protocolo_id: protocoloId,
        user_id: userId,
        isNew: true,
        isDirty: true,
      },
    ]);
  };

  const updateEntry = (index: number, field: keyof TrainingLogEntry, value: any) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value, isDirty: true } : e))
    );
  };

  const removeEntry = async (index: number) => {
    const entry = entries[index];
    if (entry.id && !entry.isNew) {
      const { error } = await supabase.from("training_logs").delete().eq("id", entry.id);
      if (error) {
        toast.error("Erro ao excluir registro.");
        return;
      }
    }
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    const dirtyEntries = entries.filter((e) => e.isDirty);
    if (dirtyEntries.length === 0) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setSaving(true);
    try {
      const toInsert = dirtyEntries
        .filter((e) => e.isNew)
        .map(({ isNew, isDirty, id, ...rest }) => rest);

      const toUpdate = dirtyEntries.filter((e) => !e.isNew && e.id);

      if (toInsert.length > 0) {
        const { error } = await supabase.from("training_logs").insert(toInsert);
        if (error) throw error;
      }

      for (const entry of toUpdate) {
        const { isNew, isDirty, ...rest } = entry;
        const { error } = await supabase
          .from("training_logs")
          .update({
            weight_kg: rest.weight_kg,
            reps: rest.reps,
            difficulty: rest.difficulty,
            notes: rest.notes,
            exercise_name: rest.exercise_name,
            set_number: rest.set_number,
          })
          .eq("id", rest.id!);
        if (error) throw error;
      }

      toast.success("Treino salvo com sucesso!");
      await fetchLogs();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Erro ao salvar treino.");
    } finally {
      setSaving(false);
    }
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const hasDirty = entries.some((e) => e.isDirty);

  // Group entries by exercise name
  const groupedEntries = useMemo(() => {
    const groups: Record<string, { entries: TrainingLogEntry[]; indices: number[] }> = {};
    entries.forEach((entry, index) => {
      const key = entry.exercise_name || "Sem nome";
      if (!groups[key]) groups[key] = { entries: [], indices: [] };
      groups[key].entries.push(entry);
      groups[key].indices.push(index);
    });
    return groups;
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" onClick={() => shiftDate(-1)} className="h-8 w-8">
          <ChevronLeft size={16} />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto h-8 text-sm bg-background"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => shiftDate(1)} className="h-8 w-8" disabled={selectedDate >= today()}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Exercise groups */}
          {Object.keys(groupedEntries).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedEntries).map(([exerciseName, group]) => (
                <div key={exerciseName} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{exerciseName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addExerciseSet(exerciseName)}
                      className="h-7 px-2 text-xs gap-1 text-primary"
                    >
                      <Plus size={12} />
                      Série
                    </Button>
                  </div>
                  <div className="divide-y divide-border">
                    {/* Header */}
                    <div className="grid grid-cols-[40px_1fr_1fr_1fr_32px] gap-1 px-3 py-1.5 text-[10px] uppercase text-muted-foreground font-medium">
                      <span>Série</span>
                      <span>Peso (kg)</span>
                      <span>Reps</span>
                      <span>Dific.</span>
                      <span />
                    </div>
                    {group.entries.map((entry, i) => {
                      const globalIdx = group.indices[i];
                      return (
                        <div key={globalIdx} className="grid grid-cols-[40px_1fr_1fr_1fr_32px] gap-1 px-3 py-1.5 items-center">
                          <span className="text-xs text-muted-foreground text-center">{entry.set_number}</span>
                          <Input
                            type="number"
                            placeholder="—"
                            value={entry.weight_kg ?? ""}
                            onChange={(e) => updateEntry(globalIdx, "weight_kg", e.target.value ? Number(e.target.value) : null)}
                            className="h-7 text-xs px-2"
                          />
                          <Input
                            type="number"
                            placeholder="—"
                            value={entry.reps ?? ""}
                            onChange={(e) => updateEntry(globalIdx, "reps", e.target.value ? Number(e.target.value) : null)}
                            className="h-7 text-xs px-2"
                          />
                          <select
                            value={entry.difficulty ?? ""}
                            onChange={(e) => updateEntry(globalIdx, "difficulty", e.target.value ? Number(e.target.value) : null)}
                            className="h-7 text-xs px-1 rounded-md border border-input bg-background text-foreground"
                          >
                            <option value="">—</option>
                            {[1, 2, 3, 4, 5].map((d) => (
                              <option key={d} value={d}>{difficultyLabels[d].label}</option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEntry(globalIdx)}
                            className="h-7 w-7 text-destructive/60 hover:text-destructive"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhum registro para esta data. Adicione exercícios abaixo.
            </p>
          )}

          {/* Quick add from protocol exercises */}
          {exerciseNames.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase">Adicionar do protocolo:</p>
              <div className="flex flex-wrap gap-1.5">
                {exerciseNames.slice(0, 20).map((name) => (
                  <Badge
                    key={name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors text-xs py-1"
                    onClick={() => addExerciseSet(name)}
                  >
                    <Plus size={10} className="mr-1" />
                    {name.length > 25 ? name.slice(0, 25) + "…" : name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Manual add */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const name = prompt("Nome do exercício:");
              if (name?.trim()) addExerciseSet(name.trim());
            }}
            className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Plus size={14} />
            Adicionar exercício manual
          </Button>

          {/* Save */}
          {hasDirty && (
            <Button onClick={saveAll} disabled={saving} className="w-full gap-1.5">
              <Save size={14} />
              {saving ? "Salvando..." : "Salvar Treino"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
