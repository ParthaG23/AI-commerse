import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// NUVIX CARD SYSTEM
// Refined luxury-tech aesthetic: glass surfaces, ambient glows, micro-borders.
// Every sub-component is a drop-in replacement for the shadcn originals.
// ─────────────────────────────────────────────────────────────────────────────

// ── Variant map ──────────────────────────────────────────────────────────────
const cardVariants = {
  /** Default — white glass surface, subtle indigo border */
  default: [
    "relative bg-white/90 dark:bg-[#0d1027]/90",
    "border border-indigo-100/80 dark:border-indigo-500/10",
    "shadow-[0_2px_12px_rgba(79,70,229,0.07),0_1px_3px_rgba(0,0,0,0.04)]",
    "dark:shadow-[0_4px_24px_rgba(0,0,0,0.35),0_1px_4px_rgba(0,0,0,0.2)]",
    "hover:shadow-[0_6px_28px_rgba(79,70,229,0.12),0_2px_6px_rgba(0,0,0,0.06)]",
    "dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.45),0_2px_8px_rgba(0,0,0,0.25)]",
    "hover:border-indigo-200/70 dark:hover:border-indigo-500/20",
    "transition-all duration-300 ease-out",
  ],

  /** Elevated — stronger glow, for hero or featured cards */
  elevated: [
    "relative bg-white dark:bg-[#0d1027]",
    "border border-indigo-200/60 dark:border-indigo-500/15",
    "shadow-[0_8px_40px_rgba(79,70,229,0.13),0_2px_8px_rgba(0,0,0,0.06)]",
    "dark:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]",
    "hover:shadow-[0_16px_56px_rgba(79,70,229,0.18),0_4px_12px_rgba(0,0,0,0.08)]",
    "hover:-translate-y-0.5",
    "transition-all duration-300 ease-out",
  ],

  /** Ghost — borderless, background-less; used inside already-surfaced panels */
  ghost: [
    "relative bg-transparent border-none shadow-none",
    "hover:bg-indigo-50/50 dark:hover:bg-indigo-500/[0.04]",
    "transition-colors duration-200",
  ],

  /** Glow — brand gradient border glow, for CTAs or AI-powered cards */
  glow: [
    "relative bg-white dark:bg-[#0d1027]",
    "border border-transparent",
    "shadow-[0_4px_24px_rgba(79,70,229,0.14),0_1px_4px_rgba(0,0,0,0.06)]",
    "dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]",
    "hover:shadow-[0_8px_36px_rgba(79,70,229,0.22),0_2px_8px_rgba(0,0,0,0.08)]",
    "hover:-translate-y-0.5",
    "transition-all duration-300 ease-out",
    // gradient border via pseudo-element (handled in GlowBorder below)
    "before:absolute before:inset-0 before:rounded-[inherit]",
    "before:p-px before:bg-gradient-to-br before:from-indigo-400/60 before:via-violet-400/30 before:to-cyan-400/50",
    "before:dark:from-indigo-500/50 before:dark:via-violet-500/20 before:dark:to-cyan-500/40",
    "before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
    "before:[mask-composite:exclude]",
    "before:pointer-events-none",
  ],

  /** Destructive — for warnings or error states */
  destructive: [
    "relative bg-red-50/80 dark:bg-red-950/30",
    "border border-red-200/70 dark:border-red-500/20",
    "shadow-[0_2px_12px_rgba(239,68,68,0.07)]",
    "dark:shadow-[0_4px_24px_rgba(239,68,68,0.08),0_1px_4px_rgba(0,0,0,0.2)]",
    "transition-all duration-200",
  ],
} as const

export type CardVariant = keyof typeof cardVariants

// ── Card (root) ──────────────────────────────────────────────────────────────
export interface CardProps extends React.ComponentProps<"div"> {
  variant?: CardVariant
  /** Adds a thin shimmer line at the very top edge */
  shimmer?: boolean
  /** Adds a soft ambient glow blob behind the card */
  ambient?: boolean
}

