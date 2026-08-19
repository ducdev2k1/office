import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import * as React from 'react';
import { cn } from '../../cn';

const TooltipProvider = BaseTooltip.Provider;
const Tooltip = BaseTooltip.Root;
const TooltipTrigger = BaseTooltip.Trigger;

const TooltipContent = ({
  className,
  side = 'top',
  sideOffset = 6,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> & {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}) => (
  <BaseTooltip.Portal>
    <BaseTooltip.Positioner side={side} sideOffset={sideOffset} className="z-50">
      <BaseTooltip.Popup
        className={cn(
          'z-50 overflow-hidden rounded-md bg-neutral-900 border border-neutral-800/80 px-2.5 py-1 text-xs font-medium text-neutral-100 shadow-lg transition-all duration-150 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 select-none pointer-events-none backdrop-blur-sm',
          className,
        )}
        {...props}
      >
        {children}
      </BaseTooltip.Popup>
    </BaseTooltip.Positioner>
  </BaseTooltip.Portal>
);

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
