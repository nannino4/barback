import React, { useMemo, useState, use } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer, Stack } from '@/components/layout';
import { Spinner } from '@/components/ui/spinner';
import { WizardSteps } from '@/components/ui/wizard-steps';
import { useI18n } from '@/hooks/useI18n';
import { subscriptionApi } from '@/api/subscription-api';
import { useCreateOrganizationWithRetry } from '@/hooks/useCreateOrganizationWithRetry';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { CreateOrganizationFormSchema } from '@/types/organization';
import type { CreateOrganizationFormData } from '@/types/organization';
import { OrgNameStep, PaymentStep } from '@/components/features/organizations/wizard';
import { TRIAL_DAYS } from '@/constants/pricing';
import { buildStripeAppearance, getStripeLocale, stripeFonts } from '@/lib/stripe/config';
import { ResolvedThemeContext } from '@/contexts/ThemeContext';
import { ROUTES } from '@/constants/routes';

// Initialize Stripe - cast env var to string to satisfy TypeScript
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

/**
 * Wizard steps. The plan-selection step was removed (yearly-only). Trial-eligible
 * users complete the flow on the NAME step alone; paid users continue to PAYMENT.
 */
const WizardStep = {
  NAME: 0,
  PAYMENT: 1,
} as const;

type WizardStepType = typeof WizardStep[keyof typeof WizardStep];

/**
 * CreateOrganizationPage - Organization creation wizard.
 *
 * Trial-eligible users (first organization):
 * 1. Enter & validate the organization name
 * 2. "Start free trial" — activates a frictionless trial (no card) and creates the
 *    organization in one action, then redirects.
 *
 * Non-eligible users (paid, e.g. a second organization):
 * 1. Enter & validate the organization name
 * 2. Complete payment for the yearly plan (details shown on the payment step)
 */