function Card({
  className,
  variant = "default",
  shimmer = false,
  ambient = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        // Base shape
        "flex flex-col gap-0 rounded-2xl overflow-hidden",
        // Variant styles
        cardVariants[variant],
        className
      )}
      {...props}
    >
      {/* Optional top shimmer line */}
      {shimmer && (
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent dark:via-indigo-400/30 pointer-events-none z-10"
        />
      )}

      {/* Optional ambient glow blob */}
      {ambient && (
        <span
          aria-hidden="true"
          className="absolute -inset-4 rounded-[32px] bg-indigo-500/[0.06] dark:bg-indigo-500/[0.08] blur-2xl pointer-events-none -z-10"
        />
      )}

      {children}
    </div>
  )
}

// ── CardHeader ───────────────────────────────────────────────────────────────
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // Support for optional CardAction in top-right
        "@container/card-header",
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5",
        "px-5 pt-5 pb-0",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

// ── CardTitle ────────────────────────────────────────────────────────────────
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-semibold leading-snug tracking-[-0.01em]",
        "text-slate-900 dark:text-white",
        "text-[15px]",
        className
      )}
      {...props}
    />
  )
}

// ── CardDescription ──────────────────────────────────────────────────────────
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-[12.5px] leading-relaxed",
        "text-slate-500 dark:text-slate-400",
        className
      )}
      {...props}
    />
  )
}

// ── CardAction ───────────────────────────────────────────────────────────────
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1",
        "self-start justify-self-end",
        "-mt-0.5",
        className
      )}
      {...props}
    />
  )
}

// ── CardContent ──────────────────────────────────────────────────────────────
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-5 py-4",
        className
      )}
      {...props}
    />
  )
}

// ── CardFooter ───────────────────────────────────────────────────────────────
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3",
        "px-5 py-3.5",
        "border-t border-slate-100 dark:border-white/[0.06]",
        "bg-slate-50/60 dark:bg-white/[0.015]",
        className
      )}
      {...props}
    />
  )
}

// ── CardDivider ──────────────────────────────────────────────────────────────
// Bonus: a clean section divider for use inside CardContent
function CardDivider({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      className={cn(
        "border-none h-px my-1",
        "bg-gradient-to-r from-transparent via-slate-200/80 to-transparent",
        "dark:via-white/[0.07]",
        className
      )}
      {...props}
    />
  )
}

// ── CardBadge ────────────────────────────────────────────────────────────────
// Bonus: a status/label pill designed to live inside CardAction
const badgeVariants = {
  default:     "bg-indigo-50  text-indigo-600  dark:bg-indigo-500/10  dark:text-indigo-400  border-indigo-100  dark:border-indigo-500/20",
  success:     "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
  warning:     "bg-amber-50   text-amber-600   dark:bg-amber-500/10   dark:text-amber-400   border-amber-100   dark:border-amber-500/20",
  destructive: "bg-red-50     text-red-600     dark:bg-red-500/10     dark:text-red-400     border-red-100     dark:border-red-500/20",
  neutral:     "bg-slate-100  text-slate-600   dark:bg-white/[0.07]   dark:text-slate-300   border-slate-200   dark:border-white/[0.1]",
} as const

export interface CardBadgeProps extends React.ComponentProps<"span"> {
  variant?: keyof typeof badgeVariants
}

function CardBadge({
  className,
  variant = "default",
  ...props
}: CardBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "px-2.5 py-0.5 rounded-full",
        "text-[10px] font-bold uppercase tracking-wider",
        "border",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

// ── CardStat ─────────────────────────────────────────────────────────────────
// Bonus: metric display block (number + label) for dashboard cards
function CardStat({
  label,
  value,
  trend,
  className,
}: {
  label: string
  value: React.ReactNode
  trend?: { value: string; up: boolean }
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-bold",
              trend.up
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            )}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardDivider,
  CardBadge,
  CardStat,
}