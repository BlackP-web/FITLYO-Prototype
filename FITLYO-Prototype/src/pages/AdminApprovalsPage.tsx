import React, { useState } from 'react'
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  GraduationCap,
  X,
  Phone,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFitlyoStore } from '@/store/useFitlyoStore'

export const AdminApprovalsPage: React.FC = () => {
  const {
    auditApplications,
    selectedAuditId,
    approveAuditApplication,
    rejectAuditApplication,
    showToast,
  } = useFitlyoStore()

  const [activeTab, setActiveTab] = useState<'venues' | 'coaches'>('venues')
  const [currentSelectedId, setCurrentSelectedId] = useState<string>(
    selectedAuditId || 'FM-APP-0128'
  )
  const [inspectorNotes, setInspectorNotes] = useState(
    'Đã gọi điện xác minh mặt bằng, địa chỉ chính xác, cơ sở vật chất đạt chuẩn thể thao.'
  )
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)

  const venueApps = auditApplications.filter((a) => a.type === 'VENUE')
  const coachApps = auditApplications.filter((a) => a.type === 'COACH')

  const selectedApp =
    auditApplications.find((a) => a.id === currentSelectedId) ||
    auditApplications[0]

  const handleApprove = () => {
    if (!selectedApp) return
    approveAuditApplication(selectedApp.id)
  }

  const handleConfirmReject = () => {
    if (!selectedApp) return
    if (rejectReason.trim().length < 20) {
      showToast('Lý do từ chối phải có tối thiểu 20 ký tự để đối tác khắc phục!', 'error')
      return
    }
    rejectAuditApplication(selectedApp.id, rejectReason)
    setShowRejectModal(false)
    setRejectReason('')
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              SCR_ADMIN_01
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              Admin Portal • Thẩm định Giấy phép & Chứng chỉ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Trung Tâm Thẩm Định Đối Tác
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Đối soát giấy phép cụm sân & chứng chỉ HLV (PPR/IPTPA) trước khi cấp quyền hoạt động.
          </p>
        </div>

        <Badge variant="vip" className="self-start sm:self-auto py-1 px-3 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> SuperAdmin Security 2FA Active
        </Badge>
      </div>

      {/* Tabs Filter */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'venues' | 'coaches')}>
        <TabsList className="bg-muted/70 p-1 rounded-xl">
          <TabsTrigger value="venues" className="text-xs sm:text-sm font-semibold gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Cụm sân chờ duyệt ({venueApps.filter((a) => a.status === 'PENDING').length})</span>
          </TabsTrigger>
          <TabsTrigger value="coaches" className="text-xs sm:text-sm font-semibold gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>Chứng chỉ Coach chờ duyệt ({coachApps.filter((a) => a.status === 'PENDING').length})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 2-Column Layout: Master-Detail Audit Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Application List */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            DANH SÁCH HỒ SƠ YÊU CẦU ({activeTab === 'venues' ? venueApps.length : coachApps.length})
          </h4>

          {(activeTab === 'venues' ? venueApps : coachApps).map((app) => {
            const isSelected = app.id === currentSelectedId
            return (
              <div
                key={app.id}
                onClick={() => setCurrentSelectedId(app.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                    : 'border-border/70 bg-card hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    #{app.id}
                  </span>
                  <Badge
                    variant={
                      app.status === 'APPROVED'
                        ? 'success'
                        : app.status === 'REJECTED'
                        ? 'destructive'
                        : 'warning'
                    }
                    className="text-[10px]"
                  >
                    {app.status === 'APPROVED'
                      ? 'ĐÃ DUYỆT'
                      : app.status === 'REJECTED'
                      ? 'TỪ CHỐI'
                      : 'CHỜ DUYỆT'}
                  </Badge>
                </div>

                <h5 className="font-bold text-foreground text-sm truncate">
                  {app.title}
                </h5>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Đại diện: {app.ownerName}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ngày gửi: {app.submittedDate}
                </p>
              </div>
            )
          })}
        </div>

        {/* Right Column: Detailed Review & Inspection */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">
                    HỒ SƠ ĐANG CHỌN: #{selectedApp.id}
                  </span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-foreground mt-0.5">
                    {selectedApp.title}
                  </h3>
                </div>
                <Badge
                  variant={
                    selectedApp.status === 'APPROVED'
                      ? 'success'
                      : selectedApp.status === 'REJECTED'
                      ? 'destructive'
                      : 'warning'
                  }
                  className="text-xs"
                >
                  {selectedApp.status === 'APPROVED'
                    ? '● ĐÃ KÍCH HOẠT SÂN'
                    : selectedApp.status === 'REJECTED'
                    ? '● ĐÃ TỪ CHỐI'
                    : '● ĐANG CHỜ ĐỐI SOÁT'}
                </Badge>
              </div>

              {/* Entity info */}
              <div className="space-y-2 text-xs bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>
                    <span className="text-muted-foreground">Chủ sở hữu / Đại diện:</span>
                    <br />
                    <b className="text-foreground">{selectedApp.ownerName}</b>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Số điện thoại liên hệ:</span>
                    <br />
                    <b className="text-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-primary" /> {selectedApp.phone}
                    </b>
                  </p>
                </div>
                <p>
                  <span className="text-muted-foreground">Địa chỉ cơ sở:</span>
                  <br />
                  <b className="text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-primary" /> {selectedApp.address}
                  </b>
                </p>
                <p>
                  <span className="text-muted-foreground">Quy mô khai báo:</span>
                  <br />
                  <span className="text-foreground font-medium">{selectedApp.details}</span>
                </p>
              </div>

              {/* Documents preview */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-2">
                  TÀI LIỆU MINH CHỨNG PHÁP LÝ (Bấm để xem đối soát):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedApp.documents.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setPreviewDoc(doc.name)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background hover:border-primary text-left text-xs transition-colors group"
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-foreground truncate">{doc.name}</p>
                        <span className="text-[10px] text-muted-foreground">{doc.fileSize}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspector notes textarea */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  GHI CHÚ KIỂM TRA ĐỐI SOÁT CỦA ADMIN:
                </label>
                <textarea
                  rows={3}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t">
                {selectedApp.status === 'PENDING' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectModal(true)}
                      className="text-destructive border-destructive/40 hover:bg-destructive/10 text-xs gap-1.5 active:scale-[0.98]"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>❌ TỪ CHỐI (KÈM LÝ DO)</span>
                    </Button>

                    <Button
                      onClick={handleApprove}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✔️ PHÊ DUYỆT & KÍCH HOẠT SÂN</span>
                    </Button>
                  </>
                ) : selectedApp.status === 'APPROVED' ? (
                  <Badge variant="success" className="py-1 px-3 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã Kích Hoạt Hoạt Động Trên Nền Tảng
                  </Badge>
                ) : (
                  <div className="text-xs text-destructive font-medium">
                    Lý do từ chối: {selectedApp.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground text-sm truncate">{previewDoc}</h4>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-64 rounded-xl border border-dashed bg-muted/30 flex flex-col items-center justify-center text-center p-4">
              <FileText className="w-12 h-12 text-muted-foreground/60 mb-2" />
              <p className="text-xs font-bold text-foreground">Trình xem tài liệu bảo mật PDF / Bản Scan</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Tài liệu đã được mã hóa lưu trữ trên Private S3 Bucket của FITLYO.
              </p>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setPreviewDoc(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">
                  Lý Do Từ Chối Hồ Sơ Đối Tác
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vui lòng nhập chi tiết để đối tác bổ sung giấy tờ hợp lệ (tối thiểu 20 ký tự).
                </p>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="VD: Giấy phép kinh doanh mờ không rõ số đăng ký, yêu cầu scan lại bản gốc có dấu đỏ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-xl border bg-background p-3 text-xs focus:border-destructive focus:outline-none"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
              >
                Gửi Thông Báo Từ Chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
