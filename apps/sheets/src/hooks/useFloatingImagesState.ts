import { useCallback, useState } from 'react';
import type { FloatingImageSpec, ImagePosition } from '@/modules/images';

interface UseFloatingImagesStateOptions {
  activeWorksheetId: string;
}

export const useFloatingImagesState = ({ activeWorksheetId }: UseFloatingImagesStateOptions) => {
  const [images, setImages] = useState<FloatingImageSpec[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleInsertImage = useCallback(
    (url: string, title?: string) => {
      const newImg: FloatingImageSpec = {
        id: `img-${Date.now()}`,
        url,
        title,
        sheetId: activeWorksheetId,
        position: {
          offsetX: 80,
          offsetY: 100,
          width: 260,
          height: 180,
        },
        createdAt: new Date().toISOString(),
      };
      setImages((prev) => [...prev, newImg]);
      setSelectedImageId(newImg.id);
    },
    [activeWorksheetId],
  );

  const handleUpdateImagePosition = useCallback((id: string, newPos: ImagePosition) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, position: newPos } : img)));
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSelectedImageId(null);
  }, []);

  return {
    images,
    selectedImageId,
    setSelectedImageId,
    handleInsertImage,
    handleUpdateImagePosition,
    handleDeleteImage,
  };
};
