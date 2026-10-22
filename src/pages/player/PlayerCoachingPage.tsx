import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  WalletCards,
  QrCode,
  XCircle,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlayerPageHeader } from '@/components/player/PlayerPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HoldCountdown } from '@/components/payment/HoldCountdown'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { cn } from '@/lib/utils'
import { useCoachBookingStore } from '@/store/useCoachBookingStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { usePaymentStore } from '@/store/usePaymentStore'
import type { CoachBooking } from '@/types/coachBooking'

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`

const statusMeta: Record<CoachBooking['status'], { label: string; tone: string }> = {
  PENDING_COACH: { label: 'Chờ Coach duyệt', tone: 'border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  AWAITING_PAYMENT: { label: 'Chờ thanh toán', tone: 'border-blue-400/35 bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  DECLINED: { label: 'Coach chưa thể nhận', tone: 'border-destructive/30 bg-destructive/10 text-destructive' },
  CANCELLED: { label: 'Đã hủy', tone: 'border-border bg-muted text-muted-foreground' },
  EXPIRED: { label: 'Hết hạn', tone: 'border-border bg-muted text-muted-foreground' },
  REFUNDED: { label: 'Đã hoàn tiền', tone: 'border-violet-400/35 bg-violet-500/10 text-violet-700 dark:text-violet-300' },
}

export function PlayerCoachingPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const profile = usePlayerStore((state) => state.profile)
  const bookings = useCoachBookingStore((state) => state.bookings)
  const messages = useCoachBookingStore((state) => state.messages)
  const sendMessage = useCoachBookingStore((state) => state.sendMessage)
  const payApprovedRequest = useCoachBookingStore((state) => state.payApprovedRequest)
  const refreshExpirations = useCoachBookingStore((state) => state.refreshExpirations)
  const cancelByPlayer = useCoachBookingStore((state) => state.cancelByPlayer)
  const requestLateReschedule = useCoachBookingStore((state) => state.requestLateReschedule)
  const paymentRecords = usePaymentStore((state) => state.records)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [draft, setDraft] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'VIETQR'>('VIETQR')

  useEffect(() => {
    refreshExpirations()
    const timer = window.setInterval(refreshExpirations, 15_000)
    return () => window.clearInterval(timer)
  }, [refreshExpirations])

  const ownBookings = bookings.filter((booking) => booking.playerId === profile.id)
  const requestedId = searchParams.get('booking')
  const selected = ownBookings.find((booking) => booking.id === requestedId) ?? ownBookings[0]
  const conversation = selected ? messages.filter((message) => message.bookingId === selected.id) : []

  const selectBooking = (bookingId: string) => setSearchParams({ booking: bookingId })

  const submitMessage = (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !sendMessage(selected.id, 'PLAYER', profile.name, draft)) return
    setDraft('')
  }

  const payFullAmount = () => {
    if (!selected) return
    const result = payApprovedRequest(selected.id, paymentMethod)
    showToast(result.message, result.success ? 'success' : 'error')
  }

  const handleCancel = () => {
    if (!selected) return
    const result = cancelByPlayer(selected.id)
    showToast(result.message, result.success ? 'success' : 'error')
  }

  const handleReschedule = () => {
    if (!selected) return
    const result = requestLateReschedule(selected.id)
    showToast(result.message, result.success ? 'success' : 'error')
  }

  if (!ownBookings.length) {
    return (
      <div className="space-y-7">
        <PlayerPageHeader eyebrow="FITLYO Coaching" title="Huấn luyện của tôi" description="Quản lý lịch học, khóa học và trao đổi trực tiếp với Coach." icon={GraduationCap} />
        <section className="rounded-[2rem] border border-dashed border-primary/25 bg-secondary/15 px-6 py-20 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-5 text-2xl font-black">Bạn chưa có lịch với Coach</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Chọn lịch phù hợp, chờ Coach duyệt tối đa 12 giờ rồi thanh toán 100% học phí trong 15 phút.</p>
          <Button onClick={() => navigate('/player/coaches')} className="mt-6 gap-2 rounded-xl">Tìm Coach phù hợp <ArrowRight className="h-4 w-4" /></Button>
        </section>
      </div>
    )
  }

  if (!selected) return null
  const meta = statusMeta[selected.status]
  const paymentRecord = paymentRecords.find((record) => record.referenceId === selected.paymentReferenceId)

  return (
    <div className="space-y-7 pb-8">
      <PlayerPageHeader eyebrow="FITLYO Coaching" title="Huấn luyện của tôi" description="Lịch học, tiến độ khóa và chat nội bộ với Coach trong cùng một nơi." icon={GraduationCap} action={<Button onClick={() => navigate('/player/coaches')} variant="outline" className="rounded-xl">Đặt thêm lịch</Button>} />

      <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {ownBookings.map((booking) => {
            const itemMeta = statusMeta[booking.status]
            return (
              <button key={booking.id} type="button" onClick={() => selectBooking(booking.id)} className={cn('w-full rounded-2xl border bg-card p-4 text-left transition', selected.id === booking.id ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-border/70 hover:border-primary/30')}>
                <div className="flex items-center gap-3"><img src={booking.coachAvatarUrl} alt={booking.coachName} className="h-11 w-11 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{booking.coachName}</p><p className="truncate text-[11px] text-muted-foreground">{booking.type === 'COURSE' ? 'Khóa 8 buổi' : 'PT 1-1 · 90 phút'}</p></div></div>
                <p className="mt-3 line-clamp-2 text-sm font-bold">{booking.title}</p>
                <div className="mt-3 flex items-center justify-between gap-2"><Badge variant="outline" className={itemMeta.tone}>{itemMeta.label}</Badge><span className="text-[10px] font-semibold text-muted-foreground">{booking.preferredTimeRange}</span></div>
              </button>
            )
          })}
        </aside>

        <div className="space-y-5">
          <section className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-card shadow-sm">
            <div className="brand-gradient p-5 text-white sm:p-7">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div><div className="flex flex-wrap items-center gap-2"><Badge className="border-white/20 bg-white/15 text-white"><ShieldCheck className="h-3.5 w-3.5" /> FITLYO bảo vệ lịch học</Badge><Badge className={cn('border-white/20 bg-white text-[#143F42]', meta.tone)}>{meta.label}</Badge>{paymentRecord && <PaymentStatusBadge status={paymentRecord.status} />}</div><h2 className="mt-4 text-2xl font-black">{selected.title}</h2><p className="mt-2 text-sm text-white/70">{selected.coachName} · {selected.type === 'COURSE' ? '8 buổi, tối đa 2 buổi/tuần' : 'Buổi PT cá nhân 90 phút'}</p></div>
                <Button onClick={() => navigate(`/player/coaches/${selected.coachId}`)} className="bg-white text-primary hover:bg-white/90">Xem hồ sơ Coach</Button>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
              <div className="rounded-2xl bg-muted/60 p-4"><MapPin className="h-5 w-5 text-primary" /><p className="mt-3 text-xs font-semibold text-muted-foreground">Địa điểm</p><p className="mt-1 text-sm font-black">{selected.venueName}</p><p className="text-[11px] text-muted-foreground">{selected.courtName}</p></div>
              <div className="rounded-2xl bg-muted/60 p-4"><CalendarCheck2 className="h-5 w-5 text-primary" /><p className="mt-3 text-xs font-semibold text-muted-foreground">Lịch đầu tiên</p><p className="mt-1 text-sm font-black">{selected.sessions[0]?.dateLabel ?? selected.firstDate}</p><p className="text-[11px] text-muted-foreground">{selected.preferredTimeRange}</p></div>
              <div className="rounded-2xl bg-muted/60 p-4"><CreditCard className="h-5 w-5 text-primary" /><p className="mt-3 text-xs font-semibold text-muted-foreground">Học phí · 100%</p><p className="mt-1 text-sm font-black">{formatMoney(selected.paymentAmount)}</p><p className="text-[11px] text-muted-foreground">Thanh toán một lần sau khi Coach duyệt</p></div>
            </div>

            {selected.status === 'PENDING_COACH' && <div className="mx-5 mb-5 space-y-3 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 text-sm"><div><strong>Đang chờ Coach duyệt giờ đề xuất.</strong><p className="mt-1 text-xs text-muted-foreground">Bạn chưa bị trừ tiền. Hết 12 giờ, yêu cầu tự hủy và giải phóng lịch.</p></div><HoldCountdown expiresAt={selected.approvalExpiresAt} label="Thời gian Coach còn lại" /></div>}
            {selected.status === 'AWAITING_PAYMENT' && selected.paymentExpiresAt && <div className="mx-5 mb-5 space-y-4 rounded-2xl border border-blue-300/40 bg-blue-500/10 p-4"><div><strong>Coach đã đồng ý khung giờ.</strong><p className="mt-1 text-xs text-muted-foreground">Bạn có 15 phút để chọn phương thức và thanh toán 100% học phí.</p></div><HoldCountdown expiresAt={selected.paymentExpiresAt} onExpire={refreshExpirations} /><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setPaymentMethod('WALLET')} className={cn('flex items-center gap-2 rounded-xl border p-3 text-left text-xs', paymentMethod === 'WALLET' ? 'border-primary bg-card' : 'border-border/70')}><WalletCards className="h-4 w-4 text-primary" /><span className="flex-1 font-bold">Ví · {formatMoney(profile.walletBalance)}</span></button><button type="button" onClick={() => setPaymentMethod('VIETQR')} className={cn('flex items-center gap-2 rounded-xl border p-3 text-left text-xs', paymentMethod === 'VIETQR' ? 'border-primary bg-card' : 'border-border/70')}><QrCode className="h-4 w-4 text-primary" /><span className="flex-1 font-bold">VietQR mô phỏng</span></button></div><Button onClick={payFullAmount} className="w-full">Thanh toán 100% · {formatMoney(selected.paymentAmount)}</Button></div>}
            {selected.status === 'CONFIRMED' && <div className="mx-5 mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"><div><strong>Đã thanh toán 100% · Lịch đã xác nhận.</strong><p className="mt-1 text-xs text-muted-foreground">Hủy trước ít nhất 24 giờ hoàn 100%. Hủy dưới 24 giờ được đổi lịch một lần; lần hủy tiếp theo không hoàn học phí.</p>{selected.rescheduleUsed && <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-300">Bạn đã sử dụng quyền đổi lịch một lần.</p>}</div><div className="flex shrink-0 gap-2">{!selected.rescheduleUsed && <Button variant="outline" onClick={handleReschedule}>Đổi lịch 1 lần</Button>}<Button variant="outline" onClick={handleCancel} className="text-destructive"><XCircle className="h-4 w-4" /> Hủy lịch</Button></div></div>}
            {selected.status === 'EXPIRED' && <div className="mx-5 mb-5 rounded-2xl border border-border bg-muted p-4 text-sm"><strong>Yêu cầu đã hết hạn.</strong><p className="mt-1 text-xs text-muted-foreground">Không phát sinh khoản thu và slot đã được mở lại.</p></div>}
            {selected.status === 'REFUNDED' && <div className="mx-5 mb-5 rounded-2xl border border-violet-300/40 bg-violet-500/10 p-4 text-sm"><strong>Booking đã hủy và hoàn tiền.</strong><p className="mt-1 text-xs text-muted-foreground">Khoản hoàn được cộng vào Ví FITLYO; voucher bồi thường hiển thị trong số dư ưu đãi.</p></div>}
          </section>

          {selected.sessions.length > 0 && (
            <section className="rounded-[1.8rem] border border-border/70 bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Lộ trình học</p><h3 className="mt-1 text-xl font-black">{selected.sessions.length} buổi đã xếp lịch</h3></div><Button variant="outline" onClick={() => navigate('/player/schedule')}>Mở Lịch của tôi</Button></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {selected.sessions.map((session) => <div key={session.id} className="flex items-center gap-3 rounded-2xl border border-border/70 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/55 text-xs font-black text-primary">{session.sequence}</span><div className="min-w-0"><p className="text-sm font-black">{session.dateLabel}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="h-3 w-3" />{session.timeRange}</p></div><CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" /></div>)}
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-card">
            <div className="flex items-center gap-3 border-b border-border/70 p-4 sm:p-5"><span className="rounded-xl bg-secondary/55 p-2 text-primary"><MessageCircle className="h-5 w-5" /></span><div><h3 className="font-black">Chat với {selected.coachName}</h3><p className="text-[11px] text-muted-foreground">Tin nhắn được lưu trong FITLYO để hỗ trợ khi cần</p></div></div>
            <div className="max-h-[360px] min-h-[220px] space-y-3 overflow-y-auto bg-muted/20 p-4 sm:p-5">
              {conversation.map((message) => <div key={message.id} className={cn('flex', message.senderRole === 'PLAYER' ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[82%] rounded-2xl px-4 py-3 text-sm', message.senderRole === 'PLAYER' ? 'rounded-br-md bg-primary text-primary-foreground' : message.senderRole === 'SYSTEM' ? 'border border-primary/15 bg-secondary/35 text-foreground' : 'rounded-bl-md border border-border bg-card')}><p className="text-[10px] font-black opacity-65">{message.senderName}</p><p className="mt-1 leading-6">{message.text}</p><p className="mt-1 text-[9px] opacity-55">{new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}
            </div>
            <form onSubmit={submitMessage} className="flex gap-2 border-t border-border/70 p-3 sm:p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhắn Coach về mục tiêu, dụng cụ hoặc địa điểm..." className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" /><Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" aria-label="Gửi tin nhắn"><Send className="h-4 w-4" /></Button></form>
          </section>
        </div>
      </div>
    </div>
  )
}
