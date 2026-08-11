import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import type { Theme } from '@/types'

const icons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const cycle: Theme[] = ['light', 'dark', 'system']

interface ThemeToggleProps {
  variant?: 'default' | 'light'
}

export default function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const next = () => {
    const idx = cycle.indexOf(theme)
    setTheme(cycle[(idx + 1) % cycle.length])
  }

  const Icon = icons[theme]

  return (
    <button
      onClick={next}
      className={cn(
        'p-2 rounded-full transition-colors',
        variant === 'light'
          ? 'text-white/80 hover:text-white hover:bg-white/10'
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
      aria-label="Toggle theme"
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
