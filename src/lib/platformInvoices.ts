/**
 * Hoá đơn phí nền tảng FITLYO cho Chủ sân.
 * - Ngày 25 hàng tháng xuất 1 hoá đơn = 5% tổng doanh thu từ ngày 25 tháng trước đến hết ngày 24 tháng này.
 * - Hạn thanh toán: trước ngày 1 tháng sau (tức hết ngày cuối tháng xuất hoá đơn), qua VietQR.
 */
import type { Transaction } from '@/lib/ownerRevenue'

export const PLATFORM_FEE_RATE = 0.05
export const INVOICE_DAY = 25

export interface InvoicePayment {
  invoiceId: string
  amount: number
  transferContent: string
  paidAt: string
}

export type InvoiceStatus = 'PAID' | 'UNPAID' | 'OVERDUE'

export interface PlatformInvoice {
  /** INV-YYYY-MM theo tháng xuất hoá đơn. */
  id: string
  /** Ngày bắt đầu kỳ (YYYY-MM-DD, ngày 25 tháng trước). */
  periodStart: string
  /** Ngày kết thúc kỳ (YYYY-MM-DD, ngày 24 tháng xuất hoá đơn). */
  periodEnd: string
  issueDate: string
  /** Ngày cuối cùng được thanh toán (cuối tháng xuất hoá đơn). */
  dueDate: string
  revenue: number
  amount: number
  byVenue: Array<{ venueName: string; revenue: number }>
  status: InvoiceStatus
  payment?: InvoicePayment
}

const pad = (value: number) => String(value).padStart(2, '0')
const dateKey = (year: number, monthIndex: number, day: number) => {
  const value = new Date(year, monthIndex, day, 12)
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}
export const todayKey = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

/** Kỳ hoá đơn xuất vào ngày 25 của tháng (year, monthIndex). */
export const invoicePeriod = (rawYear: number, rawMonthIndex: number) => {
  const normalized = new Date(rawYear, rawMonthIndex, 1, 12)
  const year = normalized.getFullYear()
  const monthIndex = normalized.getMonth()
  return {
    id: `INV-${year}-${pad(monthIndex + 1)}`,
    periodStart: dateKey(year, monthIndex - 1, INVOICE_DAY),
    periodEnd: dateKey(year, monthIndex, INVOICE_DAY - 1),
    issueDate: dateKey(year, monthIndex, INVOICE_DAY),
    // Ngày 0 của tháng kế tiếp = ngày cuối tháng xuất hoá đơn.
    dueDate: dateKey(year, monthIndex + 1, 0),
  }
}

const summarize = (transactions: Transaction[], periodStart: string, periodEnd: string) => {
  const inPeriod = transactions.filter((item) => item.date >= periodStart && item.date <= periodEnd)
  const revenue = inPeriod.reduce((sum, item) => sum + item.amount, 0)
  const venues = new Map<string, number>()
  inPeriod.filter((item) => item.venueId).forEach((item) => venues.set(item.venueName, (venues.get(item.venueName) ?? 0) + item.amount))
  return {
    revenue,
    amount: Math.max(0, Math.round(revenue * PLATFORM_FEE_RATE)),
    byVenue: [...venues.entries()].map(([venueName, value]) => ({ venueName, revenue: value })).sort((a, b) => b.revenue - a.revenue),
  }
}

/**
 * Các hoá đơn đã xuất (ngày 25 đã tới), mới nhất trước, bắt đầu từ kỳ có giao dịch sớm nhất.
 * Hoá đơn đã thanh toán giữ nguyên số tiền lúc thanh toán.
 */
export const buildPlatformInvoices = (transactions: Transaction[], payments: Record<string, InvoicePayment>, now = new Date()): PlatformInvoice[] => {
  const today = todayKey(now)
  const earliest = transactions.reduce((min, item) => (item.date && item.date < min ? item.date : min), today)
  const [startYear, startMonth, startDay] = earliest.split('-').map(Number)
  // Tháng xuất hoá đơn đầu tiên chứa ngày giao dịch sớm nhất.
  let year = startYear
  let monthIndex = startMonth - 1 + (startDay >= INVOICE_DAY ? 1 : 0)
  const invoices: PlatformInvoice[] = []
  for (let guard = 0; guard < 120; guard += 1) {
    const period = invoicePeriod(year, monthIndex)
    if (period.issueDate > today) break
    const payment = payments[period.id]
    const summary = summarize(transactions, period.periodStart, period.periodEnd)
    invoices.push({
      ...period,
      ...summary,
      amount: payment ? payment.amount : summary.amount,
      status: payment ? 'PAID' : today > period.dueDate ? 'OVERDUE' : 'UNPAID',
      payment,
    })
    monthIndex += 1
    if (monthIndex > 11) { monthIndex = 0; year += 1 }
  }
  return invoices.reverse()
}

/** Kỳ đang chạy (chưa tới ngày xuất hoá đơn): doanh thu và phí tạm tính. */
export const currentInvoicePreview = (transactions: Transaction[], now = new Date()) => {
  const today = todayKey(now)
  const issueThisMonth = invoicePeriod(now.getFullYear(), now.getMonth())
  const period = today < issueThisMonth.issueDate ? issueThisMonth : invoicePeriod(now.getFullYear(), now.getMonth() + 1)
  return { ...period, ...summarize(transactions, period.periodStart, period.periodEnd) }
}
