import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Dumbbell,
  PlusCircle,
  Apple,
  TrendingUp,
  Users,
  Award,
  CalendarDays,
  ShoppingBag,
  UserCheck,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export const navigationItems: NavItem[] = [
  { title: "Dashboard Tổng quan", href: "/", icon: LayoutDashboard },
  { title: "Kho Bài tập", href: "/workouts", icon: Dumbbell, badge: "Hot" },
  { title: "Tạo Bài tập mới", href: "/workouts/create", icon: PlusCircle },
  { title: "Chế độ Dinh dưỡng", href: "/nutrition", icon: Apple },
  { title: "Theo dõi Tiến độ", href: "/progress", icon: TrendingUp },
  { title: "Lịch tập & Nhắc nhở", href: "/schedule", icon: CalendarDays },
  { title: "Cộng đồng & Thử thách", href: "/community", icon: Users, badge: "New" },
  { title: "Đội ngũ Huấn luyện viên", href: "/trainers", icon: Award },
  { title: "Cửa hàng & Gói thành viên", href: "/store", icon: ShoppingBag },
  { title: "Báo cáo & Thống kê", href: "/reports", icon: BarChart3 },
  { title: "Hồ sơ Cá nhân", href: "/profile", icon: UserCheck },
  { title: "Cài đặt Hệ thống", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { isSidebarOpen } = useAppStore()

  if (!isSidebarOpen) {
    return null
  }

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-card/60 backdrop-blur p-4">
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Điều hướng ({navigationItems.length} Màn hình)
          </p>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        item.badge === "Hot"
                          ? "bg-brand-orange/15 text-brand-orange dark:text-brand-orange font-bold"
                          : "bg-brand-forest/15 text-brand-forest dark:text-brand-amber font-bold"
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

        <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">FITLYO Prototype v1.0</p>
          <p className="mt-1">React + Vite + Tailwind + shadcn/ui</p>
        </div>
      </div>
    </aside>
  )
}
