import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../cn';

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  children: ReactNode;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ label, active, disabled, children, className, onClick, ...props }, ref) => (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            ref={ref}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
              'h-7 min-w-7 px-1.5 rounded text-foreground/80 hover:text-foreground hover:bg-hover transition-colors shrink-0',
              active && 'bg-primary/15 text-primary hover:bg-primary/20',
              disabled && 'opacity-40 pointer-events-none',
              className,
            )}
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        {label}
      </TooltipContent>
    </Tooltip>
  ),
);

ToolbarButton.displayName = 'ToolbarButton';
