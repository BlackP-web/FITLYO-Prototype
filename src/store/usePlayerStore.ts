import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { communityHero, matchNewbie, matchWeekend, venueIndoor } from '@/assets/pickleball'
import { COURT_SLOT_TIMES } from '@/lib/courtSchedule'
import { courtRefundOutcome, hoursUntilEvent, socialRefundOutcome } from '@/lib/paymentPolicies'
import { getPlayerMatchFee } from '@/lib/playerMatch'
import { usePaymentStore } from '@/store/usePaymentStore'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'
import { useAuthStore } from '@/store/useAuthStore'
import type {
  PlayerMatch,
  PlayerProfile,
  PlayerScheduleItem,
  PlayerTicket,
  PlayerVenue,
  ReviewDraft,
} from '@/types/player'
import type { CoachBookingSession, CoachBookingType, CoachPaymentMethod } from '@/types/coachBooking'

interface ActionResult {
  success: boolean
  message: string
  ticketCode?: string
  matchId?: string
}

interface PlayerState {
  profile: PlayerProfile
  matches: PlayerMatch[]
  tickets: PlayerTicket[]
  schedule: PlayerScheduleItem[]
  venues: PlayerVenue[]
  reviewedMatchIds: string[]
  bookedSlotKeys: string[]
  addFieldManagerMatch: (match: PlayerMatch) => void
  updateProfile: (changes: Partial<Pick<PlayerProfile, 'name' | 'username' | 'phone' | 'city' | 'avatarUrl'>>) => void
  joinMatch: (matchId: string, method?: 'WALLET' | 'VIETQR') => ActionResult
  cancelTicket: (ticketCode: string) => ActionResult
  completeMatch: (ticketCode: string) => ActionResult
  checkInTicket: (ticketCode: string) => ActionResult
  submitReview: (matchId: string, draft: ReviewDraft) => ActionResult
  purchaseVip: (plan: 'MONTHLY' | 'YEARLY', method: 'WALLET' | 'VIETQR') => ActionResult
  cancelCourtBooking: (scheduleId: string) => ActionResult
  rescheduleCourtBooking: (scheduleId: string, input: {
    date: string
    dateLabel: string
    courtId: string
    slotNumber: number
  }) => ActionResult
  bookCourt: (input: {
    venueId: string
    courtId: string
    slotNumber: number
    date: string
    dateLabel: string
    paymentMethod?: 'WALLET' | 'VIETQR'
  }) => ActionResult
  recordCoachBooking: (input: {
    bookingId: string
    coachId: string
    coachName: string
    type: CoachBookingType
    title: string
    venueName: string
    courtName: string
    totalAmount: number
    paymentAmount: number
    paymentMethod: CoachPaymentMethod
    sessions: CoachBookingSession[]
  }) => ActionResult
  creditWallet: (amount: number) => void
  creditVoucher: (amount: number) => void
  cancelCoachSchedule: (bookingId: string, subtitle: string, sessionId?: string) => void
  processTimeBasedPolicies: () => void
  resetPlayerDemo: () => void
}

const playerAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop'

const initialProfile: PlayerProfile = {
  id: 'player_nguyen_an',
  name: 'Nguyễn Văn An',
  username: '@an_pickleball',
  email: 'player@fitlyo.vn',
  phone: '0912 345 678',
  city: 'TP. Thủ Đức, TP. Hồ Chí Minh',
  memberSince: 'Tháng 03/2026',
  avatarUrl: playerAvatar,
  dupr: 3.42,
  duprTrend: 0.17,
  reputation: 98,
  matchesPlayed: 28,
  wins: 19,
  losses: 9,
  walletBalance: 1_200_000,
  voucherBalance: 0,
  isVip: false,
  skills: {
    serve: 8.5,
    thirdShot: 7,
    dinking: 8,
    volley: 6.5,
    movement: 8,
  },
}

const people = {
  bao: {
    id: 'player_bao',
    name: 'Lê Quốc Bảo',
    phone: '0912 330 231',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    dupr: 3.1,
    reputation: 98,
  },
  tri: {
    id: 'player_tri',
    name: 'Trần Minh Trí',
    phone: '0938 224 445',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    dupr: 3.4,
    reputation: 95,
  },
  ngoc: {
    id: 'player_ngoc',
    name: 'Nguyễn Bích Ngọc',
    phone: '0928 510 338',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    dupr: 3.35,
    reputation: 100,
  },
  long: {
    id: 'player_long',
    name: 'Phạm Thành Long',
    phone: '0908 772 906',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    dupr: 3.55,
    reputation: 97,
  },
}

const venueImages = {
  thaoDien: [
    venueIndoor,
    matchNewbie,
    communityHero,
  ],
  hiepPhu: [
    communityHero,
    matchWeekend,
  ],
  anPhu: [
    matchWeekend,
    venueIndoor,
  ],
}

const makeSlots = (offset = 0): PlayerVenue['courts'][number]['slots'] => COURT_SLOT_TIMES.map((slot) => {
  const isPeak = slot.slotNumber >= 9
  const price = (isPeak ? 220000 : slot.slotNumber <= 2 ? 140000 : 100000) + offset
  return { ...slot, price, status: 'AVAILABLE', isPeak }
})

