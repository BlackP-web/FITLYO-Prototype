import { CalendarDays, Filter, Plus, RotateCcw, Search, SlidersHorizontal, Sparkles, Trophy, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlayerMatchCard } from '@/components/player/PlayerMatchCard'
import { PlayerPageHeader } from '@/components/player/PlayerPageHeader'
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
  const [area, setArea] = useState(searchParams.get('area') || 'Tất cả khu vực')
  const [format, setFormat] = useState('Tất cả thể thức')
  const [duprMin, setDuprMin] = useState(2.75)
  const [duprMax, setDuprMax] = useState(4)
  const [showCreate, setShowCreate] = useState(false)
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

  const resetFilters = () => {
    setSearch(''); setDate('ALL'); setSlot(null); setArea('Tất cả khu vực'); setFormat('Tất cả thể thức'); setDuprMin(2.75); setDuprMax(4)
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

  return (
    <div className="space-y-7 pb-8">
      <PlayerPageHeader eyebrow="SCR_MATCH_01 · Social Matchmaking" title="Kèo đấu phù hợp" description={`Ghép trận quanh TP. Thủ Đức theo DUPR ${profile.dupr.toFixed(2)}, khung giờ và khu vực thuận tiện của bạn.`} icon={Trophy} action={<Button onClick={() => setShowCreate(true)} className="gap-2 rounded-xl font-bold"><Plus className="h-4 w-4" /> Tạo kèo mới</Button>} />

      <section className="rounded-[1.75rem] border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên kèo, cụm sân hoặc khu vực..." className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {dateOptions.map((item) => <button key={item.value} type="button" onClick={() => setDate(item.value)} className={`min-w-28 rounded-xl border px-3 py-2 text-left transition ${date === item.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/30'}`}><span className="block text-xs font-bold">{item.label}</span><span className={`text-[10px] ${date === item.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{item.sub}</span></button>)}
        </div>

        <div className="mt-5 border-t border-border/60 pt-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" /> Chọn slot 90 phút</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {slots.map((item) => <button key={item.number} type="button" onClick={() => setSlot(slot === item.number ? null : item.number)} className={`relative rounded-xl border px-2 py-2.5 text-center transition ${slot === item.number ? 'border-primary bg-secondary/60 text-primary ring-1 ring-primary/20' : 'border-border bg-background hover:border-primary/30'} ${item.number === 5 ? 'border-amber-400/50' : ''}`}><span className="block text-xs font-black">Slot {item.number}</span><span className="text-[9px] text-muted-foreground">{item.time}</span>{item.number === 5 && <span className="absolute -top-2 right-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[8px] font-black text-amber-950">GIỜ VÀNG</span>}</button>)}
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-border/60 pt-5 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-end">
          <div><div className="mb-2 flex justify-between text-xs font-bold"><span>Dải DUPR phù hợp</span><span className="text-primary">{duprMin.toFixed(2)} – {duprMax.toFixed(2)}</span></div><div className="grid grid-cols-2 gap-3"><input type="range" min="1" max="6" step="0.25" value={duprMin} onChange={(event) => setDuprMin(Math.min(Number(event.target.value), duprMax - 0.25))} className="accent-[#143F42]" /><input type="range" min="1" max="6" step="0.25" value={duprMax} onChange={(event) => setDuprMax(Math.max(Number(event.target.value), duprMin + 0.25))} className="accent-[#143F42]" /></div></div>
          <label className="text-xs font-bold">Khu vực<select value={area} onChange={(event) => setArea(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 font-semibold outline-none"><option>Tất cả khu vực</option><option>TP. Thủ Đức</option><option>Thảo Điền</option><option>Hiệp Phú</option><option>An Phú</option></select></label>
          <label className="text-xs font-bold">Thể thức<select value={format} onChange={(event) => setFormat(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 font-semibold outline-none"><option>Tất cả thể thức</option><option>Đôi nam nữ</option><option>Đôi nam</option><option>Giao lưu tự do</option></select></label>
          <Button variant="outline" onClick={resetFilters} className="h-11 gap-2 rounded-xl"><RotateCcw className="h-4 w-4" /> Đặt lại</Button>
        </div>
      </section>

      <div className="flex items-center justify-between"><p className="text-sm font-bold"><span className="text-primary">{filtered.length}</span> kèo phù hợp</p><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Sắp xếp: Giờ gần nhất</span></div>

      {filtered.length ? <div className="grid gap-5 xl:grid-cols-2">{filtered.map((match) => <PlayerMatchCard key={match.id} match={match} />)}</div> : <div className="rounded-[2rem] border border-dashed border-primary/25 bg-secondary/20 px-6 py-16 text-center"><SlidersHorizontal className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-xl font-black">Chưa có kèo phù hợp bộ lọc</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Điều chỉnh dải DUPR, ngày hoặc slot. Bạn cũng có thể là người đầu tiên mở một kèo mới.</p><Button onClick={() => setShowCreate(true)} className="mt-5 gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo kèo đầu tiên</Button></div>}

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
