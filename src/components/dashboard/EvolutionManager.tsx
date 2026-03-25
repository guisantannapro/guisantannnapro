import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Evolution {
  id: string;
  title: string;
  description: string | null;
  photo_before: string | null;
  photo_after: string | null;
  weight_before: number | null;
  weight_after: number | null;
  body_fat_before: number | null;
  body_fat_after: number | null;
  created_at: string;
}

interface EvolutionManagerProps {
  clientUserId: string;
}

const EvolutionManager = ({ clientUserId }: EvolutionManagerProps) => {
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weightBefore, setWeightBefore] = useState("");
  const [weightAfter, setWeightAfter] = useState("");
  const [bodyFatBefore, setBodyFatBefore] = useState("");
  const [bodyFatAfter, setBodyFatAfter] = useState("");
  const [photoBefore, setPhotoBefore] = useState<File | null>(null);
  const [photoAfter, setPhotoAfter] = useState<File | null>(null);

  const fetchEvolutions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("client_evolutions")
      .select("*")
      .eq("user_id", clientUserId)
      .order("created_at", { ascending: false });
    setEvolutions(data || []);
    setLoading(false);
  }, [clientUserId]);

  useEffect(() => {
    fetchEvolutions();
  }, [fetchEvolutions]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setWeightBefore("");
    setWeightAfter("");
    setBodyFatBefore("");
    setBodyFatAfter("");
    setPhotoBefore(null);
    setPhotoAfter(null);
  };

  const uploadPhoto = async (file: File, label: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${clientUserId}/${Date.now()}-${label}.${ext}`;
    const { error } = await supabase.storage
      .from("evolution-photos")
      .upload(path, file, { upsert: false });
    if (error) {
      console.error(`Upload error (${label}):`, error);
      return null;
    }
    return path;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Informe um título para a evolução.");
      return;
    }

    setSaving(true);
    try {
      let photoBeforePath: string | null = null;
      let photoAfterPath: string | null = null;

      if (photoBefore) {
        photoBeforePath = await uploadPhoto(photoBefore, "before");
      }
      if (photoAfter) {
        photoAfterPath = await uploadPhoto(photoAfter, "after");
      }

      const { error } = await supabase.from("client_evolutions").insert({
        user_id: clientUserId,
        title: title.trim(),
        description: description.trim() || null,
        photo_before: photoBeforePath,
        photo_after: photoAfterPath,
        weight_before: weightBefore ? parseFloat(weightBefore) : null,
        weight_after: weightAfter ? parseFloat(weightAfter) : null,
        body_fat_before: bodyFatBefore ? parseFloat(bodyFatBefore) : null,
        body_fat_after: bodyFatAfter ? parseFloat(bodyFatAfter) : null,
      });

      if (error) throw error;

      toast.success("Evolução cadastrada com sucesso!");
      resetForm();
      setFormOpen(false);
      fetchEvolutions();
    } catch (err) {
      console.error("Error saving evolution:", err);
      toast.error("Erro ao salvar a evolução.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta evolução?")) return;

    const { error } = await supabase.from("client_evolutions").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
      return;
    }
    toast.success("Evolução excluída.");
    fetchEvolutions();
  };

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold uppercase text-primary flex items-center gap-2">
          <TrendingUp size={16} />
          Evolução (Antes e Depois)
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { resetForm(); setFormOpen(true); }}
          className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
        >
          <Plus size={14} />
          Nova Evolução
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : evolutions.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma evolução cadastrada.</p>
      ) : (
        <div className="space-y-3">
          {evolutions.map((evo) => (
            <div
              key={evo.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">{evo.title}</span>
                <div className="flex flex-wrap gap-2">
                  {evo.weight_before != null && evo.weight_after != null && (
                    <Badge variant="outline" className="text-xs">
                      Peso: {evo.weight_before}kg → {evo.weight_after}kg
                    </Badge>
                  )}
                  {evo.body_fat_before != null && evo.body_fat_after != null && (
                    <Badge variant="outline" className="text-xs">
                      BF: {evo.body_fat_before}% → {evo.body_fat_after}%
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(evo.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(evo.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* New Evolution Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-gradient-gold uppercase">Nova Evolução</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cadastre a evolução do cliente com fotos e métricas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Título *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Mês 1 → Mês 3"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs uppercase text-muted-foreground">Análise Técnica</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a evolução do cliente..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Peso Antes (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weightBefore}
                  onChange={(e) => setWeightBefore(e.target.value)}
                  placeholder="90.0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Peso Depois (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weightAfter}
                  onChange={(e) => setWeightAfter(e.target.value)}
                  placeholder="85.0"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Gordura Antes (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={bodyFatBefore}
                  onChange={(e) => setBodyFatBefore(e.target.value)}
                  placeholder="25.0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Gordura Depois (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={bodyFatAfter}
                  onChange={(e) => setBodyFatAfter(e.target.value)}
                  placeholder="20.0"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Foto Antes</Label>
                <div className="mt-1">
                  {photoBefore ? (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <span className="truncate flex-1">{photoBefore.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => setPhotoBefore(null)}>
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md p-3 hover:border-primary/50 transition-colors">
                      <Upload size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Selecionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setPhotoBefore(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Foto Depois</Label>
                <div className="mt-1">
                  {photoAfter ? (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <span className="truncate flex-1">{photoAfter.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => setPhotoAfter(null)}>
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md p-3 hover:border-primary/50 transition-colors">
                      <Upload size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Selecionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setPhotoAfter(e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? "Salvando..." : "Cadastrar Evolução"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvolutionManager;
