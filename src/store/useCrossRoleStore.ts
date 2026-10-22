import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type SharedBookingStatus = 'CONFIRMED' | 'CANCELLED'

export interface SharedCourtBooking {
  id: string
  bookingCode?: string
  playerId: string
  playerName: string
  playerPhone: string
  venueId: string
  venueName: string
  venueAddress: string
  courtId: string
  courtName: string
  courtType: string
  date: string
  dateLabel: string
  slotNumber: number
  timeRange: string
  totalAmount: number
  paidAmount: number
  paymentStatus: 'PAID'
  status: SharedBookingStatus
  bookedAt?: string
  rescheduleCount: number
}

export interface SharedSlotOverride {
  key: string
  venueId: string
  date: string
  courtId: string
  slotNumber: number
  status: 'AVAILABLE' | 'MAINTENANCE' | 'PRIVATE_BOOKED'
  price: number
  maintenanceReason?: string
  customerName?: string
  customerPhone?: string
  paymentMethod?: 'CASH' | 'VIETQR' | 'DEBT'
  updatedAt: string
}

interface CrossRoleState {
  courtBookings: SharedCourtBooking[]
  slotOverrides: SharedSlotOverride[]
  upsertCourtBooking: (booking: SharedCourtBooking) => void
  cancelCourtBooking: (id: string) => void
  rescheduleCourtBooking: (id: string, changes: Pick<SharedCourtBooking, 'date' | 'dateLabel' | 'courtId' | 'courtName' | 'courtType' | 'slotNumber' | 'timeRange' | 'totalAmount' | 'paidAmount' | 'rescheduleCount'>) => void
  replaceSlotOverrides: (overrides: SharedSlotOverride[]) => void
  upsertSlotOverrides: (overrides: SharedSlotOverride[]) => void
  resetCrossRoleDemo: () => void
}

export const useCrossRoleStore = create<CrossRoleState>()(
  persist(
    (set) => ({
      courtBookings: [],
      slotOverrides: [],
      upsertCourtBooking: (booking) => set((state) => ({
        courtBookings: [booking, ...state.courtBookings.filter((item) => item.id !== booking.id)],
      })),
      cancelCourtBooking: (id) => set((state) => ({
        courtBookings: state.courtBookings.map((item) => item.id === id ? { ...item, status: 'CANCELLED' } : item),
      })),
      rescheduleCourtBooking: (id, changes) => set((state) => ({
        courtBookings: state.courtBookings.map((item) => item.id === id ? { ...item, ...changes, status: 'CONFIRMED' } : item),
      })),
      replaceSlotOverrides: (overrides) => set({ slotOverrides: overrides }),
      upsertSlotOverrides: (overrides) => set((state) => {
        const keys = new Set(overrides.map((item) => item.key))
        return { slotOverrides: [...overrides, ...state.slotOverrides.filter((item) => !keys.has(item.key))] }
      }),
      resetCrossRoleDemo: () => set({ courtBookings: [], slotOverrides: [] }),
    }),
    {
      name: 'fitlyo-cross-role-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
