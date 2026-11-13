import { useMemo, useState } from 'react'
import { AlertTriangle, BookOpenCheck, CheckCircle2, Clock3, QrCode, Receipt, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CoachBillingTabs } from '@/components/layout/CoachBillingTabs'
import { coachFeeSample } from '@/mocks/coachFeeSample'
import { COACH_FEE_DUE_DAYS, COACH_FEE_RATE, buildCoachFeeItems, coachFeeDueDate, coachFeeOverdueDays, type CoachFeeItem } from '@/lib/coachFees'
import { cn } from '@/lib/utils'
import { useCoachBookingStore } from '@/store/useCoachBookingStore'
import { useCoachFeeStore } from '@/store/useCoachFeeStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'
const formatDate = (value: string) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const ratePercent = `${Math.round(COACH_FEE_RATE * 100)}%`

export function CoachCoachingFeesPage() {
  const { coachAccount, coachCourses, showToast } = useFitlyoStore()
  const bookings = useCoachBookingStore((state) => state.bookings)
  const payments = useCoachFeeStore((state) => state.payments)
  const payFees = useCoachFeeStore((state) => state.payFees)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkout, setCheckout] = useState<CoachFeeItem[] | null>(null)

  const items = useMemo(() => buildCoachFeeItems({ coachId: coachAccount.id, bookings, courses: coachCourses, samples: coachFeeSample }), [bookings, coachAccount.id, coachCourses])
  const myPayments = payments.filter((payment) => payment.coachId === coachAccount.id)
  const paidIds = new Set(myPayments.flatMap((payment) => payment.itemIds))
  const unpaid = items.filter((item) => !paidIds.has(item.id))
  const selected = unpaid.filter((item) => selectedIds.includes(item.id))
  const allSelected = unpaid.length > 0 && selected.length === unpaid.length
  const unpaidTotal = unpaid.reduce((sum, item) => sum + item.feeAmount, 0)
  // Quá 5 ngày kể từ ngày hoàn thành mà chưa thanh toán → cảnh báo.
  const overdue = unpaid.filter((item) => coachFeeOverdueDays(item.completedDate) > 0)
  const overdueTotal = overdue.reduce((sum, item) => sum + item.feeAmount, 0)
  const paidTotal = myPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const selectedTotal = selected.reduce((sum, item) => sum + item.feeAmount, 0)
  // Thời điểm thanh toán của từng mục đã trả.
  const paidAtById = new Map<string, string>(myPayments.flatMap((payment) => payment.itemIds.map((id) => [id, payment.paidAt] as [string, string])))

  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const confirmPaid = (paying: CoachFeeItem[], transferContent: string) => {
    const payment = payFees({ coachId: coachAccount.id, items: paying.map((item) => ({ id: item.id, feeAmount: item.feeAmount })), transferContent })
    if (!payment) return showToast('Các mục này đã được thanh toán trước đó.', 'error')
    setSelectedIds((current) => current.filter((id) => !payment.itemIds.includes(id)))
    setCheckout(null)
    showToast(`Đã ghi nhận thanh toán ${formatVND(payment.amount)} cho ${payment.itemIds.length} mục qua VietQR.`, 'success')
  }

  return <div className="space-y-6 pb-28">
    <header className="border-b border-border/60 pb-5">
      <CoachBillingTabs />
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">Mỗi buổi học hoặc khóa học đã hoàn thành, Coach thanh toán cho FITLYO <b className="text-foreground">{ratePercent}</b> số tiền của buổi học / khóa học đó, trong vòng <b className="text-foreground">{COACH_FEE_DUE_DAYS} ngày</b> kể từ ngày hoàn thành. Có thể thanh toán từng mục hoặc chọn nhiều mục để thanh toán một lần qua VietQR.</p>
    </header>

    {overdue.length > 0 && <div role="alert" className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-200">
      <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-black">Có {overdue.length} khoản phí coaching quá hạn thanh toán</p><p className="mt-0.5">Đã quá {COACH_FEE_DUE_DAYS} ngày kể từ khi hoàn thành buổi học / khóa học. Tổng {formatVND(overdueTotal)}, vui lòng thanh toán sớm.</p></div></div>
      <Button size="sm" variant="destructive" onClick={() => setCheckout(overdue)} className="gap-1.5"><QrCode className="h-4 w-4" />Thanh toán các khoản quá hạn</Button>
    </div>}

    <section className="grid gap-4 sm:grid-cols-3">
      {[
        { label: 'Cần thanh toán', value: formatVND(unpaidTotal), note: `${unpaid.length} mục chưa thanh toán`, icon: Clock3, tone: 'text-amber-700 bg-amber-500/10 dark:text-amber-300' },
        { label: 'Đã thanh toán', value: formatVND(paidTotal), note: `${paidIds.size} mục · ${myPayments.length} lần thanh toán`, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-300' },
        { label: 'Mức phí', value: ratePercent, note: 'Trên số tiền mỗi buổi học / khóa học', icon: Receipt, tone: 'text-primary bg-primary/10' },
      ].map((card) => {
        const Icon = card.icon
        return <div key={card.label} className="rounded-2xl border bg-card p-5 shadow-sm"><div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', card.tone)}><Icon className="h-4 w-4" /></div><p className="mt-3 text-xs font-semibold text-muted-foreground">{card.label}</p><p className="mt-1 text-xl font-black">{card.value}</p><p className="mt-1 text-xs text-muted-foreground">{card.note}</p></div>
      })}
    </section>

    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div><h2 className="font-black">Hoá đơn phí coaching</h2><p className="mt-1 text-xs text-muted-foreground">Mỗi buổi học / khóa học hoàn thành phát sinh phí {ratePercent}, thanh toán trong {COACH_FEE_DUE_DAYS} ngày. Tích chọn để thanh toán gộp nhiều mục.</p></div>
        {unpaid.length > 1 && <Button onClick={() => setCheckout(unpaid)} className="gap-2"><QrCode className="h-4 w-4" />Thanh toán tất cả · {formatVND(unpaidTotal)}</Button>}
      </div>
      {!items.length
        ? <div className="p-12 text-center text-sm text-muted-foreground">Chưa có buổi học hoặc khóa học nào hoàn thành.</div>
        : <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground"><tr>
            <th className="w-10 px-4 py-3"><input type="checkbox" checked={allSelected} disabled={!unpaid.length} onChange={() => setSelectedIds(allSelected ? [] : unpaid.map((item) => item.id))} className="h-4 w-4 accent-[#143F42]" aria-label="Chọn tất cả mục chưa thanh toán" /></th>
            {['Buổi học / Khóa học', 'Ngày hoàn thành', 'Hạn thanh toán', 'Số tiền', 'Trạng thái', ''].map((label) => <th key={label} className="px-4 py-3 font-black">{label}</th>)}
          </tr></thead>
          <tbody>{items.map((item) => {
            const paid = paidAtById.get(item.id)
            const overdueDays = paid ? 0 : coachFeeOverdueDays(item.completedDate)
            const checked = selectedIds.includes(item.id)
            return <tr key={item.id} className={cn('border-t border-border/70 align-top', checked && 'bg-primary/5')}>
              <td className="px-4 py-3">{!paid && <input type="checkbox" checked={checked} onChange={() => toggle(item.id)} className="mt-1 h-4 w-4 accent-[#143F42]" aria-label={`Chọn ${item.title}`} />}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className={item.kind === 'COURSE' ? 'border-violet-400/50 text-violet-700 dark:text-violet-300' : 'border-sky-400/50 text-sky-700 dark:text-sky-300'}>{item.kind === 'COURSE' ? <BookOpenCheck className="mr-1 h-3 w-3" /> : null}{item.kind === 'COURSE' ? 'Khóa học' : 'Buổi học'}</Badge>
                <p className="mt-1 font-bold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </td>
              <td className="px-4 py-3">{formatDate(item.completedDate)}</td>
              <td className="px-4 py-3">{item.completedDate ? formatDate(coachFeeDueDate(item.completedDate)) : '—'}</td>
              <td className="px-4 py-3"><p className="font-black text-primary">{formatVND(item.feeAmount)}</p><p className="text-[11px] text-muted-foreground">{ratePercent} của {formatVND(item.grossAmount)}</p></td>
              <td className="px-4 py-3">{paid
                ? <><Badge variant="outline" className="border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Đã thanh toán</Badge><p className="mt-1 text-[11px] text-muted-foreground">{new Date(paid).toLocaleString('vi-VN')}</p></>
                : overdueDays > 0
                  ? <Badge variant="outline" className="border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300">Quá hạn {overdueDays} ngày</Badge>
                  : <Badge variant="outline" className="border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-300">Chờ thanh toán</Badge>}</td>
              <td className="px-4 py-3 text-right">{!paid && <Button size="sm" variant="outline" onClick={() => setCheckout([item])}>Thanh toán</Button>}</td>
            </tr>
          })}</tbody>
        </table></div>}
    </section>

    {selected.length > 0 && <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 backdrop-blur md:left-72">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm"><b>{selected.length}</b> mục đã chọn · Tổng phí <b className="text-primary">{formatVND(selectedTotal)}</b></p>
        <Button onClick={() => setCheckout(selected)} className="gap-2"><QrCode className="h-4 w-4" />Thanh toán {selected.length} mục</Button>
      </div>
    </div>}

    {checkout && <VietQrDialog items={checkout} coachId={coachAccount.id} onClose={() => setCheckout(null)} onConfirm={confirmPaid} />}
  </div>
}

