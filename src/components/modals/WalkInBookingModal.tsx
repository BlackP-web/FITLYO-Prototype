import React, { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  AlertCircle,
  Banknote,
  Building2,
  Check,
  Clock3,
  CreditCard,
  MapPin,
  Phone,
  Printer,
  QrCode,
  ReceiptText,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFitlyoStore } from '@/store/useFitlyoStore'
import type { WalkInPaymentMethod, WalkInSource } from '@/types/pickleball'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

const paymentOptions: Array<{
  value: WalkInPaymentMethod
  label: string
  description: string
  icon: React.ElementType
}> = [
  { value: 'CASH', label: 'Tiền mặt', description: 'Thu trực tiếp tại quầy', icon: Banknote },
  { value: 'VIETQR', label: 'VietQR', description: 'Mô phỏng quét chuyển khoản', icon: QrCode },
  { value: 'DEBT', label: 'Trả sau', description: 'Ghi nhận công nợ khách quen', icon: WalletCards },
]

function MockVietQr({ amount }: { amount: number }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 sm:grid-cols-[116px_1fr] sm:items-center">
      <div className="mx-auto rounded-xl border bg-white p-2 shadow-sm">
        <svg viewBox="0 0 100 100" className="h-24 w-24 text-slate-950" fill="currentColor" aria-hidden="true">
          <rect x="5" y="5" width="26" height="26" rx="2" />
          <rect x="10" y="10" width="16" height="16" fill="white" />
          <rect x="14" y="14" width="8" height="8" />
          <rect x="69" y="5" width="26" height="26" rx="2" />
          <rect x="74" y="10" width="16" height="16" fill="white" />
          <rect x="78" y="14" width="8" height="8" />
          <rect x="5" y="69" width="26" height="26" rx="2" />
          <rect x="10" y="74" width="16" height="16" fill="white" />
          <rect x="14" y="78" width="8" height="8" />
          <path d="M38 8h8v8h8V8h8v18h-8v8h-8v-8h-8zm0 32h8v8h8v-8h8v8h8v8h-8v8H46v-8h-8zm34-2h9v9h9v9H80v8h14v9H80v9h-8V64h-8v-8h8zM38 70h8v8h9v-8h8v24h-8v-8h-9v8h-8z" />
        </svg>
      </div>
      <div>
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
          <CreditCard className="h-3 w-3" /> VIETQR MÔ PHỎNG
        </div>
        <p className="text-sm font-bold text-foreground">D-Sports Pickleball Thủ Đức</p>
        <p className="mt-1 text-xs text-muted-foreground">Nội dung: FITLYO WALK-IN</p>
        <p className="mt-2 text-lg font-black text-blue-700 dark:text-blue-300">
          {currencyFormatter.format(amount)}
        </p>
      </div>
    </div>
  )
}

