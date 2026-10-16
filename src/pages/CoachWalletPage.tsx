import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BadgeDollarSign, Banknote, Clock3, Download, Landmark, LockKeyhole, WalletCards } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachWalletTransaction } from '@/types/pickleball'

const currency = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
}).format(value)

const transactionMeta: Record<CoachWalletTransaction['type'], { label: string; icon: typeof ArrowDownLeft; className: string }> = {
  ESCROW_IN: { label: 'Vào ký quỹ', icon: LockKeyhole, className: 'bg-teal-500/10 text-teal-700 dark:text-teal-300' },
  RELEASE: { label: 'Giải ngân', icon: ArrowDownLeft, className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  WITHDRAWAL: { label: 'Rút tiền', icon: ArrowUpRight, className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  PLATFORM_FEE: { label: 'Phí nền tảng', icon: BadgeDollarSign, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
}

export function CoachWalletPage() {
  const { coachAccount, coachWalletSummary, coachWalletTransactions, requestCoachWithdrawal, showToast } = useFitlyoStore()
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState(2000000)

  const handleWithdraw = () => {
    if (requestCoachWithdrawal(amount)) {
      setIsWithdrawOpen(false)
      setAmount(2000000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Tài chính Coach</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Thu nhập & Ví</h1><p className="mt-2 text-sm text-muted-foreground">Theo dõi tiền ký quỹ, lịch giải ngân và yêu cầu rút tiền.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => showToast('Đã tạo báo cáo thu nhập tháng 10 (mô phỏng).', 'success')}><Download /> Xuất báo cáo</Button><Button onClick={() => setIsWithdrawOpen(true)}><Banknote /> Rút tiền</Button></div>
      </div>

      <section className="brand-gradient overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/75"><WalletCards className="h-4 w-4" /> Số dư khả dụng</p><p className="mt-3 text-4xl font-black tracking-tight">{currency(coachWalletSummary.availableBalance)}</p><p className="mt-2 text-xs text-white/70">Có thể rút về {coachAccount.bankName} {coachAccount.bankAccountMasked}</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-white/70">Thu nhập tháng 10</p><p className="mt-1 text-2xl font-black">{currency(coachWalletSummary.earnedThisMonth)}</p><p className="mt-1 text-[11px] text-secondary">↑ 18% so với tháng 9</p></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Đang giữ trong Escrow', value: coachWalletSummary.escrowBalance, note: 'Giải ngân theo buổi hoàn thành', icon: LockKeyhole, color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300' },
          { label: 'Đang chờ thanh toán', value: coachWalletSummary.pendingPayout, note: 'Xử lý trong 1–2 ngày làm việc', icon: Clock3, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
          { label: 'Tài khoản nhận tiền', value: coachAccount.bankAccountMasked, note: coachAccount.bankName, icon: Landmark, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300', isText: true },
        ].map((item) => {
          const Icon = item.icon
          return <div key={item.label} className="brand-card rounded-2xl p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-xs font-semibold text-muted-foreground">{item.label}</p><p className="mt-1 text-xl font-black">{item.isText ? item.value : currency(item.value as number)}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.note}</p></div>
        })}
      </section>

      <section className="brand-card overflow-hidden rounded-3xl">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center"><div><h2 className="text-lg font-black">Lịch sử giao dịch</h2><p className="text-xs text-muted-foreground">Dòng tiền thuộc tài khoản {coachAccount.name}</p></div><Badge variant="outline">Tháng 10/2026</Badge></div>
        <div className="divide-y divide-border">
          {coachWalletTransactions.filter((transaction) => transaction.coachId === coachAccount.id).map((transaction) => {
            const meta = transactionMeta[transaction.type]
            const Icon = meta.icon
            return (
              <div key={transaction.id} className="flex flex-col gap-3 p-4 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.className}`}><Icon className="h-4 w-4" /></div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black">{transaction.description}</p><Badge variant="outline" className="text-[10px]">{meta.label}</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">{transaction.courseName} · {transaction.date} · #{transaction.id}</p></div></div>
                <div className="text-left sm:text-right"><p className={`text-sm font-black ${transaction.amount >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>{transaction.amount >= 0 ? '+' : ''}{currency(transaction.amount)}</p><p className={`mt-1 text-[10px] font-bold ${transaction.status === 'COMPLETED' ? 'text-emerald-600 dark:text-emerald-300' : transaction.status === 'PENDING' ? 'text-amber-600 dark:text-amber-300' : 'text-teal-600 dark:text-teal-300'}`}>{transaction.status === 'COMPLETED' ? 'Hoàn tất' : transaction.status === 'PENDING' ? 'Đang xử lý' : 'Đang tạm giữ'}</p></div>
              </div>
            )
          })}
        </div>
      </section>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Rút tiền về ngân hàng</DialogTitle><DialogDescription>Yêu cầu được đối soát và xử lý trong 1–2 ngày làm việc.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/15 bg-secondary/55 p-3 text-sm"><p className="text-xs text-muted-foreground">Tài khoản nhận</p><p className="mt-1 font-black">{coachAccount.bankName} · {coachAccount.bankAccountMasked}</p></div>
            <div className="space-y-2"><Label htmlFor="withdraw-amount">Số tiền muốn rút</Label><Input id="withdraw-amount" type="number" min={100000} step={100000} max={coachWalletSummary.availableBalance} value={amount} onChange={(event) => setAmount(Number(event.target.value))} /><p className="text-[11px] text-muted-foreground">Khả dụng: {currency(coachWalletSummary.availableBalance)}</p></div>
            <div className="flex flex-wrap gap-2">{[1000000, 2000000, 5000000].map((preset) => <button key={preset} type="button" onClick={() => setAmount(preset)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-secondary/55">{currency(preset)}</button>)}</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>Hủy</Button><Button onClick={handleWithdraw}>Xác nhận rút {currency(amount)}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
