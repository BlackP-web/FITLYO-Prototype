import { useState } from 'react'
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock3, Flame, Lock, MapPin,
  Sparkles, TrendingUp, UserRound, Wrench,
} from 'lucide-react'
import { PublishMatchModal } from '@/components/modals/PublishMatchModal'
import { WalkInBookingModal } from '@/components/modals/WalkInBookingModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { COURT_SLOT_DURATION_MINUTES, COURT_SLOT_TIMES } from '@/lib/courtSchedule'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { CourtSlot } from '@/types/pickleball'

const statusMeta: Record<CourtSlot['status'], { label: string; className: string; dot: string }> = {
  AVAILABLE: { label: 'Còn trống', className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  MATCH_PUBLISHED: { label: 'Kèo Social', className: 'border-blue-500/35 bg-blue-500/10 text-blue-800 dark:text-blue-300', dot: 'bg-blue-500' },
  COACHING: { label: 'Lớp Coach', className: 'border-purple-500/35 bg-purple-500/10 text-purple-800 dark:text-purple-300', dot: 'bg-purple-500' },
  PRIVATE_BOOKED: { label: 'Khách bao sân', className: 'border-orange-500/35 bg-orange-500/10 text-orange-800 dark:text-orange-300', dot: 'bg-orange-500' },
  MAINTENANCE: { label: 'Bảo trì', className: 'border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300', dot: 'bg-slate-500' },
}

const venueName = 'Cụm sân D-Sports Pickleball Thủ Đức'
const venueAddress = '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức'

export const CourtCalendarPage = () => {
  const {
    courtInventory, selectedDate, setSelectedDate, openPublishModal, openWalkInModal,
    setSlotMaintenance, releaseSlot, showToast,
  } = useFitlyoStore()
  const playerMatches = usePlayerStore((state) => state.matches)
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<{ courtId: string; courtName: string; slot: CourtSlot } | null>(null)

  const totalSlots = courtInventory.reduce((total, court) => total + court.slots.length, 0)
  const maintenanceSlots = courtInventory.reduce((total, court) => total + court.slots.filter((slot) => slot.status === 'MAINTENANCE').length, 0)
  const activeSlots = totalSlots - maintenanceSlots
  const bookedSlots = courtInventory.reduce((total, court) => total + court.slots.filter((slot) => !['AVAILABLE', 'MAINTENANCE'].includes(slot.status)).length, 0)
  const occupancyRate = Math.round((bookedSlots / (activeSlots || 1)) * 100)
  const estimatedRevenue = courtInventory.reduce((total, court) => total + court.slots.filter((slot) => !['AVAILABLE', 'MAINTENANCE'].includes(slot.status)).reduce((sum, slot) => sum + slot.price, 0), 0)

  const selectedCourt = selectedSlotDetails ? courtInventory.find((court) => court.id === selectedSlotDetails.courtId) : undefined
  const selectedSlot = selectedSlotDetails?.slot
  const selectedStatus = selectedSlot ? statusMeta[selectedSlot.status] : undefined
  const booking = selectedSlot?.walkInBooking
  const customerName = booking?.customerName ?? selectedSlot?.bookedByName
  const customerPhone = booking?.phone ?? selectedSlot?.bookedPhone
  const playerCountFor = (slot: CourtSlot) => {
    const playerMatch = slot.matchRoomId ? playerMatches.find((match) => match.id === slot.matchRoomId) : undefined
    return playerMatch ? `${playerMatch.participants.length}/${playerMatch.maxPlayers}` : slot.playersCount
  }

  const changeDate = (days: number) => {
    const [day, month, year] = selectedDate.split('/').map(Number)
    const nextDate = new Date(year, month - 1, day)
    nextDate.setDate(nextDate.getDate() + days)
    const formattedDate = nextDate.toLocaleDateString('vi-VN')
    setSelectedDate(formattedDate)
    showToast(`Đang hiển thị lịch ngày ${formattedDate} (dữ liệu demo).`, 'info')
  }

  const handleOpenPublish = () => {
    if (!selectedSlotDetails) return
    openPublishModal({
      courtId: selectedSlotDetails.courtId,
      courtName: selectedSlotDetails.courtName,
      slotNumber: selectedSlotDetails.slot.slotNumber,
      timeRange: selectedSlotDetails.slot.timeRange,
    })
    setSelectedSlotDetails(null)
  }

  const handleLockPrivate = () => {
    if (!selectedSlotDetails) return
    openWalkInModal({
      courtId: selectedSlotDetails.courtId,
      courtName: selectedSlotDetails.courtName,
      slotNumber: selectedSlotDetails.slot.slotNumber,
      timeRange: selectedSlotDetails.slot.timeRange,
    })
    setSelectedSlotDetails(null)
  }

  const handleMaintenance = () => {
    if (!selectedSlotDetails) return
    setSlotMaintenance(selectedSlotDetails.courtId, selectedSlotDetails.slot.slotNumber)
    setSelectedSlotDetails(null)
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2"><Badge variant="default" className="text-xs" withDot pulseDot>SCR_FM_01</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · 10 slot liên tục</span></div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ma trận lịch sân 06:00–21:00</h1>
          <p className="mt-1 text-sm text-muted-foreground">{venueName} · {COURT_SLOT_DURATION_MINUTES} phút/slot · Không nghỉ giữa ca.</p>
        </div>
        <div className="flex items-center rounded-xl border bg-card p-1 shadow-xs">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex items-center gap-1.5 px-3 text-xs font-bold sm:text-sm"><CalendarDays className="h-4 w-4 text-primary" />Ngày: {selectedDate}</div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDate(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </header>

      <div className="flex items-center gap-4 overflow-x-auto rounded-2xl border border-border/60 bg-muted/40 p-3 text-xs">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider">Chú giải:</span>
        {Object.values(statusMeta).map((status) => <span key={status.label} className="flex shrink-0 items-center gap-1.5 font-medium"><i className={`h-3 w-3 rounded-md ${status.dot}`} />{status.label}</span>)}
      </div>

      <section className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="min-w-[1320px]">
          <div className="grid border-b bg-muted/60" style={{ gridTemplateColumns: '150px repeat(10, minmax(112px, 1fr))' }}>
            <div className="flex items-center border-r px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sân đấu</div>
            {COURT_SLOT_TIMES.map((slot) => <div key={slot.slotNumber} className="border-r px-2 py-3 text-center last:border-r-0"><p className="text-[10px] font-black text-primary">SLOT {slot.slotNumber}</p><p className="mt-1 text-[10px] font-semibold text-muted-foreground">{slot.timeRange}</p></div>)}
          </div>
          {courtInventory.map((court) => <div key={court.id} className="grid min-h-28 border-b last:border-b-0" style={{ gridTemplateColumns: '150px repeat(10, minmax(112px, 1fr))' }}>
            <div className="border-r bg-muted/20 p-4"><p className="text-xs font-black">{court.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{court.courtType === 'indoor' ? 'Trong nhà' : court.courtType === 'outdoor' ? 'Ngoài trời' : 'Có mái che'}</p></div>
            {COURT_SLOT_TIMES.map((standardSlot) => {
              const slot = court.slots.find((item) => item.slotNumber === standardSlot.slotNumber) ?? { slotNumber: standardSlot.slotNumber, timeRange: standardSlot.timeRange, status: 'AVAILABLE' as const, price: 0 }
              const meta = statusMeta[slot.status]
              return <button key={slot.slotNumber} type="button" onClick={() => setSelectedSlotDetails({ courtId: court.id, courtName: court.name, slot })} className={`group m-1.5 flex min-w-0 flex-col justify-between rounded-xl border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/60 ${meta.className}`}>
                <span className="flex items-center gap-1.5 text-[10px] font-bold"><i className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} /><span className="truncate">{meta.label}</span>{slot.isPeak && <Flame className="ml-auto h-3.5 w-3.5 text-orange-500" />}</span>
                <span className="mt-2 line-clamp-2 text-[9px] opacity-85">{slot.status === 'AVAILABLE' ? `${slot.price.toLocaleString('vi-VN')}đ` : slot.status === 'MATCH_PUBLISHED' ? `${slot.duprRange ?? 'DUPR'} · ${playerCountFor(slot) ?? '0/4'}` : slot.bookedNote ?? slot.maintenanceReason ?? 'Xem chi tiết'}</span>
              </button>
            })}
          </div>)}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="flex items-center gap-2 font-bold"><TrendingUp className="h-4 w-4 text-primary" />Tổng kết hiệu suất hôm nay</h2><p className="mt-1 text-xs text-muted-foreground">Đã lấp đầy {bookedSlots}/{activeSlots} slot đang hoạt động</p></div><div className="flex gap-6 text-sm"><div><span className="text-xs text-muted-foreground">Công suất</span><p className="text-lg font-extrabold">{occupancyRate}%</p></div><div><span className="text-xs text-muted-foreground">Doanh thu ước tính</span><p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{estimatedRevenue.toLocaleString('vi-VN')}đ</p></div></div></div>
        <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${occupancyRate}%` }} /></div>
      </section>

      {selectedSlotDetails && selectedSlot && selectedStatus && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b pb-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Chi tiết slot thuộc cụm sân của bạn</p><h2 className="mt-1 text-xl font-black">{selectedSlotDetails.courtName} · Slot {selectedSlot.slotNumber}</h2><p className="mt-1 text-xs text-muted-foreground">{venueName}</p></div><Badge className={selectedStatus.className}>{selectedStatus.label}</Badge></div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/45 p-4 text-xs"><p className="flex items-center gap-2 font-bold"><CalendarDays className="h-4 w-4 text-primary" />Ngày và thời gian</p><dl className="mt-3 grid grid-cols-[100px_1fr] gap-2 text-muted-foreground"><dt>Ngày</dt><dd className="font-semibold text-foreground">{selectedDate}</dd><dt>Khung giờ</dt><dd className="font-semibold text-foreground">{selectedSlot.timeRange}</dd><dt>Thời lượng</dt><dd className="font-semibold text-foreground">{COURT_SLOT_DURATION_MINUTES} phút</dd></dl></div>
            <div className="rounded-2xl bg-muted/45 p-4 text-xs"><p className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-primary" />Sân và vị trí</p><dl className="mt-3 grid grid-cols-[100px_1fr] gap-2 text-muted-foreground"><dt>Sân</dt><dd className="font-semibold text-foreground">{selectedSlotDetails.courtName}</dd><dt>Loại sân</dt><dd className="font-semibold text-foreground">{selectedCourt?.courtType === 'indoor' ? 'Trong nhà' : selectedCourt?.courtType === 'outdoor' ? 'Ngoài trời' : 'Có mái che'}</dd><dt>Địa chỉ</dt><dd className="font-semibold text-foreground">{venueAddress}</dd></dl></div>
          </div>

          <section className="mt-3 rounded-2xl border p-4 text-xs">
            <h3 className="font-black">Thông tin đặt sân</h3>
            {selectedSlot.status === 'AVAILABLE' ? <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 font-semibold text-emerald-700 dark:text-emerald-300">Chưa có người đặt.</p> : selectedSlot.status === 'MAINTENANCE' ? <div className="mt-3 rounded-xl bg-slate-500/10 p-3"><p className="font-semibold">Không có người đặt.</p><p className="mt-1 text-muted-foreground">Lý do bảo trì: {selectedSlot.maintenanceReason ?? selectedSlot.bookedNote ?? 'Chưa có dữ liệu'}</p></div> : <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/45 p-3"><p className="flex items-center gap-2 font-bold"><Clock3 className="h-4 w-4 text-primary" />Giao dịch</p><dl className="mt-3 grid grid-cols-[92px_1fr] gap-2 text-muted-foreground"><dt>Mã booking</dt><dd className="font-semibold text-foreground">{selectedSlot.bookingId ?? booking?.id ?? 'Chưa có dữ liệu'}</dd><dt>Trạng thái</dt><dd className="font-semibold text-foreground">{selectedSlot.bookingStatus ?? selectedStatus.label}</dd><dt>Thời điểm đặt</dt><dd className="font-semibold text-foreground">{selectedSlot.bookedAt ?? booking?.createdAt ?? 'Chưa có dữ liệu'}</dd></dl></div>
              <div className="rounded-xl bg-muted/45 p-3"><p className="flex items-center gap-2 font-bold"><UserRound className="h-4 w-4 text-primary" />Người đặt</p>{selectedSlot.status === 'MATCH_PUBLISHED' ? <p className="mt-3 text-muted-foreground">Kèo Social không gắn một khách đặt sân riêng. Hiện có <strong className="text-foreground">{playerCountFor(selectedSlot) ?? '0/4'} Player</strong>.</p> : <dl className="mt-3 grid grid-cols-[92px_1fr] gap-2 text-muted-foreground"><dt>Họ tên</dt><dd className="font-semibold text-foreground">{customerName ?? 'Chưa có dữ liệu'}</dd><dt>Số điện thoại</dt><dd className="font-semibold text-foreground">{customerPhone ?? 'Chưa có dữ liệu'}</dd></dl>}</div>
            </div>}
            {selectedSlot.matchTitle && <p className="mt-3"><b>Kèo:</b> {selectedSlot.matchTitle} · {selectedSlot.duprRange} · {playerCountFor(selectedSlot)}</p>}
            {selectedSlot.bookedNote && selectedSlot.status !== 'MAINTENANCE' && <p className="mt-2"><b>Ghi chú:</b> {selectedSlot.bookedNote}</p>}
          </section>

          {selectedSlot.status === 'AVAILABLE' ? <div className="mt-4 space-y-2"><Button onClick={handleOpenPublish} className="h-11 w-full justify-start gap-2.5"><Sparkles className="h-4 w-4" />Mở kèo Social DUPR</Button><button type="button" onClick={handleLockPrivate} className="w-full rounded-xl border border-orange-500/25 bg-orange-500/5 p-3 text-left text-xs font-semibold transition hover:bg-orange-500/10"><Lock className="mr-2 inline h-3.5 w-3.5 text-orange-500" />Khóa cho khách vãng lai</button><Button variant="ghost" onClick={handleMaintenance} className="w-full justify-start gap-2 text-xs text-muted-foreground"><Wrench className="h-3.5 w-3.5" />Tạm dừng để bảo trì</Button></div> : <Button variant="outline" onClick={() => { releaseSlot(selectedSlotDetails.courtId, selectedSlot.slotNumber); setSelectedSlotDetails(null) }} className="mt-4 w-full">Giải phóng slot về trạng thái trống</Button>}
          <div className="mt-4 flex justify-end border-t pt-4"><Button variant="outline" onClick={() => setSelectedSlotDetails(null)}>Đóng</Button></div>
        </div>
      </div>}

      <PublishMatchModal />
      <WalkInBookingModal />
    </div>
  )
}

export default CourtCalendarPage
