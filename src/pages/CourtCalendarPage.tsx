import { useMemo, useState, type ReactNode } from 'react'
import {
  CalendarDays, Camera, CheckCircle2, ChevronLeft, ChevronRight, MapPin, Pencil, Plus,
  QrCode, Trash2, UsersRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { scheduleOverlapsSlot } from '@/lib/courtDisableSchedule'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useCrossRoleStore, type VenueCalendarEvent, type VenueCalendarEventType } from '@/store/useCrossRoleStore'
import type { PlayerVenue } from '@/types/player'

const OPENING_MINUTES = 6 * 60
const CLOSING_MINUTES = 21 * 60
const STEP_MINUTES = 30
const ROW_HEIGHT = 34

const eventMeta: Record<VenueCalendarEventType, { label: string; className: string }> = {
  WALK_IN: { label: 'Khách vãng lai', className: 'border-orange-400/40 bg-orange-500/15 text-orange-900 dark:text-orange-200' },
  SOCIAL: { label: 'Kèo Social', className: 'border-sky-400/40 bg-sky-500/15 text-sky-900 dark:text-sky-200' },
  COACHING: { label: 'Lớp Coach', className: 'border-violet-400/40 bg-violet-500/15 text-violet-900 dark:text-violet-200' },
  MAINTENANCE: { label: 'Bảo trì', className: 'border-slate-400/40 bg-slate-500/15 text-slate-800 dark:text-slate-200' },
  PRIVATE: { label: 'Khóa sân riêng', className: 'border-amber-400/40 bg-amber-500/15 text-amber-900 dark:text-amber-200' },
  AVAILABILITY: { label: 'Khoảng đặt', className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200' },
}

type DisplayEvent = {
  id: string
  courtId: string
  courtName: string
  type: VenueCalendarEventType
  title: string
  startTime: string
  durationMinutes: number
  amount: number
  paymentMethod?: 'CASH' | 'VIETQR'
  paymentConfirmed?: boolean
  contactName?: string
  contactPhone?: string
  note?: string
  checkInCode?: string
  checkedInAt?: string
  editable: boolean
  source?: VenueCalendarEvent
}

type EventDraft = {
  id?: string
  type: VenueCalendarEventType
  courtId: string
  startTime: string
  endTime: string
  durationMinutes: number
  title: string
  amount: string
  paymentMethod: 'CASH' | 'VIETQR'
  paymentConfirmed: boolean
  contactName: string
  contactPhone: string
  note: string
  checkInCode: string
  checkedInAt?: string
}

type QrScanResult = {
  success: boolean
  message: string
  code?: string
  checkedInAt?: string
}

const minutesFor = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}
const parseTimeInput = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return hour * 60 + minute
}
const timeFor = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const dateKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
const displayDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN')
const timeRows = Array.from({ length: (CLOSING_MINUTES - OPENING_MINUTES) / STEP_MINUTES }, (_, index) => timeFor(OPENING_MINUTES + index * STEP_MINUTES))

const titleForType: Record<VenueCalendarEventType, string> = {
  WALK_IN: 'Khách vãng lai',
  SOCIAL: 'Kèo Social mới',
  COACHING: 'Lớp Coach',
  MAINTENANCE: 'Bảo trì sân',
  PRIVATE: 'Khóa sân riêng',
  AVAILABILITY: 'Khoảng đặt sân',
}

