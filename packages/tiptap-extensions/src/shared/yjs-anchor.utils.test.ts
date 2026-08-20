import * as Y from 'yjs';
import { describe, expect, it } from 'vitest';
import {
  anchorToIndex,
  anchorToRelativePos,
  createAnchorFromTypeIndex,
  decodeAnchor,
  encodeAnchor,
  indexToAnchor,
  relativePosToIndex,
} from './yjs-anchor.utils';

describe('yjs-anchor.utils', () => {
  it('encode/decode round-trip giữ nguyên index và bias', () => {
    const anchor = { typeName: 'text', index: 42, bias: 1 as const };
    expect(decodeAnchor(encodeAnchor(anchor))).toEqual(anchor);
  });

  it('decode trả null cho input rỗng/không hợp lệ', () => {
    expect(decodeAnchor(null)).toBeNull();
    expect(decodeAnchor('')).toBeNull();
    expect(decodeAnchor('not-json')).toBeNull();
    expect(decodeAnchor('{"index":"abc"}')).toBeNull();
  });

  it('relative position resolve ra index đúng sau khi chèn text phía trước', () => {
    const ydoc = new Y.Doc();
    const text = ydoc.getText('text');
    text.insert(0, 'Hello world');

    const anchor = createAnchorFromTypeIndex(text, 5, 0);
    const relPos = anchorToRelativePos(ydoc, anchor);

    text.insert(0, 'ABC');
    const idx = relativePosToIndex(ydoc, relPos);
    expect(idx).toBe(8);
  });

  it('indexToAnchor/anchorToIndex qua lại', () => {
    const anchor = indexToAnchor(7, 1);
    expect(anchorToIndex(anchor)).toBe(7);
  });
});