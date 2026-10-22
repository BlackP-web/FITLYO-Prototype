import { useState } from 'react'
import { Clock3, MapPin, Phone, Save, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { COURT_CLOSE_TIME, COURT_OPEN_TIME } from '@/lib/courtSchedule'

const amenityOptions = ['Đèn LED thi đấu', 'Phòng tắm nước nóng', 'Căng tin', 'Bãi đậu xe', 'Mượn vợt', 'Nước uống miễn phí']

export function OwnerSettingsPage() {
  const { venues, showToast } = useFitlyoStore()
  const venue = venues[0]
  const [form, setForm] = useState({
    name: venue.name,
    address: venue.address,
    phone: '0908.112.233',
    openTime: COURT_OPEN_TIME,
    closeTime: COURT_CLOSE_TIME,
    cancellationHours: '12',
  })
  const [amenities, setAmenities] = useState<string[]>(venue.amenities)

  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const toggleAmenity = (amenity: string) => setAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity])

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-border/60 pb-5">
        <div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_04</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager • Venue Settings</span></div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Thông tin & tiện ích sân</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cập nhật thông tin kinh doanh được hiển thị cho người chơi.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <form className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); showToast('Đã lưu thông tin cụm sân.', 'success') }}>
          <section>
            <h2 className="font-bold">Thông tin cơ sở kinh doanh</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-semibold">Tên cụm sân<input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:border-primary" /></label>
              <label className="sm:col-span-2 text-sm font-semibold">Địa chỉ<MapPin className="ml-1 inline h-3.5 w-3.5 text-primary" /><input value={form.address} onChange={(event) => updateField('address', event.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:border-primary" /></label>
              <label className="text-sm font-semibold">Số hotline<Phone className="ml-1 inline h-3.5 w-3.5 text-primary" /><input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:border-primary" /></label>
              <label className="text-sm font-semibold">Thời gian hủy miễn phí<input type="number" min="0" value={form.cancellationHours} onChange={(event) => updateField('cancellationHours', event.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 font-normal outline-none focus:border-primary" /><span className="mt-1 block text-xs font-normal text-muted-foreground">Giờ trước khi diễn ra</span></label>
            </div>
          </section>

          <section className="border-t pt-6">
            <h2 className="flex items-center gap-2 font-bold"><Clock3 className="h-4 w-4 text-primary" />Giờ hoạt động & thanh toán</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold">Mở cửa<input type="time" value={form.openTime} readOnly className="mt-1.5 w-full rounded-lg border bg-muted px-3 py-2 font-normal" /><span className="mt-1 block text-xs font-normal text-muted-foreground">Khung giờ chuẩn toàn hệ thống</span></label>
              <label className="text-sm font-semibold">Đóng cửa<input type="time" value={form.closeTime} readOnly className="mt-1.5 w-full rounded-lg border bg-muted px-3 py-2 font-normal" /><span className="mt-1 block text-xs font-normal text-muted-foreground">10 slot liên tục, không nghỉ giữa ca</span></label>
              <div className="text-sm font-semibold">Chính sách thanh toán<div className="mt-1.5 rounded-lg border bg-muted px-3 py-2 font-black text-primary">Thanh toán trước 100%</div><span className="mt-1 block text-xs font-normal text-muted-foreground">Áp dụng thống nhất toàn hệ thống</span></div>
            </div>
          </section>

          <div className="flex justify-end border-t pt-5"><Button type="submit"><Save />Lưu thông tin</Button></div>
        </form>

        <aside className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-bold">Tiện ích sân</h2></div>
          <p className="mt-1 text-xs text-muted-foreground">Các tiện ích được hiển thị trên trang cụm sân.</p>
          <div className="mt-5 space-y-2">
            {amenityOptions.map((amenity) => {
              const checked = amenities.includes(amenity)
              return <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${checked ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted'}`}><span className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{checked ? '✓' : ''}</span>{amenity}</button>
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
