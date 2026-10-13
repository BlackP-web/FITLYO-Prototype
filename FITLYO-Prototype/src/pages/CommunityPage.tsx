import { Users, Trophy, Heart, MessageSquare, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CommunityPage() {
  const challenges = [
    {
      title: "Thử Thách 30 Ngày Squat & Chạy Bộ",
      participants: "1,248 hội viên tham gia",
      reward: "Huy hiệu Vàng & Voucher 200k",
      progress: "Ngày 14/30",
    },
    {
      title: "Plank Master 5 Phút",
      participants: "830 hội viên tham gia",
      reward: "Huy hiệu Bạc & Quà từ Fitlyo",
      progress: "Ngày 20/30",
    },
  ]

  const posts = [
    {
      author: "Nguyễn Minh Tuấn",
      time: "2 giờ trước",
      content: "Vừa hoàn thành buổi leg day cực gắt! Cảm ơn giáo án từ Fitlyo đã giúp mình tăng PR Squat lên 120kg 💪",
      likes: 42,
      comments: 7,
    },
    {
      author: "Trần Mai Anh",
      time: "5 giờ trước",
      content: "Ăn theo macro thực đơn Fitlyo gợi ý 3 tuần qua đã giảm được 2kg mỡ mà người vẫn tràn đầy năng lượng!",
      likes: 56,
      comments: 12,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cộng Đồng & Thử Thách Fitlyo</h1>
        <p className="text-muted-foreground mt-1">
          Giao lưu, chia sẻ thành tích và cùng nhau chinh phục mục tiêu thể hình.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bảng tin cộng đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.map((p, idx) => (
                <div key={idx} className="rounded-xl border p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{p.author}</p>
                      <p className="text-xs text-muted-foreground">{p.time}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{p.content}</p>
                  <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                      <Heart className="h-4 w-4" /> {p.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" /> {p.comments}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors ml-auto">
                      <Share2 className="h-4 w-4" /> Chia sẻ
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-5 w-5 text-brand-orange" />
                Thử thách nổi bật
              </CardTitle>
              <CardDescription>Tham gia ngay để nhận thưởng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.map((c, i) => (
                <div key={i} className="rounded-lg border p-3 bg-muted/30 space-y-1">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.participants}</p>
                  <p className="text-xs text-primary font-medium">{c.reward}</p>
                  <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                    Xem thử thách
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