export const CreateOrganizationPage: React.FC = () =>
{
  const { t, currentLanguage } = useI18n();
  const resolvedTheme = use(ResolvedThemeContext);
  const stripeAppearance = useMemo(() => buildStripeAppearance(resolvedTheme), [resolvedTheme]);
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStepType>(WizardStep.NAME);

  // Payment state (paid path only) - null means we haven't setup payment yet
  const [paymentSetup, setPaymentSetup] = useState<{
    clientSecret: string;
    stripeSubscriptionId: string;
    intentType: 'setup' | 'payment';
  } | null>(null);

  const getIntentTypeFromClientSecret = (clientSecret: string): 'setup' | 'payment' =>
  {
    if (clientSecret.startsWith('seti_'))
    {
      return 'setup';
    }

    // Default to payment for pi_ and any other future types
    return 'payment';
  };

  // Check trial eligibility
  const { data: eligibility, isLoading: isCheckingEligibility } = useQuery({
    queryKey: ['trial-eligibility'],
    queryFn: subscriptionApi.checkTrialEligibility,
  });
  const isTrial = eligibility?.eligible ?? false;

  // Form setup with react-hook-form
  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(CreateOrganizationFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const { createOrganizationWithRetry } = useCreateOrganizationWithRetry();

  /**
   * Handle successful organization creation.
   * Creator is always the owner, so we pass OWNER role.
   */
  const handleSuccess = (orgId: string) =>
  {
    void navigate(ROUTES.ORGS.detail(orgId), { state: { userOrgRole: 'OWNER' } });
  };

  /**
   * Trial path: activate a frictionless trial and create the organization in one go.
   */
  const trialMutation = useMutation({
    mutationFn: async (): Promise<string> =>
    {
      const trial = await subscriptionApi.activateTrial();
      const organization = await createOrganizationWithRetry({
        organizationName: form.getValues('name'),
        stripeSubscriptionId: trial.stripeSubscriptionId,
      });
      return organization.id;
    },
    onSuccess: handleSuccess,
  });

  /**
   * Paid path: create the Stripe subscription and move to the payment step.
   */
  const setupPaymentMutation = useMutation({
    mutationFn: () =>
      subscriptionApi.setupSubscriptionPayment({
        billingInterval: 'YEARLY',
        isTrial: false,
      }),
    onSuccess: (data) =>
    {
      setPaymentSetup({
        clientSecret: data.clientSecret,
        stripeSubscriptionId: data.stripeSubscriptionId,
        intentType: getIntentTypeFromClientSecret(data.clientSecret),
      });
      setCurrentStep(WizardStep.PAYMENT);
    },
  });

  /**
   * Advance from the name step: trial users finish here, paid users go to payment.
   */
  const handleNextFromName = () =>
  {
    if (isTrial)
    {
      trialMutation.mutate();
      return;
    }

    setupPaymentMutation.mutate();
  };

  const handleBackFromPayment = () =>
  {
    setPaymentSetup(null);
    setCurrentStep(WizardStep.NAME);
  };

  const handleCancel = () =>
  {
    void navigate(ROUTES.ORGS.ROOT);
  };

  const setupError = trialMutation.error ?? setupPaymentMutation.error;
  const setupErrorMessage = setupError
    ? ApiError.isApiError(setupError)
      ? getLocalizedErrorMessage(setupError, t)
      : t('errors.genericError')
    : null;

  const isSubmittingName = trialMutation.isPending || setupPaymentMutation.isPending;

  /**
   * Loading State
   */
  if (isCheckingEligibility)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg" className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" text={t('common.loading')} />
          </div>
        </Stack>
      </PageContainer>
    );
  }

  /**
   * Main Content
   */
  return (
    <PageContainer className="py-6">
      <Stack space="lg" className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="relative flex items-center justify-center">
          {currentStep === WizardStep.PAYMENT && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleBackFromPayment}
              className="absolute left-0"
              aria-label={t('common.back')}
            >
              <ArrowLeft />
            </Button>
          )}

          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            {t('organizations.create.title')}
          </h1>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="absolute right-0"
            aria-label={t('common.close')}
          >
            <X />
          </Button>
        </div>

        {/* Progress Indicator - only for the paid (two-step) path */}
        {!isTrial && (
          <WizardSteps
            steps={[
              {
                label: t('organizations.create.wizard.stepName.name'),
                isComplete: currentStep > WizardStep.NAME,
                isCurrent: currentStep === WizardStep.NAME,
              },
              {
                label: t('organizations.create.wizard.stepName.payment'),
                isComplete: false,
                isCurrent: currentStep === WizardStep.PAYMENT,
              },
            ]}
          />
        )}

        {/* Setup error (trial activation / payment setup) */}
        {currentStep === WizardStep.NAME && setupErrorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{setupErrorMessage}</p>
          </div>
        )}

        {/* Name Step */}
        <FormProvider {...form}>
          {currentStep === WizardStep.NAME && (
            <Card>
              <CardContent>
                <OrgNameStep
                  onNext={handleNextFromName}
                  isSubmitting={isSubmittingName}
                  submitLabel={isTrial ? t('subscription.startTrial') : t('common.continue')}
                  footnote={isTrial
                    ? t('organizations.create.nameStep.trialNote' as never, { days: TRIAL_DAYS }) as string
                    : undefined}
                />
              </CardContent>
            </Card>
          )}
        </FormProvider>

        {/* Payment Step with Stripe Elements (paid path) */}
        {paymentSetup && (
          <Elements
            key={`stripe-elements-${resolvedTheme}`}
            stripe={stripePromise}
            options={{
              clientSecret: paymentSetup.clientSecret,
              appearance: stripeAppearance,
              locale: getStripeLocale(currentLanguage),
              fonts: stripeFonts,
            }}
          >
            <PaymentStep
              stripeSubscriptionId={paymentSetup.stripeSubscriptionId}
              organizationName={form.getValues('name')}
              isTrial={false}
              intentType={paymentSetup.intentType}
              onBack={handleBackFromPayment}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}
      </Stack>
    </PageContainer>
  );
};
