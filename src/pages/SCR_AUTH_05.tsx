import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Award, CheckCircle2, CircleAlert, FileText, MapPin, ShieldCheck, UploadCloud } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/useAuthStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
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
  const session = useAuthStore((state) => state.session)
  const { auditApplications, coachAccount, submitAuditApplication } = useFitlyoStore()
  const existing = useMemo(
    () => auditApplications.find((item) => item.type === 'COACH' && item.sourceAccountId === session?.id),
    [auditApplications, session?.id],
  )
  const saved = existing?.applicationData
  const [fullName, setFullName] = useState(String(session?.name ?? saved?.fullName ?? coachAccount.name))
  const [phone, setPhone] = useState(String(session?.phone ?? saved?.phone ?? coachAccount.phone))
  const [dupr, setDupr] = useState(String(saved?.dupr ?? coachAccount.duprRating))
  const [duprId, setDuprId] = useState(String(saved?.duprId ?? coachAccount.certificateCode))
  const [certificateType, setCertificateType] = useState(String(saved?.certificateType ?? coachAccount.certificateTitle))
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    Array.isArray(saved?.regions) ? saved.regions.map(String) : coachAccount.serviceAreas,
  )
  const [rate, setRate] = useState(String(saved?.rate ?? coachAccount.ratePerSession))
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [error, setError] = useState('')

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

  const toggleRegion = (region: string) => {
    setSelectedRegions((current) => current.includes(region) ? current.filter((item) => item !== region) : [...current, region])
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!session) return setError('Không xác định được phiên Coach. Vui lòng đăng nhập lại.')

    const cleanPhone = phone.replace(/[\s.-]/g, '')
    const duprNumber = Number(dupr)
    const rateNumber = Number(rate)
    if (fullName.trim().length < 2) return setError('Vui lòng nhập họ và tên Coach.')
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) return setError('Số điện thoại chưa đúng định dạng Việt Nam.')
    if (!Number.isFinite(duprNumber) || duprNumber < 1 || duprNumber > 8) return setError('DUPR phải nằm trong khoảng 1.00 đến 8.00.')
    if (!duprId.trim()) return setError('Vui lòng nhập mã hồ sơ DUPR hoặc mã chứng chỉ.')
    if (!selectedRegions.length) return setError('Chọn ít nhất một khu vực có thể nhận lớp.')
    if (!Number.isFinite(rateNumber) || rateNumber < 100_000) return setError('Học phí đề xuất tối thiểu là 100.000đ / 90 phút.')
    if (!certificateFile && !existing?.documents.length) return setError('Vui lòng tải lên chứng chỉ PDF/JPG/PNG trước khi nộp.')

    const documents = certificateFile ? [fileToDocument(certificateFile)] : existing?.documents ?? []
    const result = submitAuditApplication({
      id: existing?.id ?? `COACH-VERIFY-${String(Date.now()).slice(-6)}`,
      type: 'COACH',
      title: `Xác minh Coach ${fullName.trim()}`,
      ownerName: fullName.trim(),
      phone: cleanPhone,
      address: selectedRegions.join(' · ') + ', TP. Thủ Đức',
      details: `${certificateType}; DUPR ${duprNumber.toFixed(2)}; mã xác minh ${duprId.trim().toUpperCase()}; học phí đề xuất ${rateNumber.toLocaleString('vi-VN')}đ / 90 phút.`,
      documents,
      status: 'PENDING',
      inspectorNotes: '',
      submittedDate: new Date().toLocaleDateString('vi-VN'),
      sourceAccountId: session.id,
      sourceAccountEmail: session.email,
      sourceRole: 'coach',
      applicationData: {
        fullName: fullName.trim(), phone: cleanPhone, dupr: duprNumber, duprId: duprId.trim().toUpperCase(),
        certificateType, regions: selectedRegions, rate: rateNumber,
      },
    })
    if (!result.success) setError(result.message)
  }

  const status = existing?.status
  const statusMeta = status === 'APPROVED'
    ? { title: 'Hồ sơ Coach đã được xác minh', description: 'Ban quản trị đã xác minh chứng chỉ và thông tin chuyên môn của tài khoản Coach hiện tại.', tone: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200', icon: CheckCircle2 }
    : status === 'PENDING'
      ? { title: 'Hồ sơ đang được Ban quản trị thẩm định', description: 'Bạn vẫn có thể tiếp tục quản lý Coach Portal trong khi chờ kết quả xác minh.', tone: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200', icon: ShieldCheck }
      : null

  if (statusMeta && existing) {
    const Icon = statusMeta.icon
    return (
      <div className="space-y-6 pb-10">
        <div><Badge variant="outline">SCR_AUTH_05 · COACH VERIFICATION</Badge><h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Xác minh hồ sơ Coach</h1></div>
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
        <Badge variant="outline">SCR_AUTH_05 · COACH VERIFICATION</Badge>
        <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Xác minh hồ sơ Coach</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Cập nhật chứng chỉ, trình độ DUPR và khu vực nhận lớp để Ban quản trị thẩm định tài khoản Coach hiện tại.</p>
      </div>

      {(status === 'NEEDS_SUPPLEMENT' || status === 'REJECTED') && (
        <div className="flex gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm text-orange-900 dark:text-orange-200">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div><b>{status === 'NEEDS_SUPPLEMENT' ? 'Hồ sơ cần được bổ sung' : 'Hồ sơ chưa được duyệt'}</b><p className="mt-1 text-xs leading-5">{existing?.rejectionReason ?? 'Vui lòng kiểm tra lại thông tin và nộp lại hồ sơ.'}</p></div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6">
          <SectionTitle number="1" title="Thông tin Coach & chuyên môn" description={`Bạn đang xác minh tài khoản Coach: ${session?.email ?? ''}.`} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Họ và tên *" htmlFor="coach-name"><Input id="coach-name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></Field>
            <Field label="Số điện thoại *" htmlFor="coach-phone"><Input id="coach-phone" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
            <Field label="Điểm DUPR thi đấu *" htmlFor="coach-dupr"><Input id="coach-dupr" type="number" min="1" max="8" step="0.01" value={dupr} onChange={(event) => setDupr(event.target.value)} /></Field>
            <Field label="Mã DUPR / mã chứng chỉ *" htmlFor="coach-dupr-id"><Input id="coach-dupr-id" value={duprId} onChange={(event) => setDuprId(event.target.value)} placeholder="VD: IPTPA-VN-L2-0485" /></Field>
          </div>
        </section>

        <section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6">
          <SectionTitle number="2" title="Bằng cấp & chứng chỉ uy tín" description="Tải PDF, JPG hoặc PNG, tối đa 10 MB. Prototype chỉ lưu tên và dung lượng file." />
          <div className="mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
            <Field label="Loại chứng chỉ *" htmlFor="coach-certificate-type"><select id="coach-certificate-type" value={certificateType} onChange={(event) => setCertificateType(event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40">{certificateOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <div className="space-y-2"><Label htmlFor="coach-certificate-file">Ảnh/bản scan chứng chỉ *</Label><label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-background/70 px-3 text-sm transition hover:border-primary hover:bg-secondary/20"><UploadCloud className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate font-medium">{certificateFile?.name ?? existing?.documents[0]?.name ?? 'Chọn file PDF/JPG/PNG'}</span><input id="coach-certificate-file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={setFile} className="sr-only" /></label>{certificateFile && <p className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300"><FileText className="h-3.5 w-3.5" /> {formatFileSize(certificateFile.size)} · sẵn sàng nộp</p>}</div>
          </div>
        </section>

        <section className="fitlyo-elevated rounded-[1.75rem] p-5 sm:p-6">
          <SectionTitle number="3" title="Khu vực & học phí dự kiến" description="Thông tin này được Admin dùng để thẩm định và đồng bộ vào hồ sơ Coach sau khi duyệt." />
          <div className="mt-5 grid gap-5 sm:grid-cols-[1.2fr_0.8fr]">
            <div><Label>Khu vực nhận dạy *</Label><div className="mt-3 flex flex-wrap gap-2">{regions.map((region) => <button key={region} type="button" onClick={() => toggleRegion(region)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${selectedRegions.includes(region) ? 'border-primary bg-secondary/45 text-primary' : 'border-border bg-background text-muted-foreground'}`}><MapPin className="h-3.5 w-3.5" />{region}</button>)}</div></div>
            <Field label="Học phí PT 1-1 / 90 phút *" htmlFor="coach-rate"><Input id="coach-rate" type="number" min="100000" step="50000" value={rate} onChange={(event) => setRate(event.target.value)} /><p className="text-[11px] text-muted-foreground">VNĐ · đề xuất ban đầu</p></Field>
          </div>
        </section>

        {error && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}
        <div className="flex justify-end"><Button type="submit" size="lg" className="px-6"><Award /> Gửi hồ sơ xác minh</Button></div>
      </form>
    </div>
  )
}

function SectionTitle({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">{number}</span><div><h2 className="font-black">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div></div>
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>
}
