import { create } from 'zustand'
import { coachMale, communityHero, matchNewbie, matchWeekend, venueIndoor } from '@/assets/pickleball'
import { COURT_SLOT_TIMES } from '@/lib/courtSchedule'
import { usePlayerStore } from '@/store/usePlayerStore'
import type {
  UserAccount,
  MatchRoom,
  CourtInventory,
  CoachItem,
  CoachCourse,
  CoachAccount,
  CoachVenueAffiliation,
  CoachAffiliationNotification,
  CoachWalletTransaction,
  CoachWalletSummary,
  StudentProgress,
  AuditApplication,
  VenueItem,
  CheckInTicket,
  CheckInLog,
  WalkInBooking,
  WalkInPaymentMethod,
  WalkInSource,
} from '@/types/pickleball'

export type ColorMode = 'light' | 'dark'

interface FitlyoState {
  // Current user & active role
  colorMode: ColorMode
  currentUser: UserAccount
  isLoggedIn: boolean
  isSidebarOpen: boolean
  notificationCount: number

  // Social Matchmaking Feed
  matches: MatchRoom[]
  selectedMatchId: string | null
  feedFilter: {
    search: string
    duprMin: number
    duprMax: number
    onlyFitDupr: boolean
    eveningOnly: boolean
    nearMeOnly: boolean
    activeTab: 'open' | 'my'
  }
  isFeedLoading: boolean

  // Field Manager Grid & Inventory
  selectedDate: string
  courtInventory: CourtInventory[]
  isPublishModalOpen: boolean
  publishingSlotData: {
    courtId: string
    courtName: string
    slotNumber: number
    timeRange: string
  } | null
  isWalkInModalOpen: boolean
  walkInSlotData: FitlyoState['publishingSlotData']
  checkInTickets: CheckInTicket[]
  checkInLogs: CheckInLog[]

  // Coach & Courses
  coachAccount: CoachAccount
  coachCourses: CoachCourse[]
  coaches: CoachItem[]
  coachAffiliations: CoachVenueAffiliation[]
  coachAffiliationNotifications: CoachAffiliationNotification[]
  coachWalletTransactions: CoachWalletTransaction[]
  coachWalletSummary: CoachWalletSummary

  // Admin Portal
  auditApplications: AuditApplication[]
  selectedAuditId: string | null

  // Venues
  venues: VenueItem[]

  // UI Toast / Feedback
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null

  // Actions
  toggleColorMode: () => void
  setLoggedIn: (val: boolean) => void
  handleLogout: () => void
  updateUserProfile: (profile: Partial<UserAccount>) => void
  setDuprRating: (rating: number) => void
  setSelectedDate: (date: string) => void
  toggleSidebar: () => void
  togglePremium: () => void
  setFeedFilter: (filter: Partial<FitlyoState['feedFilter']>) => void
  setIsFeedLoading: (loading: boolean) => void
  selectMatch: (id: string | null) => void
  joinMatchRoom: (matchId: string) => boolean
  cancelMatchHold: (matchId: string) => boolean
  openPublishModal: (slot: FitlyoState['publishingSlotData']) => void
  closePublishModal: () => void
  openWalkInModal: (slot: FitlyoState['walkInSlotData']) => void
  closeWalkInModal: () => void
  publishSlotAsMatch: (data: {
    courtId: string
    slotNumber: number
    duprMin: number
    duprMax: number
    format: 'doubles' | 'singles'
    maxPlayers: number
    fee: number
    amenities: string[]
    note: string
  }) => void
  lockSlotAsPrivate: (courtId: string, slotNumber: number, contact: string) => void
  createWalkInBooking: (data: {
    customerName: string
    phone: string
    source: WalkInSource
    paymentMethod: WalkInPaymentMethod
    extraFee: number
    paidAmount: number
    note: string
  }) => WalkInBooking | null
  confirmTicketCheckIn: (ticketCode: string) => boolean
  setSlotMaintenance: (courtId: string, slotNumber: number) => void
  releaseSlot: (courtId: string, slotNumber: number) => void
  updateStudentAttendance: (
    courseId: string,
    studentId: string,
    status: 'present' | 'absent' | 'makeup'
  ) => boolean
  updateStudentAssessment: (
    courseId: string,
    studentId: string,
    assessment: Pick<StudentProgress, 'serveScore' | 'dropShotScore' | 'dinkScore' | 'finalDupr' | 'feedback'>,
  ) => boolean
  createCoachCourse: (course: Omit<CoachCourse, 'id' | 'coachId' | 'coachName' | 'currentStudents' | 'completedSessions' | 'students'>) => boolean
  updateCoachCourse: (courseId: string, changes: Partial<CoachCourse>) => boolean
  requestVenueAffiliation: (venueId: string) => boolean
  lookupCoachForAffiliation: (venueId: string, coachUserId: string) => {
    success: boolean
    message: string
    coach?: CoachItem
  }
  directAddCoachAffiliation: (venueId: string, coachUserId: string) => { success: boolean; message: string }
  approveCoachAffiliation: (affiliationId: string) => boolean
  rejectCoachAffiliation: (affiliationId: string, reason: string) => boolean
  unlinkCoachAffiliation: (affiliationId: string, initiatedBy: 'coach' | 'fm') => boolean
  updateCoachProfile: (changes: Partial<CoachAccount>) => boolean
  requestCoachWithdrawal: (amount: number) => boolean
  approveAuditApplication: (id: string) => void
  rejectAuditApplication: (id: string, reason: string) => void
  requestAuditSupplement: (id: string, reason: string) => void
  submitAuditApplication: (application: AuditApplication) => { success: boolean; message: string; application?: AuditApplication }
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void
  clearToast: () => void
}

const colorModeStorageKey = 'fitlyo-color-mode'

const getInitialColorMode = (): ColorMode => {
  if (typeof window === 'undefined') return 'light'

  const savedMode = window.localStorage.getItem(colorModeStorageKey)
  if (savedMode === 'light' || savedMode === 'dark') return savedMode

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyColorMode = (mode: ColorMode) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.style.colorScheme = mode
}

const initialColorMode = getInitialColorMode()
applyColorMode(initialColorMode)

const socialMatchCapacities = [4, 6, 8, 10, 12] as const

const initialUser: UserAccount = {
  id: 'usr_me',
  name: 'Nguyễn An',
  phone: '0912.345.678',
  email: 'nguyen.an@fitlyo.vn',
  role: 'player',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  duprRating: 2.85,
  reputationScore: 98,
  isPremium: false,
  matchesPlayed: 32,
  winRate: 68,
  joinedDate: 'Tháng 8/2026',
}

