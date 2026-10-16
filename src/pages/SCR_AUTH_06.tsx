import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { CheckCircle2, CircleAlert, FileText, Landmark, MapPin, Send, ShieldCheck, UploadCloud } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/useAuthStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { AuditDocument } from '@/types/pickleball'

const amenities = ['Bãi xe hơi', 'Tắm nóng lạnh', 'Căng tin', 'Mượn vợt', 'Đèn LED', 'Phòng thay đồ']
const banks = ['Techcombank', 'Vietcombank', 'MB Bank', 'ACB', 'BIDV', 'VPBank']
const formatFileSize = (size: number) => size >= 1_000_000 ? `${(size / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1_000))} KB`
const fileToDocument = (file: File, index: number): AuditDocument => ({
  id: `venue-legal-${Date.now()}-${index}`,
  name: file.name,
  type: file.type.includes('pdf') ? 'pdf' : file.type.includes('png') ? 'png' : 'jpg',
  fileSize: formatFileSize(file.size),
})

export function SCR_AUTH_06() {
  const session = useAuthStore((state) => state.session)
  const { auditApplications, submitAuditApplication } = useFitlyoStore()
  const existing = useMemo(
    () => auditApplications.find((item) => item.type === 'VENUE' && item.sourceAccountId === session?.id),
    [auditApplications, session?.id],
  )
  const saved = existing?.applicationData
  const [venueName, setVenueName] = useState(String(saved?.venueName ?? ''))
  const [address, setAddress] = useState(String(saved?.address ?? ''))
  const [courtCount, setCourtCount] = useState(String(saved?.courtCount ?? '4'))
  const [courtType, setCourtType] = useState(String(saved?.courtType ?? 'Sân trong nhà máy lạnh'))
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    Array.isArray(saved?.amenities) ? saved.amenities.map(String) : ['Bãi xe hơi'],
  )
  const [representative, setRepresentative] = useState(String(saved?.representative ?? session?.name ?? ''))
  const [licenseNumber, setLicenseNumber] = useState(String(saved?.licenseNumber ?? ''))
  const [bank, setBank] = useState(String(saved?.bank ?? 'Techcombank'))
  const [bankAccount, setBankAccount] = useState(String(saved?.bankAccount ?? ''))
  const [legalFiles, setLegalFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  const setFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (files.some((file) => !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))) {
      setError('Chỉ chấp nhận hồ sơ PDF, JPG hoặc PNG.')
      return
    }
    if (files.some((file) => file.size > 10_000_000)) {
      setError('Mỗi file hồ sơ không được vượt quá 10 MB.')
      return
    }
    setLegalFiles(files)
    setError('')
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity])
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!session) return setError('Không xác định được phiên Field Manager. Vui lòng đăng nhập lại.')

    const courts = Number(courtCount)
    if (!venueName.trim()) return setError('Vui lòng nhập tên cụm sân.')
    if (address.trim().length < 12) return setError('Vui lòng nhập địa chỉ chi tiết của cụm sân.')
    if (!Number.isInteger(courts) || courts < 1 || courts > 30) return setError('Quy mô số sân phải từ 1 đến 30.')
    if (!representative.trim()) return setError('Vui lòng nhập tên người đại diện.')
    if (licenseNumber.trim().length < 6) return setError('Vui lòng nhập số CCCD hoặc mã GPKD hợp lệ.')
    if (!/^\d{8,19}$/.test(bankAccount.replace(/\s/g, ''))) return setError('Số tài khoản ngân hàng cần gồm 8 đến 19 chữ số.')
    if (!legalFiles.length && !existing?.documents.length) return setError('Vui lòng tải lên giấy phép kinh doanh hoặc hợp đồng thuê đất.')

    const documents = legalFiles.length ? legalFiles.map(fileToDocument) : existing?.documents ?? []
    const result = submitAuditApplication({
      id: existing?.id ?? `FM-VERIFY-${String(Date.now()).slice(-6)}`,
      type: 'VENUE',
      title: `Xác minh ${venueName.trim()}`,
      ownerName: representative.trim(),
      phone: session.phone.replace(/[\s.-]/g, ''),
      address: address.trim(),
      details: `${courts} ${courtType.toLowerCase()}; tiện ích: ${selectedAmenities.length ? selectedAmenities.join(', ') : 'chưa khai báo'}; đối soát qua ${bank} •••• ${bankAccount.replace(/\s/g, '').slice(-4)}.`,
      documents,
      status: 'PENDING',
      inspectorNotes: '',
      submittedDate: new Date().toLocaleDateString('vi-VN'),
      sourceAccountId: session.id,
      sourceAccountEmail: session.email,
      sourceRole: 'fm',
      applicationData: {
        venueName: venueName.trim(), address: address.trim(), courtCount: courts, courtType, amenities: selectedAmenities,
        representative: representative.trim(), licenseNumber: licenseNumber.trim(), bank, bankAccount: bankAccount.replace(/\s/g, ''),
      },
    })
    if (!result.success) setError(result.message)
  }

  const status = existing?.status
  const statusMeta = status === 'APPROVED'
    ? { title: 'Hồ sơ cụm sân đã được xác minh', description: 'Ban quản trị đã xác minh thông tin pháp lý và đối soát của tài khoản Field Manager hiện tại.', tone: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200', icon: CheckCircle2 }
    : status === 'PENDING'
      ? { title: 'Hồ sơ cụm sân đang được kiểm định', description: 'Bạn vẫn có thể tiếp tục vận hành Field Manager Portal trong khi chờ kết quả xác minh.', tone: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200', icon: ShieldCheck }
      : null

  if (statusMeta && existing) {
    const Icon = statusMeta.icon
    return (
      <div className="space-y-6 pb-10">
        <div><Badge variant="outline">SCR_AUTH_06 · VENUE VERIFICATION</Badge><h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Xác minh hồ sơ cụm sân</h1></div>
        <section className={`rounded-[2rem] border p-6 shadow-sm sm:p-8 ${statusMeta.tone}`}>
          <Icon className="h-9 w-9" />
          <h2 className="mt-5 text-2xl font-black">{statusMeta.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 opacity-85">{statusMeta.description}</p>
          <div className="mt-6 rounded-2xl border border-current/15 bg-card/80 p-4 text-sm text-foreground">
            <p className="text-xs font-black uppercase tracking-wider text-primary">Tài khoản đang xác minh</p>
            <p className="mt-2 font-bold">{session?.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">Mã hồ sơ #{existing.id} · nộp ngày {existing.submittedDate}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Badge variant="outline">SCR_AUTH_06 · VENUE VERIFICATION</Badge>
        <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Xác minh hồ sơ cụm sân</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Khai báo cơ sở, hồ sơ pháp lý và tài khoản đối soát để Ban quản trị xác minh tài khoản Field Manager hiện tại.</p>
      </div>

      {(status === 'NEEDS_SUPPLEMENT' || status === 'REJECTED') && (
        <div className="flex gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm text-orange-900 dark:text-orange-200">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div><b>{status === 'NEEDS_SUPPLEMENT' ? 'Hồ sơ cần được bổ sung' : 'Hồ sơ chưa được duyệt'}</b><p className="mt-1 text-xs leading-5">{existing?.rejectionReason ?? 'Vui lòng kiểm tra lại thông tin và nộp lại hồ sơ.'}</p></div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6">
          <SectionTitle number="1" title="Thông tin cụm sân" description={`Bạn đang xác minh tài khoản Field Manager: ${session?.email ?? ''}.`} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Tên cụm sân *" htmlFor="venue-name" className="sm:col-span-2"><Input id="venue-name" value={venueName} onChange={(event) => setVenueName(event.target.value)} placeholder="VD: Cụm sân D-Pickleball Thảo Điền" /></Field>
            <Field label="Địa chỉ chi tiết *" htmlFor="venue-address" className="sm:col-span-2"><div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input id="venue-address" value={address} onChange={(event) => setAddress(event.target.value)} className="pl-9" placeholder="Số nhà, đường, phường, TP. Thủ Đức" /></div></Field>
            <Field label="Quy mô số sân *" htmlFor="venue-courts"><Input id="venue-courts" type="number" min="1" max="30" value={courtCount} onChange={(event) => setCourtCount(event.target.value)} /></Field>
            <Field label="Loại sân chính *" htmlFor="venue-court-type"><select id="venue-court-type" value={courtType} onChange={(event) => setCourtType(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40"><option>Sân trong nhà máy lạnh</option><option>Sân có mái che</option><option>Sân ngoài trời</option></select></Field>
          </div>
          <div className="mt-5"><Label>Tiện ích có sẵn</Label><div className="mt-3 flex flex-wrap gap-2">{amenities.map((amenity) => <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${selectedAmenities.includes(amenity) ? 'border-primary bg-secondary/45 text-primary' : 'border-border bg-background text-muted-foreground'}`}>{selectedAmenities.includes(amenity) ? '✓ ' : ''}{amenity}</button>)}</div></div>
        </section>

        <section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6">
          <SectionTitle number="2" title="Hồ sơ pháp lý & kinh doanh" description="Tải giấy phép kinh doanh, hợp đồng thuê đất hoặc chứng từ liên quan." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Tên người đại diện *" htmlFor="venue-representative"><Input id="venue-representative" value={representative} onChange={(event) => setRepresentative(event.target.value)} /></Field>
            <Field label="Số CCCD / GPKD *" htmlFor="venue-license"><Input id="venue-license" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} placeholder="VD: 0317892xxx" /></Field>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="venue-legal-files">Giấy phép / hợp đồng thuê đất *</Label><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-background/70 px-3 text-sm transition hover:border-primary hover:bg-secondary/20"><UploadCloud className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate font-medium">{legalFiles.length ? `${legalFiles.length} file đã chọn` : existing?.documents.length ? `${existing.documents.length} file đã nộp trước đó` : 'Chọn PDF/JPG/PNG'}</span><input id="venue-legal-files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={setFiles} className="sr-only" /></label>{legalFiles.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{legalFiles.map((file) => <span key={file.name} className="inline-flex items-center gap-1 rounded-lg bg-secondary/35 px-2 py-1 text-[11px] text-primary"><FileText className="h-3.5 w-3.5" />{file.name}</span>)}</div>}</div>
          </div>
        </section>

        <section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6">
          <SectionTitle number="3" title="Tài khoản ngân hàng đối soát" description="Thông tin này chỉ phục vụ thẩm định prototype, chưa có giao dịch tiền thật." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Ngân hàng *" htmlFor="venue-bank"><select id="venue-bank" value={bank} onChange={(event) => setBank(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40">{banks.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Số tài khoản *" htmlFor="venue-bank-account"><div className="relative"><Landmark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" /><Input id="venue-bank-account" inputMode="numeric" value={bankAccount} onChange={(event) => setBankAccount(event.target.value.replace(/\D/g, ''))} className="pl-9" placeholder="190345678888" /></div></Field>
          </div>
        </section>

        {error && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}
        <div className="flex justify-end"><Button type="submit" size="lg" className="px-6"><Send /> Gửi hồ sơ xác minh</Button></div>
      </form>
    </div>
  )
}

function SectionTitle({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">{number}</span><div><h2 className="font-black">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div></div>
}

function Field({ label, htmlFor, className, children }: { label: string; htmlFor: string; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-2 ${className ?? ''}`}><Label htmlFor={htmlFor}>{label}</Label>{children}</div>
}
