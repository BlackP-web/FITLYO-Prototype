import { useState } from "react"
import { Plus, Filter, Clock, Dumbbell, Zap, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppStore } from "@/store/useAppStore"
import type { WorkoutPlan } from "@/types"

export function WorkoutsPage() {
  const { workouts } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [activeModalWorkout, setActiveModalWorkout] = useState<WorkoutPlan | null>(null)

  const categories = ["All", "Strength", "Cardio", "HIIT", "Yoga"]

  const filteredWorkouts =
    selectedCategory === "All"
      ? workouts
      : workouts.filter((w) => w.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kho Bài Tập Thể Hình</h1>
          <p className="text-muted-foreground mt-1">
            Khám phá hơn 100+ bài tập chuyên sâu do chuyên gia Fitlyo biên soạn.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/workouts/create">
            <Plus className="h-4 w-4" />
            Tạo bài tập mới
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full"
          >
            {cat === "All" ? "Tất cả" : cat}
          </Button>
        ))}
      </div>

      {/* Grid of Workouts */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {workout.category}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {workout.level}
                </span>
              </div>
              <CardTitle className="line-clamp-1">{workout.title}</CardTitle>
              <CardDescription>
                Phù hợp cho lịch tập cá nhân hóa & rèn luyện thể lực
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{workout.durationMinutes} phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span>{workout.exercisesCount} động tác</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex items-center justify-between border-t bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setActiveModalWorkout(workout)}
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </Button>
              <Button size="sm" className="gap-1.5 text-xs">
                <Zap className="h-3.5 w-3.5" />
                Tập ngay
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal Dialog Chi tiết bài tập */}
      <Dialog
        open={!!activeModalWorkout}
        onOpenChange={(open) => !open && setActiveModalWorkout(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeModalWorkout?.title}</DialogTitle>
            <DialogDescription>
              Thể loại: {activeModalWorkout?.category} • Cấp độ: {activeModalWorkout?.level}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 bg-muted/40">
              <div>
                <p className="text-xs text-muted-foreground">Thời lượng bài tập</p>
                <p className="text-lg font-bold">{activeModalWorkout?.durationMinutes} phút</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng số động tác</p>
                <p className="text-lg font-bold">{activeModalWorkout?.exercisesCount} bài</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Bài tập này bao gồm các hiệp vận động ngắt quãng cường độ cao (HIIT) và các động tác gia tăng sức bền tim mạch.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
