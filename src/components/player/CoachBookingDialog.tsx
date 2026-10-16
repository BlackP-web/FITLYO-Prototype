import { useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Repeat2,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { COURT_SLOT_TIMES } from '@/lib/courtSchedule'
import { cn } from '@/lib/utils'
import { useCoachBookingStore } from '@/store/useCoachBookingStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { CoachItem } from '@/types/pickleball'
import type { CoachBookingType, CoachPaymentMethod } from '@/types/coachBooking'

interface CoachBookingDialogProps {
  coach: CoachItem
  onClose: () => void
}

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function CoachBookingDialog({ coach, onClose }: CoachBookingDialogProps) {
  const navigate = useNavigate()
  const showToast = useFitlyoStore((state) => state.showToast)
  const walletBalance = usePlayerStore((state) => state.profile.walletBalance)
  usePlayerStore((state) => state.schedule)
  useCoachBookingStore((state) => state.bookings)
  const getCalendar = useCoachBookingStore((state) => state.getCalendar)
  const previewBooking = useCoachBookingStore((state) => state.previewBooking)
  const createInstantBooking = useCoachBookingStore((state) => state.createInstantBooking)
  const createCustomRequest = useCoachBookingStore((state) => state.createCustomRequest)

  const calendar = getCalendar(coach.id, 35)
  const [bookingType, setBookingType] = useState<CoachBookingType>('SINGLE')
  const [selectedDate, setSelectedDate] = useState(() => calendar[0]?.date ?? '')
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<CoachPaymentMethod>('VIETQR')
  const [customMode, setCustomMode] = useState(false)
  const [customDate, setCustomDate] = useState(() => calendar[0]?.date ?? '')
  const [customSlot, setCustomSlot] = useState(4)

  const selectedDay = calendar.find((day) => day.date === selectedDate) ?? calendar[0]
  const totalAmount = bookingType === 'SINGLE' ? coach.ratePerSession : coach.ratePerMonthCourse
  const depositAmount = Math.ceil(totalAmount / 2)
  const preview = selectedDate && selectedSlot
    ? previewBooking(coach.id, selectedDate, selectedSlot, bookingType)
    : null

  const chooseSlot = (slotNumber: number, state: 'AVAILABLE' | 'BOOKED' | 'PLAYER_CONFLICT', reason?: string) => {
    if (state === 'BOOKED') {
      showToast('Khung giờ này đã có học viên khác đặt với Coach. Vui lòng chọn slot khác.', 'error')
      return
    }
    if (state === 'PLAYER_CONFLICT') {
      showToast(`Bạn đã trùng lịch. ${reason ?? 'Vui lòng kiểm tra Lịch của tôi.'}`, 'error')
      return
    }
    setSelectedSlot(slotNumber)
  }

  const completeAndOpenWorkspace = (bookingId: string, message: string) => {
    showToast(message, 'success')
    onClose()
    navigate(`/player/coaching?booking=${bookingId}`)
  }

  const handleInstantBooking = () => {
    if (!selectedDate || !selectedSlot) {
      showToast('Vui lòng chọn ngày và khung giờ còn trống.', 'error')
      return
    }
    const result = createInstantBooking({ coach, type: bookingType, date: selectedDate, slotNumber: selectedSlot, paymentMethod })
    if (!result.success || !result.bookingId) {
      showToast(result.message, 'error')
      return
    }
    completeAndOpenWorkspace(result.bookingId, result.message)
  }

  const handleCustomRequest = () => {
    if (!customDate) {
      showToast('Vui lòng chọn ngày mong muốn.', 'error')
      return
    }
    const result = createCustomRequest({ coach, type: bookingType, date: customDate, slotNumber: customSlot })
    if (!result.success || !result.bookingId) {
      showToast(result.message, 'error')
      return
    }
    completeAndOpenWorkspace(result.bookingId, result.message)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#102E31]/65 p-2 backdrop-blur-md sm:p-4" role="dialog" aria-modal="true" aria-label={`Đặt lịch với ${coach.name}`}>
      <div className="grid max-h-[calc(100vh-1rem)] w-full max-w-[1180px] grid-rows-[auto_1fr] overflow-y-auto rounded-[1.75rem] border border-white/20 bg-card shadow-[0_30px_90px_rgba(10,35,37,0.35)] lg:h-[min(680px,calc(100vh-2rem))] lg:overflow-hidden">
        <header className="flex items-center justify-between gap-4 border-b border-border/70 bg-card px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <img src={coach.avatarUrl} alt={coach.name} className="h-11 w-11 rounded-xl object-cover" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">Đặt lịch Coach</p><Badge variant="success" className="py-0.5 text-[9px]"><CheckCircle2 className="h-3 w-3" /> Xác nhận ngay</Badge></div>
              <h2 className="truncate text-lg font-black sm:text-xl">{coach.name}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-full" aria-label="Đóng"><X /></Button>
        </header>

        <div className="grid min-h-0 lg:grid-cols-[0.92fr_1.08fr_0.78fr]">
          <section className="space-y-4 border-b border-border/70 p-4 lg:border-b-0 lg:border-r">
            <div>
              <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">1 · Hình thức học</p>{bookingType === 'COURSE' && <Badge variant="success" className="py-0.5 text-[9px]"><Repeat2 className="h-3 w-3" /> 2 buổi/tuần</Badge>}</div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {([
                  { value: 'SINGLE' as const, title: 'PT 1-1 · 90 phút', note: 'Một buổi riêng', price: coach.ratePerSession },
                  { value: 'COURSE' as const, title: 'Khóa học · 8 buổi', note: 'Tự xếp 2 buổi/tuần', price: coach.ratePerMonthCourse },
                ]).map((option) => (
                  <button key={option.value} type="button" onClick={() => { setBookingType(option.value); setSelectedSlot(null) }} className={cn('rounded-xl border px-3 py-2.5 text-left transition', bookingType === option.value ? 'border-primary bg-secondary/35 ring-1 ring-primary/15' : 'border-border hover:border-primary/35')}>
                    <div className="flex items-center justify-between gap-2"><p className="text-xs font-black sm:text-sm">{option.title}</p>{bookingType === option.value && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}</div>
                    <div className="mt-1 flex items-center justify-between gap-2"><span className="text-[10px] text-muted-foreground">{option.note}</span><strong className="text-xs text-primary">{formatMoney(option.price)}</strong></div>
                  </button>
                ))}
              </div>
            </div>

            {!customMode ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">2 · Chọn ngày đầu tiên</p>
                <div className="mt-2 grid grid-cols-4 gap-1.5 lg:grid-cols-2">
                  {calendar.slice(0, 8).map((day) => {
                    const availableCount = day.slots.filter((slot) => slot.state === 'AVAILABLE').length
                    return <button key={day.date} type="button" onClick={() => { setSelectedDate(day.date); setSelectedSlot(null) }} className={cn('rounded-xl border px-2 py-2 text-left transition', selectedDay?.date === day.date ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border hover:border-primary/35')}><span className="block truncate text-[9px] font-bold capitalize opacity-70">{day.weekdayLabel}</span><strong className="block text-xs">{day.shortLabel}</strong><span className={cn('text-[9px] font-semibold', selectedDay?.date === day.date ? 'text-white/70' : availableCount ? 'text-emerald-600' : 'text-muted-foreground')}>{availableCount} slot</span></button>
                  })}
                </div>
                <button type="button" onClick={() => setCustomMode(true)} className="mt-3 w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-[11px] font-bold text-primary">Yêu cầu khung giờ khác</button>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/20 bg-secondary/20 p-3">
                <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase text-primary">Giờ đề xuất</p><button type="button" onClick={() => setCustomMode(false)} className="text-[10px] font-bold text-primary underline">Lịch công bố</button></div>
                <label className="mt-3 block text-[10px] font-bold">Ngày<input type="date" value={customDate} min={calendar[0]?.date} onChange={(event) => setCustomDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border bg-background px-2 text-xs" /></label>
                <label className="mt-2 block text-[10px] font-bold">Khung giờ<select value={customSlot} onChange={(event) => setCustomSlot(Number(event.target.value))} className="mt-1 h-9 w-full rounded-lg border bg-background px-2 text-xs">{COURT_SLOT_TIMES.map((slot) => <option key={slot.slotNumber} value={slot.slotNumber}>Slot {slot.slotNumber} · {slot.timeRange}</option>)}</select></label>
                <p className="mt-2 flex gap-1.5 text-[9px] leading-4 text-muted-foreground"><Clock3 className="h-3 w-3 shrink-0" />Chưa thu cọc cho đến khi Coach duyệt.</p>
              </div>
            )}
          </section>

          <section className="space-y-4 border-b border-border/70 p-4 lg:border-b-0 lg:border-r">
            {!customMode ? (
              <>
                <div>
                  <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">3 · Khung giờ ngày {selectedDay?.shortLabel}</p><span className="text-[9px] font-semibold text-emerald-600">● Còn trống</span></div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {selectedDay?.slots.map((slot) => (
                      <button key={slot.slotNumber} type="button" data-testid={`coach-slot-${selectedDay.date}-${slot.slotNumber}`} onClick={() => chooseSlot(slot.slotNumber, slot.state, slot.reason)} className={cn('min-w-0 rounded-xl border p-2.5 text-left transition', selectedSlot === slot.slotNumber && 'border-primary bg-secondary/40 ring-1 ring-primary/15', slot.state === 'AVAILABLE' && selectedSlot !== slot.slotNumber && 'border-border hover:border-primary/40', slot.state === 'BOOKED' && 'border-destructive/20 bg-destructive/5 text-muted-foreground', slot.state === 'PLAYER_CONFLICT' && 'border-amber-400/30 bg-amber-500/10 text-amber-800 dark:text-amber-200')}>
                        <div className="flex items-center justify-between gap-1"><span className="text-[10px] font-black">Slot {slot.slotNumber}</span>{slot.state === 'AVAILABLE' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5" />}</div>
                        <p className="mt-1 truncate text-xs font-bold">{slot.timeRange}</p>
                        <p className="mt-0.5 truncate text-[9px] font-semibold">{slot.state === 'AVAILABLE' ? 'Đặt ngay' : slot.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/15 bg-secondary/15 p-3">
                  <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /><p className="text-xs font-black">{bookingType === 'COURSE' ? 'Lịch 8 buổi dự kiến' : 'Lịch buổi PT'}</p></div>{bookingType === 'COURSE' && <span className="text-[9px] text-muted-foreground">Tối đa 2 buổi/tuần</span>}</div>
                  {bookingType === 'COURSE' && preview?.success ? (
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {preview.sessions.map((session) => <div key={session.id} className="flex items-center gap-2 rounded-lg bg-card px-2 py-1.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-[9px] font-black text-primary-foreground">{session.sequence}</span><span className="truncate text-[10px] font-bold">{session.dateLabel}</span></div>)}
                    </div>
                  ) : selectedSlot && preview?.success ? (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs"><strong>{preview.sessions[0].dateLabel}</strong><span className="text-muted-foreground">{preview.sessions[0].timeRange}</span></div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-dashed border-border bg-card/60 px-3 py-5 text-center text-[10px] text-muted-foreground">Chọn một slot trống để xem lịch xác nhận.</div>
                  )}
                </div>
                {preview && !preview.success && <div className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/10 p-2.5 text-[10px] font-semibold text-destructive"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />{preview.message}</div>}
              </>
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-primary/25 bg-secondary/15 p-6 text-center"><Clock3 className="h-8 w-8 text-primary" /><h3 className="mt-3 font-black">Coach cần xác nhận</h3><p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Yêu cầu ngoài lịch công bố sẽ được gửi vào portal Coach. Bạn có thể theo dõi và chat trong “Huấn luyện của tôi”.</p></div>
            )}
          </section>

          <aside className="bg-muted/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">4 · Xác nhận & đặt cọc</p>
            <div className="mt-2 rounded-xl border border-border bg-card p-3">
              <div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Học phí</span><strong>{formatMoney(totalAmount)}</strong></div>
              <div className="mt-2 flex items-end justify-between gap-3 border-t border-dashed pt-2"><span className="text-xs font-bold">Cọc 50%</span><strong className="text-xl text-primary">{formatMoney(depositAmount)}</strong></div>
              <div className="mt-2 flex gap-1.5 rounded-lg bg-secondary/35 p-2 text-[9px] leading-4 text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />Slot được khóa ngay sau khi cọc.</div>
            </div>

            {!customMode && (
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Phương thức</p>
                <div className="mt-2 space-y-2">
                  <button type="button" onClick={() => setPaymentMethod('VIETQR')} className={cn('flex w-full items-center gap-2 rounded-xl border p-2.5 text-left', paymentMethod === 'VIETQR' ? 'border-primary bg-secondary/30' : 'border-border')}><CreditCard className="h-4 w-4 text-primary" /><div className="min-w-0 flex-1"><p className="text-xs font-black">VietQR mô phỏng</p><p className="truncate text-[9px] text-muted-foreground">Xác nhận tức thì</p></div>{paymentMethod === 'VIETQR' && <CheckCircle2 className="h-4 w-4 text-primary" />}</button>
                  <button type="button" onClick={() => setPaymentMethod('WALLET')} className={cn('flex w-full items-center gap-2 rounded-xl border p-2.5 text-left', paymentMethod === 'WALLET' ? 'border-primary bg-secondary/30' : 'border-border')}><WalletCards className="h-4 w-4 text-primary" /><div className="min-w-0 flex-1"><p className="text-xs font-black">Ví FITLYO</p><p className="truncate text-[9px] text-muted-foreground">{formatMoney(walletBalance)}</p></div>{paymentMethod === 'WALLET' && <CheckCircle2 className="h-4 w-4 text-primary" />}</button>
                </div>
              </div>
            )}

            <Button data-testid="confirm-coach-booking" onClick={customMode ? handleCustomRequest : handleInstantBooking} className="fitlyo-coral-button mt-4 h-11 w-full rounded-xl border-0 text-xs font-black">
              {customMode ? 'Gửi Coach duyệt' : `Đặt cọc ${formatMoney(depositAmount)}`}
            </Button>
            <p className="mt-2 text-center text-[9px] leading-4 text-muted-foreground">Sau khi đặt, chat FITLYO và lịch học mở ngay.</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
