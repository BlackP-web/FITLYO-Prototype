import { Apple, Plus, Utensils, Flame, Coffee, Moon } from "lucide-react"
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

export function NutritionPage() {
  const meals = [
    {
      id: "1",
      meal: "Bữa sáng (Breakfast)",
      icon: Coffee,
      items: "Yến mạch, sữa chua Hy Lạp, chuối, 1 muỗng whey",
      calories: 450,
      protein: "35g",
      carbs: "55g",
      fat: "10g",
    },
    {
      id: "2",
      meal: "Bữa trưa (Lunch)",
      icon: Utensils,
      items: "Ức gà áp chảo, cơm gạo lứt, bông cải xanh luộc",
      calories: 620,
      protein: "50g",
      carbs: "65g",
      fat: "12g",
    },
    {
      id: "3",
      meal: "Bữa phụ (Snack)",
      icon: Apple,
      items: "Táo tây, hạnh nhân nướng, sinh tố bơ hạt",
      calories: 280,
      protein: "8g",
      carbs: "30g",
      fat: "14g",
    },
    {
      id: "4",
      meal: "Bữa tối (Dinner)",
      icon: Moon,
      items: "Cá hồi nướng măng tây, khoai lang hấp",
      calories: 550,
      protein: "42g",
      carbs: "45g",
      fat: "18g",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kế Hoạch Dinh Dưỡng & Macros</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi năng lượng nạp vào và phân bổ tỷ lệ Đạm - Đường - Béo khoa học.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ghi nhận bữa ăn mới
        </Button>
      </div>

      {/* Macro targets */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Calories Mục tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-orange">1,900 / 2,200 kcal</div>
            <p className="text-xs text-muted-foreground mt-1">Còn lại 300 kcal cho tối nay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Chất Đạm (Protein)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-forest dark:text-brand-cream">135g / 150g</div>
            <p className="text-xs text-muted-foreground mt-1">Đạt 90% mục tiêu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tinh bột (Carbs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-amber">195g / 220g</div>
            <p className="text-xs text-muted-foreground mt-1">Đạt 88% mục tiêu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Chất béo (Fat)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">54g / 60g</div>
            <p className="text-xs text-muted-foreground mt-1">Đạt 90% mục tiêu</p>
          </CardContent>
        </Card>
      </div>

      {/* Meals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký bữa ăn trong ngày</CardTitle>
          <CardDescription>
            Tự động tính toán giá trị dinh dưỡng dựa trên thực đơn đã chọn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời điểm</TableHead>
                <TableHead>Món ăn tiêu biểu</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Protein</TableHead>
                <TableHead>Carbs</TableHead>
                <TableHead className="text-right">Chất béo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map((item) => {
                const Icon = item.icon
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span>{item.meal}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.items}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-brand-orange">
                        {item.calories} kcal
                      </span>
                    </TableCell>
                    <TableCell>{item.protein}</TableCell>
                    <TableCell>{item.carbs}</TableCell>
                    <TableCell className="text-right">{item.fat}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
