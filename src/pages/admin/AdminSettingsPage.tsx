import { useState } from 'react'
import { Clock3, History, Percent, RefreshCcw, Save, Settings2, ShieldCheck, TimerReset } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { defaultPlatformConfig, useAdminStore, type PlatformConfig } from '@/store/useAdminStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const cloneConfig = (config: PlatformConfig): PlatformConfig => ({ ...config, slots: config.slots.map((slot) => ({ ...slot })) })

export function AdminSettingsPage() {
  const { config, saveConfig } = useAdminStore()
  const showToast = useFitlyoStore((state) => state.showToast)
  const [draft, setDraft] = useState<PlatformConfig>(() => cloneConfig(config))

  const updateNumber = (key: keyof Omit<PlatformConfig, 'slots'>, value: number) => setDraft((current) => ({ ...current, [key]: value }))
  const updateSlot = (index: number, changes: Partial<PlatformConfig['slots'][number]>) => setDraft((current) => ({ ...current, slots: current.slots.map((slot, slotIndex) => slotIndex === index ? { ...slot, ...changes } : slot) }))

  const handleRestore = () => {
    setDraft(cloneConfig(defaultPlatformConfig))
    showToast('Đã khôi phục bộ tham số mặc định. Bấm Lưu để xác nhận.', 'info')
  }

  const handleSave = () => {
    saveConfig(draft)
    showToast('Đã lưu cấu hình toàn sàn và ghi nhận nhật ký kiểm toán.', 'success')
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="SCR_ADMIN_04 · Global Configuration" title="Cấu hình tham số toàn sàn" description="Quản lý chuẩn 10 slot liên tục, phí hoa hồng, bảo vệ Escrow và ngưỡng cảnh báo DUPR áp dụng cho toàn bộ hệ sinh thái." icon={Settings2} actions={<><Button variant="outline" onClick={handleRestore}><RefreshCcw /> Khôi phục mặc định</Button><Button onClick={handleSave}><Save /> Lưu cấu hình</Button></>} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="space-y-6">
          <section className="brand-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">01 · Slot Policy</p><h2 className="mt-1 text-lg font-black">Quy chuẩn 10 khung giờ 90 phút</h2><p className="mt-1 text-xs text-muted-foreground">Liên tục từ 06:00–21:00, không nghỉ giữa ca.</p></div><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock3 className="h-5 w-5" /></span></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">{draft.slots.map((slot, index) => <div key={slot.number} className={`rounded-2xl border p-4 ${slot.isPeak ? 'border-orange-500/35 bg-orange-500/10' : 'border-border bg-background/40'}`}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><strong className="text-sm">Slot {slot.number}</strong>{slot.isPeak && <Badge className="border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300">Giờ vàng</Badge>}</div><label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-semibold text-muted-foreground"><input type="radio" name="peak-slot" checked={slot.isPeak} onChange={() => setDraft((current) => ({ ...current, slots: current.slots.map((item) => ({ ...item, isPeak: item.number === slot.number })) }))} /> Đặt giờ vàng</label></div><div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2"><Input aria-label={`Giờ bắt đầu Slot ${slot.number}`} type="time" value={slot.start} onChange={(event) => updateSlot(index, { start: event.target.value })} /><span className="text-xs text-muted-foreground">đến</span><Input aria-label={`Giờ kết thúc Slot ${slot.number}`} type="time" value={slot.end} onChange={(event) => updateSlot(index, { end: event.target.value })} /></div></div>)}</div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/60 p-4"><TimerReset className="h-5 w-5 text-primary" /><div className="flex-1"><Label htmlFor="cleanup-minutes">Thời gian dọn dẹp giữa các ca</Label><p className="mt-1 text-[10px] text-muted-foreground">Khoảng nghỉ tối thiểu để vệ sinh và bàn giao sân.</p></div><div className="relative w-28"><Input id="cleanup-minutes" type="number" min={0} max={60} value={draft.cleanupMinutes} onChange={(event) => updateNumber('cleanupMinutes', Number(event.target.value))} className="pr-10" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">phút</span></div></div>
          </section>

          <section className="brand-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">02 · Commission</p><h2 className="mt-1 text-lg font-black">Chính sách phí hoa hồng</h2></div><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300"><Percent className="h-5 w-5" /></span></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">{[
              ['socialCommission', 'Kèo Social', 'Trên tổng tiền sân'], ['coachCommission', 'Khóa học Coach', 'Trên tổng học phí'], ['vipCommission', 'Gói hội viên VIP', 'Thu trọn gói 99k/tháng'],
            ].map(([key, label, note]) => <div key={key} className="rounded-2xl bg-muted/55 p-4"><Label htmlFor={key}>{label}</Label><div className="relative mt-3"><Input id={key} type="number" min={0} max={100} step={0.5} value={draft[key as keyof PlatformConfig] as number} onChange={(event) => updateNumber(key as keyof Omit<PlatformConfig, 'slots'>, Number(event.target.value))} className="h-11 pr-9 text-lg font-black" /><span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-muted-foreground">%</span></div><p className="mt-2 text-[10px] text-muted-foreground">{note}</p></div>)}</div>
          </section>

          <section className="brand-card rounded-3xl p-5 sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-wider text-primary">03 · Trust & Safety</p><h2 className="mt-1 text-lg font-black">Bảo vệ ký quỹ và cảnh báo DUPR</h2></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label htmlFor="cancel-hours">Mốc hủy hoàn 100%</Label><div className="relative"><Input id="cancel-hours" type="number" min={1} max={48} step={0.5} value={draft.freeCancellationHours} onChange={(event) => updateNumber('freeCancellationHours', Number(event.target.value))} className="pr-10" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">giờ</span></div></div><div className="space-y-2"><Label htmlFor="penalty-share">Phạt cọc chia người chơi</Label><div className="relative"><Input id="penalty-share" type="number" min={0} max={100} value={draft.noShowPenaltyShare} onChange={(event) => updateNumber('noShowPenaltyShare', Number(event.target.value))} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span></div></div><div className="space-y-2"><Label htmlFor="dupr-threshold">Ngưỡng lệch DUPR cảnh báo</Label><Input id="dupr-threshold" type="number" min={0.1} max={3} step={0.05} value={draft.duprWarningThreshold} onChange={(event) => updateNumber('duprWarningThreshold', Number(event.target.value))} /></div></div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="brand-gradient rounded-3xl p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-white/60">Phạm vi ảnh hưởng</p><h2 className="mt-2 text-xl font-black">Cấu hình toàn hệ thống</h2><p className="mt-3 text-xs leading-relaxed text-white/70">Thay đổi được áp dụng cho mọi cụm sân, Coach và giao dịch mới ngay sau khi lưu.</p><div className="mt-5 space-y-2 border-t border-white/15 pt-4 text-xs"><div className="flex justify-between"><span className="text-white/60">Cụm sân</span><strong>28</strong></div><div className="flex justify-between"><span className="text-white/60">Sân thi đấu</span><strong>146</strong></div><div className="flex justify-between"><span className="text-white/60">Coach active</span><strong>67</strong></div></div></section>

          <section className="brand-card rounded-3xl p-5"><h2 className="flex items-center gap-2 font-black"><History className="h-4 w-4 text-primary" /> Nhật ký kiểm toán</h2><div className="mt-4 space-y-4">{[
            ['14/10 · 09:42', 'Super Admin', 'Cập nhật phí Coach từ 8% → 10%'], ['10/10 · 16:20', 'Operator #OP12', 'Đề xuất đổi Slot 5 thành giờ vàng'], ['01/10 · 08:00', 'System', 'Áp dụng bộ chính sách tháng 10'],
          ].map(([time, actor, detail]) => <div key={time} className="border-l-2 border-primary/20 pl-3"><p className="text-[10px] font-bold text-primary">{time}</p><p className="mt-1 text-xs font-semibold">{detail}</p><p className="mt-1 text-[10px] text-muted-foreground">Bởi {actor}</p></div>)}</div></section>

          <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5"><p className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300"><ShieldCheck className="h-4 w-4" /> Xác nhận Super Admin</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Mọi lần lưu cấu hình đều được gắn mã phiên, thời gian và tài khoản thực hiện để phục vụ kiểm toán.</p></section>
        </aside>
      </div>
    </div>
  )
}
