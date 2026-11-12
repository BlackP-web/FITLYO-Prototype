import { useState } from 'react'
import { AlertTriangle, Building2, Check, CheckCircle2, ChevronDown, MapPin, PackageCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { VENUE_PACKAGES, addOneMonth, getVenuePackage, packageForCourtCount, type VenuePackage } from '@/lib/venuePackages'
import { cn } from '@/lib/utils'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'
const formatDate = (value: string | Date) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function OwnerPackagesPage() {
  const venues = usePlayerStore((state) => state.venues)
  const subscriptions = useCrossRoleStore((state) => state.venueSubscriptions)
  const setVenueSubscription = useCrossRoleStore((state) => state.setVenueSubscription)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id ?? '')
  const [pending, setPending] = useState<VenuePackage | null>(null)
  const venue = venues.find((item) => item.id === selectedVenueId) ?? venues[0]

  if (!venue) return <div className="py-24 text-center text-muted-foreground">Chưa có cụm sân nào để đăng kí gói.</div>

  const courtCount = venue.courts.length
  const suitable = packageForCourtCount(courtCount)
  const current = subscriptions[venue.id]
  const currentPackage = current ? getVenuePackage(current.tier) : undefined
  const needsSwitch = Boolean(current && suitable && current.tier !== suitable.tier)

  const confirmRegister = () => {
    if (!pending) return
    // Chặn lại phía logic: chỉ đăng kí đúng gói theo số sân hiện tại.
    if (!suitable || pending.tier !== suitable.tier) {
      setPending(null)
      return showToast(`Cụm sân có ${courtCount} sân nên chỉ đăng kí được ${suitable ? `gói ${suitable.name}` : 'khi có từ 1 đến 15 sân'}.`, 'error')
    }
    const now = new Date()
    setVenueSubscription({
      venueId: venue.id,
      venueName: venue.name,
      tier: pending.tier,
      pricePerMonth: pending.pricePerMonth,
      courtCount,
      registeredAt: now.toISOString(),
      expiresAt: addOneMonth(now).toISOString(),
    })
    showToast(`${needsSwitch ? 'Đã chuyển' : 'Đã đăng kí'} gói ${pending.name} cho ${venue.name}.`, 'success')
    setPending(null)
  }

  return <div className="space-y-6 pb-12">
    <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-end">
      <div>
        <div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_08</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · Gói dịch vụ</span></div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Đăng kí gói</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Mỗi gói áp dụng cho 1 cụm sân và tính theo tháng. Mỗi cụm sân chỉ đăng kí 1 gói, phù hợp với số sân mà cụm đang có.</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Chọn cụm sân" className="flex h-14 min-w-72 items-center gap-3 rounded-2xl border bg-card px-4 text-left shadow-sm transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Cụm sân</span><span className="block truncate text-sm font-black">{venue.name}</span></span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-72 rounded-2xl p-1.5">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Chọn cụm sân</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {venues.map((item) => {
            const active = item.id === venue.id
            const sub = subscriptions[item.id]
            return <DropdownMenuItem key={item.id} onSelect={() => setSelectedVenueId(item.id)} className={cn('cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5', active && 'bg-primary/10')}>
              <MapPin className={cn('mt-0.5 h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
              <span className="min-w-0 flex-1"><span className={cn('block truncate text-sm font-bold', active && 'text-primary')}>{item.name}</span><span className="block text-[11px] text-muted-foreground">{item.courts.length} sân · {sub ? `Gói ${getVenuePackage(sub.tier).name}` : 'Chưa đăng kí gói'}</span></span>
              {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>

    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Cụm sân đang chọn</p><h2 className="mt-1 text-xl font-black">{venue.name}</h2><p className="mt-1 text-sm text-muted-foreground">Hiện có <b className="text-foreground">{courtCount} sân</b>{suitable ? <> · phù hợp với <b className="text-foreground">gói {suitable.name}</b> ({suitable.minCourts}–{suitable.maxCourts} sân)</> : null}</p></div>
        {current && currentPackage
          ? <Badge variant="outline" className="border-emerald-400/50 px-3 py-1 text-emerald-600 dark:text-emerald-300"><PackageCheck className="mr-1 h-3.5 w-3.5" />Đang dùng gói {currentPackage.name} · hết hạn {formatDate(current.expiresAt)}</Badge>
          : <Badge variant="outline" className="border-amber-400/60 px-3 py-1 text-amber-700 dark:text-amber-300">Chưa đăng kí gói</Badge>}
      </div>
      {!suitable && <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />Cụm sân có {courtCount} sân nên chưa có gói phù hợp (các gói áp dụng cho cụm từ 1 đến 15 sân). Vui lòng liên hệ FITLYO để được tư vấn.</p>}
      {needsSwitch && suitable && currentPackage && <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />Số sân đã thay đổi ({current?.courtCount} → {courtCount} sân). Gói {currentPackage.name} không còn phù hợp, vui lòng chuyển sang gói {suitable.name}.</p>}
    </section>

    <section className="grid gap-4 lg:grid-cols-3">
      {VENUE_PACKAGES.map((item) => {
        const isSuitable = suitable?.tier === item.tier
        const isCurrent = current?.tier === item.tier
        return <article key={item.tier} className={cn('flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition', isSuitable ? 'border-primary/50 ring-2 ring-primary/15' : 'opacity-60')}>
          <div className="flex items-start justify-between gap-2">
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Gói</p><h3 className="text-2xl font-black">{item.name}</h3></div>
            {isCurrent ? <Badge className="bg-emerald-600 text-white">Đang sử dụng</Badge> : isSuitable ? <Badge>Phù hợp</Badge> : null}
          </div>
          <p className="mt-4"><span className="text-3xl font-black text-primary">{formatVND(item.pricePerMonth)}</span><span className="text-sm font-semibold text-muted-foreground"> / cụm sân / tháng</span></p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Áp dụng cho cụm có <b>{item.minCourts}–{item.maxCourts} sân</b></li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Áp dụng cho 1 cụm sân</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Chu kỳ 1 tháng</li>
          </ul>
          <div className="mt-auto pt-6">
            {isCurrent
              ? <Button disabled className="w-full">Gói hiện tại</Button>
              : isSuitable
                ? <Button className="w-full" onClick={() => setPending(item)}>{needsSwitch ? 'Chuyển sang gói này' : 'Đăng kí gói'}</Button>
                : <><Button disabled variant="outline" className="w-full">Không phù hợp</Button><p className="mt-2 text-center text-xs text-muted-foreground">Cụm sân có {courtCount} sân, gói này dành cho {item.minCourts}–{item.maxCourts} sân.</p></>}
          </div>
        </article>
      })}
    </section>

    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="border-b p-5"><h2 className="font-black">Gói theo cụm sân</h2><p className="mt-1 text-xs text-muted-foreground">Mỗi cụm sân chỉ có 1 gói, phù hợp với số sân hiện có.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground"><tr>{['Cụm sân', 'Số sân', 'Gói phù hợp', 'Gói đang dùng', 'Hết hạn', 'Trạng thái'].map((label) => <th key={label} className="px-4 py-3 font-black">{label}</th>)}</tr></thead>
        <tbody>{venues.map((item) => {
          const fit = packageForCourtCount(item.courts.length)
          const sub = subscriptions[item.id]
          const status = !sub ? { text: 'Chưa đăng kí', tone: 'text-amber-700 dark:text-amber-300' } : fit && sub.tier === fit.tier ? { text: 'Đang hoạt động', tone: 'text-emerald-600 dark:text-emerald-300' } : { text: 'Cần chuyển gói', tone: 'text-rose-600 dark:text-rose-300' }
          return <tr key={item.id} className={cn('cursor-pointer border-t border-border/70 hover:bg-muted/30', item.id === venue.id && 'bg-primary/5')} onClick={() => setSelectedVenueId(item.id)}>
            <td className="px-4 py-3 font-bold">{item.name}</td>
            <td className="px-4 py-3">{item.courts.length}</td>
            <td className="px-4 py-3">{fit ? `${fit.name} · ${formatVND(fit.pricePerMonth)}` : 'Không có gói phù hợp'}</td>
            <td className="px-4 py-3">{sub ? getVenuePackage(sub.tier).name : '—'}</td>
            <td className="px-4 py-3">{sub ? formatDate(sub.expiresAt) : '—'}</td>
            <td className={cn('px-4 py-3 font-bold', status.tone)}>{status.text}</td>
          </tr>
        })}</tbody>
      </table></div>
    </section>

    {pending && <div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/55 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="package-confirm-title" className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-primary">{needsSwitch ? 'Chuyển gói' : 'Đăng kí gói'}</p><h2 id="package-confirm-title" className="mt-1 text-xl font-black">Gói {pending.name}</h2></div><Button variant="ghost" size="icon" onClick={() => setPending(null)} aria-label="Đóng"><X /></Button></div>
      <dl className="mt-5 divide-y rounded-2xl border bg-background/40 text-sm">
        {([
          ['Cụm sân', venue.name],
          ['Số sân', `${courtCount} sân`],
          ['Phí gói', `${formatVND(pending.pricePerMonth)} / tháng`],
          ['Chu kỳ', `${formatDate(new Date())} – ${formatDate(addOneMonth(new Date()))}`],
          ...(needsSwitch && currentPackage ? [['Gói hiện tại', `${currentPackage.name} (sẽ được thay thế)`]] : []),
        ] as Array<[string, string]>).map(([label, value]) => <div key={label} className="flex justify-between gap-4 px-4 py-2.5"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-bold">{value}</dd></div>)}
      </dl>
      <div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setPending(null)}>Hủy</Button><Button onClick={confirmRegister}><CheckCircle2 />Xác nhận</Button></div>
    </section></div>}
  </div>
}
