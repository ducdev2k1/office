import type { SlideDeckData } from '@/types/slides.types';
import { useTranslation } from '@office/i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
} from '@office/ui-kit';
import { useState } from 'react';

interface FindReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck: SlideDeckData;
  onUpdateDeckData: (data: SlideDeckData) => void;
  onSelectSlideIndex: (index: number) => void;
  onSelectElementId: (id: string | null) => void;
}

export const FindReplaceDialog = ({
  open,
  onOpenChange,
  deck,
  onUpdateDeckData,
  onSelectSlideIndex,
  onSelectElementId,
}: FindReplaceDialogProps) => {
  const { t } = useTranslation('slides');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleFindNext = () => {
    if (!findText.trim()) return;
    const query = findText.toLowerCase();

    for (let sIdx = 0; sIdx < deck.slides.length; sIdx++) {
      const slide = deck.slides[sIdx];
      if (!slide) continue;
      for (const el of slide.elements) {
        if (el.content && el.content.toLowerCase().includes(query)) {
          onSelectSlideIndex(sIdx);
          onSelectElementId(el.id);
          setStatusMessage(`Đã tìm thấy tại Trang ${sIdx + 1}`);
          return;
        }
      }
    }
    setStatusMessage('Không tìm thấy kết quả phù hợp');
  };

  const handleReplaceAll = () => {
    if (!findText.trim()) return;
    const query = findText;
    let count = 0;

    const nextSlides = deck.slides.map((s) => ({
      ...s,
      elements: s.elements.map((el) => {
        if (el.content && el.content.includes(query)) {
          count++;
          return {
            ...el,
            content: el.content.replaceAll(query, replaceText),
          };
        }
        return el;
      }),
    }));

    if (count > 0) {
      onUpdateDeckData({ ...deck, slides: nextSlides });
      setStatusMessage(`Đã thay thế ${count} vị trí`);
    } else {
      setStatusMessage('Không có nội dung nào được thay thế');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="search" size={16} className="text-primary" />
            <span>Tìm kiếm và thay thế</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="mb-1 block font-medium text-foreground">Tìm kiếm:</label>
            <Input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Nhập từ hoặc cụm từ cần tìm..."
              className="h-8 text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-foreground">Thay thế bằng:</label>
            <Input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Nhập nội dung thay thế..."
              className="h-8 text-xs"
            />
          </div>

          {statusMessage && (
            <p className="text-[11px] font-medium text-primary">{statusMessage}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleFindNext} className="h-8 text-xs">
            Tìm tiếp
          </Button>
          <Button size="sm" onClick={handleReplaceAll} className="h-8 text-xs bg-primary text-white">
            Thay thế tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
