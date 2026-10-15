import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface PlayerPageHeaderProps {
  eyebrow: string
  title: string
  description: string
  icon?: LucideIcon
  action?: ReactNode
}

export function PlayerPageHeader({ eyebrow, title, description, icon: Icon, action }: PlayerPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl space-y-2">
        <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {eyebrow}
        </Badge>
        <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
