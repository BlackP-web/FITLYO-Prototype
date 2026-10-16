import { CalendarDays, Compass, GraduationCap, MapPinned, Trophy, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Khám phá', href: '/player', icon: Compass, end: true },
  { label: 'Kèo đấu', href: '/player/matches', icon: Trophy },
  { label: 'Đặt sân', href: '/player/venues', icon: MapPinned },
  { label: 'HLV', href: '/player/coaching', icon: GraduationCap },
  { label: 'Lịch chơi', href: '/player/schedule', icon: CalendarDays },
  { label: 'Hồ sơ', href: '/player/profile', icon: UserRound },
]

export function BottomBar() {
  return (
    <nav className="fitlyo-nav-shell fixed bottom-3 left-3 right-3 z-50 rounded-[1.65rem] p-1.5 md:hidden" aria-label="Điều hướng Player trên điện thoại">
      <div className="grid grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.href} to={item.href} end={item.end} className={({ isActive }) => cn('relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition-all', isActive ? 'text-primary' : 'text-muted-foreground')}>
              {({ isActive }) => <><Icon className={cn('h-5 w-5', isActive && 'stroke-[2.6]')} /><span>{item.label}</span>{isActive && <span className="absolute bottom-0 h-1 w-8 rounded-full bg-secondary" />}</>}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
