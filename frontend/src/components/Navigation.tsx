import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UserMenu } from '@/components/UserMenu';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';

export const Navigation: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const handleLoginClick = () =>
  {
    // Include current path as redirect if not already on auth pages
    const isAuthPage = location.pathname.startsWith('/auth');
    const redirectUrl = !isAuthPage && location.pathname !== '/' 
      ? `/auth/login?redirect=${encodeURIComponent(location.pathname)}`
      : '/auth/login';
    void navigate(redirectUrl);
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Home Link */}
          <div className="flex items-center gap-6">
            <Link
              to={user ? '/dashboard' : '/'}
              className="flex items-center gap-2 font-heading text-xl font-bold text-primary hover:text-primary/80 dark:hover:text-primary/90 transition-colors"
            >
              <Home className="h-6 w-6" />
              <span>Barback</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            
            {user ? (
              <UserMenu />
            ) : (
              <Button
                onClick={handleLoginClick}
                variant="default"
                size="sm"
                className="ml-2"
              >
                {t('nav.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
