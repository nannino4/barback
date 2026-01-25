import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Palette, Package, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/UserMenu';
import { OrganizationSwitcherPopover } from '@/components/UserMenu/OrganizationSwitcherPopover';
import { OrgSwitcherSheet } from '@/components/UserMenu/OrgSwitcherSheet';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

/**
 * TopNav - Main navigation bar for the application
 * 
 * Updated IA (Sprint 4.5):
 * - Organization switcher is always visible (when authenticated with orgs)
 * - Desktop nav shows: Inventory (+ Alerts when implemented)
 * - Organization Settings link (role-gated: owner/manager only)
 * - User menu for account + preferences only
 */
export const TopNav: React.FC = () =>
{
  const { t } = useI18n();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const currentOrg = useOrganizationStore((state) => state.currentOrg);

  // Include current path as redirect if not already on auth pages
  const isAuthPage = location.pathname.startsWith('/auth');
  const loginTo = !isAuthPage && location.pathname !== '/'
    ? `/auth/login?redirect=${encodeURIComponent(location.pathname)}`
    : '/auth/login';

  // Check if user can access org settings (owner or manager)
  const canAccessOrgSettings = currentOrg && 
    (currentOrg.role === 'OWNER' || currentOrg.role === 'MANAGER');

  // Desktop navigation items - only shown when authenticated with org context
  const navItems = user && currentOrg ? [
    {
      label: t('nav.inventory'),
      path: ROUTES.INVENTORY,
      icon: Package,
    },
    {
      label: t('nav.alerts'),
      path: ROUTES.ALERTS,
      icon: Bell,
    },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link
              to={user ? ROUTES.INVENTORY : ROUTES.HOME}
              className="flex items-center gap-2 font-heading text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="h-6 w-6" />
              <span className="hidden sm:inline">Barback</span>
            </Link>
            
            {/* Design System Link - dev only */}
            {import.meta.env.DEV && (
              <Link
                to={ROUTES.DESIGN_SYSTEM}
                className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Palette className="h-4 w-4" />
                <span>Design</span>
              </Link>
            )}
          </div>

          {/* Center: Organization Switcher */}
          <div className="flex justify-center">
            {user && (
              <>
                {/* Mobile: Sheet */}
                <div className="sm:hidden">
                  <OrgSwitcherSheet />
                </div>
                {/* Desktop: Popover */}
                <div className="hidden sm:block">
                  <OrganizationSwitcherPopover />
                </div>
              </>
            )}
          </div>

          {/* Right: Desktop Nav + User Menu */}
          <div className="flex items-center justify-end gap-2">
            {/* Desktop Navigation Items */}
            {navItems.length > 0 && (
              <div className="hidden md:flex items-center gap-1">
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

                {/* Organization Settings - Role-gated (owner/manager only) */}
                {canAccessOrgSettings && (
                  <Link
                    to={ROUTES.ORGS.DETAIL.replace(':orgId', currentOrg.org.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      'hover:bg-muted',
                      location.pathname.includes('/orgs/')
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground',
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('nav.orgSettings')}</span>
                  </Link>
                )}
              </div>
            )}

            {user ? (
              <UserMenu />
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
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
