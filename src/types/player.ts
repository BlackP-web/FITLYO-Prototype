export type MatchStatus = 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED'
export type TicketStatus = 'ACTIVE' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED'
export type ScheduleStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
export type ScheduleKind = 'MATCH' | 'COURSE' | 'COURT'
export type SlotStatus = 'AVAILABLE' | 'SOCIAL' | 'COACHING' | 'PRIVATE' | 'MAINTENANCE'

export interface PlayerProfile {
  id: string
  name: string
  username: string
  email: string
  phone: string
  city: string
  memberSince: string
  avatarUrl: string
  dupr: number
  duprTrend: number
  reputation: number
  matchesPlayed: number
  wins: number
  losses: number
  walletBalance: number
  voucherBalance: number
  isVip: boolean
  vipExpiresAt?: string
  skills: {
    serve: number
    thirdShot: number
    dinking: number
    volley: number
    movement: number
  }
}

export interface MatchParticipant {
  id: string
  name: string
  avatarUrl: string
  dupr: number
  reputation: number
  isHost?: boolean
  isCurrentUser?: boolean
}

export interface PlayerMatch {
  id: string
  title: string
  label: string
  venueId: string
  venueName: string
  courtName: string
  address: string
  area: string
  distanceKm: number
  imageUrl: string
  date: string
  dateLabel: string
  slotNumber: number
  timeRange: string
  format: 'Đôi nam nữ' | 'Đôi nam' | 'Giao lưu tự do'
  duprMin: number
  duprMax: number
  fee: number
  maxPlayers: number
  status: MatchStatus
  participants: MatchParticipant[]
  amenities: string[]
  note: string
  isPeak?: boolean
  isVipEarlyAccess?: boolean
}

export interface PlayerTicket {
  code: string
  matchId: string
  status: TicketStatus
  createdAt: string
  checkedInAt?: string
  locker: string
  paymentReferenceId?: string
  paidAmount?: number
}

export interface PlayerScheduleItem {
  id: string
  kind: ScheduleKind
  title: string
  subtitle: string
  venueName: string
  courtName: string
  date: string
  dateLabel: string
  timeRange: string
  status: ScheduleStatus
  amount: number
  ticketCode?: string
  matchId?: string
  coachName?: string
  progress?: string
  coachBookingId?: string
  coachSessionId?: string
  paymentReferenceId?: string
  totalAmount?: number
  paidAmount?: number
  remainingAmount?: number
  slotKey?: string
  bookingCode?: string
  bookedAt?: string
  venueId?: string
  courtId?: string
  slotNumber?: number
  rescheduleCount?: number
}

export interface VenueSlot {
  slotNumber: number
  timeRange: string
  price: number
  status: SlotStatus
  label?: string
  duprRange?: string
  players?: string
  isPeak?: boolean
}

export interface VenueCourt {
  id: string
  name: string
  type: string
  slots: VenueSlot[]
}

export interface PlayerVenue {
  id: string
  name: string
  address: string
  area: string
  distanceKm: number
  rating: number
  reviewCount: number
  openingHours: string
  hotline: string
  description: string
  images: string[]
  amenities: string[]
  courts: VenueCourt[]
}

export interface ReviewDraft {
  scores: Array<{ teamA: number; teamB: number }>
  ratings: Record<string, number>
  levelVotes: Record<string, 'ACCURATE' | 'HIGHER' | 'LOWER'>
  reports: string[]
  reportNote: string
}
