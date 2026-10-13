import { create } from 'zustand'
import type {
  UserRole,
  UserAccount,
  MatchRoom,
  CourtInventory,
  CoachItem,
  CoachCourse,
  AuditApplication,
  VenueItem,
} from '@/types/pickleball'

interface FitlyoState {
  // Current user & active role
  activeRole: UserRole
  currentUser: UserAccount
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

  // Coach & Courses
  coachCourses: CoachCourse[]
  coaches: CoachItem[]

  // Admin Portal
  auditApplications: AuditApplication[]
  selectedAuditId: string | null

  // Venues
  venues: VenueItem[]

  // UI Toast / Feedback
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null

  // Actions
  setActiveRole: (role: UserRole) => void
  toggleSidebar: () => void
  togglePremium: () => void
  setFeedFilter: (filter: Partial<FitlyoState['feedFilter']>) => void
  setIsFeedLoading: (loading: boolean) => void
  selectMatch: (id: string | null) => void
  joinMatchRoom: (matchId: string) => boolean
  cancelMatchHold: (matchId: string) => boolean
  openPublishModal: (slot: FitlyoState['publishingSlotData']) => void
  closePublishModal: () => void
  publishSlotAsMatch: (data: {
    courtId: string
    slotNumber: number
    duprMin: number
    duprMax: number
    format: 'doubles' | 'singles'
    fee: number
    amenities: string[]
    note: string
  }) => void
  lockSlotAsPrivate: (courtId: string, slotNumber: number, contact: string) => void
  setSlotMaintenance: (courtId: string, slotNumber: number) => void
  updateStudentAttendance: (
    courseId: string,
    studentId: string,
    status: 'present' | 'absent' | 'makeup'
  ) => void
  approveAuditApplication: (id: string) => void
  rejectAuditApplication: (id: string, reason: string) => void
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void
  clearToast: () => void
}

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
    slotNumber: 5,
    timeRange: '18:30 - 20:00',
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
    slotNumber: 4,
    timeRange: '17:00 - 18:30',
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
    slotNumber: 5,
    timeRange: '18:30 - 20:00',
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

const initialCourts: CourtInventory[] = [
  {
    id: 'court_1',
    name: 'SÂN 1 (Trong nhà)',
    courtType: 'indoor',
    slots: [
      { slotNumber: 1, timeRange: '06:00 - 07:30', status: 'AVAILABLE', price: 150000 },
      { slotNumber: 2, timeRange: '07:30 - 09:00', status: 'COACHING', price: 180000, bookedNote: 'HLV Tuấn Kiệt (4 HV)', bookedContact: '0908.112.233' },
      { slotNumber: 3, timeRange: '15:30 - 17:00', status: 'MATCH_PUBLISHED', price: 180000, matchTitle: 'Kèo Social Sơ cấp', duprRange: 'DUPR 2.0-2.5', playersCount: '3/4' },
      { slotNumber: 4, timeRange: '17:00 - 18:30', status: 'PRIVATE_BOOKED', price: 200000, bookedNote: 'Khách bao riêng tại quầy', bookedContact: 'Anh Thành - 0918.334.455' },
      { slotNumber: 5, timeRange: '18:30 - 20:00', status: 'MATCH_PUBLISHED', price: 220000, isPeak: true, matchTitle: 'Kèo Đôi Nam Nữ Hot', duprRange: 'DUPR 3.5-4.0', playersCount: 'FULL' },
      { slotNumber: 6, timeRange: '20:00 - 21:30', status: 'AVAILABLE', price: 160000 },
    ],
  },
  {
    id: 'court_2',
    name: 'SÂN 2 (Trong nhà)',
    courtType: 'indoor',
    slots: [
      { slotNumber: 1, timeRange: '06:00 - 07:30', status: 'AVAILABLE', price: 150000 },
      { slotNumber: 2, timeRange: '07:30 - 09:00', status: 'AVAILABLE', price: 180000 },
      { slotNumber: 3, timeRange: '15:30 - 17:00', status: 'AVAILABLE', price: 180000 },
      { slotNumber: 4, timeRange: '17:00 - 18:30', status: 'MATCH_PUBLISHED', price: 200000, matchTitle: 'Kèo Phong Trào', duprRange: 'DUPR 3.0-3.5', playersCount: 'FULL' },
      { slotNumber: 5, timeRange: '18:30 - 20:00', status: 'MATCH_PUBLISHED', price: 220000, isPeak: true, matchTitle: 'Kèo Giờ Vàng Giao Lưu', duprRange: 'DUPR 2.5-3.0', playersCount: 'FULL' },
      { slotNumber: 6, timeRange: '20:00 - 21:30', status: 'AVAILABLE', price: 160000 },
    ],
  },
  {
    id: 'court_3',
    name: 'SÂN 3 (Ngoài trời)',
    courtType: 'outdoor',
    slots: [
      { slotNumber: 1, timeRange: '06:00 - 07:30', status: 'MAINTENANCE', price: 0, bookedNote: 'Bảo trì lưới & vệ sinh' },
      { slotNumber: 2, timeRange: '07:30 - 09:00', status: 'AVAILABLE', price: 140000 },
      { slotNumber: 3, timeRange: '15:30 - 17:00', status: 'AVAILABLE', price: 140000 },
      { slotNumber: 4, timeRange: '17:00 - 18:30', status: 'AVAILABLE', price: 160000 },
      { slotNumber: 5, timeRange: '18:30 - 20:00', status: 'PRIVATE_BOOKED', price: 180000, isPeak: true, bookedNote: 'Khách cọc qua App', bookedContact: 'Chị Lan - 0933.778.899' },
      { slotNumber: 6, timeRange: '20:00 - 21:30', status: 'AVAILABLE', price: 140000 },
    ],
  },
]

