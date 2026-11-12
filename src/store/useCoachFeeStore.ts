import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** Một lần Coach thanh toán phí nền tảng qua VietQR (có thể gồm nhiều mục). */
export interface CoachFeePayment {
  id: string
  coachId: string
  itemIds: string[]
  amount: number
  method: 'VIETQR'
  transferContent: string
  paidAt: string
}

interface CoachFeeState {
  payments: CoachFeePayment[]
  /** Ghi nhận đã thanh toán các mục; bỏ qua mục đã thanh toán trước đó. Trả về lần thanh toán mới. */
  payFees: (input: { coachId: string; items: Array<{ id: string; feeAmount: number }>; transferContent: string }) => CoachFeePayment | null
}

const coachFeeStorageKey = 'fitlyo-coach-fees-v1'

export const useCoachFeeStore = create<CoachFeeState>()(
  persist(
    (set, get) => ({
      payments: [],
      payFees: ({ coachId, items, transferContent }) => {
        const paid = new Set(get().payments.filter((payment) => payment.coachId === coachId).flatMap((payment) => payment.itemIds))
        const pending = items.filter((item) => !paid.has(item.id))
        const amount = pending.reduce((sum, item) => sum + item.feeAmount, 0)
        if (!pending.length || amount <= 0) return null
        const payment: CoachFeePayment = {
          id: `FEE-${Date.now().toString().slice(-8)}`,
          coachId,
          itemIds: pending.map((item) => item.id),
          amount,
          method: 'VIETQR',
          transferContent,
          paidAt: new Date().toISOString(),
        }
        set((state) => ({ payments: [payment, ...state.payments] }))
        return payment
      },
    }),
    { name: coachFeeStorageKey, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

// Đồng bộ giữa các tab đang mở.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === coachFeeStorageKey) void useCoachFeeStore.persist.rehydrate()
  })
}
