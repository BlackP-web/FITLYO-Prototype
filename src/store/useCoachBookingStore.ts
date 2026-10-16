import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { usePlayerStore } from '@/store/usePlayerStore'
import { COURT_SLOT_TIMES } from '@/lib/courtSchedule'
import type { CoachItem } from '@/types/pickleball'
import type {
  CoachBooking,
  CoachBookingActionResult,
  CoachBookingSession,
  CoachBookingType,
  CoachCalendarDay,
  CoachChatMessage,
  CoachPaymentMethod,
} from '@/types/coachBooking'

const slotTimes = Object.fromEntries(COURT_SLOT_TIMES.map((slot) => [slot.slotNumber, slot.timeRange])) as Record<number, string>

const coachPatterns: Record<string, { weekdays: number[]; slots: number[]; venueName: string; courtName: string }> = {
  coach_dung: { weekdays: [2, 4, 6], slots: [1, 7, 9], venueName: 'D-Pickleball Thảo Điền', courtName: 'Sân Coach 01' },
  coach_long: { weekdays: [1, 3, 5], slots: [2, 7, 10], venueName: 'Thảo Điền Pickleball Club', courtName: 'Sân 02' },
  coach_kiet: { weekdays: [2, 4, 6], slots: [1, 3, 9], venueName: 'D-Sports Thủ Đức', courtName: 'Sân 03' },
  coach_minhanh: { weekdays: [0, 1, 3, 5], slots: [1, 7, 10], venueName: 'Vinhomes Grand Park', courtName: 'Sân 01' },
}

const externalReservations = [
  { id: 'external-booking-01', coachId: 'coach_dung', playerName: 'Trần Bảo', date: '2026-10-20', slotNumber: 7 },
  { id: 'external-booking-02', coachId: 'coach_dung', playerName: 'Ngô Kim Ngân', date: '2026-10-22', slotNumber: 9 },
]

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fromDateKey = (date: string) => new Date(`${date}T12:00:00`)

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const dateLabel = (date: string) => new Intl.DateTimeFormat('vi-VN', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
}).format(fromDateKey(date))

const weekdayLabel = (date: string) => new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(fromDateKey(date))

const weekKey = (dateKey: string) => {
  const date = fromDateKey(dateKey)
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return toDateKey(date)
}

const prototypeToday = () => {
  const today = new Date()
  const minimum = fromDateKey('2026-10-16')
  return today < minimum ? minimum : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12)
}

const isPublished = (coachId: string, date: string, slotNumber: number) => {
  const pattern = coachPatterns[coachId]
  if (!pattern) return false
  return pattern.weekdays.includes(fromDateKey(date).getDay()) && pattern.slots.includes(slotNumber)
}

const playerConflictFor = (date: string, timeRange: string) => usePlayerStore.getState().schedule.find((item) => (
  item.status === 'UPCOMING' && item.date === date && item.timeRange === timeRange
))

interface BookingPreview {
  success: boolean
  message: string
  sessions: CoachBookingSession[]
}

interface CoachBookingState {
  bookings: CoachBooking[]
  messages: CoachChatMessage[]
  getCalendar: (coachId: string, days?: number) => CoachCalendarDay[]
  previewBooking: (coachId: string, date: string, slotNumber: number, type: CoachBookingType, ignoreBookingId?: string) => BookingPreview
  createInstantBooking: (input: {
    coach: CoachItem
    type: CoachBookingType
    date: string
    slotNumber: number
    paymentMethod: CoachPaymentMethod
  }) => CoachBookingActionResult
  createCustomRequest: (input: {
    coach: CoachItem
    type: CoachBookingType
    date: string
    slotNumber: number
  }) => CoachBookingActionResult
  approveRequest: (bookingId: string) => CoachBookingActionResult
  declineRequest: (bookingId: string) => CoachBookingActionResult
  payApprovedRequest: (bookingId: string, paymentMethod: CoachPaymentMethod) => CoachBookingActionResult
  sendMessage: (bookingId: string, senderRole: 'PLAYER' | 'COACH', senderName: string, text: string) => boolean
}

const bookingStorageKey = 'fitlyo-coach-bookings-v1'

