import { useState } from 'react'
import { Building2, Check, ChevronDown, Clock3, Layers, MapPin, Plus, RotateCcw, Save, Tag, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  PRICING_TIME_OPTIONS, courtPricingKey, pricingTimeToMinutes, venuePricingKey, validateCourtPricing,
  type CourtPricing, type SpecialPriceRule,
} from '@/lib/courtPricing'
import { cn } from '@/lib/utils'
import { useCrossRoleStore } from '@/store/useCrossRoleStore'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import { usePlayerStore } from '@/store/usePlayerStore'

type PricingDraft = Pick<CourtPricing, 'basePricePerHour' | 'specialRules'>

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'
const newRuleId = () => `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
/** Gợi ý ban đầu khi cụm sân chưa có bảng giá: 100.000đ/giờ, 18:00–22:00 giá 120.000đ/giờ. */
const SUGGESTED_PRICING: PricingDraft = {
  basePricePerHour: 100000,
  specialRules: [{ id: 'rule-suggest-evening', label: 'Giờ cao điểm tối', startTime: '18:00', endTime: '22:00', pricePerHour: 120000 }],
}
const toDraft = (pricing: CourtPricing | PricingDraft): PricingDraft => ({
  basePricePerHour: pricing.basePricePerHour,
  specialRules: pricing.specialRules.map((rule) => ({ ...rule })),
})
const sameDraft = (left: PricingDraft, right: PricingDraft) => JSON.stringify(left) === JSON.stringify(right)

export function OwnerPricingPage() {
  const venues = usePlayerStore((state) => state.venues)
  const courtPricing = useCrossRoleStore((state) => state.courtPricing)
  const setCourtPricing = useCrossRoleStore((state) => state.setCourtPricing)
  const showToast = useFitlyoStore((state) => state.showToast)
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id ?? '')
  const venue = venues.find((item) => item.id === selectedVenueId) ?? venues[0]

  if (!venue) return <div className="py-24 text-center text-muted-foreground">Chưa có cụm sân nào để thiết lập giá.</div>

  const venueKey = venuePricingKey(venue.id)
  const venuePricing = courtPricing[venueKey]

  const save = (key: string, draft: PricingDraft, successText: string) => {
    const error = validateCourtPricing(draft)
    if (error) return showToast(error, 'error')
    const specialRules = [...draft.specialRules]
      .map((rule) => ({ ...rule, label: rule.label?.trim() || undefined }))
      .sort((a, b) => pricingTimeToMinutes(a.startTime) - pricingTimeToMinutes(b.startTime))
    setCourtPricing(key, { basePricePerHour: draft.basePricePerHour, specialRules, updatedAt: new Date().toISOString() })
    showToast(successText, 'success')
  }

  return <div className="space-y-6 pb-12">
    <header className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-end">
      <div>
        <div className="mb-1 flex items-center gap-2"><Badge variant="default">SCR_FM_07</Badge><span className="text-xs font-semibold text-muted-foreground">Field Manager · Bảng giá</span></div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Chỉnh sửa giá cả</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Đặt giá thuê theo giờ và giá đặc biệt cho các khung giờ cố định. Giá chung áp dụng cho mọi sân trong cụm; sân nào cần khác thì bật giá riêng cho sân đó.</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Chọn cụm sân" className="flex h-14 min-w-72 items-center gap-3 rounded-2xl border bg-card px-4 text-left shadow-sm transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Cụm sân</span>
              <span className="block truncate text-sm font-black">{venue.name}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-72 rounded-2xl p-1.5">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Chọn cụm sân</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {venues.map((item) => {
            const active = item.id === venue.id
            const configured = Boolean(courtPricing[venuePricingKey(item.id)])
            return <DropdownMenuItem key={item.id} onSelect={() => setSelectedVenueId(item.id)} className={cn('cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5', active && 'bg-primary/10')}>
              <MapPin className={cn('mt-0.5 h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
              <span className="min-w-0 flex-1">
                <span className={cn('block truncate text-sm font-bold', active && 'text-primary')}>{item.name}</span>
                <span className="block text-[11px] text-muted-foreground">{item.courts.length} sân · {configured ? 'Đã thiết lập giá' : 'Chưa thiết lập giá'}</span>
              </span>
              {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>

    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary"><Layers className="h-4 w-4" />Giá chung cụm sân</p>
          <h2 className="mt-1 text-xl font-black">{venue.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Áp dụng cho tất cả {venue.courts.length} sân, trừ sân đang dùng giá riêng.</p>
        </div>
        {venuePricing
          ? <Badge variant="outline" className="border-emerald-400/50 text-emerald-600 dark:text-emerald-300">Đã thiết lập · {new Date(venuePricing.updatedAt).toLocaleString('vi-VN')}</Badge>
          : <Badge variant="outline" className="border-amber-400/60 text-amber-700 dark:text-amber-300">Chưa thiết lập · đang dùng giá gốc của slot</Badge>}
      </div>
      <PricingEditor
        key={venueKey + (venuePricing?.updatedAt ?? '')}
        initial={venuePricing ? toDraft(venuePricing) : toDraft(SUGGESTED_PRICING)}
        saved={venuePricing ? toDraft(venuePricing) : undefined}
        saveLabel="Lưu giá cụm sân"
        onSave={(draft) => save(venueKey, draft, 'Đã lưu bảng giá chung cho ' + venue.name + '.')}
      />
    </section>

    <section className="space-y-4">
      <div><h2 className="text-lg font-black">Giá theo từng sân</h2><p className="text-sm text-muted-foreground">Mặc định mỗi sân dùng giá chung của cụm. Bật “Giá riêng” để đặt giá khác cho sân đó.</p></div>
      <div className="grid gap-4 xl:grid-cols-2">
        {venue.courts.map((court) => {
          const key = courtPricingKey(venue.id, court.id)
          const own = courtPricing[key]
          return <CourtPricingCard
            key={key + (own?.updatedAt ?? '')}
            courtName={court.name}
            courtType={court.type}
            own={own}
            venuePricing={venuePricing}
            onEnableOwn={() => save(key, toDraft(venuePricing ?? SUGGESTED_PRICING), `${court.name} đã chuyển sang giá riêng. Bạn có thể chỉnh và lưu lại.`)}
            onUseVenue={() => { setCourtPricing(key, null); showToast(`${court.name} quay về dùng giá chung của cụm sân.`, 'success') }}
            onSave={(draft) => save(key, draft, `Đã lưu giá riêng cho ${court.name}.`)}
          />
        })}
      </div>
    </section>
  </div>
}

function CourtPricingCard({ courtName, courtType, own, venuePricing, onEnableOwn, onUseVenue, onSave }: {
  courtName: string
  courtType: string
  own?: CourtPricing
  venuePricing?: CourtPricing
  onEnableOwn: () => void
  onUseVenue: () => void
  onSave: (draft: PricingDraft) => void
}) {
  const effective = own ?? venuePricing
  return <article className={cn('rounded-3xl border bg-card p-5 shadow-sm', own && 'border-primary/40 ring-1 ring-primary/15')}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="text-lg font-black">{courtName}</h3><p className="text-xs text-muted-foreground">{courtType}</p></div>
      <div className="flex rounded-xl border bg-muted/40 p-1 text-xs font-bold" role="radiogroup" aria-label={`Cách tính giá cho ${courtName}`}>
        <button type="button" role="radio" aria-checked={!own} onClick={() => own && onUseVenue()} className={cn('rounded-lg px-3 py-1.5 transition', !own ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Theo giá cụm</button>
        <button type="button" role="radio" aria-checked={Boolean(own)} onClick={() => !own && onEnableOwn()} className={cn('rounded-lg px-3 py-1.5 transition', own ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Giá riêng</button>
      </div>
    </div>
    {own
      ? <PricingEditor initial={toDraft(own)} saved={toDraft(own)} saveLabel={`Lưu giá ${courtName}`} onSave={onSave} compact />
      : effective
        ? <div className="mt-4"><PricingSummary pricing={effective} /></div>
        : <p className="mt-4 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">Cụm sân chưa có giá chung. Sân này đang dùng giá gốc của từng slot. Hãy lưu giá cụm sân ở trên hoặc bật “Giá riêng”.</p>}
  </article>
}

function PricingEditor({ initial, saved, saveLabel, onSave, compact = false }: {
  initial: PricingDraft
  saved?: PricingDraft
  saveLabel: string
  onSave: (draft: PricingDraft) => void
  compact?: boolean
}) {
  const [draft, setDraft] = useState<PricingDraft>(initial)
  const error = validateCourtPricing(draft)
  const dirty = !saved || !sameDraft(draft, saved)
  const updateRule = (id: string, changes: Partial<SpecialPriceRule>) => setDraft((current) => ({
    ...current,
    specialRules: current.specialRules.map((rule) => rule.id === id ? { ...rule, ...changes } : rule),
  }))
  const addRule = () => setDraft((current) => ({
    ...current,
    specialRules: [...current.specialRules, { id: newRuleId(), label: '', startTime: '18:00', endTime: '22:00', pricePerHour: Math.round(current.basePricePerHour * 1.2 / 1000) * 1000 || 120000 }],
  }))

  return <div className="mt-5 space-y-4">
    <div className={cn('grid gap-4', !compact && 'lg:grid-cols-[280px_1fr]')}>
      <label className="block rounded-2xl border bg-background/50 p-4">
        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-muted-foreground"><Tag className="h-3.5 w-3.5" />Giá mặc định / 1 giờ</span>
        <div className="mt-2 flex items-center gap-2">
          <MoneyInput value={draft.basePricePerHour} onChange={(value) => setDraft((current) => ({ ...current, basePricePerHour: value }))} ariaLabel="Giá mặc định mỗi giờ" />
          <span className="shrink-0 text-sm font-bold text-muted-foreground">đ/giờ</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Áp dụng cho mọi giờ không thuộc khung đặc biệt.</p>
      </label>

      <div className="rounded-2xl border bg-background/50 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />Khung giờ giá đặc biệt</span>
          <Button type="button" variant="outline" size="sm" onClick={addRule}><Plus />Thêm khung giờ</Button>
        </div>
        {!draft.specialRules.length && <p className="mt-3 text-sm text-muted-foreground">Chưa có khung giờ đặc biệt, mọi giờ đều tính giá mặc định.</p>}
        <div className="mt-3 space-y-2">
          {draft.specialRules.map((rule) => <div key={rule.id} className="grid items-center gap-2 rounded-xl border bg-card p-2.5 sm:grid-cols-[minmax(0,1fr)_auto_auto_minmax(0,150px)_auto]">
            <input value={rule.label ?? ''} onChange={(event) => updateRule(rule.id, { label: event.target.value })} placeholder="Tên khung (vd: Cao điểm tối)" className="h-10 min-w-0 rounded-lg border bg-background px-3 text-sm" aria-label="Tên khung giờ" />
            <TimeSelect value={rule.startTime} onChange={(value) => updateRule(rule.id, { startTime: value })} ariaLabel="Giờ bắt đầu" options={PRICING_TIME_OPTIONS.slice(0, -1)} />
            <TimeSelect value={rule.endTime} onChange={(value) => updateRule(rule.id, { endTime: value })} ariaLabel="Giờ kết thúc" options={PRICING_TIME_OPTIONS.slice(1)} prefix="→" />
            <div className="flex items-center gap-1"><MoneyInput value={rule.pricePerHour} onChange={(value) => updateRule(rule.id, { pricePerHour: value })} ariaLabel="Giá mỗi giờ của khung đặc biệt" /><span className="shrink-0 text-xs font-bold text-muted-foreground">đ/h</span></div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setDraft((current) => ({ ...current, specialRules: current.specialRules.filter((item) => item.id !== rule.id) }))} aria-label="Xoá khung giờ" className="text-rose-600 hover:bg-rose-500/10"><Trash2 /></Button>
          </div>)}
        </div>
      </div>
    </div>

    {error && <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>}

    <div className="flex flex-wrap items-center justify-end gap-2">
      {saved && dirty && <Button type="button" variant="ghost" onClick={() => setDraft(saved)}><RotateCcw />Hoàn tác</Button>}
      <Button type="button" disabled={Boolean(error) || !dirty} onClick={() => onSave(draft)}><Save />{saveLabel}</Button>
    </div>
  </div>
}

function PricingSummary({ pricing }: { pricing: PricingDraft }) {
  return <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
    <span className="rounded-full bg-muted px-3 py-1">Giá mặc định: {formatVND(pricing.basePricePerHour)}/giờ</span>
    {pricing.specialRules.map((rule) => <span key={rule.id} className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-800 dark:text-amber-200">{rule.label ? rule.label + ' · ' : ''}{rule.startTime}–{rule.endTime}: {formatVND(rule.pricePerHour)}/giờ</span>)}
  </div>
}

function MoneyInput({ value, onChange, ariaLabel }: { value: number; onChange: (value: number) => void; ariaLabel: string }) {
  return <input
    inputMode="numeric"
    value={value ? new Intl.NumberFormat('vi-VN').format(value) : ''}
    onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, '')) || 0)}
    placeholder="0"
    aria-label={ariaLabel}
    className="h-10 w-full min-w-0 rounded-lg border bg-background px-3 text-right text-sm font-bold"
  />
}

function TimeSelect({ value, onChange, options, ariaLabel, prefix }: { value: string; onChange: (value: string) => void; options: string[]; ariaLabel: string; prefix?: string }) {
  return <label className="flex items-center gap-1 text-sm">
    {prefix && <span className="text-muted-foreground">{prefix}</span>}
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={ariaLabel} className="h-10 rounded-lg border bg-background px-2 text-sm font-semibold text-foreground [&>option]:bg-card [&>option]:text-foreground">
      {options.map((time) => <option key={time} value={time}>{time}</option>)}
    </select>
  </label>
}
