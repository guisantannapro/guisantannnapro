import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number
) => {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (imgRatio > boxRatio) {
    sw = img.naturalHeight * boxRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / boxRatio;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, maxW: number, lineH: number): number => {
  let totalH = 0;
  const lines = text.split("\n");
  for (const line of lines) {
    const words = line.split(" ");
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxW && current) {
        ctx.fillText(current, x, 0);
        ctx.translate(0, lineH);
        totalH += lineH;
        current = word;
      } else {
        current = test;
      }
    }
    if (current) {
      ctx.fillText(current, x, 0);
      ctx.translate(0, lineH);
      totalH += lineH;
    }
  }
  return totalH;
};

const generateEvolutionImage = async (
  evolution: Evolution,
  beforeUrl: string | null,
  afterUrl: string | null
): Promise<string> => {
  const W = 1080;
  const PAD = 56;
  const hasPhotos = beforeUrl || afterUrl;
  const hasWeight = evolution.weight_before != null && evolution.weight_after != null;
  const hasBodyFat = evolution.body_fat_before != null && evolution.body_fat_after != null;

  // Pre-load images
  const [beforeImg, afterImg] = await Promise.all([
    beforeUrl ? loadImage(beforeUrl).catch(() => null) : null,
    afterUrl ? loadImage(afterUrl).catch(() => null) : null,
  ]);

  // Calculate height dynamically
  let contentH = 0;
  contentH += 40; // title
  contentH += 24; // date
  contentH += 20; // spacing

  const photoH = 680;
  if (hasPhotos) contentH += 24 + photoH + 24; // label + photos + gap

  if (hasWeight || hasBodyFat) contentH += 40;

  // Estimate description height
  let descH = 0;
  if (evolution.description) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.font = "26px system-ui, sans-serif";
    const maxTextW = W - PAD * 2 - 64;
    const lines = evolution.description.split("\n");
    let lineCount = 0;
    for (const line of lines) {
      const words = line.split(" ");
      let cur = "";
      for (const word of words) {
        const test = cur ? `${cur} ${word}` : word;
        if (tempCtx.measureText(test).width > maxTextW && cur) {
          lineCount++;
          cur = word;
        } else {
          cur = test;
        }
      }
      lineCount++;
    }
    descH = 24 + 48 + lineCount * 36 + 32 + 16;
    contentH += descH;
  }

  contentH += 40; // watermark area

  const H = contentH + PAD * 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#1a1a1a";
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.fill();

  let y = PAD;

  // Title
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillText(evolution.title, PAD, y + 30);
  y += 40;

  // Date
  ctx.fillStyle = "#888";
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillText(new Date(evolution.created_at).toLocaleDateString("pt-BR"), PAD, y + 18);
  y += 38;

  // Photos
  if (hasPhotos) {
    const gap = 24;
    const imgW = (W - PAD * 2 - gap) / 2;

    // Labels
    ctx.fillStyle = "#aaa";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("ANTES", PAD, y + 16);
    ctx.fillText("DEPOIS", PAD + imgW + gap, y + 16);
    ctx.letterSpacing = "0px";
    y += 28;

    // Before photo
    const drawPhotoSlot = (img: HTMLImageElement | null, x: number) => {
      ctx.save();
      roundRect(ctx, x, y, imgW, photoH, 16);
      ctx.clip();
      if (img) {
        drawImageCover(ctx, img, x, y, imgW, photoH);
      } else {
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(x, y, imgW, photoH);
        ctx.fillStyle = "#555";
        ctx.font = "24px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Sem foto", x + imgW / 2, y + photoH / 2);
        ctx.textAlign = "left";
      }
      ctx.restore();
      // Border
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, imgW, photoH, 16);
      ctx.stroke();
    };

    drawPhotoSlot(beforeImg, PAD);
    drawPhotoSlot(afterImg, PAD + imgW + gap);
    y += photoH + 24;
  }

  // Metrics
  if (hasWeight || hasBodyFat) {
    ctx.font = "28px system-ui, sans-serif";
    let mx = PAD;

    if (hasWeight) {
      const diff = evolution.weight_after! - evolution.weight_before!;
      ctx.fillStyle = "#aaa";
      ctx.fillText("Peso: ", mx, y + 24);
      mx += ctx.measureText("Peso: ").width;
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "bold 28px system-ui, sans-serif";
      const weightText = `${evolution.weight_before}kg → ${evolution.weight_after}kg`;
      ctx.fillText(weightText, mx, y + 24);
      mx += ctx.measureText(weightText).width + 12;
      ctx.fillStyle = diff < 0 ? "#4ade80" : "#facc15";
      ctx.font = "24px system-ui, sans-serif";
      ctx.fillText(`${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg`, mx, y + 24);
      mx += ctx.measureText(`${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg`).width + 40;
    }

    if (hasBodyFat) {
      const diff = evolution.body_fat_after! - evolution.body_fat_before!;
      ctx.font = "28px system-ui, sans-serif";
      ctx.fillStyle = "#aaa";
      ctx.fillText("Gordura: ", mx, y + 24);
      mx += ctx.measureText("Gordura: ").width;
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "bold 28px system-ui, sans-serif";
      const fatText = `${evolution.body_fat_before}% → ${evolution.body_fat_after}%`;
      ctx.fillText(fatText, mx, y + 24);
      mx += ctx.measureText(fatText).width + 12;
      ctx.fillStyle = diff < 0 ? "#4ade80" : "#facc15";
      ctx.font = "24px system-ui, sans-serif";
      ctx.fillText(`${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`, mx, y + 24);
    }
    y += 48;
  }

  // Description box
  if (evolution.description) {
    const boxX = PAD;
    const boxW = W - PAD * 2;
    const boxPad = 32;

    ctx.fillStyle = "#222";
    roundRect(ctx, boxX, y, boxW, descH - 16, 16);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    roundRect(ctx, boxX, y, boxW, descH - 16, 16);
    ctx.stroke();

    // Label
    ctx.fillStyle = "#aaa";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("ANÁLISE TÉCNICA", boxX + boxPad, y + boxPad + 14);
    ctx.letterSpacing = "0px";

    // Text
    ctx.save();
    ctx.translate(0, y + boxPad + 56);
    ctx.fillStyle = "#f5f5f5";
    ctx.font = "26px system-ui, sans-serif";
    wrapText(ctx, evolution.description, boxX + boxPad, boxW - boxPad * 2, 36);
    ctx.restore();
  }

  // Watermark
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "22px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("guisantannapro consultoria", W - 32, H - 24);

  return canvas.toDataURL("image/png");
};

const EvolutionCard = ({ evolution }: { evolution: Evolution }) => {
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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
    setDownloading(true);
    try {
      const dataUrl = await generateEvolutionImage(evolution, beforeUrl, afterUrl);
      const link = document.createElement("a");
      link.download = `evolucao-${evolution.title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
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

      {hasPhotos && (
        <div className="grid grid-cols-2 gap-3 max-w-sm">
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
