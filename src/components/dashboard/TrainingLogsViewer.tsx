import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const difficultyLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Fácil", color: "bg-green-500/20 text-green-400" },
  2: { label: "Moderado", color: "bg-blue-500/20 text-blue-400" },
  3: { label: "Normal", color: "bg-yellow-500/20 text-yellow-400" },
  4: { label: "Difícil", color: "bg-orange-500/20 text-orange-400" },
  5: { label: "Máximo", color: "bg-red-500/20 text-red-400" },
};

type Props = {
  userId: string;
};

export default function TrainingLogsViewer({ userId }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("training_logs")
        .select("*")
        .eq("user_id", userId)
        .order("training_date", { ascending: false })
        .order("exercise_name")
        .order("set_number")
        .limit(200);
      setLogs(data || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Diário de Treino</h3>
        </div>
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase text-foreground">Diário de Treino</h3>
        </div>
        <p className="text-muted-foreground text-xs">Nenhum registro de treino ainda.</p>
      </div>
    );
  }

  // Group by date
  const byDate: Record<string, any[]> = {};
  for (const log of logs) {
    const d = log.training_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(log);
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Dumbbell className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase text-foreground">Diário de Treino</h3>
      </div>

      {Object.entries(byDate).slice(0, 10).map(([date, dateLogs]) => {
        // Group by exercise
        const byExercise: Record<string, any[]> = {};
        for (const log of dateLogs) {
          if (!byExercise[log.exercise_name]) byExercise[log.exercise_name] = [];
          byExercise[log.exercise_name].push(log);
        }

        return (
          <div key={date} className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={12} />
              {new Date(date + "T12:00:00").toLocaleDateString("pt-BR")}
            </div>
            <div className="space-y-2 pl-2 border-l-2 border-primary/20">
              {Object.entries(byExercise).map(([name, sets]) => (
                <div key={name} className="space-y-1">
                  <span className="text-xs font-medium text-foreground">{name}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sets.map((s: any) => (
                      <Badge key={s.id} variant="outline" className="text-[10px] py-0.5 gap-1">
                        S{s.set_number}
                        {s.weight_kg != null && ` ${s.weight_kg}kg`}
                        {s.reps != null && ` ×${s.reps}`}
                        {s.difficulty != null && (
                          <span className={`px-1 rounded ${difficultyLabels[s.difficulty]?.color || ""}`}>
                            {difficultyLabels[s.difficulty]?.label || s.difficulty}
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
