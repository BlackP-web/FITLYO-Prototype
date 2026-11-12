import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CourtDisableSchedule } from '@/lib/courtDisableSchedule'

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
  status: 'AVAILABLE' | 'MAINTENANCE' | 'PRIVATE_BOOKED' | 'MATCH_PUBLISHED' | 'COACHING'
  price: number
  maintenanceReason?: string
  customerName?: string
  customerPhone?: string
  paymentMethod?: 'CASH' | 'VIETQR' | 'DEBT'
  updatedAt: string
}

export type VenueCalendarEventType = 'WALK_IN' | 'SOCIAL' | 'COACHING' | 'MAINTENANCE' | 'PRIVATE' | 'AVAILABILITY'

export interface VenueCalendarEvent {
  id: string
  venueId: string
  venueName: string
  date: string
  courtId: string
  courtName: string
  type: VenueCalendarEventType
  title: string
  startTime: string
  durationMinutes: number
  amount: number
  paymentMethod?: 'CASH' | 'VIETQR'
  paymentConfirmed?: boolean
  paymentConfirmedAt?: string
  contactName?: string
  contactPhone?: string
  note?: string
  checkInCode?: string
  checkedInAt?: string
  createdAt: string
  updatedAt: string
}

interface CrossRoleState {
  courtBookings: SharedCourtBooking[]
  slotOverrides: SharedSlotOverride[]
  venueCalendarEvents: VenueCalendarEvent[]
  courtDisableSchedules: Record<string, CourtDisableSchedule>
  upsertCourtBooking: (booking: SharedCourtBooking) => void
  cancelCourtBooking: (id: string) => void
  rescheduleCourtBooking: (id: string, changes: Pick<SharedCourtBooking, 'date' | 'dateLabel' | 'courtId' | 'courtName' | 'courtType' | 'slotNumber' | 'timeRange' | 'totalAmount' | 'paidAmount' | 'rescheduleCount'>) => void
  replaceSlotOverrides: (overrides: SharedSlotOverride[]) => void
  upsertSlotOverrides: (overrides: SharedSlotOverride[]) => void
  createVenueCalendarEvent: (event: Omit<VenueCalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateVenueCalendarEvent: (id: string, changes: Partial<Omit<VenueCalendarEvent, 'id' | 'createdAt'>>) => void
  removeVenueCalendarEvent: (id: string) => void
  setCourtDisableSchedule: (venueId: string, courtId: string, schedule: CourtDisableSchedule | null) => void
  resetCrossRoleDemo: () => void
}

const crossRoleStorageKey = 'fitlyo-cross-role-v1'

export const useCrossRoleStore = create<CrossRoleState>()(
  persist(
    (set) => ({
      courtBookings: [],
      slotOverrides: [],
      venueCalendarEvents: [],
      courtDisableSchedules: {},
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
      createVenueCalendarEvent: (event) => {
        const id = `fm-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const now = new Date().toISOString()
        set((state) => ({ venueCalendarEvents: [{ ...event, id, createdAt: now, updatedAt: now }, ...state.venueCalendarEvents] }))
        return id
      },
      updateVenueCalendarEvent: (id, changes) => set((state) => ({
        venueCalendarEvents: state.venueCalendarEvents.map((event) => event.id === id ? { ...event, ...changes, updatedAt: new Date().toISOString() } : event),
      })),
      removeVenueCalendarEvent: (id) => set((state) => ({ venueCalendarEvents: state.venueCalendarEvents.filter((event) => event.id !== id) })),
      setCourtDisableSchedule: (venueId, courtId, schedule) => set((state) => {
        const key = `${venueId}:${courtId}`
        const nextSchedules = { ...state.courtDisableSchedules }
        if (schedule) nextSchedules[key] = schedule
        else delete nextSchedules[key]
        return { courtDisableSchedules: nextSchedules }
      }),
      resetCrossRoleDemo: () => set({ courtBookings: [], slotOverrides: [], venueCalendarEvents: [], courtDisableSchedules: {} }),
    }),
    {
      name: crossRoleStorageKey,
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
)

// Player và Field Manager thường được kiểm thử ở hai tab khác nhau. Zustand
// chỉ cập nhật store trong tab hiện tại, vì vậy tab còn lại cần rehydrate khi
// bản ghi booking dùng chung trong localStorage thay đổi.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === crossRoleStorageKey) void useCrossRoleStore.persist.rehydrate()
  })
}
