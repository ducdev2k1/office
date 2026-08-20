import { useTranslation } from '@office/i18n';
import { Icon, Textarea } from '@office/ui-kit';
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
    <div className="border-t border-border bg-card transition-colors">
      <div className="flex h-8 items-center justify-between px-3 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon
            name="chevron-up"
            size={13}
            className={`transition-transform duration-300 ease-out ${
              isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`}
          />
          <span>Ghi chú của người thuyết trình</span>
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden bg-background border-t border-border/80">
          <div className="h-28 p-2.5">
            <Textarea
              defaultValue={notes}
              placeholder="Nhập ghi chú cho trang chiếu này (chỉ hiển thị khi thuyết trình)..."
              onBlur={(e) => onUpdateNotes(e.target.value)}
              className="h-full w-full resize-none rounded-md bg-transparent p-2 text-xs text-foreground placeholder:text-muted-foreground/60 leading-relaxed shadow-none focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
