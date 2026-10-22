import { Type } from 'lucide-react'
import { useAccessibilityStore } from '@/store/useAccessibilityStore'

export function LargeTextToggle() {
  const { largeText, toggleLargeText } = useAccessibilityStore()

  return (
    <button
      type="button"
      onClick={toggleLargeText}
      aria-pressed={largeText}
      aria-label={largeText ? 'Tắt chế độ chữ lớn' : 'Bật chế độ chữ lớn'}
      title={largeText ? 'Tắt chế độ chữ lớn' : 'Bật chế độ chữ lớn'}
      className={`fixed bottom-24 left-3 z-[65] inline-flex min-h-12 items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-black shadow-xl backdrop-blur-md transition md:bottom-5 md:left-5 ${largeText
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border/80 bg-card/95 text-foreground hover:border-primary/40 hover:bg-secondary/60'
      }`}
    >
      <Type className="h-5 w-5" />
      <span>{largeText ? 'Chữ lớn: Bật' : 'Chữ lớn'}</span>
    </button>
  )
}

