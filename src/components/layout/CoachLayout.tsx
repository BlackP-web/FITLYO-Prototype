import {
  BadgeDollarSign,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  LogOut,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { DemoDataResetButton } from '@/components/layout/DemoDataResetButton'
import { useAuthStore } from '@/store/useAuthStore'
import { SupportChatWidget } from '@/components/support/SupportChatWidget'

const coachNavigation = [
  { label: 'Tổng quan / Lịch dạy', shortLabel: 'Lịch dạy', to: '/coach/schedule', icon: CalendarDays },
  { label: 'Học viên & Tin nhắn', shortLabel: 'Học viên', to: '/coach/bookings', icon: MessagesSquare },
  { label: 'Khóa học', shortLabel: 'Khóa học', to: '/coach/courses', icon: BookOpenCheck },
  { label: 'Điểm danh / Đánh giá', shortLabel: 'Đánh giá', to: '/coach/attendance', icon: ClipboardCheck },
  { label: 'Cụm sân liên kết', shortLabel: 'Cụm sân', to: '/coach/venues', icon: Building2 },
  { label: 'Hồ sơ của tôi', shortLabel: 'Hồ sơ', to: '/coach/profile', icon: UserRound },
  { label: 'Xác minh hồ sơ', shortLabel: 'Xác minh', to: '/coach/verification', icon: ShieldCheck },
  { label: 'Thu nhập / Ví', shortLabel: 'Ví', to: '/coach/wallet', icon: BadgeDollarSign },
]

export default function CoachLayout() {
  const navigate = useNavigate()
  const { coachAccount, toastMessage, clearToast } = useFitlyoStore()
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-7 w-auto sm:h-8" />
          <div className="hidden border-l border-border pl-3 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Coach Portal</p>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Tài khoản đã xác thực
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DemoDataResetButton />
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 shadow-sm">
            <img src={coachAccount.avatarUrl} alt={coachAccount.name} className="h-8 w-8 rounded-lg object-cover" />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold leading-none">{coachAccount.name}</p>
              <p className="mt-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">{coachAccount.certificateTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
              className="ml-1 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Thoát chế độ Coach"
              title="Thoát chế độ Coach"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-card px-3 py-2 md:hidden">
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {coachNavigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {item.shortLabel}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card p-4 md:block">
          <div className="mb-5 rounded-2xl border border-primary/15 bg-secondary/35 p-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold">Coach đã được duyệt</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Bạn chỉ có thể quản lý khóa học, lịch dạy và học viên thuộc tài khoản của mình.
            </p>
          </div>

          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Không gian làm việc</p>
          <nav className="space-y-1">
            {coachNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/45 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {toastMessage && (
        <div className="fixed right-4 top-20 z-[80] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className={cn(
            'flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-medium shadow-xl sm:text-sm',
            toastMessage.type === 'success' && 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/20',
            toastMessage.type === 'error' && 'border-red-500 bg-red-600 text-white shadow-red-500/20',
            toastMessage.type === 'info' && 'border-border bg-card text-foreground shadow-md',
          )}>
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
