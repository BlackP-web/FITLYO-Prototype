import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  User,
  Sparkles,
  MapPin,
  Crown,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { UserRole } from '@/types/pickleball'

export function Header() {
  const navigate = useNavigate()
  const {
    toggleSidebar,
    activeRole,
    setActiveRole,
    currentUser,
    notificationCount,
    toastMessage,
    clearToast,
    togglePremium,
  } = useFitlyoStore()

  const roles: { id: UserRole; label: string; icon: string }[] = [
    { id: 'player', label: 'Player (Người chơi)', icon: '🎾' },
    { id: 'fm', label: 'Field Manager (Chủ sân)', icon: '🏢' },
    { id: 'coach', label: 'Coach (Huấn luyện viên)', icon: '👨‍🏫' },
    { id: 'admin', label: 'Admin (Quản trị viên)', icon: '🛡️' },
  ]

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role)
    if (role === 'player') navigate('/matches')
    else if (role === 'fm') navigate('/fm/calendar')
    else if (role === 'coach') navigate('/coach/dashboard')
    else if (role === 'admin') navigate('/admin/approvals')
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

          <Link to="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight text-foreground group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              {/* Pickleball Paddle SVG Logo */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 3.2 1.52 6.04 3.87 7.84L5.1 21.6c-.32.65.15 1.4.87 1.4h2.06c.38 0 .73-.21.9-.55l1.64-3.28C11.17 19.64 11.58 20 12 20c5.52 0 10-4.48 10-10S17.52 2 12 2zm-2 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold tracking-tight text-primary">FITLYO</span>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  PICKLEBALL
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">
                DUPR MATCHMAKING
              </span>
            </div>
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
          {/* Role Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2.5 sm:px-3 text-xs font-semibold gap-1.5 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary active:scale-[0.98]"
              >
                <span className="text-sm">
                  {roles.find((r) => r.id === activeRole)?.icon}
                </span>
                <span className="hidden sm:inline">
                  {roles.find((r) => r.id === activeRole)?.label.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">
                Đổi Vai Trò Trải Nghiệm (RBAC)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roles.map((r) => (
                <DropdownMenuItem
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  className={`text-xs font-medium cursor-pointer flex items-center justify-between ${
                    activeRole === r.id ? 'bg-primary/10 text-primary font-bold' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </span>
                  {activeRole === r.id && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-foreground">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>DUPR: {currentUser.duprRating}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{currentUser.reputationScore}% uy tín</span>
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Hồ sơ DUPR & Gói Premium</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/matches">Kèo ghép trận của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/fm/calendar">Lịch quản lý 6 slot</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={togglePremium} className="cursor-pointer">
                {currentUser.isPremium ? 'Tắt VIP Premium (Test)' : 'Kích hoạt VIP Premium'}
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
