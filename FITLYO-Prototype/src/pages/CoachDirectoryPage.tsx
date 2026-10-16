import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  CheckCircle2,
  Award,
  MapPin,
  Crown,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CoachBookingDialog } from '@/components/player/CoachBookingDialog'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachItem } from '@/types/pickleball'

export const CoachDirectoryPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { coaches } = useFitlyoStore()
  const isPlayerView = location.pathname.startsWith('/player')
  const bookingCoachId = (location.state as { bookingCoachId?: string } | null)?.bookingCoachId

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCertifiedOnly, setFilterCertifiedOnly] = useState(true)
  const [selectedCoachForBooking, setSelectedCoachForBooking] = useState<CoachItem | null>(
    () => coaches.find((coach) => coach.id === bookingCoachId) ?? null,
  )

  const filteredCoaches = coaches.filter((coach) => {
    if (filterCertifiedOnly && !coach.isCertified) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = coach.name.toLowerCase().includes(q)
      const matchSpecialty = coach.specialties.some((s) => s.toLowerCase().includes(q))
      const matchLoc = coach.serviceLocations.some((l) => l.toLowerCase().includes(q))
      if (!matchName && !matchSpecialty && !matchLoc) return false
    }
    return true
  })

  const handleBookNow = (coach: CoachItem) => {
    setSelectedCoachForBooking(coach)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(isPlayerView ? '/player' : '/')}
              className="rounded-xl border hover:bg-muted"
              title="Về Trang Chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" className="text-xs">
                  SCR_BOOK_COACH_01
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">
                  PT Booking & Courses • TP. Thủ Đức
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Danh Bạ Huấn Luyện Viên & Khóa Học
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kết nối các HLV có chứng chỉ quốc tế (PPR / IPTPA) được thẩm định nghiêm ngặt.
              </p>
            </div>
          </div>

          {!isPlayerView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs font-semibold self-start sm:self-auto"
            >
              Đăng nhập để đặt lịch
            </Button>
          )}
        </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm tên HLV, kỹ năng (dink, volley, serve, drop shot)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilterCertifiedOnly(!filterCertifiedOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-semibold transition-all ${
              filterCertifiedOnly
                ? 'border-primary/40 bg-secondary/60 text-primary ring-1 ring-primary/25'
                : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Certified Coach (Tích xanh)</span>
          </button>
        </div>
      </div>

      {/* Coach Cards Grid */}
      <div className="space-y-5">
        {filteredCoaches.map((coach) => (
          <div
            key={coach.id}
            data-coach-id={coach.id}
            className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition-all space-y-4"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={coach.avatarUrl}
                  alt={coach.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-md ring-2 ring-primary/5 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {coach.name}
                    </h3>
                    {coach.isCertified && (
                      <Badge variant="success" className="text-[11px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {coach.certTitle}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="font-black text-primary">DUPR {coach.duprRating.toFixed(2)}</span>
                    <span>•</span>
                    <span className="font-bold text-amber-500">⭐ {coach.rating} ({coach.reviewCount} đánh giá)</span>
                    <span>•</span>
                    <span>{coach.experienceYears} năm kinh nghiệm</span>
                  </p>
                  <p className="text-xs text-foreground font-medium">{coach.achievements}</p>
                </div>
              </div>

              {/* Pricing box */}
              <div className="rounded-xl bg-muted/40 p-3 sm:text-right shrink-0 border border-border/50 text-xs">
                <div className="mb-1">
                  <span className="text-muted-foreground">Buổi kèm lẻ (90p):</span>
                  <p className="font-bold text-foreground text-sm">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coach.ratePerSession)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Khóa học 1 tháng (8 buổi):</span>
                  <p className="font-extrabold text-primary text-sm sm:text-base">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coach.ratePerMonthCourse)}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties & Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-muted-foreground flex items-center gap-1 mb-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Khu vực hoạt động:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {coach.serviceLocations.map((loc, idx) => (
                    <span key={idx} className="bg-muted px-2 py-0.5 rounded text-[11px] text-foreground">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground flex items-center gap-1 mb-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-primary" /> Kỹ năng thế mạnh:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {coach.specialties.map((spec, idx) => (
                    <span key={idx} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Course & VIP Banner */}
            {coach.featuredCourse && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    <b>KHÓA NỔI BẬT:</b> {coach.featuredCourse}
                  </span>
                </div>
                {coach.isVipExclusive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" /> Quyền lợi VIP: Book slot riêng 1:1
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                data-testid={`coach-detail-${coach.id}`}
                variant="outline"
                size="sm"
                onClick={() => navigate(`/player/coaches/${coach.id}`)}
                className="text-xs"
              >
                Xem Hồ Sơ Chi Tiết
              </Button>
              <Button
                size="sm"
                onClick={() => handleBookNow(coach)}
                className="gap-1.5 text-xs font-semibold shadow-xs active:scale-[0.98]"
              >
                <span>ĐẶT LỊCH NGAY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedCoachForBooking && (
        <CoachBookingDialog
          key={selectedCoachForBooking.id}
          coach={selectedCoachForBooking}
          onClose={() => setSelectedCoachForBooking(null)}
        />
      )}
      </div>
    </div>
  )
}
