import React, { useState } from 'react'
import { QrCode, Sparkles, CheckCircle2, Copy, ShieldCheck, Share2 } from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'

interface QrTicketProps {
  ticketCode: string
  venueName: string
  courtName: string
  slotNumber: number
  timeRange: string
  dateStr: string
  duprRange: string
  format: string
  playerName: string
  paidAmount: number
  onShare?: () => void
}

export const QrTicket: React.FC<QrTicketProps> = ({
  ticketCode,
  venueName,
  courtName,
  slotNumber,
  timeRange,
  dateStr,
  duprRange,
  format,
  playerName,
  paidAmount,
  onShare,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-card to-card/90 shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-white/20 p-1 backdrop-blur-xs">
            <QrCode className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase">
            VÉ ĐIỆN TỬ CHECK-IN SÂN
          </span>
        </div>
        <Badge variant="vip" className="bg-white/20 text-white border-white/30 text-[10px]">
          <ShieldCheck className="w-3 h-3 mr-1" /> ĐÃ XÁC THỰC
        </Badge>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Main Details */}
        <div className="space-y-1">
          <h4 className="font-bold text-lg text-foreground tracking-tight">
            {venueName}
          </h4>
          <p className="text-sm font-medium text-primary flex items-center gap-1.5">
            <span>{courtName}</span>
            <span>•</span>
            <span>Slot {slotNumber} ({timeRange})</span>
          </p>
          <p className="text-xs text-muted-foreground">{dateStr}</p>
        </div>

        {/* QR Section Container */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/80 p-5 backdrop-blur-xs text-center shadow-inner">
          {/* Animated decorative scan line */}
          <div className="relative p-3 bg-white rounded-xl shadow-md border">
            {/* SVG Simulated high quality QR */}
            <svg
              className="w-40 h-40 sm:w-48 sm:h-48 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner 1 */}
              <rect x="5" y="5" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="9" y="9" width="18" height="18" fill="white" />
              <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#0f172a" />
              {/* Corner 2 */}
              <rect x="69" y="5" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="73" y="9" width="18" height="18" fill="white" />
              <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#0f172a" />
              {/* Corner 3 */}
              <rect x="5" y="69" width="26" height="26" rx="3" fill="#0f172a" />
              <rect x="9" y="73" width="18" height="18" fill="white" />
              <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#0f172a" />
              {/* Pattern Blocks */}
              <rect x="36" y="8" width="6" height="14" fill="#0f172a" />
              <rect x="47" y="8" width="14" height="6" fill="#0f172a" />
              <rect x="47" y="18" width="8" height="8" fill="#0f172a" />
              <rect x="8" y="37" width="12" height="6" fill="#0f172a" />
              <rect x="8" y="47" width="6" height="14" fill="#0f172a" />
              <rect x="25" y="37" width="6" height="12" fill="#0f172a" />
              <rect x="25" y="53" width="8" height="6" fill="#0f172a" />
              {/* Center Pickleball icon silhouette in QR */}
              <rect x="42" y="42" width="16" height="16" rx="4" fill="#10b981" />
              <circle cx="50" cy="50" r="4" fill="white" />
              {/* Random Data Elements */}
              <rect x="69" y="37" width="8" height="14" fill="#0f172a" />
              <rect x="83" y="42" width="10" height="8" fill="#0f172a" />
              <rect x="69" y="55" width="14" height="6" fill="#0f172a" />
              <rect x="37" y="69" width="8" height="8" fill="#0f172a" />
              <rect x="49" y="69" width="12" height="6" fill="#0f172a" />
              <rect x="37" y="81" width="16" height="10" fill="#0f172a" />
              <rect x="57" y="81" width="8" height="8" fill="#0f172a" />
              <rect x="69" y="69" width="8" height="18" fill="#0f172a" />
              <rect x="81" y="69" width="12" height="8" fill="#0f172a" />
              <rect x="81" y="81" width="8" height="12" fill="#0f172a" />
            </svg>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-foreground">
              {ticketCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Sao chép mã"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground max-w-xs">
            Xuất trình mã này cho nhân viên quầy cụm sân hoặc quét tại kiosk để check-in mở cửa sân.
          </p>
        </div>

        {/* Perforated ticket divider */}
        <div className="relative flex items-center justify-between -mx-5 sm:-mx-6 my-2">
          <div className="h-5 w-5 rounded-full bg-background border-r border-border" />
          <div className="flex-1 border-b-2 border-dashed border-border/80 mx-2" />
          <div className="h-5 w-5 rounded-full bg-background border-l border-border" />
        </div>

        {/* Match Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-3.5 rounded-xl border border-border/50">
          <div>
            <span className="text-muted-foreground">Người đặt vé:</span>
            <p className="font-semibold text-foreground truncate">{playerName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phí đã thanh toán:</span>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paidAmount)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Trình độ DUPR:</span>
            <p className="font-semibold text-foreground">{duprRange}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Thể thức:</span>
            <p className="font-semibold text-foreground">{format}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1 text-xs gap-1.5 active:scale-[0.98]"
            onClick={onShare}
          >
            <Share2 className="h-3.5 w-3.5" /> Chia sẻ vé
          </Button>
          <Button
            className="flex-1 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
            onClick={handleCopy}
          >
            <Sparkles className="h-3.5 w-3.5" /> {copied ? 'Đã sao chép!' : 'Lưu mã vé'}
          </Button>
        </div>
      </div>
    </div>
  )
}
