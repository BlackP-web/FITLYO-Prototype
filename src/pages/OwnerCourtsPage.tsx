import { useState } from 'react'
import { Building2, CheckCircle2, CircleDot, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'

type CourtStatus = 'ACTIVE' | 'MAINTENANCE'

export function OwnerCourtsPage() {
  const { courtInventory, showToast } = useFitlyoStore()
  const [courtStatus, setCourtStatus] = useState<Record<string, CourtStatus>>(() =>
    Object.fromEntries(
      courtInventory.map((court) => [
        court.id,
        court.slots.every((slot) => slot.status === 'MAINTENANCE') ? 'MAINTENANCE' : 'ACTIVE',
      ]),
    ),
  )

  const activeCourts = Object.values(courtStatus).filter((status) => status === 'ACTIVE').length

  const toggleCourtStatus = (courtId: string, courtName: string) => {
    const nextStatus = courtStatus[courtId] === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE'
    setCourtStatus((current) => ({ ...current, [courtId]: nextStatus }))
    showToast(
      `${courtName} đã chuyển sang ${nextStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Bảo trì'}.`,
      nextStatus === 'ACTIVE' ? 'success' : 'info',
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="default">SCR_FM_03</Badge>
            <span className="text-xs font-semibold text-muted-foreground">Field Manager • Court Inventory</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Quản lý sân con</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi mặt sân, số slot khai thác và chuyển trạng thái vận hành.
          </p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground">Sân đang hoạt động</p>
          <p className="mt-1 font-extrabold text-primary">{activeCourts} / {courtInventory.length} sân</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courtInventory.map((court, index) => {
          const status = courtStatus[court.id]
          const availableSlots = court.slots.filter((slot) => slot.status === 'AVAILABLE').length
          const bookedSlots = court.slots.filter((slot) => slot.status !== 'AVAILABLE' && slot.status !== 'MAINTENANCE').length
          const isActive = status === 'ACTIVE'

          return (
            <article key={court.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">{court.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {court.courtType === 'indoor' ? 'Trong nhà' : court.courtType === 'outdoor' ? 'Ngoài trời' : 'Mái che'}
                    </p>
                  </div>
                </div>
                <Badge variant={isActive ? 'success' : 'warning'}>{isActive ? 'Đang hoạt động' : 'Bảo trì'}</Badge>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x rounded-xl border bg-muted/30 text-center">
                <div className="px-2 py-3"><p className="text-[10px] text-muted-foreground">Tổng slot</p><p className="mt-1 font-bold">{court.slots.length}</p></div>
                <div className="px-2 py-3"><p className="text-[10px] text-muted-foreground">Đã khai thác</p><p className="mt-1 font-bold text-primary">{bookedSlots}</p></div>
                <div className="px-2 py-3"><p className="text-[10px] text-muted-foreground">Còn trống</p><p className="mt-1 font-bold text-emerald-600">{availableSlots}</p></div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs">
                <span className="text-muted-foreground">Mã sân</span>
                <span className="font-semibold">COURT-{String(index + 1).padStart(2, '0')}</span>
              </div>

              <Button
                variant={isActive ? 'outline' : 'default'}
                className="mt-4 w-full"
                onClick={() => toggleCourtStatus(court.id, court.name)}
              >
                {isActive ? <Wrench /> : <CheckCircle2 />}
                {isActive ? 'Chuyển sang bảo trì' : 'Mở lại sân'}
              </Button>
            </article>
          )
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm">
        <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          Trạng thái tại đây là trạng thái vận hành cấp sân. Lịch slot chi tiết vẫn được quản lý tại màn hình Lịch sân.
        </p>
      </div>
    </div>
  )
}
