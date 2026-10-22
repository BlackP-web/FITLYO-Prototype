import {
  ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink,
  Heart, MapPin, Phone, QrCode, ShieldCheck, Sparkles, Star, WalletCards, X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { COURT_SLOT_NUMBERS } from '@/lib/courtSchedule'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'
import type { VenueCourt, VenueSlot } from '@/types/player'

const statusStyle: Record<VenueSlot['status'], string> = {
  AVAILABLE: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 hover:border-emerald-500',
  SOCIAL: 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  COACHING: 'border-blue-500/35 bg-blue-500/10 text-blue-800 dark:text-blue-200',
  PRIVATE: 'border-slate-400/30 bg-slate-500/10 text-muted-foreground',
  MAINTENANCE: 'border-slate-400/30 bg-slate-500/10 text-muted-foreground',
}

const dateKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
const futureDate = (offset: number) => {
  const value = new Date()
  value.setDate(value.getDate() + offset)
  return {
    value: dateKey(value),
    label: new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(value),
    short: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value),
    weekday: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(value),
  }
}
const dates = Array.from({ length: 14 }, (_, index) => futureDate(index + 1))

export function VenueDetailPage() {
  const { venueId } = useParams()
  const navigate = useNavigate()
  const venue = usePlayerStore((state) => state.venues.find((item) => item.id === venueId))
  const profile = usePlayerStore((state) => state.profile)
  const bookedSlotKeys = usePlayerStore((state) => state.bookedSlotKeys)
  const bookCourt = usePlayerStore((state) => state.bookCourt)
  const playerMatches = usePlayerStore((state) => state.matches)
  const courtBookings = useCrossRoleStore((state) => state.courtBookings)
  const slotOverrides = useCrossRoleStore((state) => state.slotOverrides)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [imageIndex, setImageIndex] = useState(0)
  const [date, setDate] = useState(dates[0])
  const [selection, setSelection] = useState<{ court: VenueCourt; slot: VenueSlot } | null>(null)
  const [payment, setPayment] = useState<'WALLET' | 'VIETQR'>('WALLET')
  const [accepted, setAccepted] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const dateScrollerRef = useRef<HTMLDivElement>(null)

  if (!venue) {
    return <div className="py-24 text-center"><h1 className="text-2xl font-black">Không tìm thấy cụm sân</h1><Button onClick={() => navigate('/player/venues')} className="mt-4">Quay lại khám phá sân</Button></div>
  }

  const isBooked = (court: VenueCourt, slot: VenueSlot) => bookedSlotKeys.includes(`${date.value}:${venue.id}:${court.id}:${slot.slotNumber}`)
  const findSocialMatch = (court: VenueCourt, slotNumber: number) => playerMatches.find((item) => (
    item.status !== 'CANCELLED'
    && item.venueId === venue.id
    && item.date === date.value
    && item.slotNumber === slotNumber
    && item.courtName.startsWith(court.name)
  ))
  const effectiveSlot = (court: VenueCourt, slot: VenueSlot): VenueSlot => {
    const sharedBooking = courtBookings.find((item) => item.status === 'CONFIRMED' && item.venueId === venue.id && item.date === date.value && item.courtId === court.id && item.slotNumber === slot.slotNumber)
    const match = findSocialMatch(court, slot.slotNumber)
    const override = slotOverrides.find((item) => item.venueId === venue.id && item.date === date.value && item.courtId === court.id && item.slotNumber === slot.slotNumber)
    if (sharedBooking) return { ...slot, status: 'PRIVATE', label: 'Đã có Player đặt', price: sharedBooking.totalAmount }
    if (match) return { ...slot, status: 'SOCIAL', label: 'Kèo Social', duprRange: `${match.duprMin.toFixed(1)}–${match.duprMax.toFixed(1)}`, players: `${match.participants.length}/${match.maxPlayers}` }
    if (override) return { ...slot, status: override.status === 'AVAILABLE' ? 'AVAILABLE' : override.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'PRIVATE', label: override.status === 'MAINTENANCE' ? 'Bảo trì' : override.status === 'PRIVATE_BOOKED' ? 'Khách vãng lai' : undefined, price: override.price }
    return slot
  }

  const handleBooking = () => {
    if (!selection || !accepted) return
    const result = bookCourt({
      venueId: venue.id,
      courtId: selection.court.id,
      slotNumber: selection.slot.slotNumber,
      date: date.value,
      dateLabel: date.label,
      paymentMethod: payment,
    })
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success) {
      setSelection(null)
      navigate('/player/schedule')
    }
  }

  const selectSlot = (court: VenueCourt, slot: VenueSlot) => {
    setSelection({ court, slot })
    setPayment('WALLET')
    setAccepted(false)
  }

  const scrollDates = (direction: -1 | 1) => {
    dateScrollerRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/player/venues')} className="gap-2 rounded-xl"><ArrowLeft className="h-4 w-4" /> Khám phá sân</Button>
        <Button variant="outline" onClick={() => setFavorite(!favorite)} className={cn('gap-2 rounded-xl', favorite && 'border-rose-500/30 bg-rose-500/10 text-rose-600')}><Heart className={cn('h-4 w-4', favorite && 'fill-current')} />{favorite ? 'Đã yêu thích' : 'Yêu thích'}</Button>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-lg">
        <div className="relative h-[360px] sm:h-[500px]">
          <img src={venue.images[imageIndex]} alt={venue.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3437]/90 via-[#0B3437]/10 to-transparent" />
          {venue.images.length > 1 && <>
            <Button size="icon" variant="secondary" onClick={() => setImageIndex((imageIndex - 1 + venue.images.length) % venue.images.length)} className="absolute left-4 top-1/2 rounded-full"><ChevronLeft className="h-5 w-5" /></Button>
            <Button size="icon" variant="secondary" onClick={() => setImageIndex((imageIndex + 1) % venue.images.length)} className="absolute right-4 top-1/2 rounded-full"><ChevronRight className="h-5 w-5" /></Button>
          </>}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9">
            <Badge className="border-0 bg-secondary text-[#143F42]">ĐẠT CHUẨN THI ĐẤU</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{venue.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
              <span><Star className="mr-1 inline h-4 w-4 fill-amber-400 text-amber-400" />{venue.rating} ({venue.reviewCount} đánh giá)</span>
              <span><MapPin className="mr-1 inline h-4 w-4" />{venue.distanceKm}km từ bạn</span>
              <span><Clock3 className="mr-1 inline h-4 w-4" />{venue.openingHours}</span>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div><p className="text-sm leading-7 text-muted-foreground">{venue.description}</p><div className="mt-4 flex flex-wrap gap-2">{venue.amenities.map((item) => <span key={item} className="rounded-full bg-secondary/40 px-3 py-1.5 text-xs font-bold text-primary"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />{item}</span>)}</div></div>
          <div className="rounded-2xl bg-muted/45 p-4 text-sm"><p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{venue.address}</p><p className="mt-3 flex gap-2"><Phone className="h-4 w-4 text-primary" />{venue.hotline}</p><Button asChild variant="outline" className="mt-4 w-full gap-2 rounded-xl"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`} target="_blank" rel="noreferrer">Chỉ đường <ExternalLink className="h-3.5 w-3.5" /></a></Button></div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card p-4 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-primary">SCR_VENUE_02 · 10-Slot Matrix</p><h2 className="mt-1 text-2xl font-black">Lịch sân 90 phút</h2><p className="mt-1 text-sm text-muted-foreground">10 slot liên tục từ 06:00–21:00. Player chỉ có thể bao sân; kèo Social do Field Manager tạo.</p></div>
          <div className="flex min-w-0 items-center gap-2 sm:max-w-[620px]">
            <Button type="button" size="icon" variant="outline" className="h-11 w-11 shrink-0 rounded-xl" onClick={() => scrollDates(-1)} aria-label="Xem các ngày trước"><ChevronLeft className="h-4 w-4" /></Button>
            <div ref={dateScrollerRef} className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:thin]">
              {dates.map((item) => <button key={item.value} type="button" onClick={() => { setDate(item); setSelection(null) }} aria-pressed={date.value === item.value} className={cn('min-h-12 min-w-[122px] snap-start rounded-xl border px-3 py-2 text-left transition', date.value === item.value ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-card hover:border-primary/45')}><span className="block text-[10px] font-bold uppercase opacity-70">{item.weekday}</span><span className="mt-0.5 block text-sm font-black">{item.short}</span></button>)}
            </div>
            <Button type="button" size="icon" variant="outline" className="h-11 w-11 shrink-0 rounded-xl" onClick={() => scrollDates(1)} aria-label="Xem các ngày tiếp theo"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto"><div className="min-w-[860px]"><div className="grid gap-2" style={{ gridTemplateColumns: `150px repeat(${venue.courts.length}, minmax(280px, 1fr))` }}>
          <div className="rounded-xl bg-muted/50 p-3 text-xs font-black">KHUNG GIỜ</div>
          {venue.courts.map((court) => <div key={court.id} className="rounded-xl bg-muted/50 p-3 text-center"><b className="text-sm">{court.name}</b><span className="ml-2 text-[10px] text-muted-foreground">{court.type}</span></div>)}
          {COURT_SLOT_NUMBERS.flatMap((slotNumber) => {
            const firstSlot = venue.courts[0].slots.find((slot) => slot.slotNumber === slotNumber)!
            return [
              <div key={`time-${slotNumber}`} className={cn('flex flex-col justify-center rounded-xl border p-3', slotNumber >= 9 ? 'border-amber-500/30 bg-amber-500/10' : 'border-border/60 bg-background')}><b className="text-xs">Slot {slotNumber}</b><span className="mt-1 text-[10px] text-muted-foreground">{firstSlot.timeRange}</span>{slotNumber >= 9 && <Badge className="mt-2 w-fit border-0 bg-amber-400 text-[8px] text-amber-950">GIỜ VÀNG</Badge>}</div>,
              ...venue.courts.map((court) => {
                const sourceSlot = court.slots.find((item) => item.slotNumber === slotNumber)!
                const slot = effectiveSlot(court, sourceSlot)
                const booked = isBooked(court, slot)
                const available = slot.status === 'AVAILABLE' && !booked
                const socialMatch = slot.status === 'SOCIAL' ? findSocialMatch(court, slotNumber) : undefined
                const interactive = available || Boolean(socialMatch)
                return <button key={`${court.id}-${slotNumber}`} type="button" disabled={!interactive} onClick={() => socialMatch ? navigate(`/player/matches/${socialMatch.id}`) : selectSlot(court, slot)} aria-label={socialMatch ? `Xem chi tiết ${socialMatch.title}` : available ? `Đặt ${court.name}, slot ${slotNumber}` : undefined} className={cn('min-h-24 rounded-xl border p-3 text-left transition', booked ? statusStyle.PRIVATE : statusStyle[slot.status], interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2')}><div className="flex items-start justify-between gap-2"><b className="text-xs">{booked ? 'ĐÃ ĐẶT BỞI BẠN' : slot.status === 'AVAILABLE' ? 'TRỐNG · ĐẶT NGAY' : slot.label ?? slot.status}</b>{slot.isPeak && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}</div><p className="mt-2 text-base font-black">{slot.price ? `${slot.price.toLocaleString('vi-VN')}đ` : 'Tạm khóa'}</p>{slot.duprRange && <p className="mt-1 text-[10px]">DUPR {slot.duprRange} · {slot.players}</p>}{socialMatch && <p className="mt-2 text-[10px] font-black underline underline-offset-2">Xem chi tiết kèo</p>}</button>
              }),
            ]
          })}
        </div></div></div>
        <div className="mt-5 flex flex-wrap gap-3 text-[10px] font-bold text-muted-foreground">{[['bg-emerald-500','Còn trống'],['bg-amber-500','Kèo Social'],['bg-blue-500','Lớp HLV'],['bg-slate-500','Đã bao / Tạm khóa']].map(([color,label]) => <span key={label} className="flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>)}</div>
      </section>

      {selection && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#082A2D]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.8rem] border border-border bg-card p-6 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Đặt slot sân</p><h2 className="mt-1 text-2xl font-black">{selection.court.name} · Slot {selection.slot.slotNumber}</h2><p className="mt-1 text-sm text-muted-foreground">{date.label} · {selection.slot.timeRange}</p></div><Button size="icon" variant="ghost" onClick={() => setSelection(null)}><X className="h-5 w-5" /></Button></div>
          <div className="mt-6 rounded-2xl border border-primary bg-secondary/30 p-4 ring-1 ring-primary/20"><ShieldCheck className="h-5 w-5 text-primary" /><b className="mt-3 block">Bao trọn sân</b><p className="mt-1 text-xs text-muted-foreground">Không gian riêng cho nhóm trong 90 phút. Player không có quyền tạo kèo Social.</p><strong className="mt-3 block text-lg">{selection.slot.price.toLocaleString('vi-VN')}đ</strong></div>
          <div className="mt-5 space-y-2"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Thanh toán mô phỏng</p><button type="button" onClick={() => setPayment('WALLET')} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left', payment === 'WALLET' && 'border-primary bg-primary/5')}><WalletCards className="h-4 w-4 text-primary" /><span className="flex-1 text-sm font-bold">Ví FITLYO · {profile.walletBalance.toLocaleString('vi-VN')}đ</span>{payment === 'WALLET' && <CheckCircle2 className="h-4 w-4 text-primary" />}</button><button type="button" onClick={() => setPayment('VIETQR')} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left', payment === 'VIETQR' && 'border-primary bg-primary/5')}><QrCode className="h-4 w-4 text-primary" /><span className="flex-1 text-sm font-bold">VietQR · Không thu tiền thật</span>{payment === 'VIETQR' && <CheckCircle2 className="h-4 w-4 text-primary" />}</button></div>
          {payment === 'VIETQR' && <div className="mt-4 rounded-2xl border border-dashed border-primary/25 bg-white p-4 text-center text-[#143F42]"><QrCode className="mx-auto h-16 w-16" /><p className="mt-2 font-mono text-xs font-black">FITLYO-{venue.id.toUpperCase()}-S{selection.slot.slotNumber}</p></div>}
          <div className="mt-5 rounded-2xl border border-border/70 p-4 text-xs leading-5 text-muted-foreground"><b className="text-foreground">Chính sách hủy:</b> trước 12 giờ hoàn 100% phí; từ 6–12 giờ hoàn 50% số tiền đã thanh toán; dưới 6 giờ không hoàn. Mọi khoản hoàn trả về Ví FITLYO.</div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 accent-[#143F42]" /><span>Tôi đồng ý với chính sách đặt sân, hoàn tiền và quy định sử dụng cụm sân.</span></label>
          <div className="mt-5 space-y-3 rounded-2xl bg-muted/45 p-4"><div className="flex items-center justify-between text-sm"><span>Tổng giá trị booking</span><b>{selection.slot.price.toLocaleString('vi-VN')}đ</b></div><div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm"><span>Thanh toán ngay · 100%</span><b className="text-xl text-primary">{selection.slot.price.toLocaleString('vi-VN')}đ</b></div><div className="flex items-center justify-between text-sm"><span>Còn lại tại quầy</span><b className="text-emerald-600">0đ</b></div></div>
          <Button disabled={!accepted} onClick={handleBooking} className="mt-5 h-12 w-full gap-2 rounded-xl bg-accent font-black text-accent-foreground hover:bg-accent/90"><Sparkles className="h-4 w-4" />Thanh toán 100% · {selection.slot.price.toLocaleString('vi-VN')}đ</Button>
        </div>
      </div>}
    </div>
  )
}
