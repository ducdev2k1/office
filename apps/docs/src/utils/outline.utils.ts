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
