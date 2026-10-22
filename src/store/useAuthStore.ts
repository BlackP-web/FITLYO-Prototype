import { create } from 'zustand'
import { coachMale } from '@/assets/pickleball'

export type AuthRole = 'player' | 'fm' | 'coach' | 'admin'
export type KycStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_SUPPLEMENT'

export interface DemoAccount {
  id: string
  email: string
  password: string
  role: AuthRole
  isVerified: boolean
  kycStatus: KycStatus
  kycReason?: string
  phone: string
  name: string
  title: string
  avatarUrl: string
}

export interface AuthSession extends Omit<DemoAccount, 'password'> {}

interface AuthResult {
  success: boolean
  message: string
  session?: AuthSession
}

interface RegisterInput {
  name: string
  phone: string
  email: string
  password: string
  role: Exclude<AuthRole, 'admin'>
}

interface AuthState {
  accounts: DemoAccount[]
  session: AuthSession | null
  login: (email: string, password: string) => AuthResult
  registerAccount: (input: RegisterInput) => AuthResult
  updateKycStatus: (accountId: string, status: KycStatus, reason?: string) => void
  verifyAccount: (accountId: string, verifiedTitle?: string) => void
  rejectAccount: (accountId: string, reason: string) => void
  requestSupplement: (accountId: string, reason: string) => void
  logout: () => void
}

const sessionStorageKey = 'fitlyo-auth-session'
const accountsStorageKey = 'fitlyo-auth-accounts-v2'

