import {
  ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink,
  Heart, Lock, MapPin, Phone, Plus, ShieldCheck, Sparkles, Star, Store, X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { scheduleOverlapsSlot } from '@/lib/courtDisableSchedule'
import { courtPricingKey, describeCourtPricing, quoteCourtPrice, resolveCourtPricing } from '@/lib/courtPricing'
import { bookingEndOptions, bookingStartOptions, buildOccupiedBlocks, formatBookingDuration } from '@/lib/courtBookingSlots'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'

const OPENING_MINUTES = 6 * 60
const CLOSING_MINUTES = 21 * 60
const STEP_MINUTES = 30
const ROW_HEIGHT = 34

type BookingDraft = {
  courtId: string
  startTime: string
  endTime: string
}

const timeRows = Array.from({ length: (CLOSING_MINUTES - OPENING_MINUTES) / STEP_MINUTES }, (_, index) => {
  const minutes = OPENING_MINUTES + index * STEP_MINUTES
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})
const minutesFor = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}
const timeFor = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const timeRangeFor = (startTime: string, durationMinutes: number) => `${startTime} - ${timeFor(minutesFor(startTime) + durationMinutes)}`
const dateKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
const parseOwnerDate = (value: string) => {
  const [day, month, year] = value.split('/').map(Number)
  return day && month && year ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : dateKey(new Date())
}

