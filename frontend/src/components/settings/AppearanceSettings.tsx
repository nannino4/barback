import { Moon, Sun, Monitor } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AppearanceSettings() 
{
  const { theme, setTheme } = useThemeStore()

  const themeOptions = [
    {
      value: 'dark',
      label: 'Dark',
      description: 'Optimized for low-light bar environments',
      icon: Moon,
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follow your device settings',
      icon: Monitor,
    },
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
                    Customize how Barback looks and feels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Theme</h4>
          <div className="grid gap-3">
            {themeOptions.map((option) => 
            {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`
                                        flex items-start gap-3 p-3 rounded-lg border transition-colors
                                        ${theme === option.value 
                  ? 'border-gold-primary bg-gold-primary/10' 
                  : 'border-border-secondary hover:border-border-primary'
                }
                                    `}
                >
                  <IconComponent className="h-5 w-5 mt-0.5 text-text-secondary" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-text-primary">
                      {option.label}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {option.description}
                    </div>
                  </div>
                  {theme === option.value && (
                    <div className="h-2 w-2 rounded-full bg-gold-primary mt-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
