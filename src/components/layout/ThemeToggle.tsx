import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFitlyoStore } from '@/store/useFitlyoStore'

interface ThemeToggleProps {
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { colorMode, toggleColorMode } = useFitlyoStore()
  const isDark = colorMode === 'dark'
  const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'

  return (
    <button
      type="button"
      onClick={toggleColorMode}
      aria-label={label}
      title={label}
      className={cn(
        'group inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-card px-2.5 text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-secondary/60 hover:text-foreground active:scale-[0.97]',
        showLabel ? 'w-auto' : 'w-9 px-0',
        className,
      )}
    >
      <span className="relative h-4 w-4">
        <Sun className={cn('absolute inset-0 h-4 w-4 transition-all duration-300', isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
        <Moon className={cn('absolute inset-0 h-4 w-4 transition-all duration-300', isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0')} />
      </span>
      {showLabel && <span className="text-xs font-semibold">{isDark ? 'Chế độ tối' : 'Chế độ sáng'}</span>}
    </button>
  )
}
