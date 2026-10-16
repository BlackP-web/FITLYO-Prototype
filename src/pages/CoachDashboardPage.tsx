import { useMemo, useState } from 'react'
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

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(value)

const weekDays = [
  { label: 'Thứ Hai', date: '12/10', dateKey: '2026-10-12' },
  { label: 'Thứ Ba', date: '13/10', dateKey: '2026-10-13' },
  { label: 'Thứ Tư', date: '14/10', dateKey: '2026-10-14', today: true },
  { label: 'Thứ Năm', date: '15/10', dateKey: '2026-10-15' },
  { label: 'Thứ Sáu', date: '16/10', dateKey: '2026-10-16' },
  { label: 'Thứ Bảy', date: '17/10', dateKey: '2026-10-17' },
  { label: 'Chủ Nhật', date: '18/10', dateKey: '2026-10-18' },
]

const slots = [
  { number: 1, time: '06:00 - 07:30' },
  { number: 2, time: '07:30 - 09:00' },
  { number: 3, time: '09:00 - 10:30' },
  { number: 4, time: '15:30 - 17:00' },
  { number: 5, time: '18:30 - 20:00' },
  { number: 6, time: '20:00 - 21:30' },
]

export function CoachDashboardPage() {
  const navigate = useNavigate()
  const { coachAccount, coachCourses, coachWalletSummary, coachAffiliations, showToast } = useFitlyoStore()
  const coachBookings = useCoachBookingStore((state) => state.bookings)
  const [selectedDay, setSelectedDay] = useState(2)

  const ownCourses = useMemo(
    () => coachCourses.filter((course) => course.coachId === coachAccount.id),
    [coachAccount.id, coachCourses],
  )
  const studentCount = new Set(ownCourses.flatMap((course) => course.students.map((student) => student.id))).size

  const getScheduleItem = (slotNumber: number) => {
    const playerBooking = coachBookings.find((booking) => (
      booking.coachId === coachAccount.id
      && booking.status === 'CONFIRMED'
      && booking.sessions.some((session) => (
        session.date === weekDays[selectedDay].dateKey && session.slotNumber === slotNumber
      ))
    ))
    if (playerBooking) {
      return {
        id: playerBooking.id,
        bookingId: playerBooking.id,
        title: `${playerBooking.type === 'COURSE' ? 'Khóa 8 buổi' : 'PT 1-1'} · ${playerBooking.playerName}`,
        venue: playerBooking.venueName,
        currentStudents: 1,
        maxStudents: playerBooking.type === 'COURSE' ? 4 : 1,
      }
    }
    if (selectedDay === 2 && slotNumber === 2) return ownCourses.find((course) => course.id === 'COURSE-DUNG-02')
    if (selectedDay === 2 && slotNumber === 4) return ownCourses.find((course) => course.id === 'COURSE-DUNG-03')
    if (selectedDay === 2 && slotNumber === 5) return ownCourses.find((course) => course.id === 'COURSE-DUNG-01')
    if (selectedDay === 3 && slotNumber === 1) return { ...ownCourses[2], title: 'Lớp Cơ Bản Newbie 2.0', venue: 'D-Pickleball Thảo Điền' }
    if (selectedDay === 3 && slotNumber === 4) return ownCourses.find((course) => course.id === 'COURSE-DUNG-03')
    if (selectedDay === 3 && slotNumber === 5) return { ...ownCourses[1], title: 'PT VIP - Trần Bảo' }
    if (selectedDay === 4 && slotNumber === 5) return ownCourses.find((course) => course.id === 'COURSE-DUNG-01')
    return undefined
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
          { label: 'Buổi dạy tháng 10', value: '18 buổi', note: '+3 so với tháng trước', icon: CalendarDays, color: 'text-primary bg-secondary/55 dark:bg-secondary/15' },
          { label: 'Học viên đang học', value: `${studentCount + 17} học viên`, note: `${ownCourses.length} khóa đang quản lý`, icon: Users, color: 'text-violet-700 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300' },
          { label: 'Ký quỹ đang giữ', value: formatCurrency(coachWalletSummary.escrowBalance), note: 'Giải ngân theo tiến độ', icon: CircleDollarSign, color: 'text-teal-700 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-300' },
          { label: 'Cụm sân đã duyệt', value: `${coachAffiliations.filter((item) => item.status === 'APPROVED').length} đối tác`, note: '1 yêu cầu đang chờ', icon: MapPin, color: 'text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300' },
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
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Lịch dạy theo tuần</p>
            <h2 className="mt-1 text-xl font-black">Tuần 42 · 12/10 – 18/10/2026</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => showToast('Đang xem tuần trước.', 'info')} aria-label="Tuần trước"><ChevronLeft /></Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDay(2)}>Hôm nay</Button>
            <Button variant="outline" size="icon" onClick={() => showToast('Đang xem tuần kế tiếp.', 'info')} aria-label="Tuần sau"><ChevronRight /></Button>
          </div>
        </div>

        <div className="border-b border-border p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weekDays.map((day, index) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDay(index)}
                className={`min-w-[98px] rounded-xl px-3 py-2 text-left transition ${selectedDay === index ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-secondary/45 hover:text-foreground'}`}
              >
                <span className="block text-[10px] font-semibold uppercase">{day.today ? 'Hôm nay' : day.label}</span>
                <span className="mt-0.5 block text-sm font-black">{day.date}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 p-4 sm:p-5">
          {slots.map((slot) => {
            const course = getScheduleItem(slot.number)
            const isGolden = slot.number === 5
            return (
              <div key={slot.number} className="grid gap-3 rounded-2xl border border-border p-3 sm:grid-cols-[160px_1fr] sm:items-center">
                <div className="flex items-center justify-between sm:block">
                  <p className="text-xs font-black text-foreground">Slot {slot.number}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="h-3 w-3" /> {slot.time}</p>
                  {isGolden && <Badge className="mt-1 border-amber-300/60 bg-amber-500/10 text-amber-700 dark:text-amber-300">Giờ vàng</Badge>}
                </div>
                {course ? (
                  <button
                    type="button"
                    onClick={() => navigate('bookingId' in course ? `/coach/bookings?booking=${course.bookingId}` : `/coach/attendance?course=${course.id}`)}
                    className={`group flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${isGolden ? 'border-amber-300/60 bg-amber-500/10 hover:border-amber-400' : 'border-primary/15 bg-secondary/30 hover:border-primary/35 dark:bg-secondary/10'}`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-foreground">{course.title}</p>
                        {selectedDay === 2 && slot.number === 5 && <Badge variant="success">Đang diễn ra</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{course.venue} · {course.currentStudents}/{course.maxStudents} học viên</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
                  </button>
                ) : slot.number === 3 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/60 p-3 text-xs font-semibold text-muted-foreground">Nghỉ ngơi · Khóa lịch cá nhân</div>
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
          <div><p className="font-black text-foreground">Đối soát tiếp theo: 18/10/2026</p><p className="text-xs text-muted-foreground">Dự kiến giải ngân {formatCurrency(coachWalletSummary.pendingPayout)} sau khi hoàn tất buổi học.</p></div>
        </div>
        <Button onClick={() => navigate('/coach/wallet')}>Xem thu nhập <ArrowRight /></Button>
      </section>
    </div>
  )
}
