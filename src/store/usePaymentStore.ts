import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  PaymentActionResult,
  PaymentMethod,
  PaymentRecord,
  PaymentService,
  PaymentStatus,
} from '@/types/payment'

interface AwaitingPaymentInput {
  referenceId: string
  service: PaymentService
  title: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentExpiresAt?: string
}

interface RefundInput {
  referenceId: string
  amount: number
  reason: string
  voucherAmount?: number
  voucherExpiresAt?: string
}

interface PaymentState {
  records: PaymentRecord[]
  createAwaitingPayment: (input: AwaitingPaymentInput) => PaymentActionResult
  confirmPayment: (referenceId: string, method: PaymentMethod) => PaymentActionResult
  markCompleted: (referenceId: string) => PaymentActionResult
  markExpired: (referenceId: string) => PaymentActionResult
  markFailed: (referenceId: string, message?: string) => PaymentActionResult
  refundPayment: (input: RefundInput) => PaymentActionResult
  forfeitPayment: (referenceId: string, reason: string) => PaymentActionResult
  adjustConfirmedAmount: (referenceId: string, newAmount: number, label: string) => PaymentActionResult
  resetPayments: () => void
}

const labelByStatus: Record<PaymentStatus, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã thanh toán và xác nhận',
  COMPLETED: 'Hoàn tất',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  EXPIRED: 'Hết thời gian giữ chỗ',
  CANCELLED: 'Đã hủy',
  REFUND_PENDING: 'Đang hoàn tiền',
  PARTIALLY_REFUNDED: 'Đã hoàn một phần',
  REFUNDED: 'Đã hoàn tiền',
  FORFEITED: 'Không hoàn phí',
}

const timelineEvent = (status: PaymentStatus, label = labelByStatus[status]) => ({
  status,
  at: new Date().toISOString(),
  label,
})

