import { AlertTriangle, ArrowLeft, CheckCircle2, Coins, Sparkles, Star, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { ReviewDraft } from '@/types/player'

const reports = ['Có người chơi bỏ về giữa chừng', 'Thái độ phi thể thao, xúc phạm người khác', 'Cố tình khai khống trình độ DUPR']

export function MatchReviewPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const match = usePlayerStore((state) => state.matches.find((item) => item.id === matchId))
  const profile = usePlayerStore((state) => state.profile)
  const reviewed = usePlayerStore((state) => state.reviewedMatchIds.includes(matchId ?? ''))
  const submitReview = usePlayerStore((state) => state.submitReview)
  const showToast = useFitlyoStore((state) => state.showToast)
  const players = useMemo(() => match?.participants.filter((person) => person.id !== profile.id) ?? [], [match, profile.id])
  const [draft, setDraft] = useState<ReviewDraft>({ scores: [{ teamA: 11, teamB: 9 }, { teamA: 7, teamB: 11 }, { teamA: 11, teamB: 8 }], ratings: Object.fromEntries(players.map((player) => [player.id, 5])), levelVotes: Object.fromEntries(players.map((player) => [player.id, 'ACCURATE'])), reports: [], reportNote: '' })
  const [submitting, setSubmitting] = useState(false)

  if (!match) return <div className="py-24 text-center"><h1 className="text-2xl font-black">Không tìm thấy trận đấu</h1><Button className="mt-4" onClick={() => navigate('/player/schedule')}>Về lịch của tôi</Button></div>

  const teamAWins = draft.scores.filter((score) => score.teamA > score.teamB).length
  const teamBWins = draft.scores.filter((score) => score.teamB > score.teamA).length

  const updateScore = (index: number, side: 'teamA' | 'teamB', value: number) => setDraft((current) => ({ ...current, scores: current.scores.map((score, scoreIndex) => scoreIndex === index ? { ...score, [side]: Math.max(0, Math.min(30, value)) } : score) }))
  const toggleReport = (report: string) => setDraft((current) => ({ ...current, reports: current.reports.includes(report) ? current.reports.filter((item) => item !== report) : [...current.reports, report] }))

  const handleSubmit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      const result = submitReview(match.id, draft)
      setSubmitting(false)
      showToast(result.message, result.success ? 'success' : 'error')
      if (result.success) navigate('/player/profile')
    }, 700)
  }

  if (reviewed) return <div className="mx-auto max-w-xl py-20 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span><h1 className="mt-5 text-3xl font-black">Đánh giá đã hoàn tất</h1><p className="mt-2 text-sm text-muted-foreground">DUPR và điểm uy tín của bạn đã được cập nhật.</p><Button onClick={() => navigate('/player/profile')} className="mt-6 rounded-xl">Xem hồ sơ mới</Button></div>

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Button variant="ghost" onClick={() => navigate(`/player/matches/${match.id}/ticket`)} className="gap-2 rounded-xl"><ArrowLeft className="h-4 w-4" /> Quay lại vé</Button>
      <div className="text-center"><Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">SCR_MATCH_04 · Post-match Review</Badge><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Đánh giá sau trận</h1><p className="mt-2 text-sm text-muted-foreground">{match.venueName} · {match.timeRange} · {match.dateLabel}</p></div>

      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-black text-primary">1</span><div><h2 className="font-black">Kết quả trận đấu</h2><p className="text-xs text-muted-foreground">Nhập điểm tối đa 30, hệ thống tự xác định đội thắng.</p></div></div><div className="mt-5 overflow-hidden rounded-2xl border border-border/70"><div className="grid grid-cols-[0.7fr_1fr_1fr] bg-muted/50 px-4 py-3 text-center text-xs font-bold"><span>Set</span><span>Đội của bạn</span><span>Đội đối thủ</span></div>{draft.scores.map((score, index) => <div key={index} className="grid grid-cols-[0.7fr_1fr_1fr] items-center border-t border-border/60 px-4 py-3 text-center"><b className="text-xs">Set {index + 1}</b><input type="number" min="0" max="30" value={score.teamA} onChange={(event) => updateScore(index, 'teamA', Number(event.target.value))} className="mx-auto h-10 w-20 rounded-xl border bg-background text-center font-black outline-none focus:border-primary" /><input type="number" min="0" max="30" value={score.teamB} onChange={(event) => updateScore(index, 'teamB', Number(event.target.value))} className="mx-auto h-10 w-20 rounded-xl border bg-background text-center font-black outline-none focus:border-primary" /></div>)}</div><div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-primary p-4 text-primary-foreground"><Trophy className="h-5 w-5" /><b>Kết quả: {teamAWins > teamBWins ? `Đội bạn thắng ${teamAWins}–${teamBWins}` : teamBWins > teamAWins ? `Đội đối thủ thắng ${teamBWins}–${teamAWins}` : 'Chưa xác định'}</b></div></section>

      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-black text-primary">2</span><div><h2 className="font-black">Tinh thần thể thao & trình độ</h2><p className="text-xs text-muted-foreground">Đánh giá đủ từng bạn chơi trước khi gửi.</p></div></div><div className="mt-5 space-y-4">{players.map((player) => <article key={player.id} className="rounded-2xl border border-border/70 bg-background p-4 sm:p-5"><div className="flex items-center gap-3"><img src={player.avatarUrl} alt={player.name} className="h-12 w-12 rounded-full object-cover" /><div><h3 className="font-black">{player.name}</h3><p className="text-xs text-muted-foreground">Khai báo DUPR {player.dupr.toFixed(2)} · Uy tín {player.reputation}%</p></div></div><div className="mt-4 grid gap-4 md:grid-cols-[0.65fr_1.35fr]"><div><p className="mb-2 text-xs font-bold">Tinh thần thể thao</p><div className="flex gap-1">{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => setDraft((current) => ({ ...current, ratings: { ...current.ratings, [player.id]: star } }))} aria-label={`${star} sao`}><Star className={`h-6 w-6 ${star <= (draft.ratings[player.id] ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} /></button>)}</div></div><div><p className="mb-2 text-xs font-bold">Trình độ thực tế</p><div className="grid gap-2 sm:grid-cols-3">{([['ACCURATE','Đúng trình'],['HIGHER','Hay hơn'],['LOWER','Yếu hơn']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => setDraft((current) => ({ ...current, levelVotes: { ...current.levelVotes, [player.id]: value } }))} className={`rounded-xl border px-3 py-2 text-xs font-bold ${draft.levelVotes[player.id] === value ? 'border-primary bg-secondary/40 text-primary' : 'border-border'}`}>{label}</button>)}</div></div></div></article>)}</div></section>

      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-7"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-sm font-black text-orange-600">3</span><div><h2 className="font-black">Báo cáo sự cố <span className="font-normal text-muted-foreground">(không bắt buộc)</span></h2><p className="text-xs text-muted-foreground">Thông tin sẽ được chuyển tới Admin để kiểm tra.</p></div></div><div className="mt-5 space-y-2">{reports.map((report) => <label key={report} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${draft.reports.includes(report) ? 'border-orange-500/30 bg-orange-500/10' : 'border-border'}`}><input type="checkbox" checked={draft.reports.includes(report)} onChange={() => toggleReport(report)} className="mt-0.5 accent-orange-600" /><span>{report}</span></label>)}</div>{draft.reports.length > 0 && <div className="mt-4 rounded-2xl border border-orange-500/25 bg-orange-500/8 p-4"><div className="flex items-center gap-2 text-sm font-bold text-orange-700 dark:text-orange-300"><AlertTriangle className="h-4 w-4" /> Báo cáo sẽ tạo hồ sơ tranh chấp</div><textarea value={draft.reportNote} onChange={(event) => setDraft({ ...draft, reportNote: event.target.value })} placeholder="Mô tả chi tiết sự việc và bằng chứng nếu có..." className="mt-3 min-h-24 w-full rounded-xl border bg-background p-3 text-sm outline-none focus:border-orange-500" /></div>}</section>

      <div className="rounded-[1.75rem] border border-primary/15 bg-primary p-5 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-3"><Coins className="h-8 w-8 text-secondary" /><div><p className="font-black">Thưởng hoàn tất đánh giá</p><p className="text-sm text-primary-foreground/70">+50 FITLYO Coins · +2 điểm uy tín · cập nhật DUPR</p></div></div><Button onClick={handleSubmit} disabled={submitting} variant="secondary" className="mt-4 w-full gap-2 rounded-xl font-black sm:mt-0 sm:w-auto"><Sparkles className="h-4 w-4" />{submitting ? 'Đang cân chỉnh DUPR...' : 'Xác nhận & gửi đánh giá'}</Button></div>
    </div>
  )
}
