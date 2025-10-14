import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import type { Theme } from '@/types/theme'

/**
 * Applies the theme to the document root element
 * Handles 'system' theme by detecting user's OS preference
 */
const applyTheme = (theme: Theme): void => 
{
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') 
  {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light'

    root.classList.add(systemTheme)
    return
  }

  root.classList.add(theme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) 
{
  const { theme } = useThemeStore()

  // Apply theme whenever it changes
  useEffect(() => 
  {
    applyTheme(theme)
  }, [theme])

  // Listen for system theme changes when in 'system' mode
  useEffect(() => 
  {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return <>{children}</>
}
