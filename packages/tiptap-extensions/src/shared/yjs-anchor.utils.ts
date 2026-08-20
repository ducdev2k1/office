import * as Y from 'yjs';

export interface YjsAnchor {
  /** Yjs type name, e.g. 'text' or 'default'. */
  typeName: string;
  /** Index (UTF-16) into the Y.Text. */
  index: number;
  /** Bias when resolving: 0 = prefer before, 1 = prefer after. */
  bias?: 0 | 1;
}

export const createAnchorFromTypeIndex = (text: Y.Text, index: number, bias: 0 | 1 = 0): YjsAnchor => ({
  typeName: 'text',
  index,
  bias,
});

export const anchorToIndex = (anchor: YjsAnchor | null | undefined): number | null => {
  if (!anchor) return null;
  return anchor.index;
};

export const indexToAnchor = (index: number, bias: 0 | 1 = 0): YjsAnchor => ({
  typeName: 'text',
  index,
  bias,
});

export const anchorToRelativePos = (ydoc: Y.Doc, anchor: YjsAnchor): Y.RelativePosition => {
  const text = ydoc.getText(anchor.typeName);
  const assoc = anchor.bias === 1 ? 1 : -1;
  return Y.createRelativePositionFromTypeIndex(text, anchor.index, assoc);
};

export const relativePosToAnchor = (ydoc: Y.Doc, relPos: Y.RelativePosition): YjsAnchor | null => {
  const abs = Y.createAbsolutePositionFromRelativePosition(relPos, ydoc);
  if (!abs) return null;
  return {
    typeName: 'text',
    index: abs.index,
    bias: abs.assoc === 1 ? 1 : 0,
  };
};

export const relativePosToIndex = (ydoc: Y.Doc, relPos: Y.RelativePosition): number => {
  const abs = Y.createAbsolutePositionFromRelativePosition(relPos, ydoc);
  return abs ? abs.index : 0;
};

export const encodeAnchor = (anchor: YjsAnchor): string => JSON.stringify(anchor);

export const decodeAnchor = (raw: string | null | undefined): YjsAnchor | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as YjsAnchor;
    if (typeof parsed.index !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};