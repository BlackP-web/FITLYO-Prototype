import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  Sparkles,
  MapPin,
  Crown,
  LogOut,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { useAuthStore } from '@/store/useAuthStore'

export function Header() {
  const navigate = useNavigate()
  const {
    toggleSidebar,
    currentUser,
    notificationCount,
    toastMessage,
    clearToast,
    togglePremium,
  } = useFitlyoStore()
  const { session, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-3 sm:px-6 backdrop-blur-md shadow-xs">
        {/* Left: Menu toggle + Logo + Location */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
            className="rounded-xl border hover:bg-muted active:scale-[0.98]"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/player" className="group flex items-center" aria-label="FITLYO - Trang chủ">
            <BrandLogo className="h-7 w-auto transition-transform duration-200 group-hover:scale-[1.02] sm:h-8" />
          </Link>

          {/* Location Picker */}
          <div className="hidden lg:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-xl bg-muted/60 text-xs text-muted-foreground border border-border/40">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">TP. Thủ Đức</span>
            <span className="text-[10px]">(Linh Chiểu, An Phú, Thảo Điền)</span>
          </div>
        </div>

        {/* Right: Role Switcher & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-bold text-primary sm:flex">
            <UserRound className="h-4 w-4" /> Player
          </div>

          {/* VIP Premium Toggle Pill */}
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePremium}
            className={`hidden md:inline-flex h-9 px-2.5 text-xs font-bold gap-1 rounded-xl transition-all ${
              currentUser.isPremium
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentUser.isPremium ? 'VIP Active' : 'Lên VIP'}</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl border hover:bg-muted"
            aria-label="Thông báo"
            onClick={() => useFitlyoStore.getState().showToast('Bạn có 3 thông báo về lịch ghép trận sắp tới!', 'info')}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {notificationCount}
              </span>
            )}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full border hover:bg-muted p-0.5">
                <img
                  src={session?.avatarUrl ?? currentUser.avatarUrl}
                  alt={session?.name ?? currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-foreground">{session?.name ?? currentUser.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>DUPR: {currentUser.duprRating}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{currentUser.reputationScore}% uy tín</span>
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/player">Trang chủ người chơi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/matches/detail">Kèo ghép trận của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={togglePremium} className="cursor-pointer">
                {currentUser.isPremium ? 'Tắt VIP Premium (Test)' : 'Kích hoạt VIP Premium'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Interactive Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : toastMessage.type === 'error'
                ? 'bg-destructive text-destructive-foreground border-destructive/80 shadow-destructive/20'
                : 'bg-card text-foreground border-border shadow-md'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={clearToast}
              className="ml-2 opacity-80 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
