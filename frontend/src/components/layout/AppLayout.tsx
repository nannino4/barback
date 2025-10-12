import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';

/**
 * AppLayout - Main application layout for all pages
 * Provides consistent navigation and container structure across the entire app
 */
export function AppLayout()
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
