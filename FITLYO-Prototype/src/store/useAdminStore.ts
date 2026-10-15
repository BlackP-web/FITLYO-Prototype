import { create } from 'zustand'

export type AdminUserRole = 'PLAYER' | 'VIP_PLAYER' | 'COACH' | 'FIELD_MANAGER' | 'OPERATOR'
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED'

export interface AdminUserRecord {
  id: string
  name: string
  email: string
  phone: string
  role: AdminUserRole
  dupr?: number
  reputation: number
  walletBalance: number
  escrowBalance: number
  walletFrozen?: boolean
  status: AdminUserStatus
  reports: number
  joinedAt: string
  lastActive: string
}

export interface AdminDispute {
  id: string
  subject: string
  category: 'NO_SHOW' | 'WEATHER' | 'DUPR_FRAUD' | 'PAYMENT'
  claimant: string
  respondent: string
  amount: number
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'LEGAL_REVIEW'
  openedAt: string
  description: string
  policy: string
  recommendation: string
  evidence: string[]
  resolution?: string
}

export interface SlotPolicy {
  number: number
  start: string
  end: string
  isPeak: boolean
}

export interface PlatformConfig {
  slots: SlotPolicy[]
  cleanupMinutes: number
  socialCommission: number
  coachCommission: number
  vipCommission: number
  freeCancellationHours: number
  noShowPenaltyShare: number
  duprWarningThreshold: number
}

interface AdminState {
  users: AdminUserRecord[]
  disputes: AdminDispute[]
  config: PlatformConfig
  applyUserAction: (userId: string, action: 'WARN' | 'FREEZE_WALLET' | 'SUSPEND_30' | 'UNLOCK', reason: string) => boolean
  changeUserRole: (userId: string, role: AdminUserRole) => boolean
  resolveDispute: (id: string, resolution: 'REFUND' | 'REJECT' | 'LEGAL') => boolean
  saveConfig: (config: PlatformConfig) => void
  restoreDefaultConfig: () => void
}

const initialUsers: AdminUserRecord[] = [
  { id: 'U1021', name: 'Nguyễn Văn An', email: 'player@fitlyo.vn', phone: '0912 345 678', role: 'VIP_PLAYER', dupr: 3.42, reputation: 98, walletBalance: 1200000, escrowBalance: 90000, status: 'ACTIVE', reports: 0, joinedAt: '08/08/2026', lastActive: '2 phút trước' },
  { id: 'U1045', name: 'Lê Hoàng Dũng', email: 'coach@fitlyo.vn', phone: '0909 485 285', role: 'COACH', dupr: 4.85, reputation: 100, walletBalance: 6840000, escrowBalance: 14200000, status: 'ACTIVE', reports: 0, joinedAt: '15/06/2026', lastActive: '12 phút trước' },
  { id: 'U0988', name: 'Trần Đình Trọng', email: 'trong.tran@example.vn', phone: '0988 127 433', role: 'PLAYER', dupr: 2.1, reputation: 45, walletBalance: 0, escrowBalance: 0, status: 'ACTIVE', reports: 3, joinedAt: '21/07/2026', lastActive: '1 giờ trước' },
  { id: 'U1072', name: 'Nguyễn Quốc Bảo', email: 'owner@fitlyo.vn', phone: '0908 112 233', role: 'FIELD_MANAGER', reputation: 96, walletBalance: 18400000, escrowBalance: 32600000, status: 'ACTIVE', reports: 1, joinedAt: '01/05/2026', lastActive: '5 phút trước' },
  { id: 'U1094', name: 'Phạm Thu Hà', email: 'phamthuha@example.vn', phone: '0938 663 118', role: 'PLAYER', dupr: 2.75, reputation: 82, walletBalance: 380000, escrowBalance: 45000, status: 'SUSPENDED', reports: 2, joinedAt: '19/09/2026', lastActive: '3 ngày trước' },
  { id: 'U0881', name: 'Đặng Tuấn Kiệt', email: 'tuan.kiet@example.vn', phone: '0918 776 554', role: 'COACH', dupr: 4.62, reputation: 99, walletBalance: 9120000, escrowBalance: 8700000, status: 'ACTIVE', reports: 0, joinedAt: '12/04/2026', lastActive: '28 phút trước' },
]

