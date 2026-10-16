import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowLeft, Building2, CheckCircle2, CircleAlert, FileText, Landmark, MapPin, ShieldCheck, UploadCloud } from 'lucide-react'
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

const amenities = ['Bãi xe hơi', 'Tắm nóng lạnh', 'Căng tin', 'Mượn vợt', 'Đèn LED', 'Phòng thay đồ']
const banks = ['Techcombank', 'Vietcombank', 'MB Bank', 'ACB', 'BIDV', 'VPBank']
const formatFileSize = (size: number) => size >= 1_000_000 ? `${(size / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1_000))} KB`
const fileToDocument = (file: File, index: number): AuditDocument => ({ id: `venue-legal-${Date.now()}-${index}`, name: file.name, type: file.type.includes('pdf') ? 'pdf' : file.type.includes('png') ? 'png' : 'jpg', fileSize: formatFileSize(file.size) })

export function SCR_AUTH_06() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const profile = usePlayerStore((state) => state.profile)
  const { auditApplications, submitAuditApplication } = useFitlyoStore()
  const existing = useMemo(() => auditApplications.find((item) => item.type === 'VENUE' && item.sourcePlayerId === session?.id), [auditApplications, session?.id])
  const saved = existing?.applicationData
  const [venueName, setVenueName] = useState(String(saved?.venueName ?? ''))
  const [address, setAddress] = useState(String(saved?.address ?? ''))
  const [courtCount, setCourtCount] = useState(String(saved?.courtCount ?? '4'))
  const [courtType, setCourtType] = useState(String(saved?.courtType ?? 'Sân trong nhà máy lạnh'))
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(Array.isArray(saved?.amenities) ? saved.amenities.map(String) : ['Bãi xe hơi'])
  const [representative, setRepresentative] = useState(String(saved?.representative ?? session?.name ?? profile.name))
  const [licenseNumber, setLicenseNumber] = useState(String(saved?.licenseNumber ?? ''))
  const [bank, setBank] = useState(String(saved?.bank ?? 'Techcombank'))
  const [bankAccount, setBankAccount] = useState(String(saved?.bankAccount ?? ''))
  const [legalFiles, setLegalFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  if (!session?.isVerified) {
    return <div className="min-h-screen bg-background text-foreground"><PublicAuthHeader /><main className="mx-auto max-w-xl px-4 py-12 sm:px-6"><section className="rounded-[2rem] border border-amber-500/25 bg-amber-500/10 p-7 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-amber-700 dark:text-amber-300" /><h1 className="mt-4 text-2xl font-black">Cần xác thực tài khoản Player</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Bạn cần hoàn tất xác thực tài khoản Player trước khi gửi hồ sơ cụm sân.</p><Button className="mt-6" onClick={() => navigate('/auth/verify-otp')}>Xác thực tài khoản</Button></section></main></div>
  }

  const setFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (files.some((file) => !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))) return setError('Chỉ chấp nhận hồ sơ PDF, JPG hoặc PNG.')
    if (files.some((file) => file.size > 10_000_000)) return setError('Mỗi file hồ sơ không được vượt quá 10 MB.')
    setLegalFiles(files)
    setError('')
  }
  const toggleAmenity = (amenity: string) => setSelectedAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const courts = Number(courtCount)
    if (!venueName.trim()) return setError('Vui lòng nhập tên cụm sân.')
    if (address.trim().length < 12) return setError('Vui lòng nhập địa chỉ chi tiết của cụm sân.')
    if (!Number.isInteger(courts) || courts < 1 || courts > 30) return setError('Quy mô số sân phải từ 1 đến 30.')
    if (!representative.trim()) return setError('Vui lòng nhập tên người đại diện.')
    if (licenseNumber.trim().length < 6) return setError('Vui lòng nhập số CCCD hoặc mã GPKD hợp lệ.')
    if (!/^\d{8,19}$/.test(bankAccount.replace(/\s/g, ''))) return setError('Số tài khoản ngân hàng cần gồm 8 đến 19 chữ số.')
    if (!legalFiles.length && !existing?.documents.length) return setError('Vui lòng tải lên giấy phép kinh doanh hoặc hợp đồng thuê đất.')
    if (!session) return setError('Không xác định được phiên Player. Vui lòng đăng nhập lại.')
    const documents = legalFiles.length ? legalFiles.map(fileToDocument) : existing?.documents ?? []
    const result = submitAuditApplication({
      id: existing?.id ?? `FM-APP-${String(Date.now()).slice(-6)}`,
      type: 'VENUE',
      title: venueName.trim(),
      ownerName: representative.trim(),
      phone: profile.phone.replace(/[\s.-]/g, ''),
      address: address.trim(),
      details: `${courts} ${courtType.toLowerCase()}; tiện ích: ${selectedAmenities.length ? selectedAmenities.join(', ') : 'chưa khai báo'}; đối soát qua ${bank} •••• ${bankAccount.replace(/\s/g, '').slice(-4)}.`,
      documents,
      status: 'PENDING',
      inspectorNotes: '',
      submittedDate: new Date().toLocaleDateString('vi-VN'),
      sourcePlayerId: session.id,
      sourcePlayerEmail: session.email,
      applicationData: { venueName: venueName.trim(), address: address.trim(), courtCount: courts, courtType, amenities: selectedAmenities, representative: representative.trim(), licenseNumber: licenseNumber.trim(), bank, bankAccount: bankAccount.replace(/\s/g, '') },
    })
    if (!result.success) setError(result.message)
  }

  const status = existing?.status
  const statusMeta = status === 'APPROVED'
    ? { title: 'Hồ sơ cụm sân đã được phê duyệt', tone: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200', icon: CheckCircle2 }
    : status === 'PENDING'
      ? { title: 'Hồ sơ cụm sân đang được kiểm định', tone: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200', icon: ShieldCheck }
      : null

  if (statusMeta && existing) {
    const Icon = statusMeta.icon
    return <div className="min-h-screen bg-background text-foreground"><PublicAuthHeader action={<Button variant="ghost" size="sm" onClick={() => navigate('/player/profile')}><ArrowLeft /> Hồ sơ Player</Button>} /><main className="mx-auto max-w-2xl px-4 py-10 sm:px-6"><section className={`rounded-[2rem] border p-6 shadow-sm sm:p-8 ${statusMeta.tone}`}><Icon className="h-9 w-9" /><Badge className="mt-5 border-0 bg-card/80 text-foreground">SCR_AUTH_06 · VENUE APPLICATION</Badge><h1 className="mt-4 text-2xl font-black">{statusMeta.title}</h1><p className="mt-3 text-sm leading-6 opacity-80">{status === 'PENDING' ? 'Admin sẽ kiểm tra hồ sơ pháp lý, quy mô sân và thông tin đối soát trước khi kích hoạt đối tác.' : 'Tài khoản Field Manager riêng đã được tạo. Hãy đăng xuất Player và đăng nhập lại bằng thông tin dưới đây để quản lý cụm sân.'}</p>{status === 'APPROVED' && existing.generatedAccount && <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-card/90 p-5 text-foreground"><p className="text-xs font-black uppercase tracking-wider text-primary">Tài khoản Field Manager mới</p><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><span className="text-xs text-muted-foreground">Email</span><p className="mt-1 break-all font-black">{existing.generatedAccount.email}</p></div><div><span className="text-xs text-muted-foreground">Mật khẩu tạm thời</span><p className="mt-1 font-black">{existing.generatedAccount.password}</p></div></div><p className="mt-4 text-xs text-muted-foreground">Prototype hiển thị thông tin này để demo luồng cấp tài khoản. Khi vận hành thật, mật khẩu phải được gửi qua kênh an toàn.</p></div>}</section></main></div>
  }

  return <div className="min-h-screen bg-background text-foreground"><PublicAuthHeader action={<Button variant="ghost" size="sm" onClick={() => navigate('/player/profile')}><ArrowLeft /> Hồ sơ Player</Button>} /><main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10"><div className="mb-7"><div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-accent/35 px-3 py-1.5 text-xs font-bold text-primary"><Building2 className="h-4 w-4" /> SCR_AUTH_06 · ONBOARDING ĐỐI TÁC</div><h1 className="mt-4 text-3xl font-black tracking-tight">Đăng ký cụm sân Pickleball đối tác</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Khai báo cơ sở, hồ sơ pháp lý và tài khoản đối soát. Sau khi được duyệt, FITLYO tạo tài khoản Field Manager riêng cho bạn.</p></div>{(status === 'NEEDS_SUPPLEMENT' || status === 'REJECTED') && <div className="mb-6 flex gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm text-orange-900 dark:text-orange-200"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div><b>{status === 'NEEDS_SUPPLEMENT' ? 'Hồ sơ cần được bổ sung' : 'Hồ sơ chưa được duyệt'}</b><p className="mt-1 text-xs leading-5">{existing?.rejectionReason ?? 'Vui lòng kiểm tra lại thông tin và nộp lại hồ sơ.'}</p></div></div>}<form onSubmit={submit} className="space-y-5"><section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">1</span><div><h2 className="font-black">Thông tin cụm sân</h2><p className="mt-1 text-xs text-muted-foreground">Khai báo chính xác để Admin thẩm định và hiển thị cho Player sau khi duyệt.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="venue-name">Tên cụm sân *</Label><Input id="venue-name" value={venueName} onChange={(event) => setVenueName(event.target.value)} placeholder="VD: Cụm sân D-Pickleball Thảo Điền" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="venue-address">Địa chỉ chi tiết *</Label><div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input id="venue-address" value={address} onChange={(event) => setAddress(event.target.value)} className="pl-9" placeholder="Số nhà, đường, phường, TP. Thủ Đức" /></div></div><div className="space-y-2"><Label htmlFor="venue-courts">Quy mô số sân *</Label><Input id="venue-courts" type="number" min="1" max="30" value={courtCount} onChange={(event) => setCourtCount(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="venue-court-type">Loại sân chính *</Label><select id="venue-court-type" value={courtType} onChange={(event) => setCourtType(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40"><option>Sân trong nhà máy lạnh</option><option>Sân có mái che</option><option>Sân ngoài trời</option></select></div></div><div className="mt-5"><Label>Tiện ích có sẵn</Label><div className="mt-3 flex flex-wrap gap-2">{amenities.map((amenity) => <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${selectedAmenities.includes(amenity) ? 'border-primary bg-secondary/45 text-primary' : 'border-border bg-background text-muted-foreground'}`}>{selectedAmenities.includes(amenity) ? '✓ ' : ''}{amenity}</button>)}</div></div></section><section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">2</span><div><h2 className="font-black">Hồ sơ pháp lý & kinh doanh</h2><p className="mt-1 text-xs text-muted-foreground">Tải giấy phép kinh doanh, hợp đồng thuê đất hoặc chứng từ liên quan.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="venue-representative">Tên người đại diện *</Label><Input id="venue-representative" value={representative} onChange={(event) => setRepresentative(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="venue-license">Số CCCD / GPKD *</Label><Input id="venue-license" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} placeholder="VD: 0317892xxx" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="venue-legal-files">Giấy phép / hợp đồng thuê đất *</Label><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-background/70 px-3 text-sm transition hover:border-primary hover:bg-secondary/20"><UploadCloud className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate font-medium">{legalFiles.length ? `${legalFiles.length} file đã chọn` : existing?.documents.length ? `${existing.documents.length} file đã nộp trước đó` : 'Chọn PDF/JPG/PNG'}</span><input id="venue-legal-files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={setFiles} className="sr-only" /></label>{legalFiles.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{legalFiles.map((file) => <span key={file.name} className="inline-flex items-center gap-1 rounded-lg bg-secondary/35 px-2 py-1 text-[11px] text-primary"><FileText className="h-3.5 w-3.5" />{file.name}</span>)}</div>}</div></div></section><section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">3</span><div><h2 className="font-black">Tài khoản ngân hàng đối soát</h2><p className="mt-1 text-xs text-muted-foreground">Thông tin này chỉ phục vụ thẩm định prototype, chưa có giao dịch tiền thật.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="venue-bank">Ngân hàng *</Label><select id="venue-bank" value={bank} onChange={(event) => setBank(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40">{banks.map((item) => <option key={item}>{item}</option>)}</select></div><div className="space-y-2"><Label htmlFor="venue-bank-account">Số tài khoản *</Label><div className="relative"><Landmark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input id="venue-bank-account" inputMode="numeric" value={bankAccount} onChange={(event) => setBankAccount(event.target.value.replace(/\D/g, ''))} className="pl-9" placeholder="190345678888" /></div></div></div></section>{error && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => navigate('/player/profile')}>Để sau</Button><Button type="submit" size="lg" className="px-6"><Building2 /> Gửi hồ sơ đăng ký cụm sân</Button></div></form></main></div>
}
