import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn, focusRing } from '../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    // font-semibold, not bold: 700 is the heading weight, and a button set in
    // it competes with the headings around it. 600 holds a tracked, uppercase
    // label at these sizes without shouting.
    'font-mono font-semibold uppercase tracking-label',
    // Box-shadow is in the list because the press state emits, and
    // `transition-colors` does not cover it — the glow would snap off on
    // release while the colour faded, which reads as two separate events.
    'transition-[color,background-color,border-color,box-shadow]',
    // The asymmetry IS the feedback. `duration-ack` is zero, so the press lands
    // on the frame the pointer goes down; releasing drops back to `state` and
    // the button decays out of it. Equal timing in both directions is what made
    // the old `duration-300` feel like the button was animating rather than
    // answering.
    'duration-state active:duration-ack',
    'disabled:pointer-events-none disabled:opacity-40',
    focusRing,
    // Every variant carries a border box so heights match across a row,
    // even when the border itself is invisible (see `ghost`).
    'border'
  ],
  {
    variants: {
      // Every variant converges on the same press: an accent edge, plus
      // emission. A press is the one moment the machine is unambiguously live —
      // BRAND.md already assigns glow to "focus, active, live", and `:active`
      // is that state literally — so acknowledging a press costs no new colour
      // and spends nothing from the accent's budget that the accent does not
      // already own.
      //
      // The press has to differ from BOTH rest and hover, because touch has no
      // hover at all: before this, a button on a phone gave no feedback of any
      // kind between the tap and the navigation.
      //
      // No transform. A scale would land these hard 1px borders on fractional
      // pixels and shimmer — the same reason BentoCard refuses it on hover.
      variant: {
        primary: [
          'border-accent bg-accent text-accent-ink',
          'hover:bg-transparent hover:text-accent',
          // Snaps back to filled and lights up. From hover the fill returns;
          // from rest the glow arrives. Both are visible, which an inversion to
          // an accent-ink fill would not be: it is pure black, and pure black
          // reaches only 1.14:1 against this canvas.
          'active:bg-accent active:text-accent-ink active:shadow-glow'
        ],
        outline: [
          'border-line bg-transparent text-ink-muted',
          'hover:border-accent hover:text-accent',
          'active:border-accent active:text-accent active:shadow-glow'
        ],
        ghost: [
          'border-transparent bg-transparent text-ink-muted',
          'hover:text-accent',
          // Ghost carries its border box invisibly so heights match; the press
          // is where it draws it, so the glow has an edge to sit on.
          'active:border-accent active:text-accent active:shadow-glow'
        ],
        tag: [
          'border-line bg-transparent text-ink-subtle',
          'hover:border-accent hover:bg-accent hover:text-accent-ink',
          'active:border-accent active:bg-accent active:text-accent-ink active:shadow-glow'
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
