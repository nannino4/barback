import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogIn, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';

/**
 * NotFoundPage - 404 error page
 * 
 * Displays when user navigates to a non-existent route.
 * Provides helpful navigation options based on authentication status.
 */
export const NotFoundPage: React.FC = () =>
{
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isAuthenticated } = useAuthStore();

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
            onClick={() => void navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('errors.notFound.goBack')}
          </Button>

          {/* Home */}
          <Button
            onClick={() => void navigate('/')}
            variant="outline"
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            {t('errors.notFound.goHome')}
          </Button>

          {/* Conditional navigation based on auth status */}
          {isAuthenticated ? (
            <Button
              onClick={() => void navigate('/dashboard')}
              className="w-full"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {t('errors.notFound.goDashboard')}
            </Button>
          ) : (
            <Button
              onClick={() => void navigate('/auth/login')}
              className="w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {t('errors.notFound.goLogin')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
