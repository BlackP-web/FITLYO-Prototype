import { useMemo, useState } from 'react'
import {
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Percent,
  RotateCcw,
  Search,
  Send,
  Unlink,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachVenueAffiliation } from '@/types/pickleball'

const formatDateTime = (value?: string) => {
  if (!value) return 'Chưa có dữ liệu'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function CoachVenuesPage() {
  const {
    coachAccount,
    coachAffiliations,
    coachAffiliationNotifications,
    coachCourses,
    venues,
    requestVenueAffiliation,
    unlinkCoachAffiliation,
  } = useFitlyoStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [unlinkTarget, setUnlinkTarget] = useState<CoachVenueAffiliation | null>(null)

  const ownAffiliations = coachAffiliations.filter((item) => item.coachId === coachAccount.id)
  const affiliationByVenue = new Map(ownAffiliations.map((item) => [item.venueId, item]))
  const activeCount = ownAffiliations.filter((item) => item.status === 'ACTIVE').length
  const pendingCount = ownAffiliations.filter((item) => item.status === 'PENDING').length
  const notifications = useMemo(
    () => coachAffiliationNotifications.filter((item) => item.recipientId === coachAccount.id).slice(0, 3),
    [coachAccount.id, coachAffiliationNotifications],
  )
  const normalizedSearch = search.trim().toLowerCase()
  const visibleVenues = venues.filter((venue) => {
    const affiliation = affiliationByVenue.get(venue.id)
    const matchesSearch = `${venue.name} ${venue.area} ${venue.address}`.toLowerCase().includes(normalizedSearch)
    const matchesTab = activeTab === 'all'
      || (activeTab === 'active' && affiliation?.status === 'ACTIVE')
      || (activeTab === 'pending' && affiliation?.status === 'PENDING')
    return matchesSearch && matchesTab
  })

  const activeCoursesAtVenue = (affiliation: CoachVenueAffiliation) => coachCourses.filter((course) => (
    course.coachId === coachAccount.id
    && course.venue === affiliation.venueName
    && course.status !== 'COMPLETED'
  )).length || affiliation.activeCourses

  const confirmUnlink = () => {
    if (!unlinkTarget || !unlinkCoachAffiliation(unlinkTarget.id, 'coach')) return
    setUnlinkTarget(null)
    setActiveTab('all')
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge>SCR_COACH_04</Badge>
            <span className="text-xs font-semibold text-muted-foreground">Coach · Venue Affiliation</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Cụm sân liên kết</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Tìm đối tác, theo dõi yêu cầu và quản lý quyền mở lớp tại từng cụm sân.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-72">
          <div className="brand-card rounded-2xl p-3"><p className="text-2xl font-black text-emerald-600 dark:text-emerald-300">{activeCount}</p><p className="text-[11px] text-muted-foreground">Đang liên kết</p></div>
          <div className="brand-card rounded-2xl p-3"><p className="text-2xl font-black text-amber-600 dark:text-amber-300">{pendingCount}</p><p className="text-[11px] text-muted-foreground">Chờ duyệt</p></div>
        </div>
      </div>

      {notifications.length > 0 && (
        <section className="rounded-2xl border border-primary/15 bg-secondary/25 p-4 dark:bg-secondary/10">
          <div className="mb-3 flex items-center gap-2 text-sm font-black"><Bell className="h-4 w-4 text-primary" /> Thông báo liên kết</div>
          <div className="space-y-2">
            {notifications.map((notice) => (
              <div key={notice.id} className="flex flex-col justify-between gap-1 text-xs sm:flex-row sm:gap-4">
                <p className={notice.tone === 'error' ? 'text-destructive' : ''}>{notice.message}</p>
                <span className="shrink-0 text-muted-foreground">{formatDateTime(notice.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="brand-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Danh bạ đối tác FITLYO</p>
            <h2 className="mt-1 text-xl font-black">Cụm sân tại TP. Thủ Đức</h2>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên sân, địa chỉ hoặc khu vực..." className="h-10 pl-9" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5">
          <TabsList className="h-auto w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Tất cả sân ({venues.length})</TabsTrigger>
            <TabsTrigger value="active">Đã liên kết ({activeCount})</TabsTrigger>
            <TabsTrigger value="pending">Đang chờ ({pendingCount})</TabsTrigger>
          </TabsList>
          {['all', 'active', 'pending'].map((tab) => (
            <TabsContent value={tab} key={tab}>
              <div className="grid gap-4 xl:grid-cols-2">
                {visibleVenues.map((venue) => {
                  const affiliation = affiliationByVenue.get(venue.id)
                  const isActive = affiliation?.status === 'ACTIVE'
                  const isPending = affiliation?.status === 'PENDING'
                  const isRejected = affiliation?.status === 'REJECTED'
                  const isInactive = affiliation?.status === 'INACTIVE'

                  return (
                    <article key={venue.id} className="overflow-hidden rounded-3xl border border-border bg-background/45 transition hover:border-primary/30 hover:shadow-md">
                      <div className="grid sm:grid-cols-[168px_1fr]">
                        <div className="relative min-h-44 overflow-hidden">
                          <img src={venue.imageUrl} alt={venue.name} className="absolute inset-0 h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <Badge className="absolute bottom-3 left-3 border-white/20 bg-black/45 text-white">⭐ {venue.rating}</Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-black leading-snug">{venue.name}</h3>
                              <p className="mt-2 flex gap-1 text-[11px] leading-relaxed text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {venue.address}</p>
                            </div>
                            {isActive && <Badge variant="success"><CheckCircle2 /> Đã liên kết</Badge>}
                            {isPending && <Badge variant="warning"><Clock3 /> Đang chờ duyệt</Badge>}
                            {isRejected && <Badge variant="destructive"><XCircle /> Bị từ chối</Badge>}
                            {isInactive && <Badge variant="outline"><Unlink /> Đã hủy</Badge>}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" /> {venue.totalCourts} sân</span>
                            <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-emerald-600" /> {venue.availableSlotsToday} slot hôm nay</span>
                            <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5 text-amber-600" /> Thương lượng riêng</span>
                          </div>

                          {affiliation && (
                            <p className="mt-3 text-[11px] text-muted-foreground">
                              {isActive ? 'Có hiệu lực' : 'Gửi yêu cầu'}: {formatDateTime(affiliation.linkedAt ?? affiliation.requestedAt)}
                              {affiliation.linkType === 'FM_DIRECT_ADD' && ' · FM thêm trực tiếp'}
                            </p>
                          )}

                          {isRejected && affiliation?.rejectedReason && (
                            <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-2.5 text-[11px] text-destructive">Lý do: {affiliation.rejectedReason}</p>
                          )}

                          <div className="mt-4">
                            {!affiliation && (
                              <Button size="sm" onClick={() => requestVenueAffiliation(venue.id)} className="w-full"><Send /> Gửi yêu cầu liên kết</Button>
                            )}
                            {isPending && <Button size="sm" variant="outline" disabled className="w-full border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-300"><Clock3 /> Đang chờ duyệt</Button>}
                            {isActive && <Button size="sm" variant="outline" onClick={() => setUnlinkTarget(affiliation)} className="w-full"><Unlink /> Hủy liên kết</Button>}
                            {(isRejected || isInactive) && (
                              <Button size="sm" onClick={() => requestVenueAffiliation(venue.id)} className="w-full"><RotateCcw /> Gửi lại yêu cầu liên kết</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              {visibleVenues.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-semibold text-muted-foreground">Không tìm thấy cụm sân phù hợp.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <Dialog open={Boolean(unlinkTarget)} onOpenChange={(open) => { if (!open) setUnlinkTarget(null) }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Hủy liên kết với cụm sân?</DialogTitle>
            <DialogDescription>Sau khi hủy, bạn không thể tạo lớp mới tại sân này cho đến khi được liên kết lại.</DialogDescription>
          </DialogHeader>
          {unlinkTarget && activeCoursesAtVenue(unlinkTarget) > 0 && (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
              Bạn còn {activeCoursesAtVenue(unlinkTarget)} khóa chưa kết thúc tại sân. Các slot học viên đã thanh toán vẫn giữ nguyên và cần được hoàn thành.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkTarget(null)}>Giữ liên kết</Button>
            <Button variant="destructive" onClick={confirmUnlink}><Unlink /> Xác nhận hủy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
