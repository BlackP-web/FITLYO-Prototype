import { ShoppingBag, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function StorePage() {
  const plans = [
    {
      title: "Gói Cơ Bản (Starter)",
      price: "199,000 đ/tháng",
      description: "Thích hợp cho người mới bắt đầu làm quen với tập luyện",
      features: [
        "Truy cập 50+ bài tập cơ bản",
        "Nhật ký dinh dưỡng thủ công",
        "Cộng đồng hỗ trợ",
      ],
      popular: false,
    },
    {
      title: "Gói Pro (Fitlyo Plus)",
      price: "399,000 đ/tháng",
      description: "Đầy đủ tính năng thông minh và cá nhân hóa từ AI Coach",
      features: [
        "Truy cập toàn bộ 500+ bài tập chuyên sâu",
        "AI huấn luyện viên 24/7 đề xuất bài tập",
        "Tính toán Macros và thực đơn tự động",
        "Báo cáo InBody phân tích chuyên sâu",
      ],
      popular: true,
    },
    {
      title: "Gói VIP (Coaching 1:1)",
      price: "1,299,000 đ/tháng",
      description: "Dành cho người muốn đạt kết quả nhanh chóng với HLV riêng",
      features: [
        "Tất cả quyền lợi của gói Pro",
        "HLV riêng theo sát và chỉnh kỹ thuật",
        "Cuộc gọi video tư vấn hàng tuần",
        "Hỗ trợ giải đáp ưu tiên 24/7",
      ],
      popular: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cửa Hàng & Gói Hội Viên Fitlyo</h1>
        <p className="text-muted-foreground mt-1">
          Nâng cấp tài khoản để mở khóa toàn bộ sức mạnh của trợ lý thể hình AI.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card
            key={p.title}
            className={`flex flex-col justify-between ${
              p.popular ? "border-primary ring-2 ring-primary/20 shadow-lg relative" : ""
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow">
                ĐƯỢC CHỌN NHIỀU NHẤT
              </div>
            )}
            <CardHeader className="pt-6">
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-extrabold">{p.price}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Quyền lợi bao gồm:
              </p>
              <ul className="space-y-2 text-sm">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-forest dark:text-brand-cream shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Button
                variant={p.popular ? "default" : "outline"}
                className="w-full gap-2"
              >
                <Zap className="h-4 w-4" />
                Đăng ký ngay
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