export const demoAccounts: DemoAccount[] = [
  { id: 'player_nguyen_an', email: 'player@fitlyo.vn', password: 'Player@123', role: 'player', isVerified: true, kycStatus: 'APPROVED', phone: '0912 345 678', name: 'Nguyễn Văn An', title: 'Người chơi · DUPR 3.42', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { id: 'fm_dsports', email: 'owner@fitlyo.vn', password: 'Owner@123', role: 'fm', isVerified: true, kycStatus: 'APPROVED', phone: '0903 123 456', name: 'Nguyễn Quốc Bảo', title: 'Chủ cụm sân D-Sports', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
  { id: 'coach_dung', email: 'coach@fitlyo.vn', password: 'Coach@123', role: 'coach', isVerified: true, kycStatus: 'APPROVED', phone: '0909 485 285', name: 'HLV Lê Hoàng Dũng', title: 'Coach · IPTPA Level 2', avatarUrl: coachMale },
  { id: 'admin_super', email: 'admin@fitlyo.vn', password: 'Admin@123', role: 'admin', isVerified: true, kycStatus: 'APPROVED', phone: '0901 234 567', name: 'Nguyễn Minh Anh', title: 'Super Admin · Toàn quyền', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'coach_pending_demo', email: 'coach.pending@fitlyo.vn', password: 'Coach@123', role: 'coach', isVerified: false, kycStatus: 'DRAFT', phone: '0905 111 222', name: 'Trần Thanh Hà', title: 'Coach · Chưa xác minh', avatarUrl: coachMale },
  { id: 'fm_pending_demo', email: 'fm.pending@fitlyo.vn', password: 'Owner@123', role: 'fm', isVerified: false, kycStatus: 'DRAFT', phone: '0906 333 444', name: 'Phạm Minh Khang', title: 'Chủ sân · Chưa xác minh', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
]

export const roleHome: Record<AuthRole, string> = {
  player: '/player', fm: '/fm/calendar', coach: '/coach/schedule', admin: '/admin/dashboard',
}

export const sessionHome = (session: AuthSession) => {
  if (session.role === 'coach' && !session.isVerified) return '/coach/verification'
  if (session.role === 'fm' && !session.isVerified) return '/fm/verification'
  return roleHome[session.role]
}

const withoutPassword = ({ password: _password, ...account }: DemoAccount): AuthSession => account

const readAccounts = (): DemoAccount[] => {
  if (typeof window === 'undefined') return demoAccounts
  try {
    const stored = JSON.parse(window.localStorage.getItem(accountsStorageKey) ?? '[]') as DemoAccount[]
    const defaultsById = new Map(demoAccounts.map((item) => [item.id, item]))
    stored.forEach((item) => defaultsById.set(item.id, { ...item, kycStatus: item.kycStatus ?? (item.isVerified ? 'APPROVED' : 'DRAFT') }))
    return [...defaultsById.values()]
  } catch {
    return demoAccounts
  }
}

const initialAccounts = readAccounts()
const readSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = JSON.parse(window.localStorage.getItem(sessionStorageKey) ?? 'null') as AuthSession | null
    const account = stored ? initialAccounts.find((item) => item.id === stored.id) : undefined
    return account ? withoutPassword(account) : null
  } catch {
    return null
  }
}

const saveAccounts = (accounts: DemoAccount[]) => window.localStorage.setItem(accountsStorageKey, JSON.stringify(accounts))
const saveSession = (session: AuthSession | null) => session ? window.localStorage.setItem(sessionStorageKey, JSON.stringify(session)) : window.localStorage.removeItem(sessionStorageKey)

export const useAuthStore = create<AuthState>((set, get) => ({
  accounts: initialAccounts,
  session: readSession(),
  login: (email, password) => {
    const account = get().accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
    if (!account) return { success: false, message: 'Email hoặc mật khẩu không đúng.' }
    const session = withoutPassword(account)
    saveSession(session)
    set({ session })
    return { success: true, message: 'Đăng nhập thành công.', session }
  },
  registerAccount: (input) => {
    if (get().accounts.some((item) => item.email.toLowerCase() === input.email.trim().toLowerCase())) return { success: false, message: 'Email này đã được sử dụng.' }
    const isPlayer = input.role === 'player'
    const account: DemoAccount = {
      id: `${input.role}_${Date.now()}`,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role: input.role,
      isVerified: isPlayer,
      kycStatus: isPlayer ? 'APPROVED' : 'DRAFT',
      phone: input.phone,
      name: input.name,
      title: isPlayer ? 'Người chơi mới' : input.role === 'coach' ? 'Coach · Chưa xác minh' : 'Chủ sân · Chưa xác minh',
      avatarUrl: input.role === 'coach' ? coachMale : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    }
    const accounts = [...get().accounts, account]
    const session = withoutPassword(account)
    saveAccounts(accounts)
    saveSession(session)
    set({ accounts, session })
    return { success: true, message: 'Đã tạo tài khoản.', session }
  },
  updateKycStatus: (accountId, status, reason) => {
    const accounts = get().accounts.map((account) => account.id === accountId ? { ...account, kycStatus: status, isVerified: status === 'APPROVED', kycReason: reason } : account)
    const current = get().session
    const session = current?.id === accountId ? withoutPassword(accounts.find((item) => item.id === accountId)!) : current
    saveAccounts(accounts)
    saveSession(session)
    set({ accounts, session })
  },
  verifyAccount: (accountId, verifiedTitle) => {
    const accounts = get().accounts.map((account) => account.id === accountId
      ? {
          ...account,
          isVerified: true,
          kycStatus: 'APPROVED' as const,
          kycReason: undefined,
          title: verifiedTitle ?? account.title,
        }
      : account)
    const current = get().session
    const session = current?.id === accountId ? withoutPassword(accounts.find((item) => item.id === accountId)!) : current
    saveAccounts(accounts)
    saveSession(session)
    set({ accounts, session })
  },
  rejectAccount: (accountId, reason) => get().updateKycStatus(accountId, 'REJECTED', reason),
  requestSupplement: (accountId, reason) => get().updateKycStatus(accountId, 'NEEDS_SUPPLEMENT', reason),
  logout: () => { saveSession(null); set({ session: null }) },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== accountsStorageKey) return
    const accounts = readAccounts()
    const current = useAuthStore.getState().session
    const refreshed = current ? accounts.find((account) => account.id === current.id) : undefined
    useAuthStore.setState({ accounts, session: refreshed ? withoutPassword(refreshed) : current })
  })
}
