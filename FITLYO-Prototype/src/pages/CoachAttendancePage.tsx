import { useMemo, useState } from 'react'
import { Award, CheckCircle2, ClipboardCheck, Clock3, MapPin, Save, UserCheck, UserX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { StudentProgress } from '@/types/pickleball'

interface AssessmentCardProps {
  courseId: string
  targetDupr: number
  student: StudentProgress
}

function AssessmentCard({ courseId, targetDupr, student }: AssessmentCardProps) {
  const { updateStudentAttendance, updateStudentAssessment } = useFitlyoStore()
  const [draft, setDraft] = useState({
    serveScore: student.serveScore ?? 0,
    dropShotScore: student.dropShotScore ?? 0,
    dinkScore: student.dinkScore ?? 0,
    finalDupr: student.finalDupr ?? student.dupr,
    feedback: student.feedback ?? '',
  })
  const passed = draft.finalDupr >= targetDupr

  return (
    <article className="brand-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <img src={student.avatarUrl} alt={student.name} className="h-12 w-12 rounded-xl object-cover" />
          <div><p className="font-black">{student.name}</p><p className="text-xs text-muted-foreground">DUPR đầu khóa: <strong>{student.dupr.toFixed(2)}</strong></p></div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant={student.attendance === 'present' ? 'default' : 'outline'} onClick={() => updateStudentAttendance(courseId, student.id, 'present')} className={student.attendance === 'present' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}><UserCheck /> Có mặt</Button>
          <Button type="button" size="sm" variant={student.attendance === 'absent' ? 'destructive' : 'outline'} onClick={() => updateStudentAttendance(courseId, student.id, 'absent')}><UserX /> Vắng</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
        {[['Giao bóng', 'serveScore'], ['Drop shot', 'dropShotScore'], ['Dinking rally', 'dinkScore']].map(([label, key]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`${student.id}-${key}`}>{label} / 10</Label>
            <Input id={`${student.id}-${key}`} type="number" min={0} max={10} step={0.5} value={draft[key as keyof typeof draft] as number} onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })} />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="space-y-2"><Label htmlFor={`${student.id}-dupr`}>DUPR đánh giá mới</Label><Input id={`${student.id}-dupr`} type="number" min={1} max={8} step={0.01} value={draft.finalDupr} onChange={(event) => setDraft({ ...draft, finalDupr: Number(event.target.value) })} /></div>
        <div className="space-y-2"><Label htmlFor={`${student.id}-feedback`}>Nhận xét chuyên môn</Label><textarea id={`${student.id}-feedback`} value={draft.feedback} onChange={(event) => setDraft({ ...draft, feedback: event.target.value })} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/40" /></div>
      </div>

      <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl bg-muted/70 p-3 sm:flex-row sm:items-center">
        <Badge className={passed ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
          {passed ? <><CheckCircle2 /> Đạt cam kết đầu ra</> : <><Clock3 /> Cần tiếp tục rèn luyện</>}
        </Badge>
        <Button size="sm" onClick={() => updateStudentAssessment(courseId, student.id, draft)}><Save /> Lưu đánh giá</Button>
      </div>
    </article>
  )
}

export function CoachAttendancePage() {
  const [searchParams] = useSearchParams()
  const { coachAccount, coachCourses, showToast } = useFitlyoStore()
  const ownCourses = useMemo(
    () => coachCourses.filter((course) => course.coachId === coachAccount.id && course.students.length > 0),
    [coachAccount.id, coachCourses],
  )
  const requestedCourseId = searchParams.get('course')
  const [selectedCourseId, setSelectedCourseId] = useState(
    ownCourses.some((course) => course.id === requestedCourseId) ? requestedCourseId! : ownCourses[0]?.id ?? '',
  )
  const course = ownCourses.find((item) => item.id === selectedCourseId) ?? ownCourses[0]
  const targetDupr = Number.parseFloat(course?.duprOutput ?? '3.5')
  const presentCount = course?.students.filter((student) => student.attendance === 'present').length ?? 0

  if (!course) {
    return <div className="brand-card rounded-2xl p-8 text-center text-sm text-muted-foreground">Chưa có lớp nào có học viên để điểm danh.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Quản lý buổi học</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Điểm danh & đánh giá DUPR</h1>
        <p className="mt-2 text-sm text-muted-foreground">Chỉ hiển thị học viên thuộc các lớp do {coachAccount.name} phụ trách.</p>
      </div>

      <section className="brand-card rounded-3xl p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="attendance-course">Chọn lớp / buổi dạy</Label>
            <select id="attendance-course" value={course.id} onChange={(event) => setSelectedCourseId(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-ring/40">
              {ownCourses.map((item) => <option key={item.id} value={item.id}>{item.title} · Buổi {Math.min(item.completedSessions + 1, item.totalSessions)}/{item.totalSessions}</option>)}
            </select>
          </div>
          <Button onClick={() => showToast(`Đã hoàn thành điểm danh ${presentCount}/${course.students.length} học viên. Buổi học được chuyển sang chờ đối soát.`, 'success')} className="h-11"><ClipboardCheck /> Hoàn thành buổi học</Button>
        </div>

        <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
          <div className="rounded-xl bg-secondary/55 p-3"><p className="text-[11px] font-bold uppercase text-primary">Lớp học</p><p className="mt-1 text-sm font-black">{course.title}</p></div>
          <div className="rounded-xl bg-amber-500/10 p-3"><p className="flex items-center gap-1 text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300"><MapPin className="h-3 w-3" /> Địa điểm</p><p className="mt-1 text-sm font-black">{course.venue}</p><p className="text-[11px] text-muted-foreground">Slot {course.slotNumber} · {course.timeRange}</p></div>
          <div className="rounded-xl bg-emerald-500/10 p-3"><p className="flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300"><UserCheck className="h-3 w-3" /> Điểm danh</p><p className="mt-1 text-sm font-black">{presentCount}/{course.students.length} học viên có mặt</p><p className="text-[11px] text-muted-foreground">Mục tiêu DUPR {course.duprOutput}</p></div>
        </div>
      </section>

      <div className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-600" /><h2 className="text-lg font-black">Danh sách học viên ({course.students.length})</h2></div>
      <div className="space-y-4">
        {course.students.map((student) => <AssessmentCard key={`${course.id}-${student.id}`} courseId={course.id} targetDupr={targetDupr} student={student} />)}
      </div>
    </div>
  )
}
