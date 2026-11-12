import { useMemo, useState } from 'react'
import { AlertTriangle, Building2, CalendarClock, CheckCircle2, Clock3, QrCode, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CoachBillingTabs } from '@/components/layout/CoachBillingTabs'
import { COACH_LINK_FEE, COACH_LINK_FEE_DUE_DAYS, buildCoachLinkInvoices, nextCoachLinkInvoiceDate, type CoachLinkInvoice } from '@/lib/coachLinkFees'
import { cn } from '@/lib/utils'
import { useCoachLinkFeeStore } from '@/store/useCoachLinkFeeStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'
const formatDate = (value: string) => new Date(value.length > 10 ? value : `${value}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const statusMeta: Record<CoachLinkInvoice['status'], { label: string; className: string }> = {
  PAID: { label: 'Đã thanh toán', className: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  UNPAID: { label: 'Chờ thanh toán', className: 'border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  OVERDUE: { label: 'Quá hạn', className: 'border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300' },
}

export function CoachLinkFeesPage() {
  const { coachAccount, coachAffiliations, showToast } = useFitlyoStore()
  const payments = useCoachLinkFeeStore((state) => state.payments)
  const payInvoices = useCoachLinkFeeStore((state) => state.payInvoices)
  const [paying, setPaying] = useState<CoachLinkInvoice[] | null>(null)

  const activeLinks = coachAffiliations.filter((item) => item.coachId === coachAccount.id && item.status === 'ACTIVE' && item.linkedAt)
  const invoices = useMemo(() => buildCoachLinkInvoices({ coachId: coachAccount.id, affiliations: coachAffiliations, payments }), [coachAccount.id, coachAffiliations, payments])
  const unpaid = invoices.filter((invoice) => invoice.status !== 'PAID')
  const overdue = unpaid.filter((invoice) => invoice.status === 'OVERDUE')
  const unpaidTotal = unpaid.reduce((sum, invoice) => sum + invoice.amount, 0)

  const confirmPaid = (items: CoachLinkInvoice[], transferContent: string) => {
    const payment = payInvoices({
      coachId: coachAccount.id,
      invoices: items.map(({ id, affiliationId, venueName, periodStart, periodEnd, amount }) => ({ id, affiliationId, venueName, periodStart, periodEnd, amount })),
      transferContent,
    })
    setPaying(null)
    if (!payment) return showToast('Các hoá đơn này đã được thanh toán trước đó.', 'error')
    showToast(`Đã ghi nhận thanh toán ${formatVND(payment.amount)} cho ${payment.invoices.length} hoá đơn qua VietQR.`, 'success')
  }

  return <div className="space-y-6 pb-12">
    <header className="border-b border-border/60 pb-5">
      <CoachBillingTabs />
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">Mỗi cụm sân liên kết thành công, Coach thanh toán phí <b className="text-foreground">{formatVND(COACH_LINK_FEE)}/tháng</b>. Hoá đơn được phát hàng tháng theo <b className="text-foreground">ngày liên kết</b> của từng sân và thanh toán qua VietQR trong {COACH_LINK_FEE_DUE_DAYS} ngày kể từ ngày phát.</p>
    </header>

    {overdue.length > 0 && <div role="alert" className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-200">
      <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-black">Có {overdue.length} hoá đơn quá hạn</p><p className="mt-0.5">Tổng {formatVND(overdue.reduce((sum, invoice) => sum + invoice.amount, 0))}. Vui lòng thanh toán để duy trì liên kết với cụm sân.</p></div></div>
      <Button size="sm" variant="destructive" onClick={() => setPaying(overdue)} className="gap-1.5"><QrCode className="h-4 w-4" />Thanh toán các khoản quá hạn</Button>
    </div>}

    <section className="grid gap-4 sm:grid-cols-3">
      {[
        { label: 'Cần thanh toán', value: formatVND(unpaidTotal), note: `${unpaid.length} hoá đơn chưa thanh toán`, icon: Clock3, tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
        { label: 'Sân đang liên kết', value: `${activeLinks.length} cụm sân`, note: `${formatVND(activeLinks.length * COACH_LINK_FEE)} / tháng`, icon: Building2, tone: 'bg-primary/10 text-primary' },
        { label: 'Đã thanh toán', value: formatVND(invoices.filter((invoice) => invoice.status === 'PAID').reduce((sum, invoice) => sum + invoice.amount, 0)), note: `${invoices.filter((invoice) => invoice.status === 'PAID').length} hoá đơn`, icon: CheckCircle2, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
      ].map((card) => {
        const Icon = card.icon
        return <div key={card.label} className="rounded-2xl border bg-card p-5 shadow-sm"><div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', card.tone)}><Icon className="h-4 w-4" /></div><p className="mt-3 text-xs font-semibold text-muted-foreground">{card.label}</p><p className="mt-1 text-xl font-black">{card.value}</p><p className="mt-1 text-xs text-muted-foreground">{card.note}</p></div>
      })}
    </section>

    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="font-black">Cụm sân đang liên kết</h2>
      {!activeLinks.length
        ? <p className="mt-3 text-sm text-muted-foreground">Bạn chưa liên kết cụm sân nào nên chưa phát sinh phí.</p>
        : <ul className="mt-3 grid gap-3 md:grid-cols-2">{activeLinks.map((link) => <li key={link.id} className="rounded-2xl border bg-background/40 p-4">
          <p className="font-black">{link.venueName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Liên kết ngày {formatDate(link.linkedAt!)} · {formatVND(COACH_LINK_FEE)}/tháng</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold"><CalendarClock className="h-3.5 w-3.5 text-primary" />Hoá đơn kế tiếp: {formatDate(nextCoachLinkInvoiceDate(link.linkedAt!))}</p>
        </li>)}</ul>}
    </section>

    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div><h2 className="font-black">Hoá đơn phí liên kết</h2><p className="mt-1 text-xs text-muted-foreground">Mỗi hoá đơn tính cho 1 tháng kể từ ngày phát.</p></div>
        {unpaid.length > 1 && <Button onClick={() => setPaying(unpaid)} className="gap-2"><QrCode className="h-4 w-4" />Thanh toán tất cả · {formatVND(unpaidTotal)}</Button>}
      </div>
      {!invoices.length
        ? <div className="p-12 text-center text-sm text-muted-foreground">Chưa có hoá đơn nào.</div>
        : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground"><tr>{['Cụm sân', 'Kỳ phí', 'Ngày phát', 'Hạn thanh toán', 'Số tiền', 'Trạng thái', ''].map((label) => <th key={label} className="px-4 py-3 font-black">{label}</th>)}</tr></thead>
          <tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t border-border/70">
            <td className="px-4 py-3 font-bold">{invoice.venueName}</td>
            <td className="px-4 py-3">{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</td>
            <td className="px-4 py-3">{formatDate(invoice.issueDate)}</td>
            <td className="px-4 py-3">{formatDate(invoice.dueDate)}</td>
            <td className="px-4 py-3 font-black text-primary">{formatVND(invoice.amount)}</td>
            <td className="px-4 py-3"><Badge variant="outline" className={statusMeta[invoice.status].className}>{statusMeta[invoice.status].label}</Badge>{invoice.paidAt && <p className="mt-1 text-[11px] text-muted-foreground">{new Date(invoice.paidAt).toLocaleString('vi-VN')}</p>}</td>
            <td className="px-4 py-3 text-right">{invoice.status !== 'PAID' && <Button size="sm" variant="outline" onClick={() => setPaying([invoice])}>Thanh toán</Button>}</td>
          </tr>)}</tbody>
        </table></div>}
    </section>

    {paying && <VietQrDialog invoices={paying} coachId={coachAccount.id} onClose={() => setPaying(null)} onConfirm={confirmPaid} />}
  </div>
}

function VietQrDialog({ invoices, coachId, onClose, onConfirm }: { invoices: CoachLinkInvoice[]; coachId: string; onClose: () => void; onConfirm: (invoices: CoachLinkInvoice[], transferContent: string) => void }) {
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const [transferContent] = useState(() => `FITLYO LIENKET ${coachId.toUpperCase()} ${Date.now().toString().slice(-6)}`)
  const [confirming, setConfirming] = useState(false)
  return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-foreground/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="coach-link-fee-title" className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Phí liên kết sân · VietQR</p><h2 id="coach-link-fee-title" className="mt-1 text-xl font-black">{invoices.length === 1 ? invoices[0].venueName : `${invoices.length} hoá đơn`}</h2></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X /></Button></div>
    <div className="mt-5 rounded-2xl border border-dashed border-primary/25 bg-white p-5 text-center text-[#143F42]">
      <QrCode className="mx-auto h-28 w-28" />
      <p className="mt-2 text-xs font-semibold">Quét mã bằng ứng dụng ngân hàng (mô phỏng)</p>
      <p className="mt-3 text-2xl font-black">{formatVND(total)}</p>
      <p className="mt-1 font-mono text-[11px] font-black">{transferContent}</p>
    </div>
    <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">{invoices.map((invoice) => <li key={invoice.id} className="flex justify-between gap-3"><span className="truncate">{invoice.venueName} · {formatDate(invoice.periodStart)}–{formatDate(invoice.periodEnd)}</span><span className="shrink-0 font-bold text-foreground">{formatVND(invoice.amount)}</span></li>)}</ul>
    <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Giữ nguyên nội dung chuyển khoản để FITLYO đối soát tự động.</p>
    {!confirming
      ? <Button className="mt-5 h-12 w-full gap-2" onClick={() => setConfirming(true)}><Sparkles className="h-4 w-4" />Tôi đã chuyển khoản {formatVND(total)}</Button>
      : <div className="mt-5 rounded-xl border border-primary/20 p-3"><p className="text-sm font-bold">Xác nhận đã chuyển {formatVND(total)} qua VietQR?</p><div className="mt-3 flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirming(false)}>Hủy</Button><Button onClick={() => onConfirm(invoices, transferContent)}><CheckCircle2 />Xác nhận</Button></div></div>}
  </section></div>
}
