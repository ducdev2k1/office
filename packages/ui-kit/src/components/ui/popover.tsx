import { Popover as BasePopover } from '@base-ui/react/popover';
import * as React from 'react';
import { cn } from '../../cn';

const Popover = BasePopover.Root;
const PopoverTrigger = BasePopover.Trigger;
const PopoverPortal = BasePopover.Portal;
const PopoverClose = BasePopover.Close;

const PopoverContent = ({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof BasePopover.Popup> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}) => (
  <BasePopover.Portal>
    <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
      <BasePopover.Popup
        className={cn(
          'z-50 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl outline-none transition-all duration-150 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
          className,
        )}
        {...props}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
);

export { Popover, PopoverTrigger, PopoverContent, PopoverPortal, PopoverClose };
