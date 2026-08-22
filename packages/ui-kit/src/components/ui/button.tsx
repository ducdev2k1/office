import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow active:bg-emerald-800 font-semibold border border-emerald-600',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow active:bg-red-800 font-semibold border border-red-600',
        outline:
          'border border-border bg-background text-foreground/90 shadow-2xs hover:bg-muted hover:text-foreground active:bg-muted/80 font-medium',
        secondary:
          'bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80 active:bg-secondary/90 font-medium',
        ghost: 'hover:bg-muted hover:text-foreground active:bg-muted/80 font-medium',
        link: 'text-emerald-600 underline-offset-4 hover:underline active:opacity-80',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-8 text-base',
        icon: 'h-9 w-9 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-xs': 'h-7 w-7 rounded-md p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
