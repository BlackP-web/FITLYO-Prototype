import { useState } from 'react'
import { Award, BadgeCheck, BriefcaseBusiness, Camera, Eye, Save, ShieldCheck, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFitlyoStore } from '@/store/useFitlyoStore'

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'

export function CoachProfilePage() {
  const { coachAccount, updateCoachProfile, showToast } = useFitlyoStore()
  const [form, setForm] = useState({
    name: coachAccount.name,
    phone: coachAccount.phone,
    email: coachAccount.email,
    bio: coachAccount.bio,
    specialties: coachAccount.specialties.join(', '),
    serviceAreas: coachAccount.serviceAreas.join(', '),
    ratePerSession: coachAccount.ratePerSession,
    ratePerCourse: coachAccount.ratePerCourse,
  })

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    updateCoachProfile({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      specialties: form.specialties.split(',').map((item) => item.trim()).filter(Boolean),
      serviceAreas: form.serviceAreas.split(',').map((item) => item.trim()).filter(Boolean),
      ratePerSession: form.ratePerSession,
      ratePerCourse: form.ratePerCourse,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Hồ sơ nghề nghiệp</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Hồ sơ của tôi</h1><p className="mt-2 text-sm text-muted-foreground">Thông tin này được dùng cho trang hồ sơ công khai mà học viên nhìn thấy.</p></div>
        <Button variant="outline" onClick={() => showToast('Đã mở bản xem trước hồ sơ công khai.', 'info')}><Eye /> Xem trang công khai</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <form onSubmit={handleSave} className="brand-card space-y-6 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <div className="relative w-fit"><img src={coachAccount.avatarUrl} alt={coachAccount.name} className="h-24 w-24 rounded-2xl object-cover" /><button type="button" onClick={() => showToast('Chức năng tải ảnh đang được mô phỏng.', 'info')} className="absolute -bottom-2 -right-2 rounded-xl bg-primary p-2 text-primary-foreground shadow"><Camera className="h-4 w-4" /></button></div>
            <div><div className="flex flex-wrap gap-2"><Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><BadgeCheck /> Coach đã duyệt</Badge><Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"><Award /> {coachAccount.certificateTitle}</Badge></div><p className="mt-3 text-xs text-muted-foreground">Mã Coach: <strong className="text-foreground">{coachAccount.id}</strong> · Trạng thái xác thực không thể tự chỉnh sửa.</p></div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-foreground">Thông tin cơ bản</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="profile-name">Tên hiển thị</Label><Input id="profile-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="profile-phone">Số điện thoại</Label><Input id="profile-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-email">Email</Label><Input id="profile-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-bio">Giới thiệu chuyên môn</Label><textarea id="profile-bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={5} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none transition focus:ring-2 focus:ring-ring/40" /></div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-foreground">Dịch vụ & học phí</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-specialties">Chuyên môn (phân cách bằng dấu phẩy)</Label><Input id="profile-specialties" value={form.specialties} onChange={(event) => setForm({ ...form, specialties: event.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-areas">Khu vực phục vụ</Label><Input id="profile-areas" value={form.serviceAreas} onChange={(event) => setForm({ ...form, serviceAreas: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="profile-session-rate">Phí PT 1-1 / buổi</Label><Input id="profile-session-rate" type="number" step={50000} value={form.ratePerSession} onChange={(event) => setForm({ ...form, ratePerSession: Number(event.target.value) })} /></div>
              <div className="space-y-2"><Label htmlFor="profile-course-rate">Học phí khóa tiêu chuẩn</Label><Input id="profile-course-rate" type="number" step={50000} value={form.ratePerCourse} onChange={(event) => setForm({ ...form, ratePerCourse: Number(event.target.value) })} /></div>
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-5"><Button type="submit"><Save /> Lưu hồ sơ</Button></div>
        </form>

        <aside className="space-y-5">
          <section className="brand-gradient rounded-3xl p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Xem trước thẻ Coach</p>
            <div className="mt-5 flex items-center gap-4"><img src={coachAccount.avatarUrl} alt={coachAccount.name} className="h-16 w-16 rounded-2xl border border-white/20 object-cover" /><div><h2 className="text-lg font-black">{form.name}</h2><p className="mt-1 flex items-center gap-1 text-xs text-amber-300"><Star className="h-3.5 w-3.5 fill-current" /> {coachAccount.rating} · {coachAccount.reviewCount} đánh giá</p></div></div>
            <p className="mt-4 text-sm leading-relaxed text-white/75">{form.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">{form.specialties.split(',').slice(0, 3).map((item) => item.trim()).filter(Boolean).map((item) => <span key={item} className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold">{item}</span>)}</div>
            <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs text-white/60">PT 1-1 từ</p><p className="text-xl font-black text-white">{formatCurrency(form.ratePerSession)} <span className="text-xs font-normal text-white/60">/ buổi</span></p></div>
          </section>

          <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300"><ShieldCheck className="h-5 w-5" /><h2 className="font-black">Chứng chỉ đã xác thực</h2></div>
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-card p-4"><div className="flex items-start gap-3"><div className="rounded-xl bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300"><Award className="h-5 w-5" /></div><div><p className="text-sm font-black">{coachAccount.certificateTitle}</p><p className="mt-1 text-[11px] text-muted-foreground">Mã: {coachAccount.certificateCode}</p><p className="text-[11px] text-muted-foreground">Hiệu lực đến {coachAccount.certificateExpiry}</p></div></div></div>
          </section>

          <section className="brand-card rounded-3xl p-5">
            <h2 className="flex items-center gap-2 font-black"><BriefcaseBusiness className="h-4 w-4 text-primary" /> Tổng quan nghề nghiệp</h2>
            <div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Kinh nghiệm</span><strong>{coachAccount.experienceYears} năm</strong></div><div className="flex justify-between"><span className="text-muted-foreground">DUPR cá nhân</span><strong>{coachAccount.duprRating}</strong></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Khu vực</span><strong className="text-right">{form.serviceAreas}</strong></div></div>
          </section>
        </aside>
      </div>
    </div>
  )
}
