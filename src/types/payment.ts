export type PaymentService = 'SOCIAL' | 'COURT' | 'COACH' | 'VIP'

export type PaymentMethod = 'WALLET' | 'VIETQR' | 'CASH'

export type PaymentStatus =
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'PAYMENT_FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FORFEITED'

export interface PaymentTimelineEvent {
  status: PaymentStatus
  at: string
  label: string
}

export interface PaymentRecord {
  id: string
  referenceId: string
  service: PaymentService
  title: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  method?: PaymentMethod
  status: PaymentStatus
  createdAt: string
  paymentExpiresAt?: string
  paidAt?: string
  completedAt?: string
  cancelledAt?: string
  refundAmount?: number
  refundedAt?: string
  refundReason?: string
  voucherAmount?: number
  voucherExpiresAt?: string
  timeline: PaymentTimelineEvent[]
}

export interface PaymentActionResult {
  success: boolean
  message: string
  paymentId?: string
}
