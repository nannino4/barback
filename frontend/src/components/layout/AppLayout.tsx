import { Outlet } from 'react-router-dom';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';

/**
 * AppLayout - Main application layout for all pages
 * 
 * Provides:
 * - Consistent top navigation bar (sticky)
 * - Bottom navigation bar (mobile-only, auth-only)
 * - Main content outlet
 * - Padding for bottom nav on mobile (pb-16 to prevent content overlap)
 * 
 * Note: Individual pages should use PageContainer for consistent padding/max-width
 */
export function AppLayout()
{
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
