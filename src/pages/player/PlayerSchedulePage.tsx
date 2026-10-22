import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  History,
  MapPin,
  QrCode,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { PlayerPageHeader } from '@/components/player/PlayerPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { courtRefundOutcome, hoursUntilEvent } from '@/lib/paymentPolicies'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePaymentStore } from '@/store/usePaymentStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { PlayerScheduleItem } from '@/types/player'

const kindMeta = {
  MATCH: { label: 'KÈO SOCIAL DUPR', icon: Trophy, tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  COURSE: { label: 'LỚP HỌC HLV', icon: GraduationCap, tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  COURT: { label: 'ĐẶT BAO SÂN', icon: CalendarDays, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
}

export function PlayerSchedulePage() {
  const navigate = useNavigate()
  const schedule = usePlayerStore((state) => state.schedule)
  const matches = usePlayerStore((state) => state.matches)
  const reviewedIds = usePlayerStore((state) => state.reviewedMatchIds)
  const cancelCourtBooking = usePlayerStore((state) => state.cancelCourtBooking)
  const payments = usePaymentStore((state) => state.records)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [tab, setTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING')
  const [cancelCourt, setCancelCourt] = useState<PlayerScheduleItem | null>(null)
  const items = schedule.filter((item) => tab === 'UPCOMING' ? item.status === 'UPCOMING' : item.status !== 'UPCOMING')

  const primaryAction = (item: PlayerScheduleItem) => {
    if (item.kind === 'COURT') return navigate(`/player/court-bookings/${item.id}`)
    if (item.ticketCode && item.matchId) return navigate(`/player/matches/${item.matchId}/ticket`)
    if (item.coachBookingId) return navigate(`/player/coaching?booking=${item.coachBookingId}`)
    if (item.kind === 'COURSE') return showToast('Vé QR buổi học đã được mở trong prototype.', 'info')
    if (item.status === 'COMPLETED' && item.matchId && matches.some((match) => match.id === item.matchId) && !reviewedIds.includes(item.matchId)) return navigate(`/player/matches/${item.matchId}/review`)
    showToast('Chi tiết hoạt động đã được hiển thị đầy đủ trên thẻ.', 'info')
  }

  const confirmCancelCourt = () => {
    if (!cancelCourt) return
    const result = cancelCourtBooking(cancelCourt.id)
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success) setCancelCourt(null)
  }

  const courtCancellation = cancelCourt
    ? courtRefundOutcome(cancelCourt.paidAmount ?? cancelCourt.amount, hoursUntilEvent(cancelCourt.date, cancelCourt.timeRange))
    : undefined

  return (
    <div className="space-y-7 pb-10">
      <PlayerPageHeader
        eyebrow="SCR_USER_03 · My Schedule"
        title="Lịch của tôi"
        description="Quản lý kèo Social, lịch học, đặt sân, số tiền đã trả và chính sách hủy tại một nơi."
        icon={CalendarDays}
        action={<Button onClick={() => navigate('/player/matches')} className="gap-2 rounded-xl"><Sparkles className="h-4 w-4" /> Tìm thêm kèo</Button>}
      />

      <div className="flex rounded-2xl border border-border bg-card p-1.5 sm:w-fit">
        <button type="button" onClick={() => setTab('UPCOMING')} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition', tab === 'UPCOMING' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><Clock3 className="h-4 w-4" />Sắp diễn ra <Badge className={cn('border-0', tab === 'UPCOMING' ? 'bg-white/15 text-white' : '')}>{schedule.filter((item) => item.status === 'UPCOMING').length}</Badge></button>
        <button type="button" onClick={() => setTab('HISTORY')} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition', tab === 'HISTORY' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><History className="h-4 w-4" />Lịch sử <Badge className={cn('border-0', tab === 'HISTORY' ? 'bg-white/15 text-white' : '')}>{schedule.filter((item) => item.status !== 'UPCOMING').length}</Badge></button>
      </div>

      <div className="space-y-4">
        {items.length ? items.map((item) => {
          const meta = kindMeta[item.kind]
          const Icon = meta.icon
          const reviewed = item.matchId ? reviewedIds.includes(item.matchId) : false
          const payment = item.paymentReferenceId ? payments.find((record) => record.referenceId === item.paymentReferenceId) : undefined
          return (
            <article key={item.id} className={cn('overflow-hidden rounded-[1.65rem] border bg-card shadow-sm', item.status === 'CANCELLED' ? 'border-destructive/20 opacity-75' : 'border-border/70')}>
              <div className="grid md:grid-cols-[170px_1fr_auto]">
                <div className={cn('flex flex-row items-center gap-3 p-5 md:flex-col md:items-start md:justify-center md:border-r md:border-border/60', meta.tone)}><Icon className="h-6 w-6" /><div><p className="text-[10px] font-black uppercase tracking-wider">{meta.label}</p><p className="mt-1 text-sm font-black">{item.dateLabel}</p><p className="text-xs font-semibold">{item.timeRange}</p></div></div>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === 'UPCOMING' && <Badge className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">SẮP DIỄN RA</Badge>}
                    {item.status === 'COMPLETED' && <Badge variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />ĐÃ HOÀN TẤT</Badge>}
                    {item.status === 'CANCELLED' && <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />ĐÃ HỦY</Badge>}
                    {item.progress && <Badge variant="outline">{item.progress}</Badge>}
                    {payment && <PaymentStatusBadge status={payment.status} />}
                  </div>
                  <h2 className="mt-3 text-lg font-black">{item.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-primary">{item.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{item.venueName} · {item.courtName}</span>{item.coachName && <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-primary" />{item.coachName}</span>}</div>
                  {item.totalAmount !== undefined && <div className="mt-4 flex flex-wrap gap-3 text-[11px]"><span className="rounded-full bg-muted px-3 py-1.5">Tổng {item.totalAmount.toLocaleString('vi-VN')}đ</span><span className="rounded-full bg-secondary/45 px-3 py-1.5 font-bold text-primary">Đã trả {(item.paidAmount ?? item.amount).toLocaleString('vi-VN')}đ</span>{(item.remainingAmount ?? 0) > 0 && <span className="rounded-full bg-amber-500/10 px-3 py-1.5 font-bold text-amber-700 dark:text-amber-300">Còn {item.remainingAmount?.toLocaleString('vi-VN')}đ</span>}</div>}
                </div>
                <div className="flex flex-col justify-center gap-2 border-t border-border/60 p-4 md:border-l md:border-t-0">
                  <Button onClick={() => primaryAction(item)} variant={item.status === 'UPCOMING' ? 'default' : 'outline'} className="w-full gap-2 whitespace-nowrap rounded-xl">{item.ticketCode || item.kind === 'COURT' ? <QrCode className="h-4 w-4" /> : null}{item.kind === 'COURT' ? 'Xem chi tiết' : item.status === 'UPCOMING' ? item.ticketCode ? 'Mở vé QR' : 'Xem chi tiết' : item.status === 'COMPLETED' && item.matchId && !reviewed ? 'Đánh giá trận' : 'Xem lại'}<ChevronRight className="h-4 w-4" /></Button>
                  {item.kind === 'COURT' && item.status === 'UPCOMING' && <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setCancelCourt(item)}>Hủy sân</Button>}
                </div>
              </div>
            </article>
          )
        }) : <div className="rounded-[2rem] border border-dashed border-primary/25 bg-secondary/15 py-16 text-center"><CalendarDays className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-xl font-black">Chưa có hoạt động</h2><p className="mt-2 text-sm text-muted-foreground">Các lượt đặt sân, kèo và buổi học sẽ xuất hiện tại đây.</p><Button onClick={() => navigate('/player/matches')} className="mt-5">Tìm kèo ngay</Button></div>}
      </div>

      {cancelCourt && courtCancellation && <div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="cancel-court-title" className="w-full max-w-md rounded-[1.8rem] border border-border bg-card p-6 shadow-2xl"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle className="h-5 w-5" /></span><h2 id="cancel-court-title" className="mt-4 text-xl font-black">Xác nhận hủy sân?</h2><div className={cn('mt-4 rounded-2xl border p-4', courtCancellation.refundAmount > 0 ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-destructive/25 bg-destructive/10')}><p className="text-sm font-black">{courtCancellation.label}</p><p className="mt-1 text-xs text-muted-foreground">Số tiền nhận lại: {courtCancellation.refundAmount.toLocaleString('vi-VN')}đ · Không hoàn: {courtCancellation.forfeitedAmount.toLocaleString('vi-VN')}đ</p></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Trước 12 giờ hoàn 100%; từ 6–12 giờ hoàn 50% số tiền đã thanh toán; dưới 6 giờ không hoàn. Khoản hoàn được trả về Ví FITLYO.</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setCancelCourt(null)}>Giữ lịch</Button><Button variant="destructive" onClick={confirmCancelCourt}>Xác nhận hủy</Button></div></section></div>}
    </div>
  )
}
