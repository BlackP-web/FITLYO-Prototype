import { create } from 'zustand'
import { coachMale, venueIndoor } from '@/assets/pickleball'

export type AuthRole = 'player' | 'fm' | 'coach' | 'admin'

export interface DemoAccount {
  id: string
  email: string
  password: string
  role: AuthRole
  isVerified: boolean
  name: string
  title: string
  avatarUrl: string
}

export interface AuthSession extends Omit<DemoAccount, 'password'> {}

interface LoginResult {
  success: boolean
  message: string
  session?: AuthSession
}

interface AuthState {
  session: AuthSession | null
  accounts: DemoAccount[]
  login: (email: string, password: string) => LoginResult
  logout: () => void
  createPartnerAccount: (input: {
    applicationId: string
    role: Extract<AuthRole, 'coach' | 'fm'>
    name: string
    sourceEmail: string
  }) => DemoAccount
}

const sessionStorageKey = 'fitlyo-auth-session'
const partnerAccountsStorageKey = 'fitlyo-partner-accounts'

export const demoAccounts: DemoAccount[] = [
  {
    id: 'player_nguyen_an',
    email: 'player@fitlyo.vn',
    password: 'Player@123',
    role: 'player',
    isVerified: true,
    name: 'Nguyễn Văn An',
    title: 'Người chơi · DUPR 3.42',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: 'fm_dsports',
    email: 'owner@fitlyo.vn',
    password: 'Owner@123',
    role: 'fm',
    isVerified: true,
    name: 'Nguyễn Quốc Bảo',
    title: 'Chủ cụm sân D-Sports',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
  },
  {
    id: 'coach_dung',
    email: 'coach@fitlyo.vn',
    password: 'Coach@123',
    role: 'coach',
    isVerified: true,
    name: 'HLV Lê Hoàng Dũng',
    title: 'Coach · IPTPA Level 2',
    avatarUrl: coachMale,
  },
  {
    id: 'admin_super',
    email: 'admin@fitlyo.vn',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true,
    name: 'Nguyễn Minh Anh',
    title: 'Super Admin · Toàn quyền',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
]

export const roleHome: Record<AuthRole, string> = {
  player: '/player',
  fm: '/fm/calendar',
  coach: '/coach/schedule',
  admin: '/admin/dashboard',
}

const readPartnerAccounts = (): DemoAccount[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(partnerAccountsStorageKey)
    const stored = raw ? JSON.parse(raw) : []
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

const initialAccounts = [...demoAccounts, ...readPartnerAccounts()]

const readStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(sessionStorageKey)
    if (!raw) return null
    const stored = JSON.parse(raw) as AuthSession
    const account = initialAccounts.find(
      (item) => item.id === stored.id && item.email === stored.email && item.role === stored.role,
    )
    if (!account) {
      window.localStorage.removeItem(sessionStorageKey)
      return null
    }
    const { password: _password, ...session } = account
    return session
  } catch {
    window.localStorage.removeItem(sessionStorageKey)
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: readStoredSession(),
  accounts: initialAccounts,

  login: (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const account = get().accounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
    )

    if (!account) {
      return {
        success: false,
        message: 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại tài khoản mẫu.',
      }
    }

    const { password: _password, ...session } = account
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session))
    set({ session })
    return { success: true, message: 'Đăng nhập thành công.', session }
  },

  logout: () => {
    window.localStorage.removeItem(sessionStorageKey)
    set({ session: null })
  },

  createPartnerAccount: ({ applicationId, role, name, sourceEmail }) => {
    const accountId = `partner_${applicationId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
    const currentAccounts = get().accounts
    const existing = currentAccounts.find((account) => account.id === accountId)
    if (existing) return existing

    const emailLocalPart = sourceEmail.split('@')[0].replace(/[^a-z0-9._-]/gi, '').toLowerCase() || 'partner'
    const suffix = applicationId.replace(/\D/g, '').slice(-4).padStart(4, '0')
    const account: DemoAccount = {
      id: accountId,
      email: `${role === 'coach' ? 'coach' : 'owner'}.${emailLocalPart}@fitlyo.vn`,
      password: `${role === 'coach' ? 'Coach' : 'Owner'}@${suffix}`,
      role,
      isVerified: true,
      name: role === 'coach' ? `HLV ${name}` : name,
      title: role === 'coach' ? 'Coach đối tác · Đã được Admin duyệt' : 'Field Manager · Cụm sân đối tác',
      avatarUrl: role === 'coach' ? coachMale : venueIndoor,
    }
    const partnerAccounts = [...currentAccounts.filter((item) => !demoAccounts.some((base) => base.id === item.id)), account]
    window.localStorage.setItem(partnerAccountsStorageKey, JSON.stringify(partnerAccounts))
    set({ accounts: [...demoAccounts, ...partnerAccounts] })
    return account
  },
}))
