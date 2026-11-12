export const COURT_OPEN_TIME = '06:00'
export const COURT_CLOSE_TIME = '21:00'
export const COURT_SLOT_DURATION_MINUTES = 90

export const COURT_SLOT_TIMES = [
  { slotNumber: 1, start: '06:00', end: '07:30' },
  { slotNumber: 2, start: '07:30', end: '09:00' },
  { slotNumber: 3, start: '09:00', end: '10:30' },
  { slotNumber: 4, start: '10:30', end: '12:00' },
  { slotNumber: 5, start: '12:00', end: '13:30' },
  { slotNumber: 6, start: '13:30', end: '15:00' },
  { slotNumber: 7, start: '15:00', end: '16:30' },
  { slotNumber: 8, start: '16:30', end: '18:00' },
  { slotNumber: 9, start: '18:00', end: '19:30' },
  { slotNumber: 10, start: '19:30', end: '21:00' },
].map((slot) => ({ ...slot, timeRange: `${slot.start} - ${slot.end}` }))

export const COURT_SLOT_NUMBERS = COURT_SLOT_TIMES.map((slot) => slot.slotNumber)

/**
 * Khoảng đặt mà Player được phép đặt cho 1 sân trong 1 ngày.
 * - Nếu Chủ sân đã tạo "Khoảng đặt" (event AVAILABILITY) cho sân/ngày đó → chỉ dùng các khoảng này.
 * - Nếu Chủ sân chưa cấu hình → dùng khung giờ mặc định của sân (10 slot 90 phút) để Player vẫn đặt được.
 *   Giá khung mặc định lấy từ bảng giá theo giờ Chủ sân thiết lập (trang "Chỉnh sửa giá cả");
 *   nếu chưa có bảng giá thì dùng giá gốc của slot.
 */
import { priceForTimeRange, type CourtPricing } from '@/lib/courtPricing'

export const DEFAULT_AVAILABILITY_PREFIX = 'default-availability'

export interface BookableAvailability {
  id: string
  venueId: string
  courtId: string
  courtName: string
  date: string
  title: string
  startTime: string
  durationMinutes: number
  amount: number
  isDefault: boolean
}

type AvailabilityEventLike = {
  id: string
  type: string
  venueId: string
  date: string
  courtId: string
  courtName: string
  title: string
  startTime: string
  durationMinutes: number
  amount: number
}

type CourtLike = {
  id: string
  name: string
  slots: Array<{ slotNumber: number; timeRange: string; price: number; status: string }>
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export const getCourtAvailabilities = (
  events: AvailabilityEventLike[],
  venueId: string,
  court: CourtLike,
  date: string,
  pricing?: CourtPricing,
): BookableAvailability[] => {
  const configured = events.filter((event) => event.type === 'AVAILABILITY'
    && event.venueId === venueId && event.courtId === court.id && event.date === date && event.amount > 0)
  if (configured.length) {
    return configured.map((event) => ({
      id: event.id, venueId, courtId: court.id, courtName: event.courtName || court.name, date,
      title: event.title, startTime: event.startTime, durationMinutes: event.durationMinutes, amount: event.amount, isDefault: false,
    }))
  }
  return court.slots
    .filter((slot) => slot.status === 'AVAILABLE' && (pricing ? pricing.basePricePerHour > 0 : slot.price > 0))
    .map((slot) => {
      const [start, end] = slot.timeRange.split(' - ')
      const durationMinutes = toMinutes(end) - toMinutes(start)
      return {
        id: `${DEFAULT_AVAILABILITY_PREFIX}:${venueId}:${court.id}:${date}:${slot.slotNumber}`,
        venueId, courtId: court.id, courtName: court.name, date,
        title: 'Khung giờ mặc định',
        startTime: start, durationMinutes, amount: pricing ? priceForTimeRange(pricing, start, durationMinutes) : slot.price, isDefault: true,
      }
    })
}
