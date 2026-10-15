import { AirVent, ArrowRight, Car, Crosshair, Layers3, List, Map, MapPin, Navigation, Search, ShowerHead, Star, Wifi } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerPageHeader } from '@/components/player/PlayerPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const amenityIcon = (amenity: string) => amenity.includes('ô tô') || amenity.includes('Bãi') ? Car : amenity.includes('tắm') ? ShowerHead : amenity.includes('Wifi') ? Wifi : amenity.includes('Máy lạnh') ? AirVent : Layers3

export function VenueDiscoveryPage() {
  const navigate = useNavigate()
  const venues = usePlayerStore((state) => state.venues)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [view, setView] = useState<'MAP' | 'LIST'>('MAP')
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('Tất cả khu vực')
  const [nearOnly, setNearOnly] = useState(false)
  const [indoorOnly, setIndoorOnly] = useState(false)
  const [selectedId, setSelectedId] = useState(venues[0]?.id ?? '')
  const [located, setLocated] = useState(false)

  const filtered = useMemo(() => venues.filter((venue) => {
    if (search && !`${venue.name} ${venue.address} ${venue.area}`.toLowerCase().includes(search.toLowerCase())) return false
    if (area !== 'Tất cả khu vực' && venue.area !== area) return false
    if (nearOnly && venue.distanceKm > 5) return false
    if (indoorOnly && !venue.courts.some((court) => court.type.includes('Trong nhà'))) return false
    return true
  }), [venues, search, area, nearOnly, indoorOnly])
  const selected = filtered.find((venue) => venue.id === selectedId) ?? filtered[0]

  const locate = () => {
    setLocated(true)
    showToast('Đã mô phỏng định vị tại Thảo Điền, TP. Thủ Đức.', 'success')
  }

  return (
    <div className="space-y-7 pb-10">
      <PlayerPageHeader eyebrow="SCR_VENUE_01 · Venue Discovery" title="Khám phá cụm sân" description="Tìm sân gần bạn, kiểm tra tiện ích và số slot còn trống trước khi đặt." icon={MapPin} action={<div className="flex rounded-xl border border-border bg-card p-1"><Button size="sm" variant={view === 'MAP' ? 'default' : 'ghost'} onClick={() => setView('MAP')} className="gap-1.5 rounded-lg"><Map className="h-4 w-4" /> Bản đồ</Button><Button size="sm" variant={view === 'LIST' ? 'default' : 'ghost'} onClick={() => setView('LIST')} className="gap-1.5 rounded-lg"><List className="h-4 w-4" /> Danh sách</Button></div>} />

      <section className="rounded-[1.6rem] border border-border/70 bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên sân, phường hoặc địa chỉ..." className="h-12 w-full rounded-2xl border bg-background pl-11 pr-4 text-sm outline-none focus:border-primary" /></div>
          <select value={area} onChange={(event) => setArea(event.target.value)} className="h-12 rounded-2xl border bg-background px-4 text-sm font-bold outline-none"><option>Tất cả khu vực</option><option>Thảo Điền</option><option>Hiệp Phú</option><option>An Phú</option></select>
          <Button onClick={locate} variant="outline" className="h-12 gap-2 rounded-2xl"><Crosshair className="h-4 w-4" />{located ? 'Đã định vị' : 'Gần tôi'}</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setNearOnly(!nearOnly)} className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', nearOnly ? 'border-primary bg-secondary/45 text-primary' : 'border-border text-muted-foreground')}>Trong bán kính 5km</button><button type="button" onClick={() => setIndoorOnly(!indoorOnly)} className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', indoorOnly ? 'border-primary bg-secondary/45 text-primary' : 'border-border text-muted-foreground')}>Có sân trong nhà</button><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">Còn slot hôm nay</span></div>
      </section>

      {view === 'MAP' ? (
        <section className="grid min-h-[620px] overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm lg:grid-cols-[1fr_380px]">
          <div className="relative min-h-[420px] overflow-hidden bg-[#DDE7DF] dark:bg-[#153D3F]">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(32deg, transparent 47%, rgba(20,63,66,.13) 48%, rgba(20,63,66,.13) 51%, transparent 52%), linear-gradient(122deg, transparent 47%, rgba(20,63,66,.09) 48%, rgba(20,63,66,.09) 51%, transparent 52%)', backgroundSize: '110px 90px' }} />
            <div className="absolute left-[18%] top-[22%] h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-lg"><span className="absolute inset-0 animate-ping rounded-full bg-blue-400/50" /></div>
            <span className="absolute left-[18%] top-[27%] -translate-x-1/2 rounded-lg bg-card px-2 py-1 text-[10px] font-bold shadow">Vị trí của bạn</span>
            {filtered.map((venue, index) => { const positions = [{ left: '42%', top: '33%' }, { left: '68%', top: '58%' }, { left: '28%', top: '68%' }]; const pos = positions[index % positions.length]; return <button key={venue.id} type="button" onClick={() => setSelectedId(venue.id)} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos}><span className={cn('flex items-center gap-1 rounded-full border-2 border-white px-3 py-2 text-xs font-black shadow-xl transition hover:scale-105', selected?.id === venue.id ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground')}><MapPin className="h-4 w-4" />{venue.distanceKm}km · {venue.courts.reduce((sum, court) => sum + court.slots.filter((slot) => slot.status === 'AVAILABLE').length, 0)} slot</span></button> })}
            <div className="absolute bottom-4 left-4 rounded-xl border border-border/60 bg-card/90 px-3 py-2 text-[10px] font-semibold text-muted-foreground shadow backdrop-blur"><Navigation className="mr-1 inline h-3.5 w-3.5 text-primary" />Bản đồ mô phỏng · Không dùng GPS thật</div>
          </div>
          <div className="border-t border-border/60 p-4 lg:border-l lg:border-t-0">{selected ? <VenueCard venue={selected} onSelect={() => navigate(`/player/venues/${selected.id}`)} vertical /> : <p className="p-8 text-center text-sm text-muted-foreground">Không có sân phù hợp bộ lọc.</p>}</div>
        </section>
      ) : (
        filtered.length ? <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{filtered.map((venue) => <VenueCard key={venue.id} venue={venue} onSelect={() => navigate(`/player/venues/${venue.id}`)} />)}</div> : <div className="rounded-[2rem] border border-dashed py-16 text-center text-sm text-muted-foreground">Không có cụm sân phù hợp bộ lọc.</div>
      )}
    </div>
  )
}

function VenueCard({ venue, onSelect, vertical = false }: { venue: ReturnType<typeof usePlayerStore.getState>['venues'][number]; onSelect: () => void; vertical?: boolean }) {
  const available = venue.courts.reduce((sum, court) => sum + court.slots.filter((slot) => slot.status === 'AVAILABLE').length, 0)
  const prices = venue.courts.flatMap((court) => court.slots).filter((slot) => slot.price > 0).map((slot) => slot.price)
  return <article className={cn('group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-border/70 bg-card shadow-sm transition hover:border-primary/30 hover:shadow-lg', vertical && 'border-0 shadow-none')}><div className={cn('relative overflow-hidden', vertical ? 'h-56 rounded-2xl' : 'h-52')}><img src={venue.images[0]} alt={venue.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#143F42]/70 via-transparent to-transparent" /><Badge className="absolute left-3 top-3 border-0 bg-card/90 text-foreground">{venue.courts.length} sân</Badge><span className="absolute bottom-3 left-3 rounded-full bg-secondary px-3 py-1 text-xs font-black text-[#143F42]">Còn {available} slot</span><span className="absolute bottom-3 right-3 rounded-full bg-black/35 px-2.5 py-1 text-xs font-bold text-white backdrop-blur"><Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />{venue.rating}</span></div><div className="flex flex-1 flex-col p-5"><h2 className="text-lg font-black tracking-tight">{venue.name}</h2><p className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{venue.address} · {venue.distanceKm}km</p><div className="mt-4 flex flex-wrap gap-2">{venue.amenities.slice(0, 4).map((amenity) => { const Icon = amenityIcon(amenity); return <span key={amenity} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold"><Icon className="h-3 w-3 text-primary" />{amenity}</span> })}</div><div className="mt-auto flex items-end justify-between gap-3 border-t border-border/60 pt-5"><div><span className="text-[10px] text-muted-foreground">Từ</span><p className="text-base font-black">{Math.min(...prices).toLocaleString('vi-VN')}đ<span className="text-[10px] font-medium"> / 90p</span></p></div><Button onClick={onSelect} className="gap-2 rounded-xl font-bold">Xem lịch sân <ArrowRight className="h-4 w-4" /></Button></div></div></article>
}
