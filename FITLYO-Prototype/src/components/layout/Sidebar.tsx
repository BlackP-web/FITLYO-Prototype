import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  QrCode,
  Award,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { BrandLogo } from '@/components/brand/BrandLogo'

export interface NavItem {
  title?: string
  label?: string
  href?: string
  path?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  screenId?: string
}

interface NavGroup {
  groupName: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    groupName: 'Cốt Lõi Social Matchmaking',
    items: [
      {
        title: 'Bảng tin Ghép trận DUPR',
        href: '/matches',
        icon: Users,
        badge: 'Core',
        screenId: 'SCR_MATCH_01',
      },
      {
        title: 'Chi tiết Kèo & Vé QR Check-in',
        href: '/matches/detail',
        icon: QrCode,
        badge: 'QR',
        screenId: 'SCR_MATCH_02',
      },
      {
        title: 'Cụm sân Pickleball Thủ Đức',
        href: '/venues',
        icon: MapPin,
        screenId: 'SCR_VENUE_01',
      },
    ],
  },
  {
    groupName: 'Khám phá hệ sinh thái',
    items: [
      {
        title: 'Danh bạ HLV & PT Booking',
        href: '/coaches',
        icon: Award,
        badge: 'Certified',
        screenId: 'SCR_BOOK_COACH_01',
      },
    ],
  },
  {
    groupName: 'Tài khoản người chơi',
    items: [
      {
        title: 'Landing Page Nền tảng',
        href: '/player',
        icon: Home,
        screenId: 'SCR_PUB_01',
      },
    ],
  },
]

export function Sidebar() {
  const { isSidebarOpen, currentUser } = useFitlyoStore()

  if (!isSidebarOpen) {
    return null
  }

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-68 shrink-0 border-r bg-card/70 backdrop-blur-md p-4 overflow-y-auto hidden md:block">
      <div className="flex h-full flex-col justify-between space-y-6">
        <div className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
                {group.groupName}
              </p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const toPath = item.path || item.href || '/'
                  const itemTitle = item.label || item.title || ''
                  return (
                    <NavLink
                      key={toPath}
                      to={toPath}
                      end={toPath === '/'}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 outline-none",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]"
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="truncate">{itemTitle}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0",
                            item.badge === 'Core'
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : item.badge === 'QR'
                              ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                              : item.badge === '6 Slot'
                              ? "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                              : "bg-primary/20 text-primary"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer info box */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center justify-between">
            <BrandLogo className="h-5 w-auto" />
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
              v1.0.0
            </span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Trải nghiệm thống nhất theo nhận diện FITLYO mới.
          </p>
          <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px]">
            <span>DUPR hiện tại:</span>
            <b className="text-foreground">{currentUser.duprRating}</b>
          </div>
        </div>
      </div>
    </aside>
  )
}
