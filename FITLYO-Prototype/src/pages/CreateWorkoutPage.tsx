import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dumbbell, CheckCircle2, ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAppStore } from "@/store/useAppStore"

// Zod schema definition
const workoutSchema = z.object({
  title: z
    .string()
    .min(3, "Tên bài tập phải có ít nhất 3 ký tự")
    .max(50, "Tên bài tập tối đa 50 ký tự"),
  category: z.enum(["Strength", "Cardio", "HIIT", "Yoga", "Pilates"], {
    message: "Vui lòng chọn loại hình phù hợp",
  }),
  durationMinutes: z
    .number()
    .min(5, "Thời lượng tối thiểu là 5 phút")
    .max(180, "Thời lượng tối đa là 180 phút"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    message: "Vui lòng chọn độ khó",
  }),
  exercisesCount: z
    .number()
    .min(1, "Số lượng động tác phải từ 1 trở lên")
    .max(30, "Số lượng động tác không quá 30"),
})

type WorkoutFormValues = z.infer<typeof workoutSchema>

export function CreateWorkoutPage() {
  const navigate = useNavigate()
  const { addWorkout } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      category: "Strength",
      durationMinutes: 30,
      level: "Intermediate",
      exercisesCount: 6,
    },
  })

  async function onSubmit(data: WorkoutFormValues) {
    setIsSubmitting(true)
    setSuccessMessage(null)
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const created = await res.json()
        addWorkout(created)
        setSuccessMessage(`Đã tạo thành công bài tập "${created.title}"!`)
        setTimeout(() => {
          navigate("/workouts")
        }, 1200)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/workouts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thêm Bài Tập Mới</h1>
          <p className="text-sm text-muted-foreground">
            Form validation với React Hook Form + Zod & lưu trữ qua MSW
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-forest/15 p-4 text-sm font-medium text-brand-forest dark:text-brand-cream border border-brand-forest/30">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Chi tiết kế hoạch tập
          </CardTitle>
          <CardDescription>
            Điền các thông số kỹ thuật cho bài tập để AI tính toán calories dự kiến.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên bài tập *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Chest & Triceps Pump, Cardio Core..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Đặt tên ngắn gọn, dễ nhận biết
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phân loại bài tập</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          {...field}
                        >
                          <option value="Strength" className="bg-background">Strength (Sức mạnh)</option>
                          <option value="Cardio" className="bg-background">Cardio (Tim mạch)</option>
                          <option value="HIIT" className="bg-background">HIIT (Cường độ cao)</option>
                          <option value="Yoga" className="bg-background">Yoga</option>
                          <option value="Pilates" className="bg-background">Pilates</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cấp độ người tập</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          {...field}
                        >
                          <option value="Beginner" className="bg-background">Beginner (Mới bắt đầu)</option>
                          <option value="Intermediate" className="bg-background">Intermediate (Trung cấp)</option>
                          <option value="Advanced" className="bg-background">Advanced (Nâng cao)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời lượng (Phút) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={5}
                          max={180}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exercisesCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng động tác *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Đặt lại
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu bài tập..." : "Lưu vào kho bài tập"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
