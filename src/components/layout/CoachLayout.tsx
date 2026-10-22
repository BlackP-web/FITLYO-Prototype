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
import { useEffect } from 'react'
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
  const { coachAccount, auditApplications, activateCoachSession, toastMessage, clearToast } = useFitlyoStore()
  const { session, logout } = useAuthStore()
  const approvedApplication = auditApplications.find((application) => (
    application.type === 'COACH'
    && application.status === 'APPROVED'
    && application.sourceAccountId === session?.id
  ))
  const approvedCertificate = typeof approvedApplication?.applicationData?.certificateType === 'string'
    ? approvedApplication.applicationData.certificateType.replace(/\s+(Instructor|Coach)$/i, '')
    : undefined
  const coachReady = !session || coachAccount.id === session.id
  const displayName = session?.name ?? coachAccount.name
  const displayAvatar = session?.avatarUrl ?? coachAccount.avatarUrl
  const displayCertificate = coachReady
    ? coachAccount.certificateTitle
    : approvedCertificate ?? session?.title.replace(/^Coach\s*·\s*/i, '') ?? 'Coach đã xác thực'

  useEffect(() => {
    if (session?.role === 'coach') activateCoachSession(session)
  }, [activateCoachSession, session])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-7 w-auto sm:h-8" />
          <div className="hidden border-l border-border pl-3 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Coach Portal</p>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <ShieldCheck className={`h-3 w-3 ${session?.isVerified ? 'text-emerald-600' : 'text-amber-600'}`} /> {session?.isVerified ? 'Tài khoản đã xác thực' : 'Đang chờ xác minh'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DemoDataResetButton />
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 shadow-sm">
            <img src={displayAvatar} alt={displayName} className="h-8 w-8 rounded-lg object-cover" />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold leading-none">{displayName}</p>
              <p className="mt-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">{displayCertificate}</p>
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
            const locked = !session?.isVerified && !['/coach/profile', '/coach/verification'].includes(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-disabled={locked}
                onClick={(event) => { if (locked) event.preventDefault() }}
                className={({ isActive }) => cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  locked && 'cursor-not-allowed opacity-45',
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
              <span className="text-xs font-bold">{session?.isVerified ? 'Coach đã được duyệt' : 'Coach chưa được mở khóa'}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {session?.isVerified ? 'Bạn chỉ có thể quản lý khóa học, lịch dạy và học viên thuộc tài khoản của mình.' : 'Hãy hoàn tất hồ sơ xác minh. Các chức năng vận hành sẽ mở sau khi Admin phê duyệt.'}
            </p>
          </div>

          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Không gian làm việc</p>
          <nav className="space-y-1">
            {coachNavigation.map((item) => {
              const Icon = item.icon
              const locked = !session?.isVerified && !['/coach/profile', '/coach/verification'].includes(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-disabled={locked}
                  onClick={(event) => { if (locked) event.preventDefault() }}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/45 hover:text-foreground',
                    locked && 'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-muted-foreground',
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
          {!session?.isVerified && <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"><strong>Tài khoản Coach chưa được xác minh.</strong> Bạn chỉ có thể cập nhật hồ sơ và nộp chứng chỉ; lịch dạy, khóa học, học viên và ví đang bị khóa.</div>}
          {coachReady ? <Outlet /> : <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Đang tải đúng hồ sơ Coach…</div>}
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
