import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
  DollarSign,
  UserCheck,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrTicket } from '@/components/ui/qr-ticket'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const MatchDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    matches,
    selectedMatchId,
    currentUser,
    joinMatchRoom,
    cancelMatchHold,
    showToast,
  } = useFitlyoStore()

  const match = matches.find((m) => m.id === selectedMatchId) || matches[0]
  const [showCancelModal, setShowCancelModal] = useState(false)

  const isUserJoined = match.participants.some(
    (p) => p.id === currentUser.id || p.isCurrentUser
  )
  const isFull = match.currentPlayers >= match.maxPlayers

  const handleDepositClick = () => {
    if (isUserJoined) {
      showToast('Bạn đã cọc slot và giữ chỗ trong phòng này rồi!', 'info')
      return
    }
    joinMatchRoom(match.id)
  }

  const handleConfirmCancel = () => {
    cancelMatchHold(match.id)
    setShowCancelModal(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/matches')}
            className="rounded-xl border hover:bg-muted active:scale-[0.98]"
            title="Quay lại bảng tin"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[11px]">
                SCR_MATCH_02
              </Badge>
              <span className="font-mono text-xs font-bold text-muted-foreground">
                #{match.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Chi Tiết Phòng Đấu & Vé Check-in
            </h1>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast('Đã sao chép link phòng đấu vào bộ nhớ tạm!', 'info')}
          className="gap-1.5 active:scale-[0.98]"
        >
          <Share2 className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">Chia sẻ kèo</span>
        </Button>
      </div>

      {/* Main Court & Match Information Card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="default" className="text-xs mb-2 font-bold">
              ⭐ Yêu cầu trình độ: DUPR {match.targetDuprMin} - {match.targetDuprMax}
            </Badge>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {match.title}
            </h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
              isFull
                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
            }`}
          >
            {isFull ? '● ĐÃ ĐỦ NGƯỜI (FULL)' : '● ĐANG MỞ (OPEN)'}
          </span>
        </div>

        {/* Location & Time info list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Địa điểm & Cụm sân
            </span>
            <p className="font-semibold text-foreground">{match.courtName}</p>
            <p className="text-xs text-muted-foreground">{match.courtSubName} • Mặt sân {match.surfaceType}</p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline pt-1"
            >
              <span>{match.address}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-primary" /> Khung giờ 90 phút
            </span>
            <p className="font-semibold text-foreground">
              Slot {match.slotNumber}: {match.timeRange}
            </p>
            <p className="text-xs text-muted-foreground">{match.dateStr}</p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
              Thể thức: {match.format === 'doubles' ? 'Đánh Đôi (4 người)' : 'Đánh Đơn (2 người)'}
            </p>
          </div>
        </div>

        {/* Amenities pill tags */}
        <div className="pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground font-medium block mb-2">
            Tiện ích cung cấp tại sân:
          </span>
          <div className="flex flex-wrap gap-2">
            {match.amenities.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Participants List Section */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>Danh Sách Người Chơi ({match.currentPlayers}/{match.maxPlayers})</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            {isFull ? 'Phòng đã chốt danh sách' : `Còn ${match.maxPlayers - match.currentPlayers} chỗ trống`}
          </span>
        </div>

        <div className="space-y-3">
          {match.participants.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                player.isCurrentUser
                  ? 'border-primary/40 bg-primary/5 shadow-xs'
                  : 'border-border/60 bg-muted/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">
                  {index + 1}.
                </span>
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{player.name}</h4>
                    {player.isHost && (
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-bold">
                        Host
                      </span>
                    )}
                    {player.isCurrentUser && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold">
                        Bạn
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>
                      DUPR: <b className="text-foreground">{player.dupr}</b>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ⭐️ Uy tín: {player.reputationScore}%
                    </span>
                  </div>
                </div>
              </div>

              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Đã cọc slot
              </Badge>
            </div>
          ))}

          {/* Pending Slots */}
          {Array.from({ length: match.maxPlayers - match.currentPlayers }).map(
            (_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-muted-foreground"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    {match.currentPlayers + idx + 1}.
                  </span>
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Đang chờ 1 người chơi nữa tham gia...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bấm nút cọc slot bên dưới để tham gia ngay phòng này
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Trống slot
                </Badge>
              </div>
            )
          )}
        </div>
      </div>

      {/* QR Code Check-in Section: Only shown when FULL */}
      {isFull ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Vé Điện Tử Check-in Tại Sân (Trạng Thái FULL)</span>
            </h3>
            <span className="text-xs text-emerald-600 font-semibold">
              Kích hoạt tự động
            </span>
          </div>

          <QrTicket
            ticketCode={match.qrToken || 'PKB-1310-8849'}
            venueName={match.courtName}
            courtName={match.courtSubName}
            slotNumber={match.slotNumber}
            timeRange={match.timeRange}
            dateStr={match.dateStr}
            duprRange={`DUPR ${match.targetDuprMin} - ${match.targetDuprMax}`}
            format={match.format === 'doubles' ? 'Đánh Đôi (4 người)' : 'Đánh Đơn (2 người)'}
            playerName={currentUser.name}
            depositAmount={match.depositFee}
            onShare={() => showToast('Đã tạo liên kết chia sẻ vé QR!', 'info')}
          />
        </div>
      ) : (
        /* Waiting Alert Box when not full */
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 sm:p-5 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-bold text-foreground">
              Phòng đang chờ đủ 4 người để phát sinh Vé QR Check-in
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Ngay khi người chơi cuối cùng bấm cọc slot thành công, hệ thống sẽ tự động kích hoạt mã QR check-in và gửi thông báo đẩy đến điện thoại của toàn bộ 4 thành viên.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Breakdown & Policies */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 text-xs sm:text-sm">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span>Chi Phí & Chính Sách Hoàn Cọc</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="rounded-xl bg-muted/40 p-3 space-y-1">
            <span className="text-xs text-muted-foreground">Mức phí cọc slot 90 phút:</span>
            <p className="text-base font-bold text-primary">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(match.depositFee)}
              <span className="text-xs text-muted-foreground font-normal"> / người</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Đã bao gồm tiền thuê sân + 2 quả bóng tiêu chuẩn thi đấu.
            </p>
          </div>

          <div className="rounded-xl bg-muted/40 p-3 space-y-1">
            <span className="text-xs text-muted-foreground">Quy định hủy slot & hoàn cọc:</span>
            <p className="text-xs font-medium text-foreground">
              • <b>Hội viên Free:</b> Hủy trước $\ge 12$ tiếng hoàn 100% về ví.
            </p>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              • <b>Hội viên Premium:</b> Hủy trước $\ge 4$ tiếng vẫn hoàn 100%.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/90 px-4 py-3 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {isUserJoined ? (
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="text-xs sm:text-sm text-destructive border-destructive/40 hover:bg-destructive/10 active:scale-[0.98]"
            >
              Hủy Giữ Chỗ
            </Button>
          ) : (
            <div className="text-left">
              <span className="text-[11px] text-muted-foreground block">Tổng phí cọc:</span>
              <span className="text-base font-bold text-foreground">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(match.depositFee)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isUserJoined && (
              <Button
                onClick={handleDepositClick}
                disabled={isFull}
                className="gap-2 bg-primary text-primary-foreground font-bold shadow-md active:scale-[0.98] min-w-[180px]"
              >
                <Sparkles className="w-4 h-4" />
                {isFull ? 'PHÒNG ĐÃ ĐỦ NGƯỜI' : 'XÁC NHẬN CỌC SLOT'}
              </Button>
            )}

            {isUserJoined && !isFull && (
              <Button
                onClick={() => joinMatchRoom(match.id)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                Mô phỏng Thêm Người Chơi 4/4
              </Button>
            )}

            {isUserJoined && isFull && (
              <Button
                onClick={() => showToast('Mã vé QR đã được lưu vào Lịch của bạn!', 'success')}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Vé Đã Kích Hoạt (Check-in Ngay)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Cancellation Dialog */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-foreground">
                  Xác nhận Hủy giữ chỗ phòng đấu?
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {currentUser.isPremium
                    ? 'Bạn là Hội viên FITLYO Premium: Hủy slot trước 4 tiếng sẽ được hoàn 100% tiền cọc về ví ngay lập tức.'
                    : 'Theo quy định, hủy slot trước 12 tiếng sẽ được hoàn 100% tiền cọc. Nếu hủy sát giờ, tiền cọc sẽ chuyển cho chủ sân.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Giữ lại chỗ
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                className="active:scale-[0.98]"
              >
                Xác nhận Hủy phòng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
