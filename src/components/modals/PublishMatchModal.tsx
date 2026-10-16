import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Sparkles, MapPin, Clock, Info, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const PublishMatchModal: React.FC = () => {
  const {
    isPublishModalOpen,
    publishingSlotData,
    closePublishModal,
    publishSlotAsMatch,
    courtInventory,
    selectedDate,
  } = useFitlyoStore()

  const [duprMin, setDuprMin] = useState<number>(2.5)
  const [duprMax, setDuprMax] = useState<number>(3.0)
  const [format, setFormat] = useState<'doubles' | 'singles'>('doubles')
  const [entryFee, setEntryFee] = useState<number>(50000)
  const [amenities, setAmenities] = useState<string[]>([
    '2 quả bóng thi đấu tiêu chuẩn',
    'Nước uống miễn phí',
  ])
  const [note, setNote] = useState<string>(
    'Giao lưu vui vẻ, đề nghị đến đúng giờ trước 10 phút để khởi động và test vợt.'
  )

  if (!publishingSlotData) return null

  const capacity = format === 'doubles' ? 4 : 2
  const courtCost =
    courtInventory
      .find((court) => court.id === publishingSlotData.courtId)
      ?.slots.find((slot) => slot.slotNumber === publishingSlotData.slotNumber)?.price ?? 180000
  const estimatedRevenue = entryFee * capacity
  const estimatedDifference = estimatedRevenue - courtCost
  const isDuprValid = duprMin <= duprMax
  const isFeeValid = entryFee >= 20000 && entryFee <= 300000
  const isFormValid = isDuprValid && isFeeValid

  const availableAmenities = [
    '2 quả bóng thi đấu tiêu chuẩn',
    'Nước uống miễn phí',
    'Có người nhặt bóng',
    'Mượn vợt miễn phí',
    'Đèn LED cao cấp chống chói',
  ]

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item))
    } else {
      setAmenities([...amenities, item])
    }
  }

  const handlePublish = () => {
    if (!isFormValid) return

    publishSlotAsMatch({
      courtId: publishingSlotData.courtId,
      slotNumber: publishingSlotData.slotNumber,
      duprMin,
      duprMax,
      format,
      fee: entryFee,
      amenities,
      note,
    })
  }

  return (
    <Dialog.Root open={isPublishModalOpen} onOpenChange={(open) => !open && closePublishModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-5 border border-border/70 bg-card p-6 shadow-2xl rounded-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1.5">
                <Sparkles className="w-3 h-3" /> FIELD MANAGER PORTAL
              </div>
              <Dialog.Title className="text-xl font-bold text-foreground tracking-tight">
                CÔNG BỐ PHÒNG GHÉP TRẬN SOCIAL MATCH
              </Dialog.Title>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Cụm sân D-Sports Thủ Đức • {publishingSlotData.courtName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Slot {publishingSlotData.slotNumber} ({publishingSlotData.timeRange}) • {selectedDate}
                </span>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 text-sm">
            {/* 1. Thang DUPR */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                1. Trình độ yêu cầu (Thang DUPR):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground">DUPR Tối thiểu (Min)</span>
                  <select
                    value={duprMin}
                    onChange={(e) => setDuprMin(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map((v) => (
                      <option key={v} value={v}>
                        DUPR {v.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">DUPR Tối đa (Max)</span>
                  <select
                    value={duprMax}
                    onChange={(e) => setDuprMax(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((v) => (
                      <option key={v} value={v}>
                        DUPR {v.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-primary" />
                Khuyến nghị: Chênh lệch DUPR không quá 0.5 để trận đấu cân sức.
              </p>
              {!isDuprValid && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> DUPR tối thiểu phải nhỏ hơn hoặc bằng DUPR tối đa.
                </p>
              )}
            </div>

            {/* 2. Thể thức */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                2. Thể thức & Số lượng người chơi:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('doubles')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    format === 'doubles'
                      ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">Đánh Đôi (Doubles)</p>
                  <p className="text-xs text-muted-foreground">Mở 4 chỗ cho người chơi</p>
                  </div>
                  {format === 'doubles' && <Check className="w-4 h-4 text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('singles')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    format === 'singles'
                      ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">Đánh Đơn (Singles)</p>
                  <p className="text-xs text-muted-foreground">Mở 2 chỗ cho người chơi</p>
                  </div>
                  {format === 'singles' && <Check className="w-4 h-4 text-primary" />}
                </button>
              </div>
            </div>

            {/* 3. Mức phí tham gia */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-foreground">
                  3. Mức phí tham gia mỗi người:
                </label>
                <span className="text-xs font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entryFee)}
                </span>
              </div>
              <input
                type="number"
                step="5000"
                min="20000"
                max="300000"
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Gợi ý: Giá sân 180.000đ/90 phút chia 4 người = 45.000đ + 5.000đ phụ phí bóng = 50.000đ/người.
              </p>
              {!isFeeValid && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> Phí tham gia phải từ 20.000đ đến 300.000đ.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs">
              <div>
                <p className="text-muted-foreground">Số chỗ mở</p>
                <p className="mt-1 font-bold text-foreground">{capacity} người</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tổng thu dự kiến</p>
                <p className="mt-1 font-bold text-foreground">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(estimatedRevenue)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Chênh lệch dự kiến</p>
                <p className={`mt-1 font-bold ${estimatedDifference >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {estimatedDifference >= 0 ? '+' : ''}
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(estimatedDifference)}
                </p>
              </div>
            </div>

            {/* 4. Tiện ích */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                4. Tiện ích & Cơ sở vật chất kèm theo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableAmenities.map((item) => {
                  const isChecked = amenities.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors ${
                        isChecked
                          ? 'border-primary/50 bg-primary/5 text-foreground font-medium'
                          : 'border-border/60 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Ghi chú */}
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                5. Ghi chú cho người tham gia (Tùy chọn):
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Mang giày đế bằng bám sân, đến trước 10 phút khởi động..."
                className="w-full rounded-lg border border-border bg-background p-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closePublishModal}
              className="active:scale-[0.98]"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handlePublish}
              disabled={!isFormValid}
              className="gap-2 shadow-md active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" /> Xác nhận Công bố Kèo ngay
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
