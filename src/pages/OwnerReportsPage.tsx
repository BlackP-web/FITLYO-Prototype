import { useMemo, useState, type ReactNode } from 'react'
import { BarChart3, ChevronDown, Download, FileSpreadsheet, Filter, Landmark, RotateCcw, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useCrossRoleStore, type VenueCalendarEventType } from '@/store/useCrossRoleStore'
import { usePaymentStore } from '@/store/usePaymentStore'
import { getPlayerMatchFee } from '@/lib/playerMatch'
import { ownerRevenueSample } from '@/mocks/ownerRevenueSample'

type RevenueSource = 'COURT' | 'SOCIAL' | 'COACHING' | 'WALK_IN' | 'PRIVATE' | 'REFUND'
type Transaction = {
  id: string; date: string; venueId: string; venueName: string; courtId: string; courtName: string
  source: RevenueSource; label: string; amount: number; paymentMethod: 'VIETQR' | 'CASH'
  status: 'COMPLETED' | 'REFUNDED'; owner: string; coach: string
}
const formatVND = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
const sourceLabel: Record<RevenueSource, string> = { COURT: 'Đặt sân Player', SOCIAL: 'Kèo Social', COACHING: 'Lớp Coach', WALK_IN: 'Khách vãng lai', PRIVATE: 'Khóa sân riêng', REFUND: 'Hoàn tiền' }
const eventToSource: Record<VenueCalendarEventType, RevenueSource> = { SOCIAL: 'SOCIAL', COACHING: 'COACHING', WALK_IN: 'WALK_IN', PRIVATE: 'PRIVATE', MAINTENANCE: 'PRIVATE' }
type MultiOption = { value: string; label: string; group?: string }
type VenueCourtGroup = { venueId: string; venueName: string; courts: Array<{ id: string; name: string; value: number }> }

/** Bỏ dấu, tiền tố "HLV"/"Cụm sân" để so khớp tên giữa các store dùng id khác nhau. */
const normalizeText = (value: string) => value
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
  .toLowerCase().trim()
const normalizeCoachName = (value: string) => normalizeText(value).replace(/^(hlv|coach)\s+/, '').replace(/\s+/g, ' ')
const normalizeVenueName = (value: string) => normalizeText(value).replace(/^cum san\s+/, '').replace(/\s+/g, ' ')

