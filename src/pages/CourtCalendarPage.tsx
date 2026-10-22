import { useEffect, useMemo, useState } from 'react'
import {
  Banknote, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Flame, MapPin, PencilLine, RotateCcw, ShieldAlert, TrendingUp,
  UsersRound, Wrench, X,
} from 'lucide-react'
import { PublishMatchModal } from '@/components/modals/PublishMatchModal'
import { WalkInBookingModal } from '@/components/modals/WalkInBookingModal'
import { SlotDetailModal } from '@/components/fm/SlotDetailModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COURT_SLOT_DURATION_MINUTES, COURT_SLOT_TIMES } from '@/lib/courtSchedule'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'
import type {
  CourtInventory,
  CourtSlot,
  QuickSlotTargetStatus,
  WalkInPaymentMethod,
} from '@/types/pickleball'

const statusMeta: Record<CourtSlot['status'], { label: string; className: string; dot: string }> = {
  AVAILABLE: { label: 'Còn trống', className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  MATCH_PUBLISHED: { label: 'Kèo Social', className: 'border-blue-500/35 bg-blue-500/10 text-blue-800 dark:text-blue-300', dot: 'bg-blue-500' },
  COACHING: { label: 'Lớp Coach', className: 'border-purple-500/35 bg-purple-500/10 text-purple-800 dark:text-purple-300', dot: 'bg-purple-500' },
  PRIVATE_BOOKED: { label: 'Khách bao sân', className: 'border-orange-500/35 bg-orange-500/10 text-orange-800 dark:text-orange-300', dot: 'bg-orange-500' },
  MAINTENANCE: { label: 'Bảo trì', className: 'border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300', dot: 'bg-slate-500' },
}

const legacyVenue = {
  id: 'venue-dsports-thu-duc',
  name: 'Cụm sân D-Sports Pickleball Thủ Đức',
  address: '123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức',
}
const editableStatuses: CourtSlot['status'][] = ['AVAILABLE', 'MAINTENANCE']

const quickStatusOptions: Array<{
  value: QuickSlotTargetStatus
  label: string
  description: string
  icon: typeof CheckCircle2
  className: string
}> = [
  {
    value: 'AVAILABLE',
    label: 'Còn trống',
    description: 'Mở slot để Player có thể đặt',
    icon: CheckCircle2,
    className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  },
  {
    value: 'MAINTENANCE',
    label: 'Bảo trì',
    description: 'Tạm khóa và ghi rõ lý do',
    icon: Wrench,
    className: 'border-slate-400/50 bg-slate-500/10 text-slate-700 dark:text-slate-200',
  },
  {
    value: 'PRIVATE_BOOKED',
    label: 'Khách vãng lai',
    description: 'Giữ nhiều slot cho cùng một khách',
    icon: UsersRound,
    className: 'border-orange-500/35 bg-orange-500/10 text-orange-800 dark:text-orange-300',
  },
]

export const CourtCalendarPage = () => {
  const {
    courtInventory: legacyCourtInventory, selectedDate, setSelectedDate, openPublishModal, openWalkInModal,
    setSlotMaintenance, releaseSlot, batchUpdateSlots, restoreCourtInventory, showToast,
  } = useFitlyoStore()
  const playerMatches = usePlayerStore((state) => state.matches)
  const playerVenues = usePlayerStore((state) => state.venues)
  const courtBookings = useCrossRoleStore((state) => state.courtBookings)
  const slotOverrides = useCrossRoleStore((state) => state.slotOverrides)
  const upsertSlotOverrides = useCrossRoleStore((state) => state.upsertSlotOverrides)
  const replaceSlotOverrides = useCrossRoleStore((state) => state.replaceSlotOverrides)
  const [selectedVenueId, setSelectedVenueId] = useState(playerVenues[0]?.id ?? legacyVenue.id)
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<{ courtId: string; courtName: string; slot: CourtSlot } | null>(null)
  const [quickEditMode, setQuickEditMode] = useState(false)
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([])
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<QuickSlotTargetStatus>('AVAILABLE')
  const [newPrice, setNewPrice] = useState('')
  const [maintenanceReason, setMaintenanceReason] = useState('')
  const [walkInName, setWalkInName] = useState('')
  const [walkInPhone, setWalkInPhone] = useState('')
  const [walkInPayment, setWalkInPayment] = useState<WalkInPaymentMethod>('CASH')
  const [quickEditError, setQuickEditError] = useState('')
  const [undoState, setUndoState] = useState<{ inventory?: CourtInventory[]; overrides?: typeof slotOverrides; expiresAt: number } | null>(null)
  const [undoSeconds, setUndoSeconds] = useState(10)
  const [bookingToOpenId, setBookingToOpenId] = useState<string | null>(null)

  const selectedVenue = playerVenues.find((venue) => venue.id === selectedVenueId)
  const venueName = selectedVenue?.name ?? legacyVenue.name
  const venueAddress = selectedVenue?.address ?? legacyVenue.address
  const selectedDateIso = useMemo(() => {
    const [day, month, year] = selectedDate.split('/')
    return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`
  }, [selectedDate])
  const isLegacyVenue = !selectedVenue

  const courtInventory = useMemo<CourtInventory[]>(() => {
    if (!selectedVenue) return legacyCourtInventory
    return selectedVenue.courts.map((court) => ({
      id: court.id,
      name: court.name,
      courtType: court.type.toLowerCase().includes('ngoài') ? 'outdoor' : court.type.toLowerCase().includes('mái') ? 'covered' : 'indoor',
      slots: court.slots.map((venueSlot) => {
        const override = slotOverrides.find((item) => item.venueId === selectedVenue.id && item.date === selectedDateIso && item.courtId === court.id && item.slotNumber === venueSlot.slotNumber)
        const booking = courtBookings.find((item) => item.status === 'CONFIRMED' && item.venueId === selectedVenue.id && item.date === selectedDateIso && item.courtId === court.id && item.slotNumber === venueSlot.slotNumber)
        const match = playerMatches.find((item) => item.venueId === selectedVenue.id && item.date === selectedDateIso && item.slotNumber === venueSlot.slotNumber && (item.courtId ? item.courtId === court.id : item.courtName.startsWith(court.name)) && item.status !== 'CANCELLED')
        const baseStatus: CourtSlot['status'] = venueSlot.status === 'SOCIAL' ? 'MATCH_PUBLISHED' : venueSlot.status === 'PRIVATE' ? 'PRIVATE_BOOKED' : venueSlot.status === 'COACHING' ? 'COACHING' : venueSlot.status
        const status: CourtSlot['status'] = booking ? 'PRIVATE_BOOKED' : match ? 'MATCH_PUBLISHED' : override?.status ?? baseStatus
        return {
          slotNumber: venueSlot.slotNumber,
          timeRange: venueSlot.timeRange,
          price: override?.price ?? venueSlot.price,
          isPeak: venueSlot.isPeak,
          status,
          matchRoomId: match?.id,
          matchTitle: match?.title,
          duprRange: match ? `DUPR ${match.duprMin.toFixed(1)}–${match.duprMax.toFixed(1)}` : venueSlot.duprRange,
          playersCount: match ? `${match.participants.length}/${match.maxPlayers}` : venueSlot.players,
          bookedByName: booking?.playerName ?? override?.customerName,
          bookedPhone: booking?.playerPhone ?? override?.customerPhone,
          bookingId: booking?.bookingCode,
          bookedAt: booking?.bookedAt,
          bookingStatus: booking ? 'Đã thanh toán 100%' : undefined,
          maintenanceReason: override?.maintenanceReason,
          bookedNote: booking
            ? `${booking.playerName} · ${booking.playerPhone}`
            : status === 'COACHING'
              ? venueSlot.label
              : override?.status === 'PRIVATE_BOOKED'
                ? `${override.customerName ?? 'Khách vãng lai'}${override.customerPhone ? ` · ${override.customerPhone}` : ''}`
                : undefined,
        }
      }),
    }))
  }, [selectedVenue, legacyCourtInventory, slotOverrides, courtBookings, playerMatches, selectedDateIso])

  const recentPlayerBookings = useMemo(() => courtBookings
    .filter((booking) => booking.status === 'CONFIRMED')
    .sort((a, b) => (b.bookedAt ?? '').localeCompare(a.bookedAt ?? ''))
    .slice(0, 1), [courtBookings])

  const selectedSlots = useMemo(() => {
    const keys = new Set(selectedSlotKeys)
    return courtInventory.flatMap((court) => court.slots
      .filter((slot) => keys.has(`${court.id}:${slot.slotNumber}`))
      .map((slot) => ({ courtId: court.id, courtName: court.name, slot })))
  }, [courtInventory, selectedSlotKeys])

  useEffect(() => {
    if (!undoState) return

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((undoState.expiresAt - Date.now()) / 1000))
      setUndoSeconds(remaining)
      if (remaining === 0) setUndoState(null)
    }
    updateCountdown()
    const interval = window.setInterval(updateCountdown, 250)
    return () => window.clearInterval(interval)
  }, [undoState])

  const totalSlots = courtInventory.reduce((total, court) => total + court.slots.length, 0)
  const maintenanceSlots = courtInventory.reduce((total, court) => total + court.slots.filter((slot) => slot.status === 'MAINTENANCE').length, 0)
  const activeSlots = totalSlots - maintenanceSlots
  const bookedSlots = courtInventory.reduce((total, court) => total + court.slots.filter((slot) => !['AVAILABLE', 'MAINTENANCE'].includes(slot.status)).length, 0)
  const occupancyRate = Math.round((bookedSlots / (activeSlots || 1)) * 100)
  const estimatedRevenue = courtInventory.reduce((total, court) => total + court.slots.filter((slot) => !['AVAILABLE', 'MAINTENANCE'].includes(slot.status)).reduce((sum, slot) => sum + slot.price, 0), 0)

  const selectedCourt = selectedSlotDetails ? courtInventory.find((court) => court.id === selectedSlotDetails.courtId) : undefined
  const selectedSlot = selectedSlotDetails?.slot
  const selectedPlayerMatch = selectedSlot?.matchRoomId ? playerMatches.find((match) => match.id === selectedSlot.matchRoomId) : undefined
  const selectedCourtBooking = selectedSlotDetails ? courtBookings.find((item) => item.status === 'CONFIRMED' && item.venueId === selectedVenueId && item.date === selectedDateIso && item.courtId === selectedSlotDetails.courtId && item.slotNumber === selectedSlotDetails.slot.slotNumber) : undefined
  const playerCountFor = (slot: CourtSlot) => {
    const playerMatch = slot.matchRoomId ? playerMatches.find((match) => match.id === slot.matchRoomId) : undefined
    return playerMatch ? `${playerMatch.participants.length}/${playerMatch.maxPlayers}` : slot.playersCount
  }

  const openPlayerBooking = (booking: (typeof courtBookings)[number]) => {
    setSelectedVenueId(booking.venueId)
    setSelectedDate(new Date(`${booking.date}T00:00:00`).toLocaleDateString('vi-VN'))
    setSelectedSlotDetails(null)
    setBookingToOpenId(booking.id)
  }

  useEffect(() => {
    if (!bookingToOpenId) return
    const booking = courtBookings.find((item) => item.id === bookingToOpenId && item.status === 'CONFIRMED')
    if (!booking || booking.venueId !== selectedVenueId || booking.date !== selectedDateIso) return
    const court = courtInventory.find((item) => item.id === booking.courtId)
    const slot = court?.slots.find((item) => item.slotNumber === booking.slotNumber)
    if (!court || !slot) return
    setSelectedSlotDetails({ courtId: court.id, courtName: court.name, slot })
    setBookingToOpenId(null)
  }, [bookingToOpenId, courtBookings, courtInventory, selectedDateIso, selectedVenueId])

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
      venueId: selectedVenueId,
      venueName,
      venueAddress,
      date: selectedDateIso,
      price: selectedSlotDetails.slot.price,
      courtType: selectedCourt?.courtType === 'outdoor' ? 'Ngoài trời' : selectedCourt?.courtType === 'covered' ? 'Có mái che' : 'Trong nhà',
    })
    setSelectedSlotDetails(null)
  }

  const handleLockPrivate = () => {
    if (!selectedSlotDetails) return
    if (!isLegacyVenue) {
      setSelectedSlotKeys([`${selectedSlotDetails.courtId}:${selectedSlotDetails.slot.slotNumber}`])
      setQuickEditMode(true)
      setTargetStatus('PRIVATE_BOOKED')
      setNewPrice(String(selectedSlotDetails.slot.price))
      setWalkInName('')
      setWalkInPhone('')
      setWalkInPayment('CASH')
      setQuickEditError('')
      setIsQuickEditOpen(true)
      setSelectedSlotDetails(null)
      return
    }
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
    if (isLegacyVenue) setSlotMaintenance(selectedSlotDetails.courtId, selectedSlotDetails.slot.slotNumber)
    else upsertSlotOverrides([{
      key: `${selectedVenueId}:${selectedDateIso}:${selectedSlotDetails.courtId}:${selectedSlotDetails.slot.slotNumber}`,
      venueId: selectedVenueId,
      date: selectedDateIso,
      courtId: selectedSlotDetails.courtId,
      slotNumber: selectedSlotDetails.slot.slotNumber,
      status: 'MAINTENANCE',
      price: selectedSlotDetails.slot.price,
      maintenanceReason: 'Bảo trì theo cập nhật của Field Manager',
      updatedAt: new Date().toISOString(),
    }])
    setSelectedSlotDetails(null)
  }

  const handleRelease = () => {
    if (!selectedSlotDetails) return
    if (isLegacyVenue) releaseSlot(selectedSlotDetails.courtId, selectedSlotDetails.slot.slotNumber)
    else upsertSlotOverrides([{
      key: `${selectedVenueId}:${selectedDateIso}:${selectedSlotDetails.courtId}:${selectedSlotDetails.slot.slotNumber}`,
      venueId: selectedVenueId,
      date: selectedDateIso,
      courtId: selectedSlotDetails.courtId,
      slotNumber: selectedSlotDetails.slot.slotNumber,
      status: 'AVAILABLE',
      price: selectedSlotDetails.slot.price,
      updatedAt: new Date().toISOString(),
    }])
    setSelectedSlotDetails(null)
  }

  const toggleQuickEditMode = () => {
    setQuickEditMode((current) => !current)
    setSelectedSlotKeys([])
    setSelectedSlotDetails(null)
  }

  const handleSlotClick = (courtId: string, courtName: string, slot: CourtSlot) => {
    if (!quickEditMode) {
      setSelectedSlotDetails({ courtId, courtName, slot })
      return
    }
    if (!editableStatuses.includes(slot.status)) {
      showToast('Slot đã có booking/lớp/kèo và phải xử lý qua luồng hủy, hoàn tiền.', 'error')
      return
    }

    const key = `${courtId}:${slot.slotNumber}`
    setSelectedSlotKeys((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key])
  }

  const selectAllEditableSlots = () => {
    setSelectedSlotKeys(courtInventory.flatMap((court) => court.slots
      .filter((slot) => editableStatuses.includes(slot.status))
      .map((slot) => `${court.id}:${slot.slotNumber}`)))
  }

  const openQuickEdit = () => {
    if (selectedSlots.length === 0) return
    const firstPrice = selectedSlots[0]?.slot.price ?? 0
    const hasSamePrice = selectedSlots.every(({ slot }) => slot.price === firstPrice)
    setNewPrice(hasSamePrice ? String(firstPrice) : '')
    setTargetStatus('AVAILABLE')
    setMaintenanceReason('')
    setWalkInName('')
    setWalkInPhone('')
    setWalkInPayment('CASH')
    setQuickEditError('')
    setIsQuickEditOpen(true)
  }

  const handleBatchUpdate = () => {
    const price = Number(newPrice)
    if (!Number.isFinite(price) || price < 10000) {
      setQuickEditError('Vui lòng nhập giá mới từ 10.000đ.')
      return
    }
    if (targetStatus === 'MAINTENANCE' && maintenanceReason.trim().length < 3) {
      setQuickEditError('Vui lòng nhập lý do bảo trì.')
      return
    }
    if (targetStatus === 'PRIVATE_BOOKED' && (walkInName.trim().length < 2 || !/^0\d{9}$/.test(walkInPhone.replace(/\D/g, '')))) {
      setQuickEditError('Vui lòng nhập đúng họ tên và số điện thoại 10 số của khách.')
      return
    }
    if (!isLegacyVenue) {
      const previousOverrides = [...slotOverrides]
      upsertSlotOverrides(selectedSlots.map(({ courtId, slot }) => ({
        key: `${selectedVenueId}:${selectedDateIso}:${courtId}:${slot.slotNumber}`,
        venueId: selectedVenueId,
        date: selectedDateIso,
        courtId,
        slotNumber: slot.slotNumber,
        status: targetStatus,
        price,
        maintenanceReason: targetStatus === 'MAINTENANCE' ? maintenanceReason.trim() : undefined,
        customerName: targetStatus === 'PRIVATE_BOOKED' ? walkInName.trim() : undefined,
        customerPhone: targetStatus === 'PRIVATE_BOOKED' ? walkInPhone.replace(/\D/g, '') : undefined,
        paymentMethod: targetStatus === 'PRIVATE_BOOKED' ? walkInPayment : undefined,
        updatedAt: new Date().toISOString(),
      })))
      setUndoState({ overrides: previousOverrides, expiresAt: Date.now() + 10_000 })
      setUndoSeconds(10)
      setIsQuickEditOpen(false)
      setSelectedSlotKeys([])
      showToast(`Đã cập nhật ${selectedSlots.length} slot tại ${venueName}.`, 'success')
      return
    }
    const result = batchUpdateSlots({
      slots: selectedSlots.map(({ courtId, slot }) => ({ courtId, slotNumber: slot.slotNumber })),
      targetStatus,
      price,
      maintenanceReason: targetStatus === 'MAINTENANCE' ? maintenanceReason : undefined,
      walkIn: targetStatus === 'PRIVATE_BOOKED'
        ? { customerName: walkInName, phone: walkInPhone, paymentMethod: walkInPayment }
        : undefined,
    })
    if (!result.success || !result.previousInventory) {
      setQuickEditError(result.message)
      return
    }

    setUndoState({ inventory: result.previousInventory, expiresAt: Date.now() + 10_000 })
    setUndoSeconds(10)
    setIsQuickEditOpen(false)
    setSelectedSlotKeys([])
  }

  const handleUndo = () => {
    if (!undoState || Date.now() >= undoState.expiresAt) return
    if (undoState.inventory) restoreCourtInventory(undoState.inventory)
    if (undoState.overrides) replaceSlotOverrides(undoState.overrides)
    setUndoState(null)
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2"><Badge variant="default" className="text-xs" withDot pulseDot>SCR_FM_01</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · 10 slot liên tục</span></div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ma trận lịch sân 06:00–21:00</h1>
          <p className="mt-1 text-sm text-muted-foreground">{venueName} · {COURT_SLOT_DURATION_MINUTES} phút/slot · Không nghỉ giữa ca.</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <label className="flex min-h-12 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold shadow-xs">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="sr-only">Chọn cụm sân</span>
            <select
              value={selectedVenueId}
              onChange={(event) => { setSelectedVenueId(event.target.value); setSelectedSlotKeys([]); setSelectedSlotDetails(null) }}
              className="min-w-56 bg-transparent outline-none"
            >
              {playerVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
              <option value={legacyVenue.id}>{legacyVenue.name}</option>
            </select>
          </label>
          <div className="flex items-center rounded-xl border bg-card p-1 shadow-xs">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDate(-1)} aria-label="Ngày trước"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-1.5 px-3 text-xs font-bold sm:text-sm"><CalendarDays className="h-4 w-4 text-primary" />Ngày: {selectedDate}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeDate(1)} aria-label="Ngày tiếp theo"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button
            type="button"
            variant={quickEditMode ? 'default' : 'outline'}
            className="h-9 gap-2 text-xs"
            onClick={toggleQuickEditMode}
          >
            {quickEditMode ? <X className="h-3.5 w-3.5" /> : <PencilLine className="h-3.5 w-3.5" />}
            {quickEditMode ? 'Thoát cập nhật nhanh' : 'Cập nhật slot nhanh'}
          </Button>
        </div>
      </header>

      {quickEditMode && <section className="rounded-2xl border border-primary/25 bg-primary/5 p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-primary/10 p-2 text-primary"><PencilLine className="h-4 w-4" /></span>
            <div>
              <h2 className="text-sm font-black">Chế độ cập nhật nhanh</h2>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
                Chọn nhiều slot còn trống hoặc bảo trì, rồi cập nhật trạng thái và một mức giá chung. Slot có Player đặt, lớp Coach hoặc kèo Social được khóa để bảo vệ giao dịch.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={selectAllEditableSlots}>Chọn tất cả có thể sửa</Button>
            <Button type="button" variant="ghost" size="sm" disabled={selectedSlotKeys.length === 0} onClick={() => setSelectedSlotKeys([])}>Bỏ chọn</Button>
          </div>
        </div>
      </section>}

      <div className="flex items-center gap-4 overflow-x-auto rounded-2xl border border-border/60 bg-muted/40 p-3 text-xs">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider">Chú giải:</span>
        {Object.values(statusMeta).map((status) => <span key={status.label} className="flex shrink-0 items-center gap-1.5 font-medium"><i className={`h-3 w-3 rounded-md ${status.dot}`} />{status.label}</span>)}
      </div>

      {recentPlayerBookings.length > 0 && <section className="rounded-2xl border border-orange-400/30 bg-orange-500/5 p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-black">Đặt sân mới nhất</h2>
        <div className="mt-4 grid gap-2">
          {recentPlayerBookings.map((booking) => <div key={booking.id} className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><p className="font-black">{booking.playerName} · {booking.playerPhone}</p><p className="mt-1 text-xs text-muted-foreground">{booking.venueName} · {booking.courtName} · Slot {booking.slotNumber} ({booking.timeRange}) · {booking.dateLabel}</p><p className="mt-1 text-xs font-bold text-emerald-600">Đã thanh toán 100% · {booking.paidAmount.toLocaleString('vi-VN')}đ</p></div>
            <Button type="button" variant="outline" className="shrink-0" onClick={() => openPlayerBooking(booking)}>Xem</Button>
          </div>)}
        </div>
      </section>}

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
              const key = `${court.id}:${slot.slotNumber}`
              const isEditable = editableStatuses.includes(slot.status)
              const isSelected = selectedSlotKeys.includes(key)
              const isPlayerBooking = slot.status === 'PRIVATE_BOOKED' && Boolean(slot.bookingId)
              return <button
                key={slot.slotNumber}
                type="button"
                onClick={() => handleSlotClick(court.id, court.name, slot)}
                aria-pressed={quickEditMode ? isSelected : undefined}
                className={`group relative m-1.5 flex min-w-0 flex-col justify-between rounded-xl border p-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/60 ${meta.className} ${quickEditMode && !isEditable ? 'cursor-not-allowed opacity-55' : 'hover:-translate-y-0.5 hover:shadow-md'} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                {quickEditMode && isEditable && <span className={`absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full border transition ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-current bg-card/80 text-transparent'}`}><Check className="h-3 w-3" /></span>}
                <span className="flex items-center gap-1.5 pr-5 text-[10px] font-bold"><i className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} /><span className="truncate">{isPlayerBooking ? 'Player đặt sân' : meta.label}</span>{slot.isPeak && <Flame className="ml-auto h-3.5 w-3.5 text-orange-500" />}</span>
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

      {selectedSlotDetails && selectedSlot && <SlotDetailModal
        open
        venueName={venueName}
        venueAddress={venueAddress}
        dateLabel={selectedDate}
        courtName={selectedSlotDetails.courtName}
        courtType={selectedCourt?.courtType === 'outdoor' ? 'Ngoài trời' : selectedCourt?.courtType === 'covered' ? 'Có mái che' : 'Trong nhà'}
        slot={selectedSlot}
        match={selectedPlayerMatch}
        courtBooking={selectedCourtBooking}
        onClose={() => setSelectedSlotDetails(null)}
        onPublish={handleOpenPublish}
        onWalkIn={handleLockPrivate}
        onMaintenance={handleMaintenance}
        onRelease={handleRelease}
        onNotify={(message) => showToast(message, 'info')}
      />}

      {isQuickEditOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="quick-edit-title">
        <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl">
          <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Cập nhật hàng loạt</p>
              <h2 id="quick-edit-title" className="mt-1 text-xl font-black">{selectedSlots.length} slot đã chọn</h2>
              <p className="mt-1 text-xs text-muted-foreground">Một thao tác duy nhất cho trạng thái, giá và thông tin vận hành.</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setIsQuickEditOpen(false)} aria-label="Đóng"><X className="h-4 w-4" /></Button>
          </header>

          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_1.05fr]">
            <section className="border-b p-5 lg:border-b-0 lg:border-r sm:p-6">
              <h3 className="text-sm font-black">1. Chọn trạng thái mới</h3>
              <div className="mt-3 grid gap-2">
                {quickStatusOptions.map((option) => {
                  const Icon = option.icon
                  const isActive = targetStatus === option.value
                  return <button
                    key={option.value}
                    type="button"
                    onClick={() => { setTargetStatus(option.value); setQuickEditError('') }}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${isActive ? `${option.className} ring-2 ring-current/20` : 'border-border/70 bg-background hover:border-primary/35'}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className="block text-sm font-black">{option.label}</span><span className="mt-0.5 block text-[11px] opacity-75">{option.description}</span></span>
                    {isActive && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0" />}
                  </button>
                })}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between"><h3 className="text-sm font-black">2. Các slot đã chọn</h3><span className="text-[11px] font-semibold text-muted-foreground">Giá hiện tại</span></div>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {selectedSlots.map(({ courtId, courtName, slot }) => <div key={`${courtId}:${slot.slotNumber}`} className="flex items-center justify-between gap-3 rounded-xl bg-muted/45 px-3 py-2.5 text-xs">
                    <div className="min-w-0"><p className="truncate font-bold">{courtName} · Slot {slot.slotNumber}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{slot.timeRange} · {statusMeta[slot.status].label}</p></div>
                    <span className="shrink-0 font-black">{slot.price.toLocaleString('vi-VN')}đ</span>
                  </div>)}
                </div>
              </div>
            </section>

            <section className="p-5 sm:p-6">
              <h3 className="text-sm font-black">3. Nhập thông tin cập nhật</h3>
              <label className="mt-4 block text-xs font-bold" htmlFor="batch-price">Giá mới áp dụng cho mỗi slot <span className="text-destructive">*</span></label>
              <div className="relative mt-2">
                <Input id="batch-price" type="number" min="10000" step="10000" value={newPrice} onChange={(event) => { setNewPrice(event.target.value); setQuickEditError('') }} className="h-11 pr-14 font-bold" placeholder="Ví dụ: 180000" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">VNĐ</span>
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground">Mức giá này thay thế giá hiện tại của toàn bộ {selectedSlots.length} slot đã chọn.</p>

              {targetStatus === 'MAINTENANCE' && <div className="mt-5">
                <label className="block text-xs font-bold" htmlFor="maintenance-reason">Lý do bảo trì chung <span className="text-destructive">*</span></label>
                <textarea id="maintenance-reason" rows={4} value={maintenanceReason} onChange={(event) => { setMaintenanceReason(event.target.value); setQuickEditError('') }} className="mt-2 w-full resize-none rounded-xl border border-input bg-background/70 px-3 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/40" placeholder="Ví dụ: Bảo dưỡng mặt sân và hệ thống đèn" />
              </div>}

              {targetStatus === 'PRIVATE_BOOKED' && <div className="mt-5 space-y-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                <div><h4 className="flex items-center gap-2 text-sm font-black"><UsersRound className="h-4 w-4 text-orange-500" />Thông tin khách vãng lai</h4><p className="mt-1 text-[10px] text-muted-foreground">Nhập một lần cho toàn bộ slot đã chọn.</p></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="block text-xs font-bold" htmlFor="walk-in-name">Họ và tên <span className="text-destructive">*</span></label><Input id="walk-in-name" value={walkInName} onChange={(event) => { setWalkInName(event.target.value); setQuickEditError('') }} className="mt-2 h-10" placeholder="Nguyễn Văn A" /></div>
                  <div><label className="block text-xs font-bold" htmlFor="walk-in-phone">Số điện thoại <span className="text-destructive">*</span></label><Input id="walk-in-phone" inputMode="numeric" value={walkInPhone} onChange={(event) => { setWalkInPhone(event.target.value); setQuickEditError('') }} className="mt-2 h-10" placeholder="0901234567" /></div>
                </div>
                <fieldset><legend className="text-xs font-bold">Phương thức thanh toán</legend><div className="mt-2 grid grid-cols-3 gap-2">{([['CASH', 'Tiền mặt'], ['VIETQR', 'VietQR'], ['DEBT', 'Ghi nợ']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setWalkInPayment(value)} className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${walkInPayment === value ? 'border-orange-500 bg-orange-500/10 text-orange-800 dark:text-orange-300' : 'border-border bg-background hover:border-orange-500/40'}`}>{label}</button>)}</div></fieldset>
                <div className="flex items-center justify-between rounded-xl bg-background/80 p-3 text-xs"><span className="flex items-center gap-2 text-muted-foreground"><Banknote className="h-4 w-4" />Tổng tiền dự kiến</span><strong className="text-base">{(Number(newPrice) > 0 ? Number(newPrice) * selectedSlots.length : 0).toLocaleString('vi-VN')}đ</strong></div>
              </div>}

              {quickEditError && <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-xs font-semibold text-destructive"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{quickEditError}</div>}

              <div className="mt-6 rounded-xl bg-muted/45 p-3 text-[11px] leading-5 text-muted-foreground">
                <strong className="text-foreground">Kiểm tra trước khi lưu:</strong> thao tác sẽ áp dụng đồng thời cho {selectedSlots.length} slot. Bạn có 10 giây để hoàn tác sau khi xác nhận.
              </div>
            </section>
          </div>

          <footer className="flex flex-col-reverse justify-end gap-2 border-t bg-card px-5 py-4 sm:flex-row sm:px-6">
            <Button type="button" variant="outline" onClick={() => setIsQuickEditOpen(false)}>Hủy</Button>
            <Button type="button" className="gap-2" onClick={handleBatchUpdate}><Check className="h-4 w-4" />Xác nhận cập nhật {selectedSlots.length} slot</Button>
          </footer>
        </div>
      </div>}

      {quickEditMode && selectedSlots.length > 0 && !isQuickEditOpen && <div className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-primary/25 bg-card/95 p-3 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-black text-primary-foreground">{selectedSlots.length}</span><div><p className="text-sm font-black">slot đã chọn</p><p className="text-[10px] text-muted-foreground">Chỉ gồm slot trống hoặc bảo trì</p></div></div>
        <div className="flex gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setSelectedSlotKeys([])}>Bỏ chọn</Button><Button type="button" size="sm" className="gap-2" onClick={openQuickEdit}><PencilLine className="h-3.5 w-3.5" />Cập nhật trạng thái & giá</Button></div>
      </div>}

      {undoState && <div className="fixed bottom-4 right-4 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/25 bg-slate-950 p-3.5 text-white shadow-2xl">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300"><CheckCircle2 className="h-4 w-4" /></span>
        <div className="min-w-0"><p className="text-xs font-bold">Đã cập nhật slot thành công</p><p className="mt-0.5 text-[10px] text-slate-300">Có thể hoàn tác trong {undoSeconds} giây</p></div>
        <Button type="button" variant="outline" size="sm" onClick={handleUndo} className="ml-1 h-8 shrink-0 gap-1.5 border-white/20 bg-white/10 px-2.5 text-[11px] text-white hover:bg-white/20 hover:text-white"><RotateCcw className="h-3 w-3" />Hoàn tác</Button>
      </div>}

      <PublishMatchModal />
      <WalkInBookingModal />
    </div>
  )
}

export default CourtCalendarPage
