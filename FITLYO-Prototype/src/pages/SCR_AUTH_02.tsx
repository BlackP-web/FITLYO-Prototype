import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  FileText,
  X,
} from 'lucide-react'
import { PublicAuthHeader } from '@/components/auth/PublicAuthHeader'

export function SCR_AUTH_02() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Modals for Terms & Escrow Policy
  const [modalType, setModalType] = useState<'terms' | 'escrow' | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên hiển thị.')
      return
    }

    const cleanPhone = phone.replace(/[\s.-]/g, '')
    if (!cleanPhone) {
      setError('Vui lòng nhập số điện thoại di động.')
      return
    }
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setError('Số điện thoại không đúng định dạng Việt Nam (VD: 0987 654 321).')
      return
    }

    if (!password) {
      setError('Vui lòng tạo mật khẩu.')
      return
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có tối thiểu 8 ký tự.')
      return
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Mật khẩu phải bao gồm cả chữ cái và số.')
      return
    }

    if (!agreedTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ & Chính sách Ký quỹ Escrow.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // Save temp registration info in sessionStorage
      sessionStorage.setItem(
        'fitlyo_temp_reg',
        JSON.stringify({
          fullName: fullName.trim(),
          phone: cleanPhone,
        })
      )
      // Navigate to SCR_AUTH_03 (OTP Verification)
      navigate('/auth/verify-otp', {
        state: {
          phone: cleanPhone,
          fullName: fullName.trim(),
        },
      })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-secondary selection:text-secondary-foreground font-sans">
      <PublicAuthHeader action={<button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>} />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-[460px] bg-card rounded-3xl shadow-xl border border-border/80 p-6 sm:p-8 space-y-6">
          {/* Header Title */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/35 text-primary text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SCR_AUTH_02 • ĐĂNG KÝ THÀNH VIÊN</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Tạo Tài Khoản FITLYO</h1>
            <p className="text-xs text-muted-foreground">
              Tham gia cộng đồng Pickleball, ghép trận cân bằng DUPR và đặt sân tiện lợi!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên hiển thị */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/85 flex items-center justify-between">
                <span>Họ và tên hiển thị (*)</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Tên thi đấu trong kèo</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-muted-foreground/70 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-muted/45 border border-border text-sm font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Số điện thoại di động */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/85 flex items-center justify-between">
                <span>Số điện thoại di động (*)</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Nhận mã OTP qua SMS</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-muted-foreground/70 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987 654 321"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-muted/45 border border-border text-sm font-semibold text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                (Mã xác thực 6 số OTP sẽ được gửi qua SMS đến số này ở bước tiếp theo)
              </p>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/85 flex items-center justify-between">
                <span>Tạo mật khẩu (*)</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">Tối thiểu 8 ký tự (chữ + số)</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-muted-foreground/70 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự, gồm cả chữ và số"
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

            {/* Checkbox bắt buộc */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary border-border"
                />
                <span className="text-xs text-muted-foreground leading-snug">
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setModalType('terms')}
                    className="text-primary font-bold underline hover:text-primary/80"
                  >
                    Điều khoản dịch vụ
                  </button>{' '}
                  &{' '}
                  <button
                    type="button"
                    onClick={() => setModalType('escrow')}
                    className="text-primary font-bold underline hover:text-primary/80"
                  >
                    Chính sách Ký quỹ Escrow
                  </button>
                </span>
              </label>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer pt-0.5"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi mã OTP...</span>
                </>
              ) : (
                <>
                  <span>TIẾP TỤC: NHẬN MÃ XÁC THỰC OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setFullName('Nguyễn Văn An')
                setPhone('0987 654 321')
                setPassword('Fitlyo@2026')
                setAgreedTerms(true)
              }}
              className="text-[11px] text-muted-foreground/70 hover:text-primary underline font-medium cursor-pointer"
            >
              (Demo: Điền thông tin mẫu VĐV An)
            </button>
          </div>

          {/* Switch to Login */}
          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Đã có tài khoản? </span>
            <Link
              to="/login"
              className="font-extrabold text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </main>

      {/* Modal Điều Khoản / Chính Sách Escrow */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card rounded-3xl p-6 shadow-2xl border border-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {modalType === 'terms' ? 'Điều Khoản Dịch Vụ FITLYO' : 'Chính Sách Ký Quỹ Escrow'}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-muted-foreground/70 hover:text-foreground/85"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'terms' ? (
              <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  <strong>1. Quy định thành viên:</strong> Người chơi cam kết cung cấp đúng thông tin cá nhân và số điện thoại liên lạc chính xác khi tham gia ghép kèo trên hệ thống FITLYO.
                </p>
                <p>
                  <strong>2. Chuẩn hóa Slot 90 phút:</strong> Mọi trận đấu giao hữu và giải đấu trên FITLYO đều tuân theo ma trận 6 khung giờ cố định từ 12:30 đến 21:30 hàng ngày.
                </p>
                <p>
                  <strong>3. Tinh thần Fair-play DUPR:</strong> Người chơi cam kết thi đấu trung thực, tôn trọng kết quả trận đấu để hệ thống tính điểm DUPR chuẩn xác.
                </p>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  <strong>1. Cơ chế Bảo Lãnh Cọc 100%:</strong> Khi tham gia ghép kèo, tiền đặt cọc sân của người chơi được bảo quản an toàn trong ví Ký quỹ Escrow và chỉ giải ngân cho chủ sân khi trận đấu hoàn tất.
                </p>
                <p>
                  <strong>2. Chế tài Chống Bùng Kèo:</strong> Người chơi tự ý hủy kèo sát giờ (dưới 4 tiếng) hoặc vắng mặt không lý do chính đáng sẽ bị trừ 100% tiền cọc để bồi hoàn cho các VĐV còn lại trong trận.
                </p>
                <p>
                  <strong>3. Hoàn Tiền Do Thời Tiết:</strong> Trường hợp thời tiết mưa bão sân ướt không thể thi đấu, hệ thống Escrow tự động hoàn cọc 100% về ví trong vòng 15 phút.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setAgreedTerms(true)
                setModalType(null)
              }}
              className="w-full h-10 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
            >
              Tôi Đã Hiểu & Đồng Ý
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground/70">
        © 2026 FITLYO Pickleball • Nền tảng thể thao thông minh TP. Thủ Đức
      </footer>
    </div>
  )
}
export default SCR_AUTH_02
