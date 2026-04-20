// Fila offline simples baseada em IndexedDB para edições do logbook.
// Estratégia segura:
// - Só enfileira quando navigator.onLine === false (ou quando o save online falha por rede).
// - Cada item tem um timestamp (queuedAt). Na sincronização, comparamos com o
//   updated_at atual do servidor. Se o servidor for mais novo, DESCARTAMOS a edição
//   offline (servidor venceu — provavelmente o admin editou nesse meio tempo).

const DB_NAME = "gs-offline-queue";
const STORE = "logbook_edits";
const DB_VERSION = 1;

export interface QueuedEdit {
  key: string; // `${exerciseId}:${field}` — dedup last-write-wins por campo
  exerciseId: string;
  field: string;
  value: string;
  queuedAt: number; // ms epoch — quando o usuário digitou
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
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
}

export async function enqueueEdit(item: Omit<QueuedEdit, "key" | "queuedAt"> & { queuedAt?: number }): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const record: QueuedEdit = {
      key: `${item.exerciseId}:${item.field}`,
      exerciseId: item.exerciseId,
      field: item.field,
      value: item.value,
      queuedAt: item.queuedAt ?? Date.now(),
    };
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllQueued(): Promise<QueuedEdit[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as QueuedEdit[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeQueued(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function queueSize(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
