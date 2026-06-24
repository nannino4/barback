import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import { Grid } from '@/components/layout/Grid';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants/routes';

export function LandingPage()
{
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);

  const getStartedTo = user ? ROUTES.INVENTORY : ROUTES.AUTH.REGISTER;

  return (
    <PageContainer>
      <Stack space="xl">
        {/* Hero Section */}
        <Section>
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                size="lg"
                asChild
                className="text-lg px-8"
              >
                <Link to={getStartedTo}>{t('landing.hero.getStarted')}</Link>
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg px-8"
                >
                  <Link to={ROUTES.AUTH.LOGIN}>{t('landing.hero.signIn')}</Link>
                </Button>
              )}
            </div>
          </div>
        </Section>

        {/* Features Section */}
        <Section>
          <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t('landing.features.inventory.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('landing.features.inventory.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t('landing.features.mobile.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('landing.features.mobile.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t('landing.features.team.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('landing.features.team.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t('landing.features.alerts.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('landing.features.alerts.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t('landing.features.analytics.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('landing.features.analytics.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  {t('landing.features.reports.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('landing.features.reports.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </Grid>
        </Section>

        {/* CTA Section */}
        <Section>
          <div className="text-center p-12 rounded-lg border border-border bg-card">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              {t('landing.cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('landing.cta.description')}
            </p>
            <Button size="lg" asChild className="text-lg px-8">
              <Link to={getStartedTo}>{t('landing.cta.button')}</Link>
            </Button>
          </div>
        </Section>
      </Stack>
    </PageContainer>
  );
}
