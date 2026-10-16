import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { communityHero, matchNewbie, matchWeekend, venueIndoor } from '@/assets/pickleball'
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
  updateProfile: (changes: Partial<Pick<PlayerProfile, 'name' | 'username' | 'phone' | 'city' | 'avatarUrl'>>) => void
  joinMatch: (matchId: string, method?: 'WALLET' | 'VIETQR') => ActionResult
  createMatch: (input: {
    title: string
    venueId: string
    courtName: string
    date: string
    dateLabel: string
    slotNumber: number
    timeRange: string
    format: PlayerMatch['format']
    duprMin: number
    duprMax: number
    deposit: number
    paymentMethod?: 'WALLET' | 'VIETQR'
  }) => ActionResult
  cancelTicket: (ticketCode: string) => ActionResult
  completeMatch: (ticketCode: string) => ActionResult
  checkInTicket: (ticketCode: string) => ActionResult
  submitReview: (matchId: string, draft: ReviewDraft) => ActionResult
  purchaseVip: (plan: 'MONTHLY' | 'YEARLY', method: 'WALLET' | 'VIETQR') => ActionResult
  bookCourt: (input: {
    venueId: string
    courtId: string
    slotNumber: number
    date: string
    dateLabel: string
    mode: 'PRIVATE' | 'SOCIAL'
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
    depositAmount: number
    paymentMethod: CoachPaymentMethod
    sessions: CoachBookingSession[]
  }) => ActionResult
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
  coins: 450,
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
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    dupr: 3.1,
    reputation: 98,
  },
  tri: {
    id: 'player_tri',
    name: 'Trần Minh Trí',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    dupr: 3.4,
    reputation: 95,
  },
  ngoc: {
    id: 'player_ngoc',
    name: 'Nguyễn Bích Ngọc',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    dupr: 3.35,
    reputation: 100,
  },
  long: {
    id: 'player_long',
    name: 'Phạm Thành Long',
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

const makeSlots = (offset = 0): PlayerVenue['courts'][number]['slots'] => [
  { slotNumber: 1, timeRange: '06:00 - 07:30', price: 140000 + offset, status: 'AVAILABLE' },
  { slotNumber: 2, timeRange: '07:30 - 09:00', price: 140000 + offset, status: 'PRIVATE', label: 'Đã bao sân' },
  { slotNumber: 3, timeRange: '09:00 - 10:30', price: 100000 + offset, status: 'COACHING', label: 'Lớp HLV Dũng' },
  { slotNumber: 4, timeRange: '15:30 - 17:00', price: 100000 + offset, status: 'AVAILABLE' },
  { slotNumber: 5, timeRange: '18:30 - 20:00', price: 220000 + offset, status: 'SOCIAL', label: 'Kèo Social', duprRange: '3.0 - 3.5', players: '3/4', isPeak: true },
  { slotNumber: 6, timeRange: '20:00 - 21:30', price: 160000 + offset, status: 'AVAILABLE' },
]

const initialVenues: PlayerVenue[] = [
  {
    id: 'venue-thao-dien',
    name: 'D-Pickleball Thảo Điền',
    address: '12 Võ Trường Toản, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền',
    distanceKm: 1.2,
    rating: 4.9,
    reviewCount: 128,
    openingHours: '06:00 - 22:00 hàng ngày',
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
    openingHours: '05:30 - 22:00 hàng ngày',
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
    openingHours: '06:00 - 21:30 hàng ngày',
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

const currentParticipant = (profile: PlayerProfile): PlayerMatch['participants'][number] => ({
  id: profile.id,
  name: profile.name,
  avatarUrl: profile.avatarUrl,
  dupr: profile.dupr,
  reputation: profile.reputation,
  isCurrentUser: true,
})

const initialMatches: PlayerMatch[] = [
  {
    id: 'match-gold-01',
    title: 'Giao lưu cân trình giờ vàng',
    label: 'HOT · KÈO VÀNG',
    venueId: 'venue-thao-dien',
    venueName: 'D-Pickleball Thảo Điền',
    courtName: 'Sân 02 · Trong nhà',
    address: '12 Võ Trường Toản, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền',
    distanceKm: 1.2,
    imageUrl: venueImages.thaoDien[0],
    date: '2026-10-15',
    dateLabel: 'Hôm nay, 15/10/2026',
    slotNumber: 5,
    timeRange: '18:30 - 20:00',
    format: 'Đôi nam nữ',
    duprMin: 3,
    duprMax: 3.6,
    deposit: 45000,
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
    venueName: 'Saigon Rackets Hiệp Phú',
    courtName: 'Sân 01 · Có mái che',
    address: '88 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức',
    area: 'Hiệp Phú',
    distanceKm: 3.8,
    imageUrl: venueImages.hiepPhu[0],
    date: '2026-10-16',
    dateLabel: 'Ngày mai, 16/10/2026',
    slotNumber: 1,
    timeRange: '06:00 - 07:30',
    format: 'Giao lưu tự do',
    duprMin: 2.5,
    duprMax: 3.25,
    deposit: 35000,
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
    venueName: 'An Phú Pickleball Hub',
    courtName: 'Sân 01 · Ngoài trời',
    address: '36 Song Hành, P. An Phú, TP. Thủ Đức',
    area: 'An Phú',
    distanceKm: 5.1,
    imageUrl: venueImages.anPhu[0],
    date: '2026-10-17',
    dateLabel: 'Thứ Bảy, 17/10/2026',
    slotNumber: 4,
    timeRange: '15:30 - 17:00',
    format: 'Đôi nam',
    duprMin: 3.5,
    duprMax: 4.25,
    deposit: 55000,
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
    venueName: 'D-Pickleball Thảo Điền',
    courtName: 'Sân 01 · Trong nhà',
    address: '12 Võ Trường Toản, P. Thảo Điền, TP. Thủ Đức',
    area: 'Thảo Điền',
    distanceKm: 1.2,
    imageUrl: venueImages.thaoDien[1],
    date: '2026-10-16',
    dateLabel: 'Ngày mai, 16/10/2026',
    slotNumber: 4,
    timeRange: '15:30 - 17:00',
    format: 'Đôi nam nữ',
    duprMin: 3,
    duprMax: 3.75,
    deposit: 45000,
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
  },
]

const initialSchedule: PlayerScheduleItem[] = [
  {
    id: 'schedule-match-my-04',
    kind: 'MATCH',
    title: 'Kèo Social DUPR · Đôi nam nữ',
    subtitle: 'Đã cọc 45.000đ · Vé QR sẵn sàng',
    venueName: 'D-Pickleball Thảo Điền',
    courtName: 'Sân 01',
    date: '2026-10-16',
    dateLabel: 'Ngày mai, Thứ Sáu 16/10',
    timeRange: '15:30 - 17:00',
    status: 'UPCOMING',
    amount: 45000,
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
    date: '2026-10-17',
    dateLabel: 'Thứ Bảy, 17/10',
    timeRange: '15:30 - 17:00',
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
    timeRange: '18:30 - 20:00',
    status: 'COMPLETED',
    amount: 45000,
    matchId: 'history-match-01',
  },
]

const playerStorageKey = 'fitlyo-player-portal-v1'

const migratePlayerImages = (persistedState: unknown): PlayerState => {
  const state = persistedState as PlayerState
  const imagesByVenueId = new Map(initialVenues.map((venue) => [venue.id, venue.images]))
  const imageByMatchId = new Map(initialMatches.map((match) => [match.id, match.imageUrl]))

  return {
    ...state,
    venues: (state.venues ?? initialVenues).map((venue) => ({
      ...venue,
      images: imagesByVenueId.get(venue.id) ?? venue.images,
    })),
    matches: (state.matches ?? initialMatches).map((match) => ({
      ...match,
      imageUrl:
        imageByMatchId.get(match.id)
        ?? imagesByVenueId.get(match.venueId)?.[0]
        ?? match.imageUrl,
    })),
  }
}

const ticketCodeFor = (matchId: string) => `FTL-${matchId.slice(-4).toUpperCase()}-${String(Date.now()).slice(-4)}`

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

      updateProfile: (changes) => set((state) => ({ profile: { ...state.profile, ...changes } })),

      joinMatch: (matchId, method = 'WALLET') => {
        const state = get()
        const match = state.matches.find((item) => item.id === matchId)
        if (!match) return { success: false, message: 'Không tìm thấy kèo đấu.' }
        if (match.status !== 'OPEN' || match.participants.length >= match.maxPlayers) {
          return { success: false, message: 'Kèo đã đủ người hoặc không còn mở.' }
        }
        if (match.participants.some((item) => item.id === state.profile.id)) {
          const ticket = state.tickets.find((item) => item.matchId === matchId)
          return { success: true, message: 'Bạn đã giữ chỗ trong kèo này.', ticketCode: ticket?.code }
        }
        if (state.profile.dupr < match.duprMin || state.profile.dupr > match.duprMax) {
          return { success: false, message: `Kèo yêu cầu DUPR ${match.duprMin.toFixed(2)} – ${match.duprMax.toFixed(2)}.` }
        }
        if (method === 'WALLET' && state.profile.walletBalance < match.deposit) {
          return { success: false, message: 'Số dư Ví FITLYO không đủ để khóa cọc.' }
        }

        const code = ticketCodeFor(matchId)
        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: method === 'WALLET' ? current.profile.walletBalance - match.deposit : current.profile.walletBalance,
          },
          matches: current.matches.map((item) => {
            if (item.id !== matchId) return item
            const participants = [...item.participants, currentParticipant(current.profile)]
            return { ...item, participants, status: participants.length >= item.maxPlayers ? 'FULL' : 'OPEN' }
          }),
          tickets: [...current.tickets, { code, matchId, status: 'ACTIVE', createdAt: new Date().toISOString(), locker: 'Locker #08' }],
          schedule: [
            {
              id: `schedule-${matchId}`,
              kind: 'MATCH',
              title: `${match.label} · ${match.format}`,
              subtitle: `Đã cọc ${match.deposit.toLocaleString('vi-VN')}đ · Vé QR sẵn sàng`,
              venueName: match.venueName,
              courtName: match.courtName,
              date: match.date,
              dateLabel: match.dateLabel,
              timeRange: match.timeRange,
              status: 'UPCOMING',
              amount: match.deposit,
              ticketCode: code,
              matchId,
            },
            ...current.schedule,
          ],
        }))
        return { success: true, message: 'Đã khóa cọc và giữ chỗ thành công.', ticketCode: code }
      },

      createMatch: (input) => {
        const state = get()
        const venue = state.venues.find((item) => item.id === input.venueId)
        if (!venue) return { success: false, message: 'Không tìm thấy cụm sân.' }
        const paymentMethod = input.paymentMethod ?? 'WALLET'
        if (paymentMethod === 'WALLET' && state.profile.walletBalance < input.deposit) {
          return { success: false, message: 'Số dư ví không đủ để mở kèo.' }
        }
        const id = `match-created-${Date.now()}`
        const newMatch: PlayerMatch = {
          id,
          title: input.title,
          label: 'KÈO DO BẠN TẠO',
          venueId: venue.id,
          venueName: venue.name,
          courtName: input.courtName,
          address: venue.address,
          area: venue.area,
          distanceKm: venue.distanceKm,
          imageUrl: venue.images[0],
          date: input.date,
          dateLabel: input.dateLabel,
          slotNumber: input.slotNumber,
          timeRange: input.timeRange,
          format: input.format,
          duprMin: input.duprMin,
          duprMax: input.duprMax,
          deposit: input.deposit,
          maxPlayers: 4,
          status: 'OPEN',
          participants: [{ ...currentParticipant(state.profile), isHost: true }],
          amenities: venue.amenities.slice(0, 3),
          note: 'Kèo mới do Nguyễn Văn An khởi tạo. Chờ thêm người chơi phù hợp DUPR.',
        }
        const code = ticketCodeFor(id)
        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: paymentMethod === 'WALLET' ? current.profile.walletBalance - input.deposit : current.profile.walletBalance,
          },
          matches: [newMatch, ...current.matches],
          tickets: [...current.tickets, { code, matchId: id, status: 'ACTIVE', createdAt: new Date().toISOString(), locker: 'Cấp khi đủ người' }],
          schedule: [{
            id: `schedule-${id}`,
            kind: 'MATCH',
            title: `${newMatch.label} · ${newMatch.format}`,
            subtitle: 'Bạn là Host · Đang chờ ghép thêm 3 người',
            venueName: newMatch.venueName,
            courtName: newMatch.courtName,
            date: newMatch.date,
            dateLabel: newMatch.dateLabel,
            timeRange: newMatch.timeRange,
            status: 'UPCOMING',
            amount: newMatch.deposit,
            ticketCode: code,
            matchId: id,
          }, ...current.schedule],
        }))
        return { success: true, message: 'Kèo mới đã được mở và đăng lên bảng tin.', matchId: id, ticketCode: code }
      },

      cancelTicket: (ticketCode) => {
        const state = get()
        const ticket = state.tickets.find((item) => item.code === ticketCode)
        const match = ticket ? state.matches.find((item) => item.id === ticket.matchId) : undefined
        if (!ticket || !match) return { success: false, message: 'Không tìm thấy vé hợp lệ.' }
        if (ticket.status !== 'ACTIVE') return { success: false, message: 'Vé này không thể hủy ở trạng thái hiện tại.' }
        set((current) => ({
          profile: { ...current.profile, walletBalance: current.profile.walletBalance + match.deposit },
          tickets: current.tickets.map((item) => item.code === ticketCode ? { ...item, status: 'CANCELLED' } : item),
          matches: current.matches.map((item) => item.id === match.id ? {
            ...item,
            participants: item.participants.filter((person) => person.id !== current.profile.id),
            status: 'OPEN',
          } : item),
          schedule: current.schedule.map((item) => item.ticketCode === ticketCode ? { ...item, status: 'CANCELLED', subtitle: `Đã hoàn ${match.deposit.toLocaleString('vi-VN')}đ về Ví FITLYO` } : item),
        }))
        return { success: true, message: `Đã hủy vé và hoàn ${match.deposit.toLocaleString('vi-VN')}đ về ví.` }
      },

      completeMatch: (ticketCode) => {
        const ticket = get().tickets.find((item) => item.code === ticketCode)
        if (!ticket || ticket.status === 'CANCELLED') return { success: false, message: 'Không thể hoàn tất vé này.' }
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
            coins: current.profile.coins + 50,
          },
          reviewedMatchIds: [...current.reviewedMatchIds, matchId],
          schedule: current.schedule.map((item) => item.matchId === matchId ? { ...item, subtitle: 'Đã đánh giá · +0.05 DUPR · +50 FITLYO Coins' } : item),
        }))
        return { success: true, message: 'Đánh giá đã gửi. Bạn nhận +0.05 DUPR và 50 FITLYO Coins.' }
      },

      purchaseVip: (plan, method) => {
        const price = plan === 'MONTHLY' ? 99000 : 899000
        const state = get()
        if (state.profile.isVip) return { success: false, message: 'Tài khoản đang có gói FITLYO VIP hiệu lực.' }
        if (method === 'WALLET' && state.profile.walletBalance < price) {
          return { success: false, message: 'Số dư Ví FITLYO không đủ.' }
        }
        const expires = plan === 'MONTHLY' ? '15/11/2026' : '15/10/2027'
        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: method === 'WALLET' ? current.profile.walletBalance - price : current.profile.walletBalance,
            isVip: true,
            vipExpiresAt: expires,
          },
        }))
        return { success: true, message: `Đã kích hoạt FITLYO VIP đến ${expires}.` }
      },

      bookCourt: (input) => {
        const state = get()
        const venue = state.venues.find((item) => item.id === input.venueId)
        const court = venue?.courts.find((item) => item.id === input.courtId)
        const slot = court?.slots.find((item) => item.slotNumber === input.slotNumber)
        if (!venue || !court || !slot) return { success: false, message: 'Không tìm thấy slot sân.' }
        const slotKey = `${input.date}:${input.venueId}:${input.courtId}:${input.slotNumber}`
        if (state.bookedSlotKeys.includes(slotKey)) return { success: false, message: 'Bạn đã đặt slot này.' }
        if (slot.status !== 'AVAILABLE') return { success: false, message: 'Slot này hiện không nhận đặt mới.' }
        const amount = input.mode === 'PRIVATE' ? slot.price : Math.ceil(slot.price / 4)
        const paymentMethod = input.paymentMethod ?? 'WALLET'
        if (paymentMethod === 'WALLET' && state.profile.walletBalance < amount) return { success: false, message: 'Số dư Ví FITLYO không đủ.' }

        if (input.mode === 'SOCIAL') {
          const createResult = get().createMatch({
            title: 'Kèo Social từ slot sân',
            venueId: venue.id,
            courtName: `${court.name} · ${court.type}`,
            date: input.date,
            dateLabel: input.dateLabel,
            slotNumber: slot.slotNumber,
            timeRange: slot.timeRange,
            format: 'Đôi nam nữ',
            duprMin: Math.max(1, state.profile.dupr - 0.5),
            duprMax: Math.min(6, state.profile.dupr + 0.5),
            deposit: amount,
            paymentMethod,
          })
          if (createResult.success) set((current) => ({ bookedSlotKeys: [...current.bookedSlotKeys, slotKey] }))
          return createResult
        }

        const ticketCode = `FTL-C${input.slotNumber}-${String(Date.now()).slice(-5)}`
        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: paymentMethod === 'WALLET' ? current.profile.walletBalance - amount : current.profile.walletBalance,
          },
          bookedSlotKeys: [...current.bookedSlotKeys, slotKey],
          schedule: [{
            id: `schedule-court-${Date.now()}`,
            kind: 'COURT',
            title: 'Bao trọn sân 90 phút',
            subtitle: `Đã thanh toán cọc ${amount.toLocaleString('vi-VN')}đ · Mã ${ticketCode}`,
            venueName: venue.name,
            courtName: `${court.name} · ${court.type}`,
            date: input.date,
            dateLabel: input.dateLabel,
            timeRange: slot.timeRange,
            status: 'UPCOMING',
            amount,
          }, ...current.schedule],
        }))
        return { success: true, message: 'Đã đặt bao sân và thêm lịch vào Lịch của tôi.', ticketCode }
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

        if (input.paymentMethod === 'WALLET' && state.profile.walletBalance < input.depositAmount) {
          return { success: false, message: 'Số dư Ví FITLYO không đủ để thanh toán cọc 50%.' }
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
          amount: session.sequence === 1 ? input.depositAmount : 0,
          coachName: input.coachName,
          progress: input.type === 'COURSE' ? `Buổi ${session.sequence}/${input.sessions.length}` : 'PT 1-1',
          coachBookingId: input.bookingId,
          coachSessionId: session.id,
        }))

        set((current) => ({
          profile: {
            ...current.profile,
            walletBalance: input.paymentMethod === 'WALLET'
              ? current.profile.walletBalance - input.depositAmount
              : current.profile.walletBalance,
          },
          schedule: [...scheduleItems, ...current.schedule],
        }))
        return { success: true, message: 'Đã thanh toán cọc 50% và thêm lịch học vào Lịch của tôi.' }
      },

      resetPlayerDemo: () => set({
        profile: initialProfile,
        matches: initialMatches,
        tickets: initialTickets,
        schedule: initialSchedule,
        venues: initialVenues,
        reviewedMatchIds: [],
        bookedSlotKeys: [],
      }),
    }),
    {
      name: playerStorageKey,
      storage: createJSONStorage(() => window.localStorage),
      version: 1,
      migrate: migratePlayerImages,
    },
  ),
)
