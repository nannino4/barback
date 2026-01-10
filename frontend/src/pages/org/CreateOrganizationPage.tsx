import React, { useMemo, useState, use } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer, Stack } from '@/components/layout';
import { Spinner } from '@/components/ui/spinner';
import { WizardSteps } from '@/components/ui/wizard-steps';
import { useI18n } from '@/hooks/useI18n';
import { subscriptionApi } from '@/api/subscription-api';
import { CreateOrganizationFormSchema } from '@/types/organization';
import type { CreateOrganizationFormData } from '@/types/organization';
import type { BillingInterval } from '@/types/subscription';
import { OrgNameStep, PlanSelectionStep, PaymentStep } from '@/components/features/organizations/wizard';
import { buildStripeAppearance, getStripeLocale, stripeFonts } from '@/lib/stripe/config';
import { ResolvedThemeContext } from '@/contexts/ThemeContext';

// Initialize Stripe - cast env var to string to satisfy TypeScript
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

/**
 * Wizard steps
 */
const WizardStep = {
  NAME: 0,
  PLAN: 1,
  PAYMENT: 2,
} as const;

type WizardStepType = typeof WizardStep[keyof typeof WizardStep];

/**
 * CreateOrganizationPage - Multi-step wizard for creating organization with subscription
 * 
 * Flow:
 * 1. Check trial eligibility
 * 2. Step 1: Collect & validate organization name
 * 3. Step 2: Select billing interval (monthly/yearly)
 * 4. Step 3: Complete payment with Stripe
 * 5. Create organization after payment confirmed
 * 
 * Improvements:
 * - Real-time name validation with debouncing
 * - Clear step progression with back navigation
 * - Trial and paid both collect payment upfront (Stripe best practice)
 * - Proper error handling and loading states
 * - Mobile-responsive design
 */
export const CreateOrganizationPage: React.FC = () =>
{
  const { t, currentLanguage } = useI18n();
  const resolvedTheme = use(ResolvedThemeContext);
  const stripeAppearance = useMemo(() => buildStripeAppearance(resolvedTheme), [resolvedTheme]);
  const navigate = useNavigate();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStepType>(WizardStep.NAME);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('YEARLY');
  
  // Payment state - null means we haven't setup payment yet
  const [paymentSetup, setPaymentSetup] = useState<{
    clientSecret: string;
    stripeSubscriptionId: string;
    isTrial: boolean;
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

  // Form setup with react-hook-form
  const form = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(CreateOrganizationFormSchema),
    defaultValues: {
      name: '',
    },
  });

  /**
   * Setup subscription payment mutation
   * Creates Stripe subscription and returns clientSecret for Payment Element
   */
  const setupPaymentMutation = useMutation({
    mutationFn: (isTrial: boolean) =>
      subscriptionApi.setupSubscriptionPayment({
        billingInterval,
        isTrial,
      }),
    onSuccess: (data, isTrial) =>
    {
      // Store payment setup data to show Payment Element
      setPaymentSetup({
        clientSecret: data.clientSecret,
        stripeSubscriptionId: data.stripeSubscriptionId,
        isTrial,
        intentType: getIntentTypeFromClientSecret(data.clientSecret),
      });
      setCurrentStep(WizardStep.PAYMENT);
    },
  });

  /**
   * Step navigation handlers
   */
  const handleNextFromName = () =>
  {
    setCurrentStep(WizardStep.PLAN);
  };

  const handleNextFromPlan = async () =>
  {
    // Setup payment for trial or paid subscription
    const isTrial = eligibility?.eligible || false;
    await setupPaymentMutation.mutateAsync(isTrial);
  };

  const handleBackFromPlan = () =>
  {
    setCurrentStep(WizardStep.NAME);
  };

  const handleBackFromPayment = () =>
  {
    setPaymentSetup(null);
    setCurrentStep(WizardStep.PLAN);
  };

  const handleWizardBack = () =>
  {
    if (currentStep === WizardStep.PAYMENT)
    {
      handleBackFromPayment();
      return;
    }

    if (currentStep === WizardStep.PLAN)
    {
      handleBackFromPlan();
    }
  };

  const handleCancel = () =>
  {
    void navigate('/orgs');
  };

  /**
   * Handle successful organization creation
   * Redirects to the org management page to show subscription status
   * Creator is always the owner, so we pass OWNER role
   */
  const handleSuccess = (orgId: string) =>
  {
    void navigate(`/orgs/${orgId}`, { state: { userOrgRole: 'OWNER' } });
  };

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
          {currentStep !== WizardStep.NAME && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleWizardBack}
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

        {/* Progress Indicator */}
        <WizardSteps
          steps={[
            {
              label: t('organizations.create.wizard.stepName.name'),
              isComplete: currentStep > WizardStep.NAME,
              isCurrent: currentStep === WizardStep.NAME,
            },
            {
              label: t('organizations.create.wizard.stepName.plan'),
              isComplete: currentStep > WizardStep.PLAN,
              isCurrent: currentStep === WizardStep.PLAN,
            },
            {
              label: t('organizations.create.wizard.stepName.payment'),
              isComplete: false,
              isCurrent: currentStep === WizardStep.PAYMENT,
            },
          ]}
        />

        {/* Wizard Steps */}
        <FormProvider {...form}>
          {currentStep === WizardStep.NAME && (
            <Card>
              <CardContent>
                <OrgNameStep
                  onNext={handleNextFromName}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === WizardStep.PLAN && (
            <PlanSelectionStep
              selectedInterval={billingInterval}
              onSelectInterval={setBillingInterval}
              isTrial={eligibility?.eligible || false}
              onNext={() => void handleNextFromPlan()}
            />
          )}
        </FormProvider>

        {/* Payment Step with Stripe Elements */}
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
              isTrial={paymentSetup.isTrial}
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
