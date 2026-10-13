import { Calendar, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SchedulePage() {
  const days = [
    { day: "Thứ Hai", workout: "Full Body HIIT", time: "06:30 - 07:15", status: "completed" },
    { day: "Thứ Ba", workout: "Nghỉ ngơi phục hồi (Rest & Foam Roll)", time: "-", status: "rest" },
    { day: "Thứ Tư", workout: "Ngực & Tay sau (Chest & Triceps)", time: "18:00 - 19:00", status: "completed" },
    { day: "Thứ Năm", workout: "Lưng & Tay trước (Back & Biceps)", time: "18:00 - 19:00", status: "today" },
    { day: "Thứ Sáu", workout: "Chân & Mông (Legs & Glutes)", time: "17:30 - 18:30", status: "upcoming" },
    { day: "Thứ Bảy", workout: "Chạy bộ ngoài trời 5km", time: "06:00 - 06:45", status: "upcoming" },
    { day: "Chủ Nhật", workout: "Yoga giãn cơ thư giãn", time: "08:00 - 08:45", status: "upcoming" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch Tập & Nhắc Nhở Tuần</h1>
          <p className="text-muted-foreground mt-1">
            Kế hoạch tập luyện được đồng bộ tự động với Google Calendar.
          </p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Đồng bộ lịch cá nhân
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {days.map((d) => (
          <Card
            key={d.day}
            className={`flex flex-col justify-between ${
              d.status === "today"
                ? "border-primary ring-2 ring-primary/20 shadow-md"
                : ""
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {d.day}
                </p>
                {d.status === "today" && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                    Hôm nay
                  </span>
                )}
              </div>
              <CardTitle className="text-sm font-bold mt-2 line-clamp-2">
                {d.workout}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Clock className="h-3.5 w-3.5" />
                <span>{d.time}</span>
              </div>
              <div className="mt-4">
                {d.status === "completed" ? (
                  <div className="flex items-center gap-1 text-xs text-brand-forest dark:text-brand-cream font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã hoàn thành
                  </div>
                ) : d.status === "today" ? (
                  <Button size="sm" className="w-full text-xs h-7">
                    Vào tập
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Sắp tới</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
