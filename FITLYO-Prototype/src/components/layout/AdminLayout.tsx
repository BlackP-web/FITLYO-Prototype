import { BarChart3, Bell, FileCheck2, Gavel, LogOut, Settings2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/store/useAdminStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const adminNavigation = [
  { label: 'Tổng quan hệ thống', shortLabel: 'Tổng quan', to: '/admin/dashboard', icon: BarChart3 },
  { label: 'Thẩm định đối tác', shortLabel: 'Thẩm định', to: '/admin/kyc', icon: FileCheck2 },
  { label: 'Quản lý người dùng', shortLabel: 'Người dùng', to: '/admin/users', icon: UsersRound },
  { label: 'Tranh chấp & Escrow', shortLabel: 'Tranh chấp', to: '/admin/disputes', icon: Gavel },
  { label: 'Cấu hình toàn sàn', shortLabel: 'Cấu hình', to: '/admin/settings', icon: Settings2 },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { session, logout } = useAuthStore()
  const { toastMessage, clearToast, auditApplications } = useFitlyoStore()
  const disputes = useAdminStore((state) => state.disputes)
  const pendingKyc = auditApplications.filter((item) => item.status === 'PENDING').length
  const openDisputes = disputes.filter((item) => item.status === 'OPEN' || item.status === 'INVESTIGATING').length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-7 w-auto sm:h-8" />
          <div className="hidden border-l border-border pl-3 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Admin Portal</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground"><ShieldCheck className="h-3 w-3 text-purple-600 dark:text-purple-300" /> Điều hành toàn sàn</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" className="relative hidden h-9 w-9 items-center justify-center rounded-xl border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground sm:flex" aria-label="Thông báo Admin">
            <Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-2 py-1.5 shadow-sm">
            <img src={session?.avatarUrl} alt={session?.name} className="h-8 w-8 rounded-lg object-cover" />
            <div className="hidden text-right sm:block"><p className="text-xs font-bold leading-none">{session?.name}</p><p className="mt-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300">Super Admin</p></div>
            <button type="button" onClick={handleLogout} className="ml-1 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive" aria-label="Đăng xuất tài khoản Admin" title="Đăng xuất"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-card px-3 py-2 md:hidden">
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {adminNavigation.map((item) => {
            const Icon = item.icon
            return <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold', isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}><Icon className="h-3.5 w-3.5" />{item.shortLabel}</NavLink>
          })}
        </nav>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1700px]">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card p-4 md:block">
          <div className="mb-5 rounded-2xl border border-purple-500/15 bg-purple-500/5 p-4">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-bold">Super Admin · Toàn quyền</span></div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Phiên quản trị có quyền thẩm định, điều phối Escrow và thay đổi chính sách toàn hệ thống.</p>
          </div>

          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Điều hành nền tảng</p>
          <nav className="space-y-1">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const count = item.to.endsWith('/kyc') ? pendingKyc : item.to.endsWith('/disputes') ? openDisputes : 0
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors', isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/45 hover:text-foreground')}>
                  <Icon className="h-4 w-4" /><span className="flex-1">{item.label}</span>{count > 0 && <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-black text-white">{count}</span>}
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-primary/15 bg-secondary/30 p-4"><p className="flex items-center gap-2 text-xs font-bold text-primary"><ShieldCheck className="h-4 w-4" /> Trạng thái hệ thống</p><div className="mt-3 space-y-2 text-[11px] text-muted-foreground"><div className="flex justify-between"><span>API Gateway</span><strong className="text-emerald-600 dark:text-emerald-300">Ổn định</strong></div><div className="flex justify-between"><span>Escrow Engine</span><strong className="text-emerald-600 dark:text-emerald-300">Ổn định</strong></div><div className="flex justify-between"><span>Đồng bộ DUPR</span><strong className="text-amber-600 dark:text-amber-300">42ms</strong></div></div></div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>

      {toastMessage && (
        <div className="fixed right-4 top-20 z-[80] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className={cn('flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-medium shadow-xl sm:text-sm', toastMessage.type === 'success' && 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/20', toastMessage.type === 'error' && 'border-red-500 bg-red-600 text-white shadow-red-500/20', toastMessage.type === 'info' && 'border-border bg-card text-foreground shadow-md')}>
            <Sparkles className="h-4 w-4 shrink-0" /><span>{toastMessage.text}</span><button type="button" onClick={clearToast} className="ml-2 opacity-80 hover:opacity-100" aria-label="Đóng thông báo">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
