import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  X,
  UserCheck,
} from 'lucide-react'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { PublicAuthHeader } from '@/components/auth/PublicAuthHeader'

export function SignInPage() {
  const navigate = useNavigate()
  const { setLoggedIn, updateUserProfile, showToast } = useFitlyoStore()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanPhone = phone.replace(/[\s.-]/g, '')
    if (!cleanPhone) {
      setError('Vui lòng nhập số điện thoại.')
      return
    }
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setError('Số điện thoại không hợp lệ (VD: 0912 345 678).')
      return
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLoggedIn(true)
      updateUserProfile({
        name: 'Nguyễn An',
        phone: cleanPhone,
        duprRating: 2.85,
        reputationScore: 98,
      })
      if (showToast) showToast('Đăng nhập thành công! Chào mừng Nguyễn An.', 'success')
      navigate('/')
    }, 600)
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLoggedIn(true)
      updateUserProfile({
        name: 'Nguyễn An (Google)',
        email: 'nguyen.an@gmail.com',
        duprRating: 2.85,
        reputationScore: 100,
      })
      if (showToast) showToast('Đăng nhập bằng tài khoản Google thành công!', 'success')
      navigate('/')
    }, 700)
  }

  // Quick Demo Fill for Judges/Demo
  const handleQuickDemo = (role: 'player' | 'fm' | 'coach') => {
    if (role === 'player') {
      setPhone('0912 345 678')
      setPassword('Fitlyo@2026')
      setLoggedIn(true)
      updateUserProfile({
        name: 'Nguyễn An',
        phone: '0912 345 678',
        duprRating: 2.85,
        reputationScore: 98,
      })
      navigate('/')
    } else if (role === 'fm') {
      setPhone('0903 123 456')
      setPassword('CourtAdmin@2026')
      setLoggedIn(true)
      updateUserProfile({
        name: 'Trần Văn Đức (Chủ Sân Thảo Điền)',
        phone: '0903 123 456',
        role: 'fm',
      })
      navigate('/fm/calendar')
    } else {
      setPhone('0988 777 666')
      setPassword('CoachPro@2026')
      setLoggedIn(true)
      updateUserProfile({
        name: 'HLV Hoàng Minh Triết',
        phone: '0988 777 666',
        role: 'coach',
        duprRating: 4.8,
      })
      navigate('/coach/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-secondary selection:text-secondary-foreground font-sans">
      <PublicAuthHeader action={<Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </Link>} />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-[440px] bg-card rounded-3xl shadow-xl border border-border/80 p-6 sm:p-8 space-y-6">
          {/* Header Title */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/35 text-primary text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SCR_AUTH_01 • CỔNG XÁC THỰC</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Đăng Nhập FITLYO</h1>
            <p className="text-xs text-muted-foreground">
              Chào mừng bạn trở lại với cộng đồng Pickleball TP. Thủ Đức!
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/85 flex items-center justify-between">
                <span>Số điện thoại di động (*)</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Định dạng VN</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-muted-foreground/70 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-muted/45 border border-border text-sm font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground/85">Mật khẩu (*)</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-muted-foreground/70 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-muted/45 border border-border text-sm font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground/70 hover:text-muted-foreground transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                />
                <span className="text-xs text-muted-foreground font-medium">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>ĐĂNG NHẬP HỆ THỐNG</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[11px] uppercase font-bold text-muted-foreground/70 shrink-0">
              HOẶC
            </span>
          </div>

          {/* Google OAuth (Mock) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border border-border bg-card hover:bg-muted/45 text-foreground/85 font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Tiếp tục bằng Tài khoản Google</span>
          </button>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 block text-center tracking-wider">
              ⚡ ĐĂNG NHẬP NHANH (DEMO CHỨC DANH)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('player')}
                className="py-1.5 px-2 rounded-lg bg-secondary/35 hover:bg-secondary/55 text-[11px] font-bold text-primary transition text-center"
              >
                VĐV An (2.85)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('fm')}
                className="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[11px] font-bold text-blue-600 transition text-center"
              >
                Chủ Sân (FM)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('coach')}
                className="py-1.5 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-[11px] font-bold text-orange-600 transition text-center"
              >
                HLV Triết (4.8)
              </button>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center text-xs text-muted-foreground pt-1">
            <span>Chưa có tài khoản? </span>
            <Link
              to="/auth/register"
              className="font-extrabold text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <span>Đăng ký ngay</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Quên Mật Khẩu</h3>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(false)
                  setForgotSubmitted(false)
                }}
                className="text-muted-foreground/70 hover:text-foreground/85"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {!forgotSubmitted ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Nhập số điện thoại đã đăng ký để nhận mã khôi phục mật khẩu qua SMS.
                </p>
                <input
                  type="tel"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full h-10 px-3 rounded-xl bg-muted/45 border border-border text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setForgotSubmitted(true)}
                  className="w-full h-10 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  Gửi mã xác thực khôi phục
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <p className="text-xs text-foreground/85 font-semibold">
                  Mã xác thực đã được gửi tới SĐT {forgotPhone || 'của bạn'}. Vui lòng kiểm tra tin nhắn SMS.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="w-full h-9 rounded-xl bg-muted text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Note */}
      <footer className="py-4 text-center text-xs text-muted-foreground/70">
        © 2026 FITLYO Pickleball • Nền tảng thể thao thông minh TP. Thủ Đức
      </footer>
    </div>
  )
}
export default SignInPage
