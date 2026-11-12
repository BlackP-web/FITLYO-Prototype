import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CoachLinkFeePayment, CoachLinkInvoiceSnapshot } from '@/lib/coachLinkFees'

interface CoachLinkFeeState {
  payments: CoachLinkFeePayment[]
  /** Thanh toán 1 hoặc nhiều hoá đơn phí liên kết sân; bỏ qua hoá đơn đã thanh toán. */
  payInvoices: (input: { coachId: string; invoices: CoachLinkInvoiceSnapshot[]; transferContent: string }) => CoachLinkFeePayment | null
}

const coachLinkFeeStorageKey = 'fitlyo-coach-link-fees-v1'

export const useCoachLinkFeeStore = create<CoachLinkFeeState>()(
  persist(
    (set, get) => ({
      payments: [],
      payInvoices: ({ coachId, invoices, transferContent }) => {
        const paidIds = new Set(get().payments.filter((payment) => payment.coachId === coachId).flatMap((payment) => payment.invoices.map((item) => item.id)))
        const pending = invoices.filter((item) => !paidIds.has(item.id))
        const amount = pending.reduce((sum, item) => sum + item.amount, 0)
        if (!pending.length || amount <= 0) return null
        const payment: CoachLinkFeePayment = {
          id: `LINKFEE-${Date.now().toString().slice(-8)}`,
          coachId,
          invoices: pending,
          amount,
          transferContent,
          paidAt: new Date().toISOString(),
        }
        set((state) => ({ payments: [payment, ...state.payments] }))
        return payment
      },
    }),
    { name: coachLinkFeeStorageKey, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === coachLinkFeeStorageKey) void useCoachLinkFeeStore.persist.rehydrate()
  })
}
