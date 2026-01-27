'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-mono font-bold uppercase tracking-widest',
    'transition-colors duration-300',
    'disabled:pointer-events-none disabled:opacity-40',
    'focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2'
  ],
  {
    variants: {
      variant: {
        primary: ['bg-lime text-black border border-lime', 'hover:bg-transparent hover:text-lime'],
        outline: [
          'border border-steel bg-transparent text-text-secondary',
          'hover:border-lime hover:text-lime'
        ],
        ghost: ['border-transparent bg-transparent text-text-secondary', 'hover:text-lime'],
        tag: [
          'border border-steel bg-transparent text-text-tertiary',
          'hover:bg-lime hover:text-black hover:border-lime'
        ]
      },
      size: {
        sm: 'px-3 py-1 text-[10px]',
        default: 'px-6 py-2 text-xs',
        lg: 'px-8 py-3 text-sm',
        icon: 'h-12 w-12 p-0'
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
