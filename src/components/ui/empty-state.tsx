import React from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 sm:p-12 text-center duration-200",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs ring-8 ring-primary/5 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button onClick={onAction} className="shadow-xs active:scale-[0.98]">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className="active:scale-[0.98]"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