const storageKey = 'fitlyo-payment-ledger-v1'

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      records: [],

      createAwaitingPayment: (input) => {
        const existing = get().records.find((record) => record.referenceId === input.referenceId)
        if (existing) return { success: true, message: 'Giao dịch đã được tạo.', paymentId: existing.id }
        const payment: PaymentRecord = {
          id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...input,
          status: 'AWAITING_PAYMENT',
          createdAt: new Date().toISOString(),
          timeline: [
            timelineEvent('AWAITING_PAYMENT', input.paymentExpiresAt ? 'Đã giữ chỗ · Chờ thanh toán' : 'Chờ thanh toán'),
          ],
        }
        set((state) => ({ records: [payment, ...state.records] }))
        return { success: true, message: 'Đã tạo yêu cầu thanh toán.', paymentId: payment.id }
      },

      confirmPayment: (referenceId, method) => {
        const record = get().records.find((item) => item.referenceId === referenceId)
        if (!record || record.status !== 'AWAITING_PAYMENT') return { success: false, message: 'Giao dịch không còn ở trạng thái chờ thanh toán.' }
        if (record.paymentExpiresAt && Date.now() >= new Date(record.paymentExpiresAt).getTime()) {
          get().markExpired(referenceId)
          return { success: false, message: 'Thời gian giữ chỗ đã hết. Slot đã được mở lại.' }
        }
        set((state) => ({
          records: state.records.map((item) => item.referenceId === referenceId ? {
            ...item,
            method,
            status: 'CONFIRMED',
            paidAt: new Date().toISOString(),
            timeline: [...item.timeline, timelineEvent('CONFIRMED')],
          } : item),
        }))
        return { success: true, message: 'Thanh toán thành công.', paymentId: record.id }
      },

      markCompleted: (referenceId) => {
        const record = get().records.find((item) => item.referenceId === referenceId)
        if (!record) return { success: false, message: 'Không tìm thấy giao dịch.' }
        set((state) => ({ records: state.records.map((item) => item.referenceId === referenceId ? {
          ...item,
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          timeline: [...item.timeline, timelineEvent('COMPLETED')],
        } : item) }))
        return { success: true, message: 'Dịch vụ đã hoàn tất.', paymentId: record.id }
      },

      markExpired: (referenceId) => {
        const record = get().records.find((item) => item.referenceId === referenceId)
        if (!record || record.status !== 'AWAITING_PAYMENT') return { success: false, message: 'Không thể hết hạn giao dịch này.' }
        set((state) => ({ records: state.records.map((item) => item.referenceId === referenceId ? {
          ...item,
          status: 'EXPIRED',
          timeline: [...item.timeline, timelineEvent('EXPIRED')],
        } : item) }))
        return { success: true, message: 'Đã hết thời gian giữ chỗ.', paymentId: record.id }
      },

      markFailed: (referenceId, message = 'Thanh toán thất bại') => {
        const record = get().records.find((item) => item.referenceId === referenceId)
        if (!record) return { success: false, message: 'Không tìm thấy giao dịch.' }
        set((state) => ({ records: state.records.map((item) => item.referenceId === referenceId ? {
          ...item,
          status: 'PAYMENT_FAILED',
          timeline: [...item.timeline, timelineEvent('PAYMENT_FAILED', message)],
        } : item) }))
        return { success: true, message, paymentId: record.id }
      },

      refundPayment: ({ referenceId, amount, reason, voucherAmount, voucherExpiresAt }) => {
        const record = get().records.find((item) => item.referenceId === referenceId)
        if (!record || !['CONFIRMED', 'COMPLETED', 'PARTIALLY_REFUNDED'].includes(record.status)) return { success: false, message: 'Giao dịch không thể hoàn tiền ở trạng thái hiện tại.' }
        const previousRefund = record.refundAmount ?? 0
        const safeAmount = Math.min(Math.max(0, amount), Math.max(0, record.paidAmount - previousRefund))
        const totalRefund = previousRefund + safeAmount
        const nextStatus: PaymentStatus = totalRefund >= record.paidAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
        const now = new Date().toISOString()
        set((state) => ({ records: state.records.map((item) => item.referenceId === referenceId ? {
          ...item,
          status: nextStatus,
          cancelledAt: now,
          refundAmount: totalRefund,
          refundedAt: now,
          refundReason: reason,
          voucherAmount,
          voucherExpiresAt,
          timeline: [
            ...item.timeline,
            timelineEvent('CANCELLED', reason),
            timelineEvent('REFUND_PENDING', `Đang hoàn ${safeAmount.toLocaleString('vi-VN')}đ về Ví FITLYO`),
            timelineEvent(nextStatus, `Đã hoàn ${safeAmount.toLocaleString('vi-VN')}đ về Ví FITLYO`),
          ],
        } : item) }))
        return { success: true, message: `Đã hoàn ${safeAmount.toLocaleString('vi-VN')}đ về Ví FITLYO.`, paymentId: record.id }
      },

      forfeitPayment: (referenceId, reason) => {
        const record = get().records.find((item) => item.referenceId === referenceId)
        if (!record || !['CONFIRMED', 'COMPLETED', 'PARTIALLY_REFUNDED'].includes(record.status)) return { success: false, message: 'Giao dịch không thể chuyển sang trạng thái không hoàn phí.' }
        set((state) => ({ records: state.records.map((item) => item.referenceId === referenceId ? {
          ...item,
          status: 'FORFEITED',
          cancelledAt: new Date().toISOString(),
          refundAmount: item.refundAmount ?? 0,
          refundReason: reason,
          timeline: [...item.timeline, timelineEvent('CANCELLED', reason), timelineEvent('FORFEITED')],
        } : item) }))
        return { success: true, message: reason, paymentId: record.id }
      },

      adjustConfirmedAmount: (referenceId, newAmount, label) => {
        const record = get().records.find((item) => item.referenceId === referenceId)
        if (!record || record.status !== 'CONFIRMED') return { success: false, message: 'Không thể cập nhật giao dịch ở trạng thái hiện tại.' }
        const safeAmount = Math.max(0, newAmount)
        set((state) => ({ records: state.records.map((item) => item.referenceId === referenceId ? {
          ...item,
          totalAmount: safeAmount,
          paidAmount: safeAmount,
          remainingAmount: 0,
          timeline: [...item.timeline, timelineEvent('CONFIRMED', label)],
        } : item) }))
        return { success: true, message: label, paymentId: record.id }
      },

      resetPayments: () => set({ records: [] }),
    }),
    { name: storageKey, storage: createJSONStorage(() => window.localStorage), version: 1 },
  ),
)
