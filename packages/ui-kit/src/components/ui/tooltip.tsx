import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import * as React from 'react';
import { cn } from '../../cn';

const TooltipProvider = BaseTooltip.Provider;
const Tooltip = BaseTooltip.Root;
const TooltipTrigger = BaseTooltip.Trigger;

const TooltipContent = ({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> & { sideOffset?: number }) => (
  <BaseTooltip.Portal>
    <BaseTooltip.Positioner sideOffset={sideOffset} className="z-50">
      <BaseTooltip.Popup
        className={cn(
          'overflow-hidden rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background shadow-md transition-all duration-150 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
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
