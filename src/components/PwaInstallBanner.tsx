import { useState } from "react";
import { Download, X } from "lucide-react";
import { usePwaInstall } from "./PwaInstallModal";
import PwaInstallModal from "./PwaInstallModal";

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

const PwaInstallBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { shouldShow, isIos, deferredPrompt, triggerInstall } = usePwaInstall();

  // TEMP: forced visible for admin testing
  // if (isInStandaloneMode() || dismissed || !shouldShow) return null;
  if (dismissed) return null;

  const handleInstallClick = () => {
    if (isIos || !deferredPrompt) {
      setModalOpen(true);
    } else {
      triggerInstall();
    }
  };

  return (
    <>
      <div className="w-full bg-[#0a0a0a] border-b border-primary/20 animate-fade-in">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Download className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-primary">
              Acesse mais rápido direto da sua tela inicial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Instalar App
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <PwaInstallModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isIos={isIos}
        onInstall={triggerInstall}
        hasNativePrompt={!!deferredPrompt}
      />
    </>
  );
};

export default PwaInstallBanner;
