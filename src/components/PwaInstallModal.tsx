import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, Plus, X } from "lucide-react";

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
      <DialogContent className="bg-background border-border max-w-sm mx-auto">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Download className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Instale o App
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Acesse sua consultoria direto da tela inicial do seu celular, como
            um app nativo.
          </DialogDescription>
        </DialogHeader>

        {ios ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm font-medium text-foreground text-center">
              Siga os passos abaixo no Safari:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Share className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    1. Toque em{" "}
                    <span className="text-primary font-semibold">
                      Compartilhar
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O ícone de quadrado com seta na barra do Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    2. Toque em{" "}
                    <span className="text-primary font-semibold">
                      Adicionar à Tela de Início
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role para baixo no menu se necessário
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">OK</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    3. Confirme tocando em{" "}
                    <span className="text-primary font-semibold">
                      Adicionar
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pronto! O app aparecerá na sua tela inicial
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full"
            >
              Entendi, fechar
            </Button>
          </div>
        ) : hasNativePrompt ? (
          <div className="space-y-3 mt-2">
            <Button onClick={onInstall} className="w-full">
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
              className="w-full"
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
