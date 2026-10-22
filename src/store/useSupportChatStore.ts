import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type SupportTargetType = 'BOT' | 'COACH' | 'FIELD_MANAGER' | 'SUPPORT'
export type SupportSenderRole = 'BOT' | 'PLAYER' | 'COACH' | 'FIELD_MANAGER' | 'SUPPORT' | 'SYSTEM'

export interface SupportChatMessage {
  id: string
  senderRole: SupportSenderRole
  senderName: string
  text: string
  sentAt: string
}

export interface SupportChatThread {
  id: string
  targetType: SupportTargetType
  targetId: string
  targetName: string
  bookingId?: string
  bookingLabel?: string
  updatedAt: string
  messages: SupportChatMessage[]
}

interface DirectThreadInput {
  targetType: Exclude<SupportTargetType, 'BOT'>
  targetId: string
  targetName: string
  bookingId?: string
  bookingLabel?: string
}

interface SupportChatState {
  threads: SupportChatThread[]
  sendBotMessage: (
    text: string,
    senderName: string,
    senderRole: Exclude<SupportSenderRole, 'BOT' | 'SYSTEM'>,
  ) => string
  ensureDirectThread: (input: DirectThreadInput) => string
  sendDirectMessage: (
    threadId: string,
    senderRole: Exclude<SupportSenderRole, 'BOT' | 'SYSTEM'>,
    senderName: string,
    text: string,
  ) => boolean
}

const nowLabel = () => new Date().toLocaleTimeString('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
})