function VietQrDialog({ items, coachId, onClose, onConfirm }: { items: CoachFeeItem[]; coachId: string; onClose: () => void; onConfirm: (items: CoachFeeItem[], transferContent: string) => void }) {
  const total = items.reduce((sum, item) => sum + item.feeAmount, 0)
  const [transferContent] = useState(() => `FITLYO PHI ${coachId.toUpperCase()} ${Date.now().toString().slice(-6)}`)
  const [confirming, setConfirming] = useState(false)
  return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-foreground/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="coach-fee-qr-title" className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-primary">Phí coaching · VietQR</p><h2 id="coach-fee-qr-title" className="mt-1 text-xl font-black">{items.length === 1 ? items[0].title : `${items.length} mục phí`}</h2></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X /></Button></div>
    <div className="mt-5 rounded-2xl border border-dashed border-primary/25 bg-white p-5 text-center text-[#143F42]">
      <QrCode className="mx-auto h-28 w-28" />
      <p className="mt-2 text-xs font-semibold">Quét mã bằng ứng dụng ngân hàng (mô phỏng)</p>
      <p className="mt-3 text-2xl font-black">{formatVND(total)}</p>
      <p className="mt-1 font-mono text-[11px] font-black">{transferContent}</p>
    </div>
    <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">{items.map((item) => <li key={item.id} className="flex justify-between gap-3"><span className="truncate">{item.title}</span><span className="shrink-0 font-bold text-foreground">{formatVND(item.feeAmount)}</span></li>)}</ul>
    <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Giữ nguyên nội dung chuyển khoản để FITLYO đối soát tự động.</p>
    {!confirming
      ? <Button className="mt-5 h-12 w-full gap-2" onClick={() => setConfirming(true)}><Sparkles className="h-4 w-4" />Tôi đã chuyển khoản {formatVND(total)}</Button>
      : <div className="mt-5 rounded-xl border border-primary/20 p-3"><p className="text-sm font-bold">Xác nhận đã chuyển {formatVND(total)} qua VietQR?</p><div className="mt-3 flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirming(false)}>Hủy</Button><Button onClick={() => onConfirm(items, transferContent)}><CheckCircle2 />Xác nhận</Button></div></div>}
  </section></div>
}
