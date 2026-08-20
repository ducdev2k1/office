import * as Y from 'yjs';

export const encodeState = (ydoc: Y.Doc): Uint8Array => Y.encodeStateAsUpdate(ydoc);

export const decodeState = (update: Uint8Array): Y.Doc => {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, update);
  return doc;
};

export const computeDelta = (ydoc: Y.Doc, base: Uint8Array | null): Uint8Array => {
  if (!base) return encodeState(ydoc);
  const baseDoc = new Y.Doc();
  Y.applyUpdate(baseDoc, base);
  const vector = Y.encodeStateVector(baseDoc);
  return Y.encodeStateAsUpdate(ydoc, vector);
};

export const isStateChanged = (ydoc: Y.Doc, base: Uint8Array | null): boolean => {
  if (!base) return true;
  return computeDelta(ydoc, base).length > 0;
};

export const encodeSnapshot = (ydoc: Y.Doc): Uint8Array => {
  const snapshot = Y.snapshot(ydoc);
  return Y.encodeSnapshot(snapshot);
};

export const snapshotToUpdate = (update: Uint8Array, snapshot: Uint8Array): Uint8Array => {
  const snapshotDoc = Y.createDocFromSnapshot(new Y.Doc(), Y.decodeSnapshot(snapshot));
  const merged = new Y.Doc();
  Y.applyUpdate(merged, update);
  const vector = Y.encodeStateVector(snapshotDoc);
  return Y.encodeStateAsUpdate(merged, vector);
};

export const applyUpdateToDoc = (ydoc: Y.Doc, update: Uint8Array): void => {
  Y.applyUpdate(ydoc, update);
};

export const mergeUpdates = (updates: Uint8Array[]): Uint8Array => {
  const doc = new Y.Doc();
  for (const update of updates) Y.applyUpdate(doc, update);
  return Y.encodeStateAsUpdate(doc);
};