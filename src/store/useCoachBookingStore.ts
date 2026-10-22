import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { usePlayerStore } from '@/store/usePlayerStore'
import { COURT_SLOT_TIMES } from '@/lib/courtSchedule'
import {
  addDaysIso,
  addHoursIso,
  addMinutesIso,
  COACH_PAYMENT_WINDOW_MINUTES,
  COACH_APPROVAL_HOURS,
  hoursUntilEvent,
  partnerCancellationVoucher,
} from '@/lib/paymentPolicies'
import { usePaymentStore } from '@/store/usePaymentStore'
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
  refreshExpirations: () => void
  cancelByPlayer: (bookingId: string) => CoachBookingActionResult
  requestLateReschedule: (bookingId: string) => CoachBookingActionResult
  cancelByCoach: (bookingId: string) => CoachBookingActionResult
  cancelCourseSessionByCoach: (bookingId: string, sessionId: string) => CoachBookingActionResult
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
          && ['PENDING_COACH', 'CONFIRMED', 'AWAITING_PAYMENT'].includes(booking.status)
          && (booking.status === 'PENDING_COACH'
            ? booking.firstDate === date && booking.preferredSlotNumber === slotNumber
            : booking.sessions.some((session) => (
              session.status === 'SCHEDULED'
              && session.date === date
              && session.slotNumber === slotNumber
            )))
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
          totalAmount: booking.totalAmount,
          paymentAmount: booking.paymentAmount,
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

        createInstantBooking: ({ coach, type, date, slotNumber }) => (
          get().createCustomRequest({ coach, type, date, slotNumber })
        ),

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
            paymentAmount: totalAmount,
            createdAt: new Date().toISOString(),
            approvalExpiresAt: addHoursIso(COACH_APPROVAL_HOURS),
            firstDate: date,
            preferredSlotNumber: slotNumber,
            preferredTimeRange: timeRange,
            sessions: [],
            rescheduleUsed: false,
          }
          set((state) => ({ bookings: [booking, ...state.bookings] }))
          appendSystemMessage(bookingId, `Đã gửi yêu cầu khung giờ ${dateLabel(date)}, ${timeRange}. Coach có 12 giờ để duyệt; bạn chưa bị trừ tiền.`)
          return { success: true, message: 'Đã gửi yêu cầu đến Coach. Chưa thu tiền trước khi Coach duyệt.', bookingId }
        },

        approveRequest: (bookingId) => {
          get().refreshExpirations()
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || booking.status !== 'PENDING_COACH') return { success: false, message: 'Yêu cầu không còn ở trạng thái chờ duyệt.' }
          const preview = previewBooking(booking.coachId, booking.firstDate, booking.preferredSlotNumber, booking.type, booking.id)
          if (!preview.success) return { success: false, message: preview.message }
          const approvedAt = new Date().toISOString()
          const paymentExpiresAt = addMinutesIso(COACH_PAYMENT_WINDOW_MINUTES)
          const paymentReferenceId = `coach-${bookingId}`
          usePaymentStore.getState().createAwaitingPayment({
            referenceId: paymentReferenceId,
            service: 'COACH',
            title: booking.title,
            totalAmount: booking.totalAmount,
            paidAmount: booking.paymentAmount,
            remainingAmount: 0,
            paymentExpiresAt,
          })
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? {
            ...item,
            status: 'AWAITING_PAYMENT',
            sessions: preview.sessions,
            approvedAt,
            paymentExpiresAt,
            paymentReferenceId,
          } : item) }))
          appendSystemMessage(bookingId, 'Coach đã đồng ý khung giờ. Player có 15 phút để thanh toán 100% học phí.')
          return { success: true, message: 'Đã duyệt yêu cầu và chờ Player thanh toán 100% học phí.', bookingId }
        },

        declineRequest: (bookingId) => {
          get().refreshExpirations()
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || booking.status !== 'PENDING_COACH') return { success: false, message: 'Yêu cầu không còn ở trạng thái chờ duyệt.' }
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'DECLINED' } : item) }))
          appendSystemMessage(bookingId, 'Coach chưa thể nhận lịch này. Bạn có thể chọn một slot công bố khác.')
          return { success: true, message: 'Đã từ chối yêu cầu lịch.', bookingId }
        },

        payApprovedRequest: (bookingId, paymentMethod) => {
          get().refreshExpirations()
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || booking.status !== 'AWAITING_PAYMENT') return { success: false, message: 'Lịch này chưa sẵn sàng để thanh toán.' }
          const preview = previewBooking(booking.coachId, booking.firstDate, booking.preferredSlotNumber, booking.type, booking.id)
          if (!preview.success) return { success: false, message: preview.message }
          const confirmed = { ...booking, sessions: preview.sessions }
          if (paymentMethod === 'WALLET' && usePlayerStore.getState().profile.walletBalance < booking.paymentAmount) {
            return { success: false, message: 'Số dư Ví FITLYO không đủ để thanh toán toàn bộ học phí.' }
          }
          if (!booking.paymentReferenceId) return { success: false, message: 'Không tìm thấy giao dịch thanh toán của lịch này.' }
          const paymentResult = usePaymentStore.getState().confirmPayment(booking.paymentReferenceId, paymentMethod)
          if (!paymentResult.success) return paymentResult
          const playerResult = recordConfirmedBooking(confirmed, paymentMethod)
          if (!playerResult.success) return playerResult
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'CONFIRMED', paymentMethod, confirmedAt: new Date().toISOString(), sessions: preview.sessions } : item) }))
          appendSystemMessage(bookingId, `Thanh toán 100% học phí thành công: ${booking.paymentAmount.toLocaleString('vi-VN')}đ. Lịch học đã được xác nhận.`)
          return { success: true, message: 'Thanh toán 100% học phí thành công. Lịch đã được xác nhận.', bookingId }
        },

        refreshExpirations: () => {
          const now = Date.now()
          const expiring = get().bookings.filter((booking) => (
            (booking.status === 'PENDING_COACH' && now >= new Date(booking.approvalExpiresAt).getTime())
            || (booking.status === 'AWAITING_PAYMENT' && booking.paymentExpiresAt && now >= new Date(booking.paymentExpiresAt).getTime())
          ))
          if (!expiring.length) return
          expiring.forEach((booking) => {
            if (booking.paymentReferenceId) usePaymentStore.getState().markExpired(booking.paymentReferenceId)
          })
          set((state) => ({
            bookings: state.bookings.map((booking) => expiring.some((item) => item.id === booking.id) ? { ...booking, status: 'EXPIRED' } : booking),
            messages: [
              ...state.messages,
              ...expiring.map((booking) => ({
                id: `message-expired-${booking.id}-${Date.now()}`,
                bookingId: booking.id,
                senderRole: 'SYSTEM' as const,
                senderName: 'FITLYO',
                text: booking.status === 'PENDING_COACH'
                  ? 'Coach không xử lý trong 12 giờ. Yêu cầu đã tự hủy và lịch được giải phóng.'
                  : 'Player không thanh toán trong 15 phút. Quyền giữ slot đã hết hạn và lịch được mở lại.',
                sentAt: new Date().toISOString(),
              })),
            ],
          }))
        },

        cancelByPlayer: (bookingId) => {
          get().refreshExpirations()
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || ['DECLINED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(booking.status)) {
            return { success: false, message: 'Lịch này không thể hủy ở trạng thái hiện tại.' }
          }
          if (booking.status === 'PENDING_COACH' || booking.status === 'AWAITING_PAYMENT') {
            if (booking.paymentReferenceId) usePaymentStore.getState().markExpired(booking.paymentReferenceId)
            set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'CANCELLED' } : item) }))
            appendSystemMessage(bookingId, 'Player đã hủy yêu cầu trước khi thanh toán. Không phát sinh khoản thu.')
            return { success: true, message: 'Đã hủy yêu cầu. Bạn chưa bị trừ tiền.', bookingId }
          }

          const hoursBefore = hoursUntilEvent(booking.firstDate, booking.preferredTimeRange)
          if (hoursBefore < 24 && !booking.rescheduleUsed) {
            return { success: false, message: 'Lịch còn dưới 24 giờ. Bạn có thể dùng một lần đổi lịch miễn phí thay vì mất toàn bộ học phí.', bookingId }
          }

          const paymentReferenceId = booking.paymentReferenceId
          const payment = paymentReferenceId
            ? usePaymentStore.getState().records.find((item) => item.referenceId === paymentReferenceId)
            : undefined
          const refundablePaidAmount = Math.max(0, (payment?.paidAmount ?? booking.paymentAmount) - (payment?.refundAmount ?? 0))
          if (hoursBefore >= 24) {
            if (paymentReferenceId) usePaymentStore.getState().refundPayment({ referenceId: paymentReferenceId, amount: refundablePaidAmount, reason: 'Player hủy lịch Coach trước ít nhất 24 giờ.' })
            usePlayerStore.getState().creditWallet(refundablePaidAmount)
            usePlayerStore.getState().cancelCoachSchedule(bookingId, `Đã hoàn ${refundablePaidAmount.toLocaleString('vi-VN')}đ về Ví FITLYO`)
            set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'REFUNDED' } : item) }))
            appendSystemMessage(bookingId, `Player đã hủy đúng hạn. FITLYO hoàn toàn bộ ${refundablePaidAmount.toLocaleString('vi-VN')}đ đã thanh toán về Ví.`)
            return { success: true, message: 'Đã hủy lịch và hoàn 100% khoản đã thanh toán về Ví FITLYO.', bookingId }
          }

          if (paymentReferenceId) usePaymentStore.getState().forfeitPayment(paymentReferenceId, 'Player tiếp tục hủy dưới 24 giờ sau khi đã dùng quyền đổi lịch: không hoàn toàn bộ học phí.')
          usePlayerStore.getState().cancelCoachSchedule(bookingId, 'Đã hủy muộn · Không hoàn học phí')
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'CANCELLED' } : item) }))
          appendSystemMessage(bookingId, 'Player đã hủy dưới 24 giờ sau khi dùng quyền đổi lịch. Toàn bộ học phí không được hoàn theo chính sách.')
          return { success: true, message: 'Đã hủy lịch. Toàn bộ học phí không được hoàn theo chính sách.', bookingId }
        },

        requestLateReschedule: (bookingId) => {
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || booking.status !== 'CONFIRMED') return { success: false, message: 'Chỉ lịch đã xác nhận mới có thể yêu cầu đổi.' }
          if (hoursUntilEvent(booking.firstDate, booking.preferredTimeRange) >= 24) return { success: false, message: 'Lịch còn trên 24 giờ; bạn có thể hủy và đặt lại để được hoàn 100%.' }
          if (booking.rescheduleUsed) return { success: false, message: 'Bạn đã sử dụng quyền đổi lịch một lần cho booking này.' }
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, rescheduleUsed: true } : item) }))
          appendSystemMessage(bookingId, 'Player đã dùng quyền đổi lịch một lần. Hai bên vui lòng thống nhất slot mới trong chat; toàn bộ học phí tiếp tục được bảo lưu.')
          return { success: true, message: 'Đã gửi yêu cầu đổi lịch một lần. Toàn bộ học phí được bảo lưu.', bookingId }
        },

        cancelByCoach: (bookingId) => {
          get().refreshExpirations()
          const booking = get().bookings.find((item) => item.id === bookingId)
          if (!booking || ['DECLINED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(booking.status)) return { success: false, message: 'Lịch này không thể hủy.' }
          const isPaidBooking = booking.status === 'CONFIRMED'
          const voucherAmount = isPaidBooking ? partnerCancellationVoucher(booking.totalAmount) : 0
          if (booking.status === 'CONFIRMED' && booking.paymentReferenceId) {
            const payment = usePaymentStore.getState().records.find((item) => item.referenceId === booking.paymentReferenceId)
            const refundablePaidAmount = Math.max(0, (payment?.paidAmount ?? booking.paymentAmount) - (payment?.refundAmount ?? 0))
            usePaymentStore.getState().refundPayment({
              referenceId: booking.paymentReferenceId,
              amount: refundablePaidAmount,
              reason: 'Coach hủy lịch đã xác nhận.',
              voucherAmount,
              voucherExpiresAt: addDaysIso(30),
            })
            usePlayerStore.getState().creditWallet(refundablePaidAmount)
          } else if (booking.paymentReferenceId) {
            usePaymentStore.getState().markExpired(booking.paymentReferenceId)
          }
          if (voucherAmount > 0) usePlayerStore.getState().creditVoucher(voucherAmount)
          if (isPaidBooking) usePlayerStore.getState().cancelCoachSchedule(bookingId, `Coach hủy · Hoàn 100% khoản đã trả và tặng voucher ${voucherAmount.toLocaleString('vi-VN')}đ`)
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: booking.status === 'CONFIRMED' ? 'REFUNDED' : 'CANCELLED', sessions: item.sessions.map((session) => ({ ...session, status: 'CANCELLED' })) } : item) }))
          appendSystemMessage(bookingId, isPaidBooking
            ? `Coach đã hủy lịch. FITLYO hoàn toàn bộ khoản đã thanh toán và tặng voucher ${voucherAmount.toLocaleString('vi-VN')}đ, hạn 30 ngày.`
            : 'Coach đã hủy yêu cầu trước khi Player thanh toán. Không phát sinh hoàn tiền hay voucher.')
          return { success: true, message: isPaidBooking ? `Đã hủy lịch, hoàn tiền và cấp voucher ${voucherAmount.toLocaleString('vi-VN')}đ.` : 'Đã hủy yêu cầu chưa thanh toán.', bookingId }
        },

        cancelCourseSessionByCoach: (bookingId, sessionId) => {
          const booking = get().bookings.find((item) => item.id === bookingId)
          const session = booking?.sessions.find((item) => item.id === sessionId)
          if (!booking || booking.type !== 'COURSE' || booking.status !== 'CONFIRMED' || !session || session.status !== 'SCHEDULED') {
            return { success: false, message: 'Buổi học này không thể hủy.' }
          }
          const sessionValue = Math.round(booking.totalAmount / 8)
          const payment = booking.paymentReferenceId ? usePaymentStore.getState().records.find((item) => item.referenceId === booking.paymentReferenceId) : undefined
          const refundable = Math.min(sessionValue, Math.max(0, (payment?.paidAmount ?? booking.paymentAmount) - (payment?.refundAmount ?? 0)))
          const voucherAmount = partnerCancellationVoucher(sessionValue)
          if (booking.paymentReferenceId) usePaymentStore.getState().refundPayment({
            referenceId: booking.paymentReferenceId,
            amount: refundable,
            reason: `Coach hủy buổi ${session.sequence}/8 và không thể xếp lại.`,
            voucherAmount,
            voucherExpiresAt: addDaysIso(30),
          })
          usePlayerStore.getState().creditWallet(refundable)
          usePlayerStore.getState().creditVoucher(voucherAmount)
          usePlayerStore.getState().cancelCoachSchedule(bookingId, `Coach hủy buổi ${session.sequence}/8 · Hoàn ${refundable.toLocaleString('vi-VN')}đ`, sessionId)
          set((state) => ({ bookings: state.bookings.map((item) => item.id === bookingId ? {
            ...item,
            sessions: item.sessions.map((courseSession) => courseSession.id === sessionId ? { ...courseSession, status: 'CANCELLED' } : courseSession),
          } : item) }))
          appendSystemMessage(bookingId, `Coach hủy buổi ${session.sequence}/8. Đã hoàn ${refundable.toLocaleString('vi-VN')}đ (tổng học phí ÷ 8) và tặng voucher ${voucherAmount.toLocaleString('vi-VN')}đ.`)
          return { success: true, message: `Đã hoàn ${refundable.toLocaleString('vi-VN')}đ cho buổi bị hủy và cấp voucher.`, bookingId }
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
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as CoachBookingState & {
          bookings?: Array<CoachBooking & { depositAmount?: number; remainingAmount?: number }>
        }
        return {
          ...state,
          bookings: (state.bookings ?? []).map((booking) => ({
            ...booking,
            status: String(booking.status) === 'AWAITING_DEPOSIT' ? 'AWAITING_PAYMENT' : booking.status,
            approvalExpiresAt: booking.approvalExpiresAt ?? addHoursIso(COACH_APPROVAL_HOURS, new Date(booking.createdAt)),
            approvedAt: booking.approvedAt,
            paymentExpiresAt: booking.paymentExpiresAt ?? (String(booking.status) === 'AWAITING_DEPOSIT' ? addMinutesIso(COACH_PAYMENT_WINDOW_MINUTES, new Date(booking.createdAt)) : undefined),
            paymentAmount: booking.totalAmount,
            paymentReferenceId: booking.paymentReferenceId,
            rescheduleUsed: booking.rescheduleUsed ?? false,
          })),
        }
      },
    },
  ),
)

export { slotTimes }
