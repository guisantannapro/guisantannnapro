/**
 * Fila offline persistente em IndexedDB para edições do logbook.
 * Garante que dados digitados sem internet não sejam perdidos —
 * mesmo se o cliente fechar o app antes de reconectar.
 *
 * Estratégia:
 * - Cada edição (exerciseId + field) é gravada como item da fila.
 * - Usamos uma chave composta `${exerciseId}:${field}` para que novas
 *   edições do mesmo campo sobrescrevam a anterior (last-write-wins).
 * - O processamento da fila é disparado: ao montar, ao voltar online,
 *   e após cada nova edição (se já houver internet).
 */

import { supabase } from "@/integrations/supabase/client";

const DB_NAME = "gs-logbook-offline";
const DB_VERSION = 1;
const STORE = "pending_updates";

export interface PendingUpdate {
  key: string;            // `${exerciseId}:${field}` — chave primária
  exerciseId: string;
  field: string;
  value: string;
  updatedAt: number;      // ms epoch — usado para last-write-wins
}

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
};

const tx = async <T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>): Promise<T> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    const result = fn(store);
    transaction.oncomplete = () => {
      if (result instanceof IDBRequest) resolve(result.result);
      else Promise.resolve(result).then(resolve);
    };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const enqueueUpdate = async (exerciseId: string, field: string, value: string): Promise<void> => {
  const item: PendingUpdate = {
    key: `${exerciseId}:${field}`,
    exerciseId,
    field,
    value,
    updatedAt: Date.now(),
  };
  await tx("readwrite", (store) => store.put(item));
};

export const getPendingUpdates = async (): Promise<PendingUpdate[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readonly");
    const store = transaction.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as PendingUpdate[]);
    req.onerror = () => reject(req.error);
  });
};

export const removeUpdate = async (key: string): Promise<void> => {
  await tx("readwrite", (store) => store.delete(key));
};

export const getPendingCount = async (): Promise<number> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readonly");
    const store = transaction.objectStore(STORE);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

let isFlushing = false;

/**
 * Processa toda a fila pendente. Seguro chamar a qualquer momento —
 * se já estiver rodando, retorna imediatamente.
 * Retorna o número de itens sincronizados com sucesso.
 */
export const flushQueue = async (): Promise<{ synced: number; failed: number }> => {
  if (isFlushing) return { synced: 0, failed: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) return { synced: 0, failed: 0 };

  isFlushing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pending = await getPendingUpdates();
    for (const item of pending) {
      try {
        const { error } = await supabase
          .from("protocol_exercises")
          .update({ [item.field]: item.value } as any)
          .eq("id", item.exerciseId);

        if (error) {
          failed++;
          // Para erros de rede, paramos para tentar de novo depois.
          // Para outros erros (ex: permissão), removemos pra não travar a fila.
          const msg = (error.message || "").toLowerCase();
          const isNetwork = msg.includes("fetch") || msg.includes("network") || msg.includes("failed");
          if (!isNetwork) {
            await removeUpdate(item.key);
          } else {
            break;
          }
        } else {
          await removeUpdate(item.key);
          synced++;
        }
      } catch {
        failed++;
        break;
      }
    }
  } finally {
    isFlushing = false;
  }

  return { synced, failed };
};
