import { Settings, Bell, Shield, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài Đặt Hệ Thống & Tùy Chọn</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý quyền riêng tư, thông báo ứng dụng và thiết bị kết nối.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-primary" />
              Thông báo & Nhắc nhở
            </CardTitle>
            <CardDescription>Cài đặt thời gian nhắc nhở uống nước và giờ tập</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-sm">Nhắc nhở trước giờ tập 30 phút</p>
                <p className="text-xs text-muted-foreground">Gửi thông báo đẩy về điện thoại</p>
              </div>
              <Button variant="outline" size="sm">Đang bật</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Báo cáo tổng kết tuần qua email</p>
                <p className="text-xs text-muted-foreground">Nhận thống kê vào tối Chủ nhật</p>
              </div>
              <Button variant="outline" size="sm">Đang bật</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-5 w-5 text-primary" />
              Kết nối thiết bị đeo (Wearables)
            </CardTitle>
            <CardDescription>Apple Watch, Garmin, Fitbit, Galaxy Watch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-sm">Apple Health / Apple Watch</p>
                <p className="text-xs text-brand-forest dark:text-brand-cream font-medium">Đã kết nối • Đồng bộ nhịp tim & calories</p>
              </div>
              <Button variant="outline" size="sm">Ngắt kết nối</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Garmin Connect</p>
                <p className="text-xs text-muted-foreground">Chưa kết nối thiết bị</p>
              </div>
              <Button size="sm">Kết nối ngay</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" />
              Bảo mật & Tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Xác thực 2 yếu tố (2FA)</p>
                <p className="text-xs text-muted-foreground">Tăng cường an toàn cho tài khoản hội viên</p>
              </div>
              <Button variant="outline" size="sm">Kích hoạt</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
