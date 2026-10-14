import { BarChart3, Download, TrendingUp, WalletCards } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export function OwnerReportsPage() {
  const { courtInventory, selectedDate, showToast } = useFitlyoStore()
  const allSlots = courtInventory.flatMap((court) => court.slots)
  const activeSlots = allSlots.filter((slot) => slot.status !== 'MAINTENANCE')
  const bookedSlots = activeSlots.filter((slot) => slot.status !== 'AVAILABLE')
  const revenue = bookedSlots.reduce((total, slot) => total + slot.price, 0)
  const occupancy = Math.round((bookedSlots.length / (activeSlots.length || 1)) * 100)
  const socialRevenue = allSlots.filter((slot) => slot.status === 'MATCH_PUBLISHED').reduce((total, slot) => total + slot.price, 0)
  const privateRevenue = allSlots.filter((slot) => slot.status === 'PRIVATE_BOOKED').reduce((total, slot) => total + slot.price, 0)
  const coachingRevenue = allSlots.filter((slot) => slot.status === 'COACHING').reduce((total, slot) => total + slot.price, 0)
  const maxCourtRevenue = Math.max(...courtInventory.map((court) => court.slots.filter((slot) => slot.status !== 'AVAILABLE' && slot.status !== 'MAINTENANCE').reduce((total, slot) => total + slot.price, 0)), 1)

  const exportReconciliation = () => {
    const rows = [['Sân', 'Slot', 'Khung giờ', 'Trạng thái', 'Doanh thu (VND)']]
    courtInventory.forEach((court) => court.slots.forEach((slot) => rows.push([court.name, String(slot.slotNumber), slot.timeRange, slot.status, String(slot.price)])))
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
    link.download = `doi-soat-san-${selectedDate.replaceAll('/', '-')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    showToast('Đã xuất file đối soát CSV.', 'success')
  }

  const revenueBySource = [
    { label: 'Kèo Social', value: socialRevenue, color: 'bg-blue-500' },
    { label: 'Khách bao sân', value: privateRevenue, color: 'bg-orange-500' },
    { label: 'Lớp Coach', value: coachingRevenue, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start">
        <div><div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_06</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager • Revenue & Occupancy</span></div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Doanh thu & tỷ lệ lấp đầy</h1><p className="mt-1 text-sm text-muted-foreground">Báo cáo điều hành cho ngày {selectedDate}.</p></div>
        <Button onClick={exportReconciliation}><Download />Xuất file đối soát</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Doanh thu ước tính" value={formatVND(revenue)} icon={<WalletCards className="h-5 w-5" />} tone="text-emerald-600" />
        <Metric label="Công suất lấp đầy" value={`${occupancy}%`} icon={<TrendingUp className="h-5 w-5" />} tone="text-primary" />
        <Metric label="Slot đã khai thác" value={`${bookedSlots.length} / ${activeSlots.length}`} icon={<BarChart3 className="h-5 w-5" />} tone="text-blue-600" />
        <Metric label="Slot bảo trì" value={`${allSlots.length - activeSlots.length} slot`} icon={<BarChart3 className="h-5 w-5" />} tone="text-amber-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-bold">Doanh thu theo sân</h2><p className="mt-1 text-xs text-muted-foreground">Tổng giá trị slot đã khai thác trong ngày.</p><div className="mt-6 space-y-5">{courtInventory.map((court) => { const courtRevenue = court.slots.filter((slot) => slot.status !== 'AVAILABLE' && slot.status !== 'MAINTENANCE').reduce((total, slot) => total + slot.price, 0); return <div key={court.id}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-semibold">{court.name}</span><span className="font-bold">{formatVND(courtRevenue)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((courtRevenue / maxCourtRevenue) * 100)}%` }} /></div></div> })}</div></section>
        <section className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-bold">Nguồn doanh thu</h2><p className="mt-1 text-xs text-muted-foreground">Phân theo loại hình khai thác sân.</p><div className="mt-6 space-y-5">{revenueBySource.map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-sm"><span>{item.label}</span><span className="font-bold">{formatVND(item.value)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${revenue ? Math.round((item.value / revenue) * 100) : 0}%` }} /></div></div>)}</div></section>
      </div>
    </div>
  )
}

function Metric({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-muted ${tone}`}>{icon}</div><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-extrabold ${tone}`}>{value}</p></div>
}
