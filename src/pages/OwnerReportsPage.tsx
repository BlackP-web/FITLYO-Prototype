import { useMemo, useState, type ReactNode } from 'react'
import { BarChart3, Download, FileSpreadsheet, Filter, Landmark, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useCrossRoleStore, type VenueCalendarEventType } from '@/store/useCrossRoleStore'
import { usePaymentStore } from '@/store/usePaymentStore'
import { getPlayerMatchFee } from '@/lib/playerMatch'

type RevenueSource = 'COURT' | 'SOCIAL' | 'COACHING' | 'WALK_IN' | 'PRIVATE' | 'REFUND'
type Transaction = {
  id: string; date: string; venueId: string; venueName: string; courtId: string; courtName: string
  source: RevenueSource; label: string; amount: number; paymentMethod: 'VIETQR' | 'CASH'
  status: 'COMPLETED' | 'REFUNDED'; owner: string; coach: string
}
const formatVND = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
const sourceLabel: Record<RevenueSource, string> = { COURT: 'Đặt sân Player', SOCIAL: 'Kèo Social', COACHING: 'Lớp Coach', WALK_IN: 'Khách vãng lai', PRIVATE: 'Khóa sân riêng', REFUND: 'Hoàn tiền' }
const eventToSource: Record<VenueCalendarEventType, RevenueSource> = { SOCIAL: 'SOCIAL', COACHING: 'COACHING', WALK_IN: 'WALK_IN', PRIVATE: 'PRIVATE', MAINTENANCE: 'PRIVATE' }

