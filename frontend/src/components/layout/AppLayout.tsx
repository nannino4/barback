import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';

/**
 * AppLayout - Main application layout for all pages
 * 
 * Provides:
 * - Consistent top navigation bar (sticky to top)
 * - Bottom navigation bar (fixed to bottom, mobile-only, auth-only)
 * - Main content outlet
 * - Bottom padding on mobile to prevent overlap with fixed bottom nav
 * 
 * Layout Structure:
 * - TopNav: Sticky positioned (stays at top while scrolling, doesn't overlap content)
 * - Main: Fills space below TopNav with bottom padding for mobile nav
 * - BottomNav: Fixed at bottom (mobile only, overlays content)
 * 
 * Note: Individual pages should use PageContainer for consistent padding/max-width
 */
export function AppLayout({ children }: { children?: ReactNode })
{
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Top Navigation - Takes up space in flow */}
      <TopNav />
      
      {/* Main Content Area - Only needs bottom padding for fixed mobile nav */}
      <main className="pb-16 md:pb-0">
        {children ?? <Outlet />}
      </main>
      
      {/* Fixed Bottom Navigation (Mobile Only) - Overlays content */}
      <BottomNav />
    </div>
  );
}
