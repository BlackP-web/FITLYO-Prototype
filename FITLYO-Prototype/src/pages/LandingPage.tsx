import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser } = useFitlyoStore()

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="brand-card relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary/70 via-card to-accent/25 p-6 sm:p-12 md:p-16">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-secondary/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-8 hidden h-28 w-28 rotate-12 rounded-[2rem] border border-primary/10 bg-card/30 lg:block" />

        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/10 bg-card/70 px-3 py-1.5 text-[11px] font-bold text-primary shadow-sm backdrop-blur sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>NỀN TẢNG THỂ THAO PICKLEBALL TIÊN PHONG</span>
            <span className="text-muted-foreground">• TP. THỦ ĐỨC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Ghép Trận Pickleball Cân Trình{' '}
            <span className="text-primary underline decoration-accent decoration-[5px] underline-offset-4">
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
              onClick={() => navigate('/venues')}
              className="font-semibold active:scale-[0.98]"
            >
              Khám Phá Cụm Sân
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>1.200+ Trận đã ghép</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>28 Cụm sân liên kết</span>
            </div>
            <span className="hidden sm:inline">•</span>
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
          <div className="brand-card group space-y-3 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-transform group-hover:scale-105">
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
          <div className="brand-card group space-y-3 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/55 text-orange-700 transition-transform group-hover:scale-105 dark:text-orange-300">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              Ma Trận 6 Slot Chuẩn 90 Phút
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quy chuẩn hóa thời gian chơi từ 06:00 đến 21:30. Chủ sân quản lý công suất 1 chạm, tự động chia sẻ slot trống cho cộng đồng.
            </p>
            <Link
              to="/venues"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2"
            >
              <span>Xem cụm sân liên kết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="brand-card group space-y-3 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
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

export default LandingPage
