import { useState } from "react"
import {
  Flame,
  Dumbbell,
  Clock,
  Trophy,
  ArrowRight,
  Plus,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppStore } from "@/store/useAppStore"
import { Link } from "react-router-dom"

export function DashboardPage() {
  const { user, workouts } = useAppStore()
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false)

  const stats = [
    {
      title: "Calories Đã Đốt",
      value: "640 kcal",
      sub: "+12% so với hôm qua",
      icon: Flame,
      color: "text-brand-orange",
      bg: "bg-brand-orange/10",
    },
    {
      title: "Thời Lượng Tập",
      value: "45 phút",
      sub: "Mục tiêu 60 phút/ngày",
      icon: Clock,
      color: "text-brand-forest dark:text-brand-cream",
      bg: "bg-brand-forest/10",
    },
    {
      title: "Bài Tập Hoàn Thành",
      value: `${workouts.length} bài`,
      sub: "Tuần này",
      icon: Dumbbell,
      color: "text-brand-forest dark:text-brand-cream",
      bg: "bg-brand-forest/10",
    },
    {
      title: "Chuỗi Ngày Liên Tục",
      value: "7 ngày 🔥",
      sub: "Kỷ lục cá nhân: 14 ngày",
      icon: Trophy,
      color: "text-brand-amber",
      bg: "bg-brand-amber/15",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Xin chào, {user?.name || "Chiến binh Fitlyo"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Mục tiêu: <span className="font-medium text-foreground">{user?.fitnessGoal}</span>. Cân nặng hiện tại: {user?.currentWeight} kg.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isQuickStartOpen} onOpenChange={setIsQuickStartOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Play className="h-4 w-4 fill-current" />
                Bắt đầu buổi tập nhanh
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Khởi động buổi tập mới</DialogTitle>
                <DialogDescription>
                  Hệ thống AI sẽ tự động ghi nhận nhịp tim, lượng calo và gợi ý thời gian nghỉ ngơi.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="font-semibold text-sm">Gợi ý hôm nay: Full Body HIIT Blast</p>
                  <p className="text-xs text-muted-foreground">45 phút • Cường độ trung bình • 8 bài tập</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dữ liệu được đồng bộ trực tiếp vào hệ thống quản lý Zustand & MSW Mock API.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsQuickStartOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsQuickStartOpen(false)}>
                  Bắt đầu ngay
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" asChild>
            <Link to="/workouts/create" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Thêm bài tập
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Grid Content: Workouts Table & AI Tips */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sách bài tập hôm nay</CardTitle>
              <CardDescription>
                Dữ liệu được nạp tự động từ MSW Mock Service Worker
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workouts" className="gap-1 text-xs">
                Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead>Phân loại</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Độ khó</TableHead>
                  <TableHead className="text-right">Số động tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      Đang tải danh sách bài tập từ mock API...
                    </TableCell>
                  </TableRow>
                ) : (
                  workouts.slice(0, 4).map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.title}</TableCell>
                      <TableCell>
                        <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {w.category}
                        </span>
                      </TableCell>
                      <TableCell>{w.durationMinutes} phút</TableCell>
                      <TableCell>{w.level}</TableCell>
                      <TableCell className="text-right">{w.exercisesCount} reps/sets</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* AI Recommendations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lời khuyên từ Huấn luyện viên</CardTitle>
            <CardDescription>Tối ưu hóa phục hồi cơ bắp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3 text-sm space-y-1">
              <p className="font-semibold text-primary">💧 Uống đủ nước</p>
              <p className="text-xs text-muted-foreground">
                Bạn đã uống 1.8L / 2.5L mục tiêu. Hãy bổ sung thêm 700ml sau buổi tập.
              </p>
            </div>
            <div className="rounded-lg border p-3 text-sm space-y-1">
              <p className="font-semibold text-brand-forest dark:text-brand-cream">🥗 Dinh dưỡng phục hồi</p>
              <p className="text-xs text-muted-foreground">
                Nạp khoảng 25-30g Protein trong vòng 45 phút sau khi tập xong.
              </p>
            </div>
            <div className="rounded-lg border p-3 text-sm space-y-1">
              <p className="font-semibold text-brand-orange">😴 Giấc ngủ</p>
              <p className="text-xs text-muted-foreground">
                Ngủ đủ 7-8 tiếng tối nay để cơ bắp phục hồi và phát triển tối đa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
