import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Smartphone,
} from 'lucide-react'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export function SCR_AUTH_03() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useFitlyoStore()

  // Retrieve phone passed from SCR_AUTH_02 or sessionStorage fallback
  const locationState = location.state as { phone?: string; fullName?: string } | null
  const tempReg = typeof window !== 'undefined' ? sessionStorage.getItem('fitlyo_temp_reg') : null
  const parsedReg = tempReg ? JSON.parse(tempReg) : null

  const displayPhone = locationState?.phone || parsedReg?.phone || '0987 654 321'
  const formattedPhone = displayPhone.startsWith('+84')
    ? displayPhone
    : `(+84) ${displayPhone.replace(/^0/, '')}`

  // 6 OTP Digit Inputs
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer 60s
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // Focus on the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    setError('')
    // Handle paste of multiple characters
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newOtp = [...otp]
      pastedDigits.forEach((digit, i) => {
        newOtp[i] = digit
      })
      setOtp(newOtp)
      const nextFocus = Math.min(pastedDigits.length, 5)
      inputRefs.current[nextFocus]?.focus()
      return
    }

    // Only allow single digit
    const digit = value.replace(/\D/g, '')
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Move to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = () => {
    if (!canResend) return
    setCountdown(60)
    setCanResend(false)
    setOtp(['', '', '', '', '', ''])
    setError('')
    inputRefs.current[0]?.focus()
    if (showToast) showToast(`Đã gửi lại mã xác thực OTP mới đến ${formattedPhone}`, 'info')
  }

  const handleFillDemoCode = () => {
    setOtp(['8', '4', '2', '1', '9', '0'])
    inputRefs.current[5]?.focus()
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const fullCode = otp.join('')
    if (fullCode.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP xác thực.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      if (showToast) showToast('Xác thực số điện thoại thành công!', 'success')
      // Navigate to SCR_AUTH_04 (DUPR Initial Skill Survey)
      navigate('/auth/dupr-survey')
    }, 550)
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between selection:bg-[#84CC16] selection:text-slate-950 font-sans">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1">
            <span className="text-xl font-black text-[#0b1c30] tracking-tight">FITLYO</span>
            <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          </div>
          <span className="text-[10px] tracking-widest text-[#16A34A] font-bold px-1.5 py-0.5 bg-green-100 rounded">
            PICKLEBALL
          </span>
        </Link>
        <button
          type="button"
          onClick={() => navigate('/auth/register')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Đổi số điện thoại</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[#16A34A] text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SCR_AUTH_03 • XÁC THỰC MÃ OTP</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Xác Thực Số Điện Thoại</h1>
            <p className="text-xs text-slate-500">
              Mã xác thực 6 chữ số đã được gửi qua tin nhắn SMS tới số điện thoại:
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-900 font-extrabold text-sm tracking-wide">
                <Smartphone className="w-4 h-4 text-[#16A34A]" />
                {formattedPhone}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 text-center">
              {error}
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block text-center">
                Vui lòng nhập mã OTP để kích hoạt tài khoản:
              </span>

              {/* 6 PIN OTP Inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center text-xl sm:text-2xl font-black text-slate-900 focus:bg-white focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#84CC16]/20 transition-all shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* Countdown / Resend */}
            <div className="text-center text-xs">
              {!canResend ? (
                <p className="text-slate-500 font-medium">
                  Chưa nhận được mã? Gửi lại sau:{' '}
                  <span className="font-extrabold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded-md">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-extrabold text-[#16A34A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Gửi lại mã OTP ngay</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#16A34A] hover:bg-green-700 text-white font-extrabold text-sm shadow-md shadow-green-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác nhận mã OTP...</span>
                </>
              ) : (
                <>
                  <span>XÁC NHẬN & TIẾP TỤC</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleFillDemoCode}
              className="text-[11px] text-slate-400 hover:text-[#16A34A] underline font-medium cursor-pointer"
            >
              (Demo nhanh: Nhập mã mẫu 842190)
            </button>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Mã xác thực OTP có hiệu lực trong 5 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai để bảo vệ quyền sở hữu tài khoản.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 FITLYO Pickleball • Nền tảng thể thao thông minh TP. Thủ Đức
      </footer>
    </div>
  )
}
export default SCR_AUTH_03
