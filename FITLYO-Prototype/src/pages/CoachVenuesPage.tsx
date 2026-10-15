import { useState } from 'react'
import { Building2, CalendarClock, CheckCircle2, Clock3, MapPin, Percent, Search, Send, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export function CoachVenuesPage() {
  const { coachAccount, coachAffiliations, venues, requestVenueAffiliation } = useFitlyoStore()
  const [search, setSearch] = useState('')
  const ownAffiliations = coachAffiliations.filter((item) => item.coachId === coachAccount.id)
  const linkedVenueIds = new Set(ownAffiliations.map((item) => item.venueId))
  const availableVenues = venues.filter(
    (venue) => !linkedVenueIds.has(venue.id) && `${venue.name} ${venue.area}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Hệ sinh thái sân bãi</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Cụm sân liên kết</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Theo dõi các đối tác đã duyệt và gửi yêu cầu hợp tác đến cụm sân mới.</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Quan hệ đối tác của tôi</h2><Badge variant="outline">{ownAffiliations.length} cụm sân</Badge></div>
        <div className="grid gap-4 xl:grid-cols-2">
          {ownAffiliations.map((affiliation) => (
            <article key={affiliation.id} className="brand-card rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${affiliation.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}><Building2 className="h-5 w-5" /></div>
                  <div><h3 className="font-black">{affiliation.venueName}</h3><p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {affiliation.address}</p></div>
                </div>
                <Badge className={affiliation.status === 'APPROVED' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
                  {affiliation.status === 'APPROVED' ? <><CheckCircle2 /> Đã duyệt</> : <><Clock3 /> Chờ duyệt</>}
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/70 p-3"><p className="text-lg font-black">{affiliation.activeCourses}</p><p className="text-[10px] text-muted-foreground">Khóa đang mở</p></div>
                <div className="rounded-xl bg-muted/70 p-3"><p className="text-lg font-black">{affiliation.availableSlots.length}</p><p className="text-[10px] text-muted-foreground">Slot khả dụng</p></div>
                <div className="rounded-xl bg-muted/70 p-3"><p className="text-lg font-black">{affiliation.discountPercent ?? '—'}{affiliation.discountPercent ? '%' : ''}</p><p className="text-[10px] text-muted-foreground">Ưu đãi thuê sân</p></div>
              </div>

              <div className="mt-4 flex flex-col justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-1.5">
                  {affiliation.availableSlots.map((slot) => <span key={slot} className="rounded-lg bg-secondary/65 px-2 py-1 text-[10px] font-bold text-primary">Slot {slot}</span>)}
                </div>
                <p className="text-[11px] text-muted-foreground">Gửi yêu cầu: {affiliation.requestedAt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Khám phá đối tác</p><h2 className="mt-1 text-xl font-black">Tìm cụm sân mới</h2></div>
          <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên sân hoặc khu vực..." className="h-10 pl-9" /></div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {availableVenues.map((venue) => (
            <article key={venue.id} className="overflow-hidden rounded-2xl border border-border bg-background/40 transition hover:border-primary/30">
              <div className="grid sm:grid-cols-[150px_1fr]">
                <img src={venue.imageUrl} alt={venue.name} className="h-36 w-full object-cover sm:h-full" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-black">{venue.name}</h3><Badge variant="outline">⭐ {venue.rating}</Badge></div>
                  <p className="mt-2 flex gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" /> {venue.address}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" /> {venue.totalCourts} sân</span>
                    <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-emerald-600" /> {venue.availableSlotsToday} slot hôm nay</span>
                    <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5 text-amber-600" /> Thương lượng riêng</span>
                  </div>
                  <Button size="sm" onClick={() => requestVenueAffiliation(venue.id)} className="mt-4 w-full"><Send /> Gửi yêu cầu liên kết</Button>
                </div>
              </div>
            </article>
          ))}
          {availableVenues.length === 0 && <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Không tìm thấy cụm sân phù hợp.</div>}
        </div>
      </section>
    </div>
  )
}