export const WalkInBookingModal: React.FC = () => {
  const {
    isWalkInModalOpen,
    walkInSlotData,
    courtInventory,
    selectedDate,
    closeWalkInModal,
    createWalkInBooking,
    showToast,
  } = useFitlyoStore()

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState<WalkInSource>('AT_COUNTER')
  const [paymentMethod, setPaymentMethod] = useState<WalkInPaymentMethod>('CASH')
  const [extraFee, setExtraFee] = useState(30000)
  const [paidAmount, setPaidAmount] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  const courtFee = useMemo(() => {
    if (!walkInSlotData) return 0
    return (
      courtInventory
        .find((court) => court.id === walkInSlotData.courtId)
        ?.slots.find((slot) => slot.slotNumber === walkInSlotData.slotNumber)?.price ?? 0
    )
  }, [courtInventory, walkInSlotData])
  const totalAmount = courtFee + Math.max(0, extraFee || 0)
  const normalizedPhone = phone.replace(/\D/g, '')
  const isNameValid = customerName.trim().length >= 2 && customerName.trim().length <= 50
  const isPhoneValid = /^0\d{9}$/.test(normalizedPhone)
  const isFormValid = isNameValid && isPhoneValid
  const effectivePaidAmount = Math.max(0, paidAmount ?? totalAmount)
  const remainingAmount = Math.max(0, totalAmount - effectivePaidAmount)

  const resetForm = () => {
    setCustomerName('')
    setPhone('')
    setSource('AT_COUNTER')
    setPaymentMethod('CASH')
    setExtraFee(30000)
    setPaidAmount(null)
    setNote('')
    setSubmitted(false)
    setShowReceipt(false)
  }

  const handleClose = () => {
    resetForm()
    closeWalkInModal()
  }

  if (!walkInSlotData) return null

  const handleConfirm = () => {
    setSubmitted(true)
    if (!isFormValid) return

    const booking = createWalkInBooking({
      customerName,
      phone: normalizedPhone,
      source,
      paymentMethod,
      extraFee: Math.max(0, extraFee || 0),
      paidAmount: effectivePaidAmount,
      note,
    })
    if (booking) resetForm()
  }

  const handleReceiptPreview = () => {
    setSubmitted(true)
    if (!isFormValid) {
      showToast('Vui lòng hoàn tất tên và số điện thoại trước khi tạo phiếu.', 'error')
      return
    }
    setShowReceipt(true)
  }

  const paymentLabel = paymentOptions.find((option) => option.value === paymentMethod)?.label

  return (
    <Dialog.Root open={isWalkInModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[94vh] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border bg-card shadow-2xl focus:outline-none">
          <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-card/95 px-5 py-4 backdrop-blur-md sm:px-6">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> SCR_FM_08 · Khách vãng lai
              </div>
              <Dialog.Title className="text-lg font-black tracking-tight text-foreground sm:text-xl">
                Đặt sân & khóa slot trực tiếp
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Hoàn tất thông tin tại quầy và đồng bộ trạng thái lên lịch sân.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Đóng modal">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <div>
                  <p className="text-muted-foreground">Cụm sân / Sân con</p>
                  <p className="mt-0.5 font-bold text-foreground">D-Sports Thủ Đức · {walkInSlotData.courtName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <div>
                  <p className="text-muted-foreground">Thời gian đã chọn</p>
                  <p className="mt-0.5 font-bold text-foreground">Slot {walkInSlotData.slotNumber} · {walkInSlotData.timeRange} · {selectedDate}</p>
                </div>
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserRound className="h-4 w-4" /></span>
                <div>
                  <h3 className="text-sm font-bold">1. Thông tin khách đặt sân</h3>
                  <p className="text-[11px] text-muted-foreground">Dùng để tra cứu và đối soát tại quầy.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-foreground">
                  Họ và tên khách <span className="text-destructive">*</span>
                  <input
                    autoFocus
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Ví dụ: Nguyễn Thành Trung"
                    className={`mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${submitted && !isNameValid ? 'border-destructive' : 'focus:border-primary'}`}
                  />
                  {submitted && !isNameValid && <span className="mt-1 block font-medium text-destructive">Tên phải có từ 2 đến 50 ký tự.</span>}
                </label>
                <label className="text-xs font-semibold text-foreground">
                  Số điện thoại <span className="text-destructive">*</span>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="0918 334 455"
                      className={`h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${submitted && !isPhoneValid ? 'border-destructive' : 'focus:border-primary'}`}
                    />
                  </div>
                  {submitted && !isPhoneValid && <span className="mt-1 block font-medium text-destructive">Nhập đúng số điện thoại Việt Nam gồm 10 số.</span>}
                </label>
              </div>
            </section>

            <section className="grid gap-5 border-t pt-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold">2. Nguồn đặt sân</h3>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['AT_COUNTER', 'Tại quầy', Building2],
                    ['PHONE_CALL', 'Hotline', Phone],
                  ] as const).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSource(value)}
                      className={`flex h-12 items-center gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition ${source === value ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30' : 'hover:bg-muted'}`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                      {source === value && <Check className="ml-auto h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold">Hình thức thanh toán</h3>
                <div className="grid gap-2">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(option.value)
                          if (option.value === 'DEBT') setPaidAmount(0)
                        }}
                        className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${paymentMethod === option.value ? 'border-primary bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'}`}
                      >
                        <Icon className={`h-4 w-4 ${paymentMethod === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>
                          <span className="block text-xs font-bold">{option.label}</span>
                          <span className="block text-[10px] text-muted-foreground">{option.description}</span>
                        </span>
                        {paymentMethod === option.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            {paymentMethod === 'VIETQR' && (
              <div>
                <MockVietQr amount={totalAmount} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    setPaidAmount(totalAmount)
                    showToast('Đã mô phỏng tín hiệu VietQR thanh toán thành công.', 'success')
                  }}
                >
                  <Check className="h-4 w-4" /> Mô phỏng đã nhận chuyển khoản
                </Button>
              </div>
            )}

            <section className="border-t pt-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600"><ReceiptText className="h-4 w-4" /></span>
                <div>
                  <h3 className="text-sm font-bold">3. Chi phí & dịch vụ đi kèm</h3>
                  <p className="text-[11px] text-muted-foreground">Tổng tiền được tính lại tức thì.</p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold">
                    Phụ phí nước / bóng / thuê vợt
                    <div className="relative mt-1.5">
                      <input type="number" min="0" step="5000" value={extraFee} onChange={(event) => setExtraFee(Math.max(0, Number(event.target.value)))} className="h-10 w-full rounded-xl border bg-background px-3 pr-12 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">VNĐ</span>
                    </div>
                  </label>
                  <label className="text-xs font-semibold">
                    Số tiền khách đã trả
                    <div className="relative mt-1.5">
                      <input type="number" min="0" step="5000" value={effectivePaidAmount} onChange={(event) => setPaidAmount(Math.max(0, Number(event.target.value)))} className="h-10 w-full rounded-xl border bg-background px-3 pr-12 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">VNĐ</span>
                    </div>
                  </label>
                  <label className="sm:col-span-2 text-xs font-semibold">
                    Ghi chú nội bộ cho ca trực
                    <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: Chuẩn bị thêm 2 vợt test..." className="mt-1.5 w-full resize-none rounded-xl border bg-background p-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </label>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng tiền phải thu</p>
                  <p className="mt-1 text-2xl font-black text-orange-400">{currencyFormatter.format(totalAmount)}</p>
                  <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Tiền sân</span><b>{currencyFormatter.format(courtFee)}</b></div>
                    <div className="flex justify-between"><span className="text-slate-400">Dịch vụ thêm</span><b>{currencyFormatter.format(extraFee)}</b></div>
                    <div className="flex justify-between"><span className="text-slate-400">Đã trả</span><b className="text-emerald-400">{currencyFormatter.format(effectivePaidAmount)}</b></div>
                    <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-slate-300">Còn lại</span><b className={remainingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}>{currencyFormatter.format(remainingAmount)}</b></div>
                  </div>
                </div>
              </div>
            </section>

            {remainingAmount > 0 && paymentMethod !== 'DEBT' && (
              <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0" /> Giao dịch sẽ được lưu với trạng thái còn nợ {currencyFormatter.format(remainingAmount)}.
              </div>
            )}
          </div>

          <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t bg-card/95 px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button type="button" variant="outline" onClick={handleClose}>Hủy bỏ</Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleReceiptPreview} className="gap-2"><Printer className="h-4 w-4" /> Xem phiếu in</Button>
              <Button type="button" onClick={handleConfirm} className="gap-2 bg-orange-600 font-bold text-white hover:bg-orange-700"><Check className="h-4 w-4" /> Xác nhận khóa sân</Button>
            </div>
          </div>

          {showReceipt && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-slate-950 shadow-2xl">
                <div className="border-b border-dashed border-slate-300 pb-4 text-center">
                  <p className="text-lg font-black">FITLYO · D-SPORTS</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Phiếu đặt sân khách vãng lai · Bản mô phỏng K80</p>
                </div>
                <div className="space-y-2 border-b border-dashed border-slate-300 py-4 text-xs">
                  <div className="flex justify-between"><span>Mã phiếu</span><b>WALK-PREVIEW</b></div>
                  <div className="flex justify-between"><span>Khách hàng</span><b>{customerName}</b></div>
                  <div className="flex justify-between"><span>Điện thoại</span><b>{normalizedPhone}</b></div>
                  <div className="flex justify-between"><span>Sân / Slot</span><b>{walkInSlotData.courtName} · S{walkInSlotData.slotNumber}</b></div>
                  <div className="flex justify-between"><span>Khung giờ</span><b>{walkInSlotData.timeRange}</b></div>
                  <div className="flex justify-between"><span>Thanh toán</span><b>{paymentLabel}</b></div>
                </div>
                <div className="space-y-2 py-4 text-sm">
                  <div className="flex justify-between"><span>Tổng tiền</span><b>{currencyFormatter.format(totalAmount)}</b></div>
                  <div className="flex justify-between"><span>Đã thu</span><b>{currencyFormatter.format(effectivePaidAmount)}</b></div>
                  <div className="flex justify-between text-base"><span>Còn lại</span><b>{currencyFormatter.format(remainingAmount)}</b></div>
                </div>
                <p className="mb-4 text-center text-[10px] text-slate-500">Cảm ơn quý khách. Vui lòng có mặt trước giờ chơi 10 phút.</p>
                <Button type="button" className="w-full" onClick={() => { setShowReceipt(false); showToast('Đã mô phỏng gửi lệnh in phiếu K80.', 'success') }}><Printer className="h-4 w-4" /> Mô phỏng in phiếu</Button>
                <button type="button" onClick={() => setShowReceipt(false)} className="mt-2 w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900">Quay lại biểu mẫu</button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default WalkInBookingModal
