import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CoachLinkFeePayment, CoachLinkInvoiceSnapshot } from '@/lib/coachLinkFees'

interface CoachLinkFeeState {
  payments: CoachLinkFeePayment[]
  /** Thanh toán 1 hoặc nhiều hoá đơn phí liên kết sân; bỏ qua hoá đơn đã thanh toán. */
  payInvoices: (input: { coachId: string; invoices: CoachLinkInvoiceSnapshot[]; transferContent: string }) => CoachLinkFeePayment | null
}

const coachLinkFeeStorageKey = 'fitlyo-coach-link-fees-v1'

const sampleInvoice = (affiliationId: string, venueName: string, periodStart: string, periodEnd: string): CoachLinkInvoiceSnapshot => ({
  id: `LINK-${affiliationId}-${periodStart}`, affiliationId, venueName, periodStart, periodEnd, amount: 69_000,
})

/** Dữ liệu mẫu: các hoá đơn phí liên kết sân tháng 9–10 của coach_dung đã thanh toán đúng hạn. */
const sampleCoachLinkFeePayments: CoachLinkFeePayment[] = [
  {
    id: 'LINKFEE-SAMPLE-03', coachId: 'coach_dung', amount: 69_000, transferContent: 'FITLYO LINKFEE coach_dung 2026-10',
    paidAt: '2026-10-06T02:15:00.000Z',
    invoices: [sampleInvoice('AFF-001', 'Cụm sân D-Sports Pickleball Thủ Đức', '2026-10-02', '2026-11-01')],
  },
  {
    id: 'LINKFEE-SAMPLE-02', coachId: 'coach_dung', amount: 69_000, transferContent: 'FITLYO LINKFEE coach_dung 2026-09B',
    paidAt: '2026-09-18T03:40:00.000Z',
    invoices: [sampleInvoice('AFF-002', 'D-Pickleball Thảo Điền', '2026-09-15', '2026-10-14')],
  },
  {
    id: 'LINKFEE-SAMPLE-01', coachId: 'coach_dung', amount: 69_000, transferContent: 'FITLYO LINKFEE coach_dung 2026-09A',
    paidAt: '2026-09-05T01:30:00.000Z',
    invoices: [sampleInvoice('AFF-001', 'Cụm sân D-Sports Pickleball Thủ Đức', '2026-09-02', '2026-10-01')],
  },
]

/** Gộp dữ liệu mẫu vào lịch sử đã lưu, bỏ qua hoá đơn mẫu đã được thanh toán trong localStorage. */
const withSamplePayments = (payments: CoachLinkFeePayment[] = []) => {
  const paidIds = new Set(payments.flatMap((payment) => payment.invoices.map((item) => item.id)))
  const samples = sampleCoachLinkFeePayments.filter((payment) => payment.invoices.every((item) => !paidIds.has(item.id)))
  return [...payments, ...samples].sort((a, b) => b.paidAt.localeCompare(a.paidAt))
}

export const useCoachLinkFeeStore = create<CoachLinkFeeState>()(
  persist(
    (set, get) => ({
      payments: sampleCoachLinkFeePayments,
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
    {
      name: coachLinkFeeStorageKey,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<CoachLinkFeeState>
        return { ...state, payments: withSamplePayments(state.payments) } as CoachLinkFeeState
      },
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === coachLinkFeeStorageKey) void useCoachLinkFeeStore.persist.rehydrate()
  })
}
