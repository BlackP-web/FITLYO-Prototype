/**
 * Dữ liệu mẫu cho Lịch sân & booking (chỉ dùng 3 cụm sân và tài khoản demo có sẵn).
 * Ngày được tính tương đối theo hôm nay để lịch luôn có dữ liệu sắp tới khi demo.
 * Áp dụng khi dữ liệu mới tinh hoặc sau khi bấm "Làm mới data".
 */
import type { VenueCalendarEvent } from '@/store/useCrossRoleStore'
import type { PlayerScheduleItem } from '@/types/player'

const pad = (value: number) => String(value).padStart(2, '0')
const relativeDate = (offset: number) => {
  const value = new Date()
  value.setHours(12, 0, 0, 0)
  value.setDate(value.getDate() + offset)
  return {
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    label: new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(value),
  }
}

const venues = {
  td: { venueId: 'venue-thao-dien', venueName: 'D-Pickleball Thảo Điền' },
  hp: { venueId: 'venue-hiep-phu', venueName: 'Saigon Rackets Hiệp Phú' },
  ap: { venueId: 'venue-an-phu', venueName: 'An Phú Pickleball Hub' },
}

type EventSeed = Omit<VenueCalendarEvent, 'date' | 'createdAt' | 'updatedAt' | 'venueId' | 'venueName'> & { venue: keyof typeof venues; dayOffset: number }

const eventSeeds: EventSeed[] = [
  { id: 'sample-event-01', venue: 'td', dayOffset: 0, courtId: 'td-court-02', courtName: 'Sân 02', type: 'WALK_IN', title: 'Khách vãng lai', startTime: '17:00', durationMinutes: 90, amount: 120000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'Anh Tùng', contactPhone: '0901234567' },
  { id: 'sample-event-02', venue: 'td', dayOffset: 1, courtId: 'td-court-01', courtName: 'Sân 01', type: 'COACHING', title: 'Lớp PT 1-1 · Kỹ thuật dink', startTime: '06:00', durationMinutes: 90, amount: 140000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'HLV Lê Hoàng Dũng', contactPhone: '0909485285' },
  { id: 'sample-event-03', venue: 'td', dayOffset: 2, courtId: 'td-court-02', courtName: 'Sân 02', type: 'MAINTENANCE', title: 'Bảo trì lưới & vạch sân', startTime: '12:00', durationMinutes: 90, amount: 0, note: 'Thay lưới và sơn lại vạch kitchen.' },
  { id: 'sample-event-04', venue: 'td', dayOffset: 3, courtId: 'td-court-01', courtName: 'Sân 01', type: 'PRIVATE', title: 'Khóa sân riêng · CLB Văn phòng Sky', startTime: '19:30', durationMinutes: 90, amount: 220000, paymentMethod: 'VIETQR', paymentConfirmed: false, contactName: 'Chị Vy', contactPhone: '0938123456' },
  { id: 'sample-event-05', venue: 'hp', dayOffset: 1, courtId: 'hp-court-01', courtName: 'Sân 01', type: 'WALK_IN', title: 'Khách vãng lai', startTime: '09:00', durationMinutes: 90, amount: 90000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'Anh Hải', contactPhone: '0909111222' },
  { id: 'sample-event-06', venue: 'hp', dayOffset: 2, courtId: 'hp-court-02', courtName: 'Sân 02', type: 'COACHING', title: 'Lớp nhóm cơ bản cho người mới', startTime: '16:30', durationMinutes: 90, amount: 100000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'HLV Nguyễn Thành Long', contactPhone: '0903555666' },
  { id: 'sample-event-07', venue: 'ap', dayOffset: 1, courtId: 'ap-court-01', courtName: 'Sân 01', type: 'PRIVATE', title: 'Khóa sân riêng · Nhóm Pickleball Thủ Đức', startTime: '18:00', durationMinutes: 90, amount: 200000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'Anh Phong', contactPhone: '0977333444' },
  { id: 'sample-event-08', venue: 'ap', dayOffset: 2, courtId: 'ap-court-02', courtName: 'Sân 02', type: 'MAINTENANCE', title: 'Bảo dưỡng mặt sân', startTime: '06:00', durationMinutes: 180, amount: 0, note: 'Vệ sinh và kiểm tra độ bám mặt sân.' },
]

