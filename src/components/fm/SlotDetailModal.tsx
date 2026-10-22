import { CalendarDays, CheckCircle2, Copy, MapPin, Phone, ShieldAlert, Sparkles, UserRound, Wrench, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SharedCourtBooking } from '@/store/useCrossRoleStore'
import type { PlayerMatch } from '@/types/player'
import type { CourtSlot } from '@/types/pickleball'

interface SlotDetailModalProps {
  open: boolean
  venueName: string
  venueAddress: string
  dateLabel: string
  courtName: string
  courtType: string
  slot: CourtSlot
  match?: PlayerMatch
  courtBooking?: SharedCourtBooking
  onClose: () => void
  onPublish: () => void
  onWalkIn: () => void
  onMaintenance: () => void
  onRelease: () => void
  onNotify: (message: string) => void
}

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`

const statusLabels: Record<CourtSlot['status'], string> = {
  AVAILABLE: 'Còn trống',
  MATCH_PUBLISHED: 'Kèo Social',
  COACHING: 'Lớp Coach',
  PRIVATE_BOOKED: 'Khách bao sân',
  MAINTENANCE: 'Bảo trì',
}

export function SlotDetailModal({
  open,
  venueName,
  venueAddress,
  dateLabel,
  courtName,
  courtType,
  slot,
  match,
  courtBooking,
  onClose,
  onPublish,
  onWalkIn,
  onMaintenance,
  onRelease,
  onNotify,
}: SlotDetailModalProps) {
  if (!open) return null

  const participants = match?.participants ?? []
  const totalCollected = participants.reduce((total, participant) => total + (participant.paidAmount ?? match?.fee ?? 0), 0)
  const booking = slot.walkInBooking
  const customerName = courtBooking?.playerName ?? booking?.customerName ?? slot.bookedByName
  const customerPhone = courtBooking?.playerPhone ?? booking?.phone ?? slot.bookedPhone
  const bookingCode = courtBooking?.bookingCode ?? slot.bookingId ?? booking?.id
  const bookedAt = courtBooking?.bookedAt ?? slot.bookedAt ?? booking?.createdAt

  const copyPhone = async (phone?: string) => {
    if (!phone) return
    try {
      await navigator.clipboard.writeText(phone)
      onNotify(`Đã sao chép số ${phone}.`)
    } catch {
      onNotify('Không thể sao chép số điện thoại trên trình duyệt này.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="slot-detail-title">
      <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border/80 bg-card shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Chi tiết slot · dữ liệu đồng bộ</p>
            <h2 id="slot-detail-title" className="mt-1 text-xl font-black">{courtName} · Slot {slot.slotNumber}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{venueName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{statusLabels[slot.status]}</Badge>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
          </div>
        </header>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-2xl bg-muted/45 p-4 text-sm">
              <h3 className="flex items-center gap-2 font-black"><CalendarDays className="h-4 w-4 text-primary" />Lịch sân</h3>
              <dl className="mt-3 grid grid-cols-[92px_1fr] gap-2 text-muted-foreground"><dt>Ngày</dt><dd className="font-semibold text-foreground">{dateLabel}</dd><dt>Giờ</dt><dd className="font-semibold text-foreground">{slot.timeRange}</dd><dt>Loại sân</dt><dd className="font-semibold text-foreground">{courtType}</dd></dl>
            </section>
            <section className="rounded-2xl bg-muted/45 p-4 text-sm">
              <h3 className="flex items-center gap-2 font-black"><MapPin className="h-4 w-4 text-primary" />Địa điểm</h3>
              <p className="mt-3 font-semibold">{courtName}</p><p className="mt-1 text-muted-foreground">{venueAddress}</p>
            </section>
          </div>

          {slot.status === 'MATCH_PUBLISHED' && (
            <section className="rounded-2xl border border-blue-500/25 bg-blue-500/5 p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div><p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Danh sách Player tham gia</p><h3 className="mt-1 text-lg font-black">{match?.title ?? slot.matchTitle ?? 'Kèo Social'}</h3><p className="mt-1 text-sm text-muted-foreground">{match ? `DUPR ${match.duprMin.toFixed(1)}–${match.duprMax.toFixed(1)}` : slot.duprRange ?? 'Chưa có dữ liệu DUPR'}</p></div>
                <div className="rounded-xl bg-card px-4 py-3 text-right shadow-sm"><p className="text-xs text-muted-foreground">Tổng đã thu</p><p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{money(totalCollected)}</p><p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Đã thanh toán 100%</p></div>
              </div>
              <div className="mt-4 space-y-2">
                {participants.length === 0 && <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground">Chưa có Player tham gia.</p>}
                {participants.map((participant) => {
                  const paid = participant.paidAmount ?? match?.fee ?? 0
                  return <div key={participant.id} className="grid gap-3 rounded-2xl bg-card p-3 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="flex min-w-0 items-center gap-3"><img src={participant.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" /><div className="min-w-0"><p className="truncate font-black">{participant.name} {participant.isHost && <span className="text-xs text-primary">· Host</span>}</p><p className="mt-0.5 text-sm text-muted-foreground">DUPR {participant.dupr.toFixed(2)} · {participant.phone ?? 'Chưa có dữ liệu SĐT'}</p></div></div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end"><div className="text-right"><p className="font-black">{money(paid)}</p><p className="text-xs font-semibold text-emerald-600">Đã thanh toán 100%</p></div>{participant.phone && <Button variant="outline" size="icon" onClick={() => copyPhone(participant.phone)} aria-label={`Sao chép số của ${participant.name}`}><Copy className="h-4 w-4" /></Button>}</div>
                  </div>
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card/70 p-3 text-sm"><span><strong>{participants.length}/{match?.maxPlayers ?? '?'}</strong> Player · còn <strong>{Math.max(0, (match?.maxPlayers ?? participants.length) - participants.length)}</strong> chỗ</span><span className="font-semibold">Phí/người: {money(match?.fee ?? 0)}</span></div>
            </section>
          )}

          {slot.status === 'PRIVATE_BOOKED' && (
            <section className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-4 sm:p-5">
              <h3 className="flex items-center gap-2 font-black"><UserRound className="h-4 w-4 text-orange-500" />Người đặt sân</h3>
              <dl className="mt-4 grid grid-cols-[120px_1fr] gap-3 text-sm text-muted-foreground"><dt>Họ tên</dt><dd className="font-bold text-foreground">{customerName ?? 'Chưa có dữ liệu'}</dd><dt>Số điện thoại</dt><dd className="flex items-center gap-2 font-bold text-foreground">{customerPhone ?? 'Chưa có dữ liệu'}{customerPhone && <button onClick={() => copyPhone(customerPhone)} className="text-primary" aria-label="Sao chép số điện thoại"><Copy className="h-4 w-4" /></button>}</dd><dt>Mã booking</dt><dd className="font-bold text-foreground">{bookingCode ?? 'Chưa có dữ liệu'}</dd><dt>Thời điểm đặt</dt><dd className="font-bold text-foreground">{bookedAt ? new Date(bookedAt).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</dd><dt>Thanh toán</dt><dd className="font-bold text-emerald-600">Đã thanh toán 100% · {money(courtBooking?.paidAmount ?? booking?.paidAmount ?? slot.price)}</dd></dl>
            </section>
          )}

          {slot.status === 'COACHING' && <section className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-4"><h3 className="font-black">Lớp Coach</h3><p className="mt-2 text-sm text-muted-foreground">{slot.bookedNote ?? 'Thông tin lớp học sẽ được đồng bộ từ lịch Coach.'}</p></section>}
          {slot.status === 'MAINTENANCE' && <section className="rounded-2xl border p-4"><h3 className="flex items-center gap-2 font-black"><Wrench className="h-4 w-4" />Bảo trì</h3><p className="mt-2 text-sm text-muted-foreground">{slot.maintenanceReason ?? slot.bookedNote ?? 'Chưa có dữ liệu'}</p></section>}
          {slot.status === 'AVAILABLE' && <section className="rounded-2xl bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="mr-2 inline h-4 w-4" />Slot đang trống và có thể mở bán hoặc tạo Social Match.</section>}

          {slot.status === 'AVAILABLE' ? <div className="grid gap-2 sm:grid-cols-3"><Button onClick={onPublish} className="gap-2"><Sparkles className="h-4 w-4" />Tạo Social</Button><Button onClick={onWalkIn} variant="outline" className="gap-2"><Phone className="h-4 w-4" />Khách vãng lai</Button><Button onClick={onMaintenance} variant="ghost" className="gap-2"><Wrench className="h-4 w-4" />Bảo trì</Button></div> : slot.status === 'MAINTENANCE' ? <Button variant="outline" onClick={onRelease} className="w-full">Mở lại slot</Button> : <div className="flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Không thể giải phóng trực tiếp.</strong> Slot đã có giao dịch, lớp học hoặc người tham gia; cần dùng đúng luồng hủy và hoàn tiền.</p></div>}
        </div>
      </div>
    </div>
  )
}
