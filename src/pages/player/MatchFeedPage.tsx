import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Filter,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlayerMatchCard } from '@/components/player/PlayerMatchCard'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const slots = [
  { number: 1, time: '06:00–07:30' }, { number: 2, time: '07:30–09:00' },
  { number: 3, time: '09:00–10:30' }, { number: 4, time: '15:30–17:00' },
  { number: 5, time: '18:30–20:00' }, { number: 6, time: '20:00–21:30' },
]

const dateOptions = [
  { value: 'ALL', label: 'Tất cả ngày', sub: '14 ngày tới' },
  { value: '2026-10-15', label: 'Hôm nay', sub: '15/10' },
  { value: '2026-10-16', label: 'Ngày mai', sub: '16/10' },
  { value: '2026-10-17', label: 'Thứ Bảy', sub: '17/10' },
]

export function MatchFeedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const matches = usePlayerStore((state) => state.matches)
  const venues = usePlayerStore((state) => state.venues)
  const profile = usePlayerStore((state) => state.profile)
  const createMatch = usePlayerStore((state) => state.createMatch)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [search, setSearch] = useState('')
  const [date, setDate] = useState(searchParams.get('date') || 'ALL')
  const [slot, setSlot] = useState<number | null>(null)
  const [area, setArea] = useState(searchParams.get('area') || 'TP. Thủ Đức')
  const [format, setFormat] = useState('Tất cả thể thức')
  const [duprMin, setDuprMin] = useState(2.75)
  const [duprMax, setDuprMax] = useState(4)
  const [showCreate, setShowCreate] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [draft, setDraft] = useState({ title: 'Giao lưu cân trình cùng An', venueId: venues[0]?.id ?? '', slotNumber: 5, date: '2026-10-17', format: 'Đôi nam nữ' as const })

  const filtered = useMemo(() => matches.filter((match) => {
    if (match.status === 'CANCELLED') return false
    if (search && !`${match.title} ${match.venueName} ${match.area}`.toLowerCase().includes(search.toLowerCase())) return false
    if (date !== 'ALL' && match.date !== date) return false
    if (slot && match.slotNumber !== slot) return false
    if (area !== 'Tất cả khu vực' && area !== 'TP. Thủ Đức' && match.area !== area) return false
    if (format !== 'Tất cả thể thức' && match.format !== format) return false
    return match.duprMax >= duprMin && match.duprMin <= duprMax
  }), [matches, search, date, slot, area, format, duprMin, duprMax])

  const focusMatch = filtered[0]

  const resetFilters = () => {
    setSearch(''); setDate('ALL'); setSlot(null); setArea('TP. Thủ Đức'); setFormat('Tất cả thể thức'); setDuprMin(2.75); setDuprMax(4)
  }

  const handleCreate = () => {
    const venue = venues.find((item) => item.id === draft.venueId)
    const selectedSlot = slots.find((item) => item.number === draft.slotNumber)
    if (!venue || !selectedSlot) return
    const result = createMatch({
      title: draft.title,
      venueId: venue.id,
      courtName: `${venue.courts[0].name} · ${venue.courts[0].type}`,
      date: draft.date,
      dateLabel: draft.date === '2026-10-17' ? 'Thứ Bảy, 17/10/2026' : 'Chủ Nhật, 18/10/2026',
      slotNumber: draft.slotNumber,
      timeRange: selectedSlot.time.replace('–', ' - '),
      format: draft.format,
      duprMin: Math.max(1, profile.dupr - 0.5),
      duprMax: Math.min(6, profile.dupr + 0.5),
      deposit: 45000,
    })
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success && result.matchId) { setShowCreate(false); navigate(`/player/matches/${result.matchId}`) }
  }

  const filterPanel = (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h2 className="text-xl font-black tracking-tight">Bộ lọc</h2><button type="button" onClick={resetFilters} className="text-xs font-bold text-primary underline underline-offset-4">Xóa lọc</button></div>
      <label className="block text-xs font-bold text-muted-foreground">Trình độ
        <select className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none" value={`${duprMin}-${duprMax}`} onChange={(event) => { const [min, max] = event.target.value.split('-').map(Number); setDuprMin(min); setDuprMax(max) }}>
          <option value="2.75-4">Phù hợp DUPR {profile.dupr.toFixed(2)}</option><option value="1-2.75">Mới bắt đầu</option><option value="3.5-4.5">Trung cấp</option><option value="4-6">Nâng cao</option>
        </select>
      </label>
      <label className="block text-xs font-bold text-muted-foreground">Khu vực
        <select value={area} onChange={(event) => setArea(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"><option>Tất cả khu vực</option><option>TP. Thủ Đức</option><option>Thảo Điền</option><option>Hiệp Phú</option><option>An Phú</option></select>
      </label>
      <label className="block text-xs font-bold text-muted-foreground">Ngày chơi
        <select value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none">{dateOptions.map((item) => <option key={item.value} value={item.value}>{item.label} · {item.sub}</option>)}</select>
      </label>
      <label className="block text-xs font-bold text-muted-foreground">Thể thức
        <select value={format} onChange={(event) => setFormat(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"><option>Tất cả thể thức</option><option>Đôi nam nữ</option><option>Đôi nam</option><option>Giao lưu tự do</option></select>
      </label>
      <div><p className="text-xs font-bold text-muted-foreground">Giờ rảnh</p><div className="mt-2 grid grid-cols-2 gap-2">{slots.slice(3).map((item) => <button key={item.number} type="button" onClick={() => setSlot(slot === item.number ? null : item.number)} className={`rounded-xl border px-2 py-2 text-[10px] font-bold transition ${slot === item.number ? 'border-primary bg-secondary text-primary' : 'border-border bg-background text-muted-foreground'}`}>{item.time}</button>)}</div></div>
      <Button variant="outline" onClick={resetFilters} className="w-full gap-2 rounded-xl"><RotateCcw className="h-4 w-4" /> Đặt lại bộ lọc</Button>
    </div>
  )

  return (
    <div className="pb-8">
      <header className="fitlyo-rise flex flex-col gap-5 pb-7 pt-5 sm:flex-row sm:items-end sm:justify-between sm:pt-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#3dbca1]"><Trophy className="h-4 w-4" /> Ghép trận theo DUPR</div>
          <h1 className="fitlyo-display mt-3 text-5xl font-black sm:text-6xl">Buổi chơi <span className="fitlyo-swoosh">phù hợp</span></h1>
          <p className="mt-4 text-base text-muted-foreground"><strong className="text-foreground">{filtered.length} buổi chơi</strong> theo lựa chọn của bạn.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 rounded-2xl font-bold"><Plus className="h-4 w-4" /> Tạo kèo mới</Button>
      </header>

      <div className="fitlyo-elevated mb-6 flex items-center gap-2 rounded-[1.5rem] p-2.5 lg:hidden">
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          <button type="button" className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-primary"><Trophy className="mr-1.5 inline h-4 w-4" />DUPR {profile.dupr.toFixed(2)}</button>
          <button type="button" className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-primary"><MapPin className="mr-1.5 inline h-4 w-4" />{area}</button>
          <button type="button" className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-primary"><CalendarDays className="mr-1.5 inline h-4 w-4" />{date === 'ALL' ? 'Mọi ngày' : date.split('-').reverse().join('/')}</button>
        </div>
        <button type="button" onClick={() => setShowMobileFilters(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary" aria-label="Mở bộ lọc"><SlidersHorizontal className="h-5 w-5" /></button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[245px_minmax(0,1fr)] 2xl:grid-cols-[245px_minmax(0,1fr)_330px]">
        <aside className="fitlyo-elevated sticky top-24 hidden rounded-[1.55rem] p-5 lg:block">{filterPanel}</aside>

        <main className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên buổi chơi hoặc cụm sân..." className="h-12 w-full rounded-2xl border border-border bg-card/80 pl-11 pr-4 text-sm outline-none backdrop-blur transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></div>
            <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Còn chỗ trước</span>
          </div>
          {filtered.length ? filtered.map((match) => <PlayerMatchCard key={match.id} match={match} />) : <div className="rounded-[2rem] border border-dashed border-primary/25 bg-secondary/20 px-6 py-16 text-center"><SlidersHorizontal className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-xl font-black">Chưa có buổi chơi phù hợp</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Điều chỉnh ngày, khu vực hoặc dải DUPR. Bạn cũng có thể mở một kèo mới.</p><Button onClick={() => setShowCreate(true)} className="mt-5 gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo kèo đầu tiên</Button></div>}
        </main>

        {focusMatch && <aside className="fitlyo-elevated sticky top-24 hidden overflow-hidden rounded-[1.55rem] 2xl:block">
          <img src={focusMatch.imageUrl} alt={focusMatch.title} className="h-52 w-full object-cover" />
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3dbca1]">Gợi ý tốt nhất</p>
            <h2 className="mt-2 text-xl font-black tracking-tight">{focusMatch.title}</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground"><p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" />{focusMatch.venueName}</p><p className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-primary" />{focusMatch.dateLabel}</p><p className="flex gap-2"><Clock3 className="h-4 w-4 shrink-0 text-primary" />{focusMatch.timeRange}</p><p className="flex gap-2"><UsersRound className="h-4 w-4 shrink-0 text-primary" />{focusMatch.participants.length}/{focusMatch.maxPlayers} người · Còn {Math.max(0, focusMatch.maxPlayers - focusMatch.participants.length)} chỗ</p></div>
            <div className="mt-5 rounded-2xl bg-secondary/35 p-4"><p className="text-xs font-bold text-muted-foreground">Phù hợp với lựa chọn</p><p className="mt-2 text-sm font-black">DUPR {focusMatch.duprMin}–{focusMatch.duprMax} · {focusMatch.area}</p></div>
            <div className="mt-5 flex items-end justify-between"><div><p className="text-[10px] text-muted-foreground">Phí tham gia</p><b className="text-2xl">{focusMatch.deposit.toLocaleString('vi-VN')}đ</b></div></div>
            <Button onClick={() => navigate(`/player/matches/${focusMatch.id}`)} className="fitlyo-coral-button mt-4 h-12 w-full gap-2 rounded-xl border-0 font-black">Tham gia <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </aside>}
      </div>

      {showMobileFilters && <div className="fixed inset-0 z-[80] bg-[#082A2D]/55 p-3 backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true"><div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-[2rem] bg-card p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Tùy chỉnh kết quả</p><h2 className="text-2xl font-black">Bộ lọc buổi chơi</h2></div><Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5" /></Button></div>{filterPanel}<Button onClick={() => setShowMobileFilters(false)} className="fitlyo-coral-button mt-5 h-12 w-full rounded-xl border-0 font-black">Xem {filtered.length} kết quả</Button></div></div>}

      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#082A2D]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Mở kèo hội viên</p><h2 className="mt-1 text-2xl font-black">Tạo kèo ghép mới</h2><p className="mt-1 text-sm text-muted-foreground">Dải DUPR tự động cân quanh điểm {profile.dupr.toFixed(2)} của bạn.</p></div><Button size="icon" variant="ghost" onClick={() => setShowCreate(false)}><X className="h-5 w-5" /></Button></div>
            <div className="mt-6 space-y-4">
              <label className="block text-xs font-bold">Tên kèo<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary" /></label>
              <label className="block text-xs font-bold">Cụm sân<select value={draft.venueId} onChange={(event) => setDraft({ ...draft, venueId: event.target.value })} className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none">{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Ngày chơi<select value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-2 h-11 w-full rounded-xl border bg-background px-3"><option value="2026-10-17">Thứ Bảy, 17/10</option><option value="2026-10-18">Chủ Nhật, 18/10</option></select></label><label className="text-xs font-bold">Khung giờ<select value={draft.slotNumber} onChange={(event) => setDraft({ ...draft, slotNumber: Number(event.target.value) })} className="mt-2 h-11 w-full rounded-xl border bg-background px-3">{slots.map((item) => <option key={item.number} value={item.number}>Slot {item.number} · {item.time}</option>)}</select></label></div>
              <label className="block text-xs font-bold">Thể thức<select value={draft.format} onChange={(event) => setDraft({ ...draft, format: event.target.value as typeof draft.format })} className="mt-2 h-11 w-full rounded-xl border bg-background px-3"><option>Đôi nam nữ</option><option>Đôi nam</option><option>Giao lưu tự do</option></select></label>
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm"><div className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-primary" /> Tóm tắt giữ chỗ</div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>Dải DUPR</span><b className="text-right text-foreground">{Math.max(1, profile.dupr - 0.5).toFixed(2)} – {Math.min(6, profile.dupr + 0.5).toFixed(2)}</b><span>Cọc Host</span><b className="text-right text-foreground">45.000đ</b><span>Số dư sau cọc</span><b className="text-right text-foreground">{(profile.walletBalance - 45000).toLocaleString('vi-VN')}đ</b></div></div>
            </div>
            <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setShowCreate(false)}>Để sau</Button><Button onClick={handleCreate} className="gap-2 font-bold"><Plus className="h-4 w-4" /> Mở kèo & cọc</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}