export function OwnerReportsPage() {
  const { showToast, coaches: coachDirectory, coachAffiliations } = useFitlyoStore()
  const venues = usePlayerStore((state) => state.venues)
  const matches = usePlayerStore((state) => state.matches)
  const bookings = useCrossRoleStore((state) => state.courtBookings)
  const events = useCrossRoleStore((state) => state.venueCalendarEvents)
  const payments = usePaymentStore((state) => state.records)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  // Mảng rỗng = "Tất cả"
  const [venueIds, setVenueIds] = useState<string[]>([])
  const [courtIds, setCourtIds] = useState<string[]>([])
  const [sources, setSources] = useState<RevenueSource[]>([])
  const [method, setMethod] = useState<'ALL' | 'VIETQR' | 'CASH'>('ALL')
  // Các cột sân chủ sân bấm chọn trên biểu đồ để xem nguồn doanh thu riêng.
  const [selectedBarCourtIds, setSelectedBarCourtIds] = useState<string[]>([])
  const [coachKeys, setCoachKeys] = useState<string[]>([])

  const transactions = useMemo<Transaction[]>(() => {
    const courtRows: Transaction[] = bookings.map((booking) => ({
      id: booking.id, date: booking.date, venueId: booking.venueId, venueName: booking.venueName,
      courtId: booking.courtId, courtName: booking.courtName, source: 'COURT',
      label: 'Player đặt sân · ' + booking.playerName, amount: booking.status === 'CANCELLED' ? -booking.paidAmount : booking.paidAmount,
      paymentMethod: 'VIETQR', status: booking.status === 'CANCELLED' ? 'REFUNDED' : 'COMPLETED',
      owner: 'Field Manager', coach: '—',
    }))
    const eventRows: Transaction[] = events.filter((event) => event.type !== 'MAINTENANCE' && event.amount > 0).map((event) => ({
      id: event.id, date: event.date, venueId: event.venueId, venueName: event.venueName,
      courtId: event.courtId, courtName: event.courtName, source: eventToSource[event.type],
      label: event.title, amount: event.amount, paymentMethod: event.paymentMethod ?? 'CASH',
      status: 'COMPLETED', owner: 'Field Manager', coach: event.type === 'COACHING' ? event.contactName ?? 'Chưa có dữ liệu' : '—',
    }))
    const socialRows: Transaction[] = matches.filter((match) => match.status !== 'CANCELLED').map((match) => ({
      id: 'match-' + match.id, date: match.date, venueId: match.venueId ?? '', venueName: match.venueName,
      courtId: match.courtId ?? '', courtName: match.courtName, source: 'SOCIAL', label: match.title,
      amount: getPlayerMatchFee(match) * match.participants.length, paymentMethod: 'VIETQR',
      status: 'COMPLETED', owner: 'Field Manager', coach: '—',
    }))
    const refundRows: Transaction[] = payments.filter((payment) => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(payment.status) && (payment.service === 'COURT' || payment.service === 'SOCIAL')).map((payment) => ({
      id: 'refund-' + payment.id, date: (payment.refundedAt ?? payment.createdAt).slice(0, 10),
      venueId: '', venueName: 'Chưa có dữ liệu', courtId: '', courtName: 'Chưa có dữ liệu',
      source: 'REFUND', label: 'Hoàn tiền · ' + payment.title, amount: -(payment.refundAmount ?? 0),
      paymentMethod: 'VIETQR', status: 'REFUNDED', owner: 'Field Manager', coach: '—',
    }))
    // Dữ liệu mẫu doanh thu của các cụm sân hiện có (chỉ để demo biểu đồ).
    const sampleRows: Transaction[] = ownerRevenueSample.flatMap((record) => {
      const venue = venues.find((item) => item.id === record.venueId)
      const court = venue?.courts.find((item) => item.id === record.courtId)
      if (!venue || !court) return []
      return [{
        id: record.id, date: record.date, venueId: venue.id, venueName: venue.name, courtId: court.id, courtName: court.name,
        source: record.source, label: record.label, amount: record.amount, paymentMethod: record.paymentMethod,
        status: 'COMPLETED' as const, owner: 'Field Manager', coach: record.coach ?? '—',
      }]
    })
    return [...courtRows, ...eventRows, ...socialRows, ...refundRows, ...sampleRows].sort((a, b) => b.date.localeCompare(a.date))
  }, [bookings, events, matches, payments, venues])

  const scopedVenues = useMemo(() => venueIds.length ? venues.filter((venue) => venueIds.includes(venue.id)) : venues, [venueIds, venues])
  const courts = scopedVenues.flatMap((venue) => venue.courts.map((court) => ({ ...court, venueId: venue.id, venueName: venue.name })))
  const courtOptions: MultiOption[] = courts.map((court) => ({ value: court.id, label: court.name, group: court.venueName }))
  const venueOptions: MultiOption[] = venues.map((venue) => ({ value: venue.id, label: venue.name }))
  // "Hoàn tiền" không phải loại khoản thu nên không đưa vào bộ lọc (khoản hoàn vẫn được trừ vào doanh thu ròng).
  const sourceOptions: MultiOption[] = (Object.keys(sourceLabel) as RevenueSource[]).filter((key) => key !== 'REFUND').map((key) => ({ value: key, label: sourceLabel[key] }))

  // Ô Coach chỉ hiện khi đang xem "Tất cả loại thu" hoặc có chọn "Lớp Coach".
  const showCoachFilter = sources.length === 0 || sources.includes('COACHING')

  // Coach đang liên kết (ACTIVE) với các cụm sân trong phạm vi lọc. Lịch sân dùng id
  // cụm sân của usePlayerStore còn liên kết Coach dùng id của useFitlyoStore, nên khớp
  // theo id hoặc theo tên cụm sân đã chuẩn hóa.
  const coachOptions = useMemo<MultiOption[]>(() => {
    const options = new Map<string, MultiOption>()
    const venueGroup = (venueId: string, venueName: string) => scopedVenues.find((venue) => venue.id === venueId || normalizeVenueName(venue.name) === normalizeVenueName(venueName))
    coachAffiliations.filter((item) => item.status === 'ACTIVE').forEach((item) => {
      const venue = venueGroup(item.venueId, item.venueName)
      if (!venue) return
      const name = coachDirectory.find((coach) => coach.id === item.coachId)?.name ?? item.coachName ?? item.coachId
      const key = normalizeCoachName(name)
      if (!options.has(key)) options.set(key, { value: key, label: name })
    })
    // Bổ sung Coach đã phát sinh giao dịch "Lớp Coach" tại các cụm sân này để không bỏ sót doanh thu.
    transactions.filter((item) => item.source === 'COACHING' && item.coach !== '—' && scopedVenues.some((venue) => venue.id === item.venueId)).forEach((item) => {
      const key = normalizeCoachName(item.coach)
      if (!options.has(key)) options.set(key, { value: key, label: item.coach })
    })
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'))
  }, [coachAffiliations, coachDirectory, scopedVenues, transactions])

  const activeCoachKeys = showCoachFilter ? coachKeys.filter((key) => coachOptions.some((option) => option.value === key)) : []
  // Chọn đủ tất cả lựa chọn = không lọc (để không loại các khoản chưa gắn cụm sân/sân như hoàn tiền).
  const effective = (selected: string[], options: MultiOption[]) => options.length > 0 && selected.length >= options.length ? [] : selected
  const venueFilter = effective(venueIds, venueOptions)
  const courtFilter = effective(courtIds, courtOptions)
  const sourceFilter = effective(sources, sourceOptions)
  const coachFilter = effective(activeCoachKeys, coachOptions)
  const filtered = transactions.filter((item) => (!fromDate || item.date >= fromDate)
    && (!toDate || item.date <= toDate)
    && (!venueFilter.length || venueFilter.includes(item.venueId))
    && (!courtFilter.length || courtFilter.includes(item.courtId))
    && (!sourceFilter.length || sourceFilter.includes(item.source))
    && (method === 'ALL' || item.paymentMethod === method)
    // Lọc Coach chỉ thu hẹp các khoản "Lớp Coach"; các loại thu khác giữ nguyên.
    && (!coachFilter.length || item.source !== 'COACHING' || coachFilter.includes(normalizeCoachName(item.coach))))
  const gross = filtered.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0)
  const refunded = Math.abs(filtered.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0))
  const net = gross - refunded
  const byVenueCourt: VenueCourtGroup[] = scopedVenues
    .map((venue) => ({
      venueId: venue.id,
      venueName: venue.name,
      courts: venue.courts
        .filter((court) => !courtFilter.length || courtFilter.includes(court.id))
        .map((court) => ({ id: court.id, name: court.name, value: filtered.filter((item) => item.courtId === court.id).reduce((sum, item) => sum + item.amount, 0) })),
    }))
    .filter((group) => group.courts.length > 0)
  // Chỉ giữ các cột đang hiển thị trên biểu đồ (bộ lọc đổi thì cột bị ẩn tự bỏ chọn).
  const visibleCourts = byVenueCourt.flatMap((group) => group.courts.map((court) => ({ ...court, venueName: group.venueName })))
  const activeBarCourtIds = selectedBarCourtIds.filter((id) => visibleCourts.some((court) => court.id === id))
  const sourceRows = activeBarCourtIds.length ? filtered.filter((item) => activeBarCourtIds.includes(item.courtId)) : filtered
  const toggleBarCourt = (courtId: string) => setSelectedBarCourtIds((current) => current.includes(courtId) ? current.filter((id) => id !== courtId) : [...current, courtId])
  const selectedCourtLabel = visibleCourts.filter((court) => activeBarCourtIds.includes(court.id)).map((court) => court.name + ' (' + court.venueName + ')').join(', ')
  // Nguồn doanh thu đồng bộ bộ lọc: chỉ hiện các loại thu đang chọn (không chọn/chọn đủ = tất cả).
  const sourceKeys = (Object.keys(sourceLabel) as RevenueSource[]).filter((key) => key !== 'REFUND' && (!sourceFilter.length || sourceFilter.includes(key)))
  const bySource = sourceKeys.map((key) => ({ label: sourceLabel[key], value: sourceRows.filter((item) => item.source === key).reduce((sum, item) => sum + item.amount, 0) }))
  const exportReport = (format: 'xlsx' | 'csv') => {
    const rows = filtered.map((item) => ({ Ngày: item.date, 'Cụm sân': item.venueName, Sân: item.courtName, 'Loại khoản thu': sourceLabel[item.source], Nội_dung: item.label, 'Phương thức': item.paymentMethod === 'CASH' ? 'Tiền mặt' : 'VietQR', 'Trạng thái': item.status === 'REFUNDED' ? 'Đã hoàn' : 'Đã thu', 'Field Manager': item.owner, Coach: item.coach, 'Số tiền (VND)': item.amount }))
    const headers = ['Ngày', 'Cụm sân', 'Sân', 'Loại khoản thu', 'Nội dung', 'Phương thức', 'Trạng thái', 'Field Manager', 'Coach', 'Số tiền (VND)']
    const values = rows.map((row) => [row.Ngày, row['Cụm sân'], row.Sân, row['Loại khoản thu'], row.Nội_dung, row['Phương thức'], row['Trạng thái'], row['Field Manager'], row.Coach, row['Số tiền (VND)']])
    const escape = (value: string | number) => String(value).replaceAll('"', '""')
    const csv = [headers, ...values].map((row) => row.map((cell) => '"' + escape(cell) + '"').join(',')).join('\n')
    const excelTable = '<table><thead><tr>' + headers.map((header) => '<th>' + header + '</th>').join('') + '</tr></thead><tbody>' + values.map((row) => '<tr>' + row.map((cell) => '<td>' + escape(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table>'
    const blob = format === 'csv'
      ? new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      : new Blob(['\uFEFF<html><head><meta charset="utf-8"></head><body>' + excelTable + '</body></html>'], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'fitlyo-bao-cao-tai-chinh.' + (format === 'xlsx' ? 'xls' : 'csv')
    link.click()
    URL.revokeObjectURL(link.href)
    showToast('Đã xuất báo cáo ' + format.toUpperCase() + ' theo bộ lọc hiện tại.', 'success')
  }
  const resetFilters = () => { setFromDate(''); setToDate(''); setVenueIds([]); setCourtIds([]); setSources([]); setMethod('ALL'); setCoachKeys([]); setSelectedBarCourtIds([]) }
  const changeVenues = (next: string[]) => {
    setVenueIds(next)
    // Bỏ các sân không còn thuộc cụm sân đang chọn.
    if (next.length) {
      const allowedCourtIds = new Set(venues.filter((venue) => next.includes(venue.id)).flatMap((venue) => venue.courts.map((court) => court.id)))
      setCourtIds((current) => current.filter((id) => allowedCourtIds.has(id)))
    }
  }
  const changeSources = (next: string[]) => {
    const nextSources = next as RevenueSource[]
    setSources(nextSources)
    if (nextSources.length && !nextSources.includes('COACHING')) setCoachKeys([])
  }
  return <div className="space-y-6 pb-12">
    <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 xl:flex-row xl:items-start"><div><div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_06</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · Báo cáo tài chính</span></div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Doanh thu & đối soát chi tiết</h1><p className="mt-1 text-sm text-muted-foreground">Phân tích theo sân, loại khoản thu, phương thức thanh toán và người phụ trách.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => exportReport('csv')}><Download />CSV</Button><Button onClick={() => exportReport('xlsx')}><FileSpreadsheet />Xuất Excel</Button></div></header>
    <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2 font-black"><Filter className="h-4 w-4 text-primary" />Bộ lọc báo cáo</div><Button variant="ghost" size="sm" onClick={resetFilters}><RotateCcw />Đặt lại</Button></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <FilterField label="Từ ngày"><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm" /></FilterField>
      <FilterField label="Đến ngày"><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm" /></FilterField>
      <FilterField label="Cụm sân" asDiv><MultiSelect options={venueOptions} value={venueIds} onChange={changeVenues} allLabel="Tất cả cụm sân" unit="cụm sân" /></FilterField>
      <FilterField label="Sân" asDiv><MultiSelect options={courtOptions} value={courtIds} onChange={setCourtIds} allLabel="Tất cả sân" unit="sân" /></FilterField>
      <FilterField label="Loại khoản thu" asDiv><MultiSelect options={sourceOptions} value={sources} onChange={changeSources} allLabel="Tất cả loại thu" unit="loại thu" /></FilterField>
      <FilterField label="Phương thức"><select value={method} onChange={(event) => setMethod(event.target.value as 'ALL' | 'VIETQR' | 'CASH')} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">VietQR & tiền mặt</option><option value="VIETQR">VietQR</option><option value="CASH">Tiền mặt</option></select></FilterField>
      {showCoachFilter && <FilterField label="Coach" asDiv><MultiSelect options={coachOptions} value={activeCoachKeys} onChange={setCoachKeys} allLabel="Tất cả Coach" unit="Coach" emptyText="Chưa có Coach liên kết với cụm sân đã chọn." /></FilterField>}
    </div></section>
    <section className="grid gap-4 sm:grid-cols-3"><Metric label="Tổng khoản thu" value={formatVND(gross)} icon={<Landmark className="h-5 w-5" />} tone="text-emerald-600" /><Metric label="Doanh thu ròng" value={formatVND(net)} icon={<TrendingUp className="h-5 w-5" />} tone="text-primary" /><Metric label="Giao dịch khớp lọc" value={filtered.length + ' giao dịch'} icon={<BarChart3 className="h-5 w-5" />} tone="text-sky-600" /></section>
    <CourtRevenueChart groups={byVenueCourt} selectedIds={activeBarCourtIds} onToggle={toggleBarCourt} />
    <ReportBars title="Nguồn doanh thu" rows={bySource} color="bg-sky-500" subtitle={activeBarCourtIds.length ? 'Đang xem: ' + selectedCourtLabel : 'Tất cả sân. Bấm vào cột ở biểu đồ trên để xem riêng từng sân.'} action={activeBarCourtIds.length ? <Button variant="ghost" size="sm" onClick={() => setSelectedBarCourtIds([])}><RotateCcw />Bỏ chọn sân</Button> : undefined} />
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-black">Chi tiết giao dịch</h2><p className="mt-1 text-xs text-muted-foreground">Khoản hoàn hiển thị số âm; chỉ tổng hợp VietQR và tiền mặt tại quầy.</p></div><b className="text-sm text-primary">{filtered.length} dòng</b></div><div className="overflow-x-auto"><table className="min-w-[1020px] w-full text-left text-sm"><thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground"><tr>{['Ngày', 'Cụm sân / Sân', 'Nội dung', 'Loại thu', 'Thanh toán', 'FM / Coach', 'Trạng thái', 'Số tiền'].map((label) => <th key={label} className="px-4 py-3 font-black">{label}</th>)}</tr></thead><tbody>{filtered.length ? filtered.map((item) => <tr key={item.id} className="border-t border-border/70"><td className="px-4 py-3 font-semibold">{item.date}</td><td className="px-4 py-3"><p className="font-bold">{item.venueName}</p><p className="text-xs text-muted-foreground">{item.courtName}</p></td><td className="px-4 py-3 font-semibold">{item.label}</td><td className="px-4 py-3">{sourceLabel[item.source]}</td><td className="px-4 py-3">{item.paymentMethod === 'CASH' ? 'Tiền mặt' : 'VietQR'}</td><td className="px-4 py-3"><p>{item.owner}</p><p className="text-xs text-muted-foreground">{item.coach}</p></td><td className="px-4 py-3"><Badge variant="outline" className={item.status === 'REFUNDED' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}>{item.status === 'REFUNDED' ? 'Đã hoàn' : 'Đã thu'}</Badge></td><td className={'px-4 py-3 text-right font-black ' + (item.amount < 0 ? 'text-rose-600' : 'text-emerald-600')}>{formatVND(item.amount)}</td></tr>) : <tr><td colSpan={8} className="px-4 py-14 text-center text-muted-foreground">Không có giao dịch phù hợp với bộ lọc.</td></tr>}</tbody></table></div></section>
  </div>
}
function FilterField({ label, children, asDiv = false }: { label: string; children: ReactNode; asDiv?: boolean }) {
  const caption = <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-muted-foreground">{label}</span>
  // Dropdown nhiều lựa chọn là button, không bọc trong <label> để tránh click nhãn mở menu ngoài ý muốn.
  return asDiv ? <div className="block">{caption}{children}</div> : <label className="block">{caption}{children}</label>
}
function MultiSelect({ options, value, onChange, allLabel, unit, emptyText = 'Không có lựa chọn.' }: { options: MultiOption[]; value: string[]; onChange: (next: string[]) => void; allLabel: string; unit: string; emptyText?: string }) {
  const selected = options.filter((option) => value.includes(option.value))
  // Không chọn gì hoặc chọn đủ tất cả đều nghĩa là không lọc theo trường này.
  const allSelected = options.length > 0 && selected.length === options.length
  const summary = !selected.length || (allSelected && options.length > 1) ? allLabel : selected.length === 1 ? (selected[0].group ? selected[0].label + ' · ' + selected[0].group : selected[0].label) : 'Đã chọn ' + selected.length + ' ' + unit
  const toggle = (optionValue: string) => onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue])
  const groups = [...new Set(options.map((option) => option.group ?? ''))]
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button type="button" className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <span className={'truncate ' + (selected.length ? 'font-semibold' : '')}>{summary}</span>
        <span className="flex shrink-0 items-center gap-1.5">{selected.length > 1 && !allSelected && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-black text-primary">{selected.length}</span>}<ChevronDown className="h-4 w-4 opacity-60" /></span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="max-h-80 w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 overflow-y-auto rounded-xl">
      {options.length > 1 && <><DropdownMenuCheckboxItem checked={allSelected} onCheckedChange={() => onChange(allSelected ? [] : options.map((option) => option.value))} onSelect={(event) => event.preventDefault()} className="font-bold">Chọn tất cả ({options.length})</DropdownMenuCheckboxItem><DropdownMenuSeparator /></>}
      {!options.length && <p className="px-2 py-3 text-xs text-muted-foreground">{emptyText}</p>}
      {groups.map((group) => <div key={group || 'default'}>
        {group && groups.length > 1 && <DropdownMenuLabel className="pt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{group}</DropdownMenuLabel>}
        {options.filter((option) => (option.group ?? '') === group).map((option) => <DropdownMenuCheckboxItem key={option.value} checked={value.includes(option.value)} onCheckedChange={() => toggle(option.value)} onSelect={(event) => event.preventDefault()}>{option.label}</DropdownMenuCheckboxItem>)}
      </div>)}
    </DropdownMenuContent>
  </DropdownMenu>
}
function ReportBars({ title, rows, color, subtitle, action }: { title: string; rows: Array<{ label: string; value: number }>; color: string; subtitle?: string; action?: ReactNode }) { const max = Math.max(...rows.map((item) => Math.abs(item.value)), 1); return <section className="rounded-3xl border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black">{title}</h2>{subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}</div>{action}</div><div className="mt-6 space-y-5">{rows.length ? rows.map((item) => <div key={item.label}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-semibold">{item.label}</span><span className={'font-black ' + (item.value < 0 ? 'text-rose-600' : '')}>{formatVND(item.value)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className={'h-full rounded-full ' + (item.value < 0 ? 'bg-rose-500' : color)} style={{ width: Math.min(100, Math.round((Math.abs(item.value) / max) * 100)) + '%' }} /></div></div>) : <p className="py-10 text-center text-sm text-muted-foreground">Chưa có dữ liệu.</p>}</div></section> }
function Metric({ label, value, icon, tone }: { label: string; value: string; icon: ReactNode; tone: string }) { return <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className={'flex h-9 w-9 items-center justify-center rounded-xl bg-muted ' + tone}>{icon}</div><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className={'mt-1 text-xl font-extrabold ' + tone}>{value}</p></div> }

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)
/** Làm tròn trục Y lên mốc "đẹp" (1, 2, 2.5, 5 × 10^n) để chia 4 vạch đều. */
const niceCeil = (value: number) => {
  if (value <= 0) return 100000
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((item) => item * magnitude >= value) ?? 10
  return step * magnitude
}
const CHART_HEIGHT = 260
const Y_TICKS = 4

function CourtRevenueChart({ groups, selectedIds, onToggle }: { groups: VenueCourtGroup[]; selectedIds: string[]; onToggle: (courtId: string) => void }) {
  const hasSelection = selectedIds.length > 0
  const values = groups.flatMap((group) => group.courts.map((court) => Math.abs(court.value)))
  const yMax = niceCeil(Math.max(...values, 0))
  const ticks = Array.from({ length: Y_TICKS + 1 }, (_, index) => (yMax / Y_TICKS) * index)
  const venueTotal = (group: VenueCourtGroup) => group.courts.reduce((sum, court) => sum + court.value, 0)
  return <section className="rounded-3xl border bg-card p-5 shadow-sm">
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div><h2 className="text-lg font-black">Doanh thu theo sân</h2><p className="mt-1 text-sm text-muted-foreground">Mỗi nhóm cột là một cụm sân, mỗi cột là một sân. Bấm vào cột để xem nguồn doanh thu của sân đó, bấm lại để bỏ chọn.</p></div>
      <span className="text-sm font-bold text-muted-foreground">Đơn vị: VNĐ</span>
    </div>
    {!groups.length ? <p className="py-14 text-center text-sm text-muted-foreground">Chưa có dữ liệu.</p> : <div className="mt-4 flex items-start">
      {/* Trục Y */}
      <div className="relative mt-7 w-24 shrink-0 pr-2" style={{ height: CHART_HEIGHT }}>
        <span className="absolute -top-7 right-2 text-[13px] font-black text-muted-foreground">(VNĐ)</span>
        {ticks.map((tick) => <span key={tick} className="absolute right-2 translate-y-1/2 text-xs font-semibold text-muted-foreground" style={{ bottom: (tick / yMax) * 100 + '%' }}>{formatNumber(tick)}</span>)}
      </div>
      {/* Vùng vẽ */}
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="relative min-w-max pt-7">
          <div className="pointer-events-none absolute inset-x-0 top-7" style={{ height: CHART_HEIGHT }}>
            {ticks.map((tick) => <div key={tick} className={'absolute inset-x-0 border-t ' + (tick === 0 ? 'border-foreground/70' : 'border-dashed border-border/60')} style={{ bottom: (tick / yMax) * 100 + '%' }} />)}
            <div className="absolute inset-y-0 left-0 border-l border-foreground/70" />
          </div>
          <div className="relative flex gap-10 px-6">
            {groups.map((group) => <div key={group.venueId} className="flex flex-col items-center">
              <div className="flex items-end gap-3" style={{ height: CHART_HEIGHT }}>
                {group.courts.map((court) => {
                  const height = Math.max(court.value === 0 ? 0 : 2, (Math.abs(court.value) / yMax) * 100)
                  const negative = court.value < 0
                  const selected = selectedIds.includes(court.id)
                  // Có cột được chọn: cột chọn sáng lên, các cột khác mờ đi.
                  const dimmed = hasSelection && !selected
                  return <button key={court.id} type="button" onClick={() => onToggle(court.id)} aria-pressed={selected} className="group relative h-full w-16 cursor-pointer outline-none" title={court.name + ' · ' + group.venueName + ': ' + formatVND(court.value) + (selected ? ' · Bấm để bỏ chọn' : ' · Bấm để xem nguồn doanh thu')}>
                    <div className={'absolute inset-x-0 bottom-0 transition-all duration-200 ' + (negative ? 'bg-rose-500' : 'bg-primary') + (selected ? ' brightness-125 shadow-[0_0_18px_4px] shadow-primary/60 ring-2 ring-foreground' : '') + (dimmed ? ' opacity-30 group-hover:opacity-60' : ' group-hover:brightness-110')} style={{ height: height + '%' }} />
                    {selected && court.value === 0 && <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground" />}
                    <span className={'absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-black transition-opacity ' + (negative ? 'text-rose-600' : '') + (dimmed ? ' opacity-40' : '') + (selected ? ' text-primary' : '')} style={{ bottom: 'calc(' + height + '% + 4px)' }}>{formatNumber(court.value)}</span>
                  </button>
                })}
              </div>
              <div className="mt-2 flex gap-3">{group.courts.map((court) => <span key={court.id} className={'w-16 text-center text-xs font-semibold ' + (selectedIds.includes(court.id) ? 'font-black text-primary' : 'text-muted-foreground')}>{court.name}</span>)}</div>
              <p className="mt-1.5 max-w-64 text-center text-base font-black">{group.venueName}</p>
              <p className="text-[13px] font-semibold text-muted-foreground">Tổng: {formatVND(venueTotal(group))}</p>
            </div>)}
          </div>
        </div>
      </div>
    </div>}
  </section>
}
