import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AdminPageHeaderProps {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  actions?: React.ReactNode
}

export function AdminPageHeader({ eyebrow, title, description, icon: Icon, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end">
      <div className="max-w-3xl">
        <Badge variant="outline" className="mb-3 gap-1.5 border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-wider text-primary">
          <Icon className="h-3.5 w-3.5" /> {eyebrow}
        </Badge>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
