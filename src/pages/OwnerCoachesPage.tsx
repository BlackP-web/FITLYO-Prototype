import { useMemo, useState } from 'react'
import {
  Award,
  Bell,
  CheckCircle2,
  Clock3,
  Link2,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Unlink,
  UserCheck,
  UserRoundX,
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
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { CoachItem, CoachVenueAffiliation } from '@/types/pickleball'

const managedVenueId = 'ven_1'

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

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 7 ? `${digits.slice(0, 4)}***${digits.slice(-3)}` : phone
}

export function OwnerCoachesPage() {
  const {
    coaches,
    coachAffiliations,
    coachAffiliationNotifications,
    venues,
    lookupCoachForAffiliation,
    directAddCoachAffiliation,
    approveCoachAffiliation,
    rejectCoachAffiliation,
    unlinkCoachAffiliation,
  } = useFitlyoStore()
  const [activeTab, setActiveTab] = useState('active')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [lookupInput, setLookupInput] = useState('')
  const [lookupResult, setLookupResult] = useState<{ success: boolean; message: string; coach?: CoachItem } | null>(null)
  const [rejectTarget, setRejectTarget] = useState<CoachVenueAffiliation | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [unlinkTarget, setUnlinkTarget] = useState<CoachVenueAffiliation | null>(null)

  const venue = venues.find((item) => item.id === managedVenueId)
  const venueAffiliations = coachAffiliations.filter((item) => item.venueId === managedVenueId)
  const activeAffiliations = venueAffiliations.filter((item) => item.status === 'ACTIVE')
  const pendingAffiliations = venueAffiliations.filter((item) => item.status === 'PENDING')
  const historyAffiliations = venueAffiliations.filter((item) => item.status === 'REJECTED' || item.status === 'INACTIVE')
  const notifications = useMemo(
    () => coachAffiliationNotifications.filter((item) => item.recipientId === `fm:${managedVenueId}`).slice(0, 3),
    [coachAffiliationNotifications],
  )

  const resetLookup = () => {
    setLookupInput('')
    setLookupResult(null)
  }

  const handleLookup = (event: React.FormEvent) => {
    event.preventDefault()
    setLookupResult(lookupCoachForAffiliation(managedVenueId, lookupInput))
  }

  const handleDirectAdd = () => {
    const result = directAddCoachAffiliation(managedVenueId, lookupInput)
    if (!result.success) {
      setLookupResult({ success: false, message: result.message })
      return
    }
    setIsAddOpen(false)
    resetLookup()
    setActiveTab('active')
  }

  const confirmReject = () => {
    if (!rejectTarget || !rejectCoachAffiliation(rejectTarget.id, rejectReason)) return
    setRejectTarget(null)
    setRejectReason('')
  }

  const confirmUnlink = () => {
    if (!unlinkTarget || !unlinkCoachAffiliation(unlinkTarget.id, 'fm')) return
    setUnlinkTarget(null)
    setActiveTab('history')
  }

  const renderCoachCard = (affiliation: CoachVenueAffiliation) => {
    const coach = coaches.find((item) => item.id === affiliation.coachId)
    if (!coach) return null
    const isSuspended = coach.accountStatus === 'SUSPENDED'

    return (
      <article
        key={affiliation.id}
        className={`brand-card rounded-3xl p-5 transition hover:border-primary/25 ${isSuspended ? 'grayscale' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img src={coach.avatarUrl} alt={coach.name} className="h-14 w-14 rounded-2xl object-cover" />
            {coach.isCertified && (
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-emerald-500 text-white">
                <CheckCircle2 className="h-3 w-3" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-black">{coach.name}</h2>
                <p className="mt-1 text-xs font-semibold text-primary">UserID: {coach.userId}</p>
              </div>
              {affiliation.status === 'ACTIVE' && <Badge variant="success">Đang hoạt động</Badge>}
              {affiliation.status === 'PENDING' && <Badge variant="warning">Chờ duyệt</Badge>}
              {affiliation.status === 'REJECTED' && <Badge variant="destructive">Đã từ chối</Badge>}
              {affiliation.status === 'INACTIVE' && <Badge variant="outline">Đã hủy liên kết</Badge>}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">SĐT: {maskPhone(coach.phone)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/55 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Năng lực xác thực</p>
            <p className="mt-1 text-xs font-bold">DUPR {coach.duprRating} · {coach.experienceYears} năm</p>
          </div>
          <div className="rounded-xl bg-muted/55 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Chứng chỉ</p>
            <p className="mt-1 line-clamp-1 text-xs font-bold">{coach.certTitle}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="text-[11px] text-muted-foreground">
            <p>{affiliation.linkType === 'FM_DIRECT_ADD' ? 'FM thêm trực tiếp' : 'Coach gửi yêu cầu'}</p>
            <p className="mt-0.5">{formatDateTime(affiliation.linkedAt ?? affiliation.requestedAt)}</p>
          </div>
          <div className="flex gap-2">
            {affiliation.status === 'PENDING' && (
              <>
                <Button size="sm" variant="outline" onClick={() => setRejectTarget(affiliation)}>
                  <UserRoundX /> Từ chối
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (approveCoachAffiliation(affiliation.id)) setActiveTab('active')
                  }}
                >
                  <UserCheck /> Chấp thuận
                </Button>
              </>
            )}
            {affiliation.status === 'ACTIVE' && (
              <Button size="sm" variant="outline" onClick={() => setUnlinkTarget(affiliation)}>
                <Unlink /> Hủy liên kết
              </Button>
            )}
          </div>
        </div>

        {affiliation.status === 'REJECTED' && affiliation.rejectedReason && (
          <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            Lý do: {affiliation.rejectedReason}
          </p>
        )}
        {isSuspended && (
          <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Tài khoản Coach đang bị tạm khóa; quyền mở lớp mới đã bị vô hiệu hóa.
          </p>
        )}
      </article>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 xl:flex-row xl:items-start">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge>SCR_FM_05</Badge>
            <span className="text-xs font-semibold text-muted-foreground">Field Manager · Coach Affiliation</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Huấn luyện viên liên kết</h1>
          <p className="mt-1 text-sm text-muted-foreground">{venue?.name ?? 'Cụm sân đang quản lý'} · Duyệt và quản lý quyền mở lớp tại sân.</p>
        </div>
        <Button
          className="h-11"
          onClick={() => {
            resetLookup()
            setIsAddOpen(true)
          }}
        >
          <Plus /> Thêm Coach qua UserID
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Đang liên kết', value: activeAffiliations.length, icon: Link2, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
          { label: 'Chờ duyệt', value: pendingAffiliations.length, icon: Clock3, tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
          { label: 'Đã xác thực', value: venueAffiliations.filter((item) => coaches.find((coach) => coach.id === item.coachId)?.isCertified).length, icon: ShieldCheck, tone: 'bg-secondary/60 text-primary dark:bg-secondary/15' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="brand-card flex items-center gap-3 rounded-2xl p-4">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${item.tone}`}><Icon className="h-4 w-4" /></div>
              <div><p className="text-2xl font-black">{item.value}</p><p className="text-xs text-muted-foreground">{item.label}</p></div>
            </div>
          )
        })}
      </section>

      {notifications.length > 0 && (
        <section className="rounded-2xl border border-primary/15 bg-secondary/25 p-4 dark:bg-secondary/10">
          <div className="mb-3 flex items-center gap-2 text-sm font-black"><Bell className="h-4 w-4 text-primary" /> Cập nhật liên kết mới</div>
          <div className="space-y-2">
            {notifications.map((notice) => (
              <div key={notice.id} className="flex items-start justify-between gap-4 text-xs">
                <p>{notice.message}</p><span className="shrink-0 text-muted-foreground">{formatDateTime(notice.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="active">Đang liên kết ({activeAffiliations.length})</TabsTrigger>
          <TabsTrigger value="pending">Yêu cầu chờ duyệt ({pendingAffiliations.length})</TabsTrigger>
          <TabsTrigger value="history">Lịch sử ({historyAffiliations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="grid gap-4 lg:grid-cols-2">{activeAffiliations.map(renderCoachCard)}</div>
          {activeAffiliations.length === 0 && <EmptyList text="Chưa có Coach đang liên kết với cụm sân." />}
        </TabsContent>
        <TabsContent value="pending">
          <div className="grid gap-4 lg:grid-cols-2">{pendingAffiliations.map(renderCoachCard)}</div>
          {pendingAffiliations.length === 0 && <EmptyList text="Không có yêu cầu nào đang chờ duyệt." />}
        </TabsContent>
        <TabsContent value="history">
          <div className="grid gap-4 lg:grid-cols-2">{historyAffiliations.map(renderCoachCard)}</div>
          {historyAffiliations.length === 0 && <EmptyList text="Chưa có lịch sử từ chối hoặc hủy liên kết." />}
        </TabsContent>
      </Tabs>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
        <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        Chỉ Coach có trạng thái Đang liên kết mới được chọn cụm sân này khi tạo lớp mới. Hủy liên kết không làm mất các buổi học đã đặt cọc.
      </div>

      <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetLookup() }}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Thêm huấn luyện viên liên kết trực tiếp</DialogTitle>
            <DialogDescription>Kiểm tra đúng hồ sơ Coach trước khi cấp quyền mở lớp tại {venue?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coach-user-id">UserID hoặc mã HLV</Label>
              <div className="flex gap-2">
                <Input
                  id="coach-user-id"
                  value={lookupInput}
                  onChange={(event) => { setLookupInput(event.target.value); setLookupResult(null) }}
                  placeholder="Ví dụ: COACH_VALID_99"
                  autoFocus
                />
                <Button type="submit" variant="outline"><Search /> Kiểm tra</Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Hệ thống tự bỏ khoảng trắng và không phân biệt chữ hoa/thường.</p>
            </div>
          </form>

          {lookupResult && !lookupResult.success && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
              {lookupResult.message}
            </div>
          )}

          {lookupResult?.success && lookupResult.coach && (
            <div className="rounded-2xl border border-primary/20 bg-secondary/25 p-4 dark:bg-secondary/10">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wide text-primary">Hồ sơ Coach tìm thấy</p>
                <Badge variant="success"><ShieldCheck /> Admin verified</Badge>
              </div>
              <div className="flex items-start gap-3">
                <img src={lookupResult.coach.avatarUrl} alt={lookupResult.coach.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <h3 className="font-black">{lookupResult.coach.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-primary">{lookupResult.coach.userId}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{lookupResult.coach.certTitle}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> DUPR {lookupResult.coach.duprRating}</span>
                    <span>· {lookupResult.coach.experienceYears} năm kinh nghiệm</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-background/70 p-3 text-xs text-muted-foreground">{lookupResult.message}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy bỏ</Button>
            <Button disabled={!lookupResult?.success || !lookupResult.coach} onClick={handleDirectAdd}>
              <Link2 /> Xác nhận liên kết ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rejectTarget)} onOpenChange={(open) => { if (!open) { setRejectTarget(null); setRejectReason('') } }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu liên kết</DialogTitle>
            <DialogDescription>Lý do sẽ được gửi cho Coach để họ có thể điều chỉnh trước khi gửi lại.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Lý do từ chối</Label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Ví dụ: Cần bổ sung lịch rảnh và chứng chỉ còn hiệu lực..."
              className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Quay lại</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={confirmReject}><UserRoundX /> Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(unlinkTarget)} onOpenChange={(open) => { if (!open) setUnlinkTarget(null) }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Hủy liên kết Coach?</DialogTitle>
            <DialogDescription>Coach sẽ không thể tạo lớp mới tại cụm sân sau thao tác này.</DialogDescription>
          </DialogHeader>
          {unlinkTarget && unlinkTarget.activeCourses > 0 && (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
              Coach còn {unlinkTarget.activeCourses} khóa chưa kết thúc tại sân. Các buổi đã được học viên đặt cọc vẫn giữ nguyên để hoàn thành nghĩa vụ.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkTarget(null)}>Giữ liên kết</Button>
            <Button variant="destructive" onClick={confirmUnlink}><Unlink /> Hủy liên kết</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyList({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-10 text-center">
      <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/45" />
      <p className="mt-3 text-sm font-semibold text-muted-foreground">{text}</p>
    </div>
  )
}
