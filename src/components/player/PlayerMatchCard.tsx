import { ArrowRight, Bookmark, CalendarDays, Clock3, MapPin, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { PlayerMatch } from '@/types/player'

interface PlayerMatchCardProps {
  match: PlayerMatch
  featured?: boolean
}

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function PlayerMatchCard({ match, featured = false }: PlayerMatchCardProps) {
  const navigate = useNavigate()
  const showToast = useFitlyoStore((state) => state.showToast)
  const profile = usePlayerStore((state) => state.profile)
  const [saved, setSaved] = useState(false)
  const joined = match.participants.some((person) => person.id === profile.id)
  const remaining = Math.max(0, match.maxPlayers - match.participants.length)

  const toggleSaved = () => {
    setSaved((value) => !value)
    showToast(saved ? 'Đã bỏ khỏi danh sách lưu.' : 'Đã lưu buổi chơi để xem sau.', 'success')
  }

  return (
    <article className={cn(
      'fitlyo-elevated fitlyo-interactive group grid h-full overflow-hidden rounded-[1.65rem] sm:grid-cols-[minmax(180px,0.82fr)_minmax(0,1.18fr)]',
      featured && 'lg:grid-cols-[minmax(280px,0.92fr)_minmax(0,1.08fr)]',
    )}>
      <div className="relative min-h-56 overflow-hidden bg-muted sm:min-h-full">
        <img src={match.imageUrl} alt={match.venueName} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#143F42]/45 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className={cn('border-0 text-[9px] font-black', match.isPeak ? 'bg-accent text-accent-foreground' : 'bg-secondary text-[#143F42]')}>{match.label}</Badge>
          {joined && <Badge className="border-0 bg-white/90 text-[#143F42]">ĐÃ THAM GIA</Badge>}
        </div>
      </div>

      <div className="flex min-w-0 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-xl font-black tracking-[-0.035em] text-foreground">{match.title}</h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-primary" /> <span className="truncate">{match.venueName} · {match.area}</span></p>
          </div>
          <button type="button" onClick={toggleSaved} aria-label={saved ? 'Bỏ lưu' : 'Lưu buổi chơi'} className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition', saved ? 'border-primary bg-secondary text-primary' : 'border-border bg-background text-muted-foreground hover:text-primary')}><Bookmark className={cn('h-4 w-4', saved && 'fill-current')} /></button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {match.dateLabel}</p>
          <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> {match.timeRange} · Slot {match.slotNumber}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-secondary/55 px-3 py-1.5 text-primary">DUPR {match.duprMin}–{match.duprMax}</span>
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-foreground"><UsersRound className="h-3.5 w-3.5" /> {match.participants.length}/{match.maxPlayers} Player · {remaining ? `Còn ${remaining} chỗ` : 'Đã đủ người'}</span>
          {match.isPeak && <span className="rounded-full bg-accent/65 px-3 py-1.5 text-accent-foreground">Cần duyệt</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/60 pt-4">
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phí tham gia</p><strong className="text-xl text-primary">{formatMoney(match.deposit)} <span className="text-xs font-medium text-muted-foreground">/ người</span></strong></div>
          <button type="button" onClick={() => navigate(`/player/matches/${match.id}`)} className="flex items-center gap-2 text-sm font-black text-primary transition hover:gap-3">{joined ? 'Mở vé' : 'Xem chi tiết'} <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  )
}
