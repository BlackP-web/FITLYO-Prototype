import { useEffect, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  CalendarCheck2,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Send,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { HoldCountdown } from '@/components/payment/HoldCountdown'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCoachBookingStore } from '@/store/useCoachBookingStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePaymentStore } from '@/store/usePaymentStore'
import type { CoachBooking } from '@/types/coachBooking'

const statusMeta: Record<CoachBooking['status'], { label: string; tone: string }> = {
  PENDING_COACH: { label: 'Cần duyệt', tone: 'border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  AWAITING_PAYMENT: { label: 'Chờ Player thanh toán', tone: 'border-blue-400/35 bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  DECLINED: { label: 'Đã từ chối', tone: 'border-destructive/30 bg-destructive/10 text-destructive' },
  CANCELLED: { label: 'Đã hủy', tone: 'border-border bg-muted text-muted-foreground' },
  EXPIRED: { label: 'Đã hết hạn', tone: 'border-slate-400/35 bg-slate-500/10 text-slate-600 dark:text-slate-300' },
  REFUNDED: { label: 'Đã hoàn tiền', tone: 'border-violet-400/35 bg-violet-500/10 text-violet-700 dark:text-violet-300' },
}

export function CoachBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const coachAccount = useFitlyoStore((state) => state.coachAccount)
  const showToast = useFitlyoStore((state) => state.showToast)
  const bookings = useCoachBookingStore((state) => state.bookings)
  const messages = useCoachBookingStore((state) => state.messages)
  const approveRequest = useCoachBookingStore((state) => state.approveRequest)
  const declineRequest = useCoachBookingStore((state) => state.declineRequest)
  const refreshExpirations = useCoachBookingStore((state) => state.refreshExpirations)
  const cancelByCoach = useCoachBookingStore((state) => state.cancelByCoach)
  const cancelCourseSessionByCoach = useCoachBookingStore((state) => state.cancelCourseSessionByCoach)
  const sendMessage = useCoachBookingStore((state) => state.sendMessage)
  const payments = usePaymentStore((state) => state.records)
  const [draft, setDraft] = useState('')
  const [cancelTarget, setCancelTarget] = useState<{ type: 'BOOKING' | 'SESSION'; sessionId?: string } | null>(null)

  useEffect(() => {
    refreshExpirations()
    const timer = window.setInterval(refreshExpirations, 30_000)
    return () => window.clearInterval(timer)
  }, [refreshExpirations])

  const ownBookings = bookings.filter((booking) => booking.coachId === coachAccount.id)
  const pendingCount = ownBookings.filter((booking) => booking.status === 'PENDING_COACH').length
  const requestedId = searchParams.get('booking')
  const selected = ownBookings.find((booking) => booking.id === requestedId) ?? ownBookings[0]
  const conversation = selected ? messages.filter((message) => message.bookingId === selected.id) : []
  const selectedPayment = selected?.paymentReferenceId
    ? payments.find((payment) => payment.referenceId === selected.paymentReferenceId)
    : undefined

  const handleDecision = (decision: 'approve' | 'decline') => {
    if (!selected) return
    const result = decision === 'approve' ? approveRequest(selected.id) : declineRequest(selected.id)
    showToast(result.message, result.success ? 'success' : 'error')
  }

  const submitMessage = (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !sendMessage(selected.id, 'COACH', coachAccount.name, draft)) return
    setDraft('')
  }

  const confirmCancellation = () => {
    if (!selected || !cancelTarget) return
    const result = cancelTarget.type === 'SESSION' && cancelTarget.sessionId
      ? cancelCourseSessionByCoach(selected.id, cancelTarget.sessionId)
      : cancelByCoach(selected.id)
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success) setCancelTarget(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Lịch hẹn & hội thoại</p><h1 className="mt-1 text-3xl font-black tracking-tight">Học viên của tôi</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Duyệt yêu cầu ngoài lịch công bố, theo dõi lịch đã xác nhận và trao đổi với học viên.</p></div>
        <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">Cần xử lý</p><p className="mt-1 text-2xl font-black">{pendingCount} yêu cầu</p></div>
      </header>

      {!ownBookings.length ? (
        <section className="rounded-[2rem] border border-dashed border-primary/25 bg-secondary/15 py-20 text-center"><UserRoundCheck className="mx-auto h-11 w-11 text-primary" /><h2 className="mt-4 text-xl font-black">Chưa có lịch đặt mới</h2><p className="mt-2 text-sm text-muted-foreground">Các lịch Player đặt hoặc yêu cầu giờ khác sẽ xuất hiện tại đây.</p></section>
      ) : selected ? (
        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-3">
            {ownBookings.map((booking) => {
              const meta = statusMeta[booking.status]
              return <button key={booking.id} type="button" onClick={() => setSearchParams({ booking: booking.id })} className={cn('w-full rounded-2xl border bg-card p-4 text-left transition', booking.id === selected.id ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-border/70 hover:border-primary/30')}><div className="flex items-center gap-3"><img src={booking.playerAvatarUrl} alt={booking.playerName} className="h-11 w-11 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{booking.playerName}</p><p className="text-[11px] text-muted-foreground">{booking.type === 'COURSE' ? 'Khóa 8 buổi' : 'PT cá nhân'}</p></div><Badge variant="outline" className={meta.tone}>{meta.label}</Badge></div><p className="mt-3 line-clamp-2 text-sm font-bold">{booking.title}</p><p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="h-3 w-3" />{booking.firstDate} · {booking.preferredTimeRange}</p></button>
            })}
          </aside>

          <div className="space-y-5">
            <section className="rounded-[1.8rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div className="flex items-start gap-4"><img src={selected.playerAvatarUrl} alt={selected.playerName} className="h-16 w-16 rounded-2xl object-cover" /><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">{selected.playerName}</h2><Badge variant="outline" className={statusMeta[selected.status].tone}>{statusMeta[selected.status].label}</Badge>{selectedPayment && <PaymentStatusBadge status={selectedPayment.status} />}</div><p className="mt-1 text-sm font-semibold text-primary">{selected.title}</p><p className="mt-2 text-xs text-muted-foreground">{selected.type === 'COURSE' ? 'Khóa 8 buổi · tự xếp 2 buổi/tuần' : 'PT 1-1 · 90 phút'}</p></div></div><div className="flex flex-wrap gap-2">{selected.status === 'PENDING_COACH' && <><Button variant="outline" onClick={() => handleDecision('decline')} className="text-destructive"><X /> Từ chối</Button><Button onClick={() => handleDecision('approve')}><Check /> Đồng ý giờ này</Button></>}{selected.status === 'CONFIRMED' && <Button variant="outline" className="text-destructive" onClick={() => setCancelTarget({ type: 'BOOKING' })}><X /> Coach hủy lịch</Button>}</div></div>

              {selected.status === 'PENDING_COACH' && <div className="mt-5 rounded-2xl border border-amber-300/50 bg-amber-500/10 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-black text-amber-800 dark:text-amber-200">Coach có tối đa 12 giờ để xử lý</p><p className="mt-1 text-xs text-muted-foreground">Quá hạn, yêu cầu tự hủy và slot được mở lại. Player chưa bị trừ tiền.</p></div><HoldCountdown expiresAt={selected.approvalExpiresAt} onExpire={refreshExpirations} /></div></div>}

              {selected.status === 'AWAITING_PAYMENT' && selected.paymentExpiresAt && <div className="mt-5 rounded-2xl border border-blue-300/50 bg-blue-500/10 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-black text-blue-800 dark:text-blue-200">Chờ Player thanh toán 100% học phí</p><p className="mt-1 text-xs text-muted-foreground">Hết 15 phút, lịch tự mở lại và không phát sinh khoản thu.</p></div><HoldCountdown expiresAt={selected.paymentExpiresAt} onExpire={refreshExpirations} /></div></div>}

              <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-muted/60 p-4"><CalendarCheck2 className="h-5 w-5 text-primary" /><p className="mt-2 text-[11px] text-muted-foreground">Ngày đầu</p><p className="mt-1 text-sm font-black">{selected.sessions[0]?.dateLabel ?? selected.firstDate}</p></div><div className="rounded-2xl bg-muted/60 p-4"><Clock3 className="h-5 w-5 text-primary" /><p className="mt-2 text-[11px] text-muted-foreground">Khung giờ</p><p className="mt-1 text-sm font-black">{selected.preferredTimeRange}</p></div><div className="rounded-2xl bg-muted/60 p-4"><MapPin className="h-5 w-5 text-primary" /><p className="mt-2 text-[11px] text-muted-foreground">Địa điểm</p><p className="mt-1 text-sm font-black">{selected.venueName}</p></div></div>

              <div className="mt-3 grid gap-3 rounded-2xl border border-border/70 p-4 sm:grid-cols-2"><div><p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tổng học phí</p><p className="mt-1 font-black">{selected.totalAmount.toLocaleString('vi-VN')}đ</p></div><div><p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Thanh toán sau khi duyệt</p><p className="mt-1 font-black text-primary">100% · {selected.paymentAmount.toLocaleString('vi-VN')}đ</p><p className="mt-1 text-[10px] text-muted-foreground">Thanh toán một lần trong 15 phút</p></div></div>

              {selected.sessions.length > 0 && <div className="mt-6"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Các buổi đã giữ lịch</p><div className="mt-3 flex gap-2 overflow-x-auto pb-2">{selected.sessions.map((session) => <div key={session.id} className={cn('min-w-[155px] rounded-xl border border-border/70 p-3', session.status === 'CANCELLED' && 'opacity-55')}><span className="text-[10px] font-black text-primary">BUỔI {session.sequence}</span><p className="mt-1 text-sm font-bold">{session.dateLabel}</p><p className="text-[10px] text-muted-foreground">{session.timeRange}</p>{session.status === 'CANCELLED' ? <p className="mt-2 text-[10px] font-black text-destructive">ĐÃ HỦY</p> : selected.type === 'COURSE' && selected.status === 'CONFIRMED' ? <button type="button" onClick={() => setCancelTarget({ type: 'SESSION', sessionId: session.id })} className="mt-2 text-left text-[10px] font-black text-destructive hover:underline">Không thể xếp lại · Hủy buổi</button> : null}</div>)}</div><p className="mt-2 text-[11px] text-muted-foreground">Nếu Coach hủy một buổi khóa học và không thể xếp lại, Player được hoàn tổng học phí ÷ 8 cùng voucher bồi thường.</p></div>}
            </section>

            <section className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-card">
              <div className="flex items-center gap-3 border-b border-border/70 p-4"><span className="rounded-xl bg-secondary/55 p-2 text-primary"><MessageCircle className="h-5 w-5" /></span><div><h3 className="font-black">Trao đổi với {selected.playerName}</h3><p className="text-[11px] text-muted-foreground">Kênh liên hệ chính thức trên FITLYO</p></div></div>
              <div className="max-h-[360px] min-h-[230px] space-y-3 overflow-y-auto bg-muted/20 p-4 sm:p-5">{conversation.map((message) => <div key={message.id} className={cn('flex', message.senderRole === 'COACH' ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[82%] rounded-2xl px-4 py-3 text-sm', message.senderRole === 'COACH' ? 'rounded-br-md bg-primary text-primary-foreground' : message.senderRole === 'SYSTEM' ? 'border border-primary/15 bg-secondary/35' : 'rounded-bl-md border border-border bg-card')}><p className="text-[10px] font-black opacity-65">{message.senderName}</p><p className="mt-1 leading-6">{message.text}</p><p className="mt-1 text-[9px] opacity-55">{new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}</div>
              <form onSubmit={submitMessage} className="flex gap-2 border-t border-border/70 p-3 sm:p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhắn học viên..." className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" /><Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" aria-label="Gửi tin nhắn"><Send className="h-4 w-4" /></Button></form>
            </section>
          </div>
        </div>
      ) : null}

      {cancelTarget && selected && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="coach-cancel-title" className="w-full max-w-md rounded-[1.8rem] border border-border bg-card p-6 shadow-2xl"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle className="h-5 w-5" /></span><h2 id="coach-cancel-title" className="mt-4 text-xl font-black">{cancelTarget.type === 'SESSION' ? 'Xác nhận hủy một buổi học?' : 'Xác nhận Coach hủy lịch?'}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{cancelTarget.type === 'SESSION' ? `Player sẽ được hoàn ${(selected.totalAmount / 8).toLocaleString('vi-VN')}đ (tổng học phí ÷ 8) về Ví FITLYO và nhận voucher bồi thường.` : 'FITLYO sẽ hoàn 100% khoản Player đã thanh toán và cấp voucher 10% giá trị booking, tối đa 100.000đ, hạn 30 ngày.'}</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setCancelTarget(null)}>Quay lại</Button><Button variant="destructive" onClick={confirmCancellation}>Xác nhận hủy</Button></div></section></div>}
    </div>
  )
}
