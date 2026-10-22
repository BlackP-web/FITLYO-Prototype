import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useWalletTopUpStore } from '@/store/useWalletTopUpStore'

const presetAmounts = [100_000, 200_000, 500_000, 1_000_000]
const minimumAmount = 50_000
const maximumAmount = 20_000_000

const money = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`

export function WalletTopUpDialog() {
  const { isOpen, closeTopUp } = useWalletTopUpStore()
  const profile = usePlayerStore((state) => state.profile)
  const creditWallet = usePlayerStore((state) => state.creditWallet)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [amountText, setAmountText] = useState('200000')
  const [step, setStep] = useState<'AMOUNT' | 'QR' | 'SUCCESS'>('AMOUNT')
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  const amount = Number(amountText)
  const nextBalance = profile.walletBalance + (Number.isFinite(amount) ? amount : 0)
  const isAmountValid = Number.isFinite(amount) && amount >= minimumAmount && amount <= maximumAmount
  const formattedAmount = useMemo(() => Number.isFinite(amount) && amount > 0 ? money(amount) : '0đ', [amount])

  if (!isOpen) return null

  const resetAndClose = () => {
    closeTopUp()
    window.setTimeout(() => {
      setStep('AMOUNT')
      setAmountText('200000')
      setError('')
      setReference('')
    }, 180)
  }

  const continueToQr = () => {
    if (!isAmountValid) {
      setError(`Số tiền nạp phải từ ${money(minimumAmount)} đến ${money(maximumAmount)}.`)
      return
    }
    setReference(`FTL-TOPUP-${Date.now().toString().slice(-8)}`)
    setError('')
    setStep('QR')
  }

  const confirmTopUp = () => {
    if (!isAmountValid) return
    creditWallet(amount)
    setStep('SUCCESS')
    showToast(`Đã nạp ${formattedAmount} vào Ví FITLYO.`, 'success')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#082A2D]/65 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="wallet-topup-title">
      <section className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-border/80 bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary/60 text-primary"><WalletCards className="h-6 w-6" /></span>
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Ví FITLYO</p><h2 id="wallet-topup-title" className="mt-1 text-xl font-black">{step === 'SUCCESS' ? 'Nạp tiền thành công' : 'Nạp tiền vào ví'}</h2></div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={resetAndClose} aria-label="Đóng nạp tiền"><X className="h-5 w-5" /></Button>
        </header>

        {step === 'AMOUNT' && <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between rounded-2xl bg-muted/45 p-4"><div><p className="text-xs font-semibold text-muted-foreground">Số dư hiện tại</p><p className="mt-1 text-2xl font-black">{money(profile.walletBalance)}</p></div><ShieldCheck className="h-6 w-6 text-emerald-600" /></div>

          <label htmlFor="topup-amount" className="mt-5 block text-sm font-black">Số tiền muốn nạp</label>
          <div className="relative mt-2"><Input id="topup-amount" type="number" min={minimumAmount} max={maximumAmount} step="10000" value={amountText} onChange={(event) => { setAmountText(event.target.value); setError('') }} className="h-12 pr-14 text-lg font-black" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">VNĐ</span></div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Tối thiểu {money(minimumAmount)} · Tối đa {money(maximumAmount)} mỗi lần.</p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{presetAmounts.map((preset) => <button key={preset} type="button" onClick={() => { setAmountText(String(preset)); setError('') }} className={cn('min-h-11 rounded-xl border px-2 text-xs font-black transition', amount === preset ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/35')}>{preset >= 1_000_000 ? `${preset / 1_000_000} triệu` : `${preset / 1_000}K`}</button>)}</div>

          {error && <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p>}

          <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Số tiền nạp</span><strong>{formattedAmount}</strong></div><div className="mt-2 flex justify-between gap-3"><span className="text-muted-foreground">Phí giao dịch</span><strong className="text-emerald-600">0đ</strong></div><div className="mt-3 border-t pt-3"><div className="flex justify-between gap-3"><span className="font-bold">Số dư sau khi nạp</span><strong className="text-lg text-primary">{isAmountValid ? money(nextBalance) : '—'}</strong></div></div></div>

          <Button type="button" onClick={continueToQr} className="mt-5 h-12 w-full gap-2 text-base font-black"><QrCode className="h-5 w-5" />Tạo mã VietQR</Button>
          <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Prototype mô phỏng — không phát sinh giao dịch ngân hàng thật.</p>
        </div>}

        {step === 'QR' && <div className="p-5 sm:p-6">
          <button type="button" onClick={() => setStep('AMOUNT')} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-primary hover:bg-secondary/40"><ArrowLeft className="h-4 w-4" />Đổi số tiền</button>
          <div className="mt-3 rounded-3xl border border-dashed border-primary/30 bg-white p-6 text-center text-[#143F42]">
            <div className="mx-auto grid h-48 w-48 place-items-center rounded-2xl border-8 border-[#143F42] bg-[repeating-linear-gradient(45deg,#143F42_0_8px,#fff_8px_16px)]"><span className="grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-xl"><QrCode className="h-14 w-14" /></span></div>
            <p className="mt-5 text-sm font-black">Quét VietQR để nạp {formattedAmount}</p><p className="mt-1 font-mono text-xs font-bold">{reference}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-secondary/25 p-4 text-sm leading-6"><p className="font-black">Hướng dẫn</p><ol className="mt-2 space-y-1 text-muted-foreground"><li>1. Mở ứng dụng ngân hàng và quét mã.</li><li>2. Kiểm tra đúng số tiền và nội dung.</li><li>3. Với prototype, nhấn nút xác nhận bên dưới.</li></ol></div>
          <Button type="button" onClick={confirmTopUp} className="mt-5 h-12 w-full gap-2 text-base font-black"><Sparkles className="h-5 w-5" />Mô phỏng đã chuyển khoản</Button>
        </div>}

        {step === 'SUCCESS' && <div className="p-6 text-center sm:p-8">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/12 text-emerald-600"><CheckCircle2 className="h-10 w-10" /></span>
          <h3 className="mt-5 text-2xl font-black">Đã cộng {formattedAmount}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Số dư Ví FITLYO đã được cập nhật và lưu cho lần truy cập sau.</p>
          <div className="mt-5 rounded-2xl bg-muted/45 p-4"><p className="text-xs font-semibold text-muted-foreground">Số dư mới</p><p className="mt-1 text-3xl font-black text-primary">{money(profile.walletBalance)}</p><p className="mt-2 font-mono text-xs text-muted-foreground">{reference}</p></div>
          <Button type="button" onClick={resetAndClose} className="mt-6 h-12 w-full text-base font-black">Hoàn tất</Button>
        </div>}
      </section>
    </div>
  )
}

