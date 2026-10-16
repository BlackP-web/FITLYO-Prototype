import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowLeft, Award, CheckCircle2, CircleAlert, FileText, GraduationCap, MapPin, ShieldCheck, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PublicAuthHeader } from '@/components/auth/PublicAuthHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/useAuthStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import type { AuditDocument } from '@/types/pickleball'

const regions = ['Thảo Điền', 'An Phú', 'Hiệp Phú']
const certificateOptions = ['IPTPA Level 1 Instructor', 'IPTPA Level 2 Instructor', 'PPR Level 1 Coach', 'PPR Level 2 Coach', 'DUPR Certified Coach']

const formatFileSize = (size: number) => size >= 1_000_000 ? `${(size / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1_000))} KB`
const fileToDocument = (file: File): AuditDocument => ({
  id: `coach-cert-${Date.now()}`,
  name: file.name,
  type: file.type.includes('pdf') ? 'pdf' : file.type.includes('png') ? 'png' : 'jpg',
  fileSize: formatFileSize(file.size),
})

export function SCR_AUTH_05() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const profile = usePlayerStore((state) => state.profile)
  const { auditApplications, submitAuditApplication } = useFitlyoStore()
  const existing = useMemo(() => auditApplications.find((item) => item.type === 'COACH' && item.sourcePlayerId === session?.id), [auditApplications, session?.id])
  const saved = existing?.applicationData
  const [fullName, setFullName] = useState(String(saved?.fullName ?? session?.name ?? profile.name))
  const [phone, setPhone] = useState(String(saved?.phone ?? profile.phone))
  const [dupr, setDupr] = useState(String(saved?.dupr ?? profile.dupr))
  const [duprId, setDuprId] = useState(String(saved?.duprId ?? ''))
  const [certificateType, setCertificateType] = useState(String(saved?.certificateType ?? 'IPTPA Level 2 Instructor'))
  const [selectedRegions, setSelectedRegions] = useState<string[]>(Array.isArray(saved?.regions) ? saved.regions.map(String) : ['Thảo Điền'])
  const [rate, setRate] = useState(String(saved?.rate ?? '450000'))
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  if (!session?.isVerified) {
    return <div className="min-h-screen bg-background text-foreground"><PublicAuthHeader /><main className="mx-auto max-w-xl px-4 py-12 sm:px-6"><section className="rounded-[2rem] border border-amber-500/25 bg-amber-500/10 p-7 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-amber-700 dark:text-amber-300" /><h1 className="mt-4 text-2xl font-black">Cần xác thực tài khoản Player</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Bạn cần hoàn tất xác thực tài khoản Player trước khi gửi hồ sơ Coach.</p><Button className="mt-6" onClick={() => navigate('/auth/verify-otp')}>Xác thực tài khoản</Button></section></main></div>
  }

  const setFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) return
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Chỉ chấp nhận chứng chỉ định dạng PDF, JPG hoặc PNG.')
      return
    }
    if (file.size > 10_000_000) {
      setError('Dung lượng chứng chỉ không được vượt quá 10 MB.')
      return
    }
    setCertificateFile(file)
    setError('')
  }

  const toggleRegion = (region: string) => setSelectedRegions((current) => current.includes(region) ? current.filter((item) => item !== region) : [...current, region])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/[\s.-]/g, '')
    const duprNumber = Number(dupr)
    const rateNumber = Number(rate)
    if (fullName.trim().length < 2) return setError('Vui lòng nhập họ và tên Coach.')
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) return setError('Số điện thoại chưa đúng định dạng Việt Nam.')
    if (!Number.isFinite(duprNumber) || duprNumber < 1 || duprNumber > 8) return setError('DUPR phải nằm trong khoảng 1.00 đến 8.00.')
    if (!duprId.trim()) return setError('Vui lòng nhập mã hồ sơ DUPR thi đấu.')
    if (!selectedRegions.length) return setError('Chọn ít nhất một khu vực có thể nhận lớp.')
    if (!Number.isFinite(rateNumber) || rateNumber < 100_000) return setError('Học phí đề xuất tối thiểu là 100.000đ / 90 phút.')
    if (!certificateFile && !existing?.documents.length) return setError('Vui lòng tải lên chứng chỉ PDF/JPG/PNG trước khi nộp.')
    if (!session) return setError('Không xác định được phiên Player. Vui lòng đăng nhập lại.')

    const documents = certificateFile ? [fileToDocument(certificateFile)] : existing?.documents ?? []
    const result = submitAuditApplication({
      id: existing?.id ?? `COACH-APP-${String(Date.now()).slice(-6)}`,
      type: 'COACH',
      title: `Hồ sơ Thẩm định Coach ${fullName.trim()}`,
      ownerName: fullName.trim(),
      phone: cleanPhone,
      address: selectedRegions.join(' · ') + ', TP. Thủ Đức',
      details: `${certificateType}; DUPR ${duprNumber.toFixed(2)}; mã DUPR ${duprId.trim().toUpperCase()}; học phí đề xuất ${rateNumber.toLocaleString('vi-VN')}đ / 90 phút.`,
      documents,
      status: 'PENDING',
      inspectorNotes: '',
      submittedDate: new Date().toLocaleDateString('vi-VN'),
      sourcePlayerId: session.id,
      sourcePlayerEmail: session.email,
      applicationData: { fullName: fullName.trim(), phone: cleanPhone, dupr: duprNumber, duprId: duprId.trim().toUpperCase(), certificateType, regions: selectedRegions, rate: rateNumber },
    })
    if (!result.success) setError(result.message)
  }

  const status = existing?.status
  const statusMeta = status === 'APPROVED'
    ? { title: 'Hồ sơ Coach đã được phê duyệt', tone: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200', icon: CheckCircle2 }
    : status === 'PENDING'
      ? { title: 'Hồ sơ đang được Ban quản trị thẩm định', tone: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200', icon: ShieldCheck }
      : null

  if (statusMeta && existing) {
    const Icon = statusMeta.icon
    return <div className="min-h-screen bg-background text-foreground"><PublicAuthHeader action={<Button variant="ghost" size="sm" onClick={() => navigate('/player/profile')}><ArrowLeft /> Hồ sơ Player</Button>} /><main className="mx-auto max-w-2xl px-4 py-10 sm:px-6"><section className={`rounded-[2rem] border p-6 shadow-sm sm:p-8 ${statusMeta.tone}`}><Icon className="h-9 w-9" /><Badge className="mt-5 border-0 bg-card/80 text-foreground">SCR_AUTH_05 · COACH APPLICATION</Badge><h1 className="mt-4 text-2xl font-black">{statusMeta.title}</h1><p className="mt-3 text-sm leading-6 opacity-80">{status === 'PENDING' ? 'FITLYO sẽ kiểm tra thông tin, chứng chỉ và vùng hoạt động. Bạn có thể quay lại đây để xem trạng thái hồ sơ.' : 'Tài khoản Coach riêng đã được tạo. Hãy đăng xuất Player và đăng nhập lại bằng thông tin dưới đây để vào Coach Portal.'}</p>{status === 'APPROVED' && existing.generatedAccount && <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-card/90 p-5 text-foreground"><p className="text-xs font-black uppercase tracking-wider text-primary">Tài khoản Coach mới</p><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><span className="text-xs text-muted-foreground">Email</span><p className="mt-1 break-all font-black">{existing.generatedAccount.email}</p></div><div><span className="text-xs text-muted-foreground">Mật khẩu tạm thời</span><p className="mt-1 font-black">{existing.generatedAccount.password}</p></div></div><p className="mt-4 text-xs text-muted-foreground">Prototype hiển thị mật khẩu tạm thời tại đây. Khi có backend, mật khẩu phải được gửi qua kênh bảo mật và bắt buộc đổi ở lần đăng nhập đầu.</p></div>}</section></main></div>
  }

  return <div className="min-h-screen bg-background text-foreground"><PublicAuthHeader action={<Button variant="ghost" size="sm" onClick={() => navigate('/player/profile')}><ArrowLeft /> Hồ sơ Player</Button>} /><main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10"><div className="mb-7"><div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary/35 px-3 py-1.5 text-xs font-bold text-primary"><GraduationCap className="h-4 w-4" /> SCR_AUTH_05 · ONBOARDING ĐỐI TÁC</div><h1 className="mt-4 text-3xl font-black tracking-tight">Đăng ký hồ sơ Huấn luyện viên</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Nộp chứng chỉ, trình độ DUPR và khu vực nhận lớp. Ban quản trị sẽ thẩm định trước khi cấp tài khoản Coach riêng.</p></div>{(status === 'NEEDS_SUPPLEMENT' || status === 'REJECTED') && <div className="mb-6 flex gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm text-orange-900 dark:text-orange-200"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><b>{status === 'NEEDS_SUPPLEMENT' ? 'Hồ sơ cần được bổ sung' : 'Hồ sơ chưa được duyệt'}</b><p className="mt-1 text-xs leading-5">{existing?.rejectionReason ?? 'Vui lòng kiểm tra lại thông tin và nộp lại hồ sơ.'}</p></div></div>}<form onSubmit={submit} className="space-y-5"><section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">1</span><div><h2 className="font-black">Thông tin HLV & chuyên môn</h2><p className="mt-1 text-xs text-muted-foreground">Bạn đang nộp bằng tài khoản Player đã xác thực: <b>{session?.email}</b>.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="coach-name">Họ và tên *</Label><Input id="coach-name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="coach-phone">Số điện thoại *</Label><Input id="coach-phone" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="coach-dupr">Điểm DUPR thi đấu *</Label><Input id="coach-dupr" type="number" min="1" max="8" step="0.01" value={dupr} onChange={(event) => setDupr(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="coach-dupr-id">Mã hồ sơ DUPR *</Label><Input id="coach-dupr-id" value={duprId} onChange={(event) => setDuprId(event.target.value)} placeholder="VD: DUPR-123456" /></div></div></section><section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">2</span><div><h2 className="font-black">Bằng cấp & chứng chỉ uy tín</h2><p className="mt-1 text-xs text-muted-foreground">Tải PDF, JPG hoặc PNG, tối đa 10 MB. Prototype chỉ lưu tên và dung lượng file.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr]"><div className="space-y-2"><Label htmlFor="coach-certificate-type">Loại chứng chỉ *</Label><select id="coach-certificate-type" value={certificateType} onChange={(event) => setCertificateType(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40">{certificateOptions.map((item) => <option key={item}>{item}</option>)}</select></div><div className="space-y-2"><Label htmlFor="coach-certificate-file">Ảnh/bản scan chứng chỉ *</Label><label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-background/70 px-3 text-sm transition hover:border-primary hover:bg-secondary/20"><UploadCloud className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate font-medium">{certificateFile?.name ?? existing?.documents[0]?.name ?? 'Chọn file PDF/JPG/PNG'}</span><input id="coach-certificate-file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={setFile} className="sr-only" /></label>{certificateFile && <p className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300"><FileText className="h-3.5 w-3.5" /> {formatFileSize(certificateFile.size)} · sẵn sàng nộp</p>}</div></div></section><section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">3</span><div><h2 className="font-black">Khu vực & học phí dự kiến</h2><p className="mt-1 text-xs text-muted-foreground">Thông tin này được Admin dùng để thẩm định; chỉ công khai sau khi kích hoạt.</p></div></div><div className="mt-5 grid gap-5 sm:grid-cols-[1.2fr_0.8fr]"><div><Label>Khu vực nhận dạy *</Label><div className="mt-3 flex flex-wrap gap-2">{regions.map((region) => <button key={region} type="button" onClick={() => toggleRegion(region)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${selectedRegions.includes(region) ? 'border-primary bg-secondary/45 text-primary' : 'border-border bg-background text-muted-foreground'}`}><MapPin className="h-3.5 w-3.5" />{region}</button>)}</div></div><div className="space-y-2"><Label htmlFor="coach-rate">Học phí PT 1-1 / 90 phút *</Label><Input id="coach-rate" type="number" min="100000" step="50000" value={rate} onChange={(event) => setRate(event.target.value)} /><p className="text-[11px] text-muted-foreground">VNĐ · đề xuất ban đầu</p></div></div></section>{error && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => navigate('/player/profile')}>Để sau</Button><Button type="submit" size="lg" className="px-6"><Award /> Xác nhận nộp hồ sơ thẩm định</Button></div></form></main></div>
}
