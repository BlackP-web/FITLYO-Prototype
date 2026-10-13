import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Flame,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const MatchFeedPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    matches,
    currentUser,
    feedFilter,
    setFeedFilter,
    joinMatchRoom,
    selectMatch,
    isFeedLoading,
    setIsFeedLoading,
  } = useFitlyoStore()

  const [activeTab, setActiveTab] = useState<'open' | 'my'>('open')
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [simulatedError, setSimulatedError] = useState(false)

  // Filter logic
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // Tab filter
      if (activeTab === 'my') {
        const isParticipant = match.participants.some(
          (p) => p.id === currentUser.id
        )
        if (!isParticipant && !match.isBookedByMe) return false
      }

      // Search keyword
      if (feedFilter.search.trim()) {
        const query = feedFilter.search.toLowerCase()
        const matchTitle = match.title.toLowerCase()
        const matchVenue = match.courtName.toLowerCase()
        const matchAddr = match.address.toLowerCase()
        if (!matchTitle.includes(query) && !matchVenue.includes(query) && !matchAddr.includes(query)) {
          return false
        }
      }

      // Quick chip: Fit DUPR
      if (feedFilter.onlyFitDupr) {
        const userDupr = currentUser.duprRating
        const isFit =
          userDupr >= match.targetDuprMin - 0.5 &&
          userDupr <= match.targetDuprMax + 0.5
        if (!isFit) return false
      }

      // Quick chip: Evening only (Slot 4, 5, 6)
      if (feedFilter.eveningOnly) {
        if (match.slotNumber < 4) return false
      }

      // Quick chip: Near me (< 3km)
      if (feedFilter.nearMeOnly) {
        if (match.distanceKm > 3.0) return false
      }

      return true
    })
  }, [matches, activeTab, feedFilter, currentUser])

  const myMatchesCount = matches.filter(
    (m) => m.isBookedByMe || m.participants.some((p) => p.id === currentUser.id)
  ).length

  const handleQuickJoin = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation()
    selectMatch(matchId)
    const success = joinMatchRoom(matchId)
    if (success) {
      navigate('/matches/detail')
    }
  }

  const handleCardClick = (matchId: string) => {
    selectMatch(matchId)
    navigate('/matches/detail')
  }

  const resetFilters = () => {
    setFeedFilter({
      search: '',
      onlyFitDupr: false,
      eveningOnly: false,
      nearMeOnly: false,
    })
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs" withDot pulseDot>
              SCR_MATCH_01
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              Social Matchmaking Feed • TP. Thủ Đức
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Bảng Tin Kèo Ghép Trận DUPR
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tìm bạn chơi cùng trình độ trong bán kính 5km • Hệ thống 6 slot chuẩn 90 phút.
          </p>
        </div>

        {/* State Simulator Switchers */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/40 p-1.5 rounded-xl border border-border/70 text-xs">
          <span className="font-semibold text-muted-foreground px-1.5">Mô phỏng UI:</span>
          <button
            type="button"
            onClick={() => {
              setIsFeedLoading(!isFeedLoading)
              setSimulatedError(false)
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              isFeedLoading
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {isFeedLoading ? 'Đang bật Skeleton' : 'Skeleton'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSimulatedError(!simulatedError)
              setIsFeedLoading(false)
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              simulatedError
                ? 'bg-destructive text-destructive-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {simulatedError ? 'Đang bật Lỗi' : 'Lỗi mạng'}
          </button>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm cụm sân, đường Võ Văn Ngân, tên bạn chơi..."
            value={feedFilter.search}
            onChange={(e) => setFeedFilter({ search: e.target.value })}
            className="w-full rounded-xl border border-border/80 bg-card pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {feedFilter.search && (
            <button
              type="button"
              onClick={() => setFeedFilter({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className="h-10 px-4 gap-2 border-border/80 bg-card active:scale-[0.98]"
        >
          <Filter className="w-4 h-4 text-primary" />
          <span>Bộ lọc nâng cao</span>
          {(feedFilter.onlyFitDupr || feedFilter.eveningOnly || feedFilter.nearMeOnly) && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </div>

      {/* Advanced Filter Drawer / Expanded Row */}
      {showFilterDrawer && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              CẤU HÌNH BỘ LỌC CHI TIẾT
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Đặt lại
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="font-semibold text-foreground">Khu vực TP. Thủ Đức</span>
              <p className="text-muted-foreground mt-0.5">Bán kính quét: 5.0 km quanh bạn</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">Khung giờ 6 Slot</span>
              <p className="text-muted-foreground mt-0.5">Tất cả slot từ 06:00 đến 21:30</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">Khoảng DUPR đề xuất</span>
              <p className="text-muted-foreground mt-0.5">DUPR hiện tại: {currentUser.duprRating} (±0.5)</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
          Lọc nhanh:
        </span>
        <button
          type="button"
          onClick={resetFilters}
          className={`shrink-0 rounded-full px-3 py-1 font-medium border transition-colors ${
            !feedFilter.onlyFitDupr && !feedFilter.eveningOnly && !feedFilter.nearMeOnly
              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
              : 'border-border/80 bg-card hover:bg-muted text-muted-foreground'
          }`}
        >
          • Tất cả ({matches.length})
        </button>

        <button
          type="button"
          onClick={() => setFeedFilter({ onlyFitDupr: !feedFilter.onlyFitDupr })}
          className={`shrink-0 rounded-full px-3 py-1 font-medium border transition-colors flex items-center gap-1.5 ${
            feedFilter.onlyFitDupr
              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
              : 'border-border/80 bg-card hover:bg-muted text-muted-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          ⭐ Hợp trình DUPR ({currentUser.duprRating - 0.5} - {currentUser.duprRating + 0.5})
        </button>

        <button
          type="button"
          onClick={() => setFeedFilter({ eveningOnly: !feedFilter.eveningOnly })}
          className={`shrink-0 rounded-full px-3 py-1 font-medium border transition-colors flex items-center gap-1.5 ${
            feedFilter.eveningOnly
              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
              : 'border-border/80 bg-card hover:bg-muted text-muted-foreground'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          ⏰ Giờ vàng buổi tối (18:30)
        </button>

        <button
          type="button"
          onClick={() => setFeedFilter({ nearMeOnly: !feedFilter.nearMeOnly })}
          className={`shrink-0 rounded-full px-3 py-1 font-medium border transition-colors flex items-center gap-1.5 ${
            feedFilter.nearMeOnly
              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
              : 'border-border/80 bg-card hover:bg-muted text-muted-foreground'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          📍 Gần tôi (&lt; 3km)
        </button>
      </div>

      {/* Tabs: Kèo đang mở vs Kèo của tôi */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'open' | 'my')}>
        <div className="flex items-center justify-between border-b pb-1">
          <TabsList className="bg-muted/70 p-1 rounded-xl">
            <TabsTrigger value="open" className="text-xs sm:text-sm font-semibold">
              KÈO ĐANG MỞ ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="my" className="text-xs sm:text-sm font-semibold">
              KÈO CỦA TÔI ({myMatchesCount})
            </TabsTrigger>
          </TabsList>

          <Link
            to="/fm/calendar"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <span>Bạn là chủ sân? Quản lý 6 Slot</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </Tabs>

      {/* Feed Content Rendering by State */}
      {simulatedError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto animate-bounce" />
          <h3 className="font-bold text-lg text-foreground">Không thể kết nối máy chủ</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Hệ thống tạm thời không tải được danh sách phòng ghép trận. Vui lòng kiểm tra lại kết nối mạng.
          </p>
          <Button
            onClick={() => setSimulatedError(false)}
            variant="destructive"
            className="gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Thử lại ngay
          </Button>
        </div>
      ) : isFeedLoading ? (
        /* Skeleton Shimmer State */
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72 rounded" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={Users}
          title="Không có kèo nào quanh bạn trong khung giờ này"
          description="Hãy thử nới rộng khoảng DUPR, chọn ngày khác hoặc mở một phòng ghép trận mới tại cụm sân gần nhất."
          actionLabel="Đặt lại bộ lọc"
          onAction={resetFilters}
          secondaryActionLabel="Tạo kèo mới"
          onSecondaryAction={() => navigate('/fm/calendar')}
        />
      ) : (
        /* Ideal State: Match Cards */
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const isFull = match.currentPlayers >= match.maxPlayers
            const isJoined =
              match.isBookedByMe ||
              match.participants.some((p) => p.id === currentUser.id)
            const isDiffDupr =
              currentUser.duprRating > match.targetDuprMax + 0.5 ||
              currentUser.duprRating < match.targetDuprMin - 0.5

            return (
              <div
                key={match.id}
                onClick={() => handleCardClick(match.id)}
                className="group relative cursor-pointer rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-lg active:scale-[0.99]"
              >
                {/* Top Row: Title, Format & DUPR Requirement */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {match.title}
                    </h3>
                    {match.isVipEarlyAccess && (
                      <Badge variant="vip" className="text-[11px]">
                        <Sparkles className="w-3 h-3 mr-1" /> VIP EARLY ACCESS
                      </Badge>
                    )}
                    {isJoined && (
                      <Badge variant="success" className="text-[11px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> BẠN ĐÃ GIỮ CHỖ
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="default" className="text-xs font-bold py-1 px-3">
                      ⭐ DUPR {match.targetDuprMin} - {match.targetDuprMax}
                    </Badge>
                  </div>
                </div>

                {/* Venue & Location */}
                <div className="space-y-1 mb-4 text-xs sm:text-sm">
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{match.courtName}</span>
                    <span className="text-muted-foreground">• {match.courtSubName}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {match.distanceKm} km
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground pl-5.5">
                    {match.address}
                  </p>
                </div>

                {/* Time & Slot Grid Badge */}
                <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 font-medium text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Slot {match.slotNumber}: {match.timeRange}</span>
                    <span className="text-muted-foreground">({match.dateStr})</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold">
                    Mặt sân: {match.surfaceType}
                  </span>
                </div>

                {/* DUPR Disparity Warning Banner if applicable */}
                {isDiffDupr && (
                  <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      ⚠️ <b>Lưu ý trình độ:</b> Điểm DUPR của bạn ({currentUser.duprRating}) có độ lệch so với yêu cầu phòng (DUPR {match.targetDuprMin} - {match.targetDuprMax}).
                    </span>
                  </div>
                )}

                {/* Bottom Row: Participants Avatars & Price / Join Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
                  {/* Players list */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {match.participants.map((player) => (
                        <img
                          key={player.id}
                          src={player.avatarUrl}
                          alt={player.name}
                          title={`${player.name} (DUPR: ${player.dupr})`}
                          className="w-9 h-9 rounded-full border-2 border-background object-cover ring-1 ring-border shadow-xs"
                        />
                      ))}
                      {/* Empty slots placeholders */}
                      {Array.from({ length: match.maxPlayers - match.currentPlayers }).map(
                        (_, idx) => (
                          <div
                            key={idx}
                            className="w-9 h-9 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center text-primary text-xs font-semibold shadow-xs"
                            title="Chỗ trống"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        )
                      )}
                    </div>

                    <div className="text-xs">
                      <span className="font-semibold text-foreground">
                        {match.currentPlayers}/{match.maxPlayers} người
                      </span>
                      <p className="text-muted-foreground">
                        {isFull ? 'Đã đủ người tham gia' : `Còn ${match.maxPlayers - match.currentPlayers} chỗ trống`}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        Phí cọc slot 90p:
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-foreground">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(match.depositFee)}
                      </span>
                    </div>

                    <Button
                      disabled={isFull && !isJoined}
                      onClick={(e) => handleQuickJoin(e, match.id)}
                      className={`min-w-[130px] font-semibold shadow-xs active:scale-[0.98] ${
                        isJoined
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : isFull
                          ? 'opacity-60 cursor-not-allowed'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <span>Xem Vé QR</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      ) : isFull ? (
                        'ĐÃ KÍN LỊCH'
                      ) : (
                        <>
                          <span>GIỮ CHỖ NGAY</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
