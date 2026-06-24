import { Bell } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';

/**
 * AlertsPage - Low stock alerts and critical items
 * 
 * This page will show:
 * - Low stock items (below par level)
 * - Critical alerts requiring immediate action
 * - Quick actions to adjust stock or mark resolved
 * 
 * Coming in Sprint 5-6.
 */
export function AlertsPage()
{
  const { t } = useI18n();
    
  return (
    <PageContainer>
      <Section>
        <Stack space="lg" className="items-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <Stack space="sm" className="items-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {t('alerts.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('alerts.placeholder')}
            </p>
          </Stack>
        </Stack>
      </Section>
    </PageContainer>
  );
}
