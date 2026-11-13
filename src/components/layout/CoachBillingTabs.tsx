import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Phí coaching', to: '/coach/billing/coaching' },
  { label: 'Phí liên kết sân', to: '/coach/billing/link' },
]

export function CoachBillingTabs() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Thanh toán hoá đơn</p>
      <nav aria-label="Loại hoá đơn" className="mt-1 flex flex-wrap items-end gap-6 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => cn(
              '-mb-px border-b-2 pb-2 text-2xl font-black tracking-tight transition-colors sm:text-3xl',
              isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground/60 hover:text-foreground',
            )}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
