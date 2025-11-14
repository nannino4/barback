import { useI18n } from '@/hooks/useI18n';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';

export function InventoryPage()
{
  const { t } = useI18n();
    
  return (
    <PageContainer>
      <Section>
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            {t('inventory.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('inventory.placeholder')}
          </p>
        </div>
      </Section>
    </PageContainer>
  );
}
