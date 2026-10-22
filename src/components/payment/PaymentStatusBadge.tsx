import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/types/payment'

const statusMeta: Record<PaymentStatus, { label: string; className: string }> = {
  AWAITING_PAYMENT: { label: 'Chờ thanh toán', className: 'border-blue-400/35 bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  CONFIRMED: { label: 'Đã thanh toán', className: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  COMPLETED: { label: 'Hoàn tất', className: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  PAYMENT_FAILED: { label: 'Thanh toán thất bại', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  EXPIRED: { label: 'Hết giữ chỗ', className: 'border-border bg-muted text-muted-foreground' },
  CANCELLED: { label: 'Đã hủy', className: 'border-border bg-muted text-muted-foreground' },
  REFUND_PENDING: { label: 'Đang hoàn tiền', className: 'border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  PARTIALLY_REFUNDED: { label: 'Đã hoàn một phần', className: 'border-violet-400/35 bg-violet-500/10 text-violet-700 dark:text-violet-300' },
  REFUNDED: { label: 'Đã hoàn tiền', className: 'border-violet-400/35 bg-violet-500/10 text-violet-700 dark:text-violet-300' },
  FORFEITED: { label: 'Không hoàn phí', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = statusMeta[status]
  return <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
}
