import { useState } from 'react'
import { Building2, CalendarClock, CheckCircle2, CircleDot, Power, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { currentLocalDateTimeInput, scheduleIsActiveAt, type CourtDisableSchedule } from '@/lib/courtDisableSchedule'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

type PendingDisable = CourtDisableSchedule & { courtId: string; courtName: string }
type CourtEventRange = { label: string; startAt: string; endAt: string }

const minutesFor = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

const timeFor = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const formatNoticeDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}/${month}/${year}` : date
}
const formatDateTime = (value: string) => `${formatNoticeDate(value.slice(0, 10))} · ${value.slice(11, 16)}`
const toLocalDateTimeInput = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hour = String(value.getHours()).padStart(2, '0')
  const minute = String(value.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}
const defaultDisableStart = () => {
  const value = new Date()
  value.setDate(value.getDate() + 1)
  value.setHours(6, 0, 0, 0)
  return toLocalDateTimeInput(value)
}
const defaultDisableEnd = (startAt: string) => {
  const value = new Date(`${startAt}:00`)
  value.setHours(value.getHours() + 24)
  return toLocalDateTimeInput(value)
}

export function OwnerCourtsPage() {
  const venues = usePlayerStore((state) => state.venues)
  const matches = usePlayerStore((state) => state.matches)
  const courtBookings = useCrossRoleStore((state) => state.courtBookings)
  const slotOverrides = useCrossRoleStore((state) => state.slotOverrides)
  const customEvents = useCrossRoleStore((state) => state.venueCalendarEvents)
  const courtDisableSchedules = useCrossRoleStore((state) => state.courtDisableSchedules)
  const setCourtDisableSchedule = useCrossRoleStore((state) => state.setCourtDisableSchedule)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id ?? '')
  const [pendingDisable, setPendingDisable] = useState<PendingDisable | null>(null)

  const venue = venues.find((item) => item.id === selectedVenueId) ?? venues[0]
  const now = currentLocalDateTimeInput()
  const activeCourts = venue?.courts.filter((court) => {
    const schedule = courtDisableSchedules[`${venue.id}:${court.id}`]
    return !schedule || !scheduleIsActiveAt(schedule, now)
  }).length ?? 0

  const getActiveCourtEvents = (courtId: string, courtName: string): CourtEventRange[] => {
    if (!venue) return []
    const manualEvents = customEvents.filter((event) => event.venueId === venue.id && event.courtId === courtId)
    const ranges: CourtEventRange[] = [
      ...courtBookings
        .filter((booking) => booking.status === 'CONFIRMED' && booking.venueId === venue.id && booking.courtId === courtId)
        .map((booking) => {
          const [startTime, endTime] = booking.timeRange.split(' - ')
          return { label: 'Player đặt sân', startAt: `${booking.date}T${startTime}`, endAt: `${booking.date}T${endTime}` }
        }),
      ...slotOverrides
        .filter((override) => override.venueId === venue.id && override.courtId === courtId && override.status !== 'AVAILABLE')
        .filter((override) => {
          const slot = venue.courts.find((court) => court.id === courtId)?.slots.find((item) => item.slotNumber === override.slotNumber)
          const [slotStart, slotEnd] = (slot?.timeRange ?? '').split(' - ').map(minutesFor)
          return !manualEvents.some((event) => {
            if (event.date !== override.date) return false
            const eventStart = minutesFor(event.startTime)
            return eventStart < slotEnd && eventStart + event.durationMinutes > slotStart
          })
        })
        .map((override) => {
          const slot = venue.courts.find((court) => court.id === courtId)?.slots.find((item) => item.slotNumber === override.slotNumber)
          const [startTime, endTime] = (slot?.timeRange ?? '').split(' - ')
          const label = override.status === 'MAINTENANCE'
            ? 'Bảo trì'
            : override.status === 'COACHING'
              ? 'Lớp Coach'
              : override.status === 'MATCH_PUBLISHED'
                ? 'Kèo Social'
                : 'Khách vãng lai'
          return { label, startAt: `${override.date}T${startTime}`, endAt: `${override.date}T${endTime}` }
        }),
      ...manualEvents.map((event) => ({
        label: event.title || 'Event nội bộ',
        startAt: `${event.date}T${event.startTime}`,
        endAt: `${event.date}T${timeFor(minutesFor(event.startTime) + event.durationMinutes)}`,
      })),
      ...matches
        .filter((match) => match.status !== 'CANCELLED' && match.venueId === venue.id && (match.courtId ? match.courtId === courtId : match.courtName.startsWith(courtName)))
        .map((match) => {
          const [startTime, endTime] = match.timeRange.split(' - ')
          return { label: match.title || 'Kèo Social', startAt: `${match.date}T${startTime}`, endAt: `${match.date}T${endTime}` }
        }),
    ]
    return ranges
      .filter((event) => event.startAt && event.endAt)
      .filter((event, index, all) => all.findIndex((item) => item.label === event.label && item.startAt === event.startAt && item.endAt === event.endAt) === index)
      .sort((left, right) => left.startAt.localeCompare(right.startAt))
  }

  const notifyConflictingEvents = (courtId: string, courtName: string, schedule: CourtDisableSchedule) => {
    const conflicts = getActiveCourtEvents(courtId, courtName).filter((event) => event.startAt < schedule.endAt && event.endAt > schedule.startAt)
    if (!conflicts.length) return false
    const visibleEvents = conflicts.slice(0, 3).map((event) => `${event.label} · ${formatDateTime(event.startAt)}–${event.endAt.slice(11, 16)}`)
    const remaining = conflicts.length > visibleEvents.length ? ` (+${conflicts.length - visibleEvents.length} event khác)` : ''
    showToast(`Không thể lên lịch tắt ${courtName}. ${visibleEvents.join(' | ')}${remaining}`, 'error')
    return true
  }

  const openDisableDialog = (courtId: string, courtName: string, schedule?: CourtDisableSchedule) => {
    const startAt = schedule?.startAt ?? defaultDisableStart()
    setPendingDisable({ courtId, courtName, startAt, endAt: schedule?.endAt ?? defaultDisableEnd(startAt) })
  }

  const handleCourtToggle = (courtId: string, courtName: string) => {
    if (!venue) return
    const key = `${venue.id}:${courtId}`
    const schedule = courtDisableSchedules[key]
    if (!schedule) {
      openDisableDialog(courtId, courtName)
      return
    }
    if (now < schedule.startAt) {
      setCourtDisableSchedule(venue.id, courtId, null)
      showToast(`Đã hủy lịch tắt ${courtName} vào ${formatDateTime(schedule.startAt)}.`, 'success')
      return
    }
    if (now < schedule.endAt) {
      setCourtDisableSchedule(venue.id, courtId, null)
      showToast(`${courtName} đã được mở lại ngay.`, 'success')
      return
    }
    openDisableDialog(courtId, courtName)
  }

  const confirmDisable = () => {
    if (!venue || !pendingDisable) return
    if (!pendingDisable.startAt || !pendingDisable.endAt || pendingDisable.startAt >= pendingDisable.endAt) {
      showToast('Thời điểm mở lại phải sau thời điểm tắt.', 'error')
      return
    }
    if (pendingDisable.startAt < currentLocalDateTimeInput()) {
      showToast('Thời điểm tắt không được nằm trong quá khứ.', 'error')
      return
    }
    if (notifyConflictingEvents(pendingDisable.courtId, pendingDisable.courtName, pendingDisable)) return
    setCourtDisableSchedule(venue.id, pendingDisable.courtId, { startAt: pendingDisable.startAt, endAt: pendingDisable.endAt })
    showToast(`${pendingDisable.courtName} sẽ tắt từ ${formatDateTime(pendingDisable.startAt)} đến ${formatDateTime(pendingDisable.endAt)}.`, 'info')
    setPendingDisable(null)
  }

  if (!venue) return <div className="py-20 text-center">Chưa có dữ liệu cụm sân để hiển thị.</div>

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 xl:flex-row xl:items-start">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="default">SCR_FM_03</Badge>
            <span className="text-xs font-semibold text-muted-foreground">Field Manager • Court Inventory</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Quản lý sân con</h1>
          <p className="mt-1 text-sm text-muted-foreground">Chọn cụm sân để theo dõi sân trực thuộc và lên lịch tắt hoặc mở lại sân.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-12 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold shadow-sm">
            <Building2 className="h-4 w-4 text-primary" />
            <select value={venue.id} onChange={(event) => setSelectedVenueId(event.target.value)} className="max-w-[250px] bg-transparent outline-none" aria-label="Chọn cụm sân">
              {venues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="rounded-xl border bg-card px-4 py-3 text-sm shadow-sm">
            <p className="text-xs text-muted-foreground">Sân đang hoạt động</p>
            <p className="mt-1 font-extrabold text-primary">{activeCourts} / {venue.courts.length} sân</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card px-4 py-3 text-sm shadow-sm">
        <p className="font-bold">{venue.name}</p>
        <p className="mt-1 text-muted-foreground">{venue.address}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {venue.courts.map((court, index) => {
          const schedule = courtDisableSchedules[`${venue.id}:${court.id}`]
          const isCurrentlyDisabled = Boolean(schedule && scheduleIsActiveAt(schedule, now))
          const hasFutureSchedule = Boolean(schedule && now < schedule.startAt)
          const isScheduleExpired = Boolean(schedule && now >= schedule.endAt)
          const availableSlots = isCurrentlyDisabled ? 0 : court.slots.filter((slot) => slot.status === 'AVAILABLE').length
          const bookedSlots = court.slots.filter((slot) => slot.status !== 'AVAILABLE' && slot.status !== 'MAINTENANCE').length
          const statusLabel = isCurrentlyDisabled ? 'Đang tắt' : hasFutureSchedule ? 'Đã lên lịch tắt' : 'Đang hoạt động'

          return (
            <article key={court.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
                  <div><p className="font-bold">{court.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{court.type}</p></div>
                </div>
                <Badge variant={isCurrentlyDisabled || hasFutureSchedule ? 'warning' : 'success'}>{statusLabel}</Badge>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x rounded-xl border bg-muted/30 text-center">
                <div className="px-2 py-3"><p className="text-[10px] text-muted-foreground">Tổng slot</p><p className="mt-1 font-bold">{court.slots.length}</p></div>
                <div className="px-2 py-3"><p className="text-[10px] text-muted-foreground">Đã khai thác</p><p className="mt-1 font-bold text-primary">{bookedSlots}</p></div>
                <div className="px-2 py-3"><p className="text-[10px] text-muted-foreground">Còn trống</p><p className="mt-1 font-bold text-emerald-600">{availableSlots}</p></div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs"><span className="text-muted-foreground">Mã sân</span><span className="font-semibold">COURT-{String(index + 1).padStart(2, '0')}</span></div>
              {schedule && !isScheduleExpired && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><CalendarClock className="h-4 w-4 text-primary" />Tắt {formatDateTime(schedule.startAt)} · Mở {formatDateTime(schedule.endAt)}</p>}

              {hasFutureSchedule ? <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" className="w-full" onClick={() => openDisableDialog(court.id, court.name, schedule)}><CalendarClock />Thay đổi lịch</Button><Button variant="outline" className="w-full" onClick={() => handleCourtToggle(court.id, court.name)}><X />Hủy lịch tắt</Button></div> : <Button variant={isCurrentlyDisabled ? 'default' : 'outline'} className="mt-4 w-full" onClick={() => handleCourtToggle(court.id, court.name)}>{isCurrentlyDisabled ? <CheckCircle2 /> : <Power />}{isCurrentlyDisabled ? 'Mở lại sân' : 'Tắt sân'}</Button>}
            </article>
          )
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm"><CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p className="text-muted-foreground">Lịch tắt chỉ áp dụng trong khoảng thời gian đã chọn. Sân sẽ ẩn khỏi Lịch sân và giao diện Player trong khoảng đó; event nằm trong khoảng tắt sẽ chặn việc lưu lịch.</p></div>

      {pendingDisable && <div className="fixed inset-0 z-[90] grid place-items-center bg-foreground/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="disable-court-title"><section className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-700"><Power className="h-5 w-5" /></span><div><h2 id="disable-court-title" className="text-lg font-black">Lên lịch tắt {pendingDisable.courtName}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Sân sẽ tắt từ thời điểm đầu đến thời điểm mở lại. Hệ thống sẽ kiểm tra event trong khoảng thời gian này trước khi lưu.</p></div></div><div className="mt-5 grid gap-4"><label className="block"><span className="mb-1.5 block text-xs font-bold">Thời điểm tắt</span><input type="datetime-local" value={pendingDisable.startAt} onChange={(event) => setPendingDisable({ ...pendingDisable, startAt: event.target.value })} className="h-12 w-full rounded-xl border bg-background px-3 text-sm font-bold" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold">Thời điểm mở lại</span><input type="datetime-local" value={pendingDisable.endAt} onChange={(event) => setPendingDisable({ ...pendingDisable, endAt: event.target.value })} className="h-12 w-full rounded-xl border bg-background px-3 text-sm font-bold" /></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setPendingDisable(null)}>Hủy</Button><Button type="button" onClick={confirmDisable}>Xác nhận tắt</Button></div></section></div>}
    </div>
  )
}
