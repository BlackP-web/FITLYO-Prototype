import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, FileText, QrCode, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildOwnerTransactions } from '@/lib/ownerRevenue'
import { PLATFORM_FEE_RATE, buildPlatformInvoices, currentInvoicePreview, type PlatformInvoice } from '@/lib/platformInvoices'
import { cn } from '@/lib/utils'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePaymentStore } from '@/store/usePaymentStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'
const formatDate = (value: string) => new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const nextDay = (value: string) => {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const ratePercent = `${Math.round(PLATFORM_FEE_RATE * 100)}%`
const statusMeta: Record<PlatformInvoice['status'], { label: string; className: string }> = {
  PAID: { label: 'Đã thanh toán', className: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  UNPAID: { label: 'Chờ thanh toán', className: 'border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  OVERDUE: { label: 'Quá hạn', className: 'border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300' },
}

export function OwnerInvoicesPage() {
  const showToast = useFitlyoStore((state) => state.showToast)
  const venues = usePlayerStore((state) => state.venues)
  const matches = usePlayerStore((state) => state.matches)
  const bookings = useCrossRoleStore((state) => state.courtBookings)
  const events = useCrossRoleStore((state) => state.venueCalendarEvents)
  const invoicePayments = useCrossRoleStore((state) => state.platformInvoicePayments)
  const payPlatformInvoice = useCrossRoleStore((state) => state.payPlatformInvoice)
  const payments = usePaymentStore((state) => state.records)
  const [paying, setPaying] = useState<PlatformInvoice | null>(null)

  // Doanh thu tính giống trang Báo cáo doanh thu (doanh thu ròng, đã trừ khoản hoàn).
  const transactions = useMemo(() => buildOwnerTransactions({ bookings, events, matches, payments, venues }), [bookings, events, matches, payments, venues])
  const invoices = useMemo(() => buildPlatformInvoices(transactions, invoicePayments), [invoicePayments, transactions])
  const preview = useMemo(() => currentInvoicePreview(transactions), [transactions])
  const outstanding = invoices.filter((invoice) => invoice.status !== 'PAID')
  const outstandingTotal = outstanding.reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdue = outstanding.filter((invoice) => invoice.status === 'OVERDUE')

  const confirmPaid = (invoice: PlatformInvoice, transferContent: string) => {
    const ok = payPlatformInvoice({ invoiceId: invoice.id, amount: invoice.amount, transferContent, paidAt: new Date().toISOString() })
    setPaying(null)
    showToast(ok ? `Đã ghi nhận thanh toán hoá đơn ${invoice.id} (${formatVND(invoice.amount)}) qua VietQR.` : 'Hoá đơn này đã được thanh toán trước đó.', ok ? 'success' : 'error')
  }

  return <div className="space-y-6 pb-12">
    <header className="border-b border-border/60 pb-5">
      <div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_09</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · Phí nền tảng</span></div>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hoá đơn phí nền tảng</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Ngày <b className="text-foreground">25</b> hàng tháng, FITLYO xuất 1 hoá đơn bằng <b className="text-foreground">{ratePercent} tổng doanh thu</b> từ ngày 25 tháng trước đến hết ngày 24 tháng này. Chủ sân thanh toán qua VietQR <b className="text-foreground">trước ngày 1 tháng sau</b>.</p>
    </header>

    {overdue.length > 0 && <div className="flex items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-200"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-black">Có {overdue.length} hoá đơn quá hạn thanh toán</p><p className="mt-0.5">Vui lòng thanh toán sớm: {overdue.map((invoice) => `${invoice.id} (${formatVND(invoice.amount)})`).join(', ')}.</p></div></div>}

    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><Clock3 className="h-4 w-4" /></div><p className="mt-3 text-xs font-semibold text-muted-foreground">Cần thanh toán</p><p className="mt-1 text-xl font-black">{formatVND(outstandingTotal)}</p><p className="mt-1 text-xs text-muted-foreground">{outstanding.length} hoá đơn chưa thanh toán</p></div>
      <div className="rounded-2xl border bg-card p-5 shadow-sm md:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary"><CalendarClock className="h-4 w-4" />Kỳ hiện tại · tạm tính</p><p className="mt-1 text-sm text-muted-foreground">{formatDate(preview.periodStart)} – {formatDate(preview.periodEnd)} · xuất hoá đơn ngày {formatDate(preview.issueDate)}</p></div>
          <Badge variant="outline">Hạn thanh toán {formatDate(preview.dueDate)}</Badge>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Doanh thu đến hôm nay</p><p className="text-lg font-black">{formatVND(preview.revenue)}</p></div><div><p className="text-xs text-muted-foreground">Phí {ratePercent} dự kiến</p><p className="text-lg font-black text-primary">{formatVND(preview.amount)}</p></div></div>
      </div>
    </section>

    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="border-b p-5"><h2 className="font-black">Danh sách hoá đơn</h2><p className="mt-1 text-xs text-muted-foreground">Doanh thu được tính như trang Báo cáo doanh thu (đã trừ khoản hoàn). Hoá đơn đã thanh toán giữ nguyên số tiền lúc thanh toán.</p></div>
      {!invoices.length
        ? <div className="p-12 text-center text-sm text-muted-foreground"><FileText className="mx-auto mb-3 h-8 w-8" />Chưa có hoá đơn nào. Hoá đơn đầu tiên sẽ được xuất vào ngày {formatDate(preview.issueDate)}.</div>
        : <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground"><tr>{['Hoá đơn', 'Kỳ doanh thu', 'Doanh thu', `Phí ${ratePercent}`, 'Hạn thanh toán', 'Trạng thái', ''].map((label) => <th key={label} className="px-4 py-3 font-black">{label}</th>)}</tr></thead>
          <tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t border-border/70 align-top">
            <td className="px-4 py-3"><p className="font-black">{invoice.id}</p><p className="text-xs text-muted-foreground">Xuất ngày {formatDate(invoice.issueDate)}</p></td>
            <td className="px-4 py-3">{formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}{invoice.byVenue.length > 0 && <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">{invoice.byVenue.map((item) => <li key={item.venueName}>{item.venueName}: {formatVND(item.revenue)}</li>)}</ul>}</td>
            <td className="px-4 py-3 font-semibold">{formatVND(invoice.revenue)}</td>
            <td className="px-4 py-3 font-black text-primary">{formatVND(invoice.amount)}</td>
            <td className="px-4 py-3">{formatDate(invoice.dueDate)}<p className="text-[11px] text-muted-foreground">trước ngày {formatDate(nextDay(invoice.dueDate))}</p></td>
            <td className="px-4 py-3"><Badge variant="outline" className={statusMeta[invoice.status].className}>{statusMeta[invoice.status].label}</Badge>{invoice.payment && <p className="mt-1 text-[11px] text-muted-foreground">{new Date(invoice.payment.paidAt).toLocaleString('vi-VN')}</p>}</td>
            <td className="px-4 py-3 text-right">{invoice.status !== 'PAID' && (invoice.amount > 0
              ? <Button size="sm" onClick={() => setPaying(invoice)} className="gap-1.5"><QrCode className="h-4 w-4" />Thanh toán</Button>
              : <span className="text-xs text-muted-foreground">Không phát sinh phí</span>)}</td>
          </tr>)}</tbody>
        </table></div>}
    </section>

    {paying && <VietQrDialog invoice={paying} onClose={() => setPaying(null)} onConfirm={confirmPaid} />}
  </div>
}

function VietQrDialog({ invoice, onClose, onConfirm }: { invoice: PlatformInvoice; onClose: () => void; onConfirm: (invoice: PlatformInvoice, transferContent: string) => void }) {
  const transferContent = `FITLYO ${invoice.id}`
  const [confirming, setConfirming] = useState(false)
  return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-foreground/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="invoice-qr-title" className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Thanh toán hoá đơn · VietQR</p><h2 id="invoice-qr-title" className="mt-1 text-xl font-black">{invoice.id}</h2><p className="text-xs text-muted-foreground">Kỳ {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X /></Button></div>
    <div className="mt-5 rounded-2xl border border-dashed border-primary/25 bg-white p-5 text-center text-[#143F42]">
      <QrCode className="mx-auto h-28 w-28" />
      <p className="mt-2 text-xs font-semibold">Quét mã bằng ứng dụng ngân hàng (mô phỏng)</p>
      <p className="mt-3 text-2xl font-black">{formatVND(invoice.amount)}</p>
      <p className="mt-1 font-mono text-[11px] font-black">{transferContent}</p>
    </div>
    <dl className="mt-4 space-y-1 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Doanh thu kỳ</dt><dd className="font-bold">{formatVND(invoice.revenue)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Phí {ratePercent}</dt><dd className="font-black text-primary">{formatVND(invoice.amount)}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Hạn thanh toán</dt><dd className={cn('font-bold', invoice.status === 'OVERDUE' && 'text-rose-600')}>{formatDate(invoice.dueDate)}{invoice.status === 'OVERDUE' ? ' · quá hạn' : ''}</dd></div></dl>
    <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Giữ nguyên nội dung chuyển khoản để FITLYO đối soát tự động.</p>
    {!confirming
      ? <Button className="mt-5 h-12 w-full gap-2" onClick={() => setConfirming(true)}><Sparkles className="h-4 w-4" />Tôi đã chuyển khoản {formatVND(invoice.amount)}</Button>
      : <div className="mt-5 rounded-xl border border-primary/20 p-3"><p className="text-sm font-bold">Xác nhận đã chuyển {formatVND(invoice.amount)} qua VietQR cho hoá đơn {invoice.id}?</p><div className="mt-3 flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirming(false)}>Hủy</Button><Button onClick={() => onConfirm(invoice, transferContent)}><CheckCircle2 />Xác nhận</Button></div></div>}
  </section></div>
}
