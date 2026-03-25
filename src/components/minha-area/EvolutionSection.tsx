import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";

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

const addWatermark = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const text = "guisantannapro consultoria";
  const fontSize = Math.max(12, Math.floor(canvas.width * 0.018));
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, canvas.width - 16, canvas.height - 12);
};

const EvolutionCard = ({ evolution }: { evolution: Evolution }) => {
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1a1a1a",
        logging: false,
      });
      addWatermark(canvas);
      const link = document.createElement("a");
      link.download = `evolucao-${evolution.title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-5 space-y-4 hover:border-primary/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-foreground font-semibold text-base">{evolution.title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
            title="Baixar para redes sociais"
          >
            {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Baixar
          </Button>
          <span className="text-xs text-muted-foreground">
            {new Date(evolution.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>

      {/* Hidden render target for download (styled for export) */}
      <div className="fixed left-[-9999px] top-0" aria-hidden="true">
        <div
          ref={cardRef}
          style={{
            width: 600,
            padding: 28,
            backgroundColor: "#1a1a1a",
            color: "#f5f5f5",
            fontFamily: "system-ui, sans-serif",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{evolution.title}</div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>
            {new Date(evolution.created_at).toLocaleDateString("pt-BR")}
          </div>

          {hasPhotos && (
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 }}>Antes</div>
                {beforeUrl ? (
                  <img src={beforeUrl} crossOrigin="anonymous" alt="Antes" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 8, border: "1px solid #333" }} />
                ) : (
                  <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: 8, backgroundColor: "#2a2a2a", border: "1px solid #333" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 }}>Depois</div>
                {afterUrl ? (
                  <img src={afterUrl} crossOrigin="anonymous" alt="Depois" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 8, border: "1px solid #333" }} />
                ) : (
                  <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: 8, backgroundColor: "#2a2a2a", border: "1px solid #333" }} />
                )}
              </div>
            </div>
          )}

          {(hasWeight || hasBodyFat) && (
            <div style={{ display: "flex", gap: 20, marginBottom: 16, fontSize: 14 }}>
              {hasWeight && (
                <span>
                  <span style={{ color: "#aaa" }}>Peso: </span>
                  <span style={{ fontWeight: 600 }}>{evolution.weight_before}kg → {evolution.weight_after}kg</span>
                  <span style={{ color: (evolution.weight_after! - evolution.weight_before!) < 0 ? "#4ade80" : "#facc15", marginLeft: 6, fontSize: 12 }}>
                    {(evolution.weight_after! - evolution.weight_before!) > 0 ? "+" : ""}
                    {(evolution.weight_after! - evolution.weight_before!).toFixed(1)}kg
                  </span>
                </span>
              )}
              {hasBodyFat && (
                <span>
                  <span style={{ color: "#aaa" }}>Gordura: </span>
                  <span style={{ fontWeight: 600 }}>{evolution.body_fat_before}% → {evolution.body_fat_after}%</span>
                  <span style={{ color: (evolution.body_fat_after! - evolution.body_fat_before!) < 0 ? "#4ade80" : "#facc15", marginLeft: 6, fontSize: 12 }}>
                    {(evolution.body_fat_after! - evolution.body_fat_before!) > 0 ? "+" : ""}
                    {(evolution.body_fat_after! - evolution.body_fat_before!).toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
          )}

          {evolution.description && (
            <div style={{ backgroundColor: "#222", borderRadius: 8, padding: 16, border: "1px solid #333" }}>
              <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Análise Técnica</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line" }}>{evolution.description}</div>
            </div>
          )}
        </div>
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
