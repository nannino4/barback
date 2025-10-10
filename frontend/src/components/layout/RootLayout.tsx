import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';

/**
 * RootLayout - Main layout for all pages with navigation
 * Provides consistent navigation and container structure
 */
export function RootLayout()
{
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
