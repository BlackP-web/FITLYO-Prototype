import { useMemo, useState } from 'react'
import { AlertOctagon, CheckCircle2, CloudRain, FileVideo2, Gavel, Scale, Search, ShieldAlert, WalletCards, XCircle } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/store/useAdminStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const currency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'

const severityMeta = {
  HIGH: { label: 'Cao', className: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300' },
  MEDIUM: { label: 'Trung bình', className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  LOW: { label: 'Thấp', className: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300' },
}

const statusLabel = { OPEN: 'Mới tiếp nhận', INVESTIGATING: 'Đang xác minh', RESOLVED: 'Đã xử lý', LEGAL_REVIEW: 'Ban pháp lý' }

export function AdminDisputesPage() {
  const { disputes, resolveDispute } = useAdminStore()
  const showToast = useFitlyoStore((state) => state.showToast)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'LEGAL_REVIEW'>('ALL')
  const [selectedId, setSelectedId] = useState(disputes.find((item) => item.status === 'OPEN' && item.severity === 'HIGH')?.id ?? disputes[0]?.id)

  const filtered = useMemo(() => disputes.filter((item) => {
    const query = search.trim().toLowerCase()
    return (!query || `${item.id} ${item.subject} ${item.claimant} ${item.respondent}`.toLowerCase().includes(query))
      && (statusFilter === 'ALL' || item.status === statusFilter)
  }), [disputes, search, statusFilter])
  const selected = disputes.find((item) => item.id === selectedId) ?? filtered[0]

  const handleResolution = (resolution: 'REFUND' | 'REJECT' | 'LEGAL') => {
    if (!selected || !resolveDispute(selected.id, resolution)) return
    showToast(resolution === 'REFUND' ? `Đã phê duyệt hoàn tiền vụ #${selected.id}.` : resolution === 'LEGAL' ? `Đã chuyển #${selected.id} sang Ban pháp lý.` : `Đã bác khiếu nại #${selected.id}.`, resolution === 'REJECT' ? 'info' : 'success')
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="SCR_ADMIN_03 · Escrow Arbitration" title="Tranh chấp và phán quyết Escrow" description="Tổng hợp bằng chứng, áp dụng quy chế sàn và xử lý công bằng các tranh chấp tài chính hoặc gian lận DUPR." icon={Gavel} />

      <section className="grid gap-5 xl:grid-cols-[minmax(360px,0.86fr)_minmax(0,1.4fr)]">
        <div className="brand-card overflow-hidden rounded-3xl">
          <div className="border-b border-border p-4"><div className="flex items-center justify-between"><div><h2 className="font-black">Hàng đợi tranh chấp</h2><p className="text-[11px] text-muted-foreground">Ưu tiên theo mức độ rủi ro</p></div><Badge variant="destructive">{disputes.filter((item) => item.status === 'OPEN' || item.status === 'INVESTIGATING').length} đang mở</Badge></div><div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã vụ, nguyên đơn..." className="h-10 pl-9" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="mt-3 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"><option value="ALL">Tất cả trạng thái</option><option value="OPEN">Mới tiếp nhận</option><option value="INVESTIGATING">Đang xác minh</option><option value="RESOLVED">Đã xử lý</option><option value="LEGAL_REVIEW">Ban pháp lý</option></select></div>
          <div className="max-h-[680px] divide-y divide-border overflow-y-auto">{filtered.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={cn('w-full p-4 text-left transition hover:bg-muted/45', selected?.id === item.id && 'bg-secondary/35')}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><strong className="font-mono text-xs">#{item.id}</strong><Badge className={cn('text-[9px]', severityMeta[item.severity].className)}>{severityMeta[item.severity].label}</Badge></div><p className="mt-2 line-clamp-2 text-sm font-black leading-snug">{item.subject}</p><p className="mt-2 text-[10px] text-muted-foreground">{item.claimant} → {item.respondent}</p></div><span className="shrink-0 text-xs font-black text-primary">{currency(item.amount)}</span></div><div className="mt-3 flex items-center justify-between"><span className="text-[10px] text-muted-foreground">{item.openedAt}</span><span className="text-[10px] font-bold text-primary">{statusLabel[item.status]}</span></div></button>)}{filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Không tìm thấy vụ việc phù hợp.</div>}</div>
        </div>

        {selected ? <article className="brand-card rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start"><div><div className="flex flex-wrap gap-2"><Badge variant="outline">#{selected.id}</Badge><Badge className={severityMeta[selected.severity].className}>Mức độ {severityMeta[selected.severity].label}</Badge><Badge variant="outline">{statusLabel[selected.status]}</Badge></div><h2 className="mt-3 text-xl font-black">{selected.subject}</h2><p className="mt-1 text-xs text-muted-foreground">Mở lúc {selected.openedAt}</p></div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">{selected.category === 'WEATHER' ? <CloudRain className="h-6 w-6" /> : <Scale className="h-6 w-6" />}</span></div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-muted/55 p-4"><p className="text-[10px] text-muted-foreground">Nguyên đơn</p><p className="mt-1 text-sm font-black">{selected.claimant}</p></div><div className="rounded-2xl bg-muted/55 p-4"><p className="text-[10px] text-muted-foreground">Bị đơn</p><p className="mt-1 text-sm font-black">{selected.respondent}</p></div><div className="rounded-2xl bg-muted/55 p-4"><p className="text-[10px] text-muted-foreground">Escrow tranh chấp</p><p className="mt-1 text-sm font-black text-primary">{currency(selected.amount)}</p></div></div>

          <div className="mt-5 space-y-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Nội dung khiếu nại</p><p className="mt-2 rounded-2xl border border-border bg-background/45 p-4 text-sm leading-relaxed">{selected.description}</p></div><div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300"><ShieldAlert className="h-4 w-4" /> Quy chế áp dụng</p><p className="mt-2 text-sm leading-relaxed">{selected.policy}</p></div><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300"><WalletCards className="h-4 w-4" /> Đề xuất phán quyết</p><p className="mt-2 text-sm leading-relaxed">{selected.recommendation}</p></div></div>

          <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">Bằng chứng đối soát</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{selected.evidence.map((evidence) => <button type="button" key={evidence} onClick={() => showToast(`Đang mở “${evidence}” (mô phỏng).`, 'info')} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left text-xs font-semibold transition hover:border-primary/35"><FileVideo2 className="h-4 w-4 text-purple-600 dark:text-purple-300" />{evidence}</button>)}</div></div>

          {selected.resolution && <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200"><p className="flex items-center gap-2 font-black"><CheckCircle2 className="h-4 w-4" /> Phán quyết đã thực thi</p><p className="mt-2 text-xs leading-relaxed">{selected.resolution}</p></div>}

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end"><Button variant="outline" disabled={selected.status === 'RESOLVED' || selected.status === 'LEGAL_REVIEW'} onClick={() => handleResolution('REJECT')}><XCircle /> Bác khiếu nại</Button><Button variant="secondary" disabled={selected.status === 'RESOLVED' || selected.status === 'LEGAL_REVIEW'} onClick={() => handleResolution('LEGAL')}><AlertOctagon /> Chuyển pháp lý</Button><Button disabled={selected.status === 'RESOLVED' || selected.status === 'LEGAL_REVIEW'} onClick={() => handleResolution('REFUND')}><WalletCards /> Hoàn tiền 100%</Button></div>
        </article> : <div className="brand-card flex min-h-[500px] items-center justify-center rounded-3xl p-8 text-sm text-muted-foreground">Chọn một vụ việc để xem bằng chứng.</div>}
      </section>
    </div>
  )
}
