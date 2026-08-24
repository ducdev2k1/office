import { useState } from 'react';
import { Icon } from '../../icons';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../cn';

export interface BulletPreset {
  id: string;
  l1: string;
  l2: string;
  l3: string;
}

export interface NumberPreset {
  id: string;
  l1: string;
  l2: string;
  l3: string;
}

export const BULLET_PRESETS: BulletPreset[] = [
  { id: 'preset-1', l1: '●', l2: '○', l3: '■' },
  { id: 'preset-2', l1: '❖', l2: '➢', l3: '■' },
  { id: 'preset-3', l1: '❑', l2: '▫', l3: '▫' },
  { id: 'preset-4', l1: '➔', l2: '◆', l3: '●' },
  { id: 'preset-5', l1: '★', l2: '○', l3: '■' },
  { id: 'preset-6', l1: '➢', l2: '○', l3: '■' },
];

export const NUMBER_PRESETS: NumberPreset[] = [
  { id: 'num-1', l1: '1.', l2: 'a.', l3: 'i.' },
  { id: 'num-2', l1: '1.', l2: '1.1.', l3: '1.1.1.' },
  { id: 'num-3', l1: '1)', l2: 'a)', l3: 'i)' },
  { id: 'num-4', l1: 'A.', l2: 'B.', l3: 'C.' },
  { id: 'num-5', l1: 'I.', l2: 'A.', l3: '1.' },
  { id: 'num-6', l1: '01.', l2: 'a.', l3: 'i.' },
];

interface BulletCardProps {
  preset: BulletPreset;
  active?: boolean;
  onSelect: (preset: BulletPreset) => void;
}

const BulletCard = ({ preset, active, onSelect }: BulletCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(preset)}
    className={cn(
      'w-24 h-24 p-2 rounded-md border text-left flex flex-col justify-between transition-all cursor-pointer bg-card hover:bg-accent/40 hover:border-primary',
      active ? 'border-primary ring-1 ring-primary bg-accent/30' : 'border-border/80',
    )}
  >
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] w-3 shrink-0 text-center font-mono leading-none">{preset.l1}</span>
      <span className="h-1 w-12 bg-muted-foreground/35 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5 pl-2.5">
      <span className="text-[9px] w-2.5 shrink-0 text-center font-mono leading-none text-muted-foreground">{preset.l2}</span>
      <span className="h-1 w-9 bg-muted-foreground/25 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5 pl-2.5">
      <span className="text-[9px] w-2.5 shrink-0 text-center font-mono leading-none text-muted-foreground">{preset.l2}</span>
      <span className="h-1 w-9 bg-muted-foreground/25 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5 pl-5">
      <span className="text-[8px] w-2.5 shrink-0 text-center font-mono leading-none text-muted-foreground">{preset.l3}</span>
      <span className="h-1 w-6 bg-muted-foreground/20 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] w-3 shrink-0 text-center font-mono leading-none">{preset.l1}</span>
      <span className="h-1 w-11 bg-muted-foreground/35 rounded-full" />
    </div>
  </button>
);

interface NumberCardProps {
  preset: NumberPreset;
  active?: boolean;
  onSelect: (preset: NumberPreset) => void;
}

const NumberCard = ({ preset, active, onSelect }: NumberCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(preset)}
    className={cn(
      'w-24 h-24 p-2 rounded-md border text-left flex flex-col justify-between transition-all cursor-pointer bg-card hover:bg-accent/40 hover:border-primary',
      active ? 'border-primary ring-1 ring-primary bg-accent/30' : 'border-border/80',
    )}
  >
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] w-4 shrink-0 font-mono font-medium leading-none">{preset.l1}</span>
      <span className="h-1 w-11 bg-muted-foreground/35 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5 pl-2.5">
      <span className="text-[8px] w-3.5 shrink-0 font-mono text-muted-foreground leading-none">{preset.l2}</span>
      <span className="h-1 w-8 bg-muted-foreground/25 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5 pl-2.5">
      <span className="text-[8px] w-3.5 shrink-0 font-mono text-muted-foreground leading-none">{preset.l2}</span>
      <span className="h-1 w-8 bg-muted-foreground/25 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5 pl-5">
      <span className="text-[8px] w-3 shrink-0 font-mono text-muted-foreground leading-none">{preset.l3}</span>
      <span className="h-1 w-5 bg-muted-foreground/20 rounded-full" />
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] w-4 shrink-0 font-mono font-medium leading-none">{preset.l1}</span>
      <span className="h-1 w-10 bg-muted-foreground/35 rounded-full" />
    </div>
  </button>
);

interface ChecklistCardProps {
  strikethrough?: boolean;
  onSelect: (strikethrough: boolean) => void;
}

const ChecklistCard = ({ strikethrough = false, onSelect }: ChecklistCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(strikethrough)}
    className="w-24 h-16 p-2 rounded-md border border-border/80 text-left flex flex-col justify-around transition-all cursor-pointer bg-card hover:bg-accent/40 hover:border-primary"
  >
    <div className="flex items-center gap-2">
      <span className="size-3 rounded-xs border border-muted-foreground/70 shrink-0" />
      <span className="h-1.5 w-12 bg-muted-foreground/35 rounded-full" />
    </div>
    <div className="flex items-center gap-2">
      <span className="size-3 rounded-xs bg-primary text-primary-foreground flex items-center justify-center text-[9px] shrink-0 font-bold leading-none">✓</span>
      <span className={cn('h-1.5 w-12 bg-muted-foreground/35 rounded-full relative', strikethrough && 'after:content-[""] after:absolute after:inset-x-0 after:top-1/2 after:h-0.5 after:bg-foreground/70')} />
    </div>
  </button>
);

