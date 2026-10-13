import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User, CheckCircle2, Save } from "lucide-react"
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

const profileSchema = z.object({
  name: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  fitnessGoal: z.string().min(3, "Mục tiêu thể hình không được để trống"),
  currentWeight: z.number().min(30, "Cân nặng tối thiểu 30kg").max(250, "Cân nặng tối đa 250kg"),
  targetWeight: z.number().min(30, "Mục tiêu tối thiểu 30kg").max(250, "Mục tiêu tối đa 250kg"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, setUser } = useAppStore()
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      fitnessGoal: user?.fitnessGoal || "",
      currentWeight: user?.currentWeight || 70,
      targetWeight: user?.targetWeight || 65,
    },
  })

  // Sync form when user is loaded from Zustand / MSW
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        fitnessGoal: user.fitnessGoal,
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
      })
    }
  }, [user, form])

  async function onSubmit(data: ProfileFormValues) {
    setSuccess(null)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setSuccess("Đã cập nhật hồ sơ cá nhân thành công!")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ Sơ Cá Nhân & Mục Tiêu</h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật thông tin thể trạng để thuật toán AI cá nhân hóa lịch tập chính xác nhất.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-forest/15 p-4 text-sm font-medium text-brand-forest dark:text-brand-cream border border-brand-forest/30">
          <CheckCircle2 className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border">
              <User className="h-8 w-8" />
            </div>
            <div>
              <CardTitle>{user?.name || "Người dùng Fitlyo"}</CardTitle>
              <CardDescription>Vai trò: Thành viên chính thức (Pro Member)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fitnessGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mục tiêu thể hình ưu tiên *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Tăng cơ giảm mỡ, Tăng sức bền..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Giúp AI huấn luyện viên sắp xếp bài tập phù hợp
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cân nặng hiện tại (kg) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
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
                  name="targetWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cân nặng mục tiêu (kg) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Lưu thay đổi hồ sơ
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
