export type StoredCanLog = {
  name: string;
  text: string;
  storedAt: number;
};

const DATABASE_NAME = "bt-engineering-tools";
const STORE_NAME = "can-log-transfer";
const RECORD_KEY = "latest";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB could not be opened."));
  });
}

export async function storeCanLogForTransfer(record: StoredCanLog): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record, RECORD_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("CAN log could not be stored."));
  });
  database.close();
}

export async function loadTransferredCanLog(
  maximumAgeMs = 30 * 60 * 1000,
): Promise<StoredCanLog | null> {
  const database = await openDatabase();
  const record = await new Promise<StoredCanLog | undefined>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve(request.result as StoredCanLog | undefined);
    request.onerror = () => reject(request.error ?? new Error("CAN log could not be read."));
  });
  database.close();
  if (!record || Date.now() - record.storedAt > maximumAgeMs) return null;
  return record;
}
