import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MapPin,
  Plus,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { useCoachBookingStore } from '@/store/useCoachBookingStore'
import { COURT_SLOT_TIMES } from '@/lib/courtSchedule'

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(value)

const localDateKey = (value: Date) => [
  value.getFullYear(),
  String(value.getMonth() + 1).padStart(2, '0'),
  String(value.getDate()).padStart(2, '0'),
].join('-')

const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase('vi-VN') + value.slice(1)

const buildCalendarDays = () => {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Array.from({ length: 35 }, (_, offset) => {
    const value = new Date(today)
    value.setDate(today.getDate() + offset)
    return {
      dateKey: localDateKey(value),
      date: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value),
      longDate: new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(value),
      label: capitalize(new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(value)),
      today: offset === 0,
    }
  })
}

const slots = COURT_SLOT_TIMES.map((slot) => ({ number: slot.slotNumber, time: slot.timeRange }))

export function CoachDashboardPage() {
  const navigate = useNavigate()
  const { coachAccount, coachCourses, coachWalletSummary, coachAffiliations } = useFitlyoStore()
  const coachBookings = useCoachBookingStore((state) => state.bookings)
  const refreshExpirations = useCoachBookingStore((state) => state.refreshExpirations)
  const calendarDays = useMemo(() => buildCalendarDays(), [])
  const [selectedDateKey, setSelectedDateKey] = useState(calendarDays[0].dateKey)
  const selectedDayIndex = Math.max(0, calendarDays.findIndex((day) => day.dateKey === selectedDateKey))
  const selectedDay = calendarDays[selectedDayIndex]

  useEffect(() => {
    refreshExpirations()
  }, [refreshExpirations])

  const ownCourses = useMemo(
    () => coachCourses.filter((course) => course.coachId === coachAccount.id),
    [coachAccount.id, coachCourses],
  )
  const isDungDemoAccount = coachAccount.id === 'coach_dung'
  const studentCount = new Set(ownCourses.flatMap((course) => course.students.map((student) => student.id))).size
  const confirmedSessionCount = coachBookings
    .filter((booking) => booking.coachId === coachAccount.id && booking.status === 'CONFIRMED')
    .flatMap((booking) => booking.sessions)
    .filter((session) => session.status === 'SCHEDULED').length

  const getScheduleItem = (slotNumber: number) => {
    const playerBooking = coachBookings.find((booking) => (
      booking.coachId === coachAccount.id
      && ['PENDING_COACH', 'AWAITING_PAYMENT', 'CONFIRMED'].includes(booking.status)
      && (
        (booking.status === 'PENDING_COACH'
          && booking.firstDate === selectedDateKey
          && booking.preferredSlotNumber === slotNumber)
        || booking.sessions.some((session) => (
          session.status === 'SCHEDULED'
          && session.date === selectedDateKey
          && session.slotNumber === slotNumber
        ))
      )
    ))
    if (playerBooking) {
      return {
        kind: 'BOOKING' as const,
        id: playerBooking.id,
        bookingId: playerBooking.id,
        title: playerBooking.type === 'COURSE' ? 'Khóa 8 buổi' : 'PT 1-1',
        playerName: playerBooking.playerName,
        playerPhone: playerBooking.playerPhone,
        status: playerBooking.status,
        venue: playerBooking.venueName,
        courtName: playerBooking.courtName,
      }
    }
    if (!isDungDemoAccount) return undefined
    const course = ownCourses.find((item) => (
      item.status !== 'COMPLETED'
      && item.slotNumber === slotNumber
      && item.scheduleDays?.includes(selectedDay.label)
    ))
    return course ? { ...course, kind: 'COURSE' as const } : undefined
  }

  const moveSelectedDay = (offset: number) => {
    const nextDay = calendarDays[selectedDayIndex + offset]
    if (nextDay) setSelectedDateKey(nextDay.dateKey)
  }

  return (
    <div className="space-y-6">
      <section className="brand-gradient overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <img src={coachAccount.avatarUrl} alt={coachAccount.name} className="h-20 w-20 rounded-2xl border-2 border-white/60 object-cover shadow-lg" />
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="border-white/25 bg-white/15 text-white"><ShieldCheck className="h-3.5 w-3.5" /> Coach đã xác thực</Badge>
                <Badge className="border-amber-300/40 bg-amber-300/15 text-amber-100">{coachAccount.certificateTitle}</Badge>
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Xin chào, {coachAccount.name.replace('HLV ', '')}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/75">
                <span className="font-bold text-white">DUPR {coachAccount.duprRating}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> {coachAccount.rating} ({coachAccount.reviewCount} đánh giá)</span>
                <span>•</span><span>{coachAccount.experienceYears} năm kinh nghiệm</span>
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/coach/courses?create=1')} className="h-11 bg-secondary text-secondary-foreground shadow hover:bg-secondary/90">
            <Plus className="h-4 w-4" /> Tạo lớp dạy mới
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Buổi học đã xác nhận', value: `${confirmedSessionCount} buổi`, note: 'Đồng bộ từ lịch Player đã thanh toán', icon: CalendarDays, color: 'text-primary bg-secondary/55 dark:bg-secondary/15' },
          { label: 'Học viên đang học', value: `${isDungDemoAccount ? studentCount + 17 : studentCount} học viên`, note: `${ownCourses.length} khóa đang quản lý`, icon: Users, color: 'text-violet-700 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300' },
          { label: 'Ký quỹ đang giữ', value: formatCurrency(coachWalletSummary.escrowBalance), note: 'Giải ngân theo tiến độ', icon: CircleDollarSign, color: 'text-teal-700 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-300' },
          { label: 'Cụm sân đã liên kết', value: `${coachAffiliations.filter((item) => item.coachId === coachAccount.id && item.status === 'ACTIVE').length} đối tác`, note: `${coachAffiliations.filter((item) => item.coachId === coachAccount.id && item.status === 'PENDING').length} yêu cầu đang chờ`, icon: MapPin, color: 'text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="brand-card rounded-2xl p-4">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}><Icon className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-xl font-black text-foreground">{item.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{item.note}</p>
            </div>
          )
        })}
      </section>

      <section className="brand-card rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Lịch dạy theo ngày</p>
            <h2 className="mt-1 text-xl font-black">{capitalize(selectedDay.longDate)}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Yêu cầu từ Player được đồng bộ theo đúng ngày và slot đã chọn.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => moveSelectedDay(-1)} disabled={selectedDayIndex === 0} aria-label="Ngày trước"><ChevronLeft /></Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDateKey(calendarDays[0].dateKey)}>Hôm nay</Button>
            <Button variant="outline" size="icon" onClick={() => moveSelectedDay(1)} disabled={selectedDayIndex === calendarDays.length - 1} aria-label="Ngày sau"><ChevronRight /></Button>
          </div>
        </div>

        <div className="border-b border-border p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {calendarDays.map((day) => (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`min-w-[124px] rounded-xl px-3 py-2 text-left transition ${selectedDateKey === day.dateKey ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-secondary/45 hover:text-foreground'}`}
              >
                <span className="block text-[10px] font-semibold uppercase">{day.today ? 'Hôm nay' : day.label}</span>
                <span className="mt-0.5 block text-sm font-black">{day.date}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 p-4 sm:p-5">
          {slots.map((slot) => {
            const scheduleItem = getScheduleItem(slot.number)
            const isGolden = slot.number === 5
            return (
              <div key={slot.number} className="grid gap-3 rounded-2xl border border-border p-3 sm:grid-cols-[160px_1fr] sm:items-center">
                <div className="flex items-center justify-between sm:block">
                  <p className="text-xs font-black text-foreground">Slot {slot.number}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="h-3 w-3" /> {slot.time}</p>
                  {isGolden && <Badge className="mt-1 border-amber-300/60 bg-amber-500/10 text-amber-700 dark:text-amber-300">Giờ vàng</Badge>}
                </div>
                {scheduleItem ? (
                  <button
                    type="button"
                    onClick={() => navigate(scheduleItem.kind === 'BOOKING' ? `/coach/bookings?booking=${scheduleItem.bookingId}` : `/coach/attendance?course=${scheduleItem.id}`)}
                    className={`group flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${isGolden ? 'border-amber-300/60 bg-amber-500/10 hover:border-amber-400' : 'border-primary/15 bg-secondary/30 hover:border-primary/35 dark:bg-secondary/10'}`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-foreground">
                          {scheduleItem.kind === 'BOOKING' ? `${scheduleItem.title} · ${scheduleItem.playerName}` : scheduleItem.title}
                        </p>
                        {scheduleItem.kind === 'BOOKING' && scheduleItem.status === 'PENDING_COACH' && <Badge className="border-amber-300/60 bg-amber-500/10 text-amber-700 dark:text-amber-300">Chờ Coach duyệt</Badge>}
                        {scheduleItem.kind === 'BOOKING' && scheduleItem.status === 'AWAITING_PAYMENT' && <Badge className="border-sky-300/60 bg-sky-500/10 text-sky-700 dark:text-sky-300">Chờ Player thanh toán</Badge>}
                        {scheduleItem.kind === 'BOOKING' && scheduleItem.status === 'CONFIRMED' && <Badge variant="success">Đã xác nhận</Badge>}
                      </div>
                      {scheduleItem.kind === 'BOOKING' ? (
                        <>
                          <p className="mt-1 text-xs font-semibold text-foreground">{scheduleItem.playerName} · {scheduleItem.playerPhone || 'Chưa có số điện thoại'}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{scheduleItem.venue} · {scheduleItem.courtName}</p>
                        </>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">{scheduleItem.venue} · {scheduleItem.currentStudents}/{scheduleItem.maxStudents} học viên</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button type="button" onClick={() => navigate('/coach/courses?create=1')} className="rounded-xl border border-dashed border-border p-3 text-left text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:bg-secondary/30 hover:text-foreground">
                    Trống · Bấm để mở lớp hoặc nhận lịch PT 1-1
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-primary/15 bg-secondary/35 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2.5 text-primary-foreground"><BadgeDollarSign className="h-5 w-5" /></div>
          <div><p className="font-black text-foreground">Đối soát tiếp theo: {calendarDays[7].date}</p><p className="text-xs text-muted-foreground">Dự kiến giải ngân {formatCurrency(coachWalletSummary.pendingPayout)} sau khi hoàn tất buổi học.</p></div>
        </div>
        <Button onClick={() => navigate('/coach/wallet')}>Xem thu nhập <ArrowRight /></Button>
      </section>
    </div>
  )
}
