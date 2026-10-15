import { useMemo, useState } from 'react'
import { BookOpenCheck, Clock3, Edit3, MapPin, Plus, Share2, Target, Users } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachCourse } from '@/types/pickleball'

const initialForm = {
  title: 'Boot Camp Pickleball - Bứt Phá DUPR 3.5',
  courseType: 'GROUP_4' as 'GROUP_4' | 'PT_1ON1',
  duprInput: '2.50 - 3.00',
  duprOutput: '3.50+',
  totalSessions: 8,
  venue: 'D-Pickleball Thảo Điền',
  slotNumber: 5,
  timeRange: '18:30 - 20:00',
  fee: 2400000,
  description: 'Lộ trình tập trung vào Dinking, Third-shot Drop và chiến thuật đánh đôi.',
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'

export function CoachCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { coachAccount, coachCourses, coachAffiliations, createCoachCourse, updateCoachCourse, showToast } = useFitlyoStore()
  const [isOpen, setIsOpen] = useState(searchParams.get('create') === '1')
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [form, setForm] = useState(initialForm)

  const ownCourses = useMemo(
    () => coachCourses.filter((course) => course.coachId === coachAccount.id),
    [coachAccount.id, coachCourses],
  )
  const approvedVenues = coachAffiliations.filter((item) => item.coachId === coachAccount.id && item.status === 'APPROVED')

  const closeModal = () => {
    setIsOpen(false)
    setEditingCourseId(null)
    setForm(initialForm)
    setSearchParams({})
  }

  const openEdit = (course: CoachCourse) => {
    setEditingCourseId(course.id)
    setForm({
      title: course.title,
      courseType: course.courseType ?? 'GROUP_4',
      duprInput: course.duprInput ?? '2.50 - 3.00',
      duprOutput: course.duprOutput ?? '3.50+',
      totalSessions: course.totalSessions,
      venue: course.venue,
      slotNumber: course.slotNumber ?? 5,
      timeRange: course.timeRange ?? '18:30 - 20:00',
      fee: course.fee,
      description: course.description ?? '',
    })
    setIsOpen(true)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (form.title.trim().length < 10) {
      showToast('Tên khóa học cần có ít nhất 10 ký tự.', 'error')
      return
    }
    const selectedVenue = approvedVenues.find((item) => item.venueName === form.venue)
    if (!selectedVenue) {
      showToast('Chỉ được chọn cụm sân đã duyệt liên kết.', 'error')
      return
    }

    const courseStatus: CoachCourse['status'] = editingCourseId
      ? ownCourses.find((course) => course.id === editingCourseId)?.status ?? 'RECRUITING'
      : 'RECRUITING'
    const courseData = {
      title: form.title.trim(),
      duration: `1 tháng (${form.totalSessions} buổi)`,
      frequency: `2 buổi/tuần · Slot ${form.slotNumber} (${form.timeRange})`,
      venue: form.venue,
      fee: form.fee,
      maxStudents: form.courseType === 'PT_1ON1' ? 1 : 4,
      totalSessions: form.totalSessions,
      status: courseStatus,
      courseType: form.courseType,
      duprInput: form.duprInput,
      duprOutput: form.duprOutput,
      slotNumber: form.slotNumber,
      timeRange: form.timeRange,
      scheduleDays: ['Thứ Ba', 'Thứ Năm'],
      description: form.description.trim(),
    }

    if (editingCourseId) updateCoachCourse(editingCourseId, courseData)
    else createCoachCourse(courseData)
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Quản lý đào tạo</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Khóa học & gói PT</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Tạo, chỉnh sửa và công bố các chương trình đào tạo của riêng {coachAccount.name}.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="h-10"><Plus /> Tạo khóa học mới</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Tổng khóa học', ownCourses.length, 'bg-secondary/55 text-primary dark:bg-secondary/15'],
          ['Đang giảng dạy', ownCourses.filter((course) => course.status === 'IN_PROGRESS').length, 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'],
          ['Đang tuyển sinh', ownCourses.filter((course) => course.status === 'RECRUITING').length, 'bg-amber-500/10 text-amber-700 dark:text-amber-300'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="brand-card rounded-2xl p-4">
            <span className={`inline-flex rounded-lg px-2 py-1 text-[11px] font-bold ${color}`}>{label}</span>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {ownCourses.map((course) => {
          const progress = Math.round((course.completedSessions / course.totalSessions) * 100)
          return (
            <article key={course.id} className="brand-card rounded-3xl p-5 transition hover:border-primary/25 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className={course.status === 'IN_PROGRESS' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
                      {course.status === 'IN_PROGRESS' ? 'Đang giảng dạy' : 'Đang tuyển sinh'}
                    </Badge>
                    <Badge variant="outline">{course.courseType === 'PT_1ON1' ? 'PT 1-1' : 'Lớp nhóm'}</Badge>
                  </div>
                  <h2 className="text-lg font-black leading-snug">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{course.description}</p>
                </div>
                <div className="rounded-xl bg-secondary/55 p-2.5 text-primary dark:bg-secondary/15"><BookOpenCheck className="h-5 w-5" /></div>
              </div>

              <div className="my-4 grid gap-2 text-xs sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3"><Target className="h-4 w-4 text-primary" /><span>DUPR {course.duprInput} → <strong>{course.duprOutput}</strong></span></div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3"><Users className="h-4 w-4 text-violet-600 dark:text-violet-300" /><span>{course.currentStudents}/{course.maxStudents} học viên</span></div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3"><Clock3 className="h-4 w-4 text-amber-600 dark:text-amber-300" /><span>Slot {course.slotNumber} · {course.timeRange}</span></div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3"><MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /><span className="truncate">{course.venue}</span></div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground"><span>Tiến độ {course.completedSessions}/{course.totalSessions} buổi</span><span>{progress}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
              </div>

              <div className="mt-5 flex flex-col justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                <div><p className="text-lg font-black text-primary">{formatCurrency(course.fee)}</p><p className="text-[10px] text-muted-foreground">/ học viên · thực nhận 90%</p></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => showToast('Đã sao chép liên kết tuyển sinh.', 'success')}><Share2 /> Chia sẻ</Button>
                  <Button size="sm" onClick={() => openEdit(course)}><Edit3 /> Chỉnh sửa</Button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : closeModal()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingCourseId ? 'Chỉnh sửa khóa học' : 'Thiết lập khóa học mới'}</DialogTitle>
            <DialogDescription>Khóa học chỉ được xếp tại các cụm sân đã duyệt liên kết.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="course-title">Tên khóa học *</Label><Input id="course-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="course-type">Loại đào tạo</Label><select id="course-type" value={form.courseType} onChange={(event) => setForm({ ...form, courseType: event.target.value as typeof form.courseType })} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="GROUP_4">Lớp nhóm · tối đa 4 HV</option><option value="PT_1ON1">PT cá nhân 1-1</option></select></div>
              <div className="space-y-2"><Label htmlFor="course-sessions">Số buổi học</Label><Input id="course-sessions" type="number" min={1} max={30} value={form.totalSessions} onChange={(event) => setForm({ ...form, totalSessions: Number(event.target.value) })} /></div>
              <div className="space-y-2"><Label htmlFor="dupr-in">DUPR đầu vào</Label><select id="dupr-in" value={form.duprInput} onChange={(event) => setForm({ ...form, duprInput: event.target.value })} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>2.00 - 2.50</option><option>2.50 - 3.00</option><option>3.00 - 3.50</option><option>3.50 - 4.00</option></select></div>
              <div className="space-y-2"><Label htmlFor="dupr-out">DUPR cam kết đầu ra</Label><select id="dupr-out" value={form.duprOutput} onChange={(event) => setForm({ ...form, duprOutput: event.target.value })} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option>3.00+</option><option>3.50+</option><option>4.00+</option><option>4.50+</option></select></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="course-venue">Cụm sân đã liên kết *</Label><select id="course-venue" value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} className="h-9 w-full rounded-md border bg-background px-3 text-sm">{approvedVenues.map((venue) => <option key={venue.id}>{venue.venueName}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="course-slot">Khung giờ</Label><select id="course-slot" value={form.slotNumber} onChange={(event) => { const slot = Number(event.target.value); const times: Record<number, string> = { 1: '06:00 - 07:30', 2: '07:30 - 09:00', 3: '09:00 - 10:30', 4: '15:30 - 17:00', 5: '18:30 - 20:00', 6: '20:00 - 21:30' }; setForm({ ...form, slotNumber: slot, timeRange: times[slot] }) }} className="h-9 w-full rounded-md border bg-background px-3 text-sm">{[1, 2, 3, 4, 5, 6].map((slot) => <option key={slot} value={slot}>Slot {slot}{slot === 5 ? ' · Giờ vàng' : ''}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="course-fee">Học phí / học viên</Label><Input id="course-fee" type="number" min={100000} step={50000} value={form.fee} onChange={(event) => setForm({ ...form, fee: Number(event.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="course-description">Mô tả mục tiêu & kỹ năng</Label><textarea id="course-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" /></div>
            <div className="rounded-xl border border-primary/15 bg-secondary/35 p-3 text-xs text-foreground">Thu nhập dự kiến sau phí nền tảng 10%: <strong>{formatCurrency(form.fee * 0.9)} / học viên</strong></div>
            <DialogFooter><Button type="button" variant="outline" onClick={closeModal}>Hủy bỏ</Button><Button type="submit">{editingCourseId ? 'Lưu thay đổi' : 'Công bố khóa học'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