const initialVenues: PlayerVenue[] = [
  {
    id: 'venue-thao-dien',
    name: 'D-Pickleball Thảo Điền',
    address: '12 Võ Trường Toản, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền',
    distanceKm: 1.2,
    rating: 4.9,
    reviewCount: 128,
    openingHours: '06:00 - 21:00 hàng ngày',
    hotline: '0909 888 777',
    description: 'Cụm sân trong nhà máy lạnh, thảm đệm giảm chấn và hệ đèn LED chống lóa đạt chuẩn thi đấu.',
    images: venueImages.thaoDien,
    amenities: ['Bãi đỗ ô tô', 'Tắm nóng lạnh', 'Máy lạnh', 'Wifi', 'Quầy nước'],
    courts: [
      { id: 'td-court-01', name: 'Sân 01', type: 'Trong nhà', slots: makeSlots() },
      { id: 'td-court-02', name: 'Sân 02', type: 'Trong nhà', slots: makeSlots(20000).map((slot) => slot.slotNumber === 2 ? { ...slot, status: 'AVAILABLE', label: undefined } : slot) },
    ],
  },
  {
    id: 'venue-hiep-phu',
    name: 'Saigon Rackets Hiệp Phú',
    address: '88 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức',
    area: 'Hiệp Phú',
    distanceKm: 3.8,
    rating: 4.8,
    reviewCount: 94,
    openingHours: '06:00 - 21:00 hàng ngày',
    hotline: '0903 112 119',
    description: 'Không gian thoáng, mặt sân mới và khu khởi động riêng phù hợp lớp học lẫn giao lưu cộng đồng.',
    images: venueImages.hiepPhu,
    amenities: ['Bãi xe máy', 'Phòng thay đồ', 'Cho thuê vợt', 'Quầy nước'],
    courts: [
      { id: 'hp-court-01', name: 'Sân 01', type: 'Có mái che', slots: makeSlots(-10000) },
      { id: 'hp-court-02', name: 'Sân 02', type: 'Có mái che', slots: makeSlots() },
    ],
  },
  {
    id: 'venue-an-phu',
    name: 'An Phú Pickleball Hub',
    address: '36 Song Hành, P. An Phú, TP. Thủ Đức',
    area: 'An Phú',
    distanceKm: 5.1,
    rating: 4.7,
    reviewCount: 76,
    openingHours: '06:00 - 21:00 hàng ngày',
    hotline: '0938 770 226',
    description: 'Cụm sân cộng đồng với giá dễ tiếp cận, có khu vực nghỉ và trang thiết bị cho người mới.',
    images: venueImages.anPhu,
    amenities: ['Bãi xe', 'Wifi', 'Mượn bóng', 'Căng-tin'],
    courts: [
      { id: 'ap-court-01', name: 'Sân 01', type: 'Ngoài trời', slots: makeSlots(-20000) },
      { id: 'ap-court-02', name: 'Sân 02', type: 'Ngoài trời', slots: makeSlots(-10000) },
    ],
  },
]

const currentParticipant = (profile: PlayerProfile, paidAmount = 0): PlayerMatch['participants'][number] => ({
  id: profile.id,
  name: profile.name,
  phone: profile.phone,
  avatarUrl: profile.avatarUrl,
  dupr: profile.dupr,
  reputation: profile.reputation,
  isCurrentUser: true,
  paymentStatus: 'PAID',
  paidAmount,
})

const futurePrototypeDate = (offset: number, relativeLabel?: string) => {
  const value = new Date()
  value.setHours(12, 0, 0, 0)
  value.setDate(value.getDate() + offset)
  const date = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  const formatted = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(value)
  return { date, label: relativeLabel ? `${relativeLabel}, ${formatted}` : formatted }
}

const tomorrow = futurePrototypeDate(1, 'Ngày mai')
const dayAfterTomorrow = futurePrototypeDate(2)
const thirdUpcomingDay = futurePrototypeDate(3)

const initialMatches: PlayerMatch[] = [
  {
    id: 'match-gold-01',
    title: 'Giao lưu cân trình giờ vàng',
    label: 'HOT · KÈO VÀNG',
    venueId: 'venue-thao-dien',
    courtId: 'td-court-02',
    venueName: 'D-Pickleball Thảo Điền',
    courtName: 'Sân 02 · Trong nhà',
    address: '12 Võ Trường Toản, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền',
    distanceKm: 1.2,
    imageUrl: venueImages.thaoDien[0],
    date: tomorrow.date,
    dateLabel: tomorrow.label,
    slotNumber: 9,
    timeRange: '18:00 - 19:30',
    format: 'Đôi nam nữ',
    duprMin: 3,
    duprMax: 3.6,
    fee: 45000,
    maxPlayers: 4,
    status: 'OPEN',
    participants: [{ ...people.bao, isHost: true }, people.tri, people.ngoc],
    amenities: ['Máy lạnh', 'Tủ đồ miễn phí', 'Bóng thi đấu Franklin X-40'],
    note: 'Giao lưu vui vẻ, tính điểm DUPR nội bộ. Có mặt trước 15 phút để khởi động.',
    isPeak: true,
  },
  {
    id: 'match-newbie-02',
    title: 'Làm quen Pickleball cuối tuần',
    label: 'GIAO LƯU NEWBIE',
    venueId: 'venue-hiep-phu',
    courtId: 'hp-court-01',
    venueName: 'Saigon Rackets Hiệp Phú',
    courtName: 'Sân 01 · Có mái che',
    address: '88 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức',
    area: 'Hiệp Phú',
    distanceKm: 3.8,
    imageUrl: venueImages.hiepPhu[0],
    date: dayAfterTomorrow.date,
    dateLabel: dayAfterTomorrow.label,
    slotNumber: 1,
    timeRange: '06:00 - 07:30',
    format: 'Giao lưu tự do',
    duprMin: 2.5,
    duprMax: 3.25,
    fee: 35000,
    maxPlayers: 4,
    status: 'OPEN',
    participants: [{ ...people.tri, isHost: true }, people.bao],
    amenities: ['Hỗ trợ mượn vợt', 'Bóng tập', 'Nước suối'],
    note: 'Ưu tiên người mới, hướng dẫn luật và kỹ thuật cơ bản trong 15 phút đầu.',
  },
  {
    id: 'match-advanced-03',
    title: 'Dinking & Third-shot Challenge',
    label: 'ADVANCED',
    venueId: 'venue-an-phu',
    courtId: 'ap-court-01',
    venueName: 'An Phú Pickleball Hub',
    courtName: 'Sân 01 · Ngoài trời',
    address: '36 Song Hành, P. An Phú, TP. Thủ Đức',
    area: 'An Phú',
    distanceKm: 5.1,
    imageUrl: venueImages.anPhu[0],
    date: thirdUpcomingDay.date,
    dateLabel: thirdUpcomingDay.label,
    slotNumber: 7,
    timeRange: '15:00 - 16:30',
    format: 'Đôi nam',
    duprMin: 3.5,
    duprMax: 4.25,
    fee: 55000,
    maxPlayers: 4,
    status: 'OPEN',
    participants: [{ ...people.long, isHost: true }, people.tri],
    amenities: ['Bóng thi đấu', 'Trọng tài hỗ trợ'],
    note: 'Kèo kỹ thuật tốc độ cao, ưu tiên DUPR từ 3.5 trở lên.',
  },
  {
    id: 'match-my-04',
    title: 'Kèo đồng đội Thảo Điền',
    label: 'KÈO CỦA BẠN',
    venueId: 'venue-thao-dien',
    courtId: 'td-court-01',
    venueName: 'D-Pickleball Thảo Điền',
    courtName: 'Sân 01 · Trong nhà',
    address: '12 Võ Trường Toản, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền',
    distanceKm: 1.2,
    imageUrl: venueImages.thaoDien[1],
    date: dayAfterTomorrow.date,
    dateLabel: dayAfterTomorrow.label,
    slotNumber: 7,
    timeRange: '15:00 - 16:30',
    format: 'Đôi nam nữ',
    duprMin: 3,
    duprMax: 3.75,
    fee: 45000,
    maxPlayers: 4,
    status: 'FULL',
    participants: [{ ...people.bao, isHost: true }, currentParticipant(initialProfile), people.ngoc, people.tri],
    amenities: ['Máy lạnh', 'Tủ đồ miễn phí', 'Phòng tắm nóng'],
    note: 'Kèo giao lưu đã đủ người, vé QR đã sẵn sàng trong Lịch của tôi.',
  },
]

