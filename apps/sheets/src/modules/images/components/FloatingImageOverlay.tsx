import { FloatingImageContainer } from '@/modules/images/components/FloatingImageContainer';
import type { FloatingImageSpec, ImagePosition } from '@/modules/images/types/images.types';

interface FloatingImageOverlayProps {
  images: FloatingImageSpec[];
  selectedImageId?: string | null;
  activeSheetId?: string;
  onSelectImage?: (id: string | null) => void;
  onUpdateImagePosition?: (id: string, newPos: ImagePosition) => void;
  onDeleteImage?: (id: string) => void;
}

export const FloatingImageOverlay = ({
  images,
  selectedImageId = null,
  activeSheetId = 'sheet-01',
  onSelectImage,
  onUpdateImagePosition,
  onDeleteImage,
}: FloatingImageOverlayProps) => {
  const currentImages = images.filter((img) => img.sheetId === activeSheetId);

  if (currentImages.length === 0) {
    return null;
  }

  return (
    <div
      onClick={() => onSelectImage?.(null)}
      className="absolute inset-0 pointer-events-none overflow-hidden z-18"
    >
      {currentImages.map((img) => (
        <FloatingImageContainer
          key={img.id}
          spec={img}
          isSelected={img.id === selectedImageId}
          onSelect={onSelectImage}
          onUpdatePosition={onUpdateImagePosition}
          onDelete={onDeleteImage}
        />
      ))}
    </div>
  );
};