const initialDisputes: AdminDispute[] = [
  {
    id: 'DIS-12', subject: 'Kèo #FTL-M26-8891 · Bỏ trận giữa Set 1', category: 'NO_SHOW', claimant: 'Minh Trí', respondent: 'Văn Hùng', amount: 45000, severity: 'HIGH', status: 'INVESTIGATING', openedAt: '14/10/2026 · 20:45',
    description: 'Người bị khiếu nại rời sân giữa Set 1 và không thanh toán phần tiền sân còn lại.',
    policy: 'Điều 5.2 — Thành viên tự ý bỏ kèo sau check-in mất 100% cọc và bị trừ điểm uy tín.',
    recommendation: 'Chuyển 100% cọc cho nhóm còn lại và trừ 15 điểm uy tín tài khoản bị khiếu nại.',
    evidence: ['Ảnh bảng điểm lúc 20:11', 'Lịch sử check-in QR', 'Biên bản xác nhận của Field Manager'],
  },
  {
    id: 'DIS-13', subject: 'Đặt sân An Khánh · Mưa ngập sân', category: 'WEATHER', claimant: 'Nguyễn Tuấn', respondent: 'Chủ sân An Khánh', amount: 180000, severity: 'MEDIUM', status: 'OPEN', openedAt: '14/10/2026 · 18:52',
    description: 'Mưa lớn khiến sân ngoài trời ngập nước nhưng chủ sân từ chối hoàn cọc cho khách.',
    policy: 'Điều 7.1 — Sự kiện thời tiết bất khả kháng được hoàn 100% tiền cọc nếu sân không thể vận hành.',
    recommendation: 'Hoàn 180.000đ về Ví người chơi; ghi nhận trợ giá bảo trì 50.000đ cho cụm sân.',
    evidence: ['2 ảnh sân ngập lúc 18:35', 'Video đối soát tại quầy', 'Dữ liệu thời tiết khu vực'],
  },
  {
    id: 'DIS-09', subject: 'Nghi vấn khai gian DUPR · Kèo MM-9011', category: 'DUPR_FRAUD', claimant: 'Cộng đồng người chơi', respondent: 'Tài khoản #U0971', amount: 90000, severity: 'HIGH', status: 'OPEN', openedAt: '13/10/2026 · 22:10',
    description: 'Tài khoản tự khai DUPR 2.3 nhưng dữ liệu 12 trận gần nhất cho thấy năng lực tương đương DUPR 4.0.',
    policy: 'Điều 9.4 — Sandbagging có chủ đích bị khóa matchmaking tối thiểu 30 ngày.',
    recommendation: 'Tạm khóa matchmaking, yêu cầu đánh giá DUPR có giám sát và hoàn cọc cho hai trận bị ảnh hưởng.',
    evidence: ['Video 3 trận gần nhất', 'Biểu đồ hiệu suất 12 trận', '5 báo cáo từ đối thủ'],
  },
  {
    id: 'DIS-05', subject: 'Đối soát học phí khóa Coach', category: 'PAYMENT', claimant: 'Học viên Bảo Trân', respondent: 'Coach N.H.L', amount: 600000, severity: 'LOW', status: 'RESOLVED', openedAt: '10/10/2026 · 09:15',
    description: 'Học viên yêu cầu hoàn phí hai buổi chưa học do chấn thương có xác nhận y tế.',
    policy: 'Chính sách khóa học 3.3 — Hoàn theo số buổi chưa sử dụng khi có lý do y tế hợp lệ.',
    recommendation: 'Hoàn 600.000đ từ Escrow khóa học.',
    evidence: ['Giấy xác nhận y tế', 'Lịch điểm danh khóa học'], resolution: 'Đã hoàn 600.000đ ngày 11/10/2026.',
  },
]

export const defaultPlatformConfig: PlatformConfig = {
  slots: [
    { number: 1, start: '06:00', end: '07:30', isPeak: false },
    { number: 2, start: '07:30', end: '09:00', isPeak: false },
    { number: 3, start: '09:00', end: '10:30', isPeak: false },
    { number: 4, start: '15:30', end: '17:00', isPeak: false },
    { number: 5, start: '18:30', end: '20:00', isPeak: true },
    { number: 6, start: '20:00', end: '21:30', isPeak: false },
  ],
  cleanupMinutes: 15,
  socialCommission: 5,
  coachCommission: 10,
  vipCommission: 0,
  freeCancellationHours: 6,
  noShowPenaltyShare: 100,
  duprWarningThreshold: 0.75,
}

const cloneConfig = (config: PlatformConfig): PlatformConfig => ({
  ...config,
  slots: config.slots.map((slot) => ({ ...slot })),
})

export const useAdminStore = create<AdminState>((set, get) => ({
  users: initialUsers,
  disputes: initialDisputes,
  config: cloneConfig(defaultPlatformConfig),

  applyUserAction: (userId, action, reason) => {
    if (!reason.trim() && action !== 'UNLOCK') return false
    const target = get().users.find((user) => user.id === userId)
    if (!target) return false

    set({
      users: get().users.map((user) => {
        if (user.id !== userId) return user
        if (action === 'UNLOCK') return { ...user, status: 'ACTIVE', walletFrozen: false }
        if (action === 'WARN') return user
        if (action === 'SUSPEND_30') return { ...user, status: 'SUSPENDED' }
        return { ...user, walletFrozen: true }
      }),
    })
    return true
  },

  changeUserRole: (userId, role) => {
    if (!get().users.some((user) => user.id === userId)) return false
    set({ users: get().users.map((user) => user.id === userId ? { ...user, role } : user) })
    return true
  },

  resolveDispute: (id, resolution) => {
    if (!get().disputes.some((item) => item.id === id)) return false
    set({
      disputes: get().disputes.map((item) =>
        item.id === id
          ? {
              ...item,
              status: resolution === 'LEGAL' ? 'LEGAL_REVIEW' : 'RESOLVED',
              resolution:
                resolution === 'REFUND'
                  ? `Đã phê duyệt hoàn ${new Intl.NumberFormat('vi-VN').format(item.amount)}đ về Ví FITLYO.`
                  : resolution === 'LEGAL'
                    ? 'Đã chuyển hồ sơ sang bộ phận pháp lý để xem xét.'
                    : 'Khiếu nại không đủ căn cứ; Escrow được giải ngân theo giao dịch ban đầu.',
            }
          : item,
      ),
    })
    return true
  },

  saveConfig: (config) => set({ config: cloneConfig(config) }),
  restoreDefaultConfig: () => set({ config: cloneConfig(defaultPlatformConfig) }),
}))
