import { useState, type FormEvent } from 'react'
import {
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCoachBookingStore } from '@/store/useCoachBookingStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachBooking } from '@/types/coachBooking'

const statusMeta: Record<CoachBooking['status'], { label: string; tone: string }> = {
  PENDING_COACH: { label: 'Cần duyệt', tone: 'border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  AWAITING_DEPOSIT: { label: 'Chờ Player cọc', tone: 'border-blue-400/35 bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  DECLINED: { label: 'Đã từ chối', tone: 'border-destructive/30 bg-destructive/10 text-destructive' },
  CANCELLED: { label: 'Đã hủy', tone: 'border-border bg-muted text-muted-foreground' },
}

export function CoachBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const coachAccount = useFitlyoStore((state) => state.coachAccount)
  const showToast = useFitlyoStore((state) => state.showToast)
  const bookings = useCoachBookingStore((state) => state.bookings)
  const messages = useCoachBookingStore((state) => state.messages)
  const approveRequest = useCoachBookingStore((state) => state.approveRequest)
  const declineRequest = useCoachBookingStore((state) => state.declineRequest)
  const sendMessage = useCoachBookingStore((state) => state.sendMessage)
  const [draft, setDraft] = useState('')

  const ownBookings = bookings.filter((booking) => booking.coachId === coachAccount.id)
  const pendingCount = ownBookings.filter((booking) => booking.status === 'PENDING_COACH').length
  const requestedId = searchParams.get('booking')
  const selected = ownBookings.find((booking) => booking.id === requestedId) ?? ownBookings[0]
  const conversation = selected ? messages.filter((message) => message.bookingId === selected.id) : []

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
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div className="flex items-start gap-4"><img src={selected.playerAvatarUrl} alt={selected.playerName} className="h-16 w-16 rounded-2xl object-cover" /><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">{selected.playerName}</h2><Badge variant="outline" className={statusMeta[selected.status].tone}>{statusMeta[selected.status].label}</Badge></div><p className="mt-1 text-sm font-semibold text-primary">{selected.title}</p><p className="mt-2 text-xs text-muted-foreground">{selected.type === 'COURSE' ? 'Khóa 8 buổi · tự xếp 2 buổi/tuần' : 'PT 1-1 · 90 phút'}</p></div></div>{selected.status === 'PENDING_COACH' && <div className="flex gap-2"><Button variant="outline" onClick={() => handleDecision('decline')} className="text-destructive"><X /> Từ chối</Button><Button onClick={() => handleDecision('approve')}><Check /> Đồng ý giờ này</Button></div>}</div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-muted/60 p-4"><CalendarCheck2 className="h-5 w-5 text-primary" /><p className="mt-2 text-[11px] text-muted-foreground">Ngày đầu</p><p className="mt-1 text-sm font-black">{selected.sessions[0]?.dateLabel ?? selected.firstDate}</p></div><div className="rounded-2xl bg-muted/60 p-4"><Clock3 className="h-5 w-5 text-primary" /><p className="mt-2 text-[11px] text-muted-foreground">Khung giờ</p><p className="mt-1 text-sm font-black">{selected.preferredTimeRange}</p></div><div className="rounded-2xl bg-muted/60 p-4"><MapPin className="h-5 w-5 text-primary" /><p className="mt-2 text-[11px] text-muted-foreground">Địa điểm</p><p className="mt-1 text-sm font-black">{selected.venueName}</p></div></div>

              {selected.sessions.length > 0 && <div className="mt-6"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Các buổi đã giữ lịch</p><div className="mt-3 flex gap-2 overflow-x-auto pb-2">{selected.sessions.map((session) => <div key={session.id} className="min-w-[145px] rounded-xl border border-border/70 p-3"><span className="text-[10px] font-black text-primary">BUỔI {session.sequence}</span><p className="mt-1 text-sm font-bold">{session.dateLabel}</p><p className="text-[10px] text-muted-foreground">{session.timeRange}</p></div>)}</div></div>}
            </section>

            <section className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-card">
              <div className="flex items-center gap-3 border-b border-border/70 p-4"><span className="rounded-xl bg-secondary/55 p-2 text-primary"><MessageCircle className="h-5 w-5" /></span><div><h3 className="font-black">Trao đổi với {selected.playerName}</h3><p className="text-[11px] text-muted-foreground">Kênh liên hệ chính thức trên FITLYO</p></div></div>
              <div className="max-h-[360px] min-h-[230px] space-y-3 overflow-y-auto bg-muted/20 p-4 sm:p-5">{conversation.map((message) => <div key={message.id} className={cn('flex', message.senderRole === 'COACH' ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[82%] rounded-2xl px-4 py-3 text-sm', message.senderRole === 'COACH' ? 'rounded-br-md bg-primary text-primary-foreground' : message.senderRole === 'SYSTEM' ? 'border border-primary/15 bg-secondary/35' : 'rounded-bl-md border border-border bg-card')}><p className="text-[10px] font-black opacity-65">{message.senderName}</p><p className="mt-1 leading-6">{message.text}</p><p className="mt-1 text-[9px] opacity-55">{new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p></div></div>)}</div>
              <form onSubmit={submitMessage} className="flex gap-2 border-t border-border/70 p-3 sm:p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhắn học viên..." className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" /><Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" aria-label="Gửi tin nhắn"><Send className="h-4 w-4" /></Button></form>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}
