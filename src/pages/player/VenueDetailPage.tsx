import {
  ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink,
  Heart, MapPin, Phone, QrCode, ShieldCheck, Sparkles, Star, X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { scheduleOverlapsSlot } from '@/lib/courtDisableSchedule'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useCrossRoleStore, type VenueCalendarEventType } from '@/store/useCrossRoleStore'

const OPENING_MINUTES = 6 * 60
const CLOSING_MINUTES = 21 * 60
const STEP_MINUTES = 30
const ROW_HEIGHT = 34

const eventMeta: Record<VenueCalendarEventType, { label: string; className: string }> = {
  AVAILABILITY: { label: 'Khoảng đặt', className: 'border-emerald-400/50 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200' },
  WALK_IN: { label: 'Khách vãng lai', className: 'border-orange-400/50 bg-orange-500/20 text-orange-900 dark:text-orange-200' },
  SOCIAL: { label: 'Kèo Social', className: 'border-sky-400/50 bg-sky-500/20 text-sky-900 dark:text-sky-200' },
  COACHING: { label: 'Lớp Coach', className: 'border-violet-400/50 bg-violet-500/20 text-violet-900 dark:text-violet-200' },
  MAINTENANCE: { label: 'Bảo trì', className: 'border-slate-400/50 bg-slate-500/20 text-slate-800 dark:text-slate-200' },
  PRIVATE: { label: 'Đã đặt / khóa sân', className: 'border-amber-400/50 bg-amber-500/20 text-amber-900 dark:text-amber-200' },
}

type PlayerCalendarEvent = {
  id: string
  courtId: string
  courtName: string
  type: VenueCalendarEventType
  title: string
  startTime: string
  durationMinutes: number
  amount: number
  paymentMethod?: 'CASH' | 'VIETQR'
  contactName?: string
  matchId?: string
  availabilityId?: string
}

type BookingSelection = PlayerCalendarEvent

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
const eventOverlaps = (leftStart: string, leftDuration: number, rightStart: string, rightDuration: number) => (
  minutesFor(leftStart) < minutesFor(rightStart) + rightDuration
  && minutesFor(leftStart) + leftDuration > minutesFor(rightStart)
)

