import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Clock, Award, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachCourse } from '@/types/pickleball'

interface AttendanceModalProps {
  course: CoachCourse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  course,
  open,
  onOpenChange,
}) => {
  const { updateStudentAttendance, showToast } = useFitlyoStore()

  if (!course) return null

  const handleSaveAndAssess = () => {
    onOpenChange(false)
    showToast('Đã lưu điểm danh và cập nhật dữ liệu tiến độ buổi học!', 'success')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/80 bg-card p-6 shadow-2xl rounded-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between border-b pb-3">
            <div>
              <Badge variant="coaching" className="mb-1 text-[11px]">
                <Clock className="w-3 h-3 mr-1" /> Buổi học {course.completedSessions + 1} / {course.totalSessions}
              </Badge>
              <Dialog.Title className="text-lg font-bold text-foreground">
                ĐIỂM DANH & NHẬN XÉT HỌC VIÊN
              </Dialog.Title>
              <p className="text-xs text-muted-foreground mt-0.5">
                Khóa: {course.title} • {course.venue}
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Student list */}
          <div className="space-y-3 py-2 max-h-[50vh] overflow-y-auto">
            {course.students.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatarUrl}
                    alt={st.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <h5 className="text-sm font-semibold text-foreground">{st.name}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        DUPR ban đầu: <b className="text-foreground">{st.dupr}</b>
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-500/10 px-1.5 rounded font-medium">
                        <Award className="w-2.5 h-2.5" /> +0.05 tuần này
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendance buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateStudentAttendance(course.id, st.id, 'present')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      st.attendance === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Có mặt
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStudentAttendance(course.id, st.id, 'absent')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      st.attendance === 'absent'
                        ? 'bg-destructive text-white shadow-xs'
                        : 'border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Vắng
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStudentAttendance(course.id, st.id, 'makeup')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      st.attendance === 'makeup'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Báo bù
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-primary/5 p-3 border border-primary/20 text-xs text-muted-foreground">
            💡 <b>Quyền lợi HLV:</b> Sau khi kết thúc khóa học 8 buổi, điểm đánh giá DUPR của học viên sẽ được đồng bộ lên hệ thống xếp hạng chính thức của FITLYO.
          </div>

          <div className="flex justify-end gap-2.5 border-t pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button onClick={handleSaveAndAssess} className="gap-1.5 active:scale-[0.98]">
              <Check className="w-4 h-4" /> Lưu điểm danh buổi học
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
