import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import { Button } from '@/components/ui/button';
import { PersonalPaymentMethodsCard } from '@/components/user/PersonalPaymentMethodsCard';
import { useI18n } from '@/hooks/useI18n';

/**
 * PaymentMethodsPage - personal payment method settings.
 */
export function PaymentMethodsPage()
{
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleGoBack = () =>
  {
    void navigate(-1);
  };

  return (
    <PageContainer>
      <Section>
        <Stack space="md">
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleGoBack}
              className="mb-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>

            <h1 className="font-heading text-2xl font-bold text-foreground">
              {t('payment.title')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('payment.personalDescription')}
            </p>
          </div>

          <PersonalPaymentMethodsCard />
        </Stack>
      </Section>
    </PageContainer>
  );
}
