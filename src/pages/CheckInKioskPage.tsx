import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Expand,
  History,
  Keyboard,
  MapPin,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CheckInTicket, TicketScenario } from '@/types/pickleball'

type ResultTone = 'success' | 'warning' | 'error'

const ticketSamples: Array<{ code: string; label: string; tone: ResultTone }> = [
  { code: 'PKB-1310-8849', label: 'Vé hợp lệ', tone: 'success' },
  { code: 'PKB-1310-7721', label: 'Đã check-in', tone: 'warning' },
  { code: 'PKB-1310-4404', label: 'Sai cụm sân', tone: 'error' },
  { code: 'PKB-1310-0650', label: 'Đến quá sớm', tone: 'warning' },
]

const statusContent: Record<TicketScenario, { title: string; description: string; tone: ResultTone }> = {
  VALID: {
    title: 'Vé hợp lệ · Đủ điều kiện vào sân',
    description: 'Thông tin vé trùng khớp với cụm sân và khung giờ hiện tại.',
    tone: 'success',
  },
  ALREADY_CHECKED_IN: {
    title: 'Vé đã được check-in trước đó',
    description: 'Không thể sử dụng lại vé. Hãy kiểm tra thời gian xác nhận bên dưới.',
    tone: 'warning',
  },
  WRONG_VENUE: {
    title: 'Vé không thuộc cụm sân này',
    description: 'Vui lòng hướng dẫn khách đến đúng địa điểm ghi trên vé.',
    tone: 'error',
  },
  WRONG_TIME: {
    title: 'Vé hợp lệ nhưng chưa đến giờ',
    description: 'Khách đến sớm hơn 45 phút. Vui lòng mời khách chờ đến khung giờ đã đặt.',
    tone: 'warning',
  },
}

