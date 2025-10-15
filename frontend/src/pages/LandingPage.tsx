import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';

export function LandingPage()
{
  const { t } = useI18n();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleGetStarted = () =>
  {
    if (user)
    {
      void navigate('/dashboard');
    }
    else
    {
      void navigate('/auth/register');
    }
  };

  const handleSignIn = () =>
  {
    void navigate('/auth/login');
  };

  return (
    <main className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-text-primary">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-text-secondary">
          {t('landing.hero.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="text-lg px-8"
          >
            {t('landing.hero.getStarted')}
          </Button>
          {!user && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleSignIn}
              className="text-lg px-8"
            >
              {t('landing.hero.signIn')}
            </Button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-16">
        <Card className="bg-background-secondary">
          <CardHeader>
            <CardTitle className="text-primary">
              {t('landing.features.inventory.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-text-secondary">
              {t('landing.features.inventory.description')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-background-secondary">
          <CardHeader>
            <CardTitle className="text-primary">
              {t('landing.features.mobile.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-text-secondary">
              {t('landing.features.mobile.description')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-background-secondary">
          <CardHeader>
            <CardTitle className="text-primary">
              {t('landing.features.team.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-text-secondary">
              {t('landing.features.team.description')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-background-secondary">
          <CardHeader>
            <CardTitle className="text-primary">
              {t('landing.features.alerts.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-text-secondary">
              {t('landing.features.alerts.description')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-background-secondary">
          <CardHeader>
            <CardTitle className="text-primary">
              {t('landing.features.analytics.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-text-secondary">
              {t('landing.features.analytics.description')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-background-secondary">
          <CardHeader>
            <CardTitle className="text-primary">
              {t('landing.features.reports.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-text-secondary">
              {t('landing.features.reports.description')}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16 p-12 rounded-lg border bg-background-secondary">
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
          {t('landing.cta.title')}
        </h2>
        <p className="text-lg text-text-secondary mb-6">
          {t('landing.cta.description')}
        </p>
        <Button
          size="lg"
          onClick={handleGetStarted}
          className="text-lg px-8"
        >
          {t('landing.cta.button')}
        </Button>
      </div>
    </main>
  );
}
