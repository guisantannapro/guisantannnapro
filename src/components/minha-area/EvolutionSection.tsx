import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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

interface EvolutionSectionProps {
  evolutions: Evolution[];
}

const getSignedUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from("evolution-photos")
    .createSignedUrl(path, 3600);
  return data?.signedUrl || null;
};

const MetricComparison = ({
  label,
  before,
  after,
  unit,
}: {
  label: string;
  before: number;
  after: number;
  unit: string;
}) => {
  const diff = after - before;
  const sign = diff > 0 ? "+" : "";
  const color = diff < 0 ? "text-green-500" : diff > 0 ? "text-yellow-500" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium">
        {before}{unit} → {after}{unit}
      </span>
      <Badge variant="outline" className={`text-xs ${color}`}>
        {sign}{diff.toFixed(1)}{unit}
      </Badge>
    </div>
  );
};

const EvolutionCard = ({ evolution }: { evolution: Evolution }) => {
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (evolution.photo_before) {
      getSignedUrl(evolution.photo_before).then(setBeforeUrl);
    }
    if (evolution.photo_after) {
      getSignedUrl(evolution.photo_after).then(setAfterUrl);
    }
  }, [evolution.photo_before, evolution.photo_after]);

  const hasWeight = evolution.weight_before != null && evolution.weight_after != null;
  const hasBodyFat = evolution.body_fat_before != null && evolution.body_fat_after != null;
  const hasPhotos = evolution.photo_before || evolution.photo_after;

  return (
    <div className="border border-border rounded-lg p-5 space-y-4 hover:border-primary/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-foreground font-semibold text-base">{evolution.title}</h3>
        <span className="text-xs text-muted-foreground">
          {new Date(evolution.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>

      {hasPhotos && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Antes</span>
            {evolution.photo_before ? (
              beforeUrl ? (
                <a href={beforeUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={beforeUrl}
                    alt="Antes"
                    className="w-full aspect-[3/4] object-cover rounded-md border border-border hover:border-primary/50 transition-colors"
                  />
                </a>
              ) : (
                <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted animate-pulse" />
              )
            ) : (
              <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                Sem foto
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Depois</span>
            {evolution.photo_after ? (
              afterUrl ? (
                <a href={afterUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={afterUrl}
                    alt="Depois"
                    className="w-full aspect-[3/4] object-cover rounded-md border border-border hover:border-primary/50 transition-colors"
                  />
                </a>
              ) : (
                <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted animate-pulse" />
              )
            ) : (
              <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                Sem foto
              </div>
            )}
          </div>
        </div>
      )}

      {(hasWeight || hasBodyFat) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {hasWeight && (
            <MetricComparison
              label="Peso"
              before={evolution.weight_before!}
              after={evolution.weight_after!}
              unit="kg"
            />
          )}
          {hasBodyFat && (
            <MetricComparison
              label="Gordura"
              before={evolution.body_fat_before!}
              after={evolution.body_fat_after!}
              unit="%"
            />
          )}
        </div>
      )}

      {evolution.description && (
        <div className="bg-muted/50 rounded-md p-4 border border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Análise Técnica</p>
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {evolution.description}
          </p>
        </div>
      )}
    </div>
  );
};

const EvolutionSection = ({ evolutions }: EvolutionSectionProps) => {
  if (evolutions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 }}
      className="bg-card border border-border rounded-lg p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold uppercase text-foreground">Minha Evolução</h2>
      </div>

      <div className="space-y-5">
        {evolutions.map((evo) => (
          <EvolutionCard key={evo.id} evolution={evo} />
        ))}
      </div>
    </motion.div>
  );
};

export default EvolutionSection;
