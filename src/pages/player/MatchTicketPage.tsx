import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, MapPin, MessageCircle, Phone, RefreshCw, ShieldCheck, Sparkles, Timer, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QrTicket } from '@/components/ui/qr-ticket'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

export function MatchTicketPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const match = usePlayerStore((state) => state.matches.find((item) => item.id === matchId))
  const ticket = usePlayerStore((state) => state.tickets.find((item) => item.matchId === matchId))
  const profile = usePlayerStore((state) => state.profile)
  const cancelTicket = usePlayerStore((state) => state.cancelTicket)
  const checkInTicket = usePlayerStore((state) => state.checkInTicket)
  const completeMatch = usePlayerStore((state) => state.completeMatch)
  const reviewed = usePlayerStore((state) => state.reviewedMatchIds.includes(matchId ?? ''))
  const showToast = useFitlyoStore((state) => state.showToast)
  const [seconds, setSeconds] = useState(60)
  const [cycle, setCycle] = useState(1)
  const [showCancel, setShowCancel] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) { setCycle((value) => value + 1); return 60 }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (!match || !ticket) {
    return <div className="py-24 text-center"><h1 className="text-2xl font-black">Vé không tồn tại hoặc không thuộc tài khoản này</h1><Button onClick={() => navigate('/player/schedule')} className="mt-4">Về Lịch của tôi</Button></div>
  }

  const contacts = match.participants.filter((person) => person.id !== profile.id)
  const active = ticket.status === 'ACTIVE'
  const checkedIn = ticket.status === 'CHECKED_IN'
  const completed = ticket.status === 'COMPLETED'
  const cancelled = ticket.status === 'CANCELLED'

  const handleCheckIn = () => {
    const result = checkInTicket(ticket.code)
    showToast(result.message, result.success ? 'success' : 'error')
  }

  const handleComplete = () => {
    const result = completeMatch(ticket.code)
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success) navigate(`/player/matches/${match.id}/review`)
  }

  const handleCancel = () => {
    const result = cancelTicket(ticket.code)
    showToast(result.message, result.success ? 'success' : 'error')
    setShowCancel(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex items-center justify-between gap-3"><Button variant="ghost" onClick={() => navigate('/player/schedule')} className="gap-2 rounded-xl"><ArrowLeft className="h-4 w-4" /> Lịch của tôi</Button><Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Chỉ chủ vé được xem</Badge></div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <div className="space-y-4">
          <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">SCR_MATCH_03 · Match Pass</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Vé điện tử vào sân</h1><p className="mt-2 text-sm text-muted-foreground">Đưa mã cho tiếp tân FITLYO để quét khi tới cụm sân.</p></div>

          <div className="relative">
            <QrTicket key={cycle} ticketCode={ticket.code} venueName={match.venueName} courtName={match.courtName} slotNumber={match.slotNumber} timeRange={match.timeRange} dateStr={match.dateLabel} duprRange={`DUPR ${match.duprMin.toFixed(2)} – ${match.duprMax.toFixed(2)}`} format={match.format} playerName={profile.name} depositAmount={match.deposit} onShare={() => showToast('Đã tạo liên kết chia sẻ thông tin vé (QR vẫn riêng tư).', 'info')} />
            {(checkedIn || completed || cancelled) && <div className={`absolute inset-0 flex items-center justify-center rounded-2xl backdrop-blur-[2px] ${cancelled ? 'bg-background/78' : 'bg-emerald-950/18'}`}><div className={`-rotate-6 rounded-2xl border-4 px-6 py-4 text-center shadow-2xl ${cancelled ? 'border-destructive bg-card text-destructive' : 'border-emerald-600 bg-card text-emerald-700 dark:text-emerald-300'}`}>{cancelled ? <XCircle className="mx-auto h-8 w-8" /> : <CheckCircle2 className="mx-auto h-8 w-8" />}<p className="mt-2 text-xl font-black">{cancelled ? 'ĐÃ HỦY & HOÀN CỌC' : completed ? 'TRẬN ĐẤU ĐÃ KẾT THÚC' : `ĐÃ CHECK-IN ${ticket.checkedInAt}`}</p></div></div>}
          </div>

          {active && <div className="rounded-2xl border border-primary/15 bg-secondary/25 p-4"><div className="flex items-center justify-between text-sm font-bold"><span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" /> Dynamic QR tự làm mới</span><span className={seconds <= 10 ? 'text-orange-600' : 'text-primary'}>{seconds}s</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all duration-1000 ${seconds <= 10 ? 'bg-orange-500' : 'bg-primary'}`} style={{ width: `${(seconds / 60) * 100}%` }} /></div><p className="mt-2 text-[11px] text-muted-foreground">Chu kỳ bảo mật #{cycle}. Mã mô phỏng thay đổi sau mỗi 60 giây để hạn chế chia sẻ ảnh chụp.</p></div>}
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.6rem] border border-border/70 bg-card p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-primary">Thông tin vào sân</p><div className="mt-4 space-y-4 text-sm"><div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><b>{match.venueName}</b><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{match.address}</p></div></div><div className="flex gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><b>{match.dateLabel}</b><p className="mt-0.5 text-xs text-muted-foreground">{match.timeRange} · Slot {match.slotNumber}</p></div></div><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><b>{ticket.locker}</b><p className="mt-0.5 text-xs text-muted-foreground">Tủ đồ miễn phí được giữ theo vé</p></div></div></div><Button asChild variant="outline" className="mt-5 w-full gap-2 rounded-xl"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.address)}`} target="_blank" rel="noreferrer"><MapPin className="h-4 w-4" /> Chỉ đường Google Maps <ExternalLink className="h-3.5 w-3.5" /></a></Button></section>

          <section className="rounded-[1.6rem] border border-border/70 bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-black">Nhóm trận đấu</h2><Badge variant="outline">{match.participants.length}/{match.maxPlayers}</Badge></div><div className="mt-4 space-y-3">{contacts.map((person, index) => <div key={person.id} className="flex items-center gap-3"><img src={person.avatarUrl} alt={person.name} className="h-10 w-10 rounded-full object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{person.name}</p><p className="text-[11px] text-muted-foreground">{index === 0 ? 'Host' : 'Bạn chơi'} · 09{index + 1}x.xxx.{231 + index * 107}</p></div><Button size="icon" variant="ghost" onClick={() => showToast(`Đã mở chat mô phỏng với ${person.name}.`, 'info')}><MessageCircle className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => showToast('Cuộc gọi ẩn danh chỉ được mô phỏng trong prototype.', 'info')}><Phone className="h-4 w-4" /></Button></div>)}</div><Button variant="secondary" onClick={() => showToast('Đã mở phòng chat nhóm mô phỏng.', 'info')} className="mt-5 w-full gap-2 rounded-xl"><MessageCircle className="h-4 w-4" /> Chat với nhóm</Button></section>

          {active && <div className="space-y-2"><Button onClick={handleCheckIn} className="w-full gap-2 rounded-xl font-black"><CheckCircle2 className="h-4 w-4" /> Mô phỏng quét QR thành công</Button><Button variant="ghost" onClick={() => setShowCancel(true)} className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">Hủy vé & rút cọc</Button></div>}
          {checkedIn && <Button onClick={handleComplete} className="w-full gap-2 rounded-xl bg-accent font-black text-accent-foreground hover:bg-accent/90"><Timer className="h-4 w-4" /> Mô phỏng kết thúc trận</Button>}
          {completed && !reviewed && <Button onClick={() => navigate(`/player/matches/${match.id}/review`)} className="w-full gap-2 rounded-xl bg-accent font-black text-accent-foreground hover:bg-accent/90"><Sparkles className="h-4 w-4" /> Đánh giá sau trận</Button>}
          {completed && reviewed && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mx-auto mb-2 h-5 w-5" /> Bạn đã hoàn tất đánh giá trận này.</div>}
        </aside>
      </div>

      {showCancel && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#082A2D]/65 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl"><div className="flex items-start justify-between"><div className="rounded-xl bg-destructive/10 p-2.5 text-destructive"><XCircle className="h-6 w-6" /></div><Button size="icon" variant="ghost" onClick={() => setShowCancel(false)}><X className="h-5 w-5" /></Button></div><h2 className="mt-4 text-xl font-black">Hủy vé và rút cọc?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Prototype đang mô phỏng trường hợp hủy đúng hạn. Bạn sẽ được hoàn đủ {match.deposit.toLocaleString('vi-VN')}đ về Ví FITLYO.</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setShowCancel(false)}>Giữ lại vé</Button><Button variant="destructive" onClick={handleCancel}>Xác nhận hủy</Button></div></div></div>}
    </div>
  )
}
