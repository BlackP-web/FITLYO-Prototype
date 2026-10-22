import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  CalendarClock,
  MessageCircleMore,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import {
  useSupportChatStore,
  type SupportSenderRole,
} from '@/store/useSupportChatStore'

const quickQuestions = [
  'Cách đặt sân',
  'Thanh toán 100%',
  'Hủy và hoàn tiền',
  'Trạng thái giữ chỗ',
]

type HumanSenderRole = Exclude<SupportSenderRole, 'BOT' | 'SYSTEM'>

const roleToSender: Record<'player' | 'coach' | 'fm' | 'admin', HumanSenderRole> = {
  player: 'PLAYER',
  coach: 'COACH',
  fm: 'FIELD_MANAGER',
  admin: 'SUPPORT',
}

export function SupportChatWidget() {
  const location = useLocation()
  const session = useAuthStore((state) => state.session)
  const threads = useSupportChatStore((state) => state.threads)
  const sendBotMessage = useSupportChatStore((state) => state.sendBotMessage)
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatbotThread = threads.find((thread) => thread.id === 'fitlyo-support-bot')
  const isBookingPage = /\/(matches|venues|coaching|schedule|bookings|calendar)(\/|$)/.test(location.pathname)
  const senderRole = session ? roleToSender[session.role] : 'PLAYER'

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [chatbotThread?.messages.length, isOpen])

  useEffect(() => {
    const openChat = () => setIsOpen(true)
    window.addEventListener('fitlyo:open-chat', openChat)
    return () => window.removeEventListener('fitlyo:open-chat', openChat)
  }, [])

  if (!session || session.role === 'admin' || !chatbotThread) return null

  const handleSend = (message = draft) => {
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    sendBotMessage(cleanMessage, session.name, senderRole)
    setDraft('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Mở chatbot FITLYO Assistant"
        className={cn(
          'fixed bottom-24 right-3 z-[64] inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-black text-primary-foreground shadow-2xl shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90 md:bottom-5 md:right-5',
          isOpen && 'pointer-events-none opacity-0',
        )}
      >
        <span className="relative"><MessageCircleMore className="h-5 w-5" /><i className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand-coral ring-2 ring-primary" /></span>
        <span>{isBookingPage ? 'Hỏi về booking' : 'Chatbot'}</span>
      </button>

      {isOpen && <section className="fixed inset-x-3 bottom-3 z-[90] flex max-h-[82vh] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[680px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[430px]" role="dialog" aria-modal="true" aria-label="Chatbot FITLYO Assistant">
        <header className="shrink-0 border-b bg-primary px-4 py-4 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15"><Bot className="h-5 w-5" /><i className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary bg-emerald-400" /></span>
              <div className="min-w-0"><p className="truncate text-base font-black">FITLYO Assistant</p><p className="mt-0.5 text-xs text-primary-foreground/75">Chatbot tự động · Phản hồi tức thì</p></div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-foreground/10 transition hover:bg-primary-foreground/20" aria-label="Đóng chatbot"><X className="h-5 w-5" /></button>
          </div>
          {isBookingPage && <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-foreground/10 px-3 py-2 text-xs font-bold"><CalendarClock className="h-4 w-4" />Bạn có thể hỏi chatbot về đặt lịch, thanh toán, hủy và hoàn tiền.</div>}
        </header>

        <div className="shrink-0 border-b px-4 py-3">
          <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/55 text-primary"><Sparkles className="h-4 w-4" /></span><div><p className="text-sm font-black">Trợ lý FITLYO</p><p className="text-xs text-muted-foreground">Trả lời theo chính sách của prototype</p></div></div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/15 p-4" aria-live="polite">
          {chatbotThread.messages.map((message) => {
            const isMine = message.senderRole === senderRole
            return <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[86%] rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-sm', isMine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border bg-card text-foreground')}><p className={cn('mb-1 text-[10px] font-black', isMine ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{message.senderName} · {message.sentAt}</p><p>{message.text}</p></div></div>
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t bg-card px-3 py-2.5"><div className="flex gap-2 overflow-x-auto pb-1">{quickQuestions.map((question) => <button key={question} type="button" onClick={() => handleSend(question)} className="min-h-10 shrink-0 rounded-full border border-primary/20 bg-primary/5 px-3 text-xs font-bold text-primary transition hover:bg-primary/10">{question}</button>)}</div></div>

        <form className="flex shrink-0 gap-2 border-t bg-card p-3" onSubmit={(event) => { event.preventDefault(); handleSend() }}>
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} className="h-12 flex-1 rounded-xl" placeholder="Nhập câu hỏi của bạn…" aria-label="Câu hỏi dành cho chatbot" />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl" disabled={!draft.trim()} aria-label="Gửi câu hỏi"><Send className="h-5 w-5" /></Button>
        </form>
      </section>}
    </>
  )
}
