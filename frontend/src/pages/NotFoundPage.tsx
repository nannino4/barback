import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogIn, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { useSmartBack } from '@/hooks/useSmartBack';

/**
 * NotFoundPage - 404 error page
 * 
 * Displays when user navigates to a non-existent route.
 * Provides helpful navigation options based on authentication status.
 */
export const NotFoundPage: React.FC = () =>
{
  const { t } = useI18n();
  const { isAuthenticated } = useAuthStore();
  const goBack = useSmartBack('/');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-8xl font-bold text-primary">404</h1>
          </div>
          <CardTitle className="text-2xl">
            {t('errors.notFound.title')}
          </CardTitle>
          <CardDescription className="text-base">
            {t('errors.notFound.message')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            {t('errors.notFound.suggestions')}
          </p>

          {/* Go Back */}
          <Button
            onClick={goBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('errors.notFound.goBack')}
          </Button>

          {/* Home */}
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t('errors.notFound.goHome')}
            </Link>
          </Button>

          {/* Conditional navigation based on auth status */}
          {isAuthenticated ? (
            <Button asChild className="w-full">
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('errors.notFound.goDashboard')}
              </Link>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                {t('errors.notFound.goLogin')}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
