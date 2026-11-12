import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CourtPricing, CourtPricingMap } from '@/lib/courtPricing'
import type { VenueSubscription } from '@/lib/venuePackages'
import type { InvoicePayment } from '@/lib/platformInvoices'
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
  /** PAY_AT_VENUE: Player chưa trả, sẽ thanh toán tại quầy khi đến sân. */
  paymentStatus: 'PAID' | 'PAY_AT_VENUE'
  /** Thời điểm và hình thức Chủ sân xác nhận đã thu tiền tại sân. */
  paidAt?: string
  paidMethod?: 'CASH' | 'VIETQR'
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
  /** Bảng giá theo giờ: key = venueId (giá chung cụm sân) hoặc `${venueId}:${courtId}` (giá riêng của sân). */
  courtPricing: CourtPricingMap
  /** Gói dịch vụ đang đăng kí, mỗi cụm sân tối đa 1 gói (key = venueId). */
  venueSubscriptions: Record<string, VenueSubscription>
  /** Hoá đơn phí nền tảng 5% đã thanh toán qua VietQR (key = mã hoá đơn INV-YYYY-MM). */
  platformInvoicePayments: Record<string, InvoicePayment>
  upsertCourtBooking: (booking: SharedCourtBooking) => void
  cancelCourtBooking: (id: string) => void
  /** Chủ sân xác nhận đã thu đủ tiền của booking "Thanh toán tại sân". Không thể hoàn tác. */
  markCourtBookingPaid: (id: string, method: 'CASH' | 'VIETQR') => void
  rescheduleCourtBooking: (id: string, changes: Pick<SharedCourtBooking, 'date' | 'dateLabel' | 'courtId' | 'courtName' | 'courtType' | 'slotNumber' | 'timeRange' | 'totalAmount' | 'paidAmount' | 'rescheduleCount'>) => void
  replaceSlotOverrides: (overrides: SharedSlotOverride[]) => void
  upsertSlotOverrides: (overrides: SharedSlotOverride[]) => void
  createVenueCalendarEvent: (event: Omit<VenueCalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateVenueCalendarEvent: (id: string, changes: Partial<Omit<VenueCalendarEvent, 'id' | 'createdAt'>>) => void
  removeVenueCalendarEvent: (id: string) => void
  setCourtDisableSchedule: (venueId: string, courtId: string, schedule: CourtDisableSchedule | null) => void
  /** Lưu bảng giá cho key; truyền null để xoá (sân quay về dùng giá cụm sân). */
  setCourtPricing: (key: string, pricing: CourtPricing | null) => void
  /** Đăng kí hoặc chuyển gói cho cụm sân (ghi đè gói cũ vì mỗi cụm chỉ có 1 gói). */
  setVenueSubscription: (subscription: VenueSubscription) => void
  /** Ghi nhận đã thanh toán hoá đơn phí nền tảng. Không ghi đè nếu hoá đơn đã thanh toán. */
  payPlatformInvoice: (payment: InvoicePayment) => boolean
  resetCrossRoleDemo: () => void
}

const crossRoleStorageKey = 'fitlyo-cross-role-v1'

export const useCrossRoleStore = create<CrossRoleState>()(
  persist(
    (set, get) => ({
      courtBookings: [],
      slotOverrides: [],
      venueCalendarEvents: [],
      courtDisableSchedules: {},
      courtPricing: {},
      venueSubscriptions: {},
      platformInvoicePayments: {},
      upsertCourtBooking: (booking) => set((state) => ({
        courtBookings: [booking, ...state.courtBookings.filter((item) => item.id !== booking.id)],
      })),
      markCourtBookingPaid: (id, method) => set((state) => ({
        courtBookings: state.courtBookings.map((item) => item.id === id && item.paymentStatus === 'PAY_AT_VENUE'
          ? { ...item, paymentStatus: 'PAID', paidAmount: item.totalAmount, paidAt: new Date().toISOString(), paidMethod: method }
          : item),
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
      setCourtPricing: (key, pricing) => set((state) => {
        const nextPricing = { ...state.courtPricing }
        if (pricing) nextPricing[key] = pricing
        else delete nextPricing[key]
        return { courtPricing: nextPricing }
      }),
      setVenueSubscription: (subscription) => set((state) => ({
        venueSubscriptions: { ...state.venueSubscriptions, [subscription.venueId]: subscription },
      })),
      payPlatformInvoice: (payment) => {
        if (get().platformInvoicePayments[payment.invoiceId] || payment.amount <= 0) return false
        set((state) => ({ platformInvoicePayments: { ...state.platformInvoicePayments, [payment.invoiceId]: payment } }))
        return true
      },
      resetCrossRoleDemo: () => set({ courtBookings: [], slotOverrides: [], venueCalendarEvents: [], courtDisableSchedules: {}, courtPricing: {}, venueSubscriptions: {}, platformInvoicePayments: {} }),
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
