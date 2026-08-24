import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { OutlineItem } from '@/types/common.types';

export const getOutline = (content: string): OutlineItem[] => {
  if (typeof DOMParser === 'undefined') return [];
  const parsed = new DOMParser().parseFromString(content, 'text/html');
  return Array.from(parsed.querySelectorAll('h1, h2, h3')).map((heading, index) => ({
    id: `outline-${index}`,
    level: Number(heading.tagName.slice(1)),
    text: heading.textContent?.trim() || 'Khong co tieu de',
  }));
};

/** Dựng outline trực tiếp từ doc tree — rẻ hơn nhiều so với getHTML + DOMParser. */
export const getOutlineFromDoc = (doc: ProseMirrorNode): OutlineItem[] => {
  const out: OutlineItem[] = [];
  doc.forEach((node) => {
    if (node.type.name !== 'heading') return;
    const level = Number(node.attrs.level ?? 1);
    if (level > 3) return;
    out.push({
      id: `outline-${out.length}`,
      level,
      text: node.textContent.trim().slice(0, 200) || 'Khong co tieu de',
    });
  });
  return out;
};
