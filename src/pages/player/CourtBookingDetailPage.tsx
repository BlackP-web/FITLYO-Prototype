import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  MapPin,
  MessageCircleMore,
  Phone,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QrTicket } from '@/components/ui/qr-ticket'
import { courtRefundOutcome, hoursUntilEvent } from '@/lib/paymentPolicies'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePaymentStore } from '@/store/usePaymentStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`

const formatDateLabel = (date: string) => {
  const value = new Date(`${date}T12:00:00`)
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(value)
}

const formatBookedAt = (value?: string) => {
  if (!value) return 'Chưa có dữ liệu'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Chưa có dữ liệu'
    : new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
}

const todayInputValue = () => {
  const value = new Date()
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function CourtBookingDetailPage() {
  const navigate = useNavigate()
  const { bookingId } = useParams()
  const schedule = usePlayerStore((state) => state.schedule)
  const venues = usePlayerStore((state) => state.venues)
  const profile = usePlayerStore((state) => state.profile)
  const bookedSlotKeys = usePlayerStore((state) => state.bookedSlotKeys)
  const cancelCourtBooking = usePlayerStore((state) => state.cancelCourtBooking)
  const rescheduleCourtBooking = usePlayerStore((state) => state.rescheduleCourtBooking)
  const payments = usePaymentStore((state) => state.records)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [showQr, setShowQr] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)

  const booking = schedule.find((item) => item.id === bookingId && item.kind === 'COURT')
  const storedVenueId = booking?.slotKey?.split(':')[1]
  const storedCourtId = booking?.slotKey?.split(':')[2]
  const venue = venues.find((item) => item.id === (booking?.venueId ?? storedVenueId))
    ?? venues.find((item) => item.name === booking?.venueName)
  const court = venue?.courts.find((item) => item.id === (booking?.courtId ?? storedCourtId))
    ?? venue?.courts.find((item) => booking?.courtName.startsWith(item.name))
  const payment = booking?.paymentReferenceId
    ? payments.find((item) => item.referenceId === booking.paymentReferenceId)
    : undefined

  const paidAmount = booking?.paidAmount ?? booking?.amount ?? 0
  const hoursBefore = booking ? hoursUntilEvent(booking.date, booking.timeRange) : 0
  const refund = courtRefundOutcome(paidAmount, hoursBefore)
  const canReschedule = !!booking
    && booking.status === 'UPCOMING'
    && hoursBefore >= 12
    && (booking.rescheduleCount ?? 0) < 1
  const mapsUrl = venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
    : undefined

  const shareBooking = async () => {
    if (!booking) return
    const message = `${booking.title} tại ${booking.venueName} · ${booking.dateLabel}, ${booking.timeRange}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Lịch đặt sân FITLYO', text: message, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(`${message}\n${window.location.href}`)
        showToast('Đã sao chép thông tin booking để chia sẻ.', 'success')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      showToast('Chưa thể chia sẻ booking. Vui lòng thử lại.', 'error')
    }
  }

  const downloadQr = () => {
    if (!booking?.bookingCode) return showToast('Booking chưa có mã QR để tải.', 'error')
    const safeCode = booking.bookingCode.replace(/[^a-zA-Z0-9-]/g, '-')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900"><rect width="720" height="900" rx="48" fill="#F8F6F0"/><rect x="0" y="0" width="720" height="170" rx="48" fill="#143F42"/><text x="52" y="82" fill="white" font-family="Arial" font-size="52" font-weight="700">FITLYO</text><text x="52" y="128" fill="#AFE0D3" font-family="Arial" font-size="24">VÉ QR CHECK-IN SÂN</text><rect x="130" y="230" width="460" height="460" rx="32" fill="white" stroke="#143F42" stroke-width="8"/><g fill="#143F42"><rect x="170" y="270" width="110" height="110"/><rect x="440" y="270" width="110" height="110"/><rect x="170" y="540" width="110" height="110"/><rect x="330" y="290" width="45" height="80"/><rect x="305" y="420" width="110" height="110"/><rect x="455" y="430" width="70" height="45"/><rect x="325" y="565" width="60" height="60"/><rect x="430" y="535" width="120" height="95"/></g><circle cx="360" cy="475" r="34" fill="#F4A817"/><text x="360" y="752" text-anchor="middle" fill="#143F42" font-family="Arial" font-size="28" font-weight="700">${safeCode}</text><text x="360" y="804" text-anchor="middle" fill="#496769" font-family="Arial" font-size="22">${booking.date} · ${booking.timeRange}</text><text x="360" y="850" text-anchor="middle" fill="#496769" font-family="Arial" font-size="20">QR mô phỏng dùng cho prototype</text></svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `FITLYO-${safeCode}.svg`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Đã tải vé QR về thiết bị.', 'success')
  }

  const confirmCancellation = () => {
    if (!booking) return
    const result = cancelCourtBooking(booking.id)
    showToast(result.message, result.success ? 'success' : 'error')
    if (result.success) setShowCancel(false)
  }

  if (!booking) {
    return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-md rounded-[2rem] border border-dashed bg-card p-8 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-4 text-2xl font-black">Không tìm thấy booking</h1><p className="mt-2 text-sm text-muted-foreground">Booking có thể đã bị xóa hoặc đường dẫn không còn hợp lệ.</p><Button className="mt-6 min-h-12" onClick={() => navigate('/player/schedule')}><ArrowLeft />Về Lịch của tôi</Button></div></div>
  }

  return (
    <div className="space-y-6 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm">
        <div className="relative overflow-hidden bg-primary px-5 py-7 text-primary-foreground sm:px-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-secondary/15 blur-2xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Button variant="ghost" className="-ml-3 mb-3 min-h-11 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" onClick={() => navigate('/player/schedule')}><ArrowLeft />Lịch của tôi</Button>
              <div className="flex flex-wrap items-center gap-2"><Badge className="border-white/20 bg-white/10 text-white">CHI TIẾT ĐẶT SÂN</Badge><Badge className={booking.status === 'UPCOMING' ? 'border-secondary/30 bg-secondary/15 text-secondary' : 'border-white/20 bg-white/10 text-white'}>{booking.status === 'UPCOMING' ? 'SẮP DIỄN RA' : booking.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'ĐÃ HOÀN TẤT'}</Badge>{payment && <PaymentStatusBadge status={payment.status} />}</div>
              <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl">{booking.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/75"><MapPin className="h-4 w-4" />{booking.venueName} · {booking.courtName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button variant="secondary" className="min-h-12" onClick={() => setShowQr(true)} disabled={!booking.bookingCode}><QrCode />Xem QR</Button>
              <Button className="min-h-12 border border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={shareBooking}><Share2 />Chia sẻ</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-px bg-border/60 sm:grid-cols-3">
          <div className="bg-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ngày chơi</p><p className="mt-2 font-black">{booking.dateLabel}</p></div>
          <div className="bg-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Khung giờ</p><p className="mt-2 font-black">Slot {booking.slotNumber ?? '—'} · {booking.timeRange}</p></div>
          <div className="bg-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Đã thanh toán</p><p className="mt-2 font-black text-emerald-600 dark:text-emerald-400">100% · {formatMoney(paidAmount)}</p></div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><CalendarClock className="h-5 w-5" /></span><div><h2 className="text-lg font-black">Thông tin booking</h2><p className="text-sm text-muted-foreground">Thông tin dùng để check-in và nhận hỗ trợ.</p></div></div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[['Cụm sân', booking.venueName], ['Sân con / loại sân', booking.courtName], ['Ngày và giờ', `${booking.dateLabel} · ${booking.timeRange}`], ['Slot đã đặt', booking.slotNumber ? `Slot ${booking.slotNumber}` : 'Chưa có dữ liệu'], ['Mã booking', booking.bookingCode ?? 'Chưa có dữ liệu'], ['Thời điểm đặt', formatBookedAt(booking.bookedAt)]].map(([label, value]) => <div key={label} className="rounded-2xl border border-border/60 bg-muted/20 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1.5 text-sm font-black">{value}</dd></div>)}
            </dl>
          </section>

          <section className="rounded-[1.75rem] border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/55 text-primary"><Sparkles className="h-5 w-5" /></span><div><h2 className="text-lg font-black">Tiện ích tại sân</h2><p className="text-sm text-muted-foreground">Các tiện ích đã được cụm sân công bố.</p></div></div>
            <div className="mt-5 flex flex-wrap gap-2">{venue?.amenities.length ? venue.amenities.map((amenity) => <Badge key={amenity} variant="outline" className="min-h-9 px-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{amenity}</Badge>) : <p className="text-sm text-muted-foreground">Chưa có dữ liệu tiện ích.</p>}</div>
            <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4"><p className="flex items-center gap-2 text-sm font-black"><MapPin className="h-4 w-4 text-primary" />Địa chỉ</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{venue?.address ?? 'Chưa có dữ liệu'}</p>{mapsUrl && <Button asChild variant="outline" className="mt-4 min-h-12"><a href={mapsUrl} target="_blank" rel="noreferrer"><ExternalLink />Chỉ đường Google Maps</a></Button>}</div>
          </section>

          <section className="rounded-[1.75rem] border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/10 text-blue-600"><Phone className="h-5 w-5" /></span><div><h2 className="text-lg font-black">Liên hệ Field Manager</h2><p className="text-sm text-muted-foreground">Chỉ hiển thị thông tin cần thiết để hỗ trợ booking.</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-muted/25 p-4"><p className="text-xs font-bold text-muted-foreground">Người phụ trách</p><p className="mt-1 font-black">Chưa có dữ liệu</p></div><div className="rounded-2xl bg-muted/25 p-4"><p className="text-xs font-bold text-muted-foreground">Số điện thoại cụm sân</p><p className="mt-1 font-black">{venue?.hotline ?? 'Chưa có dữ liệu'}</p></div></div>
            <Button variant="secondary" className="mt-4 min-h-12 w-full" onClick={() => window.dispatchEvent(new Event('fitlyo:open-chat'))}><MessageCircleMore />Mở chatbot hỗ trợ</Button>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vé check-in</p><h2 className="mt-1 text-lg font-black">QR booking</h2></div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><QrCode className="h-6 w-6" /></span></div>
            <div className="mt-5 grid place-items-center rounded-3xl border border-dashed border-primary/25 bg-primary/5 px-4 py-8 text-center"><QrCode className="h-24 w-24 text-primary" /><p className="mt-3 font-mono text-sm font-black tracking-wider">{booking.bookingCode ?? 'Chưa có dữ liệu'}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Xuất trình QR tại quầy hoặc kiosk để check-in.</p></div>
            <div className="mt-4 grid grid-cols-2 gap-2"><Button className="min-h-12" onClick={() => setShowQr(true)} disabled={!booking.bookingCode}><QrCode />Toàn màn hình</Button><Button variant="outline" className="min-h-12" onClick={downloadQr} disabled={!booking.bookingCode}><Download />Tải QR</Button></div>
          </section>

          <section className="rounded-[1.75rem] border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><WalletCards className="h-5 w-5 text-primary" /><h2 className="text-lg font-black">Thanh toán & hoàn tiền</h2></div>
            <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Đã thanh toán 100%</p><p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{formatMoney(paidAmount)}</p></div>
            <div className={cn('mt-3 rounded-2xl border p-4', refund.refundAmount > 0 ? 'border-primary/20 bg-primary/5' : 'border-destructive/20 bg-destructive/5')}><p className="text-sm font-black">Nếu hủy lúc này</p><p className="mt-1 text-sm text-muted-foreground">{refund.label}</p><p className="mt-2 font-black">Dự kiến hoàn: {formatMoney(refund.refundAmount)}</p></div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Trước 12 giờ hoàn 100%; từ 6–12 giờ hoàn 50%; dưới 6 giờ không hoàn. Tiền hoàn về Ví FITLYO.</p>
          </section>

          <section className="rounded-[1.75rem] border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-black">Quản lý booking</h2>
            <div className="mt-4 space-y-2">
              <Button className="min-h-12 w-full" onClick={() => setShowReschedule(true)} disabled={!canReschedule}><RefreshCw />Đổi lịch</Button>
              <p className="text-center text-xs leading-5 text-muted-foreground">{booking.status !== 'UPCOMING' ? 'Booking không còn hiệu lực.' : (booking.rescheduleCount ?? 0) >= 1 ? 'Booking đã đổi lịch một lần.' : hoursBefore < 12 ? 'Chỉ đổi lịch trước giờ chơi tối thiểu 12 giờ.' : 'Được đổi tối đa một lần; chênh lệch xử lý qua Ví FITLYO.'}</p>
              <Button variant="outline" className="min-h-12 w-full" onClick={shareBooking}><Share2 />Chia sẻ booking</Button>
              {mapsUrl && <Button asChild variant="outline" className="min-h-12 w-full"><a href={mapsUrl} target="_blank" rel="noreferrer"><MapPin />Chỉ đường</a></Button>}
              <Button variant="destructive" className="min-h-12 w-full" onClick={() => setShowCancel(true)} disabled={booking.status !== 'UPCOMING'}>Hủy sân</Button>
            </div>
          </section>
        </aside>
      </div>

      {showQr && booking.bookingCode && <div className="fixed inset-0 z-[100] overflow-y-auto bg-foreground/70 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-xl items-center py-6"><div className="w-full"><div className="mb-3 flex justify-end"><Button variant="secondary" size="icon" className="h-12 w-12 rounded-full" onClick={() => setShowQr(false)} aria-label="Đóng vé QR"><X /></Button></div><QrTicket ticketCode={booking.bookingCode} venueName={booking.venueName} courtName={court?.name ?? booking.courtName} slotNumber={booking.slotNumber ?? 0} timeRange={booking.timeRange} dateStr={booking.dateLabel} duprRange="Không áp dụng" format="Bao sân 90 phút" playerName={profile.name} paidAmount={paidAmount} onShare={shareBooking} /></div></div></div>}

      {showCancel && <div className="fixed inset-0 z-[100] grid place-items-center bg-foreground/60 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-[1.8rem] border bg-card p-6 shadow-2xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive"><AlertTriangle /></span><h2 className="mt-4 text-xl font-black">Xác nhận hủy sân?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{refund.label}. Số tiền dự kiến nhận lại là <strong className="text-foreground">{formatMoney(refund.refundAmount)}</strong>.</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" className="min-h-12" onClick={() => setShowCancel(false)}>Giữ lịch</Button><Button variant="destructive" className="min-h-12" onClick={confirmCancellation}>Xác nhận hủy</Button></div></section></div>}

      {showReschedule && venue && <RescheduleDialog bookingId={booking.id} venue={venue} currentSlotKey={booking.slotKey} currentAmount={paidAmount} walletBalance={profile.walletBalance} bookedSlotKeys={bookedSlotKeys} onClose={() => setShowReschedule(false)} onConfirm={(input) => { const result = rescheduleCourtBooking(booking.id, input); showToast(result.message, result.success ? 'success' : 'error'); if (result.success) setShowReschedule(false) }} />}
    </div>
  )
}

function RescheduleDialog({ bookingId, venue, currentSlotKey, currentAmount, walletBalance, bookedSlotKeys, onClose, onConfirm }: {
  bookingId: string
  venue: ReturnType<typeof usePlayerStore.getState>['venues'][number]
  currentSlotKey?: string
  currentAmount: number
  walletBalance: number
  bookedSlotKeys: string[]
  onClose: () => void
  onConfirm: (input: { date: string; dateLabel: string; courtId: string; slotNumber: number }) => void
}) {
  const [date, setDate] = useState(todayInputValue())
  const [courtId, setCourtId] = useState(venue.courts[0]?.id ?? '')
  const [slotNumber, setSlotNumber] = useState<number | null>(null)
  const court = venue.courts.find((item) => item.id === courtId)
  const slots = useMemo(() => court?.slots.filter((slot) => {
    const key = `${date}:${venue.id}:${court.id}:${slot.slotNumber}`
    return slot.status === 'AVAILABLE'
      && key !== currentSlotKey
      && !bookedSlotKeys.includes(key)
      && hoursUntilEvent(date, slot.timeRange) > 0
  }) ?? [], [bookedSlotKeys, court, currentSlotKey, date, venue.id])
  const selectedSlot = slots.find((slot) => slot.slotNumber === slotNumber)
  const difference = (selectedSlot?.price ?? currentAmount) - currentAmount

  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-foreground/60 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-3xl items-center py-6"><section role="dialog" aria-modal="true" aria-labelledby={`${bookingId}-reschedule-title`} className="w-full rounded-[2rem] border bg-card p-5 shadow-2xl sm:p-7">
    <div className="flex items-start justify-between gap-4"><div><Badge variant="outline" className="text-primary"><RefreshCw />ĐỔI LỊCH MỘT LẦN</Badge><h2 id={`${bookingId}-reschedule-title`} className="mt-3 text-2xl font-black">Chọn lịch sân mới</h2><p className="mt-1 text-sm text-muted-foreground">Giá cao hơn sẽ trừ thêm, giá thấp hơn sẽ hoàn chênh lệch về Ví FITLYO.</p></div><Button variant="ghost" size="icon" className="h-12 w-12" onClick={onClose} aria-label="Đóng"><X /></Button></div>
    <div className="mt-6 grid gap-5 md:grid-cols-[220px_1fr]">
      <div className="space-y-4"><label className="block text-sm font-black">Ngày mới<Input type="date" min={todayInputValue()} value={date} onChange={(event) => { setDate(event.target.value); setSlotNumber(null) }} className="mt-2 h-12" /></label><div><p className="text-sm font-black">Chọn sân</p><div className="mt-2 space-y-2">{venue.courts.map((item) => <button type="button" key={item.id} onClick={() => { setCourtId(item.id); setSlotNumber(null) }} className={cn('min-h-12 w-full rounded-xl border px-3 text-left text-sm font-bold transition', courtId === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted')}><span className="block">{item.name}</span><span className="text-xs font-normal text-muted-foreground">{item.type}</span></button>)}</div></div></div>
      <div><p className="text-sm font-black">Slot còn trống · {formatDateLabel(date)}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{slots.map((slot) => <button type="button" key={slot.slotNumber} onClick={() => setSlotNumber(slot.slotNumber)} className={cn('rounded-2xl border p-4 text-left transition', slotNumber === slot.slotNumber ? 'border-primary bg-primary/10 ring-2 ring-primary/15' : 'border-border hover:border-primary/40')}><span className="flex items-center gap-2 text-sm font-black"><Clock3 className="h-4 w-4 text-primary" />{slot.timeRange}</span><span className="mt-2 block text-xs text-muted-foreground">Slot {slot.slotNumber}</span><span className="mt-1 block font-black text-primary">{formatMoney(slot.price)}</span></button>)}</div>{!slots.length && <div className="mt-3 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Ngày và sân này chưa có slot phù hợp.</div>}</div>
    </div>
    <div className="mt-6 grid gap-3 rounded-2xl border bg-muted/20 p-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Giá booking hiện tại</p><p className="mt-1 font-black">{formatMoney(currentAmount)}</p></div><div><p className="text-xs text-muted-foreground">Chênh lệch</p><p className={cn('mt-1 font-black', difference > 0 ? 'text-amber-600' : difference < 0 ? 'text-emerald-600' : '')}>{selectedSlot ? difference > 0 ? `Thu thêm ${formatMoney(difference)}` : difference < 0 ? `Hoàn ${formatMoney(Math.abs(difference))}` : 'Không chênh lệch' : 'Chọn một slot'}</p></div><div><p className="text-xs text-muted-foreground">Số dư Ví FITLYO</p><p className="mt-1 font-black">{formatMoney(walletBalance)}</p></div></div>
    {difference > walletBalance && <p className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive"><AlertTriangle className="h-4 w-4" />Số dư Ví FITLYO không đủ để trả phần chênh lệch.</p>}
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" className="min-h-12" onClick={onClose}>Để sau</Button><Button className="min-h-12" disabled={!selectedSlot || difference > walletBalance} onClick={() => selectedSlot && onConfirm({ date, dateLabel: formatDateLabel(date), courtId, slotNumber: selectedSlot.slotNumber })}><ShieldCheck />Xác nhận đổi lịch</Button></div>
  </section></div></div>
}
