import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'

export function MainLayout() 
{
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="font-heading text-xl font-semibold text-gold-primary">
                            Barback
            </h1>
          </div>
                    
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
            
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
