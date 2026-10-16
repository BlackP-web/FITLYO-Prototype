import { Bell, CalendarDays, Crown, GraduationCap, LogOut, MapPin, UserRound, WalletCards } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const desktopNav = [
  { label: 'Khám phá', href: '/player' },
  { label: 'Kèo đấu', href: '/player/matches' },
  { label: 'Sân', href: '/player/venues' },
  { label: 'Huấn luyện viên', href: '/player/coaches' },
  { label: 'HLV của tôi', href: '/player/coaching' },
  { label: 'Lịch của tôi', href: '/player/schedule' },
]

export function Header() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const profile = usePlayerStore((state) => state.profile)
  const toastMessage = useFitlyoStore((state) => state.toastMessage)
  const clearToast = useFitlyoStore((state) => state.clearToast)
  const showToast = useFitlyoStore((state) => state.showToast)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
        <div className="fitlyo-nav-shell mx-auto flex h-[70px] max-w-[1320px] items-center justify-between gap-4 rounded-[1.65rem] px-4 sm:px-6 lg:px-8">
          <Link to="/player" aria-label="FITLYO - Trang chủ Player" className="shrink-0">
            <BrandLogo className="h-8 w-auto sm:h-9" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng Player">
            {desktopNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/player'}
                className={({ isActive }) => cn(
                  'relative rounded-xl px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-primary after:absolute after:-bottom-1 after:left-1/2 after:h-1 after:w-8 after:-translate-x-1/2 after:rounded-full after:bg-secondary',
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-2 text-xs font-bold text-foreground xl:flex">
              <MapPin className="h-3.5 w-3.5 text-primary" /> TP. Thủ Đức
            </div>
            <Button variant="ghost" size="sm" className="hidden gap-1.5 rounded-full border border-border/60 bg-background/60 md:inline-flex" onClick={() => navigate('/player/profile')}>
              <WalletCards className="h-4 w-4 text-primary" />
              <span className="font-bold">{profile.walletBalance.toLocaleString('vi-VN')}đ</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full border border-border/60 bg-background/60"
              aria-label="Thông báo"
              onClick={() => showToast('Bạn có 2 lịch sắp tới và 1 ưu đãi VIP mới.', 'info')}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-coral ring-2 ring-card" />
            </Button>
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full border border-primary/15 bg-card p-0.5 shadow-sm" aria-label="Mở menu tài khoản">
                  <img src={profile.avatarUrl} alt={profile.name} className="h-9 w-9 rounded-full object-cover" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={profile.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-foreground">{profile.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">{profile.username} · DUPR {profile.dupr.toFixed(2)}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/player/profile"><UserRound className="mr-2 h-4 w-4" />Hồ sơ người chơi</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/player/schedule"><CalendarDays className="mr-2 h-4 w-4" />Lịch của tôi</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/player/coaching"><GraduationCap className="mr-2 h-4 w-4" />Huấn luyện của tôi</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/player/vip"><Crown className="mr-2 h-4 w-4 text-amber-500" />{profile.isVip ? 'Quản lý FITLYO VIP' : 'Nâng cấp FITLYO VIP'}</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="fixed right-4 top-20 z-[70] max-w-sm animate-in slide-in-from-top-3 fade-in">
          <div className={cn(
            'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-xl',
            toastMessage.type === 'success' && 'border-emerald-500/30 bg-emerald-600 text-white',
            toastMessage.type === 'error' && 'border-destructive/40 bg-destructive text-destructive-foreground',
            toastMessage.type === 'info' && 'border-border bg-card/95 text-foreground',
          )}>
            <span className="flex-1">{toastMessage.text}</span>
            <button type="button" onClick={clearToast} className="opacity-70 hover:opacity-100" aria-label="Đóng thông báo">×</button>
          </div>
        </div>
      )}
    </>
  )
}
