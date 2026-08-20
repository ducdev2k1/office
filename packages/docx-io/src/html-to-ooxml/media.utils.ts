import type { DocxMediaItem } from '../types';

const base64ToUint8Array = (base64: string): Uint8Array => {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  return new Uint8Array();
};

export const parseImageDataUrl = (
  src: string,
  index: number,
  widthPx = 400,
  heightPx = 300,
): DocxMediaItem | null => {
  if (!src.startsWith('data:image/')) return null;

  const commaIdx = src.indexOf(',');
  if (commaIdx === -1) return null;

  const header = src.slice(0, commaIdx);
  const base64Data = src.slice(commaIdx + 1);

  let ext = 'png';
  let contentType = 'image/png';

  if (header.includes('image/jpeg') || header.includes('image/jpg')) {
    ext = 'jpeg';
    contentType = 'image/jpeg';
  } else if (header.includes('image/gif')) {
    ext = 'gif';
    contentType = 'image/gif';
  } else if (header.includes('image/webp')) {
    ext = 'png'; // Word doesn't natively render webp in legacy OOXML, fallback to png extension/type
    contentType = 'image/png';
  } else if (header.includes('image/svg')) {
    ext = 'svg';
    contentType = 'image/svg+xml';
  }

  const data = base64ToUint8Array(base64Data);
  const fileName = `image${index}.${ext}`;

  return {
    id: `rIdImg${index}`,
    target: `media/${fileName}`,
    data,
    contentType,
    widthPx,
    heightPx,
  };
};
