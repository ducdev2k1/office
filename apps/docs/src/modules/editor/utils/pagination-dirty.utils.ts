import type { Transaction } from '@tiptap/pm/state';

/** Vùng tài liệu bị thay đổi kể từ lần phân trang trước (toạ độ doc hiện tại). */
export interface DirtyRange {
  from: number;
  to: number;
}

export const EMPTY_DIRTY: DirtyRange[] = [];
export const MAX_DIRTY_RANGES = 64;

/**
 * Thu các vùng thay đổi của một transaction, quy về toạ độ doc CUỐI.
 * Mỗi map ghi khoảng xoá theo doc trung gian nên cần map tiếp qua các map phía sau.
 *
 * Fallback: AddMarkStep/RemoveMarkStep/AttrStep trả StepMap rỗng (không hiện ra
 * mapping) nhưng vẫn làm rewrap nội dung — khi đó đánh dấu vùng selection là dirty.
 */
export const collectTrDirtyRanges = (tr: Transaction): DirtyRange[] => {
  const ranges: DirtyRange[] = [];
  const docSize = tr.doc.content.size;
  const maps = tr.mapping.maps;
  maps.forEach((map, i) => {
    map.forEach((from, to) => {
      let f = from;
      let t = to;
      for (let j = i + 1; j < maps.length; j += 1) {
        const later = maps[j];
        if (!later) break;
        f = later.map(f, -1);
        t = later.map(t, 1);
      }
      ranges.push({
        from: Math.max(0, Math.min(f - 1, docSize)),
        to: Math.min(t + 1, docSize),
      });
    });
  });

  if (ranges.length === 0 && tr.steps.length > 0 && !tr.selection.empty) {
    ranges.push({
      from: Math.max(0, tr.selection.from - 1),
      to: Math.min(tr.selection.to + 1, docSize),
    });
  }

  return ranges;
};

export const isBlockDirty = (offset: number, nodeSize: number, dirty: DirtyRange[]): boolean => {
  if (dirty.length === 0) return false;
  const from = offset;
  const to = offset + nodeSize;
  return dirty.some((range) => range.from <= to && range.to >= from);
};
