/**
 * Tính các khung giờ còn trống trên một sân cho Player (đặt sân và đổi lịch dùng chung).
 * Quy tắc giống form tạo event của Chủ sân: mốc 30 phút trong 06:00–21:00, không trùng lịch khác,
 * không rơi vào lúc sân tắt và không chọn giờ đã qua.
 */
export const BOOKING_OPEN_MINUTES = 6 * 60
export const BOOKING_CLOSE_MINUTES = 21 * 60
export const BOOKING_STEP_MINUTES = 30

export type OccupiedBlock = {
  id: string
  courtId: string
  startTime: string
  durationMinutes: number
  /** Lịch của chính Player đang xem. */
  mine: boolean
}

export const slotMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}
export const slotTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const localDateKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
const overlaps = (leftStart: number, leftEnd: number, rightStart: number, rightEnd: number) => leftStart < rightEnd && leftEnd > rightStart

type VenueLike = { id: string; courts: Array<{ id: string; name: string; slots: Array<{ slotNumber: number; timeRange: string }> }> }
type BookingLike = { id: string; status: string; venueId: string; date: string; courtId: string; timeRange: string; playerId: string }
type MatchLike = { id: string; status: string; venueId?: string; date: string; timeRange: string; courtId?: string; courtName: string }
type EventLike = { id: string; type: string; venueId: string; date: string; courtId: string; startTime: string; durationMinutes: number }
type OverrideLike = { key: string; venueId: string; date: string; courtId: string; slotNumber: number; status: string }

/** Mọi lịch đang chiếm sân trong ngày: booking Player, kèo Social, event Chủ sân (trừ "Khoảng đặt"), slot bị khoá. */
export const buildOccupiedBlocks = (input: {
  venue: VenueLike
  date: string
  courtBookings: BookingLike[]
  matches: MatchLike[]
  events: EventLike[]
  overrides: OverrideLike[]
  currentPlayerId?: string
  /** Bỏ qua booking đang đổi lịch để khung giờ cũ của nó vẫn chọn được. */
  excludeBookingId?: string
}): OccupiedBlock[] => {
  const { venue, date } = input
  const blocks: OccupiedBlock[] = []
  input.courtBookings
    .filter((item) => item.status === 'CONFIRMED' && item.venueId === venue.id && item.date === date && item.id !== input.excludeBookingId)
    .forEach((item) => {
      const [start, end] = item.timeRange.split(' - ')
      blocks.push({ id: `booking-${item.id}`, courtId: item.courtId, startTime: start, durationMinutes: Math.max(1, slotMinutes(end) - slotMinutes(start)), mine: item.playerId === input.currentPlayerId })
    })
  input.matches
    .filter((match) => match.status !== 'CANCELLED' && match.venueId === venue.id && match.date === date)
    .forEach((match) => {
      const [start, end] = match.timeRange.split(' - ')
      const courtId = match.courtId ?? venue.courts.find((court) => match.courtName.startsWith(court.name))?.id ?? ''
      blocks.push({ id: `social-${match.id}`, courtId, startTime: start, durationMinutes: Math.max(1, slotMinutes(end) - slotMinutes(start)), mine: false })
    })
  input.events
    .filter((event) => event.venueId === venue.id && event.date === date && event.type !== 'AVAILABILITY')
    .forEach((event) => blocks.push({ id: event.id, courtId: event.courtId, startTime: event.startTime, durationMinutes: event.durationMinutes, mine: false }))
  input.overrides
    .filter((override) => override.venueId === venue.id && override.date === date && override.status !== 'AVAILABLE')
    .forEach((override) => {
      const slot = venue.courts.find((item) => item.id === override.courtId)?.slots.find((item) => item.slotNumber === override.slotNumber)
      if (!slot) return
      const [start, end] = slot.timeRange.split(' - ')
      const startMinutes = slotMinutes(start)
      const endMinutes = slotMinutes(end)
      if (blocks.some((item) => item.courtId === override.courtId && overlaps(slotMinutes(item.startTime), slotMinutes(item.startTime) + item.durationMinutes, startMinutes, endMinutes))) return
      blocks.push({ id: `override-${override.key}`, courtId: override.courtId, startTime: start, durationMinutes: endMinutes - startMinutes, mine: false })
    })
  return blocks
}

const isRangeFree = (blocks: OccupiedBlock[], courtId: string, start: number, end: number, isDisabled: (courtId: string, timeRange: string) => boolean) => (
  !blocks.some((item) => item.courtId === courtId && overlaps(slotMinutes(item.startTime), slotMinutes(item.startTime) + item.durationMinutes, start, end))
  && !isDisabled(courtId, `${slotTime(start)} - ${slotTime(end)}`)
)

/** Giờ bắt đầu còn trống (mốc 30 phút, không chọn giờ đã qua). */
export const bookingStartOptions = (blocks: OccupiedBlock[], courtId: string, date: string, isDisabled: (courtId: string, timeRange: string) => boolean) => {
  const now = new Date()
  const todayIso = localDateKey(now)
  if (date < todayIso) return []
  const earliest = date === todayIso ? now.getHours() * 60 + now.getMinutes() : -1
  const options: string[] = []
  for (let minute = BOOKING_OPEN_MINUTES; minute + BOOKING_STEP_MINUTES <= BOOKING_CLOSE_MINUTES; minute += BOOKING_STEP_MINUTES) {
    if (minute > earliest && isRangeFree(blocks, courtId, minute, minute + BOOKING_STEP_MINUTES, isDisabled)) options.push(slotTime(minute))
  }
  return options
}

/** Giờ kết thúc: sau giờ bắt đầu, cách 30 phút, dừng trước lịch kế tiếp trên sân. */
export const bookingEndOptions = (blocks: OccupiedBlock[], courtId: string, startTime: string, isDisabled: (courtId: string, timeRange: string) => boolean) => {
  if (!startTime) return []
  const options: string[] = []
  for (let end = slotMinutes(startTime) + BOOKING_STEP_MINUTES; end <= BOOKING_CLOSE_MINUTES; end += BOOKING_STEP_MINUTES) {
    if (!isRangeFree(blocks, courtId, end - BOOKING_STEP_MINUTES, end, isDisabled)) break
    options.push(slotTime(end))
  }
  return options
}

export const formatBookingDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours} giờ${rest ? ` ${rest} phút` : ''}` : `${rest} phút`
}
