import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@office/ui-kit';
import { cn } from '@office/ui-kit';
import type { ReactNode } from 'react';

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  label: string;
  tone?: 'default' | 'danger';
  children: ReactNode;
  onClick: () => void;
}

export const ToolbarButton = ({
  active = false,
  disabled = false,
  label,
  tone = 'default',
  children,
  onClick,
}: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <Button
          aria-label={label}
          title={tone === 'danger' ? label : undefined}
          variant={tone === 'danger' ? 'destructive' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            'h-7 min-w-7 px-1.5 gap-1 text-xs font-normal shrink-0',
            active && 'bg-accent text-accent-foreground font-medium',
          )}
        />
      }
    >
      <span className="flex items-center justify-center gap-1 [&_.inet-icon]:size-4 [&_svg]:size-4 shrink-0">
        {children}
      </span>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);