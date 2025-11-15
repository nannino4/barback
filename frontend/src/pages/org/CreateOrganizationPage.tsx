import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer, Stack } from '@/components/layout';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/useI18n';
import { subscriptionApi } from '@/api/subscription-api';
import { CreateOrganizationFormSchema } from '@/types/organization';
import type { CreateOrganizationFormData } from '@/types/organization';
import type { BillingInterval } from '@/types/subscription';
import { OrgNameStep, PlanSelectionStep, PaymentStep } from '@/components/features/organizations/wizard';
import { stripeAppearance, getStripeLocale } from '@/lib/stripe/config';

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
  const navigate = useNavigate();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStepType>(WizardStep.NAME);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('MONTHLY');
  
  // Payment state - null means we haven't setup payment yet
  const [paymentSetup, setPaymentSetup] = useState<{
    clientSecret: string;
    stripeSubscriptionId: string;
    isTrial: boolean;
  } | null>(null);

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

  const handleCancel = () =>
  {
    void navigate('/organizations');
  };

  /**
   * Handle successful organization creation
   */
  const handleSuccess = () =>
  {
    void navigate('/organizations');
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('organizations.create.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('organizations.create.description')}
          </p>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {[WizardStep.NAME, WizardStep.PLAN, WizardStep.PAYMENT].map((step) => (
                <div
                  key={step}
                  className="flex items-center flex-1"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    {step + 1}
                  </div>
                  {step < WizardStep.PAYMENT && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {t('organizations.create.wizard.stepName.name')}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('organizations.create.wizard.stepName.plan')}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('organizations.create.wizard.stepName.payment')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Wizard Steps */}
        <FormProvider {...form}>
          {currentStep === WizardStep.NAME && (
            <Card>
              <CardContent className="pt-6">
                <OrgNameStep
                  onNext={handleNextFromName}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === WizardStep.PLAN && (
            <Card>
              <CardContent className="pt-6">
                <PlanSelectionStep
                  selectedInterval={billingInterval}
                  onSelectInterval={setBillingInterval}
                  isTrial={eligibility?.eligible || false}
                  onNext={() => void handleNextFromPlan()}
                  onBack={handleBackFromPlan}
                />
              </CardContent>
            </Card>
          )}
        </FormProvider>

        {/* Payment Step with Stripe Elements */}
        {paymentSetup && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentSetup.clientSecret,
              appearance: stripeAppearance,
              locale: getStripeLocale(currentLanguage),
            }}
          >
            <PaymentStep
              stripeSubscriptionId={paymentSetup.stripeSubscriptionId}
              organizationName={form.getValues('name')}
              isTrial={paymentSetup.isTrial}
              onBack={handleBackFromPayment}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}
      </Stack>
    </PageContainer>
  );
};
