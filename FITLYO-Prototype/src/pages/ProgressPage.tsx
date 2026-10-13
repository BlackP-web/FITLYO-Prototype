import { TrendingUp, Scale, Activity, Award } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ProgressPage() {
  const milestones = [
    { week: "Tuần 1", weight: "74.0 kg", bodyFat: "22.5%", muscleMass: "32.0 kg" },
    { week: "Tuần 2", weight: "73.5 kg", bodyFat: "21.9%", muscleMass: "32.2 kg" },
    { week: "Tuần 3", weight: "73.0 kg", bodyFat: "21.3%", muscleMass: "32.5 kg" },
    { week: "Tuần 4 (Hiện tại)", weight: "72.5 kg", bodyFat: "20.8%", muscleMass: "32.8 kg" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Theo Dõi Tiến Độ & Body Metric</h1>
        <p className="text-muted-foreground mt-1">
          Đo lường sự biến đổi hình thể theo từng tuần thông qua chỉ số InBody.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cân Nặng Ban Đầu</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75.0 kg</div>
            <p className="text-xs text-brand-forest dark:text-brand-cream font-medium mt-1">↓ Giảm 2.5 kg trong 4 tuần</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Mỡ (Body Fat)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20.8%</div>
            <p className="text-xs text-brand-forest dark:text-brand-cream font-medium mt-1">↓ Giảm 1.7% mỡ thừa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Khối Lượng Cơ Xương</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.8 kg</div>
            <p className="text-xs text-brand-orange font-medium mt-1">↑ Tăng +0.8 kg cơ bắp</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Lịch sử đo lường InBody hàng tuần
          </CardTitle>
          <CardDescription>
            Cập nhật mỗi thứ Hai đầu tuần tại phòng tập hoặc cân thông minh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((m) => (
              <div
                key={m.week}
                className="flex items-center justify-between p-4 rounded-xl border bg-muted/20"
              >
                <div>
                  <p className="font-semibold">{m.week}</p>
                  <p className="text-xs text-muted-foreground">
                    Cân nặng: {m.weight} • Mỡ: {m.bodyFat}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">Cơ bắp: {m.muscleMass}</p>
                  <p className="text-xs text-brand-forest dark:text-brand-cream font-medium">Đạt chuẩn tuần</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
