export const COACH_PAYMENT_WINDOW_MINUTES = 15

export const COACH_APPROVAL_HOURS = 12
export const SOCIAL_AUTO_CANCEL_MINUTES = 60
export const PARTNER_CANCEL_VOUCHER_PERCENT = 10
export const PARTNER_CANCEL_VOUCHER_CAP = 100_000
export const PARTNER_CANCEL_VOUCHER_DAYS = 30

export const addMinutesIso = (minutes: number, base = new Date()) => (
  new Date(base.getTime() + minutes * 60_000).toISOString()
)

export const addHoursIso = (hours: number, base = new Date()) => (
  new Date(base.getTime() + hours * 3_600_000).toISOString()
)

export const addDaysIso = (days: number, base = new Date()) => (
  new Date(base.getTime() + days * 86_400_000).toISOString()
)

export const partnerCancellationVoucher = (bookingValue: number) => (
  Math.min(Math.round(bookingValue * (PARTNER_CANCEL_VOUCHER_PERCENT / 100)), PARTNER_CANCEL_VOUCHER_CAP)
)

export const eventDateTime = (date: string, timeRange: string) => {
  const start = timeRange.split('-')[0]?.trim() ?? '00:00'
  return new Date(`${date}T${start}:00+07:00`)
}

export const hoursUntilEvent = (date: string, timeRange: string, now = new Date()) => (
  (eventDateTime(date, timeRange).getTime() - now.getTime()) / 3_600_000
)

export type RefundOutcome = {
  refundAmount: number
  forfeitedAmount: number
  label: string
}

export const socialRefundOutcome = (paidAmount: number, hoursBefore: number): RefundOutcome => {
  if (hoursBefore >= 6) return { refundAmount: paidAmount, forfeitedAmount: 0, label: 'Hoàn 100% về Ví FITLYO' }
  return { refundAmount: 0, forfeitedAmount: paidAmount, label: 'Hủy dưới 6 giờ: mất 100% phí đã thanh toán' }
}

export const courtRefundOutcome = (paidAmount: number, hoursBefore: number): RefundOutcome => {
  if (hoursBefore >= 12) return { refundAmount: paidAmount, forfeitedAmount: 0, label: 'Hoàn 100% phí đã thanh toán về Ví FITLYO' }
  if (hoursBefore >= 6) {
    const refundAmount = Math.round(paidAmount / 2)
    return { refundAmount, forfeitedAmount: paidAmount - refundAmount, label: 'Hoàn 50% số tiền đã thanh toán về Ví FITLYO' }
  }
  return { refundAmount: 0, forfeitedAmount: paidAmount, label: 'Hủy dưới 6 giờ: không hoàn phí đã thanh toán' }
}

export const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
