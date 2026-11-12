/**
 * Doanh thu của Chủ sân, dùng chung cho Báo cáo doanh thu và Hoá đơn phí nền tảng.
 */
import { getPlayerMatchFee } from '@/lib/playerMatch'
import { ownerRevenueSample } from '@/mocks/ownerRevenueSample'
import type { SharedCourtBooking, VenueCalendarEvent, VenueCalendarEventType } from '@/store/useCrossRoleStore'
import type { PaymentRecord } from '@/types/payment'
import type { PlayerMatch, PlayerVenue } from '@/types/player'

export type RevenueSource = 'COURT' | 'SOCIAL' | 'COACHING' | 'WALK_IN' | 'PRIVATE' | 'REFUND'
export type Transaction = {
  id: string; date: string; venueId: string; venueName: string; courtId: string; courtName: string
  source: RevenueSource; label: string; amount: number; paymentMethod: 'VIETQR' | 'CASH'
  status: 'COMPLETED' | 'REFUNDED'; owner: string; coach: string
}
export const sourceLabel: Record<RevenueSource, string> = { COURT: 'Đặt sân Player', SOCIAL: 'Kèo Social', COACHING: 'Lớp Coach', WALK_IN: 'Khách vãng lai', PRIVATE: 'Khóa sân riêng', REFUND: 'Hoàn tiền' }
const eventToSource: Record<VenueCalendarEventType, RevenueSource> = { SOCIAL: 'SOCIAL', COACHING: 'COACHING', WALK_IN: 'WALK_IN', PRIVATE: 'PRIVATE', MAINTENANCE: 'PRIVATE', AVAILABILITY: 'COURT' }

/** Toàn bộ giao dịch doanh thu (khoản hoàn là số âm), mới nhất trước. */
export const buildOwnerTransactions = ({ bookings, events, matches, payments, venues }: {
  bookings: SharedCourtBooking[]
  events: VenueCalendarEvent[]
  matches: PlayerMatch[]
  payments: PaymentRecord[]
  venues: PlayerVenue[]
}): Transaction[] => {
  // Booking "Thanh toán tại sân" chỉ tính doanh thu sau khi Chủ sân xác nhận đã thu tiền.
  const courtRows: Transaction[] = bookings.filter((booking) => booking.paymentStatus !== 'PAY_AT_VENUE').map((booking) => ({
    id: booking.id, date: booking.date, venueId: booking.venueId, venueName: booking.venueName,
    courtId: booking.courtId, courtName: booking.courtName, source: 'COURT',
    label: 'Player đặt sân · ' + booking.playerName, amount: booking.status === 'CANCELLED' ? -booking.paidAmount : booking.paidAmount,
    paymentMethod: booking.paidMethod ?? 'VIETQR', status: booking.status === 'CANCELLED' ? 'REFUNDED' : 'COMPLETED',
    owner: 'Field Manager', coach: '—',
  }))
  const eventRows: Transaction[] = events.filter((event) => !['MAINTENANCE', 'AVAILABILITY'].includes(event.type) && event.amount > 0).map((event) => ({
    id: event.id, date: event.date, venueId: event.venueId, venueName: event.venueName,
    courtId: event.courtId, courtName: event.courtName, source: eventToSource[event.type],
    label: event.title, amount: event.amount, paymentMethod: event.paymentMethod ?? 'CASH',
    status: 'COMPLETED', owner: 'Field Manager', coach: event.type === 'COACHING' ? event.contactName ?? 'Chưa có dữ liệu' : '—',
  }))
  const socialRows: Transaction[] = matches.filter((match) => match.status !== 'CANCELLED').map((match) => ({
    id: 'match-' + match.id, date: match.date, venueId: match.venueId ?? '', venueName: match.venueName,
    courtId: match.courtId ?? '', courtName: match.courtName, source: 'SOCIAL', label: match.title,
    amount: getPlayerMatchFee(match) * match.participants.length, paymentMethod: 'VIETQR',
    status: 'COMPLETED', owner: 'Field Manager', coach: '—',
  }))
  const refundRows: Transaction[] = payments.filter((payment) => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(payment.status) && (payment.service === 'COURT' || payment.service === 'SOCIAL')).map((payment) => ({
    id: 'refund-' + payment.id, date: (payment.refundedAt ?? payment.createdAt).slice(0, 10),
    venueId: '', venueName: 'Chưa có dữ liệu', courtId: '', courtName: 'Chưa có dữ liệu',
    source: 'REFUND', label: 'Hoàn tiền · ' + payment.title, amount: -(payment.refundAmount ?? 0),
    paymentMethod: 'VIETQR', status: 'REFUNDED', owner: 'Field Manager', coach: '—',
  }))
  // Dữ liệu mẫu doanh thu của các cụm sân hiện có (chỉ để demo biểu đồ).
  const sampleRows: Transaction[] = ownerRevenueSample.flatMap((record) => {
    const venue = venues.find((item) => item.id === record.venueId)
    const court = venue?.courts.find((item) => item.id === record.courtId)
    if (!venue || !court) return []
    return [{
      id: record.id, date: record.date, venueId: venue.id, venueName: venue.name, courtId: court.id, courtName: court.name,
      source: record.source, label: record.label, amount: record.amount, paymentMethod: record.paymentMethod,
      status: 'COMPLETED' as const, owner: 'Field Manager', coach: record.coach ?? '—',
    }]
  })
  return [...courtRows, ...eventRows, ...socialRows, ...refundRows, ...sampleRows].sort((a, b) => b.date.localeCompare(a.date))
}
