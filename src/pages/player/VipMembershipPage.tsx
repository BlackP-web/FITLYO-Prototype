import { ArrowLeft, Check, CheckCircle2, Crown, Gift, QrCode, ShieldCheck, Star, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const benefits = [
  ['Đặt giữ sân trước', 'Tối đa 3 ngày', 'Tối đa 14 ngày'], ['Phí nạp / rút Escrow', '2,5%', 'Miễn phí'], ['Ghép kèo Slot 5', 'Xếp hàng thường', 'Ưu tiên'], ['Giảm giá sân liên kết', '0%', 'Giảm 5%'], ['Huy hiệu hồ sơ', 'Không có', 'Vương miện vàng'], ['Bảo hiểm chấn thương', 'Không có', 'Gói PTI cơ bản'],
]

export function VipMembershipPage() {
  const navigate = useNavigate()
  const profile = usePlayerStore((state) => state.profile)
  const purchaseVip = usePlayerStore((state) => state.purchaseVip)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [plan, setPlan] = useState<'MONTHLY' | 'YEARLY'>('YEARLY')
  const [payment, setPayment] = useState<'WALLET' | 'VIETQR'>('WALLET')
  const [accepted, setAccepted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const price = plan === 'MONTHLY' ? 99000 : 899000

  const handlePurchase = () => {
    if (!accepted) return
    setProcessing(true)
    window.setTimeout(() => {
      const result = purchaseVip(plan, payment)
      setProcessing(false)
      showToast(result.message, result.success ? 'success' : 'error')
      if (result.success) navigate('/player/profile')
    }, 700)
  }

  if (profile.isVip) return <div className="mx-auto max-w-2xl space-y-6 py-8 text-center"><Button variant="ghost" onClick={() => navigate('/player/profile')} className="mr-auto flex gap-2"><ArrowLeft className="h-4 w-4" /> Hồ sơ</Button><div className="rounded-[2rem] border border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-card to-secondary/30 p-8 shadow-lg sm:p-12"><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-amber-400 text-amber-950 shadow-xl shadow-amber-500/20"><Crown className="h-10 w-10" /></span><Badge className="mt-6 border-0 bg-amber-400 text-amber-950">FITLYO VIP ACTIVE</Badge><h1 className="mt-4 text-3xl font-black">Đặc quyền đang hoạt động</h1><p className="mt-2 text-sm text-muted-foreground">Gói của {profile.name} có hiệu lực đến <b>{profile.vipExpiresAt}</b>.</p><div className="mt-7 grid gap-3 text-left sm:grid-cols-2">{benefits.slice(0,4).map((item) => <div key={item[0]} className="flex gap-2 rounded-xl bg-background/70 p-3 text-sm"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /><span><b>{item[0]}</b><br/><small className="text-muted-foreground">{item[2]}</small></span></div>)}</div><Button onClick={() => navigate('/player/profile')} className="mt-8 rounded-xl">Trở về hồ sơ</Button></div></div>

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-10">
      <div className="flex items-center justify-between"><Button variant="ghost" onClick={() => navigate('/player/profile')} className="gap-2 rounded-xl"><ArrowLeft className="h-4 w-4" /> Hồ sơ</Button><button type="button" className="text-xs font-bold text-primary underline">Điều khoản hội viên</button></div>
      <section className="relative overflow-hidden rounded-[2rem] border border-amber-500/25 bg-[#143F42] px-6 py-10 text-white shadow-2xl sm:px-12 sm:py-14"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl"/><div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-secondary/15 blur-3xl"/><div className="relative z-10 max-w-2xl"><Badge className="border-0 bg-amber-400 text-amber-950"><Crown className="mr-1 h-3.5 w-3.5" /> FITLYO VIP</Badge><h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">Mở khóa toàn bộ đặc quyền sân đấu.</h1><p className="mt-4 text-base leading-7 text-white/70">Đặt sân sớm hơn, miễn phí giao dịch và luôn đứng trước trong hàng chờ ghép kèo giờ vàng.</p><div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-secondary"><span><Star className="mr-1 inline h-4 w-4 fill-current" /> Ưu tiên ghép kèo</span><span><ShieldCheck className="mr-1 inline h-4 w-4" /> Bảo hiểm PTI</span><span><Gift className="mr-1 inline h-4 w-4" /> Quà tặng hằng năm</span></div></div></section>

      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm"><div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] bg-muted/45 px-4 py-4 text-xs font-black sm:px-6"><span>Quyền lợi</span><span className="text-center">Thường</span><span className="text-center text-amber-600">VIP</span></div>{benefits.map((item) => <div key={item[0]} className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-t border-border/60 px-4 py-4 text-xs sm:px-6 sm:text-sm"><b>{item[0]}</b><span className="text-center text-muted-foreground">{item[1]}</span><span className="flex items-center justify-center gap-1 text-center font-black text-emerald-600"><Check className="hidden h-4 w-4 sm:block" />{item[2]}</span></div>)}</section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]"><div className="space-y-4"><h2 className="text-2xl font-black">Chọn gói phù hợp</h2><button type="button" onClick={() => setPlan('MONTHLY')} className={cn('flex w-full items-center gap-4 rounded-[1.5rem] border bg-card p-5 text-left transition', plan === 'MONTHLY' ? 'border-primary ring-2 ring-primary/15' : 'border-border')}><span className={cn('h-5 w-5 rounded-full border-2 p-1', plan === 'MONTHLY' ? 'border-primary bg-primary shadow-[inset_0_0_0_3px_hsl(var(--card))]' : 'border-muted-foreground')} /><span className="flex-1"><b className="block">Gói 1 tháng</b><small className="text-muted-foreground">Trải nghiệm trọn bộ quyền lợi</small></span><strong className="text-xl">99.000đ</strong></button><button type="button" onClick={() => setPlan('YEARLY')} className={cn('relative flex w-full items-center gap-4 rounded-[1.5rem] border bg-card p-5 text-left transition', plan === 'YEARLY' ? 'border-amber-500 ring-2 ring-amber-500/15' : 'border-border')}><Badge className="absolute -top-2.5 right-4 border-0 bg-amber-400 text-[9px] text-amber-950">TIẾT KIỆM 25%</Badge><span className={cn('h-5 w-5 rounded-full border-2 p-1', plan === 'YEARLY' ? 'border-amber-500 bg-amber-500 shadow-[inset_0_0_0_3px_hsl(var(--card))]' : 'border-muted-foreground')} /><span className="flex-1"><b className="block">Gói 1 năm</b><small className="text-muted-foreground">Tặng áo FITLYO Pro · 74.900đ/tháng</small></span><strong className="text-xl">899.000đ</strong></button></div>

        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black">Thanh toán mô phỏng</h2><div className="mt-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs leading-5 text-muted-foreground"><b className="text-foreground">Thanh toán 100% và kích hoạt ngay.</b> Gói VIP đã kích hoạt không được hoàn tiền.</div><div className="mt-4 space-y-2"><button type="button" onClick={() => setPayment('WALLET')} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left', payment === 'WALLET' && 'border-primary bg-primary/5')}><WalletCards className="h-5 w-5 text-primary" /><span className="flex-1"><b className="block text-sm">Ví FITLYO</b><small className="text-muted-foreground">{profile.walletBalance.toLocaleString('vi-VN')}đ</small></span>{payment === 'WALLET' && <CheckCircle2 className="h-4 w-4 text-primary" />}</button><button type="button" onClick={() => setPayment('VIETQR')} className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left', payment === 'VIETQR' && 'border-primary bg-primary/5')}><QrCode className="h-5 w-5 text-primary" /><span className="flex-1"><b className="block text-sm">VietQR</b><small className="text-muted-foreground">Giao dịch demo, không thu tiền thật</small></span>{payment === 'VIETQR' && <CheckCircle2 className="h-4 w-4 text-primary" />}</button></div>{payment === 'VIETQR' && <div className="mt-4 rounded-2xl border border-dashed border-primary/25 bg-white p-4 text-center text-[#143F42]"><QrCode className="mx-auto h-20 w-20" /><p className="mt-2 font-mono text-xs font-black">FITLYO-VIP-{plan}</p><p className="text-[10px] text-slate-500">VietQR mô phỏng</p></div>}<label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 accent-[#143F42]" /><span>Tôi đồng ý thanh toán 100%, kích hoạt ngay và hiểu rằng gói VIP đã kích hoạt không được hoàn tiền.</span></label><div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 p-4"><span className="text-sm font-bold">Thanh toán 100%</span><b className="text-xl">{price.toLocaleString('vi-VN')}đ</b></div><Button disabled={!accepted || processing} onClick={handlePurchase} className="mt-4 h-12 w-full gap-2 rounded-xl bg-amber-400 font-black text-amber-950 hover:bg-amber-300"><Crown className="h-4 w-4" />{processing ? 'Đang kích hoạt...' : 'Thanh toán & kích hoạt ngay'}</Button></div>
      </section>
    </div>
  )
}
