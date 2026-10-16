import { Activity, ArrowRight, BarChart3, CircleDollarSign, Download, Gavel, ShieldAlert, TrendingUp, UserRoundCheck, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAdminStore } from '@/store/useAdminStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'

const occupancy = [
  { slot: 'Slot 1', value: 52 }, { slot: 'Slot 2', value: 68 }, { slot: 'Slot 3', value: 41 },
  { slot: 'Slot 4', value: 44 }, { slot: 'Slot 5', value: 48 }, { slot: 'Slot 6', value: 55 },
  { slot: 'Slot 7', value: 64 }, { slot: 'Slot 8', value: 76 }, { slot: 'Slot 9 · Vàng', value: 98 }, { slot: 'Slot 10', value: 79 },
]

const weeklyMatches = [64, 78, 72, 96, 108, 124, 112]
const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function AdminDashboardPage() {
  const { users, disputes } = useAdminStore()
  const { auditApplications, showToast } = useFitlyoStore()
  const openDisputes = disputes.filter((item) => item.status === 'OPEN' || item.status === 'INVESTIGATING')
  const pendingKyc = auditApplications.filter((item) => item.status === 'PENDING')

  const metrics = [
    { label: 'Tổng giá trị giao dịch (GMV)', value: '1,84 tỷ', note: '+18,4% so với tháng 9', icon: CircleDollarSign, tone: 'bg-secondary text-primary' },
    { label: 'Doanh thu hoa hồng sàn', value: '142,5 triệu', note: '7,74% GMV thực thu', icon: TrendingUp, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    { label: 'Hội viên VIP đang active', value: '412', note: '36,8 triệu doanh thu định kỳ', icon: UserRoundCheck, tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
    { label: 'Tài khoản toàn hệ thống', value: '4.820', note: `${users.filter((item) => item.status === 'ACTIVE').length} tài khoản mẫu đang active`, icon: UsersRound, tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="SCR_ADMIN_05 · Executive Dashboard"
        title="Tổng quan vận hành toàn sàn"
        description="Theo dõi tăng trưởng, doanh thu, công suất sân và các tín hiệu rủi ro cần Super Admin xử lý."
        icon={BarChart3}
        actions={<Button variant="outline" onClick={() => showToast('Đã tạo báo cáo tài chính tháng 10/2026 (mô phỏng).', 'success')}><Download /> Xuất báo cáo</Button>}
      />

      <section className="brand-gradient overflow-hidden rounded-3xl p-6 text-white sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">FITLYO Executive Pulse</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Nền tảng đang vận hành ổn định</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">1.240 trận hoàn tất trong 7 ngày qua; tỷ lệ tranh chấp chỉ 0,42% nhờ cơ chế ký quỹ và check-in QR.</p></div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]"><div className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-[11px] text-white/60">Escrow đang giữ</p><p className="mt-1 text-xl font-black">{formatCurrency(682400000)}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-[11px] text-white/60">Tỷ lệ thành công</p><p className="mt-1 text-xl font-black">99,58%</p></div></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return <article key={metric.label} className="brand-card rounded-2xl p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.tone}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-xs font-semibold text-muted-foreground">{metric.label}</p><p className="mt-1 text-2xl font-black tracking-tight">{metric.value}</p><p className="mt-1 text-[11px] text-muted-foreground">{metric.note}</p></article>
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
        <article className="brand-card rounded-3xl p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Tăng trưởng hoạt động</p><h2 className="mt-1 text-lg font-black">Số trận hoàn tất theo ngày</h2></div><Badge variant="outline">Tuần 42</Badge></div>
          <div className="mt-8 flex h-56 items-end gap-3 border-b border-l border-border px-4 pb-3 sm:gap-5">
            {weeklyMatches.map((value, index) => <div key={value + index} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="relative rounded-t-xl bg-primary/85 transition hover:bg-primary" style={{ height: `${(value / 130) * 100}%` }}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">{value}</span></div><span className="text-center text-[10px] text-muted-foreground">{weekdayLabels[index]}</span></div>)}
          </div>
          <div className="mt-5"><div className="flex items-center justify-between"><p className="text-sm font-black">Tỷ lệ lấp đầy 10 slot</p><span className="text-xs text-muted-foreground">Trung bình 63%</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{occupancy.map((item) => <div key={item.slot} className="rounded-xl bg-muted/55 p-3"><div className="flex justify-between text-xs"><span className="font-semibold">{item.slot}</span><strong className={item.value >= 90 ? 'text-orange-600 dark:text-orange-300' : 'text-primary'}>{item.value}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className={item.value >= 90 ? 'h-full rounded-full bg-orange-500' : 'h-full rounded-full bg-primary'} style={{ width: `${item.value}%` }} /></div></div>)}</div></div>
        </article>

        <div className="space-y-4">
          <article className="brand-card rounded-3xl p-5">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><ShieldAlert className="h-5 w-5 text-destructive" /> Việc cần xử lý</h2><Badge variant="destructive">{pendingKyc.length + openDisputes.length}</Badge></div>
            <div className="mt-4 space-y-3">
              <Link to="/admin/kyc" className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3 transition hover:border-primary/35"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300"><UserRoundCheck className="h-5 w-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{pendingKyc.length} hồ sơ KYC chờ duyệt</strong><span className="text-[11px] text-muted-foreground">Chủ sân và Coach mới</span></span><ArrowRight className="h-4 w-4 text-muted-foreground" /></Link>
              <Link to="/admin/disputes" className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3 transition hover:border-primary/35"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300"><Gavel className="h-5 w-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{openDisputes.length} tranh chấp đang mở</strong><span className="text-[11px] text-muted-foreground">{openDisputes.filter((item) => item.severity === 'HIGH').length} vụ mức độ cao</span></span><ArrowRight className="h-4 w-4 text-muted-foreground" /></Link>
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5"><div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Activity className="h-5 w-5" /><h2 className="font-black">Sức khỏe hệ thống</h2></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">Thời gian phản hồi API</span><strong>84 ms</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Thanh toán thành công</span><strong>99,97%</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Đồng bộ QR realtime</span><strong>Ổn định</strong></div></div></article>
        </div>
      </section>
    </div>
  )
}
