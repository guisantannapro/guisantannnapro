import { useEffect, useState, useCallback, useRef } from "react";
import { flushQueue, getPendingCount } from "@/lib/offlineQueue";

export type SyncStatus = "online" | "offline" | "syncing" | "pending";

/**
 * Hook que gerencia o estado de conexão e sincronização da fila offline.
 * - Monitora online/offline.
 * - Faz flush automático ao voltar online e ao montar.
 * - Expõe `pendingCount` e `status` para a UI.
 * - Expõe `triggerSync()` para forçar sincronização (ex: após nova edição).
 */
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const mountedRef = useRef(true);

  const refreshCount = useCallback(async () => {
    try {
      const c = await getPendingCount();
      if (mountedRef.current) setPendingCount(c);
    } catch {
      // ignore
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      await refreshCount();
      return;
    }
    setIsSyncing(true);
    try {
      await flushQueue();
    } finally {
      if (mountedRef.current) {
        setIsSyncing(false);
        await refreshCount();
      }
    }
  }, [refreshCount]);

  useEffect(() => {
    mountedRef.current = true;
    refreshCount();
    if (navigator.onLine) {
      void triggerSync();
    }

    const handleOnline = () => {
      setIsOnline(true);
      void triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshCount, triggerSync]);

  let status: SyncStatus = "online";
  if (!isOnline) status = "offline";
  else if (isSyncing) status = "syncing";
  else if (pendingCount > 0) status = "pending";

  return { status, isOnline, isSyncing, pendingCount, triggerSync, refreshCount };
};