const initialMatches: MatchRoom[] = [
  {
    id: 'MM-9023',
    title: '🔥 ĐÔI NAM NỮ (Cần 1 người)',
    courtId: 'court_3',
    courtName: 'Cụm sân D-Sports Pickleball',
    courtSubName: 'Sân số 3 (Trong nhà)',
    surfaceType: 'Trong nhà',
    address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
    distanceKm: 1.4,
    slotNumber: 9,
    timeRange: '18:00 - 19:30',
    dateStr: 'Hôm nay, 13/10/2026',
    format: 'doubles',
    targetDuprMin: 2.5,
    targetDuprMax: 3.0,
    currentPlayers: 3,
    maxPlayers: 4,
    depositFee: 45000,
    status: 'OPEN',
    amenities: ['2 quả bóng tiêu chuẩn', 'Nước uống miễn phí', 'Mượn vợt miễn phí'],
    note: 'Giao lưu vui vẻ, đề nghị đến trước 10 phút để khởi động và làm quen.',
    qrToken: 'PKB-1310-8849',
    isBookedByMe: true,
    participants: [
      {
        id: 'usr_p1',
        name: 'Trần Văn Hùng (Host)',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        dupr: 2.85,
        reputationScore: 98,
        isHost: true,
        isDeposited: true,
      },
      {
        id: 'usr_p2',
        name: 'Lê Thị Mai',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        dupr: 2.6,
        reputationScore: 95,
        isDeposited: true,
      },
      {
        id: 'usr_me',
        name: 'Bạn (Nguyễn An)',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        dupr: 2.75,
        reputationScore: 100,
        isDeposited: true,
        isCurrentUser: true,
      },
    ],
  },
  {
    id: 'MM-9024',
    title: '⚡ ĐÔI NAM PHONG TRÀO TRÌNH ĐỘ CAO',
    courtId: 'court_thuthiem_2',
    courtName: 'Cụm sân Thủ Thiêm Sports Hub',
    courtSubName: 'Sân số 2 (Ngoài trời)',
    surfaceType: 'Ngoài trời',
    address: 'Khu đô thị An Phú - An Khánh, TP. Thủ Đức',
    distanceKm: 3.2,
    slotNumber: 8,
    timeRange: '16:30 - 18:00',
    dateStr: 'Ngày mai, 14/10/2026',
    format: 'doubles',
    targetDuprMin: 3.5,
    targetDuprMax: 4.0,
    currentPlayers: 2,
    maxPlayers: 4,
    depositFee: 55000,
    status: 'OPEN',
    amenities: ['Bóng thi đấu Franklin X-40', 'Nước chanh muối'],
    note: 'Thi đấu rèn luyện dink shot và drop shot tốc độ cao. Cần kinh nghiệm.',
    participants: [
      {
        id: 'usr_p3',
        name: 'Đặng Tuấn Kiệt',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        dupr: 3.85,
        reputationScore: 99,
        isHost: true,
        isDeposited: true,
      },
      {
        id: 'usr_p4',
        name: 'Vũ Hoàng Quân',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        dupr: 3.65,
        reputationScore: 96,
        isDeposited: true,
      },
    ],
  },
  {
    id: 'MM-9025',
    title: '👑 VIP EARLY ACCESS - ĐÔI NAM NỮ KÈO VÀNG',
    courtId: 'court_thaodien_1',
    courtName: 'Thảo Điền Pickleball Club',
    courtSubName: 'Sân 1 (Trong nhà máy lạnh)',
    surfaceType: 'Trong nhà',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    distanceKm: 4.8,
    slotNumber: 9,
    timeRange: '18:00 - 19:30',
    dateStr: 'Hôm nay, 13/10/2026',
    format: 'doubles',
    targetDuprMin: 3.0,
    targetDuprMax: 3.5,
    currentPlayers: 4,
    maxPlayers: 4,
    depositFee: 65000,
    status: 'FULL',
    isVipEarlyAccess: true,
    amenities: ['Sân máy lạnh chuẩn quốc tế', 'Trọng tài giám sát', 'Thức uống điện giải'],
    qrToken: 'PKB-1310-9901',
    participants: [
      { id: 'usr_p5', name: 'Trần Gia Bảo', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', dupr: 3.3, reputationScore: 100, isHost: true },
      { id: 'usr_p6', name: 'Nguyễn Bích Ngọc', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', dupr: 3.1, reputationScore: 97 },
      { id: 'usr_p7', name: 'Phạm Đức Anh', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', dupr: 3.4, reputationScore: 98 },
      { id: 'usr_p8', name: 'Vũ Thảo Vy', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', dupr: 3.2, reputationScore: 99 },
    ],
  },
  {
    id: 'MM-9026',
    title: '🎾 GIAO LƯU BUỔI SÁNG SƠ CẤP & HỌC HỎI',
    courtId: 'court_vinhomes_1',
    courtName: 'Cụm sân Vinhomes Grand Park',
    courtSubName: 'Sân 4 (Ngoài trời)',
    surfaceType: 'Ngoài trời',
    address: 'Phân khu The Rainbow, P. Long Thạnh Mỹ, TP. Thủ Đức',
    distanceKm: 5.5,
    slotNumber: 1,
    timeRange: '06:00 - 07:30',
    dateStr: 'Ngày mai, 14/10/2026',
    format: 'doubles',
    targetDuprMin: 2.0,
    targetDuprMax: 2.5,
    currentPlayers: 1,
    maxPlayers: 4,
    depositFee: 35000,
    status: 'OPEN',
    amenities: ['Bóng tập luyện', 'Hỗ trợ mượn vợt beginner'],
    participants: [
      { id: 'usr_p9', name: 'Lâm Quốc Thái', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', dupr: 2.15, reputationScore: 94, isHost: true },
    ],
  },
]

const makeCourtSlots = (
  basePrice: number,
  overrides: Record<number, Partial<CourtInventory['slots'][number]>> = {},
): CourtInventory['slots'] => COURT_SLOT_TIMES.map((slot) => ({
  slotNumber: slot.slotNumber,
  timeRange: slot.timeRange,
  status: 'AVAILABLE' as const,
  price: basePrice + (slot.slotNumber >= 9 ? 40000 : slot.slotNumber >= 7 ? 20000 : 0),
  isPeak: slot.slotNumber >= 9,
  ...overrides[slot.slotNumber],
}))

const initialCourts: CourtInventory[] = [
  {
    id: 'court_1',
    name: 'SÂN 1 (Trong nhà)',
    courtType: 'indoor',
    slots: makeCourtSlots(150000, {
      2: { status: 'COACHING', bookedNote: 'Lớp Coach · 4 học viên', bookedByName: 'HLV Tuấn Kiệt', bookedPhone: '0908.112.233', bookingStatus: 'Đã xác nhận' },
      7: { status: 'MATCH_PUBLISHED', matchTitle: 'Kèo Social Sơ cấp', duprRange: 'DUPR 2.0-2.5', playersCount: '3/4', bookingStatus: 'Đang mở' },
      8: { status: 'PRIVATE_BOOKED', bookedNote: 'Khách bao riêng tại quầy', bookedByName: 'Anh Thành', bookedPhone: '0918.334.455', bookingStatus: 'Đã xác nhận' },
      9: { status: 'MATCH_PUBLISHED', matchTitle: 'Kèo Đôi Nam Nữ Hot', duprRange: 'DUPR 3.5-4.0', playersCount: '4/4', bookingStatus: 'Đã đủ người' },
    }),
  },
  {
    id: 'court_2',
    name: 'SÂN 2 (Trong nhà)',
    courtType: 'indoor',
    slots: makeCourtSlots(150000, {
      8: { status: 'MATCH_PUBLISHED', matchTitle: 'Kèo Phong Trào', duprRange: 'DUPR 3.0-3.5', playersCount: '4/4', bookingStatus: 'Đã đủ người' },
      9: { status: 'MATCH_PUBLISHED', matchTitle: 'Kèo Giờ Vàng Giao Lưu', duprRange: 'DUPR 2.5-3.0', playersCount: '4/4', bookingStatus: 'Đã đủ người' },
    }),
  },
  {
    id: 'court_3',
    name: 'SÂN 3 (Ngoài trời)',
    courtType: 'outdoor',
    slots: makeCourtSlots(140000, {
      1: { status: 'MAINTENANCE', price: 0, bookedNote: 'Bảo trì lưới & vệ sinh', maintenanceReason: 'Bảo trì lưới & vệ sinh' },
      9: { status: 'PRIVATE_BOOKED', bookedNote: 'Khách cọc qua App', bookedByName: 'Chị Lan', bookedPhone: '0933.778.899', bookingStatus: 'Đã xác nhận' },
    }),
  },
]

const checkInPlayers = [
  {
    id: 'usr_p1',
    name: 'Trần Văn Hùng',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Host',
    checkedInAt: '18:18',
  },
  {
    id: 'usr_p2',
    name: 'Lê Thị Mai',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    checkedInAt: '18:21',
  },
  {
    id: 'usr_me',
    name: 'Nguyễn An',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: 'usr_p8',
    name: 'Vũ Thảo Vy',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
]

const initialCheckInTickets: CheckInTicket[] = [
  {
    code: 'PKB-1310-8849',
    venueName: 'D-Sports Pickleball Thủ Đức',
    courtName: 'Sân 3',
    slotNumber: 9,
    timeRange: '18:00 - 19:30',
    dateStr: 'Hôm nay, 13/10/2026',
    matchLabel: 'Đôi nam nữ',
    duprRange: 'DUPR 2.5 - 3.0',
    holderId: 'usr_me',
    scenario: 'VALID',
    participants: checkInPlayers,
  },
  {
    code: 'PKB-1310-7721',
    venueName: 'D-Sports Pickleball Thủ Đức',
    courtName: 'Sân 1',
    slotNumber: 9,
    timeRange: '18:00 - 19:30',
    dateStr: 'Hôm nay, 13/10/2026',
    matchLabel: 'Đôi nam phong trào',
    duprRange: 'DUPR 3.5 - 4.0',
    holderId: 'usr_p1',
    scenario: 'ALREADY_CHECKED_IN',
    participants: checkInPlayers.map((player) =>
      player.id === 'usr_p1' ? { ...player, checkedInAt: '18:22' } : player,
    ),
  },
  {
    code: 'PKB-1310-4404',
    venueName: 'Thủ Thiêm Sports Hub',
    courtName: 'Sân 2',
    slotNumber: 8,
    timeRange: '16:30 - 18:00',
    dateStr: 'Hôm nay, 13/10/2026',
    matchLabel: 'Đôi nam nữ',
    duprRange: 'DUPR 3.0 - 3.5',
    holderId: 'usr_me',
    scenario: 'WRONG_VENUE',
    participants: checkInPlayers,
  },
  {
    code: 'PKB-1310-0650',
    venueName: 'D-Sports Pickleball Thủ Đức',
    courtName: 'Sân 2',
    slotNumber: 1,
    timeRange: '06:00 - 07:30',
    dateStr: 'Ngày mai, 14/10/2026',
    matchLabel: 'Giao lưu buổi sáng',
    duprRange: 'DUPR 2.0 - 2.5',
    holderId: 'usr_me',
    scenario: 'WRONG_TIME',
    participants: checkInPlayers.map((player) => ({ ...player, checkedInAt: undefined })),
  },
]

const initialCheckInLogs: CheckInLog[] = [
  {
    id: 'log_1825',
    time: '18:25',
    courtName: 'Sân 1',
    description: 'Kèo DUPR 3.5 · 4/4 người đã check-in',
    tone: 'success',
  },
  {
    id: 'log_1820',
    time: '18:20',
    courtName: 'Sân 2',
    description: 'Khách bao riêng: Anh Thành · Đã vào sân',
    tone: 'info',
  },
]

const initialCoachCourses: CoachCourse[] = [
  {
    id: 'COURSE-DUNG-01',
    title: 'Boot Camp Bứt Phá DUPR 3.5',
    coachId: 'coach_dung',
    coachName: 'HLV Lê Hoàng Dũng',
    duration: '1 tháng (8 buổi)',
    frequency: '2 buổi/tuần (T4 - T6, Slot 9)',
    venue: 'D-Pickleball Thảo Điền',
    fee: 2400000,
    currentStudents: 4,
    maxStudents: 4,
    completedSessions: 7,
    totalSessions: 8,
    status: 'IN_PROGRESS',
    courseType: 'GROUP_4',
    duprInput: '2.50 - 3.00',
    duprOutput: '3.50+',
    slotNumber: 9,
    timeRange: '18:00 - 19:30',
    scheduleDays: ['Thứ Tư', 'Thứ Sáu'],
    description: 'Lộ trình tăng tốc kỹ thuật dinking, third-shot drop và chiến thuật đánh đôi.',
    students: [
      { id: 'st_1', name: 'Trần Bảo', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', dupr: 2.75, attendance: 'present', serveScore: 8, dropShotScore: 8.5, dinkScore: 8, finalDupr: 3.45, feedback: 'Bộ chân linh hoạt, kiểm soát bóng tốt. Cần giữ nhịp ổn định ở bóng thứ ba.' },
      { id: 'st_2', name: 'Lê Hoàng Yến', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', dupr: 2.8, attendance: 'present', serveScore: 8.5, dropShotScore: 8, dinkScore: 8.5, finalDupr: 3.52, feedback: 'Tiến bộ rõ ở khu vực kitchen và có khả năng điều tiết rally.' },
      { id: 'st_3', name: 'Phạm Thành Long', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', dupr: 2.65, attendance: 'absent', serveScore: 7.5, dropShotScore: 7, dinkScore: 7.5, finalDupr: 3.2, feedback: 'Cần bổ sung buổi khảo thí bù để xác nhận kết quả đầu ra.' },
      { id: 'st_4', name: 'Đỗ Quỳnh Chi', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', dupr: 2.9, attendance: 'present', serveScore: 9, dropShotScore: 8.5, dinkScore: 9, finalDupr: 3.61, feedback: 'Đạt cam kết đầu ra, xử lý dink chéo sân rất tốt.' },
    ],
  },
  {
    id: 'COURSE-DUNG-02',
    title: 'PT 1-1 Nâng Cao Dinking & Drop Shot',
    coachId: 'coach_dung',
    coachName: 'HLV Lê Hoàng Dũng',
    duration: '4 buổi chuyên sâu',
    frequency: '1 buổi/tuần (Thứ Tư, Slot 2)',
    venue: 'Saigon Rackets An Phú',
    fee: 1800000,
    currentStudents: 1,
    maxStudents: 1,
    completedSessions: 2,
    totalSessions: 4,
    status: 'IN_PROGRESS',
    courseType: 'PT_1ON1',
    duprInput: '3.00 - 3.50',
    duprOutput: '3.80+',
    slotNumber: 2,
    timeRange: '07:30 - 09:00',
    scheduleDays: ['Thứ Tư'],
    description: 'Giáo án cá nhân hóa cho kỹ thuật chuyển vùng và kiểm soát bóng mềm.',
    students: [
      { id: 'st_5', name: 'Nguyễn Minh Khôi', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', dupr: 3.15, attendance: 'present', serveScore: 7.5, dropShotScore: 8, dinkScore: 8, feedback: 'Đã giữ được rally 20 chạm, tiếp tục cải thiện split step.' },
    ],
  },
  {
    id: 'COURSE-DUNG-03',
    title: 'Chiến Thuật Đánh Đôi DUPR 3.0+',
    coachId: 'coach_dung',
    coachName: 'HLV Lê Hoàng Dũng',
    duration: '1 tháng (8 buổi)',
    frequency: '2 buổi/tuần (T3 - T5, Slot 7)',
    venue: 'D-Pickleball Thảo Điền',
    fee: 2200000,
    currentStudents: 2,
    maxStudents: 4,
    completedSessions: 0,
    totalSessions: 8,
    status: 'RECRUITING',
    courseType: 'GROUP_4',
    duprInput: '2.80 - 3.20',
    duprOutput: '3.50+',
    slotNumber: 7,
    timeRange: '15:00 - 16:30',
    scheduleDays: ['Thứ Ba', 'Thứ Năm'],
    description: 'Đọc tình huống, di chuyển theo cặp và chuyển trạng thái tấn công/phòng thủ.',
    students: [
      { id: 'st_6', name: 'Trần Hải Đăng', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', dupr: 3.05, attendance: 'present' },
      { id: 'st_7', name: 'Ngô Kim Ngân', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', dupr: 3.1, attendance: 'present' },
    ],
  },
]

const initialCoachAccount: CoachAccount = {
  id: 'coach_dung',
  name: 'HLV Lê Hoàng Dũng',
  avatarUrl: coachMale,
  email: 'lehoangdung@fitlyo.vn',
  phone: '0909 485 285',
  duprRating: 4.85,
  rating: 4.9,
  reviewCount: 86,
  experienceYears: 6,
  verificationStatus: 'APPROVED',
  certificateTitle: 'IPTPA Level 2',
  certificateCode: 'IPTPA-VN-L2-0485',
  certificateExpiry: '30/09/2028',
  bio: 'Huấn luyện viên chuyên xây nền tảng kỹ thuật và lộ trình tăng hạng DUPR cho người chơi phong trào. Giáo án tập trung vào tính ứng dụng, phản hồi theo dữ liệu và tiến bộ bền vững.',
  specialties: ['Dinking & Drop shot', 'Chiến thuật đánh đôi', 'Lộ trình DUPR 2.5 → 3.5'],
  serviceAreas: ['Thảo Điền', 'An Phú', 'Thủ Đức'],
  ratePerSession: 450000,
  ratePerCourse: 2400000,
  bankName: 'Vietcombank',
  bankAccountMasked: '•••• •••• 7285',
}

const initialCoachAffiliations: CoachVenueAffiliation[] = [
  {
    id: 'AFF-001',
    venueId: 'ven_1',
    coachId: 'coach_dung',
    venueName: 'Cụm sân D-Sports Pickleball Thủ Đức',
    address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
    distanceKm: 4.2,
    linkType: 'FM_DIRECT_ADD',
    status: 'ACTIVE',
    requestedAt: '2026-09-02T08:30:00.000Z',
    linkedAt: '2026-09-02T08:30:00.000Z',
    createdBy: 'fm_dsports',
    discountPercent: 15,
    activeCourses: 2,
    availableSlots: [1, 2, 4, 5, 6],
  },
  {
    id: 'AFF-002',
    venueId: 'ven_3',
    coachId: 'coach_dung',
    venueName: 'D-Pickleball Thảo Điền',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    distanceKm: 2.1,
    linkType: 'COACH_REQUEST',
    status: 'ACTIVE',
    requestedAt: '2026-09-12T09:00:00.000Z',
    linkedAt: '2026-09-15T04:00:00.000Z',
    createdBy: 'coach_dung',
    discountPercent: 10,
    activeCourses: 1,
    availableSlots: [1, 2, 3, 4],
  },
  {
    id: 'AFF-003',
    venueId: 'ven_2',
    coachId: 'coach_dung',
    venueName: 'Thủ Thiêm Sports Hub',
    address: 'Khu đô thị An Phú - An Khánh, TP. Thủ Đức',
    distanceKm: 4.8,
    linkType: 'COACH_REQUEST',
    status: 'PENDING',
    requestedAt: '2026-10-13T03:30:00.000Z',
    createdBy: 'coach_dung',
    activeCourses: 0,
    availableSlots: [2, 4, 6],
  },
  {
    id: 'AFF-004',
    venueId: 'ven_1',
    coachId: 'coach_long',
    venueName: 'Cụm sân D-Sports Pickleball Thủ Đức',
    address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
    distanceKm: 3.6,
    linkType: 'COACH_REQUEST',
    status: 'PENDING',
    requestedAt: '2026-10-16T02:15:00.000Z',
    createdBy: 'coach_long',
    activeCourses: 0,
    availableSlots: [2, 5, 8],
  },
  {
    id: 'AFF-005',
    venueId: 'ven_1',
    coachId: 'coach_minhanh',
    venueName: 'Cụm sân D-Sports Pickleball Thủ Đức',
    address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
    distanceKm: 7.4,
    linkType: 'COACH_REQUEST',
    status: 'INACTIVE',
    requestedAt: '2026-08-18T07:00:00.000Z',
    linkedAt: '2026-08-19T03:20:00.000Z',
    createdBy: 'coach_minhanh',
    activeCourses: 0,
    availableSlots: [1, 4, 7],
  },
]

const initialCoachAffiliationNotifications: CoachAffiliationNotification[] = [
  {
    id: 'AFF-NOTICE-001',
    recipientId: 'coach_dung',
    message: 'Cụm sân D-Sports Pickleball Thủ Đức đã thêm bạn vào danh sách HLV liên kết.',
    createdAt: '2026-10-16T08:30:00.000Z',
    tone: 'success',
  },
  {
    id: 'AFF-NOTICE-002',
    recipientId: 'fm:ven_1',
    message: 'HLV Nguyễn Hoàng Long vừa gửi yêu cầu liên kết với cụm sân.',
    createdAt: '2026-10-16T02:15:00.000Z',
    tone: 'info',
  },
]

const coachAffiliationsStorageKey = 'fitlyo-coach-venue-affiliations-v1'
const coachAffiliationNotificationsStorageKey = 'fitlyo-coach-affiliation-notifications-v1'

const readCoachAffiliations = (): CoachVenueAffiliation[] => {
  if (typeof window === 'undefined') return initialCoachAffiliations

  try {
    const raw = window.localStorage.getItem(coachAffiliationsStorageKey)
    if (!raw) return initialCoachAffiliations
    const stored = JSON.parse(raw) as Array<Omit<Partial<CoachVenueAffiliation>, 'status'> & { status?: string; approvedAt?: string }>
    if (!Array.isArray(stored)) return initialCoachAffiliations

    return stored.map((item) => ({
      ...item,
      linkType: item.linkType ?? 'COACH_REQUEST',
      status: item.status === 'APPROVED' ? 'ACTIVE' : item.status,
      linkedAt: item.linkedAt ?? item.approvedAt,
      createdBy: item.createdBy ?? item.coachId ?? 'system',
      activeCourses: item.activeCourses ?? 0,
      availableSlots: item.availableSlots ?? [],
    })) as CoachVenueAffiliation[]
  } catch {
    return initialCoachAffiliations
  }
}

const readCoachAffiliationNotifications = (): CoachAffiliationNotification[] => {
  if (typeof window === 'undefined') return initialCoachAffiliationNotifications
  try {
    const raw = window.localStorage.getItem(coachAffiliationNotificationsStorageKey)
    if (!raw) return initialCoachAffiliationNotifications
    const stored = JSON.parse(raw) as CoachAffiliationNotification[]
    return Array.isArray(stored) ? stored : initialCoachAffiliationNotifications
  } catch {
    return initialCoachAffiliationNotifications
  }
}

const persistCoachAffiliations = (affiliations: CoachVenueAffiliation[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(coachAffiliationsStorageKey, JSON.stringify(affiliations))
  }
}

const persistCoachAffiliationNotifications = (notifications: CoachAffiliationNotification[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(coachAffiliationNotificationsStorageKey, JSON.stringify(notifications))
  }
}

const initialCoachWalletTransactions: CoachWalletTransaction[] = [
  { id: 'TX-8841', coachId: 'coach_dung', date: '14/10/2026', description: 'Giải ngân buổi 7/8', courseName: 'Boot Camp Bứt Phá DUPR 3.5', amount: 1080000, type: 'RELEASE', status: 'COMPLETED' },
  { id: 'TX-8838', coachId: 'coach_dung', date: '13/10/2026', description: 'Học phí học viên Ngô Kim Ngân', courseName: 'Chiến Thuật Đánh Đôi DUPR 3.0+', amount: 2200000, type: 'ESCROW_IN', status: 'HELD' },
  { id: 'TX-8832', coachId: 'coach_dung', date: '12/10/2026', description: 'Phí nền tảng 10%', courseName: 'PT 1-1 Nâng Cao Dinking & Drop Shot', amount: -180000, type: 'PLATFORM_FEE', status: 'COMPLETED' },
  { id: 'TX-8819', coachId: 'coach_dung', date: '10/10/2026', description: 'Rút tiền về Vietcombank •7285', courseName: 'Ví FITLYO Coach', amount: -4500000, type: 'WITHDRAWAL', status: 'COMPLETED' },
  { id: 'TX-8804', coachId: 'coach_dung', date: '08/10/2026', description: 'Giải ngân buổi 2/4', courseName: 'PT 1-1 Nâng Cao Dinking & Drop Shot', amount: 405000, type: 'RELEASE', status: 'COMPLETED' },
]

const initialCoachWalletSummary: CoachWalletSummary = {
  availableBalance: 6840000,
  escrowBalance: 14200000,
  pendingPayout: 2160000,
  earnedThisMonth: 12840000,
}

const initialCoaches: CoachItem[] = [
  {
    id: 'coach_dung',
    userId: 'COACH-DUNG-01',
    name: 'HLV LÊ HOÀNG DŨNG',
    avatarUrl: initialCoachAccount.avatarUrl,
    phone: '0909 485 285',
    duprRating: 4.85,
    isCertified: true,
    certTitle: 'Certified Coach (IPTPA Level 2)',
    rating: 4.9,
    reviewCount: 86,
    experienceYears: 6,
    achievements: 'HLV IPTPA Level 2, chuyên xây lộ trình tăng hạng DUPR cho người chơi phong trào.',
    serviceLocations: ['Thảo Điền', 'An Phú', 'Thủ Đức'],
    ratePerSession: 450000,
    ratePerMonthCourse: 2400000,
    specialties: ['Dinking & Drop shot', 'Chiến thuật đánh đôi', 'Lộ trình DUPR 2.5 → 3.5'],
    featuredCourse: 'Boot Camp Bứt Phá DUPR 3.5',
    isVipExclusive: false,
  },
  {
    id: 'coach_long',
    userId: 'COACH-LONG-01',
    name: 'HLV NGUYỄN HOÀNG LONG',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '0918 776 554',
    duprRating: 4.7,
    isCertified: true,
    certTitle: 'Certified Coach (PPR Level 2)',
    rating: 4.9,
    reviewCount: 48,
    experienceYears: 6,
    achievements: 'Cựu VĐV Thể thao Quốc gia, Huy chương Bạc Giải Vô địch Pickleball Đông Nam Á 2024.',
    serviceLocations: ['Thảo Điền', 'An Phú', 'Hiệp Phú (Thủ Đức)'],
    ratePerSession: 350000,
    ratePerMonthCourse: 2400000,
    specialties: ['Kỹ thuật Dink chuyên sâu', 'Drop shot chuyển đổi', 'Third-shot drop', 'Phòng thủ Reset'],
    featuredCourse: 'Khóa Chỉnh kỹ thuật Dink & Drop shot (Còn 1 slot)',
    isVipExclusive: true,
  },
  {
    id: 'coach_kiet',
    userId: 'COACH_VALID_99',
    name: 'HLV TRẦN TUẤN KIỆT',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phone: '0912 456 789',
    duprRating: 4.85,
    isCertified: true,
    certTitle: 'PPR Certified Level 2',
    rating: 4.95,
    reviewCount: 62,
    experienceYears: 8,
    achievements: 'Chứng chỉ HLV Quốc tế IPTPA, Đã đào tạo hơn 200 học viên đạt mốc DUPR 3.0+.',
    serviceLocations: ['D-Sports Thủ Đức', 'Thủ Thiêm Sports Hub'],
    ratePerSession: 400000,
    ratePerMonthCourse: 2600000,
    specialties: ['Làm quen DUPR 2.0', 'Kỹ thuật Serve & Return', 'Chiến thuật Đánh đôi'],
    featuredCourse: 'Pickleball Căn bản & Làm quen DUPR 2.0',
    isVipExclusive: false,
  },
  {
    id: 'coach_minhanh',
    userId: 'COACH-MINHANH-02',
    name: 'HLV TRẦN MINH ANH',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '0938 214 602',
    duprRating: 3.88,
    isCertified: true,
    certTitle: 'Certified Coach (PPR Level 1)',
    rating: 4.8,
    reviewCount: 29,
    experienceYears: 3,
    achievements: 'Chuyên gia huấn luyện thể lực & phản xạ lưới cho người mới bắt đầu.',
    serviceLocations: ['Vinhomes Grand Park', 'Long Thạnh Mỹ'],
    ratePerSession: 300000,
    ratePerMonthCourse: 2000000,
    specialties: ['Tập phản xạ lưới', 'Footwork di chuyển', 'Kỹ thuật Volley'],
    featuredCourse: 'Khóa Nhập môn Thể lực & Di chuyển Pickleball',
    isVipExclusive: false,
  },
]

const initialAuditApps: AuditApplication[] = [
  {
    id: 'FM-APP-0128',
    type: 'VENUE',
    title: 'Cụm sân Pickleball Vinhomes Grand Park',
    ownerName: 'Công ty TNHH Thể Thao Ngôi Sao Mới (Đại diện: Trần Quốc Bảo)',
    phone: '0903.889.911',
    address: 'Phân khu The Rainbow, Vinhomes Grand Park, P. Long Thạnh Mỹ, TP. Thủ Đức',
    details: 'Khai báo quy mô 6 sân tiêu chuẩn thi đấu (4 sân ngoài trời, 2 sân có mái che).',
    documents: [
      { id: 'doc_1', name: 'GPKD_SaoY_CongTyNgoiSaoMoi.pdf', type: 'pdf', fileSize: '2.4 MB' },
      { id: 'doc_2', name: 'HopDongThueMatBang_Vinhomes.pdf', type: 'pdf', fileSize: '4.8 MB' },
      { id: 'doc_3', name: 'AnhThucTeSan_HeThongDenVaLuoi.jpg', type: 'jpg', fileSize: '3.1 MB' },
    ],
    status: 'PENDING',
    inspectorNotes: 'Đã gọi điện xác minh mặt bằng, địa chỉ chính xác, đủ điều kiện an toàn thể thao.',
    submittedDate: '12/10/2026',
  },
  {
    id: 'COACH-APP-0091',
    type: 'COACH',
    title: 'Hồ sơ Thẩm định Chứng chỉ HLV Nguyễn Hoàng Long',
    ownerName: 'Nguyễn Hoàng Long',
    phone: '0918.776.554',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    details: 'Đăng ký HLV Certified cấp độ PPR Level 2 với 6 năm thâm niên thi đấu.',
    documents: [
      { id: 'doc_4', name: 'ChungChi_PPR_Level2_Original.pdf', type: 'pdf', fileSize: '1.8 MB' },
      { id: 'doc_5', name: 'CCCD_GanChip_HaiMat.jpg', type: 'jpg', fileSize: '1.2 MB' },
      { id: 'doc_6', name: 'SoYeuLyLich_ThanhTichThiDau.pdf', type: 'pdf', fileSize: '3.5 MB' },
    ],
    status: 'PENDING',
    inspectorNotes: 'Mã số chứng chỉ PPR đã kiểm tra trên cổng Professional Pickleball Registry hợp lệ.',
    submittedDate: '11/10/2026',
  },
  {
    id: 'FM-APP-0127',
    type: 'VENUE',
    title: 'Cụm sân D-Sports Pickleball Thủ Đức',
    ownerName: 'D-Sports Sports Center',
    phone: '0908.112.233',
    address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
    details: '4 sân tiêu chuẩn, đèn chiếu sáng ban đêm, phòng thay đồ máy lạnh.',
    documents: [
      { id: 'doc_7', name: 'GiayPhepHoatDongTheThao.pdf', type: 'pdf', fileSize: '1.5 MB' },
    ],
    status: 'APPROVED',
    inspectorNotes: 'Cụm sân đạt chuẩn, đã ký cam kết vận hành 10 slot/ngày với sàn FITLYO.',
    submittedDate: '01/10/2026',
  },
]

const auditApplicationsStorageKey = 'fitlyo-audit-applications'

const readAuditApplications = (): AuditApplication[] => {
  if (typeof window === 'undefined') return initialAuditApps
  try {
    const raw = window.localStorage.getItem(auditApplicationsStorageKey)
    if (!raw) return initialAuditApps
    const stored = JSON.parse(raw) as AuditApplication[]
    return Array.isArray(stored) ? stored : initialAuditApps
  } catch {
    return initialAuditApps
  }
}

const persistAuditApplications = (applications: AuditApplication[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(auditApplicationsStorageKey, JSON.stringify(applications))
  }
}

const initialVenues: VenueItem[] = [
  {
    id: 'ven_1',
    name: 'Cụm sân D-Sports Pickleball Thủ Đức',
    address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
    area: 'Linh Chiểu, Thủ Đức',
    totalCourts: 4,
    availableSlotsToday: 8,
    rating: 4.8,
    reviewCount: 124,
    amenities: ['Mặt sân trong nhà', 'Đèn LED thi đấu', 'Phòng tắm nước nóng', 'Căng tin'],
    imageUrl: venueIndoor,
    priceRange: '150.000đ - 220.000đ/slot 90p',
  },
  {
    id: 'ven_2',
    name: 'Cụm sân Thủ Thiêm Sports Hub',
    address: 'Khu đô thị An Phú - An Khánh, TP. Thủ Đức',
    area: 'An Phú, Thủ Đức',
    totalCourts: 6,
    availableSlotsToday: 12,
    rating: 4.9,
    reviewCount: 89,
    amenities: ['Mặt sân ngoài trời & mái che', 'Bãi đậu ô tô rộng', 'Khu vực khán giả'],
    imageUrl: communityHero,
    priceRange: '160.000đ - 240.000đ/slot 90p',
  },
  {
    id: 'ven_3',
    name: 'D-Pickleball Thảo Điền',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền, Thủ Đức',
    totalCourts: 5,
    availableSlotsToday: 6,
    rating: 4.95,
    reviewCount: 156,
    amenities: ['Sân máy lạnh khép kín', 'Quầy bar sinh tố', 'Pro Shop bán vợt & bóng'],
    imageUrl: matchNewbie,
    priceRange: '200.000đ - 300.000đ/slot 90p',
  },
  {
    id: 'ven_4',
    name: 'Cụm sân Pickleball Vinhomes Grand Park',
    address: 'Phân khu The Rainbow, P. Long Thạnh Mỹ, TP. Thủ Đức',
    area: 'Long Thạnh Mỹ, Thủ Đức',
    totalCourts: 6,
    availableSlotsToday: 15,
    rating: 4.7,
    reviewCount: 64,
    amenities: ['Không gian công viên thoáng đãng', 'Mặt sân giảm chấn', 'Kiosk check-in'],
    imageUrl: matchWeekend,
    priceRange: '130.000đ - 180.000đ/slot 90p',
  },
]

export const useFitlyoStore = create<FitlyoState>((set, get) => ({
  colorMode: initialColorMode,
  currentUser: initialUser,
  isLoggedIn: false,

  setLoggedIn: (val: boolean) => set({ isLoggedIn: val }),
  handleLogout: () => set({ isLoggedIn: false }),
  updateUserProfile: (profile: Partial<UserAccount>) =>
    set((state) => ({ currentUser: { ...state.currentUser, ...profile } })),
  setDuprRating: (rating: number) =>
    set((state) => ({ currentUser: { ...state.currentUser, duprRating: rating } })),

  isSidebarOpen: true,
  notificationCount: 3,

  matches: initialMatches,
  selectedMatchId: 'MM-9023',
  feedFilter: {
    search: '',
    duprMin: 2.0,
    duprMax: 4.0,
    onlyFitDupr: false,
    eveningOnly: false,
    nearMeOnly: false,
    activeTab: 'open',
  },
  isFeedLoading: false,

  selectedDate: '13/10/2026',
  courtInventory: initialCourts,
  isPublishModalOpen: false,
  publishingSlotData: null,
  isWalkInModalOpen: false,
  walkInSlotData: null,
  checkInTickets: initialCheckInTickets,
  checkInLogs: initialCheckInLogs,

  coachAccount: initialCoachAccount,
  coachCourses: initialCoachCourses,
  coaches: initialCoaches,
  coachAffiliations: readCoachAffiliations(),
  coachAffiliationNotifications: readCoachAffiliationNotifications(),
  coachWalletTransactions: initialCoachWalletTransactions,
  coachWalletSummary: initialCoachWalletSummary,

  auditApplications: readAuditApplications(),
  selectedAuditId: 'FM-APP-0128',

  venues: initialVenues,
  toastMessage: null,

  toggleColorMode: () => {
    const nextMode: ColorMode = get().colorMode === 'light' ? 'dark' : 'light'
    window.localStorage.setItem(colorModeStorageKey, nextMode)
    applyColorMode(nextMode)
    set({ colorMode: nextMode })
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  togglePremium: () => {
    set((state) => {
      const nextPremium = !state.currentUser.isPremium
      return {
        currentUser: { ...state.currentUser, isPremium: nextPremium },
      }
    })
    const isNow = get().currentUser.isPremium
    get().showToast(
      isNow
        ? 'Chúc mừng! Bạn đã kích hoạt gói FITLYO Premium (VIP Early Access)'
        : 'Đã chuyển về gói thành viên Tiêu chuẩn (Free)',
      'success'
    )
  },

  setFeedFilter: (newFilter) =>
    set((state) => ({
      feedFilter: { ...state.feedFilter, ...newFilter },
    })),

  setIsFeedLoading: (loading) => set({ isFeedLoading: loading }),

  selectMatch: (id) => set({ selectedMatchId: id }),

  joinMatchRoom: (matchId) => {
    const { matches, currentUser } = get()
    const target = matches.find((m) => m.id === matchId)
    if (!target) return false

    if (target.currentPlayers >= target.maxPlayers) {
      get().showToast('Phòng vừa đủ người cách đây vài giây!', 'error')
      return false
    }

    const alreadyJoined = target.participants.some((p) => p.id === currentUser.id)
    if (alreadyJoined) {
      get().showToast('Bạn đã giữ chỗ trong phòng này rồi.', 'info')
      return true
    }

    const nextCount = target.currentPlayers + 1
    const isFull = nextCount >= target.maxPlayers

    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          currentPlayers: nextCount,
          status: isFull ? ('FULL' as const) : ('OPEN' as const),
          qrToken: isFull ? `PKB-1310-${Math.floor(1000 + Math.random() * 9000)}` : m.qrToken,
          isBookedByMe: true,
          participants: [
            ...m.participants,
            {
              id: currentUser.id,
              name: `Bạn (${currentUser.name})`,
              avatarUrl: currentUser.avatarUrl,
              dupr: currentUser.duprRating,
              reputationScore: currentUser.reputationScore,
              isDeposited: true,
              isCurrentUser: true,
            },
          ],
        }
      }
      return m
    })

    set({ matches: updatedMatches })
    get().showToast(
      isFull
        ? 'Phòng đã đủ 4 người! Vé QR Check-in điện tử đã sẵn sàng.'
        : `Giữ chỗ thành công! Đã cọc ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(target.depositFee)}`,
      'success'
    )
    return true
  },

  cancelMatchHold: (matchId) => {
    const { matches, currentUser } = get()
    const target = matches.find((m) => m.id === matchId)
    if (!target) return false

    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        const remaining = m.participants.filter((p) => p.id !== currentUser.id)
        return {
          ...m,
          currentPlayers: Math.max(1, m.currentPlayers - 1),
          status: 'OPEN' as const,
          isBookedByMe: false,
          participants: remaining,
        }
      }
      return m
    })

    set({ matches: updatedMatches })
    get().showToast(
      currentUser.isPremium
        ? 'Hủy giữ chỗ thành công. Hoàn 100% tiền cọc về ví (Chính sách VIP trước 4h).'
        : 'Hủy giữ chỗ thành công. Hoàn cọc 100% (Báo trước 12h theo quy định).',
      'info'
    )
    return true
  },

  openPublishModal: (slot) =>
    set({ isPublishModalOpen: true, publishingSlotData: slot }),

  closePublishModal: () =>
    set({ isPublishModalOpen: false, publishingSlotData: null }),

  openWalkInModal: (slot) =>
    set({ isWalkInModalOpen: true, walkInSlotData: slot }),

  closeWalkInModal: () =>
    set({ isWalkInModalOpen: false, walkInSlotData: null }),

  publishSlotAsMatch: (data) => {
    const { courtInventory, matches } = get()
    if (!socialMatchCapacities.includes(data.maxPlayers as (typeof socialMatchCapacities)[number])) {
      get().showToast('Số lượng Player chỉ được chọn 4, 6, 8, 10 hoặc 12.', 'error')
      return
    }
    const targetSlot = courtInventory
      .find((court) => court.id === data.courtId)
      ?.slots.find((slot) => slot.slotNumber === data.slotNumber)
    if (!targetSlot || targetSlot.status !== 'AVAILABLE') {
      get().showToast('Slot không còn trống để công bố kèo Social.', 'error')
      return
    }
    const maxPlayers = data.maxPlayers
    const newMatchId = `MM-${Math.floor(9000 + Math.random() * 900)}`

    // Update court slot status to MATCH_PUBLISHED
    const updatedCourts = courtInventory.map((court) => {
      if (court.id === data.courtId) {
        return {
          ...court,
          slots: court.slots.map((s) => {
            if (s.slotNumber === data.slotNumber) {
              return {
                ...s,
                status: 'MATCH_PUBLISHED' as const,
                matchTitle: `Kèo Social DUPR ${data.duprMin}-${data.duprMax}`,
                matchRoomId: newMatchId,
                duprRange: `DUPR ${data.duprMin}-${data.duprMax}`,
                playersCount: `0/${maxPlayers}`,
              }
            }
            return s
          }),
        }
      }
      return court
    })

    // Create a new match room in feed
    const targetCourt = courtInventory.find((c) => c.id === data.courtId)
    const timeRange = COURT_SLOT_TIMES.find((slot) => slot.slotNumber === data.slotNumber)?.timeRange

    const newMatch: MatchRoom = {
      id: newMatchId,
      title: `⚡ KÈO SOCIAL CÔNG BỐ MỚI (${data.format === 'doubles' ? 'ĐÔI' : 'ĐƠN'})`,
      courtId: data.courtId,
      courtName: 'Cụm sân D-Sports Pickleball',
      courtSubName: targetCourt ? targetCourt.name : 'Sân thi đấu',
      surfaceType: 'Trong nhà',
      address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
      distanceKm: 1.2,
      slotNumber: data.slotNumber,
      timeRange: timeRange ?? 'Chưa có dữ liệu',
      dateStr: 'Hôm nay, 13/10/2026',
      format: data.format,
      targetDuprMin: data.duprMin,
      targetDuprMax: data.duprMax,
      currentPlayers: 0,
      maxPlayers,
      depositFee: data.fee,
      status: 'OPEN',
      amenities: data.amenities,
      note: data.note,
      participants: [],
    }

    const [day, month, year] = get().selectedDate.split('/')
    usePlayerStore.getState().addFieldManagerMatch({
      id: newMatch.id,
      title: newMatch.title,
      label: 'KÈO DO FIELD MANAGER TẠO',
      venueId: 'venue-dsports-thu-duc',
      venueName: newMatch.courtName,
      courtName: newMatch.courtSubName,
      address: newMatch.address,
      area: 'Linh Chiểu',
      distanceKm: newMatch.distanceKm,
      imageUrl: venueIndoor,
      date: `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`,
      dateLabel: `Ngày ${get().selectedDate}`,
      slotNumber: newMatch.slotNumber,
      timeRange: newMatch.timeRange,
      format: data.format === 'doubles' ? 'Đôi nam nữ' : 'Giao lưu tự do',
      duprMin: newMatch.targetDuprMin,
      duprMax: newMatch.targetDuprMax,
      deposit: newMatch.depositFee,
      maxPlayers: newMatch.maxPlayers,
      status: 'OPEN',
      participants: [],
      amenities: newMatch.amenities,
      note: newMatch.note ?? '',
      isPeak: data.slotNumber >= 9,
    })

    set({
      courtInventory: updatedCourts,
      matches: [newMatch, ...matches],
      isPublishModalOpen: false,
      publishingSlotData: null,
    })

    get().showToast(
      `Đã công bố Kèo Social Slot ${data.slotNumber} lên bảng tin toàn hệ thống!`,
      'success'
    )
  },

  lockSlotAsPrivate: (courtId, slotNumber, contact) => {
    const updated = get().courtInventory.map((court) => {
      if (court.id === courtId) {
        return {
          ...court,
          slots: court.slots.map((s) =>
            s.slotNumber === slotNumber
              ? {
                  ...s,
                  status: 'PRIVATE_BOOKED' as const,
                  bookedNote: 'Khách bao riêng',
                  bookedContact: contact || 'Khách vãng lai',
                  bookingStatus: 'Đã xác nhận',
                }
              : s
          ),
        }
      }
      return court
    })
    set({ courtInventory: updated })
    get().showToast(`Đã khóa Slot ${slotNumber} thành Khách bao riêng.`, 'info')
  },

  createWalkInBooking: (data) => {
    const { walkInSlotData, courtInventory } = get()
    if (!walkInSlotData) return null

    const targetCourt = courtInventory.find((court) => court.id === walkInSlotData.courtId)
    const targetSlot = targetCourt?.slots.find(
      (slot) => slot.slotNumber === walkInSlotData.slotNumber,
    )

    if (!targetSlot || targetSlot.status !== 'AVAILABLE') {
      get().showToast('Slot vừa được đặt bởi giao dịch khác. Vui lòng tải lại lịch.', 'error')
      return null
    }

    const booking: WalkInBooking = {
      id: `WALK-${Date.now().toString().slice(-6)}`,
      customerName: data.customerName.trim(),
      phone: data.phone,
      source: data.source,
      paymentMethod: data.paymentMethod,
      courtFee: targetSlot.price,
      extraFee: data.extraFee,
      paidAmount: data.paidAmount,
      note: data.note.trim(),
      createdAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    const updatedCourts = courtInventory.map((court) =>
      court.id === walkInSlotData.courtId
        ? {
            ...court,
            slots: court.slots.map((slot) =>
              slot.slotNumber === walkInSlotData.slotNumber
                ? {
                    ...slot,
                    status: 'PRIVATE_BOOKED' as const,
                    bookedNote:
                      booking.paidAmount >= booking.courtFee + booking.extraFee
                        ? 'Khách vãng lai · Đã thu đủ'
                        : 'Khách vãng lai · Còn nợ',
                    bookedContact: `${booking.customerName} · ${booking.phone}`,
                    bookedByName: booking.customerName,
                    bookedPhone: booking.phone,
                    bookingId: booking.id,
                    bookedAt: booking.createdAt,
                    bookingStatus:
                      booking.paidAmount >= booking.courtFee + booking.extraFee
                        ? 'Đã thanh toán'
                        : 'Còn công nợ',
                    walkInBooking: booking,
                  }
                : slot,
            ),
          }
        : court,
    )

    set({
      courtInventory: updatedCourts,
      isWalkInModalOpen: false,
      walkInSlotData: null,
    })
    get().showToast(
      `Đã khóa Slot ${walkInSlotData.slotNumber} cho ${booking.customerName}.`,
      'success',
    )
    return booking
  },

  confirmTicketCheckIn: (ticketCode) => {
    const normalizedCode = ticketCode.trim().toUpperCase()
    const targetTicket = get().checkInTickets.find((ticket) => ticket.code === normalizedCode)
    if (!targetTicket || targetTicket.scenario !== 'VALID') return false

    const holder = targetTicket.participants.find(
      (participant) => participant.id === targetTicket.holderId,
    )
    if (!holder || holder.checkedInAt) return false

    const checkInTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const updatedTickets = get().checkInTickets.map((ticket) =>
      ticket.code === normalizedCode
        ? {
            ...ticket,
            scenario: 'ALREADY_CHECKED_IN' as const,
            participants: ticket.participants.map((participant) =>
              participant.id === ticket.holderId
                ? { ...participant, checkedInAt: checkInTime }
                : participant,
            ),
          }
        : ticket,
    )
    const checkedInCount = targetTicket.participants.filter(
      (participant) => participant.checkedInAt || participant.id === targetTicket.holderId,
    ).length
    const newLog: CheckInLog = {
      id: `log_${Date.now()}`,
      time: checkInTime,
      courtName: targetTicket.courtName,
      description: `${holder.name} · ${checkedInCount}/${targetTicket.participants.length} người đã check-in`,
      tone: 'success',
    }

    set((state) => ({
      checkInTickets: updatedTickets,
      checkInLogs: [newLog, ...state.checkInLogs].slice(0, 5),
    }))
    get().showToast(`Đã xác nhận ${holder.name} vào ${targetTicket.courtName}.`, 'success')
    return true
  },

  setSlotMaintenance: (courtId, slotNumber) => {
    const updated = get().courtInventory.map((court) => {
      if (court.id === courtId) {
        return {
          ...court,
          slots: court.slots.map((s) =>
            s.slotNumber === slotNumber
              ? { ...s, status: 'MAINTENANCE' as const, bookedNote: 'Bảo trì sân', maintenanceReason: 'Bảo trì sân' }
              : s
          ),
        }
      }
      return court
    })
    set({ courtInventory: updated })
    get().showToast(`Đã chuyển Slot ${slotNumber} sang trạng thái Bảo trì.`, 'info')
  },

  releaseSlot: (courtId, slotNumber) => {
    const updated = get().courtInventory.map((court) => {
      if (court.id !== courtId) return court

      return {
        ...court,
        slots: court.slots.map((slot) =>
          slot.slotNumber === slotNumber
            ? {
                ...slot,
                status: 'AVAILABLE' as const,
                matchRoomId: undefined,
                matchTitle: undefined,
                duprRange: undefined,
                playersCount: undefined,
                bookedNote: undefined,
                bookedContact: undefined,
                bookedByName: undefined,
                bookedPhone: undefined,
                bookingId: undefined,
                bookedAt: undefined,
                bookingStatus: undefined,
                maintenanceReason: undefined,
                walkInBooking: undefined,
              }
            : slot,
        ),
      }
    })

    set({ courtInventory: updated })
    get().showToast(`Đã mở lại Slot ${slotNumber} thành Trống.`, 'info')
  },

  updateStudentAttendance: (courseId, studentId, status) => {
    const { coachAccount, coachCourses } = get()
    const course = coachCourses.find((item) => item.id === courseId)
    if (!course || course.coachId !== coachAccount.id) {
      get().showToast('Bạn không có quyền cập nhật lớp học này.', 'error')
      return false
    }

    const updatedCourses = coachCourses.map((c) => {
      if (c.id === courseId && c.coachId === coachAccount.id) {
        return {
          ...c,
          students: c.students.map((st) =>
            st.id === studentId ? { ...st, attendance: status } : st
          ),
        }
      }
      return c
    })
    set({ coachCourses: updatedCourses })
    get().showToast('Đã cập nhật trạng thái điểm danh học viên!', 'success')
    return true
  },

  updateStudentAssessment: (courseId, studentId, assessment) => {
    const { coachAccount, coachCourses } = get()
    const course = coachCourses.find((item) => item.id === courseId)
    if (!course || course.coachId !== coachAccount.id) {
      get().showToast('Bạn chỉ được đánh giá học viên trong lớp của mình.', 'error')
      return false
    }

    set({
      coachCourses: coachCourses.map((item) =>
        item.id === courseId
          ? {
              ...item,
              students: item.students.map((student) =>
                student.id === studentId ? { ...student, ...assessment } : student,
              ),
            }
          : item,
      ),
    })
    get().showToast('Đã lưu đánh giá kỹ thuật và DUPR của học viên.', 'success')
    return true
  },

  createCoachCourse: (course) => {
    const { coachAccount } = get()
    const newCourse: CoachCourse = {
      ...course,
      id: `COURSE-${coachAccount.id.toUpperCase()}-${Date.now().toString().slice(-5)}`,
      coachId: coachAccount.id,
      coachName: coachAccount.name,
      currentStudents: 0,
      completedSessions: 0,
      students: [],
    }
    set((state) => ({ coachCourses: [newCourse, ...state.coachCourses] }))
    get().showToast(`Đã công bố “${newCourse.title}” lên danh bạ.`, 'success')
    return true
  },

  updateCoachCourse: (courseId, changes) => {
    const { coachAccount, coachCourses } = get()
    const target = coachCourses.find((course) => course.id === courseId)
    if (!target || target.coachId !== coachAccount.id) {
      get().showToast('Bạn chỉ được chỉnh sửa khóa học do mình tạo.', 'error')
      return false
    }

    set({
      coachCourses: coachCourses.map((course) =>
        course.id === courseId
          ? { ...course, ...changes, coachId: coachAccount.id, coachName: coachAccount.name }
          : course,
      ),
    })
    get().showToast(`Đã cập nhật “${changes.title ?? target.title}”.`, 'success')
    return true
  },

  requestVenueAffiliation: (venueId) => {
    const { coachAccount, coachAffiliations, coachAffiliationNotifications, venues } = get()
    const existing = coachAffiliations.find(
      (item) => item.venueId === venueId && item.coachId === coachAccount.id,
    )
    if (existing && (existing.status === 'ACTIVE' || existing.status === 'PENDING')) {
      get().showToast(
        existing.status === 'ACTIVE'
          ? 'Bạn đã liên kết với cụm sân này.'
          : 'Yêu cầu liên kết đang chờ Field Manager duyệt.',
        'info',
      )
      return false
    }
    const venue = venues.find((item) => item.id === venueId)
    if (!venue) {
      get().showToast('Không tìm thấy cụm sân đã chọn.', 'error')
      return false
    }

    const requestedAt = new Date().toISOString()
    const request: CoachVenueAffiliation = existing
      ? {
          ...existing,
          linkType: 'COACH_REQUEST',
          status: 'PENDING',
          rejectedReason: undefined,
          requestedAt,
          linkedAt: undefined,
          createdBy: coachAccount.id,
        }
      : {
          id: `AFF-${Date.now().toString().slice(-5)}`,
          venueId: venue.id,
          coachId: coachAccount.id,
          venueName: venue.name,
          address: venue.address,
          distanceKm: 5.2,
          linkType: 'COACH_REQUEST',
          status: 'PENDING',
          requestedAt,
          createdBy: coachAccount.id,
          activeCourses: 0,
          availableSlots: [1, 3, 6],
        }
    const nextAffiliations = existing
      ? coachAffiliations.map((item) => item.id === existing.id ? request : item)
      : [...coachAffiliations, request]
    const nextNotifications: CoachAffiliationNotification[] = [
      {
        id: `AFF-NOTICE-${Date.now()}`,
        recipientId: `fm:${venue.id}`,
        message: `${coachAccount.name} vừa gửi yêu cầu liên kết với cụm sân.`,
        createdAt: requestedAt,
        tone: 'info' as const,
      },
      ...coachAffiliationNotifications,
    ].slice(0, 50)
    persistCoachAffiliations(nextAffiliations)
    persistCoachAffiliationNotifications(nextNotifications)
    set({ coachAffiliations: nextAffiliations, coachAffiliationNotifications: nextNotifications })
    get().showToast('Đã gửi yêu cầu liên kết đến ban quản lý sân', 'success')
    return true
  },

  lookupCoachForAffiliation: (venueId, coachUserId) => {
    const normalized = coachUserId.trim().toUpperCase()
    if (!normalized) return { success: false, message: 'Vui lòng nhập UserID hoặc mã HLV.' }
    if (!get().venues.some((venue) => venue.id === venueId)) {
      return { success: false, message: 'Không tìm thấy cụm sân đang quản lý.' }
    }

    if (['PLAYER_01', 'PLAYER_NGUYEN_AN', 'PLAYER@FITLYO.VN'].includes(normalized)) {
      return { success: false, message: 'Tài khoản này là Người chơi, không phải Huấn luyện viên' }
    }
    if (['FM_DSPORTS', 'OWNER@FITLYO.VN', 'FM-01'].includes(normalized)) {
      return { success: false, message: 'Tài khoản này là Quản lý cụm sân, không thể thêm làm Huấn luyện viên' }
    }

    const aliasCoachId = normalized === 'COACH_LINKED' ? 'coach_dung' : undefined
    const coach = get().coaches.find((item) => (
      item.id.toUpperCase() === normalized
      || item.userId.toUpperCase() === normalized
      || item.id === aliasCoachId
    ))
    if (!coach || normalized === 'NOT_FOUND_ID') {
      return { success: false, message: 'Không tìm thấy tài khoản với UserID này' }
    }
    if (coach.accountStatus === 'SUSPENDED') {
      return { success: false, message: 'Tài khoản Coach đang bị tạm khóa và không thể mở lớp mới.' }
    }

    const existing = get().coachAffiliations.find(
      (item) => item.venueId === venueId && item.coachId === coach.id,
    )
    if (existing?.status === 'ACTIVE') {
      return { success: false, message: 'Huấn luyện viên này đã được liên kết với sân từ trước' }
    }

    return {
      success: true,
      message: existing?.status === 'PENDING'
        ? 'Coach đang có yêu cầu chờ duyệt. Xác nhận sẽ kích hoạt liên kết ngay.'
        : 'Đã tìm thấy hồ sơ Coach hợp lệ.',
      coach,
    }
  },

  directAddCoachAffiliation: (venueId, coachUserId) => {
    const lookup = get().lookupCoachForAffiliation(venueId, coachUserId)
    if (!lookup.success || !lookup.coach) {
      get().showToast(lookup.message, 'error')
      return { success: false, message: lookup.message }
    }

    const { coachAffiliations, coachAffiliationNotifications, venues } = get()
    const venue = venues.find((item) => item.id === venueId)
    if (!venue) return { success: false, message: 'Không tìm thấy cụm sân đang quản lý.' }
    const existing = coachAffiliations.find(
      (item) => item.venueId === venueId && item.coachId === lookup.coach?.id,
    )
    const linkedAt = new Date().toISOString()
    const activeAffiliation: CoachVenueAffiliation = existing
      ? {
          ...existing,
          linkType: 'FM_DIRECT_ADD',
          status: 'ACTIVE',
          rejectedReason: undefined,
          linkedAt,
          createdBy: 'fm_dsports',
        }
      : {
          id: `AFF-${Date.now().toString().slice(-5)}`,
          venueId,
          coachId: lookup.coach.id,
          venueName: venue.name,
          address: venue.address,
          distanceKm: 0,
          linkType: 'FM_DIRECT_ADD',
          status: 'ACTIVE',
          requestedAt: linkedAt,
          linkedAt,
          createdBy: 'fm_dsports',
          activeCourses: 0,
          availableSlots: [1, 2, 4, 6, 8],
        }
    const nextAffiliations = existing
      ? coachAffiliations.map((item) => item.id === existing.id ? activeAffiliation : item)
      : [activeAffiliation, ...coachAffiliations]
    const message = `Cụm sân ${venue.name} đã thêm bạn vào danh sách HLV liên kết`
    const nextNotifications: CoachAffiliationNotification[] = [
      {
        id: `AFF-NOTICE-${Date.now()}`,
        recipientId: lookup.coach.id,
        message,
        createdAt: linkedAt,
        tone: 'success' as const,
      },
      ...coachAffiliationNotifications,
    ].slice(0, 50)
    persistCoachAffiliations(nextAffiliations)
    persistCoachAffiliationNotifications(nextNotifications)
    set({ coachAffiliations: nextAffiliations, coachAffiliationNotifications: nextNotifications })
    get().showToast(`Đã liên kết ${lookup.coach.name} với cụm sân.`, 'success')
    return { success: true, message }
  },

  approveCoachAffiliation: (affiliationId) => {
    const { coachAffiliations, coachAffiliationNotifications } = get()
    const target = coachAffiliations.find((item) => item.id === affiliationId)
    if (!target || target.status !== 'PENDING') {
      get().showToast('Yêu cầu này không còn ở trạng thái chờ duyệt.', 'error')
      return false
    }
    const linkedAt = new Date().toISOString()
    const nextAffiliations = coachAffiliations.map((item) => item.id === affiliationId
      ? { ...item, status: 'ACTIVE' as const, linkedAt, rejectedReason: undefined }
      : item)
    const nextNotifications: CoachAffiliationNotification[] = [
      {
        id: `AFF-NOTICE-${Date.now()}`,
        recipientId: target.coachId,
        message: 'Cụm sân đã phê duyệt yêu cầu liên kết của bạn',
        createdAt: linkedAt,
        tone: 'success' as const,
      },
      ...coachAffiliationNotifications,
    ].slice(0, 50)
    persistCoachAffiliations(nextAffiliations)
    persistCoachAffiliationNotifications(nextNotifications)
    set({ coachAffiliations: nextAffiliations, coachAffiliationNotifications: nextNotifications })
    get().showToast('Đã chấp thuận yêu cầu. Coach đã được chuyển sang danh sách liên kết.', 'success')
    return true
  },

  rejectCoachAffiliation: (affiliationId, reason) => {
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      get().showToast('Vui lòng nhập lý do từ chối.', 'error')
      return false
    }
    const { coachAffiliations, coachAffiliationNotifications } = get()
    const target = coachAffiliations.find((item) => item.id === affiliationId)
    if (!target || target.status !== 'PENDING') {
      get().showToast('Yêu cầu này không còn ở trạng thái chờ duyệt.', 'error')
      return false
    }
    const createdAt = new Date().toISOString()
    const nextAffiliations = coachAffiliations.map((item) => item.id === affiliationId
      ? { ...item, status: 'REJECTED' as const, rejectedReason: trimmedReason, linkedAt: undefined }
      : item)
    const nextNotifications: CoachAffiliationNotification[] = [
      {
        id: `AFF-NOTICE-${Date.now()}`,
        recipientId: target.coachId,
        message: `Yêu cầu liên kết với ${target.venueName} đã bị từ chối: ${trimmedReason}`,
        createdAt,
        tone: 'error' as const,
      },
      ...coachAffiliationNotifications,
    ].slice(0, 50)
    persistCoachAffiliations(nextAffiliations)
    persistCoachAffiliationNotifications(nextNotifications)
    set({ coachAffiliations: nextAffiliations, coachAffiliationNotifications: nextNotifications })
    get().showToast('Đã từ chối yêu cầu và gửi lý do cho Coach.', 'info')
    return true
  },

  unlinkCoachAffiliation: (affiliationId, initiatedBy) => {
    const { coachAffiliations, coachAffiliationNotifications } = get()
    const target = coachAffiliations.find((item) => item.id === affiliationId)
    if (!target || target.status !== 'ACTIVE') {
      get().showToast('Liên kết này không còn hoạt động.', 'error')
      return false
    }
    const createdAt = new Date().toISOString()
    const nextAffiliations = coachAffiliations.map((item) => item.id === affiliationId
      ? { ...item, status: 'INACTIVE' as const }
      : item)
    const nextNotifications: CoachAffiliationNotification[] = [
      {
        id: `AFF-NOTICE-${Date.now()}`,
        recipientId: initiatedBy === 'coach' ? `fm:${target.venueId}` : target.coachId,
        message: initiatedBy === 'coach'
          ? `Coach đã hủy liên kết với ${target.venueName}.`
          : `${target.venueName} đã ngắt liên kết Coach. Các buổi đã đặt cọc vẫn được giữ nguyên.`,
        createdAt,
        tone: 'info' as const,
      },
      ...coachAffiliationNotifications,
    ].slice(0, 50)
    persistCoachAffiliations(nextAffiliations)
    persistCoachAffiliationNotifications(nextNotifications)
    set({ coachAffiliations: nextAffiliations, coachAffiliationNotifications: nextNotifications })
    get().showToast('Đã hủy liên kết. Các buổi đã đặt cọc vẫn được giữ nguyên.', 'success')
    return true
  },

  updateCoachProfile: (changes) => {
    const { coachAccount } = get()
    const protectedChanges = { ...changes, id: coachAccount.id, verificationStatus: 'APPROVED' as const }
    set({ coachAccount: { ...coachAccount, ...protectedChanges } })
    get().showToast('Đã cập nhật hồ sơ Coach.', 'success')
    return true
  },

  requestCoachWithdrawal: (amount) => {
    const { coachAccount, coachWalletSummary } = get()
    if (amount <= 0 || amount > coachWalletSummary.availableBalance) {
      get().showToast('Số tiền rút không hợp lệ hoặc vượt quá số dư khả dụng.', 'error')
      return false
    }

    const transaction: CoachWalletTransaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      coachId: coachAccount.id,
      date: new Date().toLocaleDateString('vi-VN'),
      description: `Yêu cầu rút tiền về ${coachAccount.bankName} •••• ${coachAccount.bankAccountMasked.slice(-4)}`,
      courseName: 'Ví FITLYO Coach',
      amount: -amount,
      type: 'WITHDRAWAL',
      status: 'PENDING',
    }
    set((state) => ({
      coachWalletTransactions: [transaction, ...state.coachWalletTransactions],
      coachWalletSummary: {
        ...state.coachWalletSummary,
        availableBalance: state.coachWalletSummary.availableBalance - amount,
        pendingPayout: state.coachWalletSummary.pendingPayout + amount,
      },
    }))
    get().showToast('Đã gửi yêu cầu rút tiền. Dự kiến xử lý trong 1–2 ngày làm việc.', 'success')
    return true
  },

  approveAuditApplication: (id) => {
    const target = get().auditApplications.find((app) => app.id === id)
    if (!target || target.status === 'APPROVED') return

    const updated = get().auditApplications.map((app) => app.id === id
      ? {
          ...app,
          status: 'APPROVED' as const,
          rejectionReason: undefined,
        }
      : app)
    persistAuditApplications(updated)
    set({ auditApplications: updated })
    get().showToast(`Đã phê duyệt và xác minh hồ sơ #${id} cho tài khoản hiện tại.`, 'success')
  },

  rejectAuditApplication: (id, reason) => {
    const updated = get().auditApplications.map((app) =>
      app.id === id
        ? { ...app, status: 'REJECTED' as const, rejectionReason: reason }
        : app
    )
    persistAuditApplications(updated)
    set({ auditApplications: updated })
    get().showToast(`Đã gửi thông báo từ chối hồ sơ #${id} kèm lý do.`, 'error')
  },

  requestAuditSupplement: (id, reason) => {
    const updated = get().auditApplications.map((app) => app.id === id
      ? { ...app, status: 'NEEDS_SUPPLEMENT' as const, rejectionReason: reason }
      : app)
    persistAuditApplications(updated)
    set({ auditApplications: updated })
    get().showToast(`Đã gửi yêu cầu bổ sung cho hồ sơ #${id}.`, 'info')
  },

  submitAuditApplication: (application) => {
    const current = get().auditApplications
    const existing = current.find((item) =>
      (item.sourceAccountId ?? item.sourcePlayerId) === (application.sourceAccountId ?? application.sourcePlayerId)
        && item.type === application.type,
    )

    if (existing?.status === 'PENDING') {
      return { success: false, message: 'Hồ sơ cùng loại đang chờ Admin thẩm định.', application: existing }
    }
    if (existing?.status === 'APPROVED') {
      return { success: false, message: 'Hồ sơ đã được duyệt và tài khoản đối tác đã được tạo.', application: existing }
    }

    const submitted = existing
      ? { ...application, id: existing.id, status: 'PENDING' as const, rejectionReason: undefined, generatedAccount: undefined }
      : application
    const updated = existing
      ? current.map((item) => item.id === existing.id ? submitted : item)
      : [submitted, ...current]

    persistAuditApplications(updated)
    set({ auditApplications: updated, selectedAuditId: submitted.id })
    get().showToast(`Đã gửi hồ sơ #${submitted.id} đến Ban quản trị.`, 'success')
    return { success: true, message: 'Hồ sơ đã được gửi thành công.', application: submitted }
  },

  showToast: (text, type = 'success') => {
    set({ toastMessage: { text, type } })
    setTimeout(() => {
      set({ toastMessage: null })
    }, 4000)
  },

  clearToast: () => set({ toastMessage: null }),
}))
