import { ArrowRight, Clock3, MapPin, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { PlayerMatch } from '@/types/player'

interface PlayerMatchCardProps {
  match: PlayerMatch
  featured?: boolean
}

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function PlayerMatchCard({ match, featured = false }: PlayerMatchCardProps) {
  const navigate = useNavigate()
  const profile = usePlayerStore((state) => state.profile)
  const joined = match.participants.some((person) => person.id === profile.id)
  const inRange = profile.dupr >= match.duprMin && profile.dupr <= match.duprMax
  const remaining = Math.max(0, match.maxPlayers - match.participants.length)

  return (
    <article className={cn(
      'group overflow-hidden rounded-[1.65rem] border bg-card shadow-[0_18px_50px_rgba(20,63,66,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_60px_rgba(20,63,66,0.1)]',
      featured ? 'grid lg:grid-cols-[0.9fr_1.1fr]' : 'flex h-full flex-col',
      match.isPeak ? 'border-amber-500/30' : 'border-border/70',
    )}>
      <div className={cn('relative overflow-hidden bg-muted', featured ? 'min-h-64 lg:min-h-full' : 'h-48')}>
        <img src={match.imageUrl} alt={match.venueName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#143F42]/65 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge className={cn('border-0 text-[10px] font-black', match.isPeak ? 'bg-amber-400 text-amber-950' : 'bg-secondary text-[#143F42]')}>
            {match.label}
          </Badge>
          {joined && <Badge className="border-0 bg-white/90 text-[#143F42]">ĐÃ GIỮ CHỖ</Badge>}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <p className="text-xs font-medium text-white/80">Cọc giữ chỗ</p>
            <p className="text-xl font-black">{formatMoney(match.deposit)}<span className="text-xs font-medium"> / người</span></p>
          </div>
          <span className="rounded-full bg-black/25 px-3 py-1.5 text-xs font-bold backdrop-blur-md">{remaining ? `Còn ${remaining} chỗ` : 'Đã đủ người'}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground sm:text-xl">{match.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {match.venueName} · {match.area}
            </p>
          </div>
          <Badge variant="outline" className={cn('shrink-0 font-bold', inRange ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300')}>
            DUPR {match.duprMin}–{match.duprMax}
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-muted/55 px-3 py-2.5">
            <Clock3 className="h-4 w-4 text-primary" />
            <span><b>{match.dateLabel}</b><br />{match.timeRange} · Slot {match.slotNumber}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted/55 px-3 py-2.5">
            <UsersRound className="h-4 w-4 text-primary" />
            <span><b>{match.format}</b><br />{match.participants.length}/{match.maxPlayers} người đã cọc</span>
          </div>
        </div>

        <div className="mt-4 flex -space-x-2">
          {match.participants.map((person) => (
            <img key={person.id} src={person.avatarUrl} alt={person.name} title={`${person.name} · DUPR ${person.dupr}`} className="h-9 w-9 rounded-full border-2 border-card object-cover" />
          ))}
          {Array.from({ length: remaining }).map((_, index) => (
            <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-primary/35 bg-secondary/50 text-sm font-bold text-primary">+</span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/60 pt-5">
          <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-muted-foreground sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Cọc được bảo vệ bởi FITLYO
          </div>
          <Button onClick={() => navigate(`/player/matches/${match.id}`)} className="ml-auto gap-2 rounded-xl font-bold">
            {joined ? <Sparkles className="h-4 w-4" /> : null}
            {joined ? 'Xem vé & kèo' : 'Xem chi tiết'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}
