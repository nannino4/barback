import { useEffect, useState } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { ResolvedThemeContext } from '@/contexts/ThemeContext'
import type { Theme, ResolvedTheme } from '@/types/theme'

/**
 * Resolves theme preference to actual theme
 * Converts 'system' to 'light' or 'dark' based on OS preference
 */
const resolveTheme = (theme: Theme): ResolvedTheme =>
{
  if (theme === 'system')
  {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

/**
 * Applies the resolved theme to the document root element
 */
const applyTheme = (resolvedTheme: ResolvedTheme): void =>
{
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolvedTheme)
}

/**
 * ThemeProvider component
 * 
 * - Listens to theme changes from the store
 * - Resolves 'system' preference to actual 'light' or 'dark'
 * - Applies theme to DOM
 * - Provides resolved theme via context for components that need it
 */
export function ThemeProvider({ children }: { children: React.ReactNode })
{
  const { theme } = useThemeStore()
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme),
  )

  // Resolve and apply theme whenever preference changes
  useEffect(() =>
  {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [theme])

  // Listen for system theme changes when in 'system' mode
  useEffect(() =>
  {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () =>
    {
      const resolved = resolveTheme('system')
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ResolvedThemeContext value={resolvedTheme}>
      {children}
    </ResolvedThemeContext>
  )
}
