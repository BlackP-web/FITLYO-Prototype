import React from 'react'
import {
  Crown,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const ProfileDuprPage: React.FC = () => {
  const { currentUser, togglePremium } = useFitlyoStore()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              SCR_USER_01 & SCR_USER_02
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              DUPR Profile & Premium Subscription
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hồ Sơ Trình Độ DUPR & Uy Tín
          </h1>
        </div>

        <Button
          onClick={togglePremium}
          className={`gap-2 font-bold shadow-sm active:scale-[0.98] ${
            currentUser.isPremium
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>{currentUser.isPremium ? 'Đang Là Hội Viên VIP' : 'Nâng Cấp FITLYO Premium'}</span>
        </Button>
      </div>

      {/* User Hero Profile Card */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-primary/30 shadow-md ring-4 ring-primary/5"
              />
              {currentUser.isPremium && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-1.5 rounded-full shadow-md">
                  <Crown className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {currentUser.name}
                </h2>
                {currentUser.isPremium ? (
                  <Badge variant="vip" className="text-xs">
                    VIP MEMBER
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    MEMBER FREE
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{currentUser.email} • {currentUser.phone}</p>
              <p className="text-xs text-muted-foreground">Tham gia từ: {currentUser.joinedDate}</p>
            </div>
          </div>

          {/* DUPR Rating Big Badge */}
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center min-w-[160px] self-stretch sm:self-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block">
              CHỈ SỐ DUPR CHÍNH THỨC
            </span>
            <span className="text-4xl font-black text-foreground tracking-tight block my-1">
              {currentUser.duprRating}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +0.15 trong tháng
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/50 text-center">
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">Điểm Uy tín Fairplay</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {currentUser.reputationScore}%
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">Số trận đã đấu</span>
            <p className="text-xl font-bold text-foreground mt-1">
              {currentUser.matchesPlayed} trận
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">Tỷ lệ thắng (Win rate)</span>
            <p className="text-xl font-bold text-foreground mt-1">
              {currentUser.winRate}%
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">Cấp độ thi đấu</span>
            <p className="text-xl font-bold text-primary mt-1">
              Phong Trào
            </p>
          </div>
        </div>
      </div>

      {/* FITLYO Premium Privilege Card (SCR_USER_02) */}
      <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Gói Hội Viên FITLYO Premium (VIP)
              </h3>
              <p className="text-xs text-muted-foreground">
                Đặc quyền vượt trội dành cho người chơi Pickleball đam mê thi đấu
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground block">Chỉ từ:</span>
            <span className="text-xl font-extrabold text-foreground">
              99.000đ <span className="text-xs font-normal text-muted-foreground">/ tháng</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl border border-border/60 bg-background space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>VIP Early Access 15 Phút</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nhìn thấy và đặt slot các phòng giờ vàng (Slot 5 18:30) trước người chơi thông thường 15 phút.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-background space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Hủy Slot Linh Hoạt Trước 4H</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Free Player phải báo trước 12h; Hội viên Premium được hủy slot trước chỉ 4h vẫn hoàn 100% cọc.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-background space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Award className="w-4 h-4 text-blue-500" />
              <span>Book Riêng Certified Coach</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Quyền ưu tiên đặt lịch kèm 1:1 độc quyền với các HLV cấp độ PPR Level 2 và IPTPA.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={togglePremium}
            className="font-bold gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md active:scale-[0.98]"
          >
            <Crown className="w-4 h-4" />
            <span>{currentUser.isPremium ? 'Chuyển Về Gói Thường (Test Free)' : 'Kích Hoạt Dùng Thử VIP'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
