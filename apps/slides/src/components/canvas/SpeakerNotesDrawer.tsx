import { useTranslation } from '@office/i18n';
import { Button, Icon } from '@office/ui-kit';
import { useState } from 'react';

interface SpeakerNotesDrawerProps {
  notes?: string;
  onUpdateNotes: (notes: string) => void;
}

export const SpeakerNotesDrawer = ({
  notes = '',
  onUpdateNotes,
}: SpeakerNotesDrawerProps) => {
  const { t } = useTranslation('slides');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-border bg-card">
      <div className="flex h-7 items-center justify-between px-3 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
        >
          <Icon name={isOpen ? 'chevron-down' : 'chevron-up'} size={13} />
          <span>Ghi chú của người thuyết trình</span>
        </button>
      </div>

      {isOpen && (
        <div className="h-24 p-2 bg-background border-t border-border animate-in slide-in-from-bottom-2 duration-150">
          <textarea
            defaultValue={notes}
            placeholder="Nhập ghi chú cho trang chiếu này (chỉ hiển thị khi thuyết trình)..."
            onBlur={(e) => onUpdateNotes(e.target.value)}
            className="h-full w-full resize-none bg-transparent p-1 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
