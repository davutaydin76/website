import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import type { Theme } from '@/types'

const icons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const cycle: Theme[] = ['light', 'dark', 'system']

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const next = () => {
    const idx = cycle.indexOf(theme)
    setTheme(cycle[(idx + 1) % cycle.length])
  }

  const Icon = icons[theme]

  return (
    <button
      onClick={next}
      className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
