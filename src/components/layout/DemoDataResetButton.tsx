import { useState } from 'react'
import { DatabaseBackup, RotateCcw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { resetDemoData } from '@/lib/resetDemoData'

export function DemoDataResetButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-2.5 text-xs font-bold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:bg-secondary/35 hover:text-primary"
        aria-label="Đặt lại dữ liệu thử nghiệm"
        title="Đặt lại dữ liệu thử nghiệm"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden 2xl:inline">Làm mới data</span>
      </button>

      <DialogContent className="max-w-md rounded-[1.75rem] border-border/80 p-0">
        <div className="p-6 sm:p-7">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/55 text-primary">
            <DatabaseBackup className="h-7 w-7" />
          </span>
          <DialogHeader className="mt-5 text-left">
            <DialogTitle className="text-xl font-black">Đặt lại dữ liệu thử nghiệm?</DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6">
              Booking, lịch, giao dịch, số dư ví, hội thoại và các trạng thái đã thao tác sẽ trở về dữ liệu mẫu ban đầu.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm leading-6">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p><strong>Tài khoản đang đăng nhập được giữ nguyên.</strong> Chế độ sáng/tối và lựa chọn chữ lớn cũng không thay đổi.</p>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:space-x-0">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-12 flex-1">
              Giữ dữ liệu hiện tại
            </Button>
            <Button type="button" variant="destructive" onClick={resetDemoData} className="h-12 flex-1 gap-2">
              <RotateCcw className="h-4 w-4" /> Đặt lại ngay
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
