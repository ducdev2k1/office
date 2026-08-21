import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import * as React from 'react';
import { cn } from '../../cn';
import { Icon } from '../../icons';

const ContextMenu = BaseContextMenu.Root;
const ContextMenuTrigger = BaseContextMenu.Trigger;
const ContextMenuGroup = BaseContextMenu.Group;
const ContextMenuPortal = BaseContextMenu.Portal;
const ContextMenuSub = BaseContextMenu.SubmenuRoot;

const ContextMenuContent = ({
  className,
  anchor,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseContextMenu.Popup> & {
  anchor?: React.ComponentPropsWithoutRef<typeof BaseContextMenu.Positioner>['anchor'];
}) => {
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner anchor={anchor} className="z-50">
        <BaseContextMenu.Popup
          className={cn(
            'min-w-48 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg transition-all duration-100 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        />
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
};
ContextMenuContent.displayName = 'ContextMenuContent';

const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Item> & { inset?: boolean; danger?: boolean }
>(({ className, inset, danger, ...props }, ref) => (
  <BaseContextMenu.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
      danger && 'text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = 'ContextMenuItem';

const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.SubmenuTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <BaseContextMenu.SubmenuTrigger
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <Icon name="chevron-right" size={14} className="ml-auto text-muted-foreground" />
  </BaseContextMenu.SubmenuTrigger>
));
ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Popup>
>(({ className, ...props }, ref) => (
  <BaseContextMenu.Portal>
    <BaseContextMenu.Positioner side="right" align="start" sideOffset={2} alignOffset={-4} className="z-50">
      <BaseContextMenu.Popup
        ref={ref}
        className={cn(
          'min-w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg transition-all duration-100 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
          className,
        )}
        {...props}
      />
    </BaseContextMenu.Positioner>
  </BaseContextMenu.Portal>
));
ContextMenuSubContent.displayName = 'ContextMenuSubContent';

const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Separator>
>(({ className, ...props }, ref) => (
  <BaseContextMenu.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <kbd
      className={cn('ml-auto rounded bg-muted/60 px-1 py-0.5 font-mono text-[10px] text-muted-foreground', className)}
      {...props}
    />
  );
};
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuShortcut,
};

