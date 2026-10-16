import React from 'react'
import { Clock, CheckCircle2, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SlotCardProps {
  timeRange: string
  courtName: string
  price: number
  status: 'available' | 'selected' | 'reserved' | 'peak'
  slotNumber?: number
  note?: string
  onSelect?: () => void
  className?: string
}

export const SlotCard: React.FC<SlotCardProps> = ({
  timeRange,
  courtName,
  price,
  status,
  slotNumber,
  note,
  onSelect,
  className,
}) => {
  const isSelected = status === 'selected'
  const isReserved = status === 'reserved'
  const isPeak = status === 'peak'

  return (
    <button
      type="button"
      disabled={isReserved}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col justify-between w-full text-left rounded-xl p-4 border transition-all duration-200 outline-none",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-1 shadow-sm"
          : isReserved
          ? "border-border/40 bg-muted/50 opacity-60 cursor-not-allowed"
          : "border-border/60 bg-card hover:border-primary/50 hover:shadow-md active:scale-[0.98]",
        className
      )}
    >
      {/* Huy hiệu giờ cao điểm nếu có */}
      {isPeak && !isReserved && (
        <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent text-accent-foreground shadow-xs">
          <Flame className="w-3 h-3 animate-pulse" /> Giờ Vàng
        </span>
      )}

      {/* Thông tin giờ và sân */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
          <Clock className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
          <span>{slotNumber ? `Slot ${slotNumber}: ${timeRange}` : timeRange}</span>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in-50 duration-200 shrink-0" />
        )}
      </div>

      <div className="text-xs text-muted-foreground mb-3">
        {courtName} {note ? `• ${note}` : '• Chuẩn thi đấu Pickleball'}
      </div>

      {/* Giá tiền và trạng thái */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs sm:text-sm">
        <span className="font-bold text-foreground">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </span>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-md transition-colors",
            isReserved
              ? "bg-muted text-muted-foreground"
              : isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground"
          )}
        >
          {isReserved ? 'Đã kín lịch' : isSelected ? 'Đang chọn' : 'Đặt ngay'}
        </span>
      </div>
    </button>
  )
}