/** Lịch cố định ngày 13/11/2026 tại D-Pickleball Thảo Điền (cả Sân 01 và Sân 02). */
const THAO_DIEN_DEMO_DATE = '2026-11-13'
type FixedEventSeed = Omit<VenueCalendarEvent, 'date' | 'createdAt' | 'updatedAt' | 'venueId' | 'venueName'>
const thaoDienDaySeeds: FixedEventSeed[] = [
  // Sân 01
  { id: 'sample-td1113-01', courtId: 'td-court-01', courtName: 'Sân 01', type: 'COACHING', title: 'Lớp nhóm buổi sáng · Kỹ thuật cơ bản', startTime: '06:00', durationMinutes: 90, amount: 140000, paymentMethod: 'CASH', paymentConfirmed: true, paymentConfirmedAt: '2026-11-13T00:10:00.000Z', contactName: 'HLV Lê Hoàng Dũng', contactPhone: '0909485285' },
  { id: 'sample-td1113-02', courtId: 'td-court-01', courtName: 'Sân 01', type: 'WALK_IN', title: 'Khách vãng lai', startTime: '08:00', durationMinutes: 90, amount: 140000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'Chị Lan', contactPhone: '0912000111' },
  { id: 'sample-td1113-03', courtId: 'td-court-01', courtName: 'Sân 01', type: 'PRIVATE', title: 'Khóa sân riêng · Gia đình anh Nam', startTime: '10:30', durationMinutes: 90, amount: 100000, paymentMethod: 'VIETQR', paymentConfirmed: false, contactName: 'Anh Nam', contactPhone: '0905666777' },
  { id: 'sample-td1113-04', courtId: 'td-court-01', courtName: 'Sân 01', type: 'WALK_IN', title: 'Khách vãng lai', startTime: '15:00', durationMinutes: 60, amount: 70000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'Anh Khoa', contactPhone: '0938222333' },
  { id: 'sample-td1113-05', courtId: 'td-court-01', courtName: 'Sân 01', type: 'COACHING', title: 'PT 1-1 · Third shot drop', startTime: '19:30', durationMinutes: 90, amount: 220000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'HLV Lê Hoàng Dũng', contactPhone: '0909485285' },
  // Sân 02 (17:00–18:30 đã có khách vãng lai trong dữ liệu mẫu theo ngày)
  { id: 'sample-td1113-06', courtId: 'td-court-02', courtName: 'Sân 02', type: 'WALK_IN', title: 'Khách vãng lai', startTime: '06:30', durationMinutes: 90, amount: 160000, paymentMethod: 'CASH', paymentConfirmed: true, paymentConfirmedAt: '2026-11-13T01:00:00.000Z', contactName: 'Anh Minh', contactPhone: '0987654321' },
  { id: 'sample-td1113-07', courtId: 'td-court-02', courtName: 'Sân 02', type: 'COACHING', title: 'Lớp PT 1-1 · Di chuyển & split step', startTime: '10:30', durationMinutes: 90, amount: 120000, paymentMethod: 'CASH', paymentConfirmed: false, contactName: 'HLV Lê Hoàng Dũng', contactPhone: '0909485285' },
  { id: 'sample-td1113-08', courtId: 'td-court-02', courtName: 'Sân 02', type: 'MAINTENANCE', title: 'Vệ sinh mặt sân', startTime: '13:00', durationMinutes: 60, amount: 0, note: 'Lau mặt sân và kiểm tra đèn chiếu sáng.' },
  { id: 'sample-td1113-09', courtId: 'td-court-02', courtName: 'Sân 02', type: 'PRIVATE', title: 'Khóa sân riêng · Công ty ABC team building', startTime: '19:00', durationMinutes: 120, amount: 480000, paymentMethod: 'VIETQR', paymentConfirmed: false, contactName: 'Chị Hạnh', contactPhone: '0903222111' },
]

