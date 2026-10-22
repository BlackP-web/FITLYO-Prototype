export type CoachBookingType = 'SINGLE' | 'COURSE'
export type CoachBookingStatus =
  | 'PENDING_COACH'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'

export type CoachPaymentMethod = 'WALLET' | 'VIETQR'
export type CoachSlotState = 'AVAILABLE' | 'BOOKED' | 'PLAYER_CONFLICT'

export interface CoachBookingSession {
  id: string
  sequence: number
  date: string
  dateLabel: string
  slotNumber: number
  timeRange: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}

export interface CoachBooking {
  id: string
  playerId: string
  playerName: string
  playerAvatarUrl: string
  coachId: string
  coachName: string
  coachAvatarUrl: string
  type: CoachBookingType
  status: CoachBookingStatus
  title: string
  venueName: string
  courtName: string
  totalAmount: number
  paymentAmount: number
  paymentMethod?: CoachPaymentMethod
  createdAt: string
  approvalExpiresAt: string
  approvedAt?: string
  paymentExpiresAt?: string
  confirmedAt?: string
  firstDate: string
  preferredSlotNumber: number
  preferredTimeRange: string
  sessions: CoachBookingSession[]
  paymentReferenceId?: string
  rescheduleUsed: boolean
}

export interface CoachChatMessage {
  id: string
  bookingId: string
  senderRole: 'PLAYER' | 'COACH' | 'SYSTEM'
  senderName: string
  text: string
  sentAt: string
}

export interface CoachCalendarSlot {
  slotNumber: number
  timeRange: string
  state: CoachSlotState
  reason?: string
}

export interface CoachCalendarDay {
  date: string
  shortLabel: string
  weekdayLabel: string
  slots: CoachCalendarSlot[]
}

export interface CoachBookingActionResult {
  success: boolean
  message: string
  bookingId?: string
}
