import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Send, Star } from "lucide-react";

interface FeedbackFormProps {
  userId: string;
  onSuccess: () => void;
}

const FeedbackForm = ({ userId, onSuccess }: FeedbackFormProps) => {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Escreva uma mensagem antes de enviar.");
      return;
    }
    if (message.trim().length > 1000) {
      toast.error("A mensagem deve ter no máximo 1000 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("client_feedbacks" as any).insert({
        user_id: userId,
        message: message.trim(),
        rating,
      } as any);

      if (error) throw error;

      toast.success("Feedback enviado com sucesso!");
      setMessage("");
      setRating(7);
      onSuccess();
    } catch (err) {
      console.error("Feedback error:", err);
      toast.error("Erro ao enviar feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingColor = () => {
    if (rating <= 3) return "text-destructive";
    if (rating <= 6) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Como está se sentindo? Dificuldades, sugestões...
        </label>
        <Textarea
          placeholder="Escreva livremente sobre como está sendo sua experiência..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">{message.length}/1000</p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          <Star size={14} className="inline mr-1.5" />
          Nota de satisfação
        </label>
        <div className="flex items-center gap-4">
          <Slider
            value={[rating]}
            onValueChange={(v) => setRating(v[0])}
            min={1}
            max={10}
            step={1}
            className="flex-1"
          />
          <span className={`text-2xl font-bold min-w-[2ch] text-right ${getRatingColor()}`}>
            {rating}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Insatisfeito</span>
          <span>Muito satisfeito</span>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5">
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {submitting ? "Enviando..." : "Enviar Feedback"}
      </Button>
    </div>
  );
};

export default FeedbackForm;