export const CourtCalendarPage = () => {
  const { selectedDate, setSelectedDate, showToast } = useFitlyoStore()
  const checkInTickets = useFitlyoStore((state) => state.checkInTickets)
  const confirmTicketCheckIn = useFitlyoStore((state) => state.confirmTicketCheckIn)
  const venues = usePlayerStore((state) => state.venues)
  const matches = usePlayerStore((state) => state.matches)
  const courtBookings = useCrossRoleStore((state) => state.courtBookings)
  const slotOverrides = useCrossRoleStore((state) => state.slotOverrides)
  const customEvents = useCrossRoleStore((state) => state.venueCalendarEvents)
  const courtDisableSchedules = useCrossRoleStore((state) => state.courtDisableSchedules)
  const createEvent = useCrossRoleStore((state) => state.createVenueCalendarEvent)
  const updateEvent = useCrossRoleStore((state) => state.updateVenueCalendarEvent)
  const removeEvent = useCrossRoleStore((state) => state.removeVenueCalendarEvent)
  const upsertSlotOverrides = useCrossRoleStore((state) => state.upsertSlotOverrides)
  const [venueId, setVenueId] = useState(venues[0]?.id ?? '')
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null)

  const venue = venues.find((item) => item.id === venueId) ?? venues[0]
  const selectedDateIso = useMemo(() => {
    const [day, month, year] = selectedDate.split('/').map(Number)
    return day && month && year ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : dateKey(new Date())
  }, [selectedDate])

  const calendarEvents = useMemo<DisplayEvent[]>(() => {
    if (!venue) return []
    const bookingEvents: DisplayEvent[] = courtBookings
      .filter((booking) => booking.status === 'CONFIRMED' && booking.venueId === venue.id && booking.date === selectedDateIso)
      .map((booking) => ({
        id: `booking-${booking.id}`, courtId: booking.courtId, courtName: booking.courtName, type: 'PRIVATE',
        title: `Player đặt sân · ${booking.playerName}`, startTime: booking.timeRange.split(' - ')[0] ?? '06:00',
        durationMinutes: Math.max(1, minutesFor(booking.timeRange.split(' - ')[1] ?? '07:30') - minutesFor(booking.timeRange.split(' - ')[0] ?? '06:00')), amount: booking.paidAmount, paymentMethod: 'VIETQR',
        contactName: booking.playerName, contactPhone: booking.playerPhone, editable: false,
      }))
    const socialEvents: DisplayEvent[] = matches
      .filter((match) => match.status !== 'CANCELLED' && match.venueId === venue.id && match.date === selectedDateIso)
      .map((match) => ({
        id: `social-${match.id}`,
        courtId: match.courtId ?? venue.courts.find((court) => match.courtName.startsWith(court.name))?.id ?? '',
        courtName: match.courtName, type: 'SOCIAL', title: match.title,
        startTime: match.timeRange.split(' - ')[0] ?? '06:00', durationMinutes: 90, amount: 0, editable: false,
      }))
    const manualEvents: DisplayEvent[] = customEvents
      .filter((event) => event.venueId === venue.id && event.date === selectedDateIso)
      .filter((event) => event.type !== 'AVAILABILITY' || !bookingEvents.some((booking) => booking.courtId === event.courtId && minutesFor(booking.startTime) < minutesFor(event.startTime) + event.durationMinutes && minutesFor(booking.startTime) + booking.durationMinutes > minutesFor(event.startTime)))
      .map((event) => ({ ...event, editable: true, source: event }))
    const overrideEvents: DisplayEvent[] = slotOverrides
      .filter((override) => {
        if (override.venueId !== venue.id || override.date !== selectedDateIso || override.status === 'AVAILABLE') return false
        const court = venue.courts.find((item) => item.id === override.courtId)
        const slot = court?.slots.find((item) => item.slotNumber === override.slotNumber)
        if (!slot) return true
        const [slotStart, slotEnd] = slot.timeRange.split(' - ').map(minutesFor)
        return !manualEvents.some((event) => event.courtId === override.courtId && minutesFor(event.startTime) < slotEnd && minutesFor(event.startTime) + event.durationMinutes > slotStart)
      })
      .map((override) => {
        const court = venue.courts.find((item) => item.id === override.courtId)
        const slot = court?.slots.find((item) => item.slotNumber === override.slotNumber)
        const type: VenueCalendarEventType = override.status === 'MAINTENANCE' ? 'MAINTENANCE' : override.status === 'MATCH_PUBLISHED' ? 'SOCIAL' : override.status === 'COACHING' ? 'COACHING' : 'WALK_IN'
        return {
          id: `override-${override.key}`, courtId: override.courtId, courtName: court?.name ?? 'Sân', type,
          title: override.customerName ? `${titleForType[type]} · ${override.customerName}` : titleForType[type],
          startTime: slot?.timeRange.split(' - ')[0] ?? '06:00', durationMinutes: 90, amount: override.price,
          paymentMethod: override.paymentMethod === 'CASH' || override.paymentMethod === 'VIETQR' ? override.paymentMethod : undefined,
          contactName: override.customerName, contactPhone: override.customerPhone, note: override.maintenanceReason, editable: false,
        }
      })
    return [...bookingEvents, ...socialEvents, ...overrideEvents, ...manualEvents]
  }, [courtBookings, customEvents, matches, selectedDateIso, slotOverrides, venue])

  const slotIsDisabled = (courtId: string, timeRange: string) => {
    if (!venue) return false
    const schedule = courtDisableSchedules[`${venue.id}:${courtId}`]
    return Boolean(schedule && scheduleOverlapsSlot(schedule, selectedDateIso, timeRange))
  }
  const visibleCourts = venue?.courts.filter((court) => court.slots.some((slot) => !slotIsDisabled(court.id, slot.timeRange))) ?? []

  const shiftDate = (days: number) => {
    const current = new Date(`${selectedDateIso}T12:00:00`)
    current.setDate(current.getDate() + days)
    setSelectedDate(current.toLocaleDateString('vi-VN'))
  }
  const makeDraft = (courtId: string, startTime: string, source?: DisplayEvent, draftType: VenueCalendarEventType = 'WALK_IN'): EventDraft => ({
    id: source?.source?.id, type: source?.type ?? draftType, courtId, startTime,
    endTime: timeFor(minutesFor(startTime) + (source?.durationMinutes ?? 90)), durationMinutes: source?.durationMinutes ?? 90, title: source?.title ?? titleForType[draftType],
    amount: source?.amount ? String(source.amount) : '', paymentMethod: source?.paymentMethod ?? 'CASH', paymentConfirmed: source?.paymentConfirmed ?? false,
    contactName: source?.contactName ?? '', contactPhone: source?.contactPhone ?? '', note: source?.note ?? '', checkInCode: source?.checkInCode ?? '', checkedInAt: source?.checkedInAt,
  })
  const overlaps = (courtId: string, startTime: string, durationMinutes: number, exceptDisplayId?: string) => {
    const start = minutesFor(startTime)
    const end = start + durationMinutes
    return calendarEvents.some((event) => event.courtId === courtId && event.id !== exceptDisplayId && start < minutesFor(event.startTime) + event.durationMinutes && end > minutesFor(event.startTime))
  }
  const applySlotBlocking = (event: Pick<VenueCalendarEvent, 'venueId' | 'date' | 'courtId' | 'type' | 'startTime' | 'durationMinutes'>, release = false) => {
    if (!venue) return
    const court = venue.courts.find((item) => item.id === event.courtId)
    if (!court) return
    const start = minutesFor(event.startTime)
    const end = start + event.durationMinutes
    if (event.type === 'AVAILABILITY') return
    const status = event.type === 'MAINTENANCE' ? 'MAINTENANCE' : event.type === 'SOCIAL' ? 'MATCH_PUBLISHED' : event.type === 'COACHING' ? 'COACHING' : 'PRIVATE_BOOKED'
    const affectedSlots = court.slots.filter((slot) => {
      const [from, to] = slot.timeRange.split(' - ').map(minutesFor)
      return start < to && end > from
    })
    upsertSlotOverrides(affectedSlots.map((slot) => ({
      key: `${event.venueId}:${event.date}:${event.courtId}:${slot.slotNumber}`, venueId: event.venueId, date: event.date,
      courtId: event.courtId, slotNumber: slot.slotNumber, status: release ? 'AVAILABLE' : status, price: slot.price, updatedAt: new Date().toISOString(),
    })))
  }
  const scanQrForEvent = (code: string, draft: EventDraft): QrScanResult => {
    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode) return { success: false, message: 'Vui lòng nhập hoặc quét mã QR booking.' }

    const booking = courtBookings.find((item) => item.status === 'CONFIRMED' && item.bookingCode?.toUpperCase() === normalizedCode)
    if (booking) {
      if (booking.venueId !== venue?.id || booking.date !== selectedDateIso || booking.courtId !== draft.courtId) {
        return { success: false, message: 'QR booking không thuộc sân hoặc ngày đang mở.' }
      }
      const checkedInAt = new Date().toISOString()
      return { success: true, message: `Đã xác nhận ${booking.playerName} check-in bằng QR booking.`, code: normalizedCode, checkedInAt }
    }

    const ticket = checkInTickets.find((item) => item.code === normalizedCode)
    if (!ticket) return { success: false, message: 'Không tìm thấy QR booking trong dữ liệu demo.' }
    if (ticket.scenario !== 'VALID') return { success: false, message: 'QR không ở trạng thái hợp lệ để check-in.' }
    if (!confirmTicketCheckIn(normalizedCode)) return { success: false, message: 'Không thể xác nhận QR này.' }
    const holder = ticket.participants.find((participant) => participant.id === ticket.holderId)
    const checkedInAt = new Date().toISOString()
    return { success: true, message: `Đã xác nhận ${holder?.name ?? 'khách'} check-in bằng QR.`, code: normalizedCode, checkedInAt }
  }
  const saveEvent = () => {
    if (!eventDraft || !venue) return
    const disableSchedule = courtDisableSchedules[`${venue.id}:${eventDraft.courtId}`]
    const eventStartAt = `${selectedDateIso}T${eventDraft.startTime}`
    const eventEndAt = `${selectedDateIso}T${timeFor(minutesFor(eventDraft.startTime) + eventDraft.durationMinutes)}`
    if (disableSchedule && eventStartAt < disableSchedule.endAt && eventEndAt > disableSchedule.startAt) return showToast('Sân đang trong thời gian tắt và không thể tạo hoặc chỉnh event ở khung giờ này.', 'error')
    const amount = Number(eventDraft.amount || 0)
    const start = parseTimeInput(eventDraft.startTime)
    const end = parseTimeInput(eventDraft.endTime)
    if (!eventDraft.title.trim()) return showToast('Vui lòng nhập tên event.', 'error')
    if (start === null || start < OPENING_MINUTES || start >= CLOSING_MINUTES) return showToast('Giờ bắt đầu phải nhập theo dạng HH:MM, từ 06:00 đến trước 21:00.', 'error')
    if (end === null || end <= start || end > CLOSING_MINUTES) return showToast('Giờ kết thúc phải nhập theo dạng HH:MM, sau giờ bắt đầu và không vượt quá 21:00.', 'error')
    const durationMinutes = end - start
    if (['WALK_IN', 'PRIVATE'].includes(eventDraft.type) && (!eventDraft.contactName.trim() || !/^0\d{9}$/.test(eventDraft.contactPhone.replace(/\D/g, '')))) return showToast('Nhập họ tên và số điện thoại hợp lệ cho khách.', 'error')
    if (eventDraft.type !== 'MAINTENANCE' && (!Number.isFinite(amount) || (eventDraft.type === 'AVAILABILITY' ? amount <= 0 : amount < 0))) return showToast(eventDraft.type === 'AVAILABILITY' ? 'Giá khoảng đặt phải lớn hơn 0.' : 'Số tiền không hợp lệ.', 'error')
    const source = eventDraft.id ? customEvents.find((event) => event.id === eventDraft.id) : undefined
    if (overlaps(eventDraft.courtId, eventDraft.startTime, durationMinutes, source?.id)) return showToast('Khung giờ này đã có event hoặc booking. Hãy chọn thời điểm khác.', 'error')
    if (source && source.type !== 'AVAILABILITY') applySlotBlocking(source, true)
    const paymentConfirmed = Boolean(source?.paymentConfirmed || eventDraft.paymentConfirmed)
    const next = {
      venueId: venue.id, venueName: venue.name, date: selectedDateIso, courtId: eventDraft.courtId,
      courtName: venue.courts.find((court) => court.id === eventDraft.courtId)?.name ?? 'Sân', type: eventDraft.type,
      title: eventDraft.title.trim(), startTime: eventDraft.startTime, durationMinutes, amount,
      paymentMethod: ['MAINTENANCE', 'AVAILABILITY'].includes(eventDraft.type) ? undefined : eventDraft.paymentMethod,
      paymentConfirmed,
      paymentConfirmedAt: paymentConfirmed ? source?.paymentConfirmedAt ?? new Date().toISOString() : undefined,
      contactName: eventDraft.contactName.trim() || undefined, contactPhone: eventDraft.contactPhone.replace(/\D/g, '') || undefined,
      note: eventDraft.note.trim() || undefined,
      checkInCode: eventDraft.checkInCode.trim() || undefined, checkedInAt: eventDraft.checkedInAt,
    }
    if (source) updateEvent(source.id, next)
    else createEvent(next)
    if (next.type !== 'AVAILABILITY') applySlotBlocking(next)
    setEventDraft(null)
    showToast(source ? 'Đã cập nhật lịch trên lịch sân.' : next.type === 'AVAILABILITY' ? 'Đã tạo khoảng đặt và công khai cho Player.' : 'Đã tạo event và khóa khung giờ liên quan.', 'success')
  }
  const deleteEvent = () => {
    if (!eventDraft?.id) return
    const source = customEvents.find((event) => event.id === eventDraft.id)
    if (!source) return
    if (source.type !== 'AVAILABILITY') applySlotBlocking(source, true)
    removeEvent(source.id)
    setEventDraft(null)
    showToast('Đã xóa event và mở lại các slot liên quan.', 'success')
  }
  const confirmPaymentForEvent = (draft: EventDraft) => {
    if (!draft.id) return
    const source = customEvents.find((event) => event.id === draft.id)
    if (!source || source.paymentConfirmed) return
    updateEvent(source.id, { paymentConfirmed: true, paymentConfirmedAt: new Date().toISOString() })
    showToast('Đã xác nhận thu tiền. Trạng thái này không thể hoàn tác.', 'success')
  }

  if (!venue) return <div className="py-20 text-center">Chưa có dữ liệu cụm sân để hiển thị lịch.</div>
  return <div className="space-y-6 pb-16">
    <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 xl:flex-row xl:items-center">
      <div><div className="mb-1 flex items-center gap-2"><Badge variant="default" withDot pulseDot>SCR_FM_01</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · Lịch vận hành sân</span></div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Lịch sân theo event</h1><p className="mt-1 text-sm text-muted-foreground">Bấm vào event nội bộ để xem hoặc chỉnh sửa. Lịch Player đã thanh toán được khóa để bảo vệ giao dịch.</p></div>
      <div className="flex flex-wrap gap-2"><label className="flex h-12 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold"><MapPin className="h-4 w-4 text-primary" /><select value={venue.id} onChange={(event) => setVenueId(event.target.value)} className="min-w-40 bg-transparent outline-none">{venues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><Button variant="outline" className="h-12 gap-2" disabled={!visibleCourts.length} onClick={() => { const courtId = visibleCourts[0]?.id; if (courtId) setEventDraft(makeDraft(courtId, '06:00', undefined, 'AVAILABILITY')) }}><Plus className="h-4 w-4" />Thêm khoảng đặt</Button><Button className="h-12 gap-2" disabled={!visibleCourts.length} onClick={() => { const courtId = visibleCourts[0]?.id; if (courtId) setEventDraft(makeDraft(courtId, '06:00')) }}><Plus className="h-4 w-4" />Thêm event</Button></div>
    </header>
    <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /><b>{displayDate(selectedDateIso)}</b><span className="text-xs text-muted-foreground">· 06:00–21:00 · bắt đầu theo từng phút</span></div><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => shiftDate(-1)} aria-label="Ngày trước"><ChevronLeft /></Button><input type="date" value={selectedDateIso} onChange={(event) => setSelectedDate(displayDate(event.target.value))} className="h-11 rounded-xl border bg-background px-3 text-sm font-bold" /><Button variant="outline" size="icon" onClick={() => shiftDate(1)} aria-label="Ngày sau"><ChevronRight /></Button></div></div>
      {visibleCourts.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">Tất cả sân trong cụm này đang tắt. Mở lại sân trong Quản lý sân để tiếp tục vận hành.</div> : <div className="mt-4 overflow-x-auto"><div className="min-w-[900px]"><div className="grid border-l border-t border-border" style={{ gridTemplateColumns: `74px repeat(${visibleCourts.length}, minmax(210px, 1fr))` }}><div className="sticky left-0 z-20 border-b border-r bg-card p-3 text-[11px] font-black text-muted-foreground">GIỜ</div>{visibleCourts.map((court) => <div key={court.id} className="border-b border-r bg-muted/35 p-3 text-center"><p className="font-black">{court.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{court.type}</p></div>)}</div><div className="grid" style={{ gridTemplateColumns: `74px repeat(${visibleCourts.length}, minmax(210px, 1fr))` }}><div className="grid border-l" style={{ gridTemplateRows: `repeat(${timeRows.length}, ${ROW_HEIGHT}px)` }}>{timeRows.map((time, index) => <div key={time} className="border-b border-r bg-card px-2 pt-1 text-[10px] font-bold text-muted-foreground">{index % 2 === 0 ? time : ''}</div>)}</div>{visibleCourts.map((court) => { const events = calendarEvents.filter((event) => event.courtId === court.id); return <div key={court.id} className="relative grid border-r" style={{ gridTemplateRows: `repeat(${timeRows.length}, ${ROW_HEIGHT}px)` }}>{timeRows.map((time) => { const timeRange = `${time} - ${timeFor(minutesFor(time) + STEP_MINUTES)}`; const slotDisabled = slotIsDisabled(court.id, timeRange); return <button key={time} type="button" disabled={slotDisabled} onClick={() => setEventDraft(makeDraft(court.id, time))} className={`border-b border-border/70 text-left transition ${slotDisabled ? 'cursor-not-allowed bg-muted/55 text-muted-foreground' : 'bg-background/35 hover:bg-primary/5 focus-visible:bg-primary/10'}`} aria-label={slotDisabled ? `Sân ${court.name} đang tắt lúc ${time}` : `Thêm event tại ${court.name}, ${time}`} />})}{events.map((event) => { const top = ((minutesFor(event.startTime) - OPENING_MINUTES) / STEP_MINUTES) * ROW_HEIGHT; const height = Math.max(ROW_HEIGHT / 2, (event.durationMinutes / STEP_MINUTES) * ROW_HEIGHT - 8); const meta = eventMeta[event.type]; return <button key={event.id} type="button" onClick={() => event.editable ? setEventDraft(makeDraft(court.id, event.startTime, event)) : showToast('Event này phát sinh từ Player/luồng thanh toán nên không thể chỉnh trực tiếp.', 'info')} className={`absolute inset-x-1 z-10 overflow-hidden rounded-lg border p-2 text-left shadow-sm transition ${meta.className} ${event.editable ? 'cursor-pointer hover:brightness-95' : 'cursor-not-allowed opacity-90'}`} style={{ top, height }}><div className="flex items-start gap-1"><span className="line-clamp-1 text-[11px] font-black">{event.title}</span></div><p className="mt-1 text-[10px] font-semibold">{event.startTime}–{timeFor(minutesFor(event.startTime) + event.durationMinutes)}</p>{event.contactName && <p className="mt-1 line-clamp-1 text-[10px]">{event.contactName}{event.contactPhone ? ` · ${event.contactPhone}` : ''}</p>}{event.amount > 0 && <p className="mt-1 text-[10px] font-black">{event.amount.toLocaleString('vi-VN')}đ · {event.paymentMethod === 'CASH' ? 'Tiền mặt' : 'VietQR'}</p>}</button> })}</div> })}</div></div></div>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">{Object.entries(eventMeta).map(([type, meta]) => <span key={type} className="flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${meta.className.split(' ').find((item) => item.startsWith('bg-')) ?? 'bg-muted'}`} />{meta.label}</span>)}</div>
    </section>
    {eventDraft && <EventDialog draft={eventDraft} venue={venue} onChange={setEventDraft} onClose={() => setEventDraft(null)} onSave={saveEvent} onDelete={eventDraft.id ? deleteEvent : undefined} onScanQr={(code) => scanQrForEvent(code, eventDraft)} onConfirmPayment={() => confirmPaymentForEvent(eventDraft)} />}
  </div>
}

function EventDialog({ draft, venue, onChange, onClose, onSave, onDelete, onScanQr, onConfirmPayment }: { draft: EventDraft; venue: PlayerVenue; onChange: (draft: EventDraft) => void; onClose: () => void; onSave: () => void; onDelete?: () => void; onScanQr: (code: string) => QrScanResult; onConfirmPayment: () => void }) {
  const end = parseTimeInput(draft.endTime)
  const start = parseTimeInput(draft.startTime)
  const endLabel = end === null ? '—' : timeFor(end)
  const needsContact = draft.type === 'WALK_IN' || draft.type === 'PRIVATE'
  const [isEditing, setIsEditing] = useState(!draft.id)
  const [qrCode, setQrCode] = useState(draft.checkInCode)
  const [qrMessage, setQrMessage] = useState('')
  const [qrError, setQrError] = useState(false)
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false)
  const handleQrScan = () => {
    const result = onScanQr(qrCode)
    setQrMessage(result.message)
    setQrError(!result.success)
    if (result.success && result.code && result.checkedInAt) onChange({ ...draft, checkInCode: result.code, checkedInAt: result.checkedInAt })
  }
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="event-dialog-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border bg-card p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Lịch sân · Event</p><h2 id="event-dialog-title" className="mt-1 text-xl font-black">{draft.id ? (isEditing ? 'Chỉnh sửa event' : 'Chi tiết event') : 'Tạo event mới'}</h2><p className="mt-1 text-xs font-semibold text-muted-foreground">{isEditing ? 'Đang ở chế độ chỉnh sửa' : 'Chế độ chỉ xem'}</p></div><div className="flex items-center gap-2">{draft.id && !isEditing && <Button type="button" variant="outline" className="gap-2" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4" />Chỉnh sửa</Button>}<Button variant="ghost" size="icon" onClick={onClose}>×</Button></div></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Loại event"><select disabled={!isEditing} value={draft.type} onChange={(event) => onChange({ ...draft, type: event.target.value as VenueCalendarEventType, title: titleForType[event.target.value as VenueCalendarEventType] })} className="h-12 w-full rounded-xl border bg-background px-3 text-sm font-bold">{Object.entries(eventMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></Field><Field label="Sân"><select disabled={!isEditing} value={draft.courtId} onChange={(event) => onChange({ ...draft, courtId: event.target.value })} className="h-12 w-full rounded-xl border bg-background px-3 text-sm font-bold">{venue.courts.map((court) => <option key={court.id} value={court.id}>{court.name} · {court.type}</option>)}</select></Field><Field label="Bắt đầu"><Input disabled={!isEditing} type="text" inputMode="numeric" maxLength={5} value={draft.startTime} onChange={(event) => { const startTime = event.target.value; const nextStart = parseTimeInput(startTime); if (nextStart === null) return onChange({ ...draft, startTime }); const currentEnd = parseTimeInput(draft.endTime); const endTime = currentEnd !== null && currentEnd > nextStart ? draft.endTime : timeFor(Math.min(CLOSING_MINUTES, nextStart + 1)); onChange({ ...draft, startTime, endTime, durationMinutes: parseTimeInput(endTime)! - nextStart }) }} className="h-12 font-bold" placeholder="HH:MM" /><span className="mt-1 block text-[11px] text-muted-foreground">Tự nhập giờ và phút, ví dụ 06:15</span></Field><Field label="Kết thúc"><Input disabled={!isEditing} type="text" inputMode="numeric" maxLength={5} value={draft.endTime} onChange={(event) => { const endTime = event.target.value; const nextEnd = parseTimeInput(endTime); onChange({ ...draft, endTime, durationMinutes: start !== null && nextEnd !== null ? nextEnd - start : Number.NaN }) }} className="h-12 font-bold" placeholder="HH:MM" /><span className="mt-1 block text-[11px] text-muted-foreground">Tự nhập giờ và phút, không vượt quá 21:00</span></Field></div>
    <Field label="Tên event" className="mt-4"><Input disabled={!isEditing} value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} className="h-12" placeholder="Ví dụ: Kèo giao lưu người mới" /></Field>
    {!['MAINTENANCE', 'AVAILABILITY'].includes(draft.type) && <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Khoản thu (VNĐ)"><Input disabled={!isEditing} type="number" min="0" step="10000" value={draft.amount} onChange={(event) => onChange({ ...draft, amount: event.target.value })} className="h-12" placeholder="0" /></Field><Field label="Phương thức thu"><div className="grid grid-cols-2 gap-2"><button disabled={!isEditing} type="button" onClick={() => onChange({ ...draft, paymentMethod: 'VIETQR' })} className={`h-12 rounded-xl border text-sm font-bold ${draft.paymentMethod === 'VIETQR' ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}>VietQR</button><button disabled={!isEditing} type="button" onClick={() => onChange({ ...draft, paymentMethod: 'CASH' })} className={`h-12 rounded-xl border text-sm font-bold ${draft.paymentMethod === 'CASH' ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}>Tiền mặt</button></div></Field></div>}
    {draft.type === 'AVAILABILITY' && <Field label="Giá khoảng đặt (VNĐ)" className="mt-4"><Input disabled={!isEditing} type="number" min="1" step="1000" value={draft.amount} onChange={(event) => onChange({ ...draft, amount: event.target.value })} className="h-12" placeholder="Ví dụ: 100000" /></Field>}
    {!['MAINTENANCE', 'AVAILABILITY'].includes(draft.type) && <section className={`mt-4 rounded-2xl border p-4 ${draft.paymentConfirmed ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-amber-400/40 bg-amber-500/10'}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trạng thái thu tiền</p><p className="mt-1 text-sm font-black">{draft.paymentConfirmed ? 'Đã xác nhận đã thu tiền' : 'Chưa xác nhận đã thu tiền'}</p><p className="mt-1 text-xs text-muted-foreground">{draft.amount ? `${Number(draft.amount || 0).toLocaleString('vi-VN')}đ · ${draft.paymentMethod === 'CASH' ? 'Tiền mặt' : 'VietQR'}` : 'Chưa nhập khoản thu'}</p></div>{!draft.paymentConfirmed && <Button type="button" onClick={() => setPaymentConfirmOpen(true)} className="shrink-0 gap-2">Xác nhận đã thu tiền</Button>}</div>{paymentConfirmOpen && !draft.paymentConfirmed && <div className="mt-4 rounded-xl border border-primary/20 bg-card p-3"><p className="text-sm font-bold">Bạn chắc chắn đã thu đủ khoản tiền này?</p><div className="mt-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setPaymentConfirmOpen(false)}>Hủy</Button><Button type="button" onClick={() => { onChange({ ...draft, paymentConfirmed: true }); onConfirmPayment(); setPaymentConfirmOpen(false) }}><CheckCircle2 className="h-4 w-4" />Xác nhận</Button></div></div>}</section>}
    {needsContact && <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Tên khách"><Input disabled={!isEditing} value={draft.contactName} onChange={(event) => onChange({ ...draft, contactName: event.target.value })} className="h-12" placeholder="Nguyễn Văn A" /></Field><Field label="Số điện thoại"><Input disabled={!isEditing} inputMode="numeric" value={draft.contactPhone} onChange={(event) => onChange({ ...draft, contactPhone: event.target.value })} className="h-12" placeholder="0901234567" /></Field></div>}
    {draft.type !== 'MAINTENANCE' && draft.type !== 'AVAILABILITY' && <section className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><QrCode className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-primary">QR check-in</p><h3 className="mt-1 font-black">Quét QR booking của khách</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{isEditing ? 'Camera là mô phỏng trong prototype. Nhập mã QR booking rồi xác nhận ngay trong chi tiết sân.' : 'Thông tin QR chỉ được xem ở chế độ chi tiết. Bấm Chỉnh sửa nếu cần thao tác.'}</p></div></div>{isEditing ? <><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><Input value={qrCode} onChange={(event) => setQrCode(event.target.value.toUpperCase())} className="h-12 font-mono font-bold tracking-wider" placeholder="Ví dụ: PKB-1310-8849" aria-label="Mã QR booking" /><Button type="button" onClick={handleQrScan} className="h-12 gap-2"><Camera className="h-4 w-4" />Quét QR</Button></div>{qrMessage && <p className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${qrError ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>{qrError ? <QrCode className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{qrMessage}</p>}</> : <div className="mt-4 rounded-xl border bg-card/60 p-3 text-sm text-muted-foreground">{draft.checkInCode ? `Mã QR: ${draft.checkInCode}` : 'Chưa có thông tin check-in.'}</div>}{draft.checkedInAt && <p className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Đã check-in · {draft.checkInCode} · {new Date(draft.checkedInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>}</section>}
    <Field label={draft.type === 'MAINTENANCE' ? 'Lý do bảo trì' : 'Ghi chú'} className="mt-4"><textarea disabled={!isEditing} value={draft.note} onChange={(event) => onChange({ ...draft, note: event.target.value })} rows={3} className="w-full rounded-xl border bg-background p-3 text-sm" placeholder={draft.type === 'MAINTENANCE' ? 'Ví dụ: Bảo dưỡng mặt sân và hệ thống đèn' : 'Thông tin bổ sung (không bắt buộc)'} /></Field>
    <p className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">Event sẽ chạy từ <b>{draft.startTime}</b> đến <b>{endLabel}</b>. Các slot Player bị chồng giờ sẽ tự khóa để tránh nhận booking mới.</p>
    <footer className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><div>{onDelete && isEditing && <Button variant="destructive" onClick={onDelete}><Trash2 />Xóa event</Button>}</div><div className="flex gap-2"><Button variant="outline" onClick={onClose}>Đóng</Button>{isEditing && <Button onClick={onSave}><UsersRound />Lưu event</Button>}</div></footer>
  </section></div>
}
function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold">{label}</span>{children}</label>
}
export default CourtCalendarPage
