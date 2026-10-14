import React from 'react'
import { NavLink } from 'react-router-dom'
import { Users, Calendar, Award, ShieldCheck, UserCheck, Building2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const BottomBar: React.FC = () => {
  const { activeRole, currentUser } = useFitlyoStore()
  const currentRole =
    activeRole === 'fm' || (activeRole as string) === 'field_manager'
      ? 'field_manager'
      : activeRole || currentUser?.role || 'player'

  const items = [
    { label: 'Ghép trận', href: '/matches', icon: Users },
    currentRole === 'field_manager'
      ? { label: 'Manager', href: '/app/field-manager', icon: Building2 }
      : { label: 'Cụm sân', href: '/venues', icon: MapPin },
    { label: 'HLV & Khóa', href: '/coaches', icon: Award },
    { label: 'Thẩm định', href: '/admin/approvals', icon: ShieldCheck },
    { label: 'Hồ sơ DUPR', href: '/profile', icon: UserCheck },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-border/80 bg-background/95 backdrop-blur-md px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all duration-200 active:scale-95",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "p-1 rounded-lg transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="mt-0.5 leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
