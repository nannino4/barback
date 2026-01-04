import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Palette, LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

/**
 * TopBar - Main navigation bar for the application
 * 
 * Features:
 * - Sticky top navigation
 * - Logo and brand link
 * - Desktop navigation items (Dashboard, Inventory, Orders) - visible on md+ screens
 * - User menu (includes theme/language preferences)
 * - Responsive design
 */
export const TopNav: React.FC = () =>
{
  const { t } = useI18n();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Include current path as redirect if not already on auth pages
  const isAuthPage = location.pathname.startsWith('/auth');
  const loginTo = !isAuthPage && location.pathname !== '/'
    ? `/auth/login?redirect=${encodeURIComponent(location.pathname)}`
    : '/auth/login';

  // Desktop navigation items - only shown when authenticated
  const navItems = user ? [
    {
      label: t('nav.dashboard'),
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: t('nav.inventory'),
      path: '/inventory',
      icon: Package,
    },
    {
      label: t('nav.orders'),
      path: '/orders',
      icon: ShoppingCart,
    },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Desktop Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              to={user ? '/dashboard' : '/'}
              className="flex items-center gap-2 font-heading text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="h-6 w-6" />
              <span>Barback</span>
            </Link>
            
            {/* Desktop Navigation Items - Hidden on mobile (md:flex) */}
            {navItems.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) =>
                {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        'hover:bg-muted',
                        isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Design System Link */}
            <Link
              to="/design-system"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Palette className="h-4 w-4" />
              <span>Design System</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <UserMenu />
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
                className="ml-2"
              >
                <Link to={loginTo}>{t('nav.login')}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
