import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { useOrganizationStore } from '@/stores/organizationStore';

interface NavItem
{
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * BottomNav - Mobile-only bottom navigation bar
 * 
 * Features:
 * - Only visible on mobile devices (hidden on md+ screens)
 * - Only visible when user is authenticated
 * - Fixed to bottom of viewport
 * - Active state indication with primary color
 * - Touch-friendly spacing
 */
export const BottomNav: React.FC = () =>
{
  const { t } = useI18n();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const currentOrg = useOrganizationStore((state) => state.currentOrg);

  // Don't render if user is not authenticated
  if (!user)
  {
    return null;
  }

  if (!currentOrg)
  {
    return null;
  }

  const navItems: NavItem[] = [
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
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) =>
        {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[4.5rem]',
                'hover:bg-muted',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isActive && 'text-primary',
                )}
              />
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
