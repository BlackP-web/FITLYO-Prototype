import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Users,
  Calendar,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 sm:p-12 md:p-16 shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>NỀN TẢNG THỂ THAO PICKLEBALL TIÊN PHONG</span>
            <span className="text-muted-foreground">• TP. THỦ ĐỨC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Ghép Trận Pickleball Cân Trình{' '}
            <span className="text-primary underline decoration-primary/30 decoration-wavy">
              DUPR
            </span>{' '}
            & Đặt Sân Trong 3 Phút
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Chấm dứt cảnh thiếu người chơi, lệch trình độ hoặc sân trống giờ cao điểm. FITLYO kết nối bạn với những trận đấu đôi vừa vặn nhất, chuẩn 6 slot 90 phút/ngày và thanh toán cọc tự động phát vé QR.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/matches')}
              className="gap-2 font-bold shadow-md active:scale-[0.98]"
            >
              <span>KHÁM PHÁ KÈO GHÉP NGAY</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/fm/calendar')}
              className="font-semibold active:scale-[0.98]"
            >
              Dành Cho Chủ Sân (6 Slot)
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>1.200+ Trận đã ghép</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>28 Cụm sân liên kết</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>99.2% Đúng giờ</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / Value Propositions */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="default" className="text-xs uppercase">
            HỆ SINH THÁI KHỞI NGHIỆP FITLYO
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Giải Quyết Triệt Để 3 Nỗi Đau Lớn
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tối ưu hóa thời gian và chi phí cho Người chơi, Chủ sân (Field Manager) và Huấn luyện viên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-3 shadow-xs hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              Social Matchmaking DUPR
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thuật toán tự động ghép người có chênh lệch DUPR $\le 0.5$. Hạn chế tối đa tình trạng "gãy kèo", lệch trình làm mất vui khi ra sân.
            </p>
            <Link
              to="/matches"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2"
            >
              <span>Xem bảng tin kèo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-3 shadow-xs hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              Ma Trận 6 Slot Chuẩn 90 Phút
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quy chuẩn hóa thời gian chơi từ 06:00 đến 21:30. Chủ sân quản lý công suất 1 chạm, tự động chia sẻ slot trống cho cộng đồng.
            </p>
            <Link
              to="/fm/calendar"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2"
            >
              <span>Khám phá lịch 6 slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-3 shadow-xs hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              Chứng Nhận & PT Booking
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mạng lưới Certified Coach (PPR, IPTPA) được Admin thẩm định bằng cấp. Học viên được cấp chứng chỉ DUPR sau khi hoàn thành khóa.
            </p>
            <Link
              to="/coaches"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2"
            >
              <span>Danh bạ huấn luyện viên</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
