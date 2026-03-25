import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Camera, Scale, Upload, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CheckinFormProps {
  userId: string;
  onSuccess: () => void;
}

const CheckinForm = ({ userId, onSuccess }: CheckinFormProps) => {
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<{ front: File | null; side: File | null; back: File | null }>({
    front: null, side: null, back: null,
  });
  const [previews, setPreviews] = useState<{ front: string | null; side: string | null; back: string | null }>({
    front: null, side: null, back: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (type: "front" | "side" | "back", file: File | null) => {
    setPhotos((prev) => ({ ...prev, [type]: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [type]: url }));
    } else {
      setPreviews((prev) => ({ ...prev, [type]: null }));
    }
  };

  const uploadPhoto = async (file: File, type: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/checkin-${Date.now()}-${type}.${ext}`;
    const { error } = await supabase.storage.from("client-photos").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    return path;
  };

  const handleSubmit = async () => {
    if (!weight && !photos.front && !photos.side && !photos.back) {
      toast.error("Preencha pelo menos o peso ou envie uma foto.");
      return;
    }

    setSubmitting(true);
    try {
      let photoFront: string | null = null;
      let photoSide: string | null = null;
      let photoBack: string | null = null;

      if (photos.front) photoFront = await uploadPhoto(photos.front, "front");
      if (photos.side) photoSide = await uploadPhoto(photos.side, "side");
      if (photos.back) photoBack = await uploadPhoto(photos.back, "back");

      const { error } = await supabase.from("client_checkins" as any).insert({
        user_id: userId,
        weight: weight ? parseFloat(weight) : null,
        photo_front: photoFront,
        photo_side: photoSide,
        photo_back: photoBack,
        notes: notes || null,
      } as any);

      if (error) throw error;

      toast.success("Check-in enviado com sucesso!");
      setWeight("");
      setNotes("");
      setPhotos({ front: null, side: null, back: null });
      setPreviews({ front: null, side: null, back: null });
      onSuccess();
    } catch (err) {
      console.error("Checkin error:", err);
      toast.error("Erro ao enviar check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  const photoTypes = [
    { key: "front" as const, label: "Frente" },
    { key: "side" as const, label: "Lado" },
    { key: "back" as const, label: "Costas" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          <Scale size={14} className="inline mr-1.5" />
          Peso atual (kg)
        </label>
        <Input
          type="number"
          step="0.1"
          placeholder="Ex: 78.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          <Camera size={14} className="inline mr-1.5" />
          Fotos de acompanhamento
        </label>
        <div className="grid grid-cols-3 gap-3">
          {photoTypes.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <label className="block cursor-pointer">
                {previews[key] ? (
                  <div className="relative group">
                    <img
                      src={previews[key]!}
                      alt={label}
                      className="w-full aspect-[3/4] object-cover rounded-md border border-border"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs">Trocar</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] rounded-md border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 bg-muted/30">
                    <Upload size={16} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Enviar</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(key, e.target.files?.[0] || null)}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Observações (opcional)</label>
        <Textarea
          placeholder="Como está se sentindo, mudanças percebidas..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5">
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {submitting ? "Enviando..." : "Enviar Check-in"}
      </Button>
    </div>
  );
};

export default CheckinForm;
