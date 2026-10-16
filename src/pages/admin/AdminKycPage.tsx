import { useMemo, useState } from 'react'
import { Building2, CheckCircle2, FileCheck2, FileText, Search, Send, ShieldCheck, UserRoundCheck, XCircle } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const statusMeta = {
  PENDING: { label: 'Chờ duyệt', className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  NEEDS_SUPPLEMENT: { label: 'Cần bổ sung', className: 'border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300' },
  APPROVED: { label: 'Đã duyệt', className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  REJECTED: { label: 'Từ chối', className: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300' },
}

export function AdminKycPage() {
  const { auditApplications, approveAuditApplication, rejectAuditApplication, requestAuditSupplement, showToast } = useFitlyoStore()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'ALL' | 'VENUE' | 'COACH'>('ALL')
  const [selectedId, setSelectedId] = useState(auditApplications.find((item) => item.status === 'PENDING')?.id ?? auditApplications[0]?.id)
  const [reviewNote, setReviewNote] = useState('Đã đối chiếu thông tin pháp lý và dữ liệu định danh trên hồ sơ.')

  const filtered = useMemo(() => auditApplications.filter((item) => {
    const matchesType = type === 'ALL' || item.type === type
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || `${item.id} ${item.title} ${item.ownerName} ${item.phone}`.toLowerCase().includes(query)
    return matchesType && matchesSearch
  }), [auditApplications, search, type])

  const selected = auditApplications.find((item) => item.id === selectedId) ?? filtered[0]

  const handleApprove = () => {
    if (!selected) return
    approveAuditApplication(selected.id)
  }

  const handleReject = () => {
    if (!selected) return
    if (!reviewNote.trim()) {
      showToast('Vui lòng nhập lý do từ chối hoặc nội dung cần bổ sung.', 'error')
      return
    }
    rejectAuditApplication(selected.id, reviewNote.trim())
  }

  const handleRequestSupplement = () => {
    if (!selected) return
    if (!reviewNote.trim()) {
      showToast('Vui lòng nhập nội dung cần bổ sung.', 'error')
      return
    }
    requestAuditSupplement(selected.id, reviewNote.trim())
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="SCR_ADMIN_01 · Partner Verification" title="Thẩm định hồ sơ đối tác" description="Kiểm tra pháp lý cụm sân và chứng chỉ chuyên môn Coach để xác minh các tài khoản đối tác hiện có trên FITLYO." icon={FileCheck2} />

      <section className="grid gap-5 xl:grid-cols-[minmax(360px,0.86fr)_minmax(0,1.4fr)]">
        <div className="brand-card overflow-hidden rounded-3xl">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-black">Hàng đợi KYC</h2><p className="text-[11px] text-muted-foreground">{auditApplications.filter((item) => item.status === 'PENDING').length} hồ sơ cần xử lý</p></div><Badge variant="outline">{filtered.length} kết quả</Badge></div>
            <div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã, tên, số điện thoại..." className="h-10 pl-9" /></div>
            <div className="mt-3 flex gap-2">{(['ALL', 'VENUE', 'COACH'] as const).map((value) => <button key={value} type="button" onClick={() => setType(value)} className={cn('rounded-lg border px-3 py-1.5 text-[11px] font-bold transition', type === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:text-foreground')}>{value === 'ALL' ? 'Tất cả' : value === 'VENUE' ? 'Chủ sân' : 'Coach'}</button>)}</div>
          </div>

          <div className="max-h-[680px] divide-y divide-border overflow-y-auto">
            {filtered.map((item) => {
              const Icon = item.type === 'VENUE' ? Building2 : UserRoundCheck
              const active = selected?.id === item.id
              return <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setReviewNote(item.inspectorNotes) }} className={cn('w-full p-4 text-left transition hover:bg-muted/45', active && 'bg-secondary/35')}><div className="flex items-start gap-3"><span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', item.type === 'VENUE' ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300')}><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><strong className="truncate text-sm">{item.title}</strong><span className="shrink-0 font-mono text-[10px] text-muted-foreground">#{item.id}</span></span><span className="mt-1 block truncate text-[11px] text-muted-foreground">{item.ownerName}</span><span className="mt-2 flex items-center justify-between gap-2"><Badge className={cn('text-[9px]', statusMeta[item.status].className)}>{statusMeta[item.status].label}</Badge><span className="text-[10px] text-muted-foreground">{item.submittedDate}</span></span></span></div></button>
            })}
            {filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Không tìm thấy hồ sơ phù hợp.</div>}
          </div>
        </div>

        {selected ? (
          <article className="brand-card rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
              <div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">#{selected.id}</Badge><Badge className={statusMeta[selected.status].className}>{statusMeta[selected.status].label}</Badge></div><h2 className="mt-3 text-xl font-black">{selected.title}</h2><p className="mt-1 text-xs text-muted-foreground">Nộp ngày {selected.submittedDate} · {selected.type === 'VENUE' ? 'Hồ sơ cụm sân' : 'Hồ sơ huấn luyện viên'}</p></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/55 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Đơn vị / Cá nhân</p><p className="mt-2 text-sm font-black">{selected.ownerName}</p><p className="mt-1 text-xs text-muted-foreground">{selected.phone}</p></div>
              <div className="rounded-2xl bg-muted/55 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Địa chỉ đăng ký</p><p className="mt-2 text-sm font-semibold leading-relaxed">{selected.address}</p></div>
            </div>

            <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">Thông tin khai báo</p><p className="mt-2 rounded-2xl border border-border bg-background/50 p-4 text-sm leading-relaxed">{selected.details}</p></div>

            <div className="mt-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-primary">Chứng từ đính kèm</p><span className="text-[11px] text-muted-foreground">{selected.documents.length} tài liệu</span></div><div className="mt-3 grid gap-3 sm:grid-cols-2">{selected.documents.map((document) => <button type="button" key={document.id} onClick={() => showToast(`Đang mở ${document.name} (mô phỏng).`, 'info')} className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3 text-left transition hover:border-primary/35"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300"><FileText className="h-5 w-5" /></span><span className="min-w-0"><strong className="block truncate text-xs">{document.name}</strong><span className="mt-1 block text-[10px] uppercase text-muted-foreground">{document.type} · {document.fileSize}</span></span></button>)}</div></div>

            <div className="mt-5 space-y-2"><label htmlFor="kyc-note" className="text-xs font-bold uppercase tracking-wider text-primary">Ghi chú kiểm duyệt</label><textarea id="kyc-note" rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm leading-relaxed outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-ring/40" /></div>

            {selected.rejectionReason && <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-800 dark:text-orange-200"><strong>{selected.status === 'NEEDS_SUPPLEMENT' ? 'Nội dung cần bổ sung:' : 'Lý do từ chối:'}</strong> {selected.rejectionReason}</div>}

            {selected.sourceAccountEmail && <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground"><p className="font-black">Tài khoản đang được xác minh</p><p className="mt-2 break-all text-muted-foreground">{selected.sourceAccountEmail}</p></div>}

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button variant="outline" disabled={selected.status !== 'PENDING'} onClick={handleRequestSupplement}><Send /> Yêu cầu bổ sung</Button>
              <Button variant="destructive" disabled={selected.status !== 'PENDING'} onClick={handleReject}><XCircle /> Từ chối</Button>
              <Button disabled={selected.status !== 'PENDING'} onClick={handleApprove}><CheckCircle2 /> Phê duyệt xác minh</Button>
            </div>
          </article>
        ) : <div className="brand-card flex min-h-[500px] items-center justify-center rounded-3xl p-8 text-sm text-muted-foreground">Chọn một hồ sơ để thẩm định.</div>}
      </section>
    </div>
  )
}