export function VenueDetailPage() {
  const { venueId } = useParams()
  const navigate = useNavigate()
  const selectedOwnerDate = useFitlyoStore((state) => state.selectedDate)
  const showToast = useFitlyoStore((state) => state.showToast)
  const session = useAuthStore((state) => state.session)
  const profile = usePlayerStore((state) => state.profile)
  const venue = usePlayerStore((state) => state.venues.find((item) => item.id === venueId))
  const bookCourt = usePlayerStore((state) => state.bookCourt)
  const matches = usePlayerStore((state) => state.matches)
  const courtBookings = useCrossRoleStore((state) => state.courtBookings)
  const slotOverrides = useCrossRoleStore((state) => state.slotOverrides)
  const customEvents = useCrossRoleStore((state) => state.venueCalendarEvents)
  const courtDisableSchedules = useCrossRoleStore((state) => state.courtDisableSchedules)
  const courtPricing = useCrossRoleStore((state) => state.courtPricing)
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedDateIso, setSelectedDateIso] = useState(() => parseOwnerDate(selectedOwnerDate))
  const [booking, setBooking] = useState<BookingDraft | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [favorite, setFavorite] = useState(false)

  const dateLabel = formatDate(selectedDateIso)
  const currentPlayerId = session?.role === 'player' ? session.id : profile.id

  const shiftDate = (days: number) => {
    const current = new Date(`${selectedDateIso}T12:00:00`)
    current.setDate(current.getDate() + days)
    setSelectedDateIso(dateKey(current))
    setBooking(null)
  }

  if (!venue) {
    return <div className="py-24 text-center"><h1 className="text-2xl font-black">Không tìm thấy cụm sân</h1><Button onClick={() => navigate('/player/venues')} className="mt-4">Quay lại khám phá sân</Button></div>
  }

  const slotIsDisabled = (courtId: string, timeRange: string) => {
    const schedule = courtDisableSchedules[`${venue.id}:${courtId}`]
    return Boolean(schedule && scheduleOverlapsSlot(schedule, selectedDateIso, timeRange))
  }
  const timeIsDisabled = (courtId: string, startTime: string) => slotIsDisabled(courtId, timeRangeFor(startTime, STEP_MINUTES))
  const visibleCourts = venue.courts.filter((court) => timeRows.some((time) => !timeIsDisabled(court.id, time)))

  // Mọi lịch đã chiếm sân. Player chỉ thấy "Đã có lịch", không thấy chi tiết (trừ lịch của chính mình).
  const occupiedBlocks = buildOccupiedBlocks({ venue, date: selectedDateIso, courtBookings, matches, events: customEvents, overrides: slotOverrides, currentPlayerId })
  // Cùng quy tắc với form tạo event của Chủ sân: mốc 30 phút, chỉ giờ còn trống, không cho chọn giờ đã qua.
  const startOptionsFor = (courtId: string) => bookingStartOptions(occupiedBlocks, courtId, selectedDateIso, slotIsDisabled)
  const endOptionsFor = (courtId: string, startTime: string) => bookingEndOptions(occupiedBlocks, courtId, startTime, slotIsDisabled)
  const quoteFor = (draft: BookingDraft) => {
    if (!draft.startTime || !draft.endTime) return null
    const court = venue.courts.find((item) => item.id === draft.courtId)
    const pricing = resolveCourtPricing(courtPricing, venue.id, draft.courtId)
    const amount = quoteCourtPrice(pricing, court?.slots ?? [], draft.startTime, minutesFor(draft.endTime) - minutesFor(draft.startTime))
    const scope = courtPricing[courtPricingKey(venue.id, draft.courtId)] ? 'Giá riêng của sân' : 'Giá cụm sân'
    return { amount, note: pricing ? `${scope}: ${describeCourtPricing(pricing)}` : 'Tính theo giá gốc của sân.' }
  }

  const openBooking = () => {
    setBooking({ courtId: visibleCourts[0]?.id ?? venue.courts[0]?.id ?? '', startTime: '', endTime: '' })
    setAccepted(false)
  }

  const handleBooking = () => {
    if (!booking || !accepted) return
    if (!booking.startTime) return showToast('Vui lòng chọn giờ bắt đầu.', 'error')
    if (!booking.endTime) return showToast('Vui lòng chọn giờ kết thúc.', 'error')
    const result = bookCourt({
      venueId: venue.id,
      courtId: booking.courtId,
      date: selectedDateIso,
      dateLabel,
      startTime: booking.startTime,
      endTime: booking.endTime,
      paymentMethod: 'VIETQR',
    })
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success) {
      setBooking(null)
      navigate('/player/schedule')
    }
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
          {venue.images.length > 1 && <><Button size="icon" variant="secondary" onClick={() => setImageIndex((imageIndex - 1 + venue.images.length) % venue.images.length)} className="absolute left-4 top-1/2 rounded-full"><ChevronLeft className="h-5 w-5" /></Button><Button size="icon" variant="secondary" onClick={() => setImageIndex((imageIndex + 1) % venue.images.length)} className="absolute right-4 top-1/2 rounded-full"><ChevronRight className="h-5 w-5" /></Button></>}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9"><Badge className="border-0 bg-secondary text-[#143F42]">ĐẠT CHUẨN THI ĐẤU</Badge><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{venue.name}</h1><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80"><span><Star className="mr-1 inline h-4 w-4 fill-amber-400 text-amber-400" />{venue.rating} ({venue.reviewCount} đánh giá)</span><span><MapPin className="mr-1 inline h-4 w-4" />{venue.distanceKm}km từ bạn</span><span><Clock3 className="mr-1 inline h-4 w-4" />{venue.openingHours}</span></div></div>
        </div>
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]"><div><p className="text-sm leading-7 text-muted-foreground">{venue.description}</p><div className="mt-4 flex flex-wrap gap-2">{venue.amenities.map((item) => <span key={item} className="rounded-full bg-secondary/40 px-3 py-1.5 text-xs font-bold text-primary"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />{item}</span>)}</div></div><div className="rounded-2xl bg-muted/45 p-4 text-sm"><p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{venue.address}</p><p className="mt-3 flex gap-2"><Phone className="h-4 w-4 text-primary" />{venue.hotline}</p><Button asChild variant="outline" className="mt-4 w-full gap-2 rounded-xl"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`} target="_blank" rel="noreferrer">Chỉ đường <ExternalLink className="h-3.5 w-3.5" /></a></Button></div></div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card p-4 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary"><CalendarDays className="h-4 w-4" />Lịch sân</p>
            <h2 className="mt-1 text-2xl font-black">{dateLabel}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ô xám là khung giờ đã có lịch. Bấm “Đặt sân” để chọn sân, giờ bắt đầu và giờ kết thúc còn trống.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => shiftDate(-1)} aria-label="Ngày trước"><ChevronLeft /></Button>
            <input type="date" value={selectedDateIso} onChange={(event) => { setSelectedDateIso(event.target.value); setBooking(null) }} className="h-11 rounded-xl border bg-background px-3 text-sm font-bold" />
            <Button variant="outline" size="icon" onClick={() => shiftDate(1)} aria-label="Ngày sau"><ChevronRight /></Button>
            <Button onClick={openBooking} disabled={!visibleCourts.length} className="h-11 gap-2 rounded-xl font-black"><Plus className="h-4 w-4" />Đặt sân</Button>
          </div>
        </div>

        {visibleCourts.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">Không có sân đang mở trong ngày này.</div> : <div className="mt-5 overflow-x-auto"><div className="min-w-[700px]">
          <div className="grid border-l border-t border-border" style={{ gridTemplateColumns: `74px repeat(${visibleCourts.length}, minmax(200px, 1fr))` }}>
            <div className="border-b border-r bg-card p-3 text-[11px] font-black text-muted-foreground">GIỜ</div>
            {visibleCourts.map((court) => <div key={court.id} className="border-b border-r bg-muted/35 p-3 text-center"><p className="font-black">{court.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{court.type}</p></div>)}
          </div>
          <div className="grid" style={{ gridTemplateColumns: `74px repeat(${visibleCourts.length}, minmax(200px, 1fr))` }}>
            <div className="grid border-l" style={{ gridTemplateRows: `repeat(${timeRows.length}, ${ROW_HEIGHT}px)` }}>{timeRows.map((time, index) => <div key={time} className="border-b border-r bg-card px-2 pt-1 text-[10px] font-bold text-muted-foreground">{index % 2 === 0 ? time : ''}</div>)}</div>
            {visibleCourts.map((court) => <div key={court.id} className="relative grid border-r" style={{ gridTemplateRows: `repeat(${timeRows.length}, ${ROW_HEIGHT}px)` }}>
              {timeRows.map((time) => <div key={time} className={cn('border-b border-border/70', timeIsDisabled(court.id, time) ? 'bg-muted/60' : 'bg-background/35')} aria-hidden="true" />)}
              {occupiedBlocks.filter((block) => block.courtId === court.id).map((block) => {
                const top = ((minutesFor(block.startTime) - OPENING_MINUTES) / STEP_MINUTES) * ROW_HEIGHT
                const height = Math.max(ROW_HEIGHT / 2, (block.durationMinutes / STEP_MINUTES) * ROW_HEIGHT - 6)
                return <div key={block.id} className={cn('absolute inset-x-1 z-10 flex items-start gap-1.5 overflow-hidden rounded-lg border p-2 text-[11px] font-bold', block.mine ? 'border-primary/50 bg-primary/15 text-primary' : 'border-slate-400/40 bg-slate-500/15 text-muted-foreground')} style={{ top, height }}>
                  {block.mine ? <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" /> : <Lock className="mt-px h-3.5 w-3.5 shrink-0" />}
                  <span className="min-w-0"><span className="block truncate">{block.mine ? 'Lịch của bạn' : 'Đã có lịch'}</span><span className="block font-semibold opacity-80">{block.startTime}–{timeFor(minutesFor(block.startTime) + block.durationMinutes)}</span></span>
                </div>
              })}
            </div>)}
          </div>
        </div></div>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border bg-background" />Còn trống</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-500" />Đã có lịch</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-primary" />Lịch của bạn</span>
        </div>
      </section>

      {booking && <BookingDialog
        venueName={venue.name}
        dateLabel={dateLabel}
        courts={visibleCourts}
        draft={booking}
        quote={quoteFor(booking)}
        accepted={accepted}
        getStartOptions={startOptionsFor}
        getEndOptions={endOptionsFor}
        onChange={setBooking}
        onAcceptedChange={setAccepted}
        onClose={() => setBooking(null)}
        onConfirm={handleBooking}
      />}
    </div>
  )
}

function BookingDialog({ venueName, dateLabel, courts, draft, quote, accepted, getStartOptions, getEndOptions, onChange, onAcceptedChange, onClose, onConfirm }: {
  venueName: string
  dateLabel: string
  courts: Array<{ id: string; name: string; type: string }>
  draft: BookingDraft
  quote: { amount: number; note: string } | null
  accepted: boolean
  getStartOptions: (courtId: string) => string[]
  getEndOptions: (courtId: string, startTime: string) => string[]
  onChange: (draft: BookingDraft) => void
  onAcceptedChange: (accepted: boolean) => void
  onClose: () => void
  onConfirm: () => void
}) {
  const startOptions = getStartOptions(draft.courtId)
  const endOptions = getEndOptions(draft.courtId, draft.startTime)
  const changeCourt = (courtId: string) => {
    const keepStart = draft.startTime && getStartOptions(courtId).includes(draft.startTime)
    const keepEnd = keepStart && draft.endTime && getEndOptions(courtId, draft.startTime).includes(draft.endTime)
    onChange({ courtId, startTime: keepStart ? draft.startTime : '', endTime: keepEnd ? draft.endTime : '' })
  }
  const changeStart = (startTime: string) => {
    const keepEnd = draft.endTime && getEndOptions(draft.courtId, startTime).includes(draft.endTime)
    onChange({ ...draft, startTime, endTime: keepEnd ? draft.endTime : '' })
  }
  const selectClass = 'h-12 w-full rounded-xl border bg-background px-3 text-sm font-bold disabled:opacity-60 [&>option]:bg-card [&>option]:text-foreground'
  const ready = Boolean(draft.startTime && draft.endTime && quote)

  return <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#082A2D]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="player-booking-title">
    <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.8rem] border border-border bg-card p-6 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between">
        <div><p className="text-xs font-black uppercase tracking-wider text-primary">Đặt sân</p><h2 id="player-booking-title" className="mt-1 text-2xl font-black">{venueName}</h2><p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p></div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-bold">Sân</span>
          <select value={draft.courtId} onChange={(event) => changeCourt(event.target.value)} className={selectClass}>{courts.map((court) => <option key={court.id} value={court.id}>{court.name} · {court.type}</option>)}</select>
        </label>
        <label className="block"><span className="mb-1.5 block text-sm font-bold">Bắt đầu</span>
          <select value={draft.startTime} onChange={(event) => changeStart(event.target.value)} className={selectClass}><option value="" disabled>Chọn giờ bắt đầu</option>{startOptions.map((time) => <option key={time} value={time}>{time}</option>)}</select>
          <span className="mt-1 block text-[11px] text-muted-foreground">{startOptions.length ? `Còn ${startOptions.length} mốc trống, cách nhau 30 phút` : 'Không còn mốc trống: sân đã kín lịch hoặc đã qua giờ'}</span>
        </label>
        <label className="block"><span className="mb-1.5 block text-sm font-bold">Kết thúc</span>
          <select disabled={!draft.startTime} value={draft.endTime} onChange={(event) => onChange({ ...draft, endTime: event.target.value })} className={selectClass}><option value="" disabled>{draft.startTime ? 'Chọn giờ kết thúc' : 'Chọn giờ bắt đầu trước'}</option>{endOptions.map((time) => <option key={time} value={time}>{time} · {formatBookingDuration(minutesFor(time) - minutesFor(draft.startTime))}</option>)}</select>
          <span className="mt-1 block text-[11px] text-muted-foreground">{draft.startTime ? `Chỉ hiện giờ sau ${draft.startTime}, tối đa đến lịch kế tiếp` : 'Chọn giờ bắt đầu để mở danh sách'}</span>
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-primary bg-secondary/30 p-4 ring-1 ring-primary/20">
        <p className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="h-5 w-5 text-primary" />Tiền sân (tự tính)</p>
        <strong className="mt-2 block text-2xl text-primary">{quote ? `${quote.amount.toLocaleString('vi-VN')}đ` : '—'}</strong>
        <p className="mt-1 text-xs text-muted-foreground">{quote ? `${draft.startTime}–${draft.endTime} (${formatBookingDuration(minutesFor(draft.endTime) - minutesFor(draft.startTime))}) · ${quote.note}` : 'Chọn giờ bắt đầu và kết thúc để hệ thống báo giá.'}</p>
      </div>

      <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm">
        <p className="flex items-center gap-2 font-bold"><Store className="h-4 w-4 text-amber-600 dark:text-amber-300" />Thanh toán tại sân</p>
        <p className="mt-1 text-xs text-muted-foreground">Không cần thanh toán online. Sau khi xác nhận, sân được giữ cho bạn; vui lòng thanh toán {quote ? `${quote.amount.toLocaleString('vi-VN')}đ` : 'tiền sân'} tại quầy khi đến và xuất trình vé QR để check-in.</p>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={accepted} onChange={(event) => onAcceptedChange(event.target.checked)} className="mt-0.5 accent-[#143F42]" /><span>Tôi đồng ý với chính sách đặt sân, thanh toán tại sân và quy định sử dụng cụm sân.</span></label>
      <Button disabled={!accepted || !ready} onClick={onConfirm} className="mt-5 h-12 w-full gap-2 rounded-xl bg-accent font-black text-accent-foreground hover:bg-accent/90"><Sparkles className="h-4 w-4" />{quote ? `Xác nhận đặt sân · Trả ${quote.amount.toLocaleString('vi-VN')}đ tại sân` : 'Chọn giờ để đặt sân'}</Button>
    </div>
  </div>
}
