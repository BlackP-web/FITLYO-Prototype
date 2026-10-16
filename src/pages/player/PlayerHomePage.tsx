import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlayerMatchCard } from '@/components/player/PlayerMatchCard'
import { Button } from '@/components/ui/button'
import { communityHero } from '@/assets/pickleball'
import { usePlayerStore } from '@/store/usePlayerStore'

export function PlayerHomePage() {
  const navigate = useNavigate()
  const profile = usePlayerStore((state) => state.profile)
  const matches = usePlayerStore((state) => state.matches)
  const schedule = usePlayerStore((state) => state.schedule)
  const [level, setLevel] = useState('3.0–3.75')
  const [area, setArea] = useState('TP. Thủ Đức')
  const [date, setDate] = useState('2026-10-17')

  const suggested = matches
    .filter((match) => match.status === 'OPEN' && profile.dupr >= match.duprMin - 0.25 && profile.dupr <= match.duprMax + 0.25)
    .slice(0, 2)
  const nextActivity = schedule.find((item) => item.status === 'UPCOMING')

  return (
    <div className="space-y-12 pb-6">
      <section className="relative pt-5 sm:pt-8">
        <div className="pointer-events-none absolute -left-32 top-0 -z-10 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
        <div className="grid items-center gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:gap-10">
          <div className="fitlyo-rise py-3 lg:py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-secondary/45 px-3.5 py-2 text-xs font-black text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Xin chào, {profile.name.split(' ').slice(-1)[0]}
            </div>
            <p className="mt-7 text-xl font-black text-[#3dbca1] sm:text-2xl">Your Fit. Your Way.</p>
            <h1 className="fitlyo-display mt-3 max-w-xl text-[clamp(3.1rem,6.4vw,5.7rem)] font-black text-foreground">
              Tìm buổi chơi <span className="fitlyo-swoosh">hợp với bạn.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Chọn theo trình độ, khu vực và giờ rảnh. FITLYO gợi ý những người chơi phù hợp để bạn chỉ cần mang vợt và ra sân.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Thanh toán an toàn</span>
              <span className="flex items-center gap-1.5"><UsersRound className="h-4 w-4 text-primary" /> Ghép cân DUPR</span>
              <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-orange-500" /> Lịch rõ ràng</span>
            </div>
          </div>

          <div className="fitlyo-rise fitlyo-rise-delay-1 relative min-h-[360px] overflow-hidden rounded-[2rem] shadow-[0_32px_80px_rgba(20,63,66,0.18)] sm:min-h-[500px]">
            <img
              src={communityHero}
              alt="Cộng đồng Pickleball FITLYO"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d3437]/78 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#143F42]/62 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-secondary" /> 12 buổi phù hợp hôm nay
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 rounded-[1.35rem] border border-white/15 bg-[#123b3e]/66 p-4 text-white backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">Hồ sơ của bạn</p>
                <p className="mt-1 font-black">DUPR {profile.dupr.toFixed(2)} · Uy tín {profile.reputation}%</p>
              </div>
              <span className="w-fit rounded-xl bg-secondary px-3 py-2 text-sm font-black text-[#143F42]">+{profile.duprTrend.toFixed(2)} tháng này</span>
            </div>
          </div>
        </div>

        <div className="fitlyo-elevated fitlyo-rise fitlyo-rise-delay-2 relative z-10 mx-auto -mt-1 grid max-w-[1240px] gap-2 rounded-[1.75rem] p-3 sm:-mt-8 sm:grid-cols-2 sm:p-4 lg:grid-cols-[1fr_1.15fr_1fr_auto]">
          <label className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-muted/50">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="min-w-0 flex-1"><small className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trình độ</small><select value={level} onChange={(event) => setLevel(event.target.value)} className="w-full appearance-none bg-transparent text-sm font-black outline-none"><option>3.0–3.75</option><option>Mới bắt đầu</option><option>2.0–3.0</option><option>3.75–4.5</option></select></span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-muted/50">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="min-w-0 flex-1"><small className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Khu vực</small><select value={area} onChange={(event) => setArea(event.target.value)} className="w-full appearance-none bg-transparent text-sm font-black outline-none"><option>TP. Thủ Đức</option><option>Thảo Điền</option><option>An Phú</option><option>Hiệp Phú</option></select></span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-muted/50">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="min-w-0 flex-1"><small className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ngày chơi</small><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full bg-transparent text-sm font-black outline-none" /></span>
          </label>
          <Button onClick={() => navigate(`/player/matches?area=${encodeURIComponent(area)}&date=${date}`)} className="fitlyo-coral-button min-h-14 gap-2 rounded-2xl border-0 px-7 font-black">
            Tìm buổi phù hợp <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {nextActivity && (
        <section className="fitlyo-elevated grid gap-4 rounded-[1.65rem] p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-secondary/55 p-3 text-primary"><CalendarDays className="h-6 w-6" /></span>
            <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Lịch gần nhất</p><h2 className="mt-1 text-lg font-black">{nextActivity.title}</h2><p className="mt-1 text-sm text-muted-foreground">{nextActivity.dateLabel} · {nextActivity.timeRange} · {nextActivity.venueName}</p></div>
          </div>
          <Button asChild variant="outline" className="rounded-xl font-bold"><Link to="/player/schedule">Xem lịch của tôi <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </section>
      )}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#3dbca1]">Đề xuất theo DUPR {profile.dupr.toFixed(2)}</p><h2 className="mt-1 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Buổi chơi dành cho bạn</h2></div>
          <Link to="/player/matches" className="hidden items-center gap-1 text-sm font-bold text-primary hover:underline sm:flex">Xem tất cả <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">{suggested.map((match) => <PlayerMatchCard key={match.id} match={match} />)}</div>
        <Button onClick={() => navigate('/player/matches')} variant="outline" className="w-full rounded-2xl sm:hidden"><Search className="h-4 w-4" /> Khám phá thêm buổi chơi</Button>
      </section>
    </div>
  )
}
