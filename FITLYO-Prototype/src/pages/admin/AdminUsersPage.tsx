import { useMemo, useState } from 'react'
import { AlertTriangle, Download, LockKeyhole, Search, ShieldCheck, UserCog, UserRoundCheck, UsersRound, WalletCards } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAdminStore, type AdminUserRole } from '@/store/useAdminStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const currency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'

const roleLabel: Record<AdminUserRole, string> = {
  PLAYER: 'Player', VIP_PLAYER: 'VIP Player', COACH: 'Coach', FIELD_MANAGER: 'Field Manager', OPERATOR: 'Operator',
}

const statusMeta = {
  ACTIVE: { label: 'Đang hoạt động', className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  SUSPENDED: { label: 'Tạm khóa', className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  LOCKED: { label: 'Đã khóa', className: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300' },
}

type UserAction = 'WARN' | 'FREEZE_WALLET' | 'SUSPEND_30' | 'UNLOCK'

export function AdminUsersPage() {
  const { users, applyUserAction, changeUserRole } = useAdminStore()
  const showToast = useFitlyoStore((state) => state.showToast)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | AdminUserRole>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'LOCKED'>('ALL')
  const [selectedId, setSelectedId] = useState(users.find((item) => item.reports >= 3)?.id ?? users[0]?.id)
  const [action, setAction] = useState<UserAction>('SUSPEND_30')
  const [reason, setReason] = useState('Ghi nhận nhiều báo cáo bỏ kèo liên tiếp; tạm khóa để xác minh hành vi.')

  const filtered = useMemo(() => users.filter((user) => {
    const query = search.trim().toLowerCase()
    return (!query || `${user.id} ${user.name} ${user.email} ${user.phone}`.toLowerCase().includes(query))
      && (roleFilter === 'ALL' || user.role === roleFilter)
      && (statusFilter === 'ALL' || user.status === statusFilter)
  }), [roleFilter, search, statusFilter, users])
  const selected = users.find((item) => item.id === selectedId) ?? filtered[0]

  const submitAction = () => {
    if (!selected) return
    const success = applyUserAction(selected.id, action, reason)
    if (!success) {
      showToast('Vui lòng nhập lý do xử lý tài khoản.', 'error')
      return
    }
    const label = action === 'WARN' ? 'gửi cảnh cáo' : action === 'FREEZE_WALLET' ? 'đóng băng ví' : action === 'SUSPEND_30' ? 'tạm khóa 30 ngày' : 'mở khóa'
    showToast(`Đã ${label} tài khoản #${selected.id}.`, 'success')
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="SCR_ADMIN_02 · User & RBAC" title="Quản lý người dùng và phân quyền" description="Tìm kiếm tài khoản, kiểm soát quyền truy cập, số dư ví, điểm uy tín và thực thi biện pháp kỷ luật." icon={UsersRound} actions={<Button variant="outline" onClick={() => showToast('Đã xuất danh sách người dùng (mô phỏng).', 'success')}><Download /> Xuất Excel</Button>} />

      <section className="brand-card rounded-3xl p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_190px]">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, email, SĐT hoặc User ID..." className="h-10 pl-9" /></div>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"><option value="ALL">Tất cả vai trò</option>{Object.entries(roleLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"><option value="ALL">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="SUSPENDED">Tạm khóa</option><option value="LOCKED">Đã khóa</option></select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[940px] text-left text-xs">
            <thead className="bg-muted/70 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Người dùng</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">DUPR / Uy tín</th><th className="px-4 py-3">Ví & Escrow</th><th className="px-4 py-3">Báo cáo</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => <tr key={user.id} className={cn('transition hover:bg-muted/35', selected?.id === user.id && 'bg-secondary/25')}><td className="px-4 py-3"><p className="font-black">{user.name}</p><p className="mt-1 text-[10px] text-muted-foreground">#{user.id} · {user.email}</p></td><td className="px-4 py-3"><Badge variant="outline">{roleLabel[user.role]}</Badge></td><td className="px-4 py-3"><p className="font-bold">{user.dupr ? `DUPR ${user.dupr}` : 'Không áp dụng'}</p><p className={cn('mt-1 text-[10px] font-semibold', user.reputation < 60 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-300')}>{user.reputation}/100 uy tín</p></td><td className="px-4 py-3"><p className="font-bold">{currency(user.walletBalance)}</p><p className="mt-1 text-[10px] text-muted-foreground">Escrow {currency(user.escrowBalance)}</p>{user.walletFrozen && <span className="mt-1 inline-block text-[9px] font-bold text-destructive">Ví đang đóng băng</span>}</td><td className="px-4 py-3"><span className={cn('font-black', user.reports > 0 ? 'text-destructive' : 'text-muted-foreground')}>{user.reports}</span></td><td className="px-4 py-3"><Badge className={statusMeta[user.status].className}>{statusMeta[user.status].label}</Badge></td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => setSelectedId(user.id)}>Chi tiết</Button></td></tr>)}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Không tìm thấy tài khoản phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <article className="brand-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Hồ sơ #{selected.id}</p><h2 className="mt-1 text-xl font-black">{selected.name}</h2><p className="mt-1 text-xs text-muted-foreground">Tham gia {selected.joinedAt} · Online {selected.lastActive}</p></div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UserCog className="h-6 w-6" /></span></div>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/60 p-4"><WalletCards className="h-4 w-4 text-primary" /><p className="mt-3 text-[10px] text-muted-foreground">Số dư ví</p><p className="mt-1 font-black">{currency(selected.walletBalance)}</p></div><div className="rounded-2xl bg-muted/60 p-4"><ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-300" /><p className="mt-3 text-[10px] text-muted-foreground">Escrow đang giữ</p><p className="mt-1 font-black">{currency(selected.escrowBalance)}</p></div></div>
            <div className="mt-5 space-y-2"><label htmlFor="rbac-role" className="text-xs font-bold">Vai trò hệ thống</label><div className="flex gap-2"><select id="rbac-role" value={selected.role} onChange={(event) => { const nextRole = event.target.value as AdminUserRole; if (changeUserRole(selected.id, nextRole)) showToast(`Đã đổi quyền #${selected.id} thành ${roleLabel[nextRole]}.`, 'success') }} className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">{Object.entries(roleLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><p className="text-[10px] text-muted-foreground">Thay đổi được ghi vào nhật ký kiểm toán của Super Admin.</p></div>
          </article>

          <article className="rounded-3xl border border-destructive/20 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /><h2 className="font-black">Thao tác xử lý nhanh</h2></div>
            <p className="mt-2 text-xs text-muted-foreground">Mọi hành động kỷ luật đều cần lý do và được ghi nhận dưới tài khoản Super Admin.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">{[
              ['WARN', 'Cảnh cáo', 'Không thay đổi quyền truy cập'], ['FREEZE_WALLET', 'Đóng băng ví', 'Khóa giao dịch và số dư'], ['SUSPEND_30', 'Khóa 30 ngày', 'Chặn đăng nhập tạm thời'], ['UNLOCK', 'Mở khóa tài khoản', 'Khôi phục trạng thái Active'],
            ].map(([value, label, note]) => <button key={value} type="button" onClick={() => setAction(value as UserAction)} className={cn('rounded-2xl border p-3 text-left transition', action === value ? 'border-destructive/50 bg-destructive/10' : 'border-border bg-background/40 hover:border-destructive/25')}><strong className="block text-xs">{label}</strong><span className="mt-1 block text-[10px] text-muted-foreground">{note}</span></button>)}</div>
            <div className="mt-4 space-y-2"><label htmlFor="user-action-reason" className="text-xs font-bold">Lý do xử lý</label><textarea id="user-action-reason" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className="w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" /></div>
            <div className="mt-4 flex justify-end"><Button variant={action === 'UNLOCK' ? 'default' : 'destructive'} onClick={submitAction}>{action === 'UNLOCK' ? <UserRoundCheck /> : <LockKeyhole />} Xác nhận thực thi</Button></div>
          </article>
        </section>
      )}
    </div>
  )
}
