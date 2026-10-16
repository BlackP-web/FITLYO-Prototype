import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border border-secondary-foreground/10",
        success:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20",
        outline:
          "text-foreground border border-border/80",
        vip:
          "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold",
        match:
          "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        coaching:
          "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean
  pulseDot?: boolean
}

function Badge({
  className,
  variant,
  withDot,
  pulseDot = true,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {withDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current",
            pulseDot && "animate-pulse"
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