const initialTickets: PlayerTicket[] = [
  {
    code: 'FTL-M26-8891',
    matchId: 'match-my-04',
    status: 'ACTIVE',
    createdAt: '2026-10-14T09:30:00+07:00',
    locker: 'Locker #14',
    paidAmount: 45000,
  },
]

const initialSchedule: PlayerScheduleItem[] = [
  {
    id: 'schedule-match-my-04',
    kind: 'MATCH',
    title: 'Kèo Social DUPR · Đôi nam nữ',
    subtitle: 'Đã thanh toán 100% · 45.000đ · Vé QR sẵn sàng',
    venueName: 'D-Pickleball Thảo Điền',
    courtName: 'Sân 01',
    date: dayAfterTomorrow.date,
    dateLabel: dayAfterTomorrow.label,
    timeRange: '15:00 - 16:30',
    status: 'UPCOMING',
    amount: 45000,
    totalAmount: 45000,
    paidAmount: 45000,
    remainingAmount: 0,
    ticketCode: 'FTL-M26-8891',
    matchId: 'match-my-04',
  },
  {
    id: 'schedule-course-01',
    kind: 'COURSE',
    title: 'Boot Camp Pickleball 3.0 → 3.5',
    subtitle: 'Buổi 4/8 · Kỹ thuật third-shot drop',
    venueName: 'Saigon Rackets Hiệp Phú',
    courtName: 'Sân 01',
    date: thirdUpcomingDay.date,
    dateLabel: thirdUpcomingDay.label,
    timeRange: '15:00 - 16:30',
    status: 'UPCOMING',
    amount: 0,
    coachName: 'HLV Lê Hoàng Dũng',
    progress: 'Buổi 4/8',
  },
  {
    id: 'schedule-history-01',
    kind: 'MATCH',
    title: 'Giao lưu DUPR · Thắng 2–1',
    subtitle: '+0.05 DUPR · Fair-play 5/5',
    venueName: 'D-Pickleball Thảo Điền',
    courtName: 'Sân 02',
    date: '2026-10-13',
    dateLabel: 'Thứ Ba, 13/10',
    timeRange: '18:00 - 19:30',
    status: 'COMPLETED',
    amount: 45000,
    matchId: 'history-match-01',
  },
]

const playerStorageKey = 'fitlyo-player-portal-v1'

const migratePlayerImages = (persistedState: unknown): PlayerState => {
  const state = persistedState as PlayerState & {
    matches?: Array<PlayerMatch & { deposit?: number }>
  }
  const imagesByVenueId = new Map(initialVenues.map((venue) => [venue.id, venue.images]))
  const imageByMatchId = new Map(initialMatches.map((match) => [match.id, match.imageUrl]))
  const participantById = new Map(initialMatches.flatMap((match) => match.participants).map((participant) => [participant.id, participant]))
  const scheduleByMatchId = new Map(initialMatches.map((match) => [match.id, { slotNumber: match.slotNumber, timeRange: match.timeRange, date: match.date, dateLabel: match.dateLabel }]))
  const scheduleById = new Map(initialSchedule.map((item) => [item.id, item]))

  return {
    ...state,
    profile: { ...initialProfile, ...state.profile, voucherBalance: state.profile?.voucherBalance ?? 0 },
    venues: initialVenues,
    matches: (state.matches ?? initialMatches).flatMap((match) => {
      const venue = initialVenues.find((candidate) => candidate.id === match.venueId)
      const courtId = match.courtId
        ?? venue?.courts.find((court) => match.courtName.startsWith(court.name))?.id

      // Bản prototype cũ từng lưu kèo FM với tên chung "Sân thi đấu" nên
      // không thể xác định slot thuộc sân con nào. Loại bản ghi lỗi này để
      // người dùng tạo lại, tránh tiếp tục hiển thị một kèo không khóa được slot.
      if (match.label === 'KÈO DO FIELD MANAGER TẠO' && venue && !courtId) return []

      return [{
        ...match,
        courtId,
        participants: match.participants.map((participant) => ({
          ...participantById.get(participant.id),
          ...participant,
          phone: participant.phone ?? participantById.get(participant.id)?.phone,
        })),
        fee: getPlayerMatchFee(match) || initialMatches.find((item) => item.id === match.id)?.fee || 0,
        ...scheduleByMatchId.get(match.id),
        imageUrl:
          imageByMatchId.get(match.id)
          ?? imagesByVenueId.get(match.venueId)?.[0]
          ?? match.imageUrl,
      }]
    }),
    schedule: (state.schedule ?? initialSchedule).map((item) => {
      const initialItem = scheduleById.get(item.id)
      if (item.kind !== 'COURT') {
        return {
          ...item,
          ...(initialItem ? {
            date: initialItem.date,
            dateLabel: initialItem.dateLabel,
            timeRange: initialItem.timeRange,
            subtitle: initialItem.subtitle,
            totalAmount: initialItem.totalAmount,
            paidAmount: initialItem.paidAmount,
            remainingAmount: initialItem.remainingAmount,
          } : {}),
        }
      }

      const [, storedVenueId, storedCourtId, storedSlotNumber] = item.slotKey?.split(':') ?? []
      const venueId = item.venueId ?? storedVenueId
      const venue = initialVenues.find((candidate) => candidate.id === venueId)
        ?? initialVenues.find((candidate) => candidate.name === item.venueName)
      const courtId = item.courtId ?? storedCourtId
      const court = venue?.courts.find((candidate) => candidate.id === courtId)
        ?? venue?.courts.find((candidate) => item.courtName.startsWith(candidate.name))
      const parsedSlotNumber = Number(storedSlotNumber)
      const slotNumber = item.slotNumber
        ?? (Number.isFinite(parsedSlotNumber) && parsedSlotNumber > 0 ? parsedSlotNumber : undefined)
        ?? court?.slots.find((slot) => slot.timeRange === item.timeRange)?.slotNumber

      return {
        ...item,
        venueId: item.venueId ?? venue?.id,
        courtId: item.courtId ?? court?.id,
        slotNumber,
        bookingCode: item.bookingCode ?? item.paymentReferenceId?.replace(/^court-/, ''),
        rescheduleCount: item.rescheduleCount ?? 0,
      }
    }),
  }
}