export function VenueDetailPage() {
  const { venueId } = useParams()
  const navigate = useNavigate()
  const selectedOwnerDate = useFitlyoStore((state) => state.selectedDate)
  const showToast = useFitlyoStore((state) => state.showToast)
  const venue = usePlayerStore((state) => state.venues.find((item) => item.id === venueId))
  const bookCourt = usePlayerStore((state) => state.bookCourt)
  const matches = usePlayerStore((state) => state.matches)
  const courtBookings = useCrossRoleStore((state) => state.courtBookings)
  const slotOverrides = useCrossRoleStore((state) => state.slotOverrides)
  const customEvents = useCrossRoleStore((state) => state.venueCalendarEvents)
  const courtDisableSchedules = useCrossRoleStore((state) => state.courtDisableSchedules)
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedDateIso, setSelectedDateIso] = useState(() => parseOwnerDate(selectedOwnerDate))
  const [selection, setSelection] = useState<BookingSelection | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [favorite, setFavorite] = useState(false)

  const dateLabel = formatDate(selectedDateIso)

  const shiftDate = (days: number) => {
    const current = new Date(`${selectedDateIso}T12:00:00`)
    current.setDate(current.getDate() + days)
    setSelectedDateIso(dateKey(current))
    setSelection(null)
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

  const calendarEvents: PlayerCalendarEvent[] = (() => {
    const bookingEvents: PlayerCalendarEvent[] = courtBookings
      .filter((booking) => booking.status === 'CONFIRMED' && booking.venueId === venue.id && booking.date === selectedDateIso)
      .map((booking) => {
        const startTime = booking.timeRange.split(' - ')[0] ?? '06:00'
        const endTime = booking.timeRange.split(' - ')[1] ?? '07:30'
        return {
          id: `booking-${booking.id}`, courtId: booking.courtId, courtName: booking.courtName, type: 'PRIVATE',
          title: `Đã đặt sân · ${booking.playerName}`, startTime, durationMinutes: Math.max(1, minutesFor(endTime) - minutesFor(startTime)), amount: booking.paidAmount,
          paymentMethod: 'VIETQR', contactName: booking.playerName,
        }
      })
    const socialEvents: PlayerCalendarEvent[] = matches
      .filter((match) => match.status !== 'CANCELLED' && match.venueId === venue.id && match.date === selectedDateIso)
      .map((match) => {
        const startTime = match.timeRange.split(' - ')[0] ?? '06:00'
        const endTime = match.timeRange.split(' - ')[1] ?? '07:30'
        return {
          id: `social-${match.id}`, courtId: match.courtId ?? venue.courts.find((court) => match.courtName.startsWith(court.name))?.id ?? '', courtName: match.courtName,
          type: 'SOCIAL', title: match.title, startTime, durationMinutes: Math.max(1, minutesFor(endTime) - minutesFor(startTime)), amount: 0, matchId: match.id,
        }
      })
    const blockingEvents = [...bookingEvents, ...socialEvents]
    const ownerEvents: PlayerCalendarEvent[] = customEvents
      .filter((event) => event.venueId === venue.id && event.date === selectedDateIso)
      .filter((event) => event.type !== 'AVAILABILITY' || !blockingEvents.some((item) => item.courtId === event.courtId && eventOverlaps(item.startTime, item.durationMinutes, event.startTime, event.durationMinutes)))
      .map((event) => ({
        id: event.id, courtId: event.courtId, courtName: event.courtName, type: event.type, title: event.title,
        startTime: event.startTime, durationMinutes: event.durationMinutes, amount: event.amount,
        paymentMethod: event.paymentMethod, availabilityId: event.type === 'AVAILABILITY' ? event.id : undefined,
      }))
    const overrideEvents: PlayerCalendarEvent[] = slotOverrides
      .filter((override) => override.venueId === venue.id && override.date === selectedDateIso && override.status !== 'AVAILABLE')
      .map((override) => {
        const court = venue.courts.find((item) => item.id === override.courtId)
        const slot = court?.slots.find((item) => item.slotNumber === override.slotNumber)
        const type: VenueCalendarEventType = override.status === 'MAINTENANCE' ? 'MAINTENANCE' : override.status === 'MATCH_PUBLISHED' ? 'SOCIAL' : override.status === 'COACHING' ? 'COACHING' : 'WALK_IN'
        return {
          id: `override-${override.key}`, courtId: override.courtId, courtName: court?.name ?? 'Sân', type,
          title: override.customerName ? `${eventMeta[type].label} · ${override.customerName}` : eventMeta[type].label,
          startTime: slot?.timeRange.split(' - ')[0] ?? '06:00', durationMinutes: slot ? Math.max(1, minutesFor(slot.timeRange.split(' - ')[1] ?? '07:30') - minutesFor(slot.timeRange.split(' - ')[0] ?? '06:00')) : 90,
          amount: override.price, paymentMethod: override.paymentMethod === 'CASH' || override.paymentMethod === 'VIETQR' ? override.paymentMethod : undefined,
        }
      })
      .filter((event) => ![...blockingEvents, ...ownerEvents.filter((item) => item.type !== 'AVAILABILITY')].some((item) => item.courtId === event.courtId && eventOverlaps(item.startTime, item.durationMinutes, event.startTime, event.durationMinutes)))
    return [...blockingEvents, ...overrideEvents, ...ownerEvents]
  })()

  const handleEventClick = (event: PlayerCalendarEvent) => {
    if (event.type === 'AVAILABILITY') {
      setSelection(event)
      setAccepted(false)
      return
    }
    if (event.matchId) {
      navigate(`/player/matches/${event.matchId}`)
      return
    }
    showToast(`${event.title} · ${event.startTime}–${timeFor(minutesFor(event.startTime) + event.durationMinutes)}. Khoảng này không nhận booking mới.`, 'info')
  }

  const handleBooking = () => {
    if (!selection || !accepted) return
    const result = bookCourt({
      venueId: venue.id,
      courtId: selection.courtId,
      date: selectedDateIso,
      dateLabel,
      startTime: selection.startTime,
      endTime: timeFor(minutesFor(selection.startTime) + selection.durationMinutes),
      availabilityId: selection.availabilityId,
      paymentMethod: 'VIETQR',
    })
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success) {
      setSelection(null)
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
        <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary"><CalendarDays className="h-4 w-4" />Lịch sân theo Chủ sân</p><h2 className="mt-1 text-2xl font-black">{formatDate(selectedDateIso)}</h2><p className="mt-1 text-sm text-muted-foreground">Chỉ các khoảng đặt đã được Chủ sân cấu hình mới có thể đặt.</p></div><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => shiftDate(-1)} aria-label="Ngày trước"><ChevronLeft /></Button><input type="date" value={selectedDateIso} onChange={(event) => { setSelectedDateIso(event.target.value); setSelection(null) }} className="h-11 rounded-xl border bg-background px-3 text-sm font-bold" /><Button variant="outline" size="icon" onClick={() => shiftDate(1)} aria-label="Ngày sau"><ChevronRight /></Button></div></div>

        {visibleCourts.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">Không có sân đang mở trong ngày này.</div> : <div className="mt-5 overflow-x-auto"><div className="min-w-[900px]"><div className="grid border-l border-t border-border" style={{ gridTemplateColumns: `74px repeat(${visibleCourts.length}, minmax(220px, 1fr))` }}><div className="border-b border-r bg-card p-3 text-[11px] font-black text-muted-foreground">GIỜ</div>{visibleCourts.map((court) => <div key={court.id} className="border-b border-r bg-muted/35 p-3 text-center"><p className="font-black">{court.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{court.type}</p></div>)}</div><div className="grid" style={{ gridTemplateColumns: `74px repeat(${visibleCourts.length}, minmax(220px, 1fr))` }}><div className="grid border-l" style={{ gridTemplateRows: `repeat(${timeRows.length}, ${ROW_HEIGHT}px)` }}>{timeRows.map((time, index) => <div key={time} className="border-b border-r bg-card px-2 pt-1 text-[10px] font-bold text-muted-foreground">{index % 2 === 0 ? time : ''}</div>)}</div>{visibleCourts.map((court) => { const events = calendarEvents.filter((event) => event.courtId === court.id); return <div key={court.id} className="relative grid border-r" style={{ gridTemplateRows: `repeat(${timeRows.length}, ${ROW_HEIGHT}px)` }}>{timeRows.map((time) => { const disabled = timeIsDisabled(court.id, time); return <button key={time} type="button" disabled={disabled} onClick={() => showToast('Khoảng này chưa được Chủ sân cấu hình để đặt.', 'info')} className={`border-b border-border/70 text-left transition ${disabled ? 'cursor-not-allowed bg-muted/60' : 'bg-background/35 hover:bg-primary/5 focus-visible:bg-primary/10'}`} aria-label={disabled ? `${court.name} đang tắt lúc ${time}` : `Khoảng trống chưa cấu hình tại ${court.name}, ${time}`} />})}{events.map((event) => { const top = ((minutesFor(event.startTime) - OPENING_MINUTES) / STEP_MINUTES) * ROW_HEIGHT; const height = Math.max(ROW_HEIGHT / 2, (event.durationMinutes / STEP_MINUTES) * ROW_HEIGHT - 8); const meta = eventMeta[event.type]; return <button key={event.id} type="button" onClick={() => handleEventClick(event)} className={`absolute inset-x-1 z-10 overflow-hidden rounded-xl border p-2 text-left shadow-sm transition ${meta.className} ${event.type === 'AVAILABILITY' ? 'cursor-pointer hover:brightness-95' : 'cursor-pointer hover:brightness-95'}`} style={{ top, height }}><p className="line-clamp-1 text-[11px] font-black">{event.title}</p><p className="mt-1 text-[10px] font-semibold">{event.startTime}–{timeFor(minutesFor(event.startTime) + event.durationMinutes)}</p>{event.type === 'AVAILABILITY' && <p className="mt-1 text-[10px] font-black">{event.amount.toLocaleString('vi-VN')}đ · Bấm để đặt</p>}{event.type !== 'AVAILABILITY' && <p className="mt-1 text-[10px] font-semibold">{meta.label}</p>}</button>})}</div>})}</div></div></div>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">{(['AVAILABILITY', 'WALK_IN', 'SOCIAL', 'COACHING', 'MAINTENANCE', 'PRIVATE'] as VenueCalendarEventType[]).map((type) => <span key={type} className="flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${type === 'AVAILABILITY' ? 'bg-emerald-500' : type === 'SOCIAL' ? 'bg-sky-500' : type === 'COACHING' ? 'bg-violet-500' : type === 'WALK_IN' ? 'bg-orange-500' : type === 'MAINTENANCE' ? 'bg-slate-500' : 'bg-amber-500'}`} />{eventMeta[type].label}</span>)}</div>
      </section>

      {selection && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#082A2D]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="w-full max-w-xl rounded-[1.8rem] border border-border bg-card p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Đặt khoảng sân</p><h2 className="mt-1 text-2xl font-black">{selection.courtName}</h2><p className="mt-1 text-sm text-muted-foreground">{dateLabel} · {selection.startTime}–{timeFor(minutesFor(selection.startTime) + selection.durationMinutes)}</p></div><Button size="icon" variant="ghost" onClick={() => setSelection(null)}><X className="h-5 w-5" /></Button></div><div className="mt-6 rounded-2xl border border-primary bg-secondary/30 p-4 ring-1 ring-primary/20"><ShieldCheck className="h-5 w-5 text-primary" /><b className="mt-3 block">Khoảng đặt do Chủ sân cấu hình</b><p className="mt-1 text-xs text-muted-foreground">Player đặt nguyên khoảng thời gian này, không nhập lại giờ bắt đầu hoặc kết thúc.</p><strong className="mt-3 block text-lg">{selection.amount.toLocaleString('vi-VN')}đ</strong></div><div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm"><p className="flex items-center gap-2 font-bold"><QrCode className="h-4 w-4 text-primary" />VietQR mô phỏng</p><p className="mt-1 text-xs text-muted-foreground">Thanh toán 100% qua VietQR để xác nhận booking.</p></div><div className="mt-4 rounded-2xl border border-dashed border-primary/25 bg-white p-4 text-center text-[#143F42]"><QrCode className="mx-auto h-16 w-16" /><p className="mt-2 font-mono text-xs font-black">FITLYO-{venue.id.toUpperCase()}-{selection.startTime.replace(':', '')}</p></div><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 accent-[#143F42]" /><span>Tôi đồng ý với chính sách đặt sân, hoàn tiền và quy định sử dụng cụm sân.</span></label><div className="mt-5 flex items-center justify-between rounded-2xl bg-muted/45 p-4 text-sm"><span>Thanh toán ngay · 100%</span><b className="text-xl text-primary">{selection.amount.toLocaleString('vi-VN')}đ</b></div><Button disabled={!accepted} onClick={handleBooking} className="mt-5 h-12 w-full gap-2 rounded-xl bg-accent font-black text-accent-foreground hover:bg-accent/90"><Sparkles className="h-4 w-4" />Thanh toán 100% · {selection.amount.toLocaleString('vi-VN')}đ</Button></div></div>}
    </div>
  )
}
