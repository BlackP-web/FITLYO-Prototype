import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { sessionHome, useAuthStore, type DemoAccount } from '@/store/useAuthStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const roleMeta: Record<DemoAccount['role'], { label: string; short: string; tone: string }> = {
  player: { label: 'Người chơi', short: 'Player', tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  fm: { label: 'Chủ sân', short: 'Field Manager', tone: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' },
  coach: { label: 'Huấn luyện viên', short: 'Coach', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  admin: { label: 'Quản trị toàn sàn', short: 'Super Admin', tone: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { accounts, session, login } = useAuthStore()
  const auditApplications = useFitlyoStore((state) => state.auditApplications)
  const [email, setEmail] = useState('admin@fitlyo.vn')
  const [password, setPassword] = useState('Admin@123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('admin_super')

  if (session) return <Navigate to={sessionHome(session)} replace />

  const chooseAccount = (account: DemoAccount) => {
    setEmail(account.email)
    setPassword(account.password)
    setSelectedAccountId(account.id)
    setError('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const result = login(email, password)
    if (!result.success || !result.session) {
      setError(result.message)
      return
    }
    const from = (location.state as { from?: string } | null)?.from
    navigate(from ?? sessionHome(result.session), { replace: true })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-12">
      <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-secondary/55 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl" />

      <div className="relative mx-auto flex max-w-[1320px] items-center justify-between">
        <BrandLogo className="h-8 w-auto sm:h-10" />
        <ThemeToggle showLabel className="bg-card/80 backdrop-blur" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1320px] items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.72fr)]">
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4" /> Đăng nhập bảo mật theo vai trò
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            Một tài khoản. Một không gian làm việc <span className="text-primary underline decoration-accent decoration-[6px] underline-offset-8">đúng quyền.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            FITLYO tự động đưa bạn đến portal tương ứng. Muốn sử dụng tài khoản khác, hãy đăng xuất và đăng nhập lại — không còn chuyển vai trò trong cùng một phiên.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {accounts.map((account) => {
              const meta = roleMeta[account.role]
              const active = selectedAccountId === account.id
              const approvedApplication = auditApplications.find((application) => application.status === 'APPROVED' && application.sourceAccountId === account.id)
              const approvedCertificate = account.role === 'coach' && typeof approvedApplication?.applicationData?.certificateType === 'string'
                ? approvedApplication.applicationData.certificateType.replace(/\s+(Instructor|Coach)$/i, '')
                : undefined
              const accountTitle = approvedCertificate ? `Coach · ${approvedCertificate}` : account.title
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => chooseAccount(account)}
                  className={cn(
                    'brand-card group rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40',
                    active && 'border-primary/50 ring-2 ring-primary/15',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={account.avatarUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">{account.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{accountTitle}</p>
                      </div>
                    </div>
                    {active && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className={cn('rounded-lg px-2 py-1 text-[10px] font-bold', meta.tone)}>{meta.short}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary">Dùng tài khoản này</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="brand-card rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">FITLYO Account</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Chào mừng bạn quay lại</h2>
            <p className="mt-2 text-sm text-muted-foreground">Đăng nhập để tiếp tục vào không gian làm việc của bạn.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" placeholder="name@fitlyo.vn" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label htmlFor="login-password">Mật khẩu</Label><span className="text-[11px] text-muted-foreground">Tài khoản prototype</span></div>
              <div className="relative">
                <Input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 pr-11" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive">{error}</div>}

            <Button type="submit" size="lg" className="w-full justify-between px-5">
              <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4" /> Đăng nhập</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-muted/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tài khoản đang chọn</p>
            <div className="mt-2 grid grid-cols-[72px_1fr] gap-x-3 gap-y-1 text-xs">
              <span className="text-muted-foreground">Email</span><strong className="break-all">{email}</strong>
              <span className="text-muted-foreground">Mật khẩu</span><strong>{password}</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