const makeMessage = (
  senderRole: SupportSenderRole,
  senderName: string,
  text: string,
): SupportChatMessage => ({
  id: `support-message-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  senderRole,
  senderName,
  text,
  sentAt: nowLabel(),
})

const botWelcome = makeMessage(
  'BOT',
  'FITLYO Assistant',
  'Xin chào! Tôi có thể hướng dẫn đặt sân, thanh toán 100%, đặt Coach, hủy và hoàn tiền. Bạn cần hỗ trợ nội dung nào?',
)

const botThread: SupportChatThread = {
  id: 'fitlyo-support-bot',
  targetType: 'BOT',
  targetId: 'fitlyo-assistant',
  targetName: 'FITLYO Assistant',
  updatedAt: botWelcome.sentAt,
  messages: [botWelcome],
}

const replyFor = (message: string) => {
  const text = message.trim().toLocaleLowerCase('vi-VN')
  if (text.includes('đặt sân') || text.includes('booking sân')) {
    return 'Để đặt sân: chọn Sân → chọn cụm sân → ngày và slot còn trống → phương thức thanh toán. Bạn thanh toán 100% phí đặt sân trong một lần và nhận vé QR ngay sau khi thành công.'
  }
  if (text.includes('coach') || text.includes('huấn luyện')) {
    return 'Booking Coach được gửi sang HLV duyệt tối đa 12 giờ. Sau khi Coach duyệt, bạn có 15 phút để thanh toán 100% học phí. Thanh toán thành công, toàn bộ lịch học được xác nhận.'
  }
  if (text.includes('social') || text.includes('kèo')) {
    return 'Social Session yêu cầu thanh toán 100% phí tham gia. Nếu không đủ người, hệ thống tự hủy trước giờ chơi 60 phút và hoàn 100% về Ví FITLYO.'
  }
  if (text.includes('cọc') || text.includes('thanh toán') || text.includes('vietqr') || text.includes('ví')) {
    return 'Tất cả dịch vụ gồm Social Session, đặt sân, Coach và FITLYO VIP đều thanh toán 100% trong một lần. Prototype hỗ trợ Ví FITLYO và VietQR mô phỏng. Tiền mặt chỉ áp dụng cho khách vãng lai tại quầy sân.'
  }
  if (text.includes('hủy') || text.includes('hoàn')) {
    return 'Tiền hoàn được chuyển về Ví FITLYO. Đặt sân và Social Session hoàn theo thời điểm hủy; lịch Coach hủy trước ít nhất 24 giờ được hoàn 100%. Nếu sân hoặc Coach chủ động hủy, bạn được hoàn 100% kèm voucher 10% giá trị booking, tối đa 100.000đ, dùng trong 30 ngày.'
  }
  if (text.includes('giữ chỗ') || text.includes('hết hạn') || text.includes('trạng thái')) {
    return 'Đặt sân và Social Session thanh toán 100% ngay khi xác nhận. Riêng booking Coach sau khi được duyệt có cửa sổ thanh toán 15 phút; quá hạn, yêu cầu hết hiệu lực và lịch được mở lại.'
  }
  return 'Tôi chưa nhận diện đầy đủ câu hỏi này. Bạn có thể chọn một chủ đề gợi ý bên dưới hoặc nhấn “Liên hệ người phụ trách” để chuyển sang Coach, Field Manager hay đội hỗ trợ FITLYO.'
}

export const useSupportChatStore = create<SupportChatState>()(
  persist(
    (set, get) => ({
      threads: [botThread],

      sendBotMessage: (text, senderName, senderRole) => {
        const cleanText = text.trim()
        if (!cleanText) return 'fitlyo-support-bot'
        const userMessage = makeMessage(senderRole, senderName, cleanText)
        const botMessage = makeMessage('BOT', 'FITLYO Assistant', replyFor(cleanText))
        set((state) => ({
          threads: state.threads.map((thread) => thread.id === 'fitlyo-support-bot'
            ? { ...thread, updatedAt: botMessage.sentAt, messages: [...thread.messages, userMessage, botMessage] }
            : thread),
        }))
        return 'fitlyo-support-bot'
      },

      ensureDirectThread: (input) => {
        const existing = get().threads.find((thread) => (
          thread.targetType === input.targetType
          && thread.targetId === input.targetId
          && thread.bookingId === input.bookingId
        ))
        if (existing) return existing.id

        const threadId = `support-${input.targetType.toLowerCase()}-${input.bookingId ?? input.targetId}`
        const intro = makeMessage(
          'SYSTEM',
          'FITLYO',
          input.bookingLabel
            ? `Hội thoại đã được chuyển đến ${input.targetName} cho booking “${input.bookingLabel}”.`
            : `Hội thoại đã được chuyển đến ${input.targetName}.`,
        )
        const nextThread: SupportChatThread = {
          id: threadId,
          ...input,
          updatedAt: intro.sentAt,
          messages: [intro],
        }
        set((state) => ({ threads: [...state.threads, nextThread] }))
        return threadId
      },

      sendDirectMessage: (threadId, senderRole, senderName, text) => {
        const cleanText = text.trim()
        if (!cleanText) return false
        const message = makeMessage(senderRole, senderName, cleanText)
        const thread = get().threads.find((item) => item.id === threadId)
        if (!thread) return false

        const automatedAcknowledgement = thread.targetType === 'SUPPORT' && senderRole !== 'SUPPORT'
          ? makeMessage('SUPPORT', 'Đội hỗ trợ FITLYO', 'FITLYO đã tiếp nhận yêu cầu. Nhân viên hỗ trợ sẽ phản hồi trong khung giờ 06:00–22:00.')
          : null
        set((state) => ({
          threads: state.threads.map((item) => item.id === threadId
            ? {
                ...item,
                updatedAt: automatedAcknowledgement?.sentAt ?? message.sentAt,
                messages: [...item.messages, message, ...(automatedAcknowledgement ? [automatedAcknowledgement] : [])],
              }
            : item),
        }))
        return true
      },
    }),
    {
      name: 'fitlyo-support-chat-v1',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => ({
        threads: state.threads.filter((thread) => thread.id === 'fitlyo-support-bot'),
      }),
      migrate: (persistedState) => {
        const state = persistedState as Pick<SupportChatState, 'threads'>
        const chatbot = state.threads?.find((thread) => thread.id === 'fitlyo-support-bot')
        return { ...state, threads: chatbot ? [chatbot] : [botThread] }
      },
    },
  ),
)
