import { BarChart3, BookOpen, Building2, CalendarDays, LogOut, Settings, ShieldCheck } from 'lucide-react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const ownerNavigation = [
  {
    label: 'Lịch sân',
    description: 'SCR_FM_01',
    to: '/fm/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Quản lý sân',
    description: 'SCR_FM_03',
    to: '/fm/courts',
    icon: Building2,
  },
  {
    label: 'Thông tin sân',
    description: 'SCR_FM_04',
    to: '/fm/settings',
    icon: Settings,
  },
  {
    label: 'HLV liên kết',
    description: 'SCR_FM_05',
    to: '/fm/coaches',
    icon: BookOpen,
  },
  {
    label: 'Báo cáo doanh thu',
    description: 'SCR_FM_06',
    to: '/fm/reports',
    icon: BarChart3,
  },
]

export default function FieldManagerLayout() {
  const navigate = useNavigate()
  const { activeRole, currentUser, setActiveRole } = useFitlyoStore()
  const isFieldManager = activeRole === 'fm' || activeRole === 'field_manager'

  if (!isFieldManager) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-primary">FITLYO OWNER</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cổng quản lý cụm sân
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-card px-2.5 py-1.5">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="h-7 w-7 rounded-full object-cover"
          />
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold leading-none">{currentUser.name}</p>
            <p className="mt-1 text-[10px] font-semibold text-primary">Chủ sân</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveRole('player')
              navigate('/')
            }}
            className="ml-1 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Đăng xuất tài khoản Chủ sân"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r bg-card p-4 md:block">
          <div className="mb-5 rounded-xl border border-primary/15 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold">Tài khoản Chủ sân</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Bạn chỉ có quyền điều hành lịch sân và kèo Social của cụm sân.
            </p>
          </div>

          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Điều hành sân
          </p>
          <nav className="space-y-1">
            {ownerNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] opacity-75">{item.description}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