const initialCoachCourses: CoachCourse[] = [
  {
    id: 'crs_01',
    title: 'Pickleball Căn bản & Làm quen DUPR 2.0',
    coachId: 'coach_kiet',
    coachName: 'HLV Đặng Tuấn Kiệt',
    duration: '1 tháng (8 buổi)',
    frequency: '2 buổi/tuần (T3 - T5 Slot 2: 07:30 - 09:00)',
    venue: 'Cụm sân D-Sports Thủ Đức',
    fee: 1600000,
    currentStudents: 4,
    maxStudents: 4,
    completedSessions: 5,
    totalSessions: 8,
    status: 'IN_PROGRESS',
    students: [
      { id: 'st_1', name: 'Nguyễn Văn Minh', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', dupr: 2.1, attendance: 'present' },
      { id: 'st_2', name: 'Lê Hoàng Yến', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', dupr: 2.2, attendance: 'present' },
      { id: 'st_3', name: 'Phạm Thành Long', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', dupr: 2.3, attendance: 'absent' },
      { id: 'st_4', name: 'Đỗ Quỳnh Chi', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', dupr: 2.15, attendance: 'present' },
    ],
  },
  {
    id: 'crs_02',
    title: 'Chiến thuật Đánh đôi Nâng cao DUPR 3.5+',
    coachId: 'coach_kiet',
    coachName: 'HLV Đặng Tuấn Kiệt',
    duration: '1 tháng (8 buổi)',
    frequency: '2 buổi/tuần (T4 - T6 Slot 5: 18:30 - 20:00)',
    venue: 'Cụm sân Thủ Thiêm Sports Hub',
    fee: 2200000,
    currentStudents: 2,
    maxStudents: 4,
    completedSessions: 0,
    totalSessions: 8,
    status: 'RECRUITING',
    students: [
      { id: 'st_5', name: 'Trần Hải Đăng', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', dupr: 3.4, attendance: 'present' },
      { id: 'st_6', name: 'Ngô Kim Ngân', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', dupr: 3.35, attendance: 'present' },
    ],
  },
]

const initialCoaches: CoachItem[] = [
  {
    id: 'coach_long',
    name: 'HLV NGUYỄN HOÀNG LONG',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
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
    name: 'HLV ĐẶNG TUẤN KIỆT',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isCertified: true,
    certTitle: 'Certified Coach (IPTPA Level 2)',
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
    name: 'HLV TRẦN MINH ANH',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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
    inspectorNotes: 'Cụm sân đạt chuẩn, đã ký cam kết vận hành 6 slot/ngày với sàn FITLYO.',
    submittedDate: '01/10/2026',
  },
]

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
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
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
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500',
    priceRange: '160.000đ - 240.000đ/slot 90p',
  },
  {
    id: 'ven_3',
    name: 'Thảo Điền Pickleball Club',
    address: '28 Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền, Thủ Đức',
    totalCourts: 5,
    availableSlotsToday: 6,
    rating: 4.95,
    reviewCount: 156,
    amenities: ['Sân máy lạnh khép kín', 'Quầy bar sinh tố', 'Pro Shop bán vợt & bóng'],
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500',
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
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=500',
    priceRange: '130.000đ - 180.000đ/slot 90p',
  },
]

export const useFitlyoStore = create<FitlyoState>((set, get) => ({
  activeRole: 'player',
  currentUser: initialUser,
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

  coachCourses: initialCoachCourses,
  coaches: initialCoaches,

  auditApplications: initialAuditApps,
  selectedAuditId: 'FM-APP-0128',

  venues: initialVenues,
  toastMessage: null,

  setActiveRole: (role) => {
    set((state) => ({
      activeRole: role,
      currentUser: { ...state.currentUser, role },
    }))
    get().showToast(`Đã chuyển sang vai trò: ${role.toUpperCase()}`, 'info')
  },

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

  publishSlotAsMatch: (data) => {
    const { courtInventory, matches } = get()

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
                duprRange: `DUPR ${data.duprMin}-${data.duprMax}`,
                playersCount: '0/4',
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
    const slotTimes = [
      '',
      '06:00 - 07:30',
      '07:30 - 09:00',
      '15:30 - 17:00',
      '17:00 - 18:30',
      '18:30 - 20:00',
      '20:00 - 21:30',
    ]

    const newMatch: MatchRoom = {
      id: `MM-${Math.floor(9000 + Math.random() * 900)}`,
      title: `⚡ KÈO SOCIAL CÔNG BỐ MỚI (${data.format === 'doubles' ? 'ĐÔI' : 'ĐƠN'})`,
      courtId: data.courtId,
      courtName: 'Cụm sân D-Sports Pickleball',
      courtSubName: targetCourt ? targetCourt.name : 'Sân thi đấu',
      surfaceType: 'Trong nhà',
      address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
      distanceKm: 1.2,
      slotNumber: data.slotNumber,
      timeRange: slotTimes[data.slotNumber] || '18:30 - 20:00',
      dateStr: 'Hôm nay, 13/10/2026',
      format: data.format,
      targetDuprMin: data.duprMin,
      targetDuprMax: data.duprMax,
      currentPlayers: 1,
      maxPlayers: data.format === 'doubles' ? 4 : 2,
      depositFee: data.fee,
      status: 'OPEN',
      amenities: data.amenities,
      note: data.note,
      participants: [
        {
          id: 'usr_fm',
          name: 'Trần Văn Hùng (Host Chủ Sân)',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          dupr: data.duprMin,
          reputationScore: 99,
          isHost: true,
          isDeposited: true,
        },
      ],
    }

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

  setSlotMaintenance: (courtId, slotNumber) => {
    const updated = get().courtInventory.map((court) => {
      if (court.id === courtId) {
        return {
          ...court,
          slots: court.slots.map((s) =>
            s.slotNumber === slotNumber
              ? { ...s, status: 'MAINTENANCE' as const, bookedNote: 'Bảo trì sân' }
              : s
          ),
        }
      }
      return court
    })
    set({ courtInventory: updated })
    get().showToast(`Đã chuyển Slot ${slotNumber} sang trạng thái Bảo trì.`, 'info')
  },

  updateStudentAttendance: (courseId, studentId, status) => {
    const updatedCourses = get().coachCourses.map((c) => {
      if (c.id === courseId) {
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
  },

  approveAuditApplication: (id) => {
    const updated = get().auditApplications.map((app) =>
      app.id === id ? { ...app, status: 'APPROVED' as const } : app
    )
    set({ auditApplications: updated })
    get().showToast(`Đã phê duyệt và kích hoạt giấy phép/chứng chỉ #${id}!`, 'success')
  },

  rejectAuditApplication: (id, reason) => {
    const updated = get().auditApplications.map((app) =>
      app.id === id
        ? { ...app, status: 'REJECTED' as const, rejectionReason: reason }
        : app
    )
    set({ auditApplications: updated })
    get().showToast(`Đã gửi thông báo từ chối hồ sơ #${id} kèm lý do.`, 'error')
  },

  showToast: (text, type = 'success') => {
    set({ toastMessage: { text, type } })
    setTimeout(() => {
      set({ toastMessage: null })
    }, 4000)
  },

  clearToast: () => set({ toastMessage: null }),
}))
