import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const formatMoney = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`

export function PlayerCoachDetailPage() {
  const navigate = useNavigate()
  const { coachId } = useParams()
  const coach = useFitlyoStore((state) => state.coaches.find((item) => item.id === coachId))

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [coachId])

  if (!coach) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 text-primary">
          <UsersRound className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-3xl font-black tracking-tight">Không tìm thấy Coach</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Hồ sơ này không tồn tại hoặc đã tạm ngừng hiển thị trên FITLYO.
        </p>
        <Button onClick={() => navigate('/player/coaches')} className="mt-6 rounded-xl">
          <ArrowLeft /> Trở lại danh bạ Coach
        </Button>
      </section>
    )
  }

  const certificateName = coach.certTitle.match(/\(([^)]+)\)/)?.[1] ?? coach.certTitle

  const openBooking = () => {
    navigate('/player/coaches', { state: { bookingCoachId: coach.id } })
  }

  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate('/player/coaches')} className="-ml-2 rounded-xl">
          <ArrowLeft /> Danh bạ Coach
        </Button>
        <Badge variant="outline" className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]">
          SCR_BOOK_COACH_02 · Hồ sơ công khai
        </Badge>
      </div>

      <section className="fitlyo-elevated overflow-hidden rounded-[2rem]">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative min-h-[360px] overflow-hidden bg-primary sm:min-h-[480px]">
            <img src={coach.avatarUrl} alt={coach.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102E31]/90 via-[#143F42]/10 to-transparent" />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <Badge variant="success" className="border-white/20 bg-white/90 text-emerald-700 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Coach đã xác thực
              </Badge>
              {coach.isVipExclusive && (
                <Badge variant="vip" className="bg-[#F4A817] text-[#143F42]">
                  <Sparkles className="h-3.5 w-3.5" /> Quyền lợi VIP
                </Badge>
              )}
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-[#123b3e]/68 p-4 text-white backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/65">Học viên đánh giá</p>
              <div className="mt-2 flex items-center gap-2">
                <Star className="h-5 w-5 fill-[#F4A817] text-[#F4A817]" />
                <strong className="text-xl">{coach.rating.toFixed(2)}</strong>
                <span className="text-sm text-white/70">· {coach.reviewCount} đánh giá</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5" /> {certificateName}
              </Badge>
              <Badge variant="secondary">Certified Coach</Badge>
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-[#3dbca1]">Huấn luyện viên FITLYO</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] sm:text-5xl">{coach.name}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{coach.achievements}</p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-primary/10 bg-secondary/30 p-4">
                <Target className="h-5 w-5 text-primary" />
                <strong className="mt-3 block text-2xl font-black text-primary">{coach.duprRating.toFixed(2)}</strong>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DUPR</span>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-secondary/30 p-4">
                <Trophy className="h-5 w-5 text-primary" />
                <strong className="mt-3 block text-2xl font-black text-primary">{coach.experienceYears}</strong>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Năm kinh nghiệm</span>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-secondary/30 p-4">
                <Award className="h-5 w-5 text-primary" />
                <strong className="mt-3 block text-2xl font-black text-primary">{coach.isCertified ? 'Đã duyệt' : 'Đang chờ'}</strong>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chứng nhận</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
        <div className="space-y-6">
          <section className="fitlyo-elevated rounded-[1.75rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-secondary/55 p-3 text-primary"><GraduationCap className="h-6 w-6" /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Năng lực chuyên môn</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Trình độ và chứng chỉ</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/25 p-5">
                <p className="text-xs font-bold text-muted-foreground">Trình độ thi đấu</p>
                <p className="mt-2 text-3xl font-black text-primary">DUPR {coach.duprRating.toFixed(2)}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Chỉ số trình độ hiện tại được công khai trên hồ sơ Coach.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/25 p-5">
                <p className="text-xs font-bold text-muted-foreground">Chứng chỉ chuyên môn</p>
                <p className="mt-2 text-lg font-black text-foreground">{certificateName}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Đã được FITLYO xác thực</p>
              </div>
            </div>

            <div className="mt-7">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Kỹ năng thế mạnh</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {coach.specialties.map((specialty) => (
                  <span key={specialty} className="rounded-full border border-primary/10 bg-secondary/40 px-3 py-2 text-xs font-bold text-primary">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2">
            <article className="fitlyo-elevated rounded-[1.75rem] p-6">
              <Medal className="h-6 w-6 text-[#F4A817]" />
              <h2 className="mt-4 text-lg font-black">Kinh nghiệm giảng dạy</h2>
              <p className="mt-2 text-3xl font-black text-primary">{coach.experienceYears} năm</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Kinh nghiệm huấn luyện và đồng hành cùng người chơi pickleball.</p>
            </article>
            <article className="fitlyo-elevated rounded-[1.75rem] p-6">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-black">Khu vực hoạt động</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {coach.serviceLocations.map((location) => (
                  <span key={location} className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold">{location}</span>
                ))}
              </div>
            </article>
          </section>

          {coach.featuredCourse && (
            <section className="rounded-[1.75rem] border border-primary/15 bg-primary p-6 text-primary-foreground shadow-[0_22px_60px_rgba(20,63,66,0.16)] sm:p-8">
              <BookOpen className="h-7 w-7 text-secondary" />
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-primary-foreground/60">Khóa học nổi bật</p>
              <h2 className="mt-2 text-2xl font-black">{coach.featuredCourse}</h2>
              <p className="mt-3 text-sm leading-6 text-primary-foreground/70">Được thiết kế theo thế mạnh chuyên môn và lộ trình DUPR của Coach.</p>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-[0_20px_55px_rgba(20,63,66,0.09)] lg:sticky lg:top-28">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Học phí công khai</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
              <p className="text-xs font-bold text-muted-foreground">Buổi kèm riêng · 90 phút</p>
              <p className="mt-2 text-2xl font-black text-primary">{formatMoney(coach.ratePerSession)}</p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-secondary/25 p-4">
              <p className="text-xs font-bold text-muted-foreground">Khóa học · 8 buổi</p>
              <p className="mt-2 text-2xl font-black text-primary">{formatMoney(coach.ratePerMonthCourse)}</p>
            </div>
          </div>
          <Button onClick={openBooking} className="fitlyo-coral-button mt-5 h-12 w-full rounded-2xl border-0 font-black">
            Đặt lịch với Coach <ArrowRight />
          </Button>
          <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
            Bạn sẽ được chọn hình thức học trước khi xác nhận giữ chỗ.
          </p>
        </aside>
      </div>
    </div>
  )
}
