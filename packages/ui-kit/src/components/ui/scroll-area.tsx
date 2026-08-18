import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import * as React from 'react';
import { cn } from '../../cn';

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root>
>(({ className, children, ...props }, ref) => (
  <BaseScrollArea.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
    <BaseScrollArea.Viewport className="h-full w-full rounded-[inherit] overflow-y-auto overscroll-contain">
      {children}
    </BaseScrollArea.Viewport>
    <BaseScrollArea.Scrollbar orientation="vertical" className="w-2 p-px">
      <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border" />
    </BaseScrollArea.Scrollbar>
    <BaseScrollArea.Scrollbar orientation="horizontal" className="h-2 p-px">
      <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border" />
    </BaseScrollArea.Scrollbar>
    <BaseScrollArea.Corner className="bg-border" />
  </BaseScrollArea.Root>
));
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
