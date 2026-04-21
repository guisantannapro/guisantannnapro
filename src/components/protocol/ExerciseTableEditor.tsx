import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronUp, Copy } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export interface ExerciseRow {
  id: string;
  exercise_name: string;
  top_set: string;
  back_off: string;
  metodo: string;
  admin_obs: string;
  table_type: "standard" | "complementar";
}

export interface DayBlock {
  id: string;
  day_label: string;
  table_type: "standard" | "complementar";
  exercises: ExerciseRow[];
}

interface ExerciseTableEditorProps {
  days: DayBlock[];
  onChange: (days: DayBlock[]) => void;
  weeks: number;
  onWeeksChange: (w: number) => void;
}

const uid = () => crypto.randomUUID();

const DEFAULT_DAYS: DayBlock[] = [
  {
    id: uid(), day_label: "SEGUNDA – PUSH", table_type: "standard",
    exercises: [
      { id: uid(), exercise_name: "Supino reto com halter", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Supino inclinado", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Desenvolvimento", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Tríceps corda", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
      { id: uid(), exercise_name: "Crucifixo máquina", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
    ],
  },
  {
    id: uid(), day_label: "TERÇA – PULL", table_type: "standard",
    exercises: [
      { id: uid(), exercise_name: "Puxada frontal", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Remada barra", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Remada unilateral", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Rosca barra", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Rosca concentrada", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
    ],
  },
  {
    id: uid(), day_label: "QUARTA – LEGS", table_type: "standard",
    exercises: [
      { id: uid(), exercise_name: "Agachamento", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Leg press", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Extensora", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
      { id: uid(), exercise_name: "Flexora", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
      { id: uid(), exercise_name: "Panturrilha", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
    ],
  },
  {
    id: uid(), day_label: "QUINTA – PUSH", table_type: "standard",
    exercises: [
      { id: uid(), exercise_name: "Supino inclinado", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Paralelas", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Elevação lateral", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
      { id: uid(), exercise_name: "Tríceps halter", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Peck deck", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
    ],
  },
  {
    id: uid(), day_label: "SEXTA – PULL", table_type: "standard",
    exercises: [
      { id: uid(), exercise_name: "Puxada frontal", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Remada curvada", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Pulldown", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
      { id: uid(), exercise_name: "Rosca martelo", top_set: "", back_off: "", metodo: "", admin_obs: "", table_type: "standard" },
      { id: uid(), exercise_name: "Rosca direta", top_set: "", back_off: "", metodo: "", admin_obs: "Rest-pause", table_type: "standard" },
    ],
  },
  {
    id: uid(), day_label: "SÁBADO – COMPLEMENTAR", table_type: "complementar",
    exercises: [
      { id: uid(), exercise_name: "Extensão lombar", top_set: "", back_off: "", metodo: "Controle (3x10-12)", admin_obs: "", table_type: "complementar" },
      { id: uid(), exercise_name: "Extensão lombar carga", top_set: "", back_off: "", metodo: "Controle (3x10-12)", admin_obs: "", table_type: "complementar" },
      { id: uid(), exercise_name: "Glúteo abdução", top_set: "", back_off: "", metodo: "Rest-pause", admin_obs: "", table_type: "complementar" },
      { id: uid(), exercise_name: "Encolhimento", top_set: "", back_off: "", metodo: "Top Set (6–8) Back-off", admin_obs: "", table_type: "complementar" },
      { id: uid(), exercise_name: "Face pull", top_set: "", back_off: "", metodo: "Rest-pause", admin_obs: "", table_type: "complementar" },
    ],
  },
];

export { DEFAULT_DAYS };

const ExerciseTableEditor = ({ days, onChange, weeks, onWeeksChange }: ExerciseTableEditorProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (dayId: string) => {
    setCollapsed(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const updateDay = (dayId: string, field: keyof DayBlock, value: any) => {
    onChange(days.map(d => d.id === dayId ? { ...d, [field]: value } : d));
  };

  const addExercise = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    const newEx: ExerciseRow = {
      id: uid(),
      exercise_name: "",
      top_set: "",
      back_off: "",
      metodo: "",
      admin_obs: "",
      table_type: day.table_type,
    };
    onChange(days.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d));
  };

  const removeExercise = (dayId: string, exId: string) => {
    onChange(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d));
  };

  const updateExercise = (dayId: string, exId: string, field: keyof ExerciseRow, value: string) => {
    onChange(days.map(d => d.id === dayId ? {
      ...d,
      exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e),
    } : d));
  };

  const addDay = () => {
    const newDay: DayBlock = {
      id: uid(),
      day_label: "",
      table_type: "standard",
      exercises: [],
    };
    onChange([...days, newDay]);
  };

  const removeDay = (dayId: string) => {
    onChange(days.filter(d => d.id !== dayId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold uppercase text-primary">
          🏋️ Treino — Logbook (4 semanas)
        </h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((w) => (
            <Button
              key={w}
              type="button"
              variant={w === 1 ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              disabled
              title="As 4 semanas serão criadas automaticamente"
            >
              Semana {w}
            </Button>
          ))}
        </div>
      </div>

      {days.map((day, dayIdx) => (
        <div key={day.id} className="border border-border rounded-lg overflow-hidden">
          {/* Day header */}
          <div
            className="flex items-center gap-2 px-3 py-2 bg-muted/50 cursor-pointer"
            onClick={() => toggleCollapse(day.id)}
          >
            {collapsed[day.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <Input
              value={day.day_label}
              onChange={(e) => { e.stopPropagation(); updateDay(day.id, "day_label", e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Ex: SEGUNDA – PUSH"
              className="h-7 text-xs font-bold uppercase bg-transparent border-none px-1 flex-1"
            />
            <Select
              value={day.table_type}
              onValueChange={(v) => {
                updateDay(day.id, "table_type", v);
                // Update all exercises in this day
                onChange(days.map(d => d.id === day.id ? {
                  ...d,
                  table_type: v as "standard" | "complementar",
                  exercises: d.exercises.map(e => ({ ...e, table_type: v as "standard" | "complementar" })),
                } : d));
              }}
            >
              <SelectTrigger className="w-32 h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="complementar">Complementar</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); removeDay(day.id); }}>
              <Trash2 size={12} />
            </Button>
          </div>

          {/* Exercises table */}
          {!collapsed[day.id] && (
            <div className="p-2">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="h-8 text-xs">Exercício</TableHead>
                    {day.table_type === "standard" ? (
                      <>
                        <TableHead className="h-8 text-xs w-28">Top Set (6–8)</TableHead>
                        <TableHead className="h-8 text-xs w-28">Back-off (8–10)</TableHead>
                      </>
                    ) : (
                      <TableHead className="h-8 text-xs w-40">Método</TableHead>
                    )}
                    <TableHead className="h-8 text-xs w-28">Obs (Coach)</TableHead>
                    <TableHead className="h-8 text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {day.exercises.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell className="p-1">
                        <Input
                          value={ex.exercise_name}
                          onChange={(e) => updateExercise(day.id, ex.id, "exercise_name", e.target.value)}
                          placeholder="Nome do exercício"
                          className="h-7 text-xs border-muted"
                        />
                      </TableCell>
                      {day.table_type === "standard" ? (
                        <>
                          <TableCell className="p-1">
                            <Input
                              value={ex.top_set}
                              onChange={(e) => updateExercise(day.id, ex.id, "top_set", e.target.value)}
                              placeholder="—"
                              className="h-7 text-xs border-muted"
                            />
                          </TableCell>
                          <TableCell className="p-1">
                            <Input
                              value={ex.back_off}
                              onChange={(e) => updateExercise(day.id, ex.id, "back_off", e.target.value)}
                              placeholder="—"
                              className="h-7 text-xs border-muted"
                            />
                          </TableCell>
                        </>
                      ) : (
                        <TableCell className="p-1">
                          <Input
                            value={ex.metodo}
                            onChange={(e) => updateExercise(day.id, ex.id, "metodo", e.target.value)}
                            placeholder="Ex: Rest-pause"
                            className="h-7 text-xs border-muted"
                          />
                        </TableCell>
                      )}
                      <TableCell className="p-1">
                        <Input
                          value={ex.admin_obs}
                          onChange={(e) => updateExercise(day.id, ex.id, "admin_obs", e.target.value)}
                          placeholder="—"
                          className="h-7 text-xs border-muted"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive" onClick={() => removeExercise(day.id, ex.id)}>
                          <Trash2 size={11} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="ghost" size="sm" className="mt-1 text-xs text-muted-foreground gap-1" onClick={() => addExercise(day.id)}>
                <Plus size={12} /> Adicionar exercício
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={addDay}>
        <Plus size={12} /> Adicionar dia
      </Button>
    </div>
  );
};

export default ExerciseTableEditor;
