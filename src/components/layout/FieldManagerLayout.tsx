import { BarChart3, BookOpen, Building2, CalendarDays, LogOut, QrCode, Settings, ShieldCheck, Sparkles } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { DemoDataResetButton } from '@/components/layout/DemoDataResetButton'
import { useAuthStore } from '@/store/useAuthStore'
import { SupportChatWidget } from '@/components/support/SupportChatWidget'

const ownerNavigation = [
  {
    label: 'Lịch sân',
    to: '/fm/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Quản lý sân',
    to: '/fm/courts',
    icon: Building2,
  },
  {
    label: 'Thông tin sân',
    to: '/fm/settings',
    icon: Settings,
  },
  {
    label: 'HLV liên kết',
    to: '/fm/coaches',
    icon: BookOpen,
  },
  {
    label: 'Báo cáo doanh thu',
    to: '/fm/reports',
    icon: BarChart3,
  },
  {
    label: 'Quầy QR Check-in',
    to: '/fm/checkin',
    icon: QrCode,
  },
  {
    label: 'Xác minh hồ sơ',
    to: '/fm/verification',
    icon: ShieldCheck,
  },
]

export default function FieldManagerLayout() {
  const navigate = useNavigate()
  const { toastMessage, clearToast } = useFitlyoStore()
  const { session, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-7 w-auto sm:h-8" />
          <div className="hidden border-l border-border pl-3 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Owner Portal</p>
            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">Cổng quản lý cụm sân</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DemoDataResetButton />
          <button
            type="button"
            onClick={() => navigate('/fm/checkin')}
            className="hidden items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/10 sm:flex"
          >
            <QrCode className="h-4 w-4" /> Kiosk QR
          </button>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-2.5 py-1.5">
            <img
              src={session?.avatarUrl}
              alt={session?.name}
              className="h-7 w-7 rounded-full object-cover"
            />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold leading-none">{session?.name}</p>
              <p className="mt-1 text-[10px] font-semibold text-primary">Chủ sân</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
              className="ml-1 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Đăng xuất tài khoản Chủ sân"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r bg-card p-4 md:block">
          <div className="mb-5 rounded-xl border border-primary/15 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold">{session?.isVerified ? 'Chủ sân đã được duyệt' : 'Chủ sân chưa được mở khóa'}</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {session?.isVerified ? 'Bạn chỉ có quyền điều hành lịch sân và kèo Social của cụm sân.' : 'Hãy hoàn tất hồ sơ pháp lý. Lịch sân và chức năng vận hành sẽ mở sau khi Admin phê duyệt.'}
            </p>
          </div>

          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Điều hành sân
          </p>
          <nav className="space-y-1">
            {ownerNavigation.map((item) => {
              const Icon = item.icon
              const locked = !session?.isVerified && !['/fm/settings', '/fm/verification'].includes(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-disabled={locked}
                  onClick={(event) => { if (locked) event.preventDefault() }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      locked && 'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-muted-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {!session?.isVerified && <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"><strong>Tài khoản Field Manager chưa được xác minh.</strong> Bạn chỉ có thể cập nhật thông tin và nộp hồ sơ; lịch sân, báo cáo và check-in đang bị khóa.</div>}
          <Outlet />
        </main>
      </div>

      {toastMessage && (
        <div className="fixed right-4 top-20 z-[80] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className={`flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-medium shadow-xl sm:text-sm ${toastMessage.type === 'success' ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/20' : toastMessage.type === 'error' ? 'border-destructive/80 bg-destructive text-destructive-foreground shadow-destructive/20' : 'border-border bg-card text-foreground shadow-md'}`}>
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{toastMessage.text}</span>
            <button type="button" onClick={clearToast} className="ml-2 opacity-80 hover:opacity-100" aria-label="Đóng thông báo">✕</button>
          </div>
        </div>
      )}
      <SupportChatWidget />
    </div>
  )
}
