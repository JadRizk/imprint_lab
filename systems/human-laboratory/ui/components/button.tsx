import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn, focusRing } from '../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-mono font-bold uppercase tracking-label',
    'transition-colors duration-300',
    'disabled:pointer-events-none disabled:opacity-40',
    focusRing,
    // Every variant carries a border box so heights match across a row,
    // even when the border itself is invisible (see `ghost`).
    'border'
  ],
  {
    variants: {
      variant: {
        primary: [
          'border-accent bg-accent text-accent-ink',
          'hover:bg-transparent hover:text-accent'
        ],
        outline: [
          'border-line bg-transparent text-ink-muted',
          'hover:border-accent hover:text-accent'
        ],
        ghost: ['border-transparent bg-transparent text-ink-muted', 'hover:text-accent'],
        tag: [
          'border-line bg-transparent text-ink-subtle',
          'hover:border-accent hover:bg-accent hover:text-accent-ink'
        ]
      },
      // Heights are explicit and land on the 4px spacing grid, so an icon
      // button is exactly as tall as the text button of the same size.
      size: {
        sm: 'h-6 px-3 text-micro',
        default: 'h-9 px-6 text-xs',
        lg: 'h-12 px-8 text-sm',
        iconSm: 'h-6 w-6 p-0',
        icon: 'h-9 w-9 p-0',
        iconLg: 'h-12 w-12 p-0'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';

  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

export { Button, buttonVariants };
export type { ButtonProps };
