import { Award, Star, Calendar, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function TrainersPage() {
  const trainers = [
    {
      name: "HLV Đặng Hùng",
      specialty: "Tăng cơ Hypertrophy & Cải thiện sức mạnh",
      rating: 4.9,
      reviews: 120,
      experience: "7 năm kinh nghiệm",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150",
    },
    {
      name: "HLV Thảo Ly",
      specialty: "Giảm mỡ toàn thân & Yoga Phục hồi",
      rating: 5.0,
      reviews: 95,
      experience: "5 năm kinh nghiệm",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
    {
      name: "HLV Hoàng Bách",
      specialty: "Calisthenics & Cardio sức bền",
      rating: 4.8,
      reviews: 84,
      experience: "6 năm kinh nghiệm",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đội Ngũ Huấn Luyện Viên Cá Nhân</h1>
        <p className="text-muted-foreground mt-1">
          Được cấp chứng chỉ quốc tế NASM, ISSA – đồng hành 1:1 cùng bạn.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map((t) => (
          <Card key={t.name} className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center gap-4">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <CardTitle className="text-lg">{t.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-brand-orange mt-1">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="font-bold">{t.rating}</span>
                  <span className="text-muted-foreground">({t.reviews} đánh giá)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t.specialty}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Award className="h-4 w-4 text-primary" />
                <span>{t.experience}</span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                Nhắn tin
              </Button>
              <Button size="sm" className="flex-1 gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                Đặt lịch tập
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
