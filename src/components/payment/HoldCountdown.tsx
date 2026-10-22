import { Clock3 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatCountdown } from '@/lib/paymentPolicies'
import { cn } from '@/lib/utils'

interface HoldCountdownProps {
  expiresAt: string
  label?: string
  onExpire?: () => void
  className?: string
}

export function HoldCountdown({ expiresAt, label = 'Thời gian giữ chỗ', onExpire, className }: HoldCountdownProps) {
  const onExpireRef = useRef(onExpire)
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()))
  const expiredRef = useRef(false)

  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  useEffect(() => {
    const update = () => {
      const next = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setRemaining(next)
      if (next === 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current?.()
      }
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [expiresAt])

  const urgent = remaining > 0 && remaining <= 60_000

  return (
    <div className={cn('flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs', urgent ? 'border-orange-400/40 bg-orange-500/10 text-orange-700 dark:text-orange-300' : remaining === 0 ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-primary/20 bg-secondary/25 text-primary', className)}>
      <span className="flex items-center gap-2 font-bold"><Clock3 className="h-4 w-4" />{remaining === 0 ? 'Đã hết thời gian giữ chỗ' : label}</span>
      <strong className="font-mono text-sm">{formatCountdown(remaining)}</strong>
    </div>
  )
}
