/**
 * Phí liên kết sân của Coach: 69.000đ / cụm sân đang liên kết / tháng.
 * Hoá đơn phát hàng tháng theo ngày liên kết (liên kết 02/09 → hoá đơn 02/09, 02/10, 02/11…),
 * mỗi hoá đơn tính cho 1 tháng kể từ ngày phát. Hạn thanh toán 7 ngày sau ngày phát.
 */
import type { CoachVenueAffiliation } from '@/types/pickleball'

export const COACH_LINK_FEE = 69_000
export const COACH_LINK_FEE_DUE_DAYS = 7

export type CoachLinkInvoiceStatus = 'PAID' | 'UNPAID' | 'OVERDUE'

export interface CoachLinkInvoiceSnapshot {
  id: string
  affiliationId: string
  venueName: string
  periodStart: string
  periodEnd: string
  amount: number
}

export interface CoachLinkFeePayment {
  id: string
  coachId: string
  invoices: CoachLinkInvoiceSnapshot[]
  amount: number
  transferContent: string
  paidAt: string
}

export interface CoachLinkInvoice extends CoachLinkInvoiceSnapshot {
  issueDate: string
  dueDate: string
  status: CoachLinkInvoiceStatus
  paidAt?: string
}

const pad = (value: number) => String(value).padStart(2, '0')
const toKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const fromKey = (key: string) => new Date(`${key}T12:00:00`)
const addDays = (key: string, days: number) => {
  const date = fromKey(key)
  date.setDate(date.getDate() + days)
  return toKey(date)
}
/** Cộng tháng theo ngày neo; ngày 29–31 rơi vào tháng ngắn hơn thì lấy ngày cuối tháng. */
const addMonthsAnchored = (anchor: Date, months: number) => {
  const target = new Date(anchor.getFullYear(), anchor.getMonth() + months, 1, 12)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(anchor.getDate(), lastDay))
  return toKey(target)
}

/** Hoá đơn của các sân đang liên kết (ACTIVE) đã tới ngày phát, cùng hoá đơn đã thanh toán trước đó. */
export const buildCoachLinkInvoices = (input: {
  coachId: string
  affiliations: CoachVenueAffiliation[]
  payments: CoachLinkFeePayment[]
  now?: Date
}): CoachLinkInvoice[] => {
  const today = toKey(input.now ?? new Date())
  const paid = new Map<string, { snapshot: CoachLinkInvoiceSnapshot; paidAt: string }>()
  input.payments
    .filter((payment) => payment.coachId === input.coachId)
    .forEach((payment) => payment.invoices.forEach((snapshot) => paid.set(snapshot.id, { snapshot, paidAt: payment.paidAt })))

  const invoices = new Map<string, CoachLinkInvoice>()
  input.affiliations
    .filter((item) => item.coachId === input.coachId && item.status === 'ACTIVE' && item.linkedAt)
    .forEach((item) => {
      const anchor = new Date(item.linkedAt!)
      for (let month = 0; month < 240; month += 1) {
        const periodStart = addMonthsAnchored(anchor, month)
        if (periodStart > today) break
        const periodEnd = addDays(addMonthsAnchored(anchor, month + 1), -1)
        const id = `LINK-${item.id}-${periodStart}`
        const dueDate = addDays(periodStart, COACH_LINK_FEE_DUE_DAYS)
        const done = paid.get(id)
        invoices.set(id, {
          id, affiliationId: item.id, venueName: item.venueName, periodStart, periodEnd,
          amount: done ? done.snapshot.amount : COACH_LINK_FEE,
          issueDate: periodStart, dueDate,
          status: done ? 'PAID' : today > dueDate ? 'OVERDUE' : 'UNPAID',
          paidAt: done?.paidAt,
        })
      }
    })

  // Hoá đơn đã thanh toán của sân đã huỷ liên kết vẫn giữ trong lịch sử.
  paid.forEach(({ snapshot, paidAt }, id) => {
    if (!invoices.has(id)) invoices.set(id, { ...snapshot, issueDate: snapshot.periodStart, dueDate: addDays(snapshot.periodStart, COACH_LINK_FEE_DUE_DAYS), status: 'PAID', paidAt })
  })
  return [...invoices.values()].sort((a, b) => b.issueDate.localeCompare(a.issueDate) || a.venueName.localeCompare(b.venueName))
}

/** Ngày phát hoá đơn kế tiếp của một liên kết. */
export const nextCoachLinkInvoiceDate = (linkedAt: string, now = new Date()) => {
  const today = toKey(now)
  const anchor = new Date(linkedAt)
  for (let month = 0; month < 240; month += 1) {
    const date = addMonthsAnchored(anchor, month)
    if (date > today) return date
  }
  return today
}
