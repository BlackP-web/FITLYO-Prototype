import { useState } from 'react'
import { Award, CirclePause, CirclePlay, Clock3, Star, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'

type CoachLinkStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'

const statusLabel: Record<CoachLinkStatus, string> = {
  ACTIVE: 'Đang liên kết',
  PENDING: 'Chờ duyệt',
  SUSPENDED: 'Tạm dừng',
}

export function OwnerCoachesPage() {
  const { coaches, showToast } = useFitlyoStore()
  const [linkStatus, setLinkStatus] = useState<Record<string, CoachLinkStatus>>({
    coach_kiet: 'ACTIVE',
    coach_long: 'PENDING',
    coach_minhanh: 'SUSPENDED',
  })

  const updateStatus = (coachId: string, coachName: string, status: CoachLinkStatus) => {
    setLinkStatus((current) => ({ ...current, [coachId]: status }))
    showToast(`${coachName}: ${statusLabel[status].toLowerCase()}.`, status === 'ACTIVE' ? 'success' : 'info')
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start">
        <div>
          <div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_05</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager • Linked Coaches</span></div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Quản lý HLV liên kết tại sân</h1>
          <p className="mt-1 text-sm text-muted-foreground">Duyệt hồ sơ HLV và quản lý quyền sử dụng sân để tổ chức lớp học.</p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 text-sm shadow-sm"><p className="text-xs text-muted-foreground">HLV đang hoạt động</p><p className="mt-1 font-extrabold text-primary">{Object.values(linkStatus).filter((status) => status === 'ACTIVE').length} người</p></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {coaches.map((coach) => {
          const status = linkStatus[coach.id] ?? 'PENDING'
          const isActive = status === 'ACTIVE'
          const isPending = status === 'PENDING'
          return (
            <article key={coach.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <img src={coach.avatarUrl} alt={coach.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><h2 className="truncate text-sm font-bold">{coach.name}</h2><Badge variant={isActive ? 'success' : isPending ? 'warning' : 'outline'} className="shrink-0">{statusLabel[status]}</Badge></div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{coach.certTitle}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{coach.rating} ({coach.reviewCount})</span>
                <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{coach.experienceYears} năm</span>
              </div>
              <div className="mt-4 rounded-xl bg-muted/40 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Chuyên môn</p><p className="mt-1 text-xs leading-relaxed">{coach.specialties.slice(0, 2).join(' • ')}</p></div>

              <div className="mt-4 flex gap-2">
                {isPending && <Button size="sm" className="flex-1" onClick={() => updateStatus(coach.id, coach.name, 'ACTIVE')}><UserCheck />Duyệt liên kết</Button>}
                {isActive && <Button size="sm" variant="outline" className="flex-1" onClick={() => updateStatus(coach.id, coach.name, 'SUSPENDED')}><CirclePause />Tạm dừng</Button>}
                {status === 'SUSPENDED' && <Button size="sm" className="flex-1" onClick={() => updateStatus(coach.id, coach.name, 'ACTIVE')}><CirclePlay />Kích hoạt lại</Button>}
              </div>
            </article>
          )
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground"><Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />Chỉ HLV đang liên kết mới được xuất hiện ở lịch sân với trạng thái Lớp Coach.</div>
    </div>
  )
}