export function OwnerReportsPage() {
  const { showToast } = useFitlyoStore()
  const venues = usePlayerStore((state) => state.venues)
  const matches = usePlayerStore((state) => state.matches)
  const bookings = useCrossRoleStore((state) => state.courtBookings)
  const events = useCrossRoleStore((state) => state.venueCalendarEvents)
  const payments = usePaymentStore((state) => state.records)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [venueId, setVenueId] = useState('ALL')
  const [courtId, setCourtId] = useState('ALL')
  const [source, setSource] = useState<'ALL' | RevenueSource>('ALL')
  const [method, setMethod] = useState<'ALL' | 'VIETQR' | 'CASH'>('ALL')
  const [status, setStatus] = useState<'ALL' | 'COMPLETED' | 'REFUNDED'>('ALL')
  const [owner, setOwner] = useState('ALL')
  const [coach, setCoach] = useState('ALL')

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
    return [...courtRows, ...eventRows, ...socialRows, ...refundRows].sort((a, b) => b.date.localeCompare(a.date))
  }, [bookings, events, matches, payments])

  const courts = venues.find((venue) => venue.id === venueId)?.courts ?? venues.flatMap((venue) => venue.courts)
  const filtered = transactions.filter((item) => (!fromDate || item.date >= fromDate) && (!toDate || item.date <= toDate) && (venueId === 'ALL' || item.venueId === venueId) && (courtId === 'ALL' || item.courtId === courtId) && (source === 'ALL' || item.source === source) && (method === 'ALL' || item.paymentMethod === method) && (status === 'ALL' || item.status === status) && (owner === 'ALL' || item.owner === owner) && (coach === 'ALL' || item.coach === coach))
  const gross = filtered.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0)
  const refunded = Math.abs(filtered.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0))
  const net = gross - refunded
  const byCourt = courts.map((court) => ({ label: court.name, value: filtered.filter((item) => item.courtId === court.id).reduce((sum, item) => sum + item.amount, 0) })).sort((a, b) => b.value - a.value)
  const bySource = (Object.keys(sourceLabel) as RevenueSource[]).filter((key) => key !== 'REFUND').map((key) => ({ label: sourceLabel[key], value: filtered.filter((item) => item.source === key).reduce((sum, item) => sum + item.amount, 0) }))
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
  const resetFilters = () => { setFromDate(''); setToDate(''); setVenueId('ALL'); setCourtId('ALL'); setSource('ALL'); setMethod('ALL'); setStatus('ALL'); setOwner('ALL'); setCoach('ALL') }
  const coachOptions = [...new Set(transactions.map((item) => item.coach).filter((item) => item !== '—'))]
  return <div className="space-y-6 pb-12">
    <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 xl:flex-row xl:items-start"><div><div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_06</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · Báo cáo tài chính</span></div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Doanh thu & đối soát chi tiết</h1><p className="mt-1 text-sm text-muted-foreground">Phân tích theo sân, loại khoản thu, phương thức thanh toán và người phụ trách.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => exportReport('csv')}><Download />CSV</Button><Button onClick={() => exportReport('xlsx')}><FileSpreadsheet />Xuất Excel</Button></div></header>
    <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2 font-black"><Filter className="h-4 w-4 text-primary" />Bộ lọc báo cáo</div><Button variant="ghost" size="sm" onClick={resetFilters}><RotateCcw />Đặt lại</Button></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"><FilterField label="Từ ngày"><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm" /></FilterField><FilterField label="Đến ngày"><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm" /></FilterField><FilterField label="Cụm sân"><select value={venueId} onChange={(event) => { setVenueId(event.target.value); setCourtId('ALL') }} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">Tất cả cụm sân</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></FilterField><FilterField label="Sân"><select value={courtId} onChange={(event) => setCourtId(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">Tất cả sân</option>{courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}</select></FilterField><FilterField label="Loại khoản thu"><select value={source} onChange={(event) => setSource(event.target.value as 'ALL' | RevenueSource)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">Tất cả loại thu</option>{(Object.keys(sourceLabel) as RevenueSource[]).map((item) => <option key={item} value={item}>{sourceLabel[item]}</option>)}</select></FilterField><FilterField label="Phương thức"><select value={method} onChange={(event) => setMethod(event.target.value as 'ALL' | 'VIETQR' | 'CASH')} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">VietQR & tiền mặt</option><option value="VIETQR">VietQR</option><option value="CASH">Tiền mặt</option></select></FilterField><FilterField label="Trạng thái"><select value={status} onChange={(event) => setStatus(event.target.value as 'ALL' | 'COMPLETED' | 'REFUNDED')} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">Tất cả trạng thái</option><option value="COMPLETED">Đã thu</option><option value="REFUNDED">Đã hoàn</option></select></FilterField><FilterField label="Field Manager"><select value={owner} onChange={(event) => setOwner(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">Tất cả Field Manager</option><option value="Field Manager">Field Manager</option></select></FilterField><FilterField label="Coach"><select value={coach} onChange={(event) => setCoach(event.target.value)} className="h-11 w-full rounded-xl border bg-background px-3 text-sm"><option value="ALL">Tất cả Coach</option>{coachOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></FilterField></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Tổng khoản thu" value={formatVND(gross)} icon={<Landmark className="h-5 w-5" />} tone="text-emerald-600" /><Metric label="Hoàn tiền" value={formatVND(refunded)} icon={<TrendingDown className="h-5 w-5" />} tone="text-rose-600" /><Metric label="Doanh thu ròng" value={formatVND(net)} icon={<TrendingUp className="h-5 w-5" />} tone="text-primary" /><Metric label="Giao dịch khớp lọc" value={filtered.length + ' giao dịch'} icon={<BarChart3 className="h-5 w-5" />} tone="text-sky-600" /></section>
    <section className="grid gap-6 xl:grid-cols-2"><ReportBars title="Doanh thu theo sân" rows={byCourt} color="bg-primary" /><ReportBars title="Nguồn doanh thu" rows={bySource} color="bg-sky-500" /></section>
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-black">Chi tiết giao dịch</h2><p className="mt-1 text-xs text-muted-foreground">Khoản hoàn hiển thị số âm; chỉ tổng hợp VietQR và tiền mặt tại quầy.</p></div><b className="text-sm text-primary">{filtered.length} dòng</b></div><div className="overflow-x-auto"><table className="min-w-[1020px] w-full text-left text-sm"><thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground"><tr>{['Ngày', 'Cụm sân / Sân', 'Nội dung', 'Loại thu', 'Thanh toán', 'FM / Coach', 'Trạng thái', 'Số tiền'].map((label) => <th key={label} className="px-4 py-3 font-black">{label}</th>)}</tr></thead><tbody>{filtered.length ? filtered.map((item) => <tr key={item.id} className="border-t border-border/70"><td className="px-4 py-3 font-semibold">{item.date}</td><td className="px-4 py-3"><p className="font-bold">{item.venueName}</p><p className="text-xs text-muted-foreground">{item.courtName}</p></td><td className="px-4 py-3 font-semibold">{item.label}</td><td className="px-4 py-3">{sourceLabel[item.source]}</td><td className="px-4 py-3">{item.paymentMethod === 'CASH' ? 'Tiền mặt' : 'VietQR'}</td><td className="px-4 py-3"><p>{item.owner}</p><p className="text-xs text-muted-foreground">{item.coach}</p></td><td className="px-4 py-3"><Badge variant="outline" className={item.status === 'REFUNDED' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}>{item.status === 'REFUNDED' ? 'Đã hoàn' : 'Đã thu'}</Badge></td><td className={'px-4 py-3 text-right font-black ' + (item.amount < 0 ? 'text-rose-600' : 'text-emerald-600')}>{formatVND(item.amount)}</td></tr>) : <tr><td colSpan={8} className="px-4 py-14 text-center text-muted-foreground">Không có giao dịch phù hợp với bộ lọc.</td></tr>}</tbody></table></div></section>
  </div>
}
function FilterField({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-muted-foreground">{label}</span>{children}</label> }
function ReportBars({ title, rows, color }: { title: string; rows: Array<{ label: string; value: number }>; color: string }) { const max = Math.max(...rows.map((item) => Math.abs(item.value)), 1); return <section className="rounded-3xl border bg-card p-5 shadow-sm"><h2 className="font-black">{title}</h2><div className="mt-6 space-y-5">{rows.length ? rows.map((item) => <div key={item.label}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-semibold">{item.label}</span><span className={'font-black ' + (item.value < 0 ? 'text-rose-600' : '')}>{formatVND(item.value)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className={'h-full rounded-full ' + (item.value < 0 ? 'bg-rose-500' : color)} style={{ width: Math.min(100, Math.round((Math.abs(item.value) / max) * 100)) + '%' }} /></div></div>) : <p className="py-10 text-center text-sm text-muted-foreground">Chưa có dữ liệu.</p>}</div></section> }
function Metric({ label, value, icon, tone }: { label: string; value: string; icon: ReactNode; tone: string }) { return <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className={'flex h-9 w-9 items-center justify-center rounded-xl bg-muted ' + tone}>{icon}</div><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className={'mt-1 text-xl font-extrabold ' + tone}>{value}</p></div> }