export const useCoachBookingStore = create<CoachBookingState>()(
  persist(
    (set, get) => {
      const isCoachSlotTaken = (coachId: string, date: string, slotNumber: number, ignoreBookingId?: string) => {
        const external = externalReservations.some((item) => (
          item.coachId === coachId && item.date === date && item.slotNumber === slotNumber
        ))
        if (external) return true
        return get().bookings.some((booking) => (
          booking.id !== ignoreBookingId
          && booking.coachId === coachId
          && ['CONFIRMED', 'AWAITING_DEPOSIT'].includes(booking.status)
          && booking.sessions.some((session) => (
            session.status === 'SCHEDULED'
            && session.date === date
            && session.slotNumber === slotNumber
          ))
        ))
      }

      const previewBooking = (
        coachId: string,
        firstDate: string,
        slotNumber: number,
        type: CoachBookingType,
        ignoreBookingId?: string,
      ): BookingPreview => {
        const timeRange = slotTimes[slotNumber]
        if (!timeRange) return { success: false, message: 'Khung giờ không hợp lệ.', sessions: [] }

        if (isCoachSlotTaken(coachId, firstDate, slotNumber, ignoreBookingId)) {
          return { success: false, message: 'Khung giờ này vừa được một học viên khác đặt với Coach.', sessions: [] }
        }
        const firstConflict = playerConflictFor(firstDate, timeRange)
        if (firstConflict) {
          return {
            success: false,
            message: `Bạn đã trùng lịch với “${firstConflict.title}” vào ${dateLabel(firstDate)}, ${timeRange}.`,
            sessions: [],
          }
        }

        const makeSession = (date: string, sequence: number): CoachBookingSession => ({
          id: `coach-session-${date}-${slotNumber}-${sequence}`,
          sequence,
          date,
          dateLabel: dateLabel(date),
          slotNumber,
          timeRange,
          status: 'SCHEDULED',
        })

        if (type === 'SINGLE') return { success: true, message: 'Khung giờ sẵn sàng.', sessions: [makeSession(firstDate, 1)] }

        const sessions = [makeSession(firstDate, 1)]
        const sessionsPerWeek = new Map<string, number>([[weekKey(firstDate), 1]])
        for (let offset = 1; offset <= 70 && sessions.length < 8; offset += 1) {
          const candidate = toDateKey(addDays(fromDateKey(firstDate), offset))
          if (!isPublished(coachId, candidate, slotNumber)) continue
          const candidateWeek = weekKey(candidate)
          if ((sessionsPerWeek.get(candidateWeek) ?? 0) >= 2) continue
          if (isCoachSlotTaken(coachId, candidate, slotNumber, ignoreBookingId)) continue
          if (playerConflictFor(candidate, timeRange)) continue
          sessions.push(makeSession(candidate, sessions.length + 1))
          sessionsPerWeek.set(candidateWeek, (sessionsPerWeek.get(candidateWeek) ?? 0) + 1)
        }

        if (sessions.length < 8) {
          return { success: false, message: 'Không đủ 8 slot phù hợp trong lịch công bố của Coach.', sessions: [] }
        }
        return { success: true, message: 'Đã tự xếp 8 buổi, tối đa 2 buổi mỗi tuần.', sessions }
      }

      const appendSystemMessage = (bookingId: string, text: string) => {
        const message: CoachChatMessage = {
          id: `message-system-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          bookingId,
          senderRole: 'SYSTEM',
          senderName: 'FITLYO',
          text,
          sentAt: new Date().toISOString(),
        }
        set((state) => ({ messages: [...state.messages, message] }))
      }

      const recordConfirmedBooking = (booking: CoachBooking, paymentMethod: CoachPaymentMethod) => {
        return usePlayerStore.getState().recordCoachBooking({
          bookingId: booking.id,
          coachId: booking.coachId,
          coachName: booking.coachName,
          type: booking.type,
          title: booking.title,
          venueName: booking.venueName,
          courtName: booking.courtName,
          depositAmount: booking.depositAmount,
          paymentMethod,
          sessions: booking.sessions,
        })
      }

      return {
        bookings: [],
        messages: [],

        getCalendar: (coachId, days = 28) => {
          const pattern = coachPatterns[coachId]
          if (!pattern) return []
          const calendar: CoachCalendarDay[] = []
          const start = prototypeToday()
          for (let offset = 0; offset < days; offset += 1) {
            const current = addDays(start, offset)
            if (!pattern.weekdays.includes(current.getDay())) continue
            const date = toDateKey(current)
            const slots = pattern.slots.map((slotNumber) => {
              const timeRange = slotTimes[slotNumber]
              if (isCoachSlotTaken(coachId, date, slotNumber)) {
                return { slotNumber, timeRange, state: 'BOOKED' as const, reason: 'Đã có học viên đặt' }
              }
              const conflict = playerConflictFor(date, timeRange)
              if (conflict) {
                return { slotNumber, timeRange, state: 'PLAYER_CONFLICT' as const, reason: `Trùng với ${conflict.title}` }
              }
              return { slotNumber, timeRange, state: 'AVAILABLE' as const }
            })
            calendar.push({
              date,
              shortLabel: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(current),
              weekdayLabel: weekdayLabel(date),
              slots,
            })
          }
          return calendar
        },

        previewBooking,

        createInstantBooking: ({ coach, type, date, slotNumber, paymentMethod }) => {
          if (!isPublished(coach.id, date, slotNumber)) {
            return { success: false, message: 'Slot này không nằm trong lịch Coach đã công bố.' }
          }
          const preview = previewBooking(coach.id, date, slotNumber, type)
          if (!preview.success) return { success: false, message: preview.message }

          const pattern = coachPatterns[coach.id]
          const bookingId = `coach-booking-${Date.now()}`
          const totalAmount = type === 'SINGLE' ? coach.ratePerSession : coach.ratePerMonthCourse
          const booking: CoachBooking = {
            id: bookingId,
            playerId: usePlayerStore.getState().profile.id,
            playerName: usePlayerStore.getState().profile.name,
            playerAvatarUrl: usePlayerStore.getState().profile.avatarUrl,
            coachId: coach.id,
            coachName: coach.name,
            coachAvatarUrl: coach.avatarUrl,
            type,
            status: 'CONFIRMED',
            title: type === 'COURSE' ? (coach.featuredCourse ?? `Khóa học cùng ${coach.name}`) : `PT 1-1 cùng ${coach.name}`,
            venueName: pattern?.venueName ?? coach.serviceLocations[0],
            courtName: pattern?.courtName ?? 'Sân Coach',
            totalAmount,
            depositAmount: Math.ceil(totalAmount / 2),
            paymentMethod,
            createdAt: new Date().toISOString(),
            confirmedAt: new Date().toISOString(),
            firstDate: date,
            preferredSlotNumber: slotNumber,
            preferredTimeRange: slotTimes[slotNumber],
            sessions: preview.sessions,
          }

          const playerResult = recordConfirmedBooking(booking, paymentMethod)
          if (!playerResult.success) return playerResult
          set((state) => ({ bookings: [booking, ...state.bookings] }))
          appendSystemMessage(bookingId, `Lịch đã được xác nhận tức thì. FITLYO đã ghi nhận cọc 50% là ${booking.depositAmount.toLocaleString('vi-VN')}đ.`)
          return { success: true, message: 'Đặt lịch thành công! Lịch đã được xác nhận ngay.', bookingId }
        },

        createCustomRequest: ({ coach, type, date, slotNumber }) => {
          const timeRange = slotTimes[slotNumber]
          if (!timeRange) return { success: false, message: 'Khung giờ không hợp lệ.' }
          const conflict = playerConflictFor(date, timeRange)
          if (conflict) {
            return { success: false, message: `Bạn đã trùng lịch với “${conflict.title}” vào ${dateLabel(date)}, ${timeRange}.` }
          }
          if (isCoachSlotTaken(coach.id, date, slotNumber)) {
            return { success: false, message: 'Coach đã có lịch với học viên khác trong khung giờ này.' }
          }

          const pattern = coachPatterns[coach.id]
          const bookingId = `coach-request-${Date.now()}`
          const totalAmount = type === 'SINGLE' ? coach.ratePerSession : coach.ratePerMonthCourse
          const booking: CoachBooking = {
            id: bookingId,
            playerId: usePlayerStore.getState().profile.id,
            playerName: usePlayerStore.getState().profile.name,
            playerAvatarUrl: usePlayerStore.getState().profile.avatarUrl,
            coachId: coach.id,
            coachName: coach.name,
            coachAvatarUrl: coach.avatarUrl,
            type,
            status: 'PENDING_COACH',
            title: type === 'COURSE' ? (coach.featuredCourse ?? `Khóa học cùng ${coach.name}`) : `PT 1-1 cùng ${coach.name}`,
            venueName: pattern?.venueName ?? coach.serviceLocations[0],
            courtName: pattern?.courtName ?? 'Sân Coach',
            totalAmount,
            depositAmount: Math.ceil(totalAmount / 2),
            createdAt: new Date().toISOString(),
            firstDate: date,
            preferredSlotNumber: slotNumber,
            preferredTimeRange: timeRange,
            sessions: [],
          }
          set((state) => ({ bookings: [booking, ...state.bookings] }))
          appendSystemMessage(bookingId, `Đã gửi yêu cầu khung giờ ${dateLabel(date)}, ${timeRange}. Coach cần duyệt trước khi bạn thanh toán cọc.`)
          return { success: true, message: 'Đã gửi yêu cầu giờ khác đến Coach.', bookingId }
        },

        approveRequest: (bookingId) => {
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || booking.status !== 'PENDING_COACH') return { success: false, message: 'Yêu cầu không còn ở trạng thái chờ duyệt.' }
          const preview = previewBooking(booking.coachId, booking.firstDate, booking.preferredSlotNumber, booking.type, booking.id)
          if (!preview.success) return { success: false, message: preview.message }
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'AWAITING_DEPOSIT', sessions: preview.sessions } : item) }))
          appendSystemMessage(bookingId, 'Coach đã đồng ý khung giờ. Vui lòng thanh toán cọc 50% để xác nhận và khóa lịch.')
          return { success: true, message: 'Đã duyệt yêu cầu và chờ Player thanh toán cọc.', bookingId }
        },

        declineRequest: (bookingId) => {
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || booking.status !== 'PENDING_COACH') return { success: false, message: 'Yêu cầu không còn ở trạng thái chờ duyệt.' }
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'DECLINED' } : item) }))
          appendSystemMessage(bookingId, 'Coach chưa thể nhận lịch này. Bạn có thể chọn một slot công bố khác.')
          return { success: true, message: 'Đã từ chối yêu cầu lịch.', bookingId }
        },

        payApprovedRequest: (bookingId, paymentMethod) => {
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || booking.status !== 'AWAITING_DEPOSIT') return { success: false, message: 'Lịch này chưa sẵn sàng để thanh toán.' }
          const preview = previewBooking(booking.coachId, booking.firstDate, booking.preferredSlotNumber, booking.type, booking.id)
          if (!preview.success) return { success: false, message: preview.message }
          const confirmed = { ...booking, sessions: preview.sessions }
          const playerResult = recordConfirmedBooking(confirmed, paymentMethod)
          if (!playerResult.success) return playerResult
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'CONFIRMED', paymentMethod, confirmedAt: new Date().toISOString(), sessions: preview.sessions } : item) }))
          appendSystemMessage(bookingId, `Thanh toán cọc 50% thành công: ${booking.depositAmount.toLocaleString('vi-VN')}đ. Lịch học đã được xác nhận.`)
          return { success: true, message: 'Thanh toán cọc thành công. Lịch đã được xác nhận.', bookingId }
        },

        sendMessage: (bookingId, senderRole, senderName, text) => {
          const cleanText = text.trim()
          if (!cleanText || !get().bookings.some((item) => item.id === bookingId)) return false
          const message: CoachChatMessage = {
            id: `message-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            bookingId,
            senderRole,
            senderName,
            text: cleanText,
            sentAt: new Date().toISOString(),
          }
          set((state) => ({ messages: [...state.messages, message] }))
          return true
        },
      }
    },
    {
      name: bookingStorageKey,
      storage: createJSONStorage(() => window.localStorage),
      version: 1,
    },
  ),
)

export { slotTimes }
