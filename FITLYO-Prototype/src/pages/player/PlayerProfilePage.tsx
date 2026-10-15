import { Award, CalendarDays, Camera, ChevronRight, Crown, Edit3, MapPin, Medal, Share2, ShieldCheck, TrendingUp, Trophy, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerPageHeader } from '@/components/player/PlayerPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const skillLabels = [
  ['serve', 'Giao bóng'], ['thirdShot', 'Third-shot drop'], ['dinking', 'Dinking'], ['volley', 'Volley'], ['movement', 'Di chuyển'],
] as const

export function PlayerProfilePage() {
  const navigate = useNavigate()
  const profile = usePlayerStore((state) => state.profile)
  const updateProfile = usePlayerStore((state) => state.updateProfile)
  const schedule = usePlayerStore((state) => state.schedule)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [showEdit, setShowEdit] = useState(false)
  const [showDupr, setShowDupr] = useState(false)
  const [draft, setDraft] = useState({ name: profile.name, username: profile.username, phone: profile.phone, city: profile.city })
  const winRate = Math.round((profile.wins / Math.max(1, profile.matchesPlayed)) * 100)
  const recentMatches = schedule.filter((item) => item.kind === 'MATCH' && item.status === 'COMPLETED').slice(0, 3)

  const saveProfile = () => {
    updateProfile(draft)
    setShowEdit(false)
    showToast('Đã lưu thông tin hồ sơ Player.', 'success')
  }

  return (
    <div className="space-y-7 pb-10">
      <PlayerPageHeader eyebrow="SCR_USER_01 · Player Profile" title="Hồ sơ người chơi" description="Danh tính thể thao, DUPR, phong độ và thành tích Pickleball của bạn." icon={UserRound} action={<div className="flex gap-2"><Button variant="outline" onClick={() => showToast('Đã tạo liên kết hồ sơ công khai.', 'info')} className="gap-2 rounded-xl"><Share2 className="h-4 w-4" /><span className="hidden sm:inline">Chia sẻ</span></Button><Button variant="outline" onClick={() => setShowEdit(true)} className="gap-2 rounded-xl"><Edit3 className="h-4 w-4" /> Chỉnh sửa</Button></div>} />

      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[0_24px_70px_rgba(20,63,66,0.08)]">
        <div className="brand-gradient h-36 sm:h-44" />
        <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative w-fit"><img src={profile.avatarUrl} alt={profile.name} className="h-28 w-28 rounded-[1.7rem] border-4 border-card object-cover shadow-xl sm:h-32 sm:w-32" /><button type="button" onClick={() => showToast('Tải ảnh đại diện được mô phỏng trong prototype.', 'info')} className="absolute -bottom-1 -right-1 rounded-xl border-2 border-card bg-primary p-2 text-primary-foreground"><Camera className="h-4 w-4" /></button></div>
              <div className="pb-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-black sm:text-3xl">{profile.name}</h2>{profile.isVip && <Badge className="gap-1 border-0 bg-amber-400 text-amber-950"><Crown className="h-3.5 w-3.5" /> FITLYO VIP</Badge>}</div><p className="mt-1 font-semibold text-primary">{profile.username}</p><p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.city}</span><span>Thành viên từ {profile.memberSince}</span></p></div>
            </div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => navigate('/player/schedule')} className="gap-2 rounded-xl"><CalendarDays className="h-4 w-4" /> Lịch của tôi</Button>{!profile.isVip && <Button onClick={() => navigate('/player/vip')} className="gap-2 rounded-xl bg-amber-400 font-black text-amber-950 hover:bg-amber-300"><Crown className="h-4 w-4" /> Lên VIP</Button>}</div>
          </div>
        </div>
      </section>

      {!profile.isVip && <button type="button" onClick={() => navigate('/player/vip')} className="group flex w-full flex-col gap-4 rounded-[1.7rem] border border-amber-500/25 bg-gradient-to-r from-amber-500/14 via-card to-secondary/35 p-5 text-left transition hover:border-amber-500/50 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-4"><span className="rounded-2xl bg-amber-400 p-3 text-amber-950 shadow-lg shadow-amber-500/20"><Crown className="h-6 w-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">FITLYO VIP</p><h3 className="mt-1 text-lg font-black">Đặt sân trước 14 ngày · Miễn phí giao dịch</h3><p className="mt-1 text-xs text-muted-foreground">Từ 99.000đ/tháng, mở khóa ưu tiên ghép kèo giờ vàng.</p></div></div><span className="flex items-center gap-1 text-sm font-black text-primary">Xem đặc quyền <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></button>}

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="space-y-5 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Điểm xếp hạng chính thức</p><h2 className="mt-2 text-5xl font-black tracking-tight">{profile.dupr.toFixed(2)}</h2><p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-300">Trung cấp · Intermediate</p></div><span className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600"><TrendingUp className="h-6 w-6" /></span></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/45 p-4"><span className="text-xs text-muted-foreground">Phong độ</span><p className="mt-1 text-xl font-black text-emerald-600">+{profile.duprTrend.toFixed(2)}</p></div><div className="rounded-2xl bg-muted/45 p-4"><span className="text-xs text-muted-foreground">Uy tín Fair-play</span><p className="mt-1 text-xl font-black text-emerald-600">{profile.reputation}%</p></div></div><p className="text-xs leading-5 text-muted-foreground">Cấp bởi đánh giá khảo sát và {profile.matchesPlayed} trận Social đã xác nhận trên FITLYO.</p><Button variant="outline" onClick={() => setShowDupr(true)} className="w-full rounded-xl font-bold">Xem biến động DUPR</Button></section>

        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Phong độ tổng quan</p><h2 className="mt-1 text-xl font-black">Thống kê thi đấu</h2></div><Trophy className="h-6 w-6 text-amber-500" /></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Trận đã đấu" value={String(profile.matchesPlayed)} /><Stat label="Tỉ lệ thắng" value={`${winRate}%`} /><Stat label="Thắng" value={String(profile.wins)} /><Stat label="Thua" value={String(profile.losses)} /></div><div className="mt-6"><div className="mb-2 flex justify-between text-xs font-bold"><span>Win rate mùa này</span><span>{profile.wins}T · {profile.losses}B</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500" style={{ width: `${winRate}%` }} /></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4"><Medal className="h-5 w-5 text-amber-500" /><b className="mt-2 block text-sm">Top 18% khu vực Thủ Đức</b><p className="mt-1 text-xs text-muted-foreground">Xếp theo DUPR nội bộ FITLYO.</p></div><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4"><ShieldCheck className="h-5 w-5 text-emerald-600" /><b className="mt-2 block text-sm">Người chơi đáng tin cậy</b><p className="mt-1 text-xs text-muted-foreground">Không bỏ kèo trong 90 ngày.</p></div></div></section>
      </div>

      <section className="grid gap-6 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-7 lg:grid-cols-[0.8fr_1.2fr]"><div className="flex items-center justify-center"><SkillRadar skills={profile.skills} /></div><div><p className="text-xs font-black uppercase tracking-wider text-primary">Biểu đồ chuyên môn</p><h2 className="mt-1 text-xl font-black">5 kỹ năng cốt lõi</h2><div className="mt-5 space-y-4">{skillLabels.map(([key, label]) => <div key={key}><div className="mb-1.5 flex justify-between text-xs font-bold"><span>{label}</span><span>{profile.skills[key].toFixed(1)} / 10</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${profile.skills[key] * 10}%` }} /></div></div>)}</div></div></section>

      <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Trận gần nhất</h2><Badge variant="outline">Lịch sử</Badge></div><div className="mt-4 space-y-3">{recentMatches.length ? recentMatches.map((item) => <div key={item.id} className="rounded-2xl border border-border/60 bg-muted/25 p-4"><div className="flex justify-between gap-3"><div><b className="text-sm">{item.title}</b><p className="mt-1 text-xs text-muted-foreground">{item.venueName} · {item.dateLabel}</p></div><Badge className="h-fit border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">THẮNG</Badge></div><p className="mt-3 text-xs font-bold text-emerald-600">{item.subtitle}</p></div>) : <p className="py-8 text-center text-sm text-muted-foreground">Chưa có trận hoàn tất trong dữ liệu hiện tại.</p>}</div></section><section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Chứng chỉ đã hoàn thành</h2><Award className="h-5 w-5 text-primary" /></div><div className="mt-4 rounded-2xl border border-primary/15 bg-secondary/20 p-5"><div className="flex items-start gap-4"><span className="rounded-xl bg-primary p-2.5 text-primary-foreground"><Award className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-wider text-primary">Chứng chỉ FITLYO</p><h3 className="mt-1 font-black">Boot Camp Pickleball 3.0 → 3.5</h3><p className="mt-2 text-xs text-muted-foreground">HLV xác nhận: Lê Hoàng Dũng · IPTPA Level 2</p><p className="mt-3 text-sm font-bold">Đầu ra: DUPR {profile.dupr.toFixed(2)} / 3.50</p></div></div></div></section></div>

      {showEdit && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#082A2D]/65 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Thông tin cá nhân</p><h2 className="mt-1 text-2xl font-black">Chỉnh sửa hồ sơ</h2></div><Button variant="ghost" size="icon" onClick={() => setShowEdit(false)}><X className="h-5 w-5" /></Button></div><div className="mt-6 space-y-4">{([['name','Họ và tên'],['username','Username'],['phone','Số điện thoại'],['city','Khu vực']] as const).map(([key,label]) => <label key={key} className="block text-xs font-bold">{label}<input value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary" /></label>)}</div><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setShowEdit(false)}>Hủy</Button><Button onClick={saveProfile}>Lưu thay đổi</Button></div></div></div>}

      {showDupr && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#082A2D]/65 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-primary">DUPR Growth</p><h2 className="mt-1 text-2xl font-black">Biến động 6 tháng</h2></div><Button variant="ghost" size="icon" onClick={() => setShowDupr(false)}><X className="h-5 w-5" /></Button></div><DuprChart current={profile.dupr} /><div className="mt-5 grid grid-cols-3 gap-3 text-center"><Stat label="Tháng 05" value="3.05" /><Stat label="Tăng trưởng" value="+0.37" /><Stat label="Hiện tại" value={profile.dupr.toFixed(2)} /></div></div></div>}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-muted/45 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div> }

function SkillRadar({ skills }: { skills: ReturnType<typeof usePlayerStore.getState>['profile']['skills'] }) {
  const values = [skills.serve, skills.thirdShot, skills.dinking, skills.volley, skills.movement]
  const angles = values.map((_, index) => -Math.PI / 2 + (index * Math.PI * 2) / 5)
  const points = values.map((value, index) => `${120 + Math.cos(angles[index]) * value * 9},${120 + Math.sin(angles[index]) * value * 9}`).join(' ')
  const outer = angles.map((angle) => `${120 + Math.cos(angle) * 90},${120 + Math.sin(angle) * 90}`).join(' ')
  return <svg viewBox="0 0 240 240" className="h-64 w-64" aria-label="Biểu đồ radar kỹ năng"><polygon points={outer} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />{angles.map((angle,index) => <line key={index} x1="120" y1="120" x2={120 + Math.cos(angle)*90} y2={120 + Math.sin(angle)*90} stroke="hsl(var(--border))" />)}<polygon points={points} fill="rgba(175,240,211,.55)" stroke="#143F42" strokeWidth="3" />{values.map((value,index) => <circle key={index} cx={120 + Math.cos(angles[index])*value*9} cy={120 + Math.sin(angles[index])*value*9} r="4" fill="#FFB697" stroke="#143F42" strokeWidth="2" />)}</svg>
}

function DuprChart({ current }: { current: number }) { const values = [3.05,3.12,3.19,3.25,3.37,current]; const points = values.map((value,index) => `${30+index*92},${180-(value-2.9)*260}`).join(' '); return <div className="mt-6 overflow-hidden rounded-2xl bg-muted/35 p-4"><svg viewBox="0 0 520 210" className="w-full"><defs><linearGradient id="duprFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#AFF0D3" stopOpacity=".8"/><stop offset="1" stopColor="#AFF0D3" stopOpacity="0"/></linearGradient></defs>{[40,90,140,190].map((y) => <line key={y} x1="20" y1={y} x2="500" y2={y} stroke="hsl(var(--border))" strokeDasharray="4 6" />)}<polygon points={`30,190 ${points} 490,190`} fill="url(#duprFill)" /><polyline points={points} fill="none" stroke="#143F42" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{values.map((value,index) => <g key={index}><circle cx={30+index*92} cy={180-(value-2.9)*260} r="5" fill="#FFB697" stroke="#143F42" strokeWidth="3"/><text x={30+index*92} y="204" textAnchor="middle" fontSize="11" fill="currentColor">T{index+5}</text></g>)}</svg></div> }
