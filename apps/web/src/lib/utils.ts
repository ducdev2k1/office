export interface OutlineItem {
  id: string;
  level: number;
  text: string;
}

export const getOutline = (content: string): OutlineItem[] => {
  if (typeof DOMParser === 'undefined') return [];
  const parsed = new DOMParser().parseFromString(content, 'text/html');
  return Array.from(parsed.querySelectorAll('h1, h2, h3')).map((heading, index) => ({
    id: `outline-${index}`,
    level: Number(heading.tagName.slice(1)),
    text: heading.textContent?.trim() || 'Khong co tieu de',
  }));
};

export const downloadFile = (filename: string, body: string, type: string): void => {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