const toneClasses: Record<ResultTone, { border: string; panel: string; text: string; icon: React.ElementType }> = {
  success: {
    border: 'border-emerald-500/40',
    panel: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  warning: {
    border: 'border-amber-500/40',
    panel: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    icon: AlertTriangle,
  },
  error: {
    border: 'border-red-500/40',
    panel: 'bg-red-500/10',
    text: 'text-red-700 dark:text-red-300',
    icon: XCircle,
  },
}

const normalizeTicketCode = (value: string) => value.trim().toUpperCase()

function CameraViewfinder({
  isScanning,
  onScan,
}: {
  isScanning: boolean
  onScan: () => void
}) {
  return (
    <button
      type="button"
      onClick={onScan}
      className="group relative min-h-[360px] w-full overflow-hidden rounded-3xl border border-emerald-400/25 bg-slate-950 text-white shadow-2xl outline-none transition hover:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/60"
      aria-label="Mô phỏng quét mã QR đang chọn"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
        <span className={`h-2 w-2 rounded-full ${isScanning ? 'animate-pulse bg-amber-400' : 'animate-pulse bg-red-500'}`} />
        {isScanning ? 'Đang nhận diện mã...' : 'Camera mô phỏng · Live'}
      </div>
      <Camera className="absolute right-5 top-5 h-5 w-5 text-white/45" />

      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 sm:h-64 sm:w-64">
        <span className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-emerald-400" />
        <span className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-emerald-400" />
        <span className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-emerald-400" />
        <span className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-emerald-400" />
        <div className={`absolute inset-x-5 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_16px_3px_rgba(52,211,153,0.7)] ${isScanning ? 'kiosk-scan-line' : 'top-1/2 opacity-50'}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <QrCode className={`h-20 w-20 transition ${isScanning ? 'animate-pulse text-emerald-300' : 'text-white/30 group-hover:text-white/45'}`} strokeWidth={1.25} />
          <p className="mt-3 text-xs font-semibold text-white/70">Đưa mã QR vào vùng quét</p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex justify-center">
        <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-sm transition group-hover:bg-white/15">
          {isScanning ? 'Đang đối soát...' : 'Chạm hoặc nhấn Space để quét mã mẫu'}
        </span>
      </div>
    </button>
  )
}

function EmptyResult() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <ShieldCheck className="h-10 w-10" />
      </div>
      <h2 className="mt-5 text-xl font-black">Sẵn sàng đối soát vé</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Chọn một mã mẫu rồi quét qua camera mô phỏng, hoặc nhập mã vé thủ công để xem kết quả.
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
        <Keyboard className="h-4 w-4" /> Phím tắt: Space để quét · Esc để đặt lại
      </div>
    </div>
  )
}

function TicketResult({
  ticket,
  entryConfirmed,
  onConfirm,
  onOpenDoor,
  onReset,
}: {
  ticket: CheckInTicket
  entryConfirmed: boolean
  onConfirm: () => void
  onOpenDoor: () => void
  onReset: () => void
}) {
  const originalStatus = entryConfirmed ? 'VALID' : ticket.scenario
  const content = entryConfirmed
    ? {
        title: 'Đã xác nhận khách vào sân',
        description: 'Vé đã chuyển sang CHECKED_IN và nhật ký quầy đã được cập nhật.',
        tone: 'success' as const,
      }
    : statusContent[originalStatus]
  const visual = toneClasses[content.tone]
  const StatusIcon = visual.icon
  const holder = ticket.participants.find((participant) => participant.id === ticket.holderId)
  const checkedInCount = ticket.participants.filter((participant) => participant.checkedInAt).length

  return (
    <div className={`overflow-hidden rounded-3xl border bg-card shadow-sm ${visual.border}`}>
      <div className={`flex items-start gap-3 border-b p-5 ${visual.panel} ${visual.border}`}>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm ${visual.text}`}>
          <StatusIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${visual.text}`}>Kết quả đối soát vé điện tử</p>
          <h2 className="mt-0.5 text-lg font-black text-foreground">{content.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{content.description}</p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mã vé</p>
            <p className="font-mono text-lg font-black tracking-wider">{ticket.code}</p>
          </div>
          <Badge variant="outline" className={`${visual.border} ${visual.panel} ${visual.text}`}>
            {entryConfirmed ? 'CHECKED_IN' : ticket.scenario}
          </Badge>
        </div>

        <div className="grid gap-3 rounded-2xl bg-muted/35 p-4 text-xs sm:grid-cols-2">
          <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /><span><span className="block text-muted-foreground">Cụm sân / Sân</span><b>{ticket.venueName} · {ticket.courtName}</b></span></div>
          <div className="flex gap-2"><Clock3 className="h-4 w-4 shrink-0 text-primary" /><span><span className="block text-muted-foreground">Thời gian</span><b>Slot {ticket.slotNumber} · {ticket.timeRange}</b><span className="mt-0.5 block text-[10px] text-muted-foreground">{ticket.dateStr}</span></span></div>
          <div className="flex gap-2"><Users className="h-4 w-4 shrink-0 text-primary" /><span><span className="block text-muted-foreground">Thể thức</span><b>{ticket.matchLabel} · {ticket.duprRange}</b></span></div>
          <div className="flex gap-2"><UserCheck className="h-4 w-4 shrink-0 text-primary" /><span><span className="block text-muted-foreground">Người xuất trình vé</span><b>{holder?.name ?? 'Không xác định'}</b>{ticket.scenario === 'ALREADY_CHECKED_IN' && holder?.checkedInAt && <span className="block text-[10px] text-amber-600">Đã vào lúc {holder.checkedInAt}</span>}</span></div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider">Người chơi trong phòng</h3>
            <span className="text-xs font-bold text-primary">{checkedInCount}/{ticket.participants.length} đã vào</span>
          </div>
          <div className="space-y-2">
            {ticket.participants.map((participant) => {
              const isHolder = participant.id === ticket.holderId
              const isCheckedIn = Boolean(participant.checkedInAt) || (entryConfirmed && isHolder)
              return (
                <div key={participant.id} className={`flex items-center gap-3 rounded-xl border p-2.5 ${isHolder ? 'border-primary/30 bg-primary/5' : 'bg-background'}`}>
                  <img src={participant.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{participant.name} {participant.role && <span className="font-medium text-muted-foreground">({participant.role})</span>}</p>
                    <p className="text-[10px] text-muted-foreground">{isHolder ? 'Đang xuất trình vé' : isCheckedIn ? `Check-in ${participant.checkedInAt}` : 'Chưa đến sân'}</p>
                  </div>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isCheckedIn ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {isCheckedIn ? <Check className="h-4 w-4" /> : <Clock3 className="h-3.5 w-3.5" />}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {ticket.scenario === 'VALID' && !entryConfirmed ? (
          <div className="grid gap-2 border-t pt-4 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={onOpenDoor} className="h-11"><DoorOpen className="h-4 w-4" /> Mô phỏng mở cửa {ticket.courtName}</Button>
            <Button type="button" onClick={onConfirm} className="h-11 bg-emerald-600 font-bold text-white hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4" /> Xác nhận vào sân</Button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={onReset} className="w-full"><RotateCcw className="h-4 w-4" /> Quét vé tiếp theo</Button>
        )}
      </div>
    </div>
  )
}

export const CheckInKioskPage: React.FC = () => {
  const { checkInTickets, checkInLogs, confirmTicketCheckIn, showToast } = useFitlyoStore()
  const [manualCode, setManualCode] = useState('PKB-1310-8849')
  const [selectedSampleCode, setSelectedSampleCode] = useState('PKB-1310-8849')
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null)
  const [invalidCode, setInvalidCode] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [entryConfirmed, setEntryConfirmed] = useState(false)
  const timerRef = useRef<number | null>(null)
  const scanningRef = useRef(false)

  const verifiedTicket = useMemo(
    () => checkInTickets.find((ticket) => ticket.code === verifiedCode) ?? null,
    [checkInTickets, verifiedCode],
  )

  const playTone = useCallback((tone: ResultTone) => {
    if (!audioEnabled) return
    try {
      const AudioContextConstructor = window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextConstructor) return
      const context = new AudioContextConstructor()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = tone === 'success' ? 1200 : tone === 'warning' ? 700 : 400
      gain.gain.setValueAtTime(0.08, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.14)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.14)
      window.setTimeout(() => void context.close(), 220)
    } catch {
      // Audio feedback is optional in the prototype and may be blocked by the browser.
    }
  }, [audioEnabled])

  const verifyCode = useCallback((rawCode: string) => {
    const code = normalizeTicketCode(rawCode)
    if (!code || scanningRef.current) return
    if (timerRef.current) window.clearTimeout(timerRef.current)
    scanningRef.current = true
    setManualCode(code)
    setEntryConfirmed(false)
    setInvalidCode(null)
    setVerifiedCode(null)
    setIsScanning(true)

    timerRef.current = window.setTimeout(() => {
      const ticket = useFitlyoStore.getState().checkInTickets.find((item) => item.code === code)
      scanningRef.current = false
      setIsScanning(false)
      if (!ticket) {
        setInvalidCode(code)
        playTone('error')
        return
      }
      setVerifiedCode(ticket.code)
      playTone(statusContent[ticket.scenario].tone)
    }, 700)
  }, [playTone])

  const resetScanner = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    scanningRef.current = false
    setIsScanning(false)
    setVerifiedCode(null)
    setInvalidCode(null)
    setEntryConfirmed(false)
  }, [])

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'
      if (event.code === 'Space' && !isTyping) {
        event.preventDefault()
        verifyCode(selectedSampleCode)
      }
      if (event.key === 'Escape') resetScanner()
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => {
      window.removeEventListener('keydown', handleKeyboard)
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [resetScanner, selectedSampleCode, verifyCode])

  const handleConfirm = () => {
    if (!verifiedTicket) return
    const success = confirmTicketCheckIn(verifiedTicket.code)
    if (success) {
      setEntryConfirmed(true)
      playTone('success')
    }
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      showToast('Trình duyệt không cho phép bật toàn màn hình trong ngữ cảnh hiện tại.', 'info')
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-xs" withDot pulseDot>SCR_FM_07</Badge>
            <span className="text-xs font-semibold text-muted-foreground">Kiosk quầy tiếp đón · D-Sports Thủ Đức</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Quét QR & xác thực check-in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mô phỏng luồng vận hành đối soát vé trong dưới 3 giây.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setAudioEnabled((enabled) => !enabled)} className="gap-2">
            {audioEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4" />}
            Âm thanh: {audioEnabled ? 'Bật' : 'Tắt'}
          </Button>
          <Button type="button" variant="outline" onClick={toggleFullscreen}><Expand className="h-4 w-4" /> Toàn màn hình</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
        <div className="space-y-4">
          <CameraViewfinder isScanning={isScanning} onScan={() => verifyCode(selectedSampleCode)} />

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">Nhập mã thủ công</h2>
                <p className="text-[11px] text-muted-foreground">Dùng khi mã trên điện thoại khó quét.</p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">PKB-XXXX-XXXX</Badge>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); verifyCode(manualCode) }} className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={manualCode} onChange={(event) => setManualCode(event.target.value.toUpperCase())} className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 font-mono text-sm font-bold tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="PKB-1310-8849" />
              </div>
              <Button type="submit" disabled={isScanning} className="h-11 px-6"><Search className="h-4 w-4" /> Đối soát mã</Button>
            </form>
          </div>

          <div className="rounded-2xl border bg-muted/25 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold"><Sparkles className="h-4 w-4 text-primary" /> Kịch bản mã mẫu</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ticketSamples.map((sample) => (
                <button
                  type="button"
                  key={sample.code}
                  onClick={() => { setSelectedSampleCode(sample.code); setManualCode(sample.code) }}
                  className={`flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-left transition ${selectedSampleCode === sample.code ? 'border-primary ring-1 ring-primary/25' : 'hover:bg-muted'}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${sample.tone === 'success' ? 'bg-emerald-500' : sample.tone === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="min-w-0"><span className="block truncate font-mono text-[11px] font-bold">{sample.code}</span><span className="block text-[10px] text-muted-foreground">{sample.label}</span></span>
                  {selectedSampleCode === sample.code && <Check className="ml-auto h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          {isScanning ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border bg-card p-8 text-center shadow-sm">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="absolute inset-0 animate-ping rounded-full border border-primary/30" />
                <QrCode className="h-9 w-9 animate-pulse" />
              </div>
              <h2 className="mt-5 text-xl font-black">Đang đối soát mã vé...</h2>
              <p className="mt-2 font-mono text-sm font-bold tracking-wider text-primary">{manualCode}</p>
              <p className="mt-2 text-xs text-muted-foreground">Kiểm tra địa điểm, khung giờ và trạng thái sử dụng vé.</p>
            </div>
          ) : verifiedTicket ? (
            <TicketResult ticket={verifiedTicket} entryConfirmed={entryConfirmed} onConfirm={handleConfirm} onOpenDoor={() => showToast(`Đã mô phỏng gửi lệnh mở cửa ${verifiedTicket.courtName}.`, 'success')} onReset={resetScanner} />
          ) : invalidCode ? (
            <div className="overflow-hidden rounded-3xl border border-red-500/40 bg-card shadow-sm">
              <div className="bg-red-500/10 p-6 text-center">
                <XCircle className="mx-auto h-14 w-14 text-red-600" />
                <h2 className="mt-3 text-xl font-black text-red-700 dark:text-red-300">Vé không hợp lệ</h2>
                <p className="mt-1 text-xs text-muted-foreground">Không tìm thấy mã vé trong hệ thống D-Sports.</p>
              </div>
              <div className="space-y-4 p-6 text-center">
                <p className="font-mono text-lg font-black tracking-wider">{invalidCode}</p>
                <p className="text-xs text-muted-foreground">Kiểm tra lại ký tự trên vé hoặc liên hệ quản lý ca để hỗ trợ.</p>
                <Button type="button" variant="outline" onClick={resetScanner} className="w-full"><RotateCcw className="h-4 w-4" /> Thử mã khác</Button>
              </div>
            </div>
          ) : <EmptyResult />}
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold"><History className="h-4 w-4 text-primary" /> Nhật ký vào sân vừa qua</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Cập nhật tức thì sau mỗi lần xác nhận.</p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600"><BellRing className="h-3.5 w-3.5" /> Live</span>
        </div>
        <div className="grid gap-2 lg:grid-cols-2">
          {checkInLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 rounded-xl border bg-background p-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${log.tone === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}><UserCheck className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1"><p className="text-xs font-bold">{log.time} · {log.courtName}</p><p className="truncate text-[11px] text-muted-foreground">{log.description}</p></div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CheckInKioskPage
