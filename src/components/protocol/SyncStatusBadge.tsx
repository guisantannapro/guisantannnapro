import { Cloud, CloudOff, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import type { SyncStatus } from "@/hooks/useOfflineSync";
import { cn } from "@/lib/utils";

interface SyncStatusBadgeProps {
  status: SyncStatus;
  pendingCount: number;
  onClick?: () => void;
}

const SyncStatusBadge = ({ status, pendingCount, onClick }: SyncStatusBadgeProps) => {
  const config = {
    online: {
      icon: <CheckCircle2 size={12} />,
      label: "Sincronizado",
      className: "bg-green-500/10 text-green-600 border-green-500/30",
    },
    syncing: {
      icon: <Loader2 size={12} className="animate-spin" />,
      label: `Sincronizando${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
      className: "bg-primary/10 text-primary border-primary/30",
    },
    pending: {
      icon: <RefreshCw size={12} />,
      label: `${pendingCount} pendente${pendingCount > 1 ? "s" : ""}`,
      className: "bg-amber-500/10 text-amber-600 border-amber-500/40",
    },
    offline: {
      icon: <CloudOff size={12} />,
      label: pendingCount > 0 ? `Offline (${pendingCount} salvo${pendingCount > 1 ? "s" : ""})` : "Offline",
      className: "bg-muted text-muted-foreground border-border",
    },
  }[status];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      data-html2canvas-ignore="true"
      title={
        status === "offline"
          ? "Sem conexão. Suas edições estão salvas no dispositivo e serão enviadas ao reconectar."
          : status === "pending"
          ? "Clique para tentar sincronizar agora."
          : status === "syncing"
          ? "Enviando dados ao servidor..."
          : "Tudo salvo no servidor."
      }
      className={cn(
        "print:hidden inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:opacity-80",
        config.className,
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
};

export default SyncStatusBadge;
