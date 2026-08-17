/** Uoc tinh dung luong luu tru thuc (IndexedDB) qua Storage API, don vi MB. */
export const estimateStorageMB = async (): Promise<number> => {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return 0;
    const { usage } = await navigator.storage.estimate();
    return Math.max(0, Math.round((usage ?? 0) / (1024 * 1024) * 10) / 10);
  } catch {
    return 0;
  }
};