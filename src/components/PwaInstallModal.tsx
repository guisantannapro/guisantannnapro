import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, Plus, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "pwa-install-dismissed";
const COOLDOWN_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIos = () => {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua);
};

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

const isDismissedRecently = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const dismissed = Number(raw);
  const daysSince = (Date.now() - dismissed) / (1000 * 60 * 60 * 24);
  return daysSince < COOLDOWN_DAYS;
};

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const shouldShow = !isInStandaloneMode() && !isDismissedRecently();

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return { shouldShow, isIos: isIos(), deferredPrompt, triggerInstall };
}

interface PwaInstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isIos: boolean;
  onInstall: () => void;
  hasNativePrompt: boolean;
}

/* Animated step indicator for iOS */
const IosStep = ({
  step,
  icon,
  label,
  sublabel,
  delay,
}: {
  step: number;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  delay: string;
}) => (
  <div
    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-primary/20 opacity-0 animate-fade-in"
    style={{ animationDelay: delay, animationFillMode: "forwards" }}
  >
    <div className="relative">
      <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center shrink-0 ring-2 ring-primary/40">
        {icon}
      </div>
      <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
        {step}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
    </div>
  </div>
);

const PwaInstallModal = ({
  open,
  onOpenChange,
  isIos: ios,
  onInstall,
  hasNativePrompt,
}: PwaInstallModalProps) => {
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-primary/20 max-w-sm mx-auto rounded-2xl">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/30">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold text-gradient-gold">
            Instale o App
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            Acesse sua consultoria direto da tela inicial, como um app nativo — rápido e sem precisar abrir o navegador.
          </DialogDescription>
        </DialogHeader>

        {ios ? (
          <div className="space-y-3 mt-2">
            <IosStep
              step={1}
              icon={<Share className="w-5 h-5 text-primary" />}
              label="Toque em Compartilhar"
              sublabel="O ícone ↑ na barra inferior do Safari"
              delay="0.1s"
            />
            <IosStep
              step={2}
              icon={<Plus className="w-5 h-5 text-primary" />}
              label="Adicionar à Tela de Início"
              sublabel="Role o menu para baixo se necessário"
              delay="0.3s"
            />
            <IosStep
              step={3}
              icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
              label="Confirme e pronto!"
              sublabel="O app aparece na sua tela inicial"
              delay="0.5s"
            />
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full mt-3 border-primary/30 text-primary hover:bg-primary/10"
            >
              Entendi, fechar
            </Button>
          </div>
        ) : hasNativePrompt ? (
          <div className="space-y-3 mt-2">
            <Button onClick={onInstall} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider">
              <Download className="w-4 h-4 mr-2" />
              Instalar Agora
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Agora não
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground text-center">
              Use o menu do navegador e selecione "Instalar app" ou "Adicionar
              à tela inicial".
            </p>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
            >
              Entendi, fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PwaInstallModal;
