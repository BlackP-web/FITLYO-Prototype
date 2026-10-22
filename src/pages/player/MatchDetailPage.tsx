import { ArrowLeft, Check, CheckCircle2, Clock3, ExternalLink, MapPin, QrCode, Share2, ShieldCheck, Sparkles, UserRound, WalletCards, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { getPlayerMatchFee } from '@/lib/playerMatch'

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function PlayerMatchDetailPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const match = usePlayerStore((state) => state.matches.find((item) => item.id === matchId))
  const profile = usePlayerStore((state) => state.profile)
  const ticket = usePlayerStore((state) => state.tickets.find((item) => item.matchId === matchId && item.status !== 'CANCELLED'))
  const joinMatch = usePlayerStore((state) => state.joinMatch)
  const processTimeBasedPolicies = usePlayerStore((state) => state.processTimeBasedPolicies)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'VIETQR'>('WALLET')
  const [accepted, setAccepted] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    processTimeBasedPolicies()
    const timer = window.setInterval(processTimeBasedPolicies, 30_000)
    return () => window.clearInterval(timer)
  }, [processTimeBasedPolicies])

  if (!match) {
    return <div className="py-24 text-center"><h1 className="text-2xl font-black">Không tìm thấy kèo đấu</h1><Button onClick={() => navigate('/player/matches')} className="mt-4">Quay lại bảng tin</Button></div>
  }

  const joined = match.participants.some((person) => person.id === profile.id)
  const matchFee = getPlayerMatchFee(match)
  const inRange = profile.dupr >= match.duprMin && profile.dupr <= match.duprMax
  const isFull = match.participants.length >= match.maxPlayers
  const remaining = Math.max(0, match.maxPlayers - match.participants.length)

  const handleShare = async () => {
    const url = window.location.href
    try { await navigator.clipboard.writeText(url); showToast('Đã sao chép liên kết kèo đấu.', 'success') }
    catch { showToast('Liên kết kèo đã sẵn sàng để chia sẻ.', 'info') }
  }

  const confirmJoin = () => {
    if (!accepted) return
    setProcessing(true)
    window.setTimeout(() => {
      const result = joinMatch(match.id, paymentMethod)
      setProcessing(false)
      showToast(result.message, result.success ? 'success' : 'error')
      if (result.success && result.ticketCode) {
        setShowCheckout(false)
        navigate(`/player/matches/${match.id}/ticket`)
      }
    }, 650)
  }

  const openCheckout = () => {
    setAccepted(false)
    setShowCheckout(true)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate('/player/matches')} className="gap-2 rounded-xl"><ArrowLeft className="h-4 w-4" /> Bảng tin kèo</Button>
        <Button variant="outline" onClick={handleShare} className="gap-2 rounded-xl"><Share2 className="h-4 w-4" /><span className="hidden sm:inline">Chia sẻ kèo</span></Button>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[0_24px_70px_rgba(20,63,66,0.08)]">
        <div className="relative h-72 overflow-hidden sm:h-[420px]">
          <img src={match.imageUrl} alt={match.venueName} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3437]/90 via-[#0B3437]/10 to-transparent" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2 sm:left-8 sm:top-8">
            <Badge className={`border-0 text-[10px] font-black ${match.isPeak ? 'bg-amber-400 text-amber-950' : 'bg-secondary text-[#143F42]'}`}>{match.label}</Badge>
            <Badge className="border border-white/20 bg-white/15 text-white backdrop-blur-lg">DUPR {match.duprMin.toFixed(2)}–{match.duprMax.toFixed(2)}</Badge>
            <Badge className="border border-white/20 bg-white/15 text-white backdrop-blur-lg">{match.format}</Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">SCR_MATCH_02 · Chi tiết kèo</p><h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{match.title}</h1><p className="mt-3 flex items-center gap-2 text-sm text-white/75"><MapPin className="h-4 w-4" /> {match.venueName} · {match.courtName}</p></div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl"><span className="block text-[10px] font-bold uppercase tracking-wider text-white/65">Phí tham gia · 100%</span><b className="text-2xl">{formatMoney(matchFee)}</b></div>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7 p-5 sm:p-8 lg:border-r lg:border-border/60">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/55 p-4"><span className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Clock3 className="h-4 w-4 text-primary" /> THỜI GIAN</span><p className="mt-2 font-black">{match.timeRange} · Slot {match.slotNumber}</p><p className="text-sm text-muted-foreground">{match.dateLabel}</p></div>
              <div className="rounded-2xl bg-muted/55 p-4"><span className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /> ĐỊA ĐIỂM</span><p className="mt-2 font-black">{match.venueName}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.address)}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Chỉ đường Google Maps <ExternalLink className="h-3.5 w-3.5" /></a></div>
            </div>

            <div><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Roster trận đấu</p><h2 className="mt-1 text-xl font-black">Vận động viên ({match.participants.length}/{match.maxPlayers})</h2></div><span className="text-xs font-bold text-muted-foreground">{remaining ? `Còn ${remaining} vị trí` : 'Đã chốt đội hình'}</span></div>
              <div className="mt-4 space-y-3">
                {match.participants.map((person, index) => <div key={person.id} className={`flex items-center gap-3 rounded-2xl border p-3.5 ${person.isCurrentUser ? 'border-primary/30 bg-secondary/25' : 'border-border/70 bg-background'}`}><span className="w-5 text-center text-xs font-black text-muted-foreground">{index + 1}</span><img src={person.avatarUrl} alt={person.name} className="h-11 w-11 rounded-full object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-black">{person.name}</p>{person.isHost && <Badge variant="outline" className="text-[9px]">HOST</Badge>}{person.isCurrentUser && <Badge className="text-[9px]">BẠN</Badge>}</div><p className="text-xs text-muted-foreground">DUPR {person.dupr.toFixed(2)} · Uy tín {person.reputation}%</p></div><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>)}
                {Array.from({ length: remaining }).map((_, index) => <div key={index} className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3.5"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-primary/40 text-primary"><UserRound className="h-5 w-5" /></span><div><p className="text-sm font-black text-primary">Bạn có thể tham gia vị trí này</p><p className="text-xs text-muted-foreground">Yêu cầu DUPR {match.duprMin.toFixed(2)}–{match.duprMax.toFixed(2)}</p></div></div>)}
              </div>
            </div>

            <div><h2 className="text-base font-black">Tiện ích tại sân</h2><div className="mt-3 flex flex-wrap gap-2">{match.amenities.map((item) => <span key={item} className="rounded-full bg-secondary/45 px-3 py-1.5 text-xs font-bold text-primary"><Check className="mr-1 inline h-3.5 w-3.5" />{item}</span>)}</div><p className="mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">{match.note}</p></div>
          </div>

          <aside className="space-y-5 bg-muted/20 p-5 sm:p-8">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4"><div className="flex items-center gap-2 font-black text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-5 w-5" /> Chính sách thanh toán & hoàn phí</div><ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground"><li>• Thanh toán 100% phí tham gia: {formatMoney(matchFee)}.</li><li>• Hủy trước giờ đấu ít nhất 6 giờ: hoàn 100% về Ví FITLYO.</li><li>• Hủy dưới 6 giờ hoặc vắng mặt: mất toàn bộ phí.</li><li>• Kèo thiếu người sẽ tự hủy trước 60 phút và hoàn 100%.</li></ul></div>
            <div className="rounded-2xl border border-border/70 bg-card p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold"><WalletCards className="h-4 w-4 text-primary" /> Ví FITLYO</span><b>{formatMoney(profile.walletBalance)}</b></div><div className="my-4 border-t border-border/60" /><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Phí tham gia · 100%</span><b>{formatMoney(matchFee)}</b></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">Phí giao dịch</span><b className="text-emerald-600">0đ</b></div></div>

            {!inRange && !joined && <div className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm"><b className="text-orange-700 dark:text-orange-300">DUPR chưa phù hợp</b><p className="mt-1 text-xs text-muted-foreground">Kèo yêu cầu {match.duprMin.toFixed(2)}–{match.duprMax.toFixed(2)}, trong khi bạn đang ở mức {profile.dupr.toFixed(2)}.</p></div>}

            {joined && ticket ? <Button onClick={() => navigate(`/player/matches/${match.id}/ticket`)} className="h-13 w-full gap-2 rounded-2xl font-black"><QrCode className="h-5 w-5" /> Mở vé QR vào sân</Button> : <Button disabled={!inRange || isFull || match.status !== 'OPEN'} onClick={openCheckout} className="h-13 w-full gap-2 rounded-2xl bg-accent font-black text-accent-foreground hover:bg-accent/90"><Sparkles className="h-5 w-5" /> {isFull ? 'Kèo đã đủ người' : 'Thanh toán 100%'}</Button>}
            <p className="text-center text-[11px] leading-5 text-muted-foreground">Thanh toán thành công, vé QR xuất hiện ngay trong Lịch của tôi.</p>
          </aside>
        </div>
      </section>

      {showCheckout && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#082A2D]/65 p-0 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true">
          <div className="h-full w-full overflow-y-auto bg-background px-5 pb-8 pt-5 shadow-2xl sm:max-h-[94vh] sm:max-w-3xl sm:rounded-[2rem] sm:border sm:border-border sm:p-8">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
              <BrandLogo className="h-8 w-auto" />
              <Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            <h2 className="fitlyo-display mt-8 text-4xl font-black sm:text-5xl">Xác nhận tham gia</h2>

            <div className="fitlyo-elevated mt-7 grid overflow-hidden rounded-[1.6rem] sm:grid-cols-[210px_1fr]">
              <img src={match.imageUrl} alt={match.title} className="h-52 w-full object-cover sm:h-full" />
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-black">{match.title}</h3>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground"><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{match.venueName} · {match.area}</p><p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />{match.dateLabel} · {match.timeRange}</p></div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-secondary/55 px-3 py-1.5 text-primary">DUPR {match.duprMin}–{match.duprMax}</span><span className="rounded-full bg-muted px-3 py-1.5">1 suất / 1 người</span><span className="rounded-full bg-muted px-3 py-1.5">Còn {remaining} chỗ</span></div>
              </div>
            </div>

            <div className="fitlyo-elevated mt-5 rounded-[1.6rem] p-5 sm:p-6">
              <h3 className="text-xl font-black">Thông tin buổi chơi</h3>
              <div className="mt-5 space-y-3 text-sm text-muted-foreground"><p className="flex gap-3"><UserRound className="h-5 w-5 shrink-0 text-primary" />Người tổ chức: {match.participants.find((person) => person.isHost)?.name ?? 'FITLYO Host'}</p><p className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" />Thanh toán 100%; phí gồm sân, bóng dùng chung và giữ chỗ.</p><p className="flex gap-3"><Clock3 className="h-5 w-5 shrink-0 text-primary" />Hủy trước 6 giờ được hoàn 100%; dưới 6 giờ hoặc no-show mất toàn bộ phí.</p></div>
              <div className="mt-5 flex items-end justify-between border-t border-border/60 pt-5"><span className="text-lg font-black">Tổng phí</span><b className="text-3xl">{formatMoney(matchFee)}</b></div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setPaymentMethod('WALLET')} className={`flex items-center gap-3 rounded-[1.35rem] border p-4 text-left transition ${paymentMethod === 'WALLET' ? 'border-primary bg-secondary/25 ring-1 ring-primary/20' : 'border-border bg-card'}`}><WalletCards className="h-6 w-6 text-primary" /><span className="flex-1"><b className="block text-sm">Ví FITLYO</b><small className="text-muted-foreground">Số dư {formatMoney(profile.walletBalance)}</small></span>{paymentMethod === 'WALLET' && <CheckCircle2 className="h-5 w-5 text-primary" />}</button>
              <button type="button" onClick={() => setPaymentMethod('VIETQR')} className={`flex items-center gap-3 rounded-[1.35rem] border p-4 text-left transition ${paymentMethod === 'VIETQR' ? 'border-primary bg-secondary/25 ring-1 ring-primary/20' : 'border-border bg-card'}`}><QrCode className="h-6 w-6 text-primary" /><span className="flex-1"><b className="block text-sm">Thanh toán mô phỏng</b><small className="text-muted-foreground">Bản demo không thu tiền thật</small></span>{paymentMethod === 'VIETQR' && <CheckCircle2 className="h-5 w-5 text-primary" />}</button>
            </div>
            {paymentMethod === 'VIETQR' && <div className="mt-4 rounded-2xl border border-dashed border-primary/25 bg-white p-4 text-center text-[#143F42]"><QrCode className="mx-auto h-20 w-20" /><p className="mt-2 font-mono text-xs font-bold">FITLYO-{match.id.toUpperCase()}</p><p className="text-[10px] text-slate-500">Mã thanh toán mô phỏng</p></div>}
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[1.35rem] border border-border bg-card p-4 text-sm"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-5 w-5 accent-[#143F42]" /><span>Tôi đã đọc và đồng ý với <button type="button" className="font-bold text-primary underline">điều kiện tham gia, hủy và hoàn phí</button>.</span></label>
            <Button onClick={confirmJoin} disabled={!accepted || processing} className="fitlyo-coral-button mt-5 h-14 w-full rounded-2xl border-0 font-black disabled:opacity-45">{processing ? 'Đang xác nhận thanh toán...' : `Thanh toán 100% · ${formatMoney(matchFee)}`}</Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Chọn ô xác nhận để tiếp tục.</p>
          </div>
        </div>
      )}
    </div>
  )
}
