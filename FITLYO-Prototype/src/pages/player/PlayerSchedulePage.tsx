import { CalendarDays, CheckCircle2, ChevronRight, Clock3, GraduationCap, History, MapPin, QrCode, Sparkles, Trophy, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerPageHeader } from '@/components/player/PlayerPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { PlayerScheduleItem } from '@/types/player'

const kindMeta = {
  MATCH: { label: 'KÈO SOCIAL DUPR', icon: Trophy, tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  COURSE: { label: 'LỚP HỌC HLV', icon: GraduationCap, tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  COURT: { label: 'ĐẶT BAO SÂN', icon: CalendarDays, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
}

export function PlayerSchedulePage() {
  const navigate = useNavigate()
  const schedule = usePlayerStore((state) => state.schedule)
  const matches = usePlayerStore((state) => state.matches)
  const reviewedIds = usePlayerStore((state) => state.reviewedMatchIds)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [tab, setTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING')
  const items = schedule.filter((item) => tab === 'UPCOMING' ? item.status === 'UPCOMING' : item.status !== 'UPCOMING')

  const primaryAction = (item: PlayerScheduleItem) => {
    if (item.ticketCode && item.matchId) return navigate(`/player/matches/${item.matchId}/ticket`)
    if (item.kind === 'COURSE') return showToast('Vé QR buổi học đã được mở trong prototype.', 'info')
    if (item.kind === 'COURT') return showToast('Mã đặt sân đã được sao chép.', 'success')
    if (item.status === 'COMPLETED' && item.matchId && matches.some((match) => match.id === item.matchId) && !reviewedIds.includes(item.matchId)) return navigate(`/player/matches/${item.matchId}/review`)
    showToast('Chi tiết hoạt động đã được hiển thị đầy đủ trên thẻ.', 'info')
  }

  return (
    <div className="space-y-7 pb-10">
      <PlayerPageHeader eyebrow="SCR_USER_03 · My Schedule" title="Lịch của tôi" description="Một nơi để quản lý kèo Social, lịch học HLV, vé QR và các lượt đặt sân." icon={CalendarDays} action={<Button onClick={() => navigate('/player/matches')} className="gap-2 rounded-xl"><Sparkles className="h-4 w-4" /> Tìm thêm kèo</Button>} />

      <div className="flex rounded-2xl border border-border bg-card p-1.5 sm:w-fit"><button type="button" onClick={() => setTab('UPCOMING')} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition', tab === 'UPCOMING' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><Clock3 className="h-4 w-4" />Sắp diễn ra <Badge className={cn('border-0', tab === 'UPCOMING' ? 'bg-white/15 text-white' : '')}>{schedule.filter((item) => item.status === 'UPCOMING').length}</Badge></button><button type="button" onClick={() => setTab('HISTORY')} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition', tab === 'HISTORY' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><History className="h-4 w-4" />Lịch sử <Badge className={cn('border-0', tab === 'HISTORY' ? 'bg-white/15 text-white' : '')}>{schedule.filter((item) => item.status !== 'UPCOMING').length}</Badge></button></div>

      <div className="space-y-4">{items.length ? items.map((item) => { const meta = kindMeta[item.kind]; const Icon = meta.icon; const reviewed = item.matchId ? reviewedIds.includes(item.matchId) : false; return <article key={item.id} className={cn('overflow-hidden rounded-[1.65rem] border bg-card shadow-sm', item.status === 'CANCELLED' ? 'border-destructive/20 opacity-75' : 'border-border/70')}><div className="grid md:grid-cols-[170px_1fr_auto]"><div className={cn('flex flex-row items-center gap-3 p-5 md:flex-col md:items-start md:justify-center md:border-r md:border-border/60', meta.tone)}><Icon className="h-6 w-6" /><div><p className="text-[10px] font-black uppercase tracking-wider">{meta.label}</p><p className="mt-1 text-sm font-black">{item.dateLabel}</p><p className="text-xs font-semibold">{item.timeRange}</p></div></div><div className="p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2">{item.status === 'UPCOMING' && <Badge className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">SẮP DIỄN RA</Badge>}{item.status === 'COMPLETED' && <Badge variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />ĐÃ HOÀN TẤT</Badge>}{item.status === 'CANCELLED' && <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />ĐÃ HỦY</Badge>}{item.progress && <Badge variant="outline">{item.progress}</Badge>}</div><h2 className="mt-3 text-lg font-black">{item.title}</h2><p className="mt-1 text-sm font-semibold text-primary">{item.subtitle}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{item.venueName} · {item.courtName}</span>{item.coachName && <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-primary" />{item.coachName}</span>}</div></div><div className="flex items-center border-t border-border/60 p-4 md:border-l md:border-t-0"><Button onClick={() => primaryAction(item)} variant={item.status === 'UPCOMING' ? 'default' : 'outline'} className="w-full gap-2 rounded-xl whitespace-nowrap">{item.ticketCode ? <QrCode className="h-4 w-4" /> : null}{item.status === 'UPCOMING' ? item.ticketCode ? 'Mở vé QR' : 'Xem chi tiết' : item.status === 'COMPLETED' && item.matchId && !reviewed ? 'Đánh giá trận' : 'Xem lại'}<ChevronRight className="h-4 w-4" /></Button></div></div></article> }) : <div className="rounded-[2rem] border border-dashed border-primary/25 bg-secondary/15 py-16 text-center"><CalendarDays className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-xl font-black">Chưa có hoạt động</h2><p className="mt-2 text-sm text-muted-foreground">Các lượt đặt sân, kèo và buổi học sẽ xuất hiện tại đây.</p><Button onClick={() => navigate('/player/matches')} className="mt-5">Tìm kèo ngay</Button></div>}</div>
    </div>
  )
}
