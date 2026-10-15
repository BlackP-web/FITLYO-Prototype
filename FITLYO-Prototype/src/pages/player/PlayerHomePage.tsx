import { ArrowRight, CalendarDays, ChevronDown, Clock3, MapPin, Search, ShieldCheck, Sparkles, Trophy, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlayerMatchCard } from '@/components/player/PlayerMatchCard'
import { Button } from '@/components/ui/button'
import { usePlayerStore } from '@/store/usePlayerStore'

export function PlayerHomePage() {
  const navigate = useNavigate()
  const profile = usePlayerStore((state) => state.profile)
  const matches = usePlayerStore((state) => state.matches)
  const schedule = usePlayerStore((state) => state.schedule)
  const [level, setLevel] = useState('3.0–3.75')
  const [area, setArea] = useState('TP. Thủ Đức')
  const [date, setDate] = useState('2026-10-15')
  const suggested = matches.filter((match) => match.status === 'OPEN' && profile.dupr >= match.duprMin - 0.25 && profile.dupr <= match.duprMax + 0.25).slice(0, 2)
  const nextActivity = schedule.find((item) => item.status === 'UPCOMING')

  return (
    <div className="space-y-12 pb-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_28px_80px_rgba(20,63,66,0.08)]">
        <div className="grid min-h-[500px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Your Fit. Your Way.
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.03] tracking-[-0.055em] text-foreground sm:text-6xl">
              Tìm buổi chơi <span className="relative text-primary after:absolute after:-bottom-1 after:left-0 after:h-2 after:w-full after:-rotate-1 after:rounded-full after:bg-secondary after:-z-10">hợp với bạn.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Chọn theo trình độ DUPR, khu vực và giờ rảnh. FITLYO lo phần còn lại để mỗi trận đều cân trình, đúng giờ và rõ chi phí.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/player/matches')} className="gap-2 rounded-2xl px-6 font-bold shadow-lg shadow-primary/15">Tìm kèo phù hợp <ArrowRight className="h-4 w-4" /></Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/player/venues')} className="rounded-2xl px-6 font-bold">Khám phá sân</Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Cọc an toàn</span>
              <span className="flex items-center gap-1.5"><UsersRound className="h-4 w-4 text-primary" /> Ghép cân DUPR</span>
              <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-orange-500" /> 6 slot chuẩn</span>
            </div>
          </div>

          <div className="relative min-h-80 overflow-hidden lg:m-3 lg:ml-0 lg:rounded-[1.6rem]">
            <img src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1600&auto=format&fit=crop" alt="Cộng đồng Pickleball FITLYO" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#143F42]/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-[#143F42]/65 p-4 text-white backdrop-blur-lg sm:left-auto sm:w-72">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">Chào mừng trở lại</p>
              <div className="mt-2 flex items-center justify-between">
                <div><p className="font-bold">{profile.name}</p><p className="text-xs text-white/75">DUPR {profile.dupr.toFixed(2)} · Uy tín {profile.reputation}%</p></div>
                <span className="rounded-xl bg-secondary px-3 py-2 text-sm font-black text-[#143F42]">+{profile.duprTrend.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-4 -mt-4 grid gap-2 rounded-[1.5rem] border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur-xl sm:mx-8 sm:-mt-8 sm:grid-cols-[1fr_1fr_1fr_auto] sm:p-4 lg:mx-14">
          <label className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/50">
            <Trophy className="h-5 w-5 text-primary" /><span className="flex-1"><small className="block text-[10px] text-muted-foreground">Trình độ</small><select value={level} onChange={(event) => setLevel(event.target.value)} className="w-full appearance-none bg-transparent text-sm font-bold outline-none"><option>3.0–3.75</option><option>2.0–3.0</option><option>3.75–4.5</option></select></span><ChevronDown className="h-4 w-4 text-muted-foreground" />
          </label>
          <label className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/50">
            <MapPin className="h-5 w-5 text-primary" /><span className="flex-1"><small className="block text-[10px] text-muted-foreground">Khu vực</small><select value={area} onChange={(event) => setArea(event.target.value)} className="w-full appearance-none bg-transparent text-sm font-bold outline-none"><option>TP. Thủ Đức</option><option>Thảo Điền</option><option>An Phú</option></select></span><ChevronDown className="h-4 w-4 text-muted-foreground" />
          </label>
          <label className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/50">
            <CalendarDays className="h-5 w-5 text-primary" /><span className="flex-1"><small className="block text-[10px] text-muted-foreground">Ngày chơi</small><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" /></span>
          </label>
          <Button onClick={() => navigate(`/player/matches?area=${encodeURIComponent(area)}&date=${date}`)} className="h-full min-h-12 gap-2 rounded-xl bg-accent px-6 font-black text-accent-foreground hover:bg-accent/90"><Search className="h-4 w-4" /> Tìm buổi</Button>
        </div>
      </section>

      {nextActivity && (
        <section className="grid gap-4 rounded-[1.75rem] border border-primary/15 bg-primary p-6 text-primary-foreground shadow-lg md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-white/10 p-3"><CalendarDays className="h-6 w-6" /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/65">Lịch gần nhất</p><h2 className="mt-1 text-xl font-black">{nextActivity.title}</h2><p className="mt-1 text-sm text-primary-foreground/75">{nextActivity.dateLabel} · {nextActivity.timeRange} · {nextActivity.venueName}</p></div>
          </div>
          <Button asChild variant="secondary" className="rounded-xl font-bold"><Link to="/player/schedule">Xem lịch của tôi <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </section>
      )}

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Dành riêng cho DUPR {profile.dupr.toFixed(2)}</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Buổi chơi gợi ý</h2></div>
          <Link to="/player/matches" className="hidden items-center gap-1 text-sm font-bold text-primary hover:underline sm:flex">Xem tất cả <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">{suggested.map((match) => <PlayerMatchCard key={match.id} match={match} />)}</div>
      </section>
    </div>
  )
}
