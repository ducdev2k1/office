import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import * as React from 'react';
import { Icon } from '../../icons';
import { cn } from '../../cn';

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'flex size-4.5 shrink-0 items-center justify-center rounded-[4px] border shadow-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      'disabled:pointer-events-none disabled:opacity-50',
      'border-input bg-background hover:border-primary/60',
      'data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <Icon name="check" size={12} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = 'Checkbox';

export { Checkbox };