/**
 * Phí nền tảng Coach trả cho FITLYO: 5% số tiền của mỗi buổi học hoặc khóa học đã hoàn thành.
 */
import type { CoachBooking } from '@/types/coachBooking'
import type { CoachCourse } from '@/types/pickleball'

export const COACH_FEE_RATE = 0.05

export type CoachFeeKind = 'SESSION' | 'COURSE'

export interface CoachFeeItem {
  /** Khoá ổn định để ghi nhận đã thanh toán. */
  id: string
  coachId: string
  kind: CoachFeeKind
  title: string
  detail: string
  /** Ngày hoàn thành (YYYY-MM-DD). */
  completedDate: string
  grossAmount: number
  feeAmount: number
}

export const coachFeeFor = (amount: number) => Math.round(amount * COACH_FEE_RATE)

/** Hạn thanh toán phí coaching: 5 ngày kể từ ngày hoàn thành buổi học / khóa học. */
export const COACH_FEE_DUE_DAYS = 5

const localDateKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`

/** Ngày cuối cùng được thanh toán (YYYY-MM-DD); rỗng nếu không rõ ngày hoàn thành. */
export const coachFeeDueDate = (completedDate: string) => {
  if (!completedDate) return ''
  const due = new Date(`${completedDate}T12:00:00`)
  due.setDate(due.getDate() + COACH_FEE_DUE_DAYS)
  return localDateKey(due)
}

/** Số ngày đã quá hạn (0 nếu chưa quá hạn hoặc không rõ ngày hoàn thành). */
export const coachFeeOverdueDays = (completedDate: string, now = new Date()) => {
  const due = coachFeeDueDate(completedDate)
  if (!due) return 0
  const today = localDateKey(now)
  if (today <= due) return 0
  return Math.round((new Date(`${today}T12:00:00`).getTime() - new Date(`${due}T12:00:00`).getTime()) / 86_400_000)
}

const sessionEnded = (date: string, timeRange: string, now: Date) => {
  const end = timeRange.split(' - ')[1] ?? '23:59'
  return new Date(`${date}T${end}:00`).getTime() <= now.getTime()
}

/**
 * Các mục đã hoàn thành của Coach:
 * - Buổi học lẻ Player đặt (đã xác nhận) → hoàn thành khi buổi đã kết thúc.
 * - Khóa học Player đặt (đã xác nhận) → hoàn thành khi buổi cuối cùng đã kết thúc.
 * - Khóa học nhóm Coach mở → hoàn thành khi đã dạy đủ số buổi; tiền khóa = học phí × số học viên.
 */
export const buildCoachFeeItems = (input: {
  coachId: string
  bookings: CoachBooking[]
  courses: CoachCourse[]
  samples?: CoachFeeItem[]
  now?: Date
}): CoachFeeItem[] => {
  const now = input.now ?? new Date()
  const items: CoachFeeItem[] = []

  input.bookings
    .filter((booking) => booking.coachId === input.coachId && booking.status === 'CONFIRMED')
    .forEach((booking) => {
      const sessions = booking.sessions.filter((session) => session.status !== 'CANCELLED')
      if (!sessions.length) return
      const last = [...sessions].sort((a, b) => `${a.date}${a.timeRange}`.localeCompare(`${b.date}${b.timeRange}`))[sessions.length - 1]
      const done = sessions.every((session) => session.status === 'COMPLETED' || sessionEnded(session.date, session.timeRange, now))
      if (!done) return
      items.push({
        id: `booking-${booking.id}`,
        coachId: booking.coachId,
        kind: booking.type === 'COURSE' ? 'COURSE' : 'SESSION',
        title: booking.title,
        detail: `${booking.playerName} · ${booking.type === 'COURSE' ? `${sessions.length} buổi` : last.timeRange} · ${booking.venueName}`,
        completedDate: last.date,
        grossAmount: booking.totalAmount,
        feeAmount: coachFeeFor(booking.totalAmount),
      })
    })

  input.courses
    .filter((course) => course.coachId === input.coachId && (course.status === 'COMPLETED' || (course.totalSessions > 0 && course.completedSessions >= course.totalSessions)))
    .forEach((course) => {
      const gross = course.fee * Math.max(course.currentStudents, 0)
      if (gross <= 0) return
      items.push({
        id: `course-${course.id}`,
        coachId: course.coachId,
        kind: 'COURSE',
        title: course.title,
        detail: `${course.currentStudents} học viên × ${course.fee.toLocaleString('vi-VN')}đ · ${course.totalSessions} buổi · ${course.venue}`,
        completedDate: '',
        grossAmount: gross,
        feeAmount: coachFeeFor(gross),
      })
    })

  ;(input.samples ?? []).filter((item) => item.coachId === input.coachId).forEach((item) => items.push(item))

  return items.sort((a, b) => b.completedDate.localeCompare(a.completedDate))
}