/** Event Chủ sân tạo trên Lịch sân. */
export const buildSampleCalendarEvents = (): VenueCalendarEvent[] => {
  const now = new Date().toISOString()
  const relativeEvents = eventSeeds.map(({ venue, dayOffset, ...event }) => ({
    ...event,
    ...venues[venue],
    date: relativeDate(dayOffset).date,
    createdAt: now,
    updatedAt: now,
  }))
  const thaoDienDay = thaoDienDaySeeds.map((event) => ({ ...event, ...venues.td, date: THAO_DIEN_DEMO_DATE, createdAt: now, updatedAt: now }))
  // Bỏ event theo ngày tương đối nếu trùng giờ với lịch cố định 13/11 (khi demo vào đúng ngày 13/11).
  const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
  const clashes = (event: VenueCalendarEvent) => thaoDienDay.some((item) => item.date === event.date && item.courtId === event.courtId
    && toMinutes(item.startTime) < toMinutes(event.startTime) + event.durationMinutes && toMinutes(event.startTime) < toMinutes(item.startTime) + item.durationMinutes)
  return [...thaoDienDay, ...relativeEvents.filter((event) => !clashes(event))]
}

/**
 * Booking "Thanh toán tại sân" của Player demo (Nguyễn Văn An).
 * Booking sắp tới được tự đồng bộ sang Lịch sân của Chủ sân khi app khởi động.
 */
export const buildSamplePlayerCourtBookings = (): PlayerScheduleItem[] => {
  const tomorrow = relativeDate(1)
  const dayAfter = relativeDate(2)
  const lastWeek = relativeDate(-6)
  const player = { bookingPlayerId: 'player_nguyen_an', bookingPlayerName: 'Nguyễn Văn An', bookingPlayerPhone: '0912 345 678' }
  return [
    {
      id: 'schedule-court-sample-01', kind: 'COURT', title: 'Đặt sân 18:00 - 19:30',
      subtitle: 'Thanh toán tại sân · 220.000đ · Vé QR sẵn sàng',
      venueName: venues.td.venueName, courtName: 'Sân 01 · Trong nhà', venueId: venues.td.venueId, courtId: 'td-court-01', slotNumber: 9,
      date: tomorrow.date, dateLabel: tomorrow.label, timeRange: '18:00 - 19:30', status: 'UPCOMING',
      amount: 220000, totalAmount: 220000, paidAmount: 0, remainingAmount: 220000, paymentMode: 'AT_VENUE',
      slotKey: `${tomorrow.date}:${venues.td.venueId}:td-court-01:18:00 - 19:30`, bookingCode: 'FTL-C-260101',
      bookedAt: new Date().toISOString(), rescheduleCount: 0, ...player,
    },
    {
      id: 'schedule-court-sample-02', kind: 'COURT', title: 'Đặt sân 07:30 - 09:00',
      subtitle: 'Thanh toán tại sân · 140.000đ · Vé QR sẵn sàng',
      venueName: venues.hp.venueName, courtName: 'Sân 02 · Có mái che', venueId: venues.hp.venueId, courtId: 'hp-court-02', slotNumber: 2,
      date: dayAfter.date, dateLabel: dayAfter.label, timeRange: '07:30 - 09:00', status: 'UPCOMING',
      amount: 140000, totalAmount: 140000, paidAmount: 0, remainingAmount: 140000, paymentMode: 'AT_VENUE',
      slotKey: `${dayAfter.date}:${venues.hp.venueId}:hp-court-02:07:30 - 09:00`, bookingCode: 'FTL-C-260102',
      bookedAt: new Date().toISOString(), rescheduleCount: 0, ...player,
    },
    {
      id: 'schedule-court-sample-03', kind: 'COURT', title: 'Đặt sân 19:30 - 21:00',
      subtitle: 'Đã thanh toán tại sân · 200.000đ · Tiền mặt',
      venueName: venues.ap.venueName, courtName: 'Sân 01 · Ngoài trời', venueId: venues.ap.venueId, courtId: 'ap-court-01', slotNumber: 10,
      date: lastWeek.date, dateLabel: lastWeek.label, timeRange: '19:30 - 21:00', status: 'COMPLETED',
      amount: 200000, totalAmount: 200000, paidAmount: 200000, remainingAmount: 0, paymentMode: 'AT_VENUE',
      bookingCode: 'FTL-C-260095', rescheduleCount: 0, ...player,
    },
  ]
}
