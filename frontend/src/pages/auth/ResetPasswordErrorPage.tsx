import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export const ResetPasswordErrorPage: React.FC = () =>
{
  const { t } = useI18n();
    
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t('auth.resetPasswordError.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>

              {/* What can you do section */}
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {t('auth.resetPasswordError.whatCanYouDo')}
                </p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span className="text-sm text-muted-foreground">
                      {t('auth.resetPasswordError.requestNewLink')}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span className="text-sm text-muted-foreground">
                      {t('auth.resetPasswordError.trySigningIn')}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span className="text-sm text-muted-foreground">
                      {t('auth.resetPasswordError.contactSupport')}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Request New Reset Link Button */}
                <Button
                  asChild
                  className="w-full h-touch"
                >
                  <Link to="/auth/forgot-password">
                    <Mail className="mr-2 h-4 w-4" />
                    {t('auth.resetPasswordError.requestNewReset')}
                  </Link>
                </Button>

                {/* Back to Login Button */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-touch"
                >
                  <Link to="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('auth.resetPasswordError.backToSignIn')}
                  </Link>
                </Button>
              </div>

              {/* Support Contact */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  {t('auth.resetPasswordError.needHelp')}{' '}
                  <a
                    href="mailto:support@barback.app"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('auth.resetPasswordError.contactSupportLink')}
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