export interface BulletListDropdownProps {
  active?: boolean;
  label?: string;
  onToggle: () => void;
  onSelectPreset: (preset: BulletPreset) => void;
  onSelectChecklist?: (strikethrough: boolean) => void;
}

export const BulletListDropdown = ({
  active = false,
  label = 'Danh sách dấu đầu dòng',
  onToggle,
  onSelectPreset,
  onSelectChecklist,
}: BulletListDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [checklistSubOpen, setChecklistSubOpen] = useState(false);

  return (
    <div className="inline-flex items-center rounded">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={label}
              onClick={onToggle}
              className={cn(
                'inline-flex items-center justify-center size-7 p-0 rounded-r-none text-foreground/80 hover:text-foreground hover:bg-hover transition-colors',
                active && 'bg-primary/15 text-primary',
              )}
            >
              <Icon name="list" size={16} />
            </Button>
          }
        />
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`${label} options`}
              className={cn(
                'h-7 w-3.5 p-0 rounded-l-none text-muted-foreground hover:text-foreground hover:bg-hover transition-colors',
                open && 'bg-primary/15 text-primary',
              )}
            >
              <Icon name="chevron-down" size={10} />
            </Button>
          }
        />
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="p-2 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg flex flex-col gap-2 relative w-auto"
        >
          <div className="grid grid-cols-3 gap-2">
            {BULLET_PRESETS.map((preset) => (
              <BulletCard
                key={preset.id}
                preset={preset}
                onSelect={(p) => {
                  onSelectPreset(p);
                  setOpen(false);
                }}
              />
            ))}
          </div>

          {onSelectChecklist && (
            <div
              className="relative border-t border-border pt-1.5 mt-1"
              onMouseEnter={() => setChecklistSubOpen(true)}
              onMouseLeave={() => setChecklistSubOpen(false)}
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded hover:bg-accent text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setChecklistSubOpen((prev) => !prev)}
              >
                <Icon name="list-todo" size={14} className="text-muted-foreground" />
                <span className="flex-1 text-left">Checklist menu</span>
                <Icon name="chevron-right" size={12} className="text-muted-foreground" />
              </button>

              {checklistSubOpen && (
                <div className="absolute left-full top-0 ml-1 p-2 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg flex gap-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <ChecklistCard
                    strikethrough={true}
                    onSelect={(st) => {
                      onSelectChecklist(st);
                      setOpen(false);
                      setChecklistSubOpen(false);
                    }}
                  />
                  <ChecklistCard
                    strikethrough={false}
                    onSelect={(st) => {
                      onSelectChecklist(st);
                      setOpen(false);
                      setChecklistSubOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export interface NumberedListDropdownProps {
  active?: boolean;
  label?: string;
  onToggle: () => void;
  onSelectPreset: (preset: NumberPreset) => void;
}

export const NumberedListDropdown = ({
  active = false,
  label = 'Danh sách đánh số',
  onToggle,
  onSelectPreset,
}: NumberedListDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-flex items-center rounded">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={label}
              onClick={onToggle}
              className={cn(
                'inline-flex items-center justify-center size-7 p-0 rounded-r-none text-foreground/80 hover:text-foreground hover:bg-hover transition-colors',
                active && 'bg-primary/15 text-primary',
              )}
            >
              <Icon name="list-ordered" size={16} />
            </Button>
          }
        />
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`${label} options`}
              className={cn(
                'h-7 w-3.5 p-0 rounded-l-none text-muted-foreground hover:text-foreground hover:bg-hover transition-colors',
                open && 'bg-primary/15 text-primary',
              )}
            >
              <Icon name="chevron-down" size={10} />
            </Button>
          }
        />
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="p-2 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg w-auto"
        >
          <div className="grid grid-cols-3 gap-2">
            {NUMBER_PRESETS.map((preset) => (
              <NumberCard
                key={preset.id}
                preset={preset}
                onSelect={(p) => {
                  onSelectPreset(p);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export interface ChecklistDropdownProps {
  active?: boolean;
  label?: string;
  onToggle: () => void;
  onSelectStyle: (strikethrough: boolean) => void;
}

export const ChecklistDropdown = ({
  active = false,
  label = 'Danh sách việc cần làm',
  onToggle,
  onSelectStyle,
}: ChecklistDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-flex items-center rounded">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={label}
              onClick={onToggle}
              className={cn(
                'inline-flex items-center justify-center size-7 p-0 rounded-r-none text-foreground/80 hover:text-foreground hover:bg-hover transition-colors',
                active && 'bg-primary/15 text-primary',
              )}
            >
              <Icon name="check-square" size={16} />
            </Button>
          }
        />
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`${label} options`}
              className={cn(
                'h-7 w-3.5 p-0 rounded-l-none text-muted-foreground hover:text-foreground hover:bg-hover transition-colors',
                open && 'bg-primary/15 text-primary',
              )}
            >
              <Icon name="chevron-down" size={10} />
            </Button>
          }
        />
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="p-2 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg flex gap-2 w-auto"
        >
          <ChecklistCard
            strikethrough={true}
            onSelect={(st) => {
              onSelectStyle(st);
              setOpen(false);
            }}
          />
          <ChecklistCard
            strikethrough={false}
            onSelect={(st) => {
              onSelectStyle(st);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
