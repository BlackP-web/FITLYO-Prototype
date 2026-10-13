import React, { useState } from 'react'
import {
  CalendarDays,
  Plus,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Wrench,
  Clock,
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
    openPublishModal,
    lockSlotAsPrivate,
    setSlotMaintenance,
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
    { num: 1, time: '06:00 - 07:30', isPeak: false },
    { num: 2, time: '07:30 - 09:00', isPeak: false },
    { num: 3, time: '15:30 - 17:00', isPeak: false },
    { num: 4, time: '17:00 - 18:30', isPeak: false },
    { num: 5, time: '18:30 - 20:00', isPeak: true },
    { num: 6, time: '20:00 - 21:30', isPeak: false },
  ]

  // Calculate stats
  const totalSlots = courtInventory.reduce((acc, c) => acc + c.slots.length, 0)
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
  const occupancyRate = Math.round((bookedSlots / (totalSlots || 1)) * 100)
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

        {/* Date Selector & Add Court Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-card border rounded-xl p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => showToast('Đã chuyển sang ngày hôm trước', 'info')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 px-3 text-xs sm:text-sm font-bold text-foreground">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>Hôm nay: {selectedDate}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => showToast('Đã chuyển sang ngày mai', 'info')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => showToast('Tính năng thêm sân mới đã mở!', 'info')}
            className="gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm sân con</span>
          </Button>
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

      {/* Main Real-Time 6-Slot Grid */}
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b bg-muted/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="p-3.5 sm:p-4 min-w-[130px] sm:min-w-[160px] border-r">
                KHUNG GIỜ (SLOT)
              </th>
              {courtInventory.map((court) => (
                <th
                  key={court.id}
                  className="p-3.5 sm:p-4 min-w-[180px] sm:min-w-[220px] border-r last:border-r-0"
                >
                  <div className="font-bold text-foreground text-sm">{court.name}</div>
                  <div className="text-[11px] font-normal text-muted-foreground">
                    {court.courtType === 'indoor'
                      ? 'Mặt sân trong nhà'
                      : court.courtType === 'outdoor'
                      ? 'Mặt sân ngoài trời'
                      : 'Mặt sân mái che'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {standardSlots.map((standardSlot) => (
              <tr key={standardSlot.num} className="hover:bg-muted/10 transition-colors">
                {/* Slot Info Header Cell */}
                <td className="p-3.5 sm:p-4 border-r bg-muted/20 font-semibold align-top">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-sm">
                    <span>Slot {standardSlot.num}</span>
                    {standardSlot.isPeak && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400">
                        <Flame className="w-3 h-3 animate-pulse" /> Giờ Vàng
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{standardSlot.time}</span>
                  </div>
                </td>

                {/* Court Cells */}
                {courtInventory.map((court) => {
                  const slotData = court.slots.find(
                    (s) => s.slotNumber === standardSlot.num
                  ) || {
                    slotNumber: standardSlot.num,
                    timeRange: standardSlot.time,
                    status: 'AVAILABLE' as const,
                    price: 180000,
                  }

                  const isAvailable = slotData.status === 'AVAILABLE'
                  const isMatch = slotData.status === 'MATCH_PUBLISHED'
                  const isCoaching = slotData.status === 'COACHING'
                  const isPrivate = slotData.status === 'PRIVATE_BOOKED'
                  const isMaintenance = slotData.status === 'MAINTENANCE'

                  return (
                    <td
                      key={court.id}
                      className="p-2.5 sm:p-3 border-r last:border-r-0 align-top"
                    >
                      <div
                        onClick={() => handleSlotClick(court.id, court.name, slotData)}
                        className={`group relative flex flex-col justify-between rounded-xl p-3 border transition-all duration-200 cursor-pointer text-xs min-h-[92px] ${
                          isAvailable
                            ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 hover:shadow-sm'
                            : isMatch
                            ? 'border-blue-500/30 bg-blue-500/10 hover:border-blue-500/60 shadow-xs'
                            : isCoaching
                            ? 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/60 shadow-xs'
                            : isPrivate
                            ? 'border-orange-500/30 bg-orange-500/10 hover:border-orange-500/60 shadow-xs'
                            : 'border-slate-500/30 bg-slate-500/10 opacity-70 cursor-not-allowed'
                        }`}
                      >
                        {/* Status Label */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-bold uppercase text-[11px] flex items-center gap-1 ${
                              isAvailable
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : isMatch
                                ? 'text-blue-700 dark:text-blue-300'
                                : isCoaching
                                ? 'text-purple-700 dark:text-purple-300'
                                : isPrivate
                                ? 'text-orange-700 dark:text-orange-300'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isAvailable
                                  ? 'bg-emerald-500 animate-pulse'
                                  : isMatch
                                  ? 'bg-blue-500'
                                  : isCoaching
                                  ? 'bg-purple-500'
                                  : isPrivate
                                  ? 'bg-orange-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {isAvailable
                              ? 'TRỐNG'
                              : isMatch
                              ? 'KÈO SOCIAL'
                              : isCoaching
                              ? 'LỚP COACH'
                              : isPrivate
                              ? 'BAO RIÊNG'
                              : 'BẢO TRÌ'}
                          </span>

                          {slotData.price > 0 && (
                            <span className="font-semibold text-foreground text-[11px]">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(slotData.price)}
                            </span>
                          )}
                        </div>

                        {/* Extra Details */}
                        <div className="mt-1 space-y-0.5">
                          {isAvailable && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 group-hover:underline">
                              <Plus className="w-3 h-3" /> Mở Kèo Social
                            </div>
                          )}

                          {isMatch && (
                            <>
                              <p className="font-bold text-foreground text-xs truncate">
                                {slotData.matchTitle || 'Kèo Ghép Trận DUPR'}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>{slotData.duprRange}</span>
                                <span className="font-bold text-blue-600 bg-blue-500/10 px-1 rounded">
                                  {slotData.playersCount}
                                </span>
                              </div>
                            </>
                          )}

                          {isCoaching && (
                            <>
                              <p className="font-bold text-foreground text-xs truncate">
                                {slotData.bookedNote}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                Liên hệ: {slotData.bookedContact}
                              </p>
                            </>
                          )}

                          {isPrivate && (
                            <>
                              <p className="font-bold text-foreground text-xs truncate">
                                {slotData.bookedNote}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {slotData.bookedContact}
                              </p>
                            </>
                          )}

                          {isMaintenance && (
                            <p className="text-[11px] text-muted-foreground">
                              {slotData.bookedNote || 'Tạm đóng bảo dưỡng'}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
              Đã lấp đầy {bookedSlots} / {totalSlots} slot hoạt động trong ngày
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
                    // Reset to available
                    useFitlyoStore.getState().courtInventory.forEach((c) => {
                      if (c.id === selectedSlotDetails.courtId) {
                        const s = c.slots.find(
                          (x) => x.slotNumber === selectedSlotDetails.slot.slotNumber
                        )
                        if (s) s.status = 'AVAILABLE'
                      }
                    })
                    useFitlyoStore.setState({
                      courtInventory: [...useFitlyoStore.getState().courtInventory],
                    })
                    setSelectedSlotDetails(null)
                    showToast('Đã mở lại slot thành Available!', 'info')
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
