/**
 * Bảng giá theo giờ do Chủ sân cấu hình.
 * - Giá mặc định: áp dụng cho mọi khung giờ (VND / 1 giờ).
 * - Khung giờ đặc biệt: trong [startTime, endTime) dùng giá riêng, ví dụ 18:00–22:00 giá 120.000đ/giờ.
 * Bảng giá đặt ở cấp cụm sân (áp dụng cho mọi sân) và có thể ghi đè riêng cho từng sân.
 */
export interface SpecialPriceRule {
  id: string
  label?: string
  startTime: string
  endTime: string
  pricePerHour: number
}

export interface CourtPricing {
  basePricePerHour: number
  specialRules: SpecialPriceRule[]
  updatedAt: string
}

export type CourtPricingMap = Record<string, CourtPricing>

export const venuePricingKey = (venueId: string) => venueId
export const courtPricingKey = (venueId: string, courtId: string) => `${venueId}:${courtId}`

/** Giá riêng của sân → giá chung của cụm sân → chưa cấu hình. */
export const resolveCourtPricing = (map: CourtPricingMap | undefined, venueId: string, courtId: string): CourtPricing | undefined => (
  map?.[courtPricingKey(venueId, courtId)] ?? map?.[venuePricingKey(venueId)]
)

export const pricingTimeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export const minutesToPricingTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** Các mốc 30 phút từ 00:00 đến 24:00 để chọn khung giờ. */
export const PRICING_TIME_OPTIONS = Array.from({ length: 49 }, (_, index) => minutesToPricingTime(index * 30))

/** Giá 1 giờ tại một phút trong ngày. */
export const hourlyRateAt = (pricing: CourtPricing, minuteOfDay: number) => {
  const rule = pricing.specialRules.find((item) => (
    pricingTimeToMinutes(item.startTime) <= minuteOfDay && minuteOfDay < pricingTimeToMinutes(item.endTime)
  ))
  return rule ? rule.pricePerHour : pricing.basePricePerHour
}

/**
 * Tổng tiền cho một khoảng đặt, tính theo từng phút để khoảng vắt qua 2 mức giá được chia đúng tỉ lệ.
 * Làm tròn đến 1.000đ.
 */
export const priceForTimeRange = (pricing: CourtPricing, startTime: string, durationMinutes: number) => {
  const start = pricingTimeToMinutes(startTime)
  let total = 0
  for (let minute = start; minute < start + durationMinutes; minute += 1) total += hourlyRateAt(pricing, minute) / 60
  return Math.round(total / 1000) * 1000
}

/** Trả về thông báo lỗi đầu tiên, hoặc null nếu bảng giá hợp lệ. */
export const validateCourtPricing = (pricing: Pick<CourtPricing, 'basePricePerHour' | 'specialRules'>): string | null => {
  if (!Number.isFinite(pricing.basePricePerHour) || pricing.basePricePerHour <= 0) return 'Giá mặc định phải lớn hơn 0đ.'
  const sorted = [...pricing.specialRules].sort((a, b) => pricingTimeToMinutes(a.startTime) - pricingTimeToMinutes(b.startTime))
  for (const [index, rule] of sorted.entries()) {
    const name = rule.label?.trim() || `${rule.startTime}–${rule.endTime}`
    if (pricingTimeToMinutes(rule.endTime) <= pricingTimeToMinutes(rule.startTime)) return `Khung "${name}": giờ kết thúc phải sau giờ bắt đầu.`
    if (!Number.isFinite(rule.pricePerHour) || rule.pricePerHour <= 0) return `Khung "${name}": giá phải lớn hơn 0đ.`
    const next = sorted[index + 1]
    if (next && pricingTimeToMinutes(next.startTime) < pricingTimeToMinutes(rule.endTime)) {
      return `Khung "${name}" bị trùng giờ với khung ${next.startTime}–${next.endTime}.`
    }
  }
  return null
}

/**
 * Báo giá khoản thu cho một khoảng giờ trên sân.
 * - Có bảng giá (giá riêng sân hoặc giá cụm sân) → tính theo bảng giá.
 * - Chưa có bảng giá → tính theo giá gốc của từng slot 90 phút, chia đều theo phút.
 */
export const quoteCourtPrice = (
  pricing: CourtPricing | undefined,
  slots: Array<{ timeRange: string; price: number }>,
  startTime: string,
  durationMinutes: number,
) => {
  if (pricing) return priceForTimeRange(pricing, startTime, durationMinutes)
  const start = pricingTimeToMinutes(startTime)
  let total = 0
  for (let minute = start; minute < start + durationMinutes; minute += 1) {
    const slot = slots.find((item) => {
      const [slotStart, slotEnd] = item.timeRange.split(' - ').map(pricingTimeToMinutes)
      return slotStart <= minute && minute < slotEnd
    })
    if (!slot) continue
    const [slotStart, slotEnd] = slot.timeRange.split(' - ').map(pricingTimeToMinutes)
    total += slot.price / (slotEnd - slotStart)
  }
  return Math.round(total / 1000) * 1000
}

/** Mô tả ngắn bảng giá, ví dụ "100.000đ/giờ · 18:00–22:00: 120.000đ/giờ". */
export const describeCourtPricing = (pricing: CourtPricing) => [
  `${new Intl.NumberFormat('vi-VN').format(pricing.basePricePerHour)}đ/giờ`,
  ...pricing.specialRules.map((rule) => `${rule.startTime}–${rule.endTime}: ${new Intl.NumberFormat('vi-VN').format(rule.pricePerHour)}đ/giờ`),
].join(' · ')
