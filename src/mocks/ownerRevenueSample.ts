/**
 * Dữ liệu mẫu doanh thu cho trang Báo cáo doanh thu của chủ sân (SCR_FM_06).
 * Chỉ gồm các khoản thu đã phát sinh tại 3 cụm sân hiện có trong usePlayerStore
 * (D-Pickleball Thảo Điền, Saigon Rackets Hiệp Phú, An Phú Pickleball Hub),
 * giai đoạn 01/10/2026 – 12/11/2026, để biểu đồ có số liệu trực quan khi demo.
 * Tên cụm sân/sân được lấy theo venueId/courtId lúc hiển thị, không lưu ở đây.
 */
export type SampleRevenueSource = 'COURT' | 'SOCIAL' | 'COACHING' | 'WALK_IN' | 'PRIVATE'

export interface SampleRevenueRecord {
  id: string
  date: string
  venueId: string
  courtId: string
  source: SampleRevenueSource
  label: string
  amount: number
  paymentMethod: 'VIETQR' | 'CASH'
  coach?: string
}

export const ownerRevenueSample: SampleRevenueRecord[] = [
  { id: 'sample-td-023', date: '2026-10-02', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'PRIVATE', label: 'Khóa sân riêng · Nhóm Pickleball Thủ Đức', amount: 800000, paymentMethod: 'CASH' },
  { id: 'sample-hp-048', date: '2026-10-02', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'WALK_IN', label: 'Khách vãng lai · Anh Phong', amount: 180000, paymentMethod: 'CASH' },
  { id: 'sample-td-003', date: '2026-10-03', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-034', date: '2026-10-04', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'COURT', label: 'Player đặt sân · Lê Minh Khang', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-037', date: '2026-10-05', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'WALK_IN', label: 'Khách vãng lai · Chị Vy', amount: 200000, paymentMethod: 'CASH' },
  { id: 'sample-td-004', date: '2026-10-06', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'SOCIAL', label: 'Kèo giao lưu tối thứ 6', amount: 480000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-050', date: '2026-10-06', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-009', date: '2026-10-07', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'SOCIAL', label: 'Kèo DUPR 3.0+', amount: 320000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-010', date: '2026-10-07', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'SOCIAL', label: 'Kèo giao lưu tối thứ 6', amount: 480000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-067', date: '2026-10-07', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'WALK_IN', label: 'Khách vãng lai · Chị Lan', amount: 150000, paymentMethod: 'CASH' },
  { id: 'sample-hp-035', date: '2026-10-08', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'COURT', label: 'Player đặt sân · Trần Bảo', amount: 120000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-057', date: '2026-10-10', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'SOCIAL', label: 'Kèo giao lưu tối thứ 6', amount: 240000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-063', date: '2026-10-10', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'SOCIAL', label: 'Kèo newbie cuối tuần', amount: 360000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-076', date: '2026-10-10', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-016', date: '2026-10-11', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COACHING', label: 'Boot Camp DUPR 3.5', amount: 300000, paymentMethod: 'VIETQR', coach: 'HLV Lê Hoàng Dũng' },
  { id: 'sample-hp-055', date: '2026-10-11', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'PRIVATE', label: 'Khóa sân riêng · Nhóm Pickleball Thủ Đức', amount: 600000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-013', date: '2026-10-12', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COACHING', label: 'Lớp cơ bản cho người mới', amount: 300000, paymentMethod: 'VIETQR', coach: 'HLV Lê Hoàng Dũng' },
  { id: 'sample-hp-042', date: '2026-10-14', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'PRIVATE', label: 'Khóa sân riêng · CLB Văn phòng Sky', amount: 1000000, paymentMethod: 'CASH' },
  { id: 'sample-ap-059', date: '2026-10-14', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-075', date: '2026-10-14', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'WALK_IN', label: 'Khách vãng lai · Chị Lan', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-005', date: '2026-10-15', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COACHING', label: 'Lớp cơ bản cho người mới', amount: 500000, paymentMethod: 'VIETQR', coach: 'HLV Lê Hoàng Dũng' },
  { id: 'sample-td-028', date: '2026-10-15', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-047', date: '2026-10-15', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'COURT', label: 'Player đặt sân · Trần Bảo', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-030', date: '2026-10-17', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COURT', label: 'Player đặt sân · Đặng Ngọc Mai', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-041', date: '2026-10-17', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'SOCIAL', label: 'Kèo giao lưu tối thứ 6', amount: 320000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-044', date: '2026-10-17', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'SOCIAL', label: 'Kèo newbie cuối tuần', amount: 360000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-068', date: '2026-10-18', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'COURT', label: 'Player đặt sân · Hoàng Tuấn Kiệt', amount: 240000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-015', date: '2026-10-19', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'SOCIAL', label: 'Kèo sáng chủ nhật', amount: 240000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-022', date: '2026-10-19', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COACHING', label: 'Boot Camp DUPR 3.5', amount: 500000, paymentMethod: 'VIETQR', coach: 'HLV Lê Hoàng Dũng' },
  { id: 'sample-td-021', date: '2026-10-20', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COACHING', label: 'Boot Camp DUPR 3.5', amount: 500000, paymentMethod: 'VIETQR', coach: 'HLV Lê Hoàng Dũng' },
  { id: 'sample-td-001', date: '2026-10-21', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'PRIVATE', label: 'Khóa sân riêng · Công ty ABC team building', amount: 800000, paymentMethod: 'CASH' },
  { id: 'sample-ap-066', date: '2026-10-21', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'WALK_IN', label: 'Khách vãng lai · Anh Hải', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-074', date: '2026-10-21', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'COURT', label: 'Player đặt sân · Ngô Kim Ngân', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-018', date: '2026-10-22', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COACHING', label: 'Boot Camp DUPR 3.5', amount: 500000, paymentMethod: 'VIETQR', coach: 'HLV Lê Hoàng Dũng' },
  { id: 'sample-hp-051', date: '2026-10-22', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'COURT', label: 'Player đặt sân · Đặng Ngọc Mai', amount: 120000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-061', date: '2026-10-23', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'WALK_IN', label: 'Khách vãng lai · Anh Hải', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-025', date: '2026-10-26', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COURT', label: 'Player đặt sân · Lê Minh Khang', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-033', date: '2026-10-26', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'COURT', label: 'Player đặt sân · Bùi Quốc Anh', amount: 120000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-054', date: '2026-10-26', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'SOCIAL', label: 'Kèo newbie cuối tuần', amount: 320000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-017', date: '2026-10-27', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COURT', label: 'Player đặt sân · Đặng Ngọc Mai', amount: 240000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-062', date: '2026-10-27', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'WALK_IN', label: 'Khách vãng lai · Chị Lan', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-026', date: '2026-10-29', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COURT', label: 'Player đặt sân · Bùi Quốc Anh', amount: 180000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-071', date: '2026-10-29', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'SOCIAL', label: 'Kèo newbie cuối tuần', amount: 560000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-073', date: '2026-10-29', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'COURT', label: 'Player đặt sân · Hoàng Tuấn Kiệt', amount: 120000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-032', date: '2026-10-30', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'WALK_IN', label: 'Khách vãng lai · Anh Hải', amount: 200000, paymentMethod: 'CASH' },
  { id: 'sample-td-020', date: '2026-10-31', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COACHING', label: 'Lớp cơ bản cho người mới', amount: 300000, paymentMethod: 'VIETQR', coach: 'HLV Lê Hoàng Dũng' },
  { id: 'sample-hp-039', date: '2026-10-31', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'COURT', label: 'Player đặt sân · Hoàng Tuấn Kiệt', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-040', date: '2026-10-31', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'COURT', label: 'Player đặt sân · Đặng Ngọc Mai', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-053', date: '2026-10-31', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'WALK_IN', label: 'Khách vãng lai · Anh Phong', amount: 180000, paymentMethod: 'CASH' },
  { id: 'sample-ap-065', date: '2026-10-31', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'SOCIAL', label: 'Kèo giao lưu tối thứ 6', amount: 480000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-024', date: '2026-11-01', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 180000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-072', date: '2026-11-03', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'WALK_IN', label: 'Khách vãng lai · Anh Hải', amount: 180000, paymentMethod: 'CASH' },
  { id: 'sample-td-002', date: '2026-11-04', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 240000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-008', date: '2026-11-04', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COURT', label: 'Player đặt sân · Lê Minh Khang', amount: 360000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-043', date: '2026-11-04', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'PRIVATE', label: 'Khóa sân riêng · CLB Văn phòng Sky', amount: 1000000, paymentMethod: 'CASH' },
  { id: 'sample-hp-045', date: '2026-11-04', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'SOCIAL', label: 'Kèo newbie cuối tuần', amount: 480000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-007', date: '2026-11-05', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'WALK_IN', label: 'Khách vãng lai · Chị Vy', amount: 180000, paymentMethod: 'CASH' },
  { id: 'sample-td-027', date: '2026-11-05', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COURT', label: 'Player đặt sân · Bùi Quốc Anh', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-069', date: '2026-11-05', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'COURT', label: 'Player đặt sân · Đặng Ngọc Mai', amount: 120000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-006', date: '2026-11-06', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'SOCIAL', label: 'Kèo giao lưu tối thứ 6', amount: 240000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-014', date: '2026-11-06', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COURT', label: 'Player đặt sân · Hoàng Tuấn Kiệt', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-036', date: '2026-11-06', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'COURT', label: 'Player đặt sân · Trần Bảo', amount: 120000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-012', date: '2026-11-07', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'PRIVATE', label: 'Khóa sân riêng · CLB Văn phòng Sky', amount: 800000, paymentMethod: 'CASH' },
  { id: 'sample-td-019', date: '2026-11-07', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'WALK_IN', label: 'Khách vãng lai · Anh Tùng', amount: 150000, paymentMethod: 'CASH' },
  { id: 'sample-ap-060', date: '2026-11-07', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'COURT', label: 'Player đặt sân · Trần Bảo', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-049', date: '2026-11-08', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'PRIVATE', label: 'Khóa sân riêng · CLB Văn phòng Sky', amount: 800000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-064', date: '2026-11-08', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'COURT', label: 'Player đặt sân · Lê Minh Khang', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-011', date: '2026-11-09', venueId: 'venue-thao-dien', courtId: 'td-court-01', source: 'COURT', label: 'Player đặt sân · Hoàng Tuấn Kiệt', amount: 200000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-031', date: '2026-11-09', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'SOCIAL', label: 'Kèo giao lưu tối thứ 6', amount: 480000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-046', date: '2026-11-09', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'WALK_IN', label: 'Khách vãng lai · Chị Lan', amount: 150000, paymentMethod: 'CASH' },
  { id: 'sample-ap-070', date: '2026-11-09', venueId: 'venue-an-phu', courtId: 'ap-court-02', source: 'PRIVATE', label: 'Khóa sân riêng · Nhóm Pickleball Thủ Đức', amount: 1000000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-038', date: '2026-11-10', venueId: 'venue-hiep-phu', courtId: 'hp-court-01', source: 'COURT', label: 'Player đặt sân · Đặng Ngọc Mai', amount: 360000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-052', date: '2026-11-11', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 120000, paymentMethod: 'VIETQR' },
  { id: 'sample-hp-056', date: '2026-11-11', venueId: 'venue-hiep-phu', courtId: 'hp-court-02', source: 'COURT', label: 'Player đặt sân · Đặng Ngọc Mai', amount: 400000, paymentMethod: 'VIETQR' },
  { id: 'sample-ap-058', date: '2026-11-11', venueId: 'venue-an-phu', courtId: 'ap-court-01', source: 'COURT', label: 'Player đặt sân · Phạm Thu Hà', amount: 150000, paymentMethod: 'VIETQR' },
  { id: 'sample-td-029', date: '2026-11-12', venueId: 'venue-thao-dien', courtId: 'td-court-02', source: 'COURT', label: 'Player đặt sân · Lê Minh Khang', amount: 400000, paymentMethod: 'VIETQR' },
]
