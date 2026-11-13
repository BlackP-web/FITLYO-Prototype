/**
 * Dữ liệu mẫu: các buổi học / khóa học đã hoàn thành của Coach demo (coach_dung),
 * dùng để trang "Thanh toán phí" có số liệu khi demo. Phí = 5% số tiền.
 */
import { coachFeeFor, type CoachFeeItem } from '@/lib/coachFees'

const sample = (item: Omit<CoachFeeItem, 'feeAmount'>): CoachFeeItem => ({ ...item, feeAmount: coachFeeFor(item.grossAmount) })

export const coachFeeSample: CoachFeeItem[] = [
  sample({ id: 'sample-fee-01', coachId: 'coach_dung', kind: 'SESSION', title: 'PT 1-1 · Kỹ thuật dink', detail: 'Trần Bảo · 15:00 - 16:30 · D-Pickleball Thảo Điền', completedDate: '2026-10-20', grossAmount: 450000 }),
  sample({ id: 'sample-fee-02', coachId: 'coach_dung', kind: 'SESSION', title: 'PT 1-1 · Third shot drop', detail: 'Ngô Kim Ngân · 18:00 - 19:30 · D-Pickleball Thảo Điền', completedDate: '2026-10-22', grossAmount: 450000 }),
  sample({ id: 'sample-fee-03', coachId: 'coach_dung', kind: 'COURSE', title: 'Khóa nền tảng cho người mới (4 buổi)', detail: 'Lê Minh Khang · 4 buổi · D-Pickleball Thảo Điền', completedDate: '2026-10-29', grossAmount: 1800000 }),
  sample({ id: 'sample-fee-04', coachId: 'coach_dung', kind: 'SESSION', title: 'PT 1-1 · Di chuyển & split step', detail: 'Phạm Thu Hà · 06:00 - 07:30 · D-Pickleball Thảo Điền', completedDate: '2026-11-05', grossAmount: 450000 }),
]
