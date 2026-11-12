/**
 * Gói dịch vụ FITLYO cho Chủ sân, tính theo từng cụm sân / tháng.
 * Mỗi cụm sân chỉ đăng kí 1 gói, và gói phải khớp số sân hiện có của cụm.
 */
export type VenuePackageTier = 'SMALL' | 'MEDIUM' | 'LARGE'

export interface VenuePackage {
  tier: VenuePackageTier
  name: string
  pricePerMonth: number
  minCourts: number
  maxCourts: number
}

export const VENUE_PACKAGES: VenuePackage[] = [
  {
    tier: 'SMALL',
    name: 'Small',
    pricePerMonth: 1_200_000,
    minCourts: 1,
    maxCourts: 5,
  },
  {
    tier: 'MEDIUM',
    name: 'Medium',
    pricePerMonth: 1_800_000,
    minCourts: 6,
    maxCourts: 10,
  },
  {
    tier: 'LARGE',
    name: 'Large',
    pricePerMonth: 2_500_000,
    minCourts: 11,
    maxCourts: 15,
  },
]

export interface VenueSubscription {
  venueId: string
  venueName: string
  tier: VenuePackageTier
  pricePerMonth: number
  /** Số sân của cụm tại thời điểm đăng kí. */
  courtCount: number
  registeredAt: string
  /** Ngày hết hạn chu kỳ hiện tại (1 tháng kể từ ngày đăng kí). */
  expiresAt: string
}

export const getVenuePackage = (tier: VenuePackageTier) => VENUE_PACKAGES.find((item) => item.tier === tier)!

/** Gói phù hợp với số sân; undefined nếu không có gói nào (0 sân hoặc hơn 15 sân). */
export const packageForCourtCount = (courtCount: number) => (
  VENUE_PACKAGES.find((item) => courtCount >= item.minCourts && courtCount <= item.maxCourts)
)

export const addOneMonth = (value: Date) => {
  const next = new Date(value)
  next.setMonth(next.getMonth() + 1)
  return next
}