const ticketCodeFor = (matchId: string) => `FTL-${matchId.slice(-4).toUpperCase()}-${String(Date.now()).slice(-4)}`

const syncCourtBookingsToShared = (state: Pick<PlayerState, 'profile' | 'venues' | 'schedule'>) => {
  state.schedule.filter((item) => item.kind === 'COURT' && item.status === 'UPCOMING').forEach((item) => {
    const venue = state.venues.find((candidate) => candidate.id === item.venueId || candidate.name === item.venueName)
    const court = venue?.courts.find((candidate) => candidate.id === item.courtId || item.courtName.startsWith(candidate.name))
    const slot = court?.slots.find((candidate) => candidate.slotNumber === item.slotNumber || candidate.timeRange === item.timeRange)
    if (!venue || !court || !slot) return
    useCrossRoleStore.getState().upsertCourtBooking({
      id: item.id,
      bookingCode: item.bookingCode,
      playerId: item.bookingPlayerId ?? state.profile.id,
      playerName: item.bookingPlayerName ?? state.profile.name,
      playerPhone: item.bookingPlayerPhone ?? state.profile.phone,
      venueId: venue.id,
      venueName: venue.name,
      venueAddress: venue.address,
      courtId: court.id,
      courtName: court.name,
      courtType: court.type,
      date: item.date,
      dateLabel: item.dateLabel,
      slotNumber: slot.slotNumber,
      timeRange: slot.timeRange,
      totalAmount: item.totalAmount ?? item.amount,
      paidAmount: item.paidAmount ?? item.amount,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      bookedAt: item.bookedAt,
      rescheduleCount: item.rescheduleCount ?? 0,
    })
  })
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      matches: initialMatches,
      tickets: initialTickets,
      schedule: initialSchedule,
      venues: initialVenues,
      reviewedMatchIds: [],
      bookedSlotKeys: [],

      addFieldManagerMatch: (match) => set((state) => ({
        matches: [match, ...state.matches.filter((item) => item.id !== match.id)],
      })),

      updateProfile: (changes) => set((state) => ({ profile: { ...state.profile, ...changes } })),

      joinMatch: (matchId, method = 'WALLET') => {
        const state = get()
        const match = state.matches.find((item) => item.id === matchId)
        if (!match) return { success: false, message: 'Không tìm thấy kèo đấu.' }
        const matchFee = getPlayerMatchFee(match)
        if (matchFee <= 0) return { success: false, message: 'Kèo đấu chưa có mức phí hợp lệ. Vui lòng làm mới dữ liệu mẫu.' }
        if (match.status !== 'OPEN' || match.participants.length >= match.maxPlayers) {
          return { success: false, message: 'Kèo đã đủ người hoặc không còn mở.' }
        }
        if (match.participants.some((item) => item.id === state.profile.id)) {
          const ticket = state.tickets.find((item) => item.matchId === matchId)
          return { success: true, message: 'Bạn đã thanh toán và có vé cho kèo này.', ticketCode: ticket?.code }
        }
        if (state.profile.dupr < match.duprMin || state.profile.dupr > match.duprMax) {
          return { success: false, message: `Kèo yêu cầu DUPR ${match.duprMin.toFixed(2)} – ${match.duprMax.toFixed(2)}.` }
        }
        if (method === 'WALLET' && state.profile.walletBalance < matchFee) {
          return { success: false, message: 'Số dư Ví FITLYO không đủ để thanh toán phí tham gia.' }
        }

        const code = ticketCodeFor(matchId)
        const paymentReferenceId = `social-${code}`
        usePaymentStore.getState().createAwaitingPayment({
          referenceId: paymentReferenceId,
          service: 'SOCIAL',
          title: match.title,
          totalAmount: matchFee,
          paidAmount: matchFee,
          remainingAmount: 0,
        })
        const paymentResult = usePaymentStore.getState().confirmPayment(paymentReferenceId, method)
        if (!paymentResult.success) return paymentResult
        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: method === 'WALLET' ? current.profile.walletBalance - matchFee : current.profile.walletBalance,
          },
          matches: current.matches.map((item) => {
            if (item.id !== matchId) return item
            const participants = [...item.participants, currentParticipant(current.profile, matchFee)]
            return { ...item, participants, status: participants.length >= item.maxPlayers ? 'FULL' : 'OPEN' }
          }),
          tickets: [...current.tickets, { code, matchId, status: 'ACTIVE', createdAt: new Date().toISOString(), locker: 'Locker #08', paymentReferenceId, paidAmount: matchFee }],
          schedule: [
            {
              id: `schedule-${matchId}`,
              kind: 'MATCH',
              title: `${match.label} · ${match.format}`,
              subtitle: `Đã thanh toán 100% · ${matchFee.toLocaleString('vi-VN')}đ · Vé QR sẵn sàng`,
              venueName: match.venueName,
              courtName: match.courtName,
              date: match.date,
              dateLabel: match.dateLabel,
              timeRange: match.timeRange,
              status: 'UPCOMING',
              amount: matchFee,
              ticketCode: code,
              matchId,
              paymentReferenceId,
              totalAmount: matchFee,
              paidAmount: matchFee,
              remainingAmount: 0,
            },
            ...current.schedule,
          ],
        }))
        return { success: true, message: 'Đã thanh toán 100% phí tham gia. Vé QR đã được phát hành.', ticketCode: code }
      },

      cancelTicket: (ticketCode) => {
        const state = get()
        const ticket = state.tickets.find((item) => item.code === ticketCode)
        const match = ticket ? state.matches.find((item) => item.id === ticket.matchId) : undefined
        if (!ticket || !match) return { success: false, message: 'Không tìm thấy vé hợp lệ.' }
        if (ticket.status !== 'ACTIVE') return { success: false, message: 'Vé này không thể hủy ở trạng thái hiện tại.' }
        const paidAmount = ticket.paidAmount ?? getPlayerMatchFee(match)
        const outcome = socialRefundOutcome(paidAmount, hoursUntilEvent(match.date, match.timeRange))
        if (ticket.paymentReferenceId) {
          if (outcome.refundAmount > 0) {
            usePaymentStore.getState().refundPayment({
              referenceId: ticket.paymentReferenceId,
              amount: outcome.refundAmount,
              reason: 'Player hủy Social Session theo chính sách thời gian.',
            })
          } else {
            usePaymentStore.getState().forfeitPayment(ticket.paymentReferenceId, 'Hủy dưới 6 giờ hoặc không tham gia: mất 100% phí đã thanh toán.')
          }
        }
        set((current) => ({
          profile: { ...current.profile, walletBalance: current.profile.walletBalance + outcome.refundAmount },
          tickets: current.tickets.map((item) => item.code === ticketCode ? { ...item, status: 'CANCELLED' } : item),
          matches: current.matches.map((item) => item.id === match.id ? {
            ...item,
            participants: item.participants.filter((person) => person.id !== current.profile.id),
            status: 'OPEN',
          } : item),
          schedule: current.schedule.map((item) => item.ticketCode === ticketCode ? { ...item, status: 'CANCELLED', subtitle: outcome.refundAmount > 0 ? `Đã hoàn ${outcome.refundAmount.toLocaleString('vi-VN')}đ về Ví FITLYO` : 'Hủy muộn · Mất 100% phí đã thanh toán' } : item),
        }))
        return { success: true, message: outcome.refundAmount > 0 ? `Đã hủy vé và hoàn ${outcome.refundAmount.toLocaleString('vi-VN')}đ về Ví FITLYO.` : 'Đã hủy vé. Do hủy dưới 6 giờ, toàn bộ phí tham gia bị khấu trừ.' }
      },

      completeMatch: (ticketCode) => {
        const ticket = get().tickets.find((item) => item.code === ticketCode)
        if (!ticket || ticket.status === 'CANCELLED') return { success: false, message: 'Không thể hoàn tất vé này.' }
        if (ticket.paymentReferenceId) usePaymentStore.getState().markCompleted(ticket.paymentReferenceId)
        set((state) => ({
          tickets: state.tickets.map((item) => item.code === ticketCode ? { ...item, status: 'COMPLETED' } : item),
          matches: state.matches.map((item) => item.id === ticket.matchId ? { ...item, status: 'COMPLETED' } : item),
          schedule: state.schedule.map((item) => item.ticketCode === ticketCode ? { ...item, status: 'COMPLETED', subtitle: 'Trận đấu đã kết thúc · Chờ đánh giá' } : item),
        }))
        return { success: true, message: 'Đã mô phỏng kết thúc trận đấu.', matchId: ticket.matchId }
      },

      checkInTicket: (ticketCode) => {
        const ticket = get().tickets.find((item) => item.code === ticketCode)
        if (!ticket || ticket.status !== 'ACTIVE') return { success: false, message: 'Vé không ở trạng thái có thể check-in.' }
        set((state) => ({
          tickets: state.tickets.map((item) => item.code === ticketCode ? { ...item, status: 'CHECKED_IN', checkedInAt: '18:22' } : item),
          schedule: state.schedule.map((item) => item.ticketCode === ticketCode ? { ...item, subtitle: 'Đã check-in lúc 18:22 · Sẵn sàng vào sân' } : item),
        }))
        return { success: true, message: 'Check-in mô phỏng thành công lúc 18:22.' }
      },

      submitReview: (matchId, draft) => {
        const state = get()
        if (state.reviewedMatchIds.includes(matchId)) return { success: false, message: 'Bạn đã đánh giá trận này.' }
        if (draft.scores.some((score) => score.teamA === 0 && score.teamB === 0)) {
          return { success: false, message: 'Vui lòng nhập đủ tỉ số các set.' }
        }
        const match = state.matches.find((item) => item.id === matchId)
        const otherPlayers = match?.participants.filter((item) => item.id !== state.profile.id) ?? []
        if (otherPlayers.some((item) => !draft.ratings[item.id] || !draft.levelVotes[item.id])) {
          return { success: false, message: 'Vui lòng đánh giá đủ các bạn chơi.' }
        }
        set((current) => ({
          profile: {
            ...current.profile,
            dupr: Number((current.profile.dupr + 0.05).toFixed(2)),
            duprTrend: Number((current.profile.duprTrend + 0.05).toFixed(2)),
            reputation: Math.min(100, current.profile.reputation + 2),
            matchesPlayed: current.profile.matchesPlayed + 1,
            wins: current.profile.wins + 1,
          },
          reviewedMatchIds: [...current.reviewedMatchIds, matchId],
          schedule: current.schedule.map((item) => item.matchId === matchId ? { ...item, subtitle: 'Đã đánh giá · +0.05 DUPR · +2 điểm uy tín' } : item),
        }))
        return { success: true, message: 'Đánh giá đã gửi. DUPR và điểm uy tín đã được cập nhật.' }
      },

      purchaseVip: (plan, method) => {
        const price = plan === 'MONTHLY' ? 99000 : 899000
        const state = get()
        if (state.profile.isVip) return { success: false, message: 'Tài khoản đang có gói FITLYO VIP hiệu lực.' }
        if (method === 'WALLET' && state.profile.walletBalance < price) {
          return { success: false, message: 'Số dư Ví FITLYO không đủ.' }
        }
        const now = new Date()
        const expiresAt = new Date(now)
        if (plan === 'MONTHLY') expiresAt.setMonth(expiresAt.getMonth() + 1)
        else expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        const expires = new Intl.DateTimeFormat('vi-VN').format(expiresAt)
        const paymentReferenceId = `vip-${state.profile.id}-${Date.now()}`
        usePaymentStore.getState().createAwaitingPayment({
          referenceId: paymentReferenceId,
          service: 'VIP',
          title: plan === 'MONTHLY' ? 'FITLYO VIP · 1 tháng' : 'FITLYO VIP · 1 năm',
          totalAmount: price,
          paidAmount: price,
          remainingAmount: 0,
        })
        const paymentResult = usePaymentStore.getState().confirmPayment(paymentReferenceId, method)
        if (!paymentResult.success) return paymentResult
        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: method === 'WALLET' ? current.profile.walletBalance - price : current.profile.walletBalance,
            isVip: true,
            vipExpiresAt: expires,
          },
        }))
        return { success: true, message: `Đã thanh toán 100% và kích hoạt FITLYO VIP đến ${expires}. Gói đã kích hoạt không được hoàn tiền.` }
      },

      bookCourt: (input) => {
        const state = get()
        const session = useAuthStore.getState().session
        const bookingPlayer = session?.role === 'player' ? session : state.profile
        const venue = state.venues.find((item) => item.id === input.venueId)
        const court = venue?.courts.find((item) => item.id === input.courtId)
        const slot = court?.slots.find((item) => item.slotNumber === input.slotNumber)
        if (!venue || !court || !slot) return { success: false, message: 'Không tìm thấy slot sân.' }
        const slotKey = `${input.date}:${input.venueId}:${input.courtId}:${input.slotNumber}`
        if (state.bookedSlotKeys.includes(slotKey)) return { success: false, message: 'Bạn đã đặt slot này.' }
        const sharedState = useCrossRoleStore.getState()
        const occupiedByBooking = sharedState.courtBookings.some((item) => item.status === 'CONFIRMED' && item.venueId === input.venueId && item.date === input.date && item.courtId === input.courtId && item.slotNumber === input.slotNumber)
        const fmOverride = sharedState.slotOverrides.find((item) => item.venueId === input.venueId && item.date === input.date && item.courtId === input.courtId && item.slotNumber === input.slotNumber)
        const occupiedBySocial = state.matches.some((item) => item.status !== 'CANCELLED' && item.venueId === input.venueId && item.date === input.date && item.slotNumber === input.slotNumber && (item.courtId ? item.courtId === court.id : item.courtName.startsWith(court.name)))
        if (occupiedByBooking || occupiedBySocial || (fmOverride && fmOverride.status !== 'AVAILABLE')) return { success: false, message: 'Slot vừa được cập nhật hoặc đã có người đặt. Vui lòng chọn slot khác.' }
        if (slot.status !== 'AVAILABLE') return { success: false, message: 'Slot này hiện không nhận đặt mới.' }
        const conflict = state.schedule.find((item) => item.status === 'UPCOMING' && item.date === input.date && item.timeRange === slot.timeRange)
        if (conflict) return { success: false, message: `Bạn đã trùng lịch với “${conflict.title}” trong khung giờ ${slot.timeRange}.` }
        const totalAmount = fmOverride?.price ?? slot.price
        const amount = totalAmount
        const remainingAmount = 0
        const paymentMethod = input.paymentMethod ?? 'WALLET'
        if (paymentMethod === 'WALLET' && state.profile.walletBalance < amount) return { success: false, message: 'Số dư Ví FITLYO không đủ.' }

        const ticketCode = `FTL-C${input.slotNumber}-${String(Date.now()).slice(-5)}`
        const scheduleId = `schedule-court-${Date.now()}`
        const bookedAt = new Date().toISOString()
        const paymentReferenceId = `court-${ticketCode}`
        usePaymentStore.getState().createAwaitingPayment({
          referenceId: paymentReferenceId,
          service: 'COURT',
          title: `${venue.name} · ${court.name}`,
          totalAmount,
          paidAmount: amount,
          remainingAmount,
        })
        const paymentResult = usePaymentStore.getState().confirmPayment(paymentReferenceId, paymentMethod)
        if (!paymentResult.success) return paymentResult
        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: paymentMethod === 'WALLET' ? current.profile.walletBalance - amount : current.profile.walletBalance,
          },
          bookedSlotKeys: [...current.bookedSlotKeys, slotKey],
          schedule: [{
            id: scheduleId,
            kind: 'COURT',
            title: 'Bao trọn sân 90 phút',
            subtitle: `Đã thanh toán 100% · ${amount.toLocaleString('vi-VN')}đ · Vé QR sẵn sàng`,
            venueName: venue.name,
            courtName: `${court.name} · ${court.type}`,
            date: input.date,
            dateLabel: input.dateLabel,
            timeRange: slot.timeRange,
            status: 'UPCOMING',
            amount,
            paymentReferenceId,
            totalAmount,
            paidAmount: amount,
            remainingAmount,
            slotKey,
            bookingCode: ticketCode,
            bookedAt,
            venueId: venue.id,
            courtId: court.id,
            slotNumber: slot.slotNumber,
            rescheduleCount: 0,
            bookingPlayerId: bookingPlayer.id,
            bookingPlayerName: bookingPlayer.name,
            bookingPlayerPhone: bookingPlayer.phone,
          }, ...current.schedule],
        }))
        useCrossRoleStore.getState().upsertCourtBooking({
          id: scheduleId,
          bookingCode: ticketCode,
          playerId: bookingPlayer.id,
          playerName: bookingPlayer.name,
          playerPhone: bookingPlayer.phone,
          venueId: venue.id,
          venueName: venue.name,
          venueAddress: venue.address,
          courtId: court.id,
          courtName: court.name,
          courtType: court.type,
          date: input.date,
          dateLabel: input.dateLabel,
          slotNumber: slot.slotNumber,
          timeRange: slot.timeRange,
          totalAmount,
          paidAmount: amount,
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          bookedAt,
          rescheduleCount: 0,
        })
        return { success: true, message: `Đã thanh toán 100% phí đặt sân (${amount.toLocaleString('vi-VN')}đ).`, ticketCode }
      },

      cancelCourtBooking: (scheduleId) => {
        const state = get()
        const booking = state.schedule.find((item) => item.id === scheduleId && item.kind === 'COURT')
        if (!booking || booking.status !== 'UPCOMING') return { success: false, message: 'Lượt đặt sân không thể hủy ở trạng thái hiện tại.' }
        const paidAmount = booking.paidAmount ?? booking.amount
        const outcome = courtRefundOutcome(paidAmount, hoursUntilEvent(booking.date, booking.timeRange))
        if (booking.paymentReferenceId) {
          if (outcome.refundAmount > 0) {
            usePaymentStore.getState().refundPayment({
              referenceId: booking.paymentReferenceId,
              amount: outcome.refundAmount,
              reason: 'Player hủy đặt sân theo chính sách thời gian.',
            })
          } else {
            usePaymentStore.getState().forfeitPayment(booking.paymentReferenceId, 'Hủy đặt sân dưới 6 giờ: không hoàn phí đã thanh toán.')
          }
        }
        set((current) => ({
          profile: { ...current.profile, walletBalance: current.profile.walletBalance + outcome.refundAmount },
          bookedSlotKeys: booking.slotKey ? current.bookedSlotKeys.filter((key) => key !== booking.slotKey) : current.bookedSlotKeys,
          schedule: current.schedule.map((item) => item.id === scheduleId ? {
            ...item,
            status: 'CANCELLED',
            subtitle: outcome.refundAmount > 0 ? `${outcome.label} · ${outcome.refundAmount.toLocaleString('vi-VN')}đ` : outcome.label,
          } : item),
        }))
        useCrossRoleStore.getState().cancelCourtBooking(scheduleId)
        return { success: true, message: outcome.refundAmount > 0 ? `Đã hủy sân. ${outcome.label}.` : `Đã hủy sân. ${outcome.label}.` }
      },

      rescheduleCourtBooking: (scheduleId, input) => {
        const state = get()
        const booking = state.schedule.find((item) => item.id === scheduleId && item.kind === 'COURT')
        if (!booking || booking.status !== 'UPCOMING') return { success: false, message: 'Lượt đặt sân không thể đổi lịch ở trạng thái hiện tại.' }
        if (hoursUntilEvent(booking.date, booking.timeRange) < 12) return { success: false, message: 'Chỉ có thể đổi lịch trước giờ chơi tối thiểu 12 giờ.' }
        if ((booking.rescheduleCount ?? 0) >= 1) return { success: false, message: 'Booking này đã sử dụng quyền đổi lịch một lần.' }

        const venue = state.venues.find((item) => item.id === (booking.venueId ?? booking.slotKey?.split(':')[1]))
        const court = venue?.courts.find((item) => item.id === input.courtId)
        const slot = court?.slots.find((item) => item.slotNumber === input.slotNumber)
        if (!venue || !court || !slot) return { success: false, message: 'Không tìm thấy slot sân mới.' }
        if (slot.status !== 'AVAILABLE') return { success: false, message: 'Slot mới không còn trống.' }
        if (hoursUntilEvent(input.date, slot.timeRange) <= 0) return { success: false, message: 'Khung giờ mới phải nằm trong tương lai.' }

        const nextSlotKey = `${input.date}:${venue.id}:${court.id}:${slot.slotNumber}`
        if (state.bookedSlotKeys.includes(nextSlotKey) && nextSlotKey !== booking.slotKey) return { success: false, message: 'Slot mới vừa được người khác đặt.' }
        const conflict = state.schedule.find((item) => item.id !== scheduleId && item.status === 'UPCOMING' && item.date === input.date && item.timeRange === slot.timeRange)
        if (conflict) return { success: false, message: `Bạn đã trùng lịch với “${conflict.title}” trong khung giờ ${slot.timeRange}.` }

        const currentAmount = booking.paidAmount ?? booking.amount
        const difference = slot.price - currentAmount
        if (difference > 0 && state.profile.walletBalance < difference) return { success: false, message: `Ví FITLYO cần thêm ${difference.toLocaleString('vi-VN')}đ để đổi sang slot này.` }

        if (booking.paymentReferenceId) {
          usePaymentStore.getState().adjustConfirmedAmount(
            booking.paymentReferenceId,
            slot.price,
            difference > 0
              ? `Đổi lịch sân · Thu thêm ${difference.toLocaleString('vi-VN')}đ từ Ví FITLYO`
              : difference < 0
                ? `Đổi lịch sân · Hoàn ${Math.abs(difference).toLocaleString('vi-VN')}đ về Ví FITLYO`
                : 'Đổi lịch sân · Không phát sinh chênh lệch',
          )
        }

        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: current.profile.walletBalance - difference,
          },
          bookedSlotKeys: [
            ...current.bookedSlotKeys.filter((key) => key !== booking.slotKey && key !== nextSlotKey),
            nextSlotKey,
          ],
          schedule: current.schedule.map((item) => item.id === scheduleId ? {
            ...item,
            date: input.date,
            dateLabel: input.dateLabel,
            timeRange: slot.timeRange,
            courtName: `${court.name} · ${court.type}`,
            amount: slot.price,
            totalAmount: slot.price,
            paidAmount: slot.price,
            remainingAmount: 0,
            slotKey: nextSlotKey,
            venueId: venue.id,
            courtId: court.id,
            slotNumber: slot.slotNumber,
            rescheduleCount: 1,
            subtitle: `Đã đổi lịch 1 lần · Thanh toán 100% · ${slot.price.toLocaleString('vi-VN')}đ`,
          } : item),
        }))
        useCrossRoleStore.getState().rescheduleCourtBooking(scheduleId, {
          date: input.date,
          dateLabel: input.dateLabel,
          courtId: court.id,
          courtName: court.name,
          courtType: court.type,
          slotNumber: slot.slotNumber,
          timeRange: slot.timeRange,
          totalAmount: slot.price,
          paidAmount: slot.price,
          rescheduleCount: 1,
        })

        return {
          success: true,
          message: difference > 0
            ? `Đổi lịch thành công. Đã trừ thêm ${difference.toLocaleString('vi-VN')}đ từ Ví FITLYO.`
            : difference < 0
              ? `Đổi lịch thành công. Đã hoàn ${Math.abs(difference).toLocaleString('vi-VN')}đ về Ví FITLYO.`
              : 'Đổi lịch thành công, không phát sinh chênh lệch.',
        }
      },

      recordCoachBooking: (input) => {
        const state = get()
        if (state.schedule.some((item) => item.coachBookingId === input.bookingId)) {
          return { success: true, message: 'Lịch học này đã có trong Lịch của tôi.' }
        }

        const conflict = input.sessions.find((session) => state.schedule.some((item) => (
          item.status === 'UPCOMING'
          && item.date === session.date
          && item.timeRange === session.timeRange
        )))
        if (conflict) {
          const existing = state.schedule.find((item) => (
            item.status === 'UPCOMING'
            && item.date === conflict.date
            && item.timeRange === conflict.timeRange
          ))
          return {
            success: false,
            message: `Bạn đã trùng lịch với “${existing?.title ?? 'một hoạt động khác'}” vào ${conflict.dateLabel}, ${conflict.timeRange}.`,
          }
        }

        if (input.paymentMethod === 'WALLET' && state.profile.walletBalance < input.paymentAmount) {
          return { success: false, message: 'Số dư Ví FITLYO không đủ để thanh toán toàn bộ học phí.' }
        }

        const scheduleItems: PlayerScheduleItem[] = input.sessions.map((session) => ({
          id: `schedule-coach-${input.bookingId}-${session.sequence}`,
          kind: 'COURSE',
          title: input.title,
          subtitle: input.type === 'COURSE'
            ? `Buổi ${session.sequence}/${input.sessions.length} · Đã xác nhận với Coach`
            : 'Buổi PT 1-1 · Đã xác nhận với Coach',
          venueName: input.venueName,
          courtName: input.courtName,
          date: session.date,
          dateLabel: session.dateLabel,
          timeRange: session.timeRange,
          status: 'UPCOMING',
          amount: session.sequence === 1 ? input.paymentAmount : 0,
          coachName: input.coachName,
          progress: input.type === 'COURSE' ? `Buổi ${session.sequence}/${input.sessions.length}` : 'PT 1-1',
          coachBookingId: input.bookingId,
          coachSessionId: session.id,
          paymentReferenceId: `coach-${input.bookingId}`,
          totalAmount: input.totalAmount,
          paidAmount: session.sequence === 1 ? input.paymentAmount : 0,
          remainingAmount: 0,
        }))

        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: input.paymentMethod === 'WALLET'
              ? current.profile.walletBalance - input.paymentAmount
              : current.profile.walletBalance,
          },
          schedule: [...scheduleItems, ...current.schedule],
        }))
        return { success: true, message: 'Đã thanh toán 100% học phí và thêm lịch học vào Lịch của tôi.' }
      },

      creditWallet: (amount) => {
        if (amount <= 0) return
        set((state) => ({ profile: { ...state.profile, walletBalance: state.profile.walletBalance + amount } }))
      },

      creditVoucher: (amount) => {
        if (amount <= 0) return
        set((state) => ({ profile: { ...state.profile, voucherBalance: state.profile.voucherBalance + amount } }))
      },

      cancelCoachSchedule: (bookingId, subtitle, sessionId) => set((state) => ({
        schedule: state.schedule.map((item) => (
          item.coachBookingId === bookingId && (!sessionId || item.coachSessionId === sessionId)
            ? { ...item, status: 'CANCELLED', subtitle }
            : item
        )),
      })),

      processTimeBasedPolicies: () => {
        const state = get()
        const autoCancelledMatchIds = state.matches
          .filter((match) => match.status !== 'CANCELLED'
            && match.participants.length < match.maxPlayers
            && hoursUntilEvent(match.date, match.timeRange) <= 1)
          .map((match) => match.id)
        const noShowTickets = state.tickets.filter((ticket) => {
          const match = state.matches.find((item) => item.id === ticket.matchId)
          return ticket.status === 'ACTIVE'
            && !!match
            && !autoCancelledMatchIds.includes(match.id)
            && hoursUntilEvent(match.date, match.timeRange) <= 0
        })
        const refundedTickets = state.tickets.filter((ticket) => ticket.status === 'ACTIVE' && autoCancelledMatchIds.includes(ticket.matchId))
        if (!autoCancelledMatchIds.length && !noShowTickets.length) return

        let walletRefund = 0
        refundedTickets.forEach((ticket) => {
          const match = state.matches.find((item) => item.id === ticket.matchId)
          const amount = ticket.paidAmount ?? (match ? getPlayerMatchFee(match) : 0)
          walletRefund += amount
          if (ticket.paymentReferenceId) usePaymentStore.getState().refundPayment({
            referenceId: ticket.paymentReferenceId,
            amount,
            reason: 'Social Session thiếu người và tự hủy trước giờ chơi 60 phút.',
          })
        })
        noShowTickets.forEach((ticket) => {
          if (ticket.paymentReferenceId) usePaymentStore.getState().forfeitPayment(ticket.paymentReferenceId, 'Player không đến Social Session: mất 100% phí đã thanh toán.')
        })
        const affectedTicketCodes = new Set([...refundedTickets, ...noShowTickets].map((ticket) => ticket.code))
        const refundedCodes = new Set(refundedTickets.map((ticket) => ticket.code))
        set((current) => ({
          profile: { ...current.profile, walletBalance: current.profile.walletBalance + walletRefund },
          matches: current.matches.map((match) => autoCancelledMatchIds.includes(match.id) ? { ...match, status: 'CANCELLED' } : match),
          tickets: current.tickets.map((ticket) => affectedTicketCodes.has(ticket.code) ? { ...ticket, status: 'CANCELLED' } : ticket),
          schedule: current.schedule.map((item) => item.ticketCode && affectedTicketCodes.has(item.ticketCode) ? {
            ...item,
            status: 'CANCELLED',
            subtitle: refundedCodes.has(item.ticketCode)
              ? `Kèo thiếu người · Đã hoàn ${(item.paidAmount ?? item.amount).toLocaleString('vi-VN')}đ về Ví FITLYO`
              : 'Không đến · Mất 100% phí đã thanh toán',
          } : item),
        }))
      },

      resetPlayerDemo: () => {
        usePaymentStore.getState().resetPayments()
        useCrossRoleStore.getState().resetCrossRoleDemo()
        set({
          profile: initialProfile,
          matches: initialMatches,
          tickets: initialTickets,
          schedule: initialSchedule,
          venues: initialVenues,
          reviewedMatchIds: [],
          bookedSlotKeys: [],
        })
        syncCourtBookingsToShared({ profile: initialProfile, venues: initialVenues, schedule: initialSchedule })
      },
    }),
    {
      name: playerStorageKey,
      storage: createJSONStorage(() => window.localStorage),
      version: 10,
      migrate: migratePlayerImages,
    },
  ),
)

// Reconcile bookings created by older prototype versions into the shared
// Player ↔ Field Manager source of truth after persisted state is hydrated.
if (typeof window !== 'undefined') {
  window.queueMicrotask(() => syncCourtBookingsToShared(usePlayerStore.getState()))
  window.addEventListener('storage', (event) => {
    if (event.key === playerStorageKey) void usePlayerStore.persist.rehydrate()
  })
}
