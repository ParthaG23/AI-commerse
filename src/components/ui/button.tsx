import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   BUTTON VARIANTS
   All original shadcn variants preserved + Nuvix brand variants
───────────────────────────────────────────────────────────── */
const buttonVariants = cva(
  /* ── Base ── */
  [
    'relative inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-xl text-sm font-bold',
    'transition-all duration-200 select-none',
    'shrink-0 outline-none',
    /* disabled */
    'disabled:pointer-events-none disabled:opacity-50',
    /* svg children */
    '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
    /* focus ring — uses Nuvix indigo */
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#07091a]',
    /* aria-invalid */
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    /* active press */
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        /* ── shadcn originals (preserved) ── */
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/30 dark:bg-destructive/70',
        outline:
          'border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-white/70 shadow-xs hover:bg-slate-50 dark:hover:bg-white/[0.07] hover:text-slate-900 dark:hover:text-white',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/[0.06]',
        link:
          'text-primary underline-offset-4 hover:underline active:scale-100',

        /* ── Nuvix brand variants ── */

        /** Indigo → cyan gradient — primary CTA */
        brand:
          'bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:brightness-110',

        /** Flat indigo — secondary CTA */
        'brand-solid':
          'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20',

        /** Outlined indigo — tertiary / cancel alternative */
        'brand-outline':
          'border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/[0.08] text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/[0.15] hover:border-indigo-300 dark:hover:border-indigo-500/50',

        /** Ghost indigo — nav links, icon buttons */
        'brand-ghost':
          'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300',

        /** Danger — destructive actions with Nuvix styling */
        danger:
          'bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 shadow-sm',

        /** Success confirmation state */
        success:
          'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 shadow-sm',
      },

      size: {
        /* ── shadcn originals (preserved) ── */
        default:  'h-9 px-4 py-2 text-sm has-[>svg]:px-3',
        sm:       'h-8 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5',
        lg:       'h-11 rounded-xl px-6 text-sm has-[>svg]:px-4',
        icon:     'size-9 rounded-xl p-0',
        'icon-sm':'size-8 rounded-lg p-0',
        'icon-lg':'size-11 rounded-xl p-0',

        /* ── Nuvix extras ── */
        xs:  'h-7 rounded-lg gap-1 px-2.5 text-[10px] font-black uppercase tracking-widest has-[>svg]:px-2',
        xl:  'h-12 rounded-xl px-8 text-sm font-black has-[>svg]:px-6',
        '2xl':'h-14 rounded-2xl px-10 text-base font-black has-[>svg]:px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/* ─────────────────────────────────────────────────────────────
   PROPS
───────────────────────────────────────────────────────────── */
export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner and disables interaction while true */
  loading?: boolean;
  /** Text shown next to the spinner (defaults to children) */
  loadingText?: string;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      data-slot="button"
      data-loading={loading ? 'true' : undefined}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            className="animate-spin shrink-0"
            aria-hidden="true"
          />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };