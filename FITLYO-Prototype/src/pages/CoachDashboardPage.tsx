import React, { useState } from 'react'
import {
  Award,
  Calendar,
  Users,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Share2,
  Edit,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AttendanceModal } from '@/components/modals/AttendanceModal'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachCourse } from '@/types/pickleball'

export const CoachDashboardPage: React.FC = () => {
  const { coachCourses, showToast } = useFitlyoStore()

  const [activeTab, setActiveTab] = useState<'courses' | 'schedule' | 'students'>('courses')
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState<CoachCourse | null>(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)

  const handleOpenAttendance = (course: CoachCourse) => {
    setSelectedCourseForAttendance(course)
    setIsAttendanceModalOpen(true)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Coach Profile & Verification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
            alt="HLV Đặng Tuấn Kiệt"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-md ring-2 ring-primary/10"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-xs">
                SCR_COACH_01
              </Badge>
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> VERIFIED CERTIFIED COACH (IPTPA Level 2)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              HLV ĐẶNG TUẤN KIỆT
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span className="text-amber-500 font-bold">⭐ 4.95 (62 đánh giá)</span>
              <span>•</span>
              <span>8 năm kinh nghiệm</span>
              <span>•</span>
              <span>Đã đào tạo 200+ học viên</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => showToast('Mở trình tạo khóa học mới cho HLV Certified', 'info')}
          className="gap-2 self-start sm:self-auto shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Khóa Học Mới</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'courses' | 'schedule' | 'students')}>
        <TabsList className="bg-muted/70 p-1 rounded-xl">
          <TabsTrigger value="courses" className="text-xs sm:text-sm font-semibold">
            📚 Khóa học đang mở ({coachCourses.length})
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm font-semibold">
            🗓️ Lịch dạy tuần
          </TabsTrigger>
          <TabsTrigger value="students" className="text-xs sm:text-sm font-semibold">
            👥 Danh sách học viên (6)
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Khóa học đang mở */}
        <TabsContent value="courses" className="space-y-4">
          {coachCourses.map((course) => {
            const isFull = course.currentStudents >= course.maxStudents
            const progressPercent = Math.round(
              (course.completedSessions / course.totalSessions) * 100
            )

            return (
              <div
                key={course.id}
                className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs hover:border-primary/40 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        #{course.id}
                      </span>
                      {course.status === 'IN_PROGRESS' ? (
                        <Badge variant="success" className="text-xs">
                          ● ĐANG DIỄN RA
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-xs">
                          ● ĐANG TUYỂN SINH
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      KHÓA: "{course.title}"
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block">Học phí:</span>
                    <span className="text-base font-extrabold text-foreground">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(course.fee)}{' '}
                      <span className="text-xs font-normal text-muted-foreground">/ học viên</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl border border-border/50">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Thời lượng & Tần suất
                    </span>
                    <p className="font-semibold text-foreground">{course.duration}</p>
                    <p className="text-muted-foreground">{course.frequency}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Địa điểm giảng dạy
                    </span>
                    <p className="font-semibold text-foreground">{course.venue}</p>
                    <p className="text-muted-foreground">Sân chuẩn thi đấu quốc tế</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" /> Sĩ số & Tiến độ
                    </span>
                    <p className="font-semibold text-foreground">
                      {course.currentStudents}/{course.maxStudents} học viên {isFull && '(Đầy lớp)'}
                    </p>
                    <p className="text-muted-foreground">
                      Đã dạy: {course.completedSessions}/{course.totalSessions} buổi ({progressPercent}%)
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tiến độ chương trình:</span>
                    <span>Buổi {course.completedSessions} / {course.totalSessions} buổi</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
                  <div className="flex -space-x-2">
                    {course.students.map((st) => (
                      <img
                        key={st.id}
                        src={st.avatarUrl}
                        alt={st.name}
                        title={st.name}
                        className="w-8 h-8 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {course.status === 'IN_PROGRESS' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleOpenAttendance(course)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ĐIỂM DANH BUỔI HỌC</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => showToast('Mở chi tiết giáo trình đào tạo', 'info')}
                        >
                          Chi Tiết Lớp
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => showToast('Đã sao chép link tuyển sinh khóa học!', 'info')}
                          className="gap-1.5"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Sao Chép Link</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => showToast('Mở chỉnh sửa thông tin khóa học', 'info')}
                          className="gap-1.5"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Chỉnh Sửa</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </TabsContent>

        {/* Tab 2: Lịch dạy tuần */}
        <TabsContent value="schedule">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <h4 className="font-bold text-foreground flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Lịch Giảng Dạy Tuần Hiện Tại</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border bg-muted/30 space-y-1">
                <span className="text-[11px] font-bold text-primary">Thứ Ba & Thứ Năm • 07:30 - 09:00 (Slot 2)</span>
                <p className="font-bold text-foreground">Pickleball Căn bản & Làm quen DUPR 2.0</p>
                <p className="text-muted-foreground">Địa điểm: Sân 1 - Cụm sân D-Sports Thủ Đức</p>
              </div>
              <div className="p-3.5 rounded-xl border bg-muted/30 space-y-1">
                <span className="text-[11px] font-bold text-primary">Thứ Tư & Thứ Sáu • 18:30 - 20:00 (Slot 5)</span>
                <p className="font-bold text-foreground">Chiến thuật Đánh đôi Nâng cao DUPR 3.5+</p>
                <p className="text-muted-foreground">Địa điểm: Sân 2 - Cụm sân Thủ Thiêm Sports Hub</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Học viên */}
        <TabsContent value="students">
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <h4 className="font-bold text-foreground text-sm sm:text-base">
              Danh Sách Học Viên Đang Theo Học
            </h4>
            <div className="divide-y text-xs">
              {coachCourses[0].students.map((st) => (
                <div key={st.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={st.avatarUrl} alt={st.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h5 className="font-semibold text-foreground">{st.name}</h5>
                      <span className="text-muted-foreground">DUPR hiện tại: {st.dupr}</span>
                    </div>
                  </div>
                  <Badge variant="success">Chăm chỉ (95%)</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Attendance Modal Component */}
      <AttendanceModal
        course={selectedCourseForAttendance}
        open={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
      />
    </div>
  )
}
