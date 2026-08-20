import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@office/ui-kit';
import { useTranslation } from '@office/i18n';
import { useState } from 'react';
import type { Editor } from '@tiptap/core';

const LINE_HEIGHTS = [
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
];

const PARAGRAPH_SPACINGS = [
  { label: 'toolbar.spacingNone', before: '0', after: '0' },
  { label: 'toolbar.spacingSmall', before: '6pt', after: '6pt' },
  { label: 'toolbar.spacingMedium', before: '12pt', after: '12pt' },
  { label: 'toolbar.spacingLarge', before: '24pt', after: '24pt' },
];

const IconCheck = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconLineHeight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 5h16" />
    <path d="M4 12h10" />
    <path d="M4 19h13" />
    <path d="m15 4 2-2 2 2" />
    <path d="m15 20 2 2 2-2" />
    <path d="m19 9 2-2 2 2" />
    <path d="m19 15 2 2 2-2" />
  </svg>
);

interface LineSpacingPickerProps {
  editor: Editor;
}

export const LineSpacingPicker = ({ editor }: LineSpacingPickerProps) => {
  const { t } = useTranslation('docs');
  const [open, setOpen] = useState(false);

  const currentLineHeight = editor.getAttributes('textStyle').lineHeight as string | undefined;
  const currentPara = editor.getAttributes('paragraph');

  const handleLineHeight = (value: string) => {
    if (value === '1') editor.chain().focus().unsetLineSpacing().run();
    else editor.chain().focus().setLineSpacing(value).run();
    setOpen(false);
  };

  const handleParagraphSpacing = (before: string, after: string) => {
    if (before === '0' && after === '0') editor.chain().focus().unsetParagraphSpacing().run();
    else editor.chain().focus().setParagraphSpacing({ before, after }).run();
    setOpen(false);
  };

  const currentSpacingLabel = PARAGRAPH_SPACINGS.find(
    (item) => item.before === currentPara.spacingBefore && item.after === currentPara.spacingAfter,
  )?.label;

  const label = t('toolbar.lineSpacing');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <PopoverTrigger
            render={
              <Button
                aria-label={label}
                variant="ghost"
                size="sm"
                className={cn(
                  'inline-flex items-center justify-center h-7 min-w-7 px-1.5 rounded text-foreground/80 hover:text-foreground hover:bg-hover transition-colors',
                  open && 'bg-primary/15 text-primary',
                )}
              >
                <IconLineHeight />
              </Button>
            }
          />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={2}
        className="w-[220px] p-0 rounded-lg border border-border bg-popover shadow-xl"
      >
        <ScrollArea className="max-h-[320px]">
          <div className="py-1.5">
            <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('toolbar.lineSpacing')}
            </p>
            {LINE_HEIGHTS.map((item) => {
              const selected = currentLineHeight === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleLineHeight(item.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-foreground hover:bg-hover transition-colors cursor-pointer',
                    selected && 'text-primary font-semibold bg-primary/10',
                  )}
                >
                  <span>{item.label}</span>
                  {selected && (
                    <span className="text-primary shrink-0">
                      <IconCheck />
                    </span>
                  )}
                </button>
              );
            })}

            <div className="my-1.5 h-px bg-border" />

            <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('toolbar.paragraphSpacing')}
            </p>
            {PARAGRAPH_SPACINGS.map((item) => {
              const selected = item.label === currentSpacingLabel;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleParagraphSpacing(item.before, item.after)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-foreground hover:bg-hover transition-colors cursor-pointer',
                    selected && 'text-primary font-semibold bg-primary/10',
                  )}
                >
                  <span>{t(item.label)}</span>
                  {selected && (
                    <span className="text-primary shrink-0">
                      <IconCheck />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};