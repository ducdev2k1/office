import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import * as React from 'react';
import { cn } from '../../cn';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('relative inline-flex items-center rounded-lg bg-muted/30 p-1', className)}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tab>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Tab
    ref={ref}
    className={cn(
      'relative z-10 flex h-8 select-none items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors',
      'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'data-[active]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

/** Viên bo tròn trượt theo tab đang chọn; đặt bên trong TabsList */
const TabsIndicator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Indicator
    ref={ref}
    className={cn(
      'absolute top-0 left-0 z-0 rounded-md bg-background shadow-xs',
      'h-[var(--active-tab-height)] w-[var(--active-tab-width)]',
      'translate-x-[var(--active-tab-left)] translate-y-[var(--active-tab-top)]',
      'transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none',
      className,
    )}
    {...props}
  />
));
TabsIndicator.displayName = 'TabsIndicator';

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Panel>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Panel
    ref={ref}
    className={cn('outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger };
