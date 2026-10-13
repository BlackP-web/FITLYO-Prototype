import { BarChart3, TrendingUp, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo Cáo & Thống Kê Hiệu Suất</h1>
          <p className="text-muted-foreground mt-1">
            Tổng kết quá trình tập luyện tháng và đánh giá xu hướng thể lực.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Xuất PDF Báo cáo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tổng số giờ tập trong tháng
            </CardTitle>
            <CardDescription>24 buổi tập • 28.5 giờ hoàn thành</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b pb-2">
              {[
                { label: "T2", val: 80, day: "Tháng 1" },
                { label: "T3", val: 65, day: "Tháng 2" },
                { label: "T4", val: 90, day: "Tháng 3" },
                { label: "T5", val: 100, day: "Tháng 4" },
                { label: "T6", val: 75, day: "Tháng 5" },
                { label: "T7", val: 120, day: "Tháng 6" },
                { label: "CN", val: 40, day: "Tháng 7" },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all"
                    style={{ height: `${(bar.val / 120) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{bar.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Biểu đồ phân bổ cường độ vận động các ngày trong tuần
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-forest dark:text-brand-cream" />
              Chỉ số tuân thủ kỷ luật (Consistency Score)
            </CardTitle>
            <CardDescription>Đánh giá mức độ kiên trì với kế hoạch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-forest/10 border border-brand-forest/20 text-brand-forest dark:text-brand-cream">
              <div className="text-3xl font-black">92 / 100</div>
              <p className="text-xs mt-1">Xuất sắc! Bạn thuộc top 5% hội viên chăm chỉ nhất.</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tỷ lệ hoàn thành buổi tập:</span>
                <span className="font-semibold">95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tuân thủ mục tiêu Macro:</span>
                <span className="font-semibold">88%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Độ đều đặn giấc ngủ:</span>
                <span className="font-semibold">90%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
