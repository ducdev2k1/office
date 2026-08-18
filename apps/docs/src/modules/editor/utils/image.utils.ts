export const MAX_IMAGE_DATA_URL_LENGTH = 1_000_000;

export const compressImage = async (dataUrl: string): Promise<string> => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.sqrt(0.5);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas khong duoc ho tro');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
};
