export type UserRole = 'player' | 'fm' | 'coach' | 'admin' | 'field_manager'

export interface UserPlayer {
  id: string
  name: string
  avatarUrl: string
  dupr: number
  reputationScore: number // e.g. 98 (%)
  isHost?: boolean
  isDeposited?: boolean
  isCurrentUser?: boolean
  phone?: string
}

export type MatchFormat = 'doubles' | 'singles'
export type MatchStatus = 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'

export interface MatchRoom {
  id: string // e.g. "MM-9023"
  title: string
  courtId: string
  courtName: string
  courtSubName: string
  surfaceType: 'Trong nhà' | 'Ngoài trời' | 'Mái che'
  address: string
  distanceKm: number
  slotNumber: number // 1 to 10
  timeRange: string
  dateStr: string
  format: MatchFormat
  targetDuprMin: number
  targetDuprMax: number
  currentPlayers: number
  maxPlayers: number
  depositFee: number
  status: MatchStatus
  participants: UserPlayer[]
  amenities: string[]
  note?: string
  qrToken?: string
  isVipEarlyAccess?: boolean
  isBookedByMe?: boolean
}

export type SlotStatus =
  | 'AVAILABLE'
  | 'MATCH_PUBLISHED'
  | 'COACHING'
  | 'PRIVATE_BOOKED'
  | 'MAINTENANCE'

export interface CourtSlot {
  slotNumber: number // 1 to 10
  timeRange: string
  status: SlotStatus
  price: number
  isPeak?: boolean
  matchRoomId?: string
  matchTitle?: string
  duprRange?: string
  playersCount?: string
  bookedNote?: string
  bookedContact?: string
  bookedByName?: string
  bookedPhone?: string
  bookingId?: string
  bookedAt?: string
  bookingStatus?: string
  maintenanceReason?: string
  walkInBooking?: WalkInBooking
}

export type WalkInSource = 'AT_COUNTER' | 'PHONE_CALL'
export type WalkInPaymentMethod = 'CASH' | 'VIETQR' | 'DEBT'

export interface WalkInBooking {
  id: string
  customerName: string
  phone: string
  source: WalkInSource
  paymentMethod: WalkInPaymentMethod
  courtFee: number
  extraFee: number
  paidAmount: number
  note: string
  createdAt: string
}

export interface CheckInParticipant {
  id: string
  name: string
  avatarUrl: string
  role?: string
  checkedInAt?: string
}

export type TicketScenario = 'VALID' | 'ALREADY_CHECKED_IN' | 'WRONG_VENUE' | 'WRONG_TIME'

export interface CheckInTicket {
  code: string
  venueName: string
  courtName: string
  slotNumber: number
  timeRange: string
  dateStr: string
  matchLabel: string
  duprRange: string
  holderId: string
  scenario: TicketScenario
  participants: CheckInParticipant[]
}

export interface CheckInLog {
  id: string
  time: string
  courtName: string
  description: string
  tone: 'success' | 'info'
}

export interface CourtInventory {
  id: string
  name: string
  courtType: 'indoor' | 'outdoor' | 'covered'
  slots: CourtSlot[]
}

export interface CoachItem {
  id: string
  userId: string
  name: string
  avatarUrl: string
  phone: string
  duprRating: number
  isCertified: boolean
  certTitle: string
  rating: number
  reviewCount: number
  experienceYears: number
  achievements: string
  serviceLocations: string[]
  ratePerSession: number
  ratePerMonthCourse: number
  specialties: string[]
  featuredCourse?: string
  isVipExclusive?: boolean
  accountStatus?: 'ACTIVE' | 'SUSPENDED'
}

export interface StudentProgress {
  id: string
  name: string
  avatarUrl: string
  dupr: number
  attendance: 'present' | 'absent' | 'makeup'
  serveScore?: number
  dropShotScore?: number
  dinkScore?: number
  finalDupr?: number
  feedback?: string
}

export interface CoachCourse {
  id: string
  title: string
  coachId: string
  coachName: string
  duration: string
  frequency: string
  venue: string
  fee: number
  currentStudents: number
  maxStudents: number
  completedSessions: number
  totalSessions: number
  status: 'IN_PROGRESS' | 'RECRUITING' | 'COMPLETED'
  students: StudentProgress[]
  courseType?: 'GROUP_4' | 'PT_1ON1'
  duprInput?: string
  duprOutput?: string
  slotNumber?: number
  timeRange?: string
  scheduleDays?: string[]
  description?: string
}

export interface CoachAccount {
  id: string
  name: string
  avatarUrl: string
  email: string
  phone: string
  duprRating: number
  rating: number
  reviewCount: number
  experienceYears: number
  verificationStatus: 'APPROVED'
  certificateTitle: string
  certificateCode: string
  certificateExpiry: string
  bio: string
  specialties: string[]
  serviceAreas: string[]
  ratePerSession: number
  ratePerCourse: number
  bankName: string
  bankAccountMasked: string
}

export interface CoachVenueAffiliation {
  id: string
  venueId: string
  coachId: string
  venueName: string
  address: string
  distanceKm: number
  linkType: 'COACH_REQUEST' | 'FM_DIRECT_ADD'
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE'
  rejectedReason?: string
  requestedAt: string
  linkedAt?: string
  createdBy: string
  discountPercent?: number
  activeCourses: number
  availableSlots: number[]
}

export interface CoachAffiliationNotification {
  id: string
  recipientId: string
  message: string
  createdAt: string
  tone: 'success' | 'info' | 'error'
}

export interface CoachWalletTransaction {
  id: string
  coachId: string
  date: string
  description: string
  courseName: string
  amount: number
  type: 'ESCROW_IN' | 'RELEASE' | 'WITHDRAWAL' | 'PLATFORM_FEE'
  status: 'COMPLETED' | 'PENDING' | 'HELD'
}

export interface CoachWalletSummary {
  availableBalance: number
  escrowBalance: number
  pendingPayout: number
  earnedThisMonth: number
}

export interface AuditDocument {
  id: string
  name: string
  type: 'pdf' | 'jpg' | 'png'
  fileSize: string
}

export interface AuditApplication {
  id: string
  type: 'VENUE' | 'COACH'
  title: string
  ownerName: string
  phone: string
  address: string
  details: string
  documents: AuditDocument[]
  status: 'PENDING' | 'NEEDS_SUPPLEMENT' | 'APPROVED' | 'REJECTED'
  inspectorNotes: string
  submittedDate: string
  rejectionReason?: string
  sourceAccountId?: string
  sourceAccountEmail?: string
  sourceRole?: 'coach' | 'fm'
  /** Giữ lại để đọc các hồ sơ Player tạo theo luồng prototype cũ. */
  sourcePlayerId?: string
  sourcePlayerEmail?: string
  applicationData?: Record<string, string | number | string[]>
  /** Credential được tạo theo luồng prototype cũ; không dùng cho hồ sơ xác minh hiện tại. */
  generatedAccount?: {
    id: string
    email: string
    password: string
    role: 'coach' | 'fm'
    createdAt: string
  }
}

export interface VenueItem {
  id: string
  name: string
  address: string
  area: string
  totalCourts: number
  availableSlotsToday: number
  rating: number
  reviewCount: number
  amenities: string[]
  imageUrl: string
  priceRange: string
}

export interface UserAccount {
  id: string
  name: string
  phone: string
  email: string
  role: UserRole
  avatarUrl: string
  duprRating: number
  reputationScore: number
  isPremium: boolean
  matchesPlayed: number
  winRate: number
  joinedDate: string
}
