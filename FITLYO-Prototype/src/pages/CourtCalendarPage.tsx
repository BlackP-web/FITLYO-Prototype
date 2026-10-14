import React, { useState } from 'react'
import {
  CalendarDays,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Wrench,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PublishMatchModal } from '@/components/modals/PublishMatchModal'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CourtSlot } from '@/types/pickleball'

export const CourtCalendarPage: React.FC = () => {
  const {
    courtInventory,
    selectedDate,
    setSelectedDate,
    openPublishModal,
    lockSlotAsPrivate,
    setSlotMaintenance,
    releaseSlot,
    showToast,
  } = useFitlyoStore()

  const [selectedSlotDetails, setSelectedSlotDetails] = useState<{
    courtId: string
    courtName: string
    slot: CourtSlot
  } | null>(null)

  const [quickContactName, setQuickContactName] = useState('')

  // 6 standard slot definitions
  const standardSlots = [
    { num: 1, time: '06:00 - 07:30', isPeak: false, timelineColumn: 1 },
    { num: 2, time: '07:30 - 09:00', isPeak: false, timelineColumn: 4 },
    { num: 3, time: '15:30 - 17:00', isPeak: false, timelineColumn: 20 },
    { num: 4, time: '17:00 - 18:30', isPeak: false, timelineColumn: 23 },
    { num: 5, time: '18:30 - 20:00', isPeak: true, timelineColumn: 26 },
    { num: 6, time: '20:00 - 21:30', isPeak: false, timelineColumn: 29 },
  ]

  const timelineHours = Array.from({ length: 16 }, (_, index) => {
    const hour = index + 6
    return {
      label: `${hour.toString().padStart(2, '0')}:00`,
      gridColumn: index * 2 + 2,
    }
  })

  // Calculate stats
  const totalSlots = courtInventory.reduce((acc, c) => acc + c.slots.length, 0)
  const maintenanceSlots = courtInventory.reduce(
    (acc, court) => acc + court.slots.filter((slot) => slot.status === 'MAINTENANCE').length,
    0,
  )
  const activeSlots = totalSlots - maintenanceSlots
  const bookedSlots = courtInventory.reduce(
    (acc, c) =>
      acc +
      c.slots.filter(
        (s) =>
          s.status === 'MATCH_PUBLISHED' ||
          s.status === 'COACHING' ||
          s.status === 'PRIVATE_BOOKED'
      ).length,
    0
  )
  const occupancyRate = Math.round((bookedSlots / (activeSlots || 1)) * 100)
  const estimatedRevenue = courtInventory.reduce(
    (acc, c) =>
      acc +
      c.slots
        .filter((s) => s.status !== 'AVAILABLE' && s.status !== 'MAINTENANCE')
        .reduce((sAcc, s) => sAcc + s.price, 0),
    0
  )

  const handleSlotClick = (courtId: string, courtName: string, slot: CourtSlot) => {
    setSelectedSlotDetails({ courtId, courtName, slot })
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
    lockSlotAsPrivate(
      selectedSlotDetails.courtId,
      selectedSlotDetails.slot.slotNumber,
      quickContactName || 'Khách vãng lai tại quầy'
    )
    setSelectedSlotDetails(null)
    setQuickContactName('')
  }

  const handleMaintenance = () => {
    if (!selectedSlotDetails) return
    setSlotMaintenance(selectedSlotDetails.courtId, selectedSlotDetails.slot.slotNumber)
    setSelectedSlotDetails(null)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Screen Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs" withDot pulseDot>
              SCR_FM_01
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              Field Manager • Điều hành 6 Slot Thời Gian Thực
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Ma Trận Lịch Sân & 6 Slot Chuẩn
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cụm sân D-Sports Pickleball Thủ Đức • Khung giờ tiêu chuẩn 90 phút/slot.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-card border rounded-xl p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => changeDate(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 px-3 text-xs sm:text-sm font-bold text-foreground">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>Ngày: {selectedDate}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => changeDate(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Color Legend (Chú giải trạng thái) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs bg-muted/40 p-3 rounded-2xl border border-border/60 scrollbar-none">
        <span className="font-bold text-foreground uppercase tracking-wider text-[11px] shrink-0">
          Chú giải:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-xs" />
          <span className="font-medium text-foreground">Trống (Available)</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-md bg-blue-500 shadow-xs" />
          <span className="font-medium text-foreground">Kèo Social DUPR</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-md bg-purple-500 shadow-xs" />
          <span className="font-medium text-foreground">Giờ dạy Coach</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-md bg-orange-500 shadow-xs" />
          <span className="font-medium text-foreground">Khách bao sân</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-md bg-slate-500 shadow-xs" />
          <span className="font-medium text-foreground">Bảo trì</span>
        </div>
      </div>

      {/* Timeline Calendar: each row is a court and every card keeps its original slot logic. */}
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="min-w-[1120px]">
          <div
            className="grid min-h-11 items-center border-b bg-muted/60 text-[10px] font-bold text-muted-foreground"
            style={{ gridTemplateColumns: '112px repeat(32, minmax(28px, 1fr))' }}
          >
            <div className="border-r px-3 uppercase tracking-wider">Sân đấu</div>
            {timelineHours.map((hour) => (
              <div
                key={hour.label}
                className="border-r text-center last:border-r-0"
                style={{ gridColumn: `${hour.gridColumn} / span 2` }}
              >
                {hour.label}
              </div>
            ))}
          </div>

          {courtInventory.map((court) => (
            <div
              key={court.id}
              className="grid min-h-[82px] items-center border-b last:border-b-0"
              style={{ gridTemplateColumns: '112px repeat(32, minmax(28px, 1fr))' }}
            >
              <div className="self-stretch border-r bg-muted/20 px-3 py-3">
                <p className="text-xs font-bold text-foreground">{court.name}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {court.courtType === 'indoor'
                    ? 'Trong nhà'
                    : court.courtType === 'outdoor'
                    ? 'Ngoài trời'
                    : 'Mái che'}
                </p>
              </div>

              {standardSlots.map((standardSlot) => {
                const slotData = court.slots.find((slot) => slot.slotNumber === standardSlot.num) || {
                  slotNumber: standardSlot.num,
                  timeRange: standardSlot.time,
                  status: 'AVAILABLE' as const,
                  price: 180000,
                }
                const isAvailable = slotData.status === 'AVAILABLE'
                const isMatch = slotData.status === 'MATCH_PUBLISHED'
                const isCoaching = slotData.status === 'COACHING'
                const isPrivate = slotData.status === 'PRIVATE_BOOKED'
                const statusLabel = isAvailable
                  ? 'Trống'
                  : isMatch
                  ? 'Kèo Social'
                  : isCoaching
                  ? 'Lớp Coach'
                  : isPrivate
                  ? 'Bao riêng'
                  : 'Bảo trì'

                return (
                  <button
                    key={slotData.slotNumber}
                    type="button"
                    onClick={() => handleSlotClick(court.id, court.name, slotData)}
                    title={`Slot ${standardSlot.num}: ${standardSlot.time} - ${statusLabel}`}
                    style={{ gridColumn: `${standardSlot.timelineColumn + 1} / span 3` }}
                    className={`group mx-0.5 flex min-w-0 flex-col justify-center rounded-md border px-2 py-1.5 text-left text-[10px] transition-all duration-200 hover:z-10 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 ${
                      isAvailable
                        ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-500/15 dark:text-emerald-300'
                        : isMatch
                        ? 'border-blue-500/35 bg-blue-500/10 text-blue-800 hover:border-blue-500 dark:text-blue-300'
                        : isCoaching
                        ? 'border-purple-500/35 bg-purple-500/10 text-purple-800 hover:border-purple-500 dark:text-purple-300'
                        : isPrivate
                        ? 'border-orange-500/35 bg-orange-500/10 text-orange-800 hover:border-orange-500 dark:text-orange-300'
                        : 'border-slate-400/40 bg-slate-500/10 text-slate-600 hover:border-slate-500 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-1 font-bold">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-500'
                            : isMatch
                            ? 'bg-blue-500'
                            : isCoaching
                            ? 'bg-purple-500'
                            : isPrivate
                            ? 'bg-orange-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="truncate">{statusLabel}</span>
                      {standardSlot.isPeak && <Flame className="ml-auto h-3 w-3 shrink-0 text-orange-500" />}
                    </span>

                    <span className="mt-0.5 truncate text-[9px] opacity-85">
                      {isAvailable
                        ? 'Mở bán kèo'
                        : isMatch
                        ? `${slotData.duprRange || 'DUPR'} · ${slotData.playersCount || '0/4'}`
                        : isCoaching || isPrivate
                        ? slotData.bookedNote || slotData.bookedContact || 'Đã đặt'
                        : slotData.bookedNote || 'Tạm khóa sân'}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Summary & Occupancy Bar */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h4 className="font-bold text-base text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Tổng Kết Hiệu Suất Cụm Sân Hôm Nay</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Đã lấp đầy {bookedSlots} / {activeSlots} slot hoạt động trong ngày
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Công suất lấp đầy:</span>
              <p className="font-extrabold text-foreground text-base sm:text-lg">
                {occupancyRate}%
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Doanh thu ước tính:</span>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(estimatedRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              occupancyRate > 75
                ? 'bg-emerald-500'
                : occupancyRate > 50
                ? 'bg-amber-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {/* Slot Action Modal / Sheet */}
      {selectedSlotDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="border-b pb-3">
              <span className="text-xs font-semibold text-primary uppercase">
                ĐIỀU HÀNH SLOT THỜI GIAN THỰC
              </span>
              <h4 className="font-bold text-lg text-foreground mt-0.5">
                {selectedSlotDetails.courtName} • Slot {selectedSlotDetails.slot.slotNumber}
              </h4>
              <p className="text-xs text-muted-foreground">
                Khung giờ: {selectedSlotDetails.slot.timeRange}
              </p>
            </div>

            {selectedSlotDetails.slot.status === 'AVAILABLE' ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Slot này hiện đang trống. Hãy chọn hành động điều hành bên dưới:
                </p>

                <Button
                  onClick={handleOpenPublish}
                  className="w-full justify-start gap-2.5 h-11 bg-primary text-primary-foreground font-semibold active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>1. Mở Bán Kèo Social DUPR (Lên Feed)</span>
                </Button>

                <div className="rounded-xl border p-3 bg-muted/30 space-y-2">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-500" />
                    <span>2. Khóa Cho Khách Bao Sân Riêng</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Tên & SĐT khách (VD: Anh Hùng 0908...)"
                    value={quickContactName}
                    onChange={(e) => setQuickContactName(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLockPrivate}
                    className="w-full text-xs active:scale-[0.98]"
                  >
                    Xác nhận Khóa Slot Bao Sân
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleMaintenance}
                  className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive active:scale-[0.98]"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>3. Tạm dừng để Bảo trì lưới / vệ sinh mặt sân</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-muted/40 p-3.5 space-y-1.5">
                  <span className="font-semibold text-foreground block">
                    Thông tin hiện tại của Slot:
                  </span>
                  <p>
                    <b>Trạng thái:</b> {selectedSlotDetails.slot.status}
                  </p>
                  {selectedSlotDetails.slot.matchTitle && (
                    <p>
                      <b>Kèo:</b> {selectedSlotDetails.slot.matchTitle} ({selectedSlotDetails.slot.playersCount})
                    </p>
                  )}
                  {selectedSlotDetails.slot.bookedNote && (
                    <p>
                      <b>Ghi chú:</b> {selectedSlotDetails.slot.bookedNote}
                    </p>
                  )}
                  {selectedSlotDetails.slot.bookedContact && (
                    <p>
                      <b>Liên hệ:</b> {selectedSlotDetails.slot.bookedContact}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    releaseSlot(
                      selectedSlotDetails.courtId,
                      selectedSlotDetails.slot.slotNumber,
                    )
                    setSelectedSlotDetails(null)
                  }}
                  className="w-full text-xs"
                >
                  Giải phóng slot (Đổi về TRỐNG)
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlotDetails(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Match Modal Integration */}
      <PublishMatchModal />
    </div>
  )
}

export default CourtCalendarPage
