import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Check } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PageContainer, Stack } from '@/components/layout';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/useI18n';
import { subscriptionApi } from '@/api/subscription-api';
import { CreateOrganizationFormSchema } from '@/types/organization';
import type { CreateOrganizationFormData } from '@/types/organization';
import type { BillingInterval } from '@/types/subscription';
import { CreateOrganizationPaymentForm } from '@/components/features/organizations/CreateOrganizationPaymentForm';

// Initialize Stripe - cast env var to string to satisfy TypeScript
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

/**
 * CreateOrganizationPage - Create new organization with subscription
 * 
 * Implements Stripe's recommended subscription flow:
 * 1. Check trial eligibility
 * 2. Collect organization details + billing interval
 * 3. Setup subscription payment (creates Stripe subscription, returns clientSecret)
 * 4. Show Payment Element for both trial AND paid (Stripe best practice)
 * 5. User confirms payment
 * 6. Webhook creates local subscription record
 * 7. Create organization with confirmed subscription
 * 
 * Key improvements:
 * - Trial and paid both collect payment upfront (seamless conversion)
 * - No local subscription until webhook confirms (prevents incomplete records)
 * - Proper error handling and loading states
 * - Mobile-responsive design
 */
export const CreateOrganizationPage: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  
  // Form state
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('MONTHLY');
  const [organizationName, setOrganizationName] = useState('');
  
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
    },
  });

  /**
   * Handle form submission
   * Sets up subscription payment and shows Payment Element
   */
  const handleFormSubmit = async (data: CreateOrganizationFormData) =>
  {
    setOrganizationName(data.name);
    
    // Setup payment for trial or paid subscription
    const isTrial = eligibility?.eligible || false;
    await setupPaymentMutation.mutateAsync(isTrial);
  };

  /**
   * Handle back button from payment form
   */
  const handleBackToForm = () =>
  {
    setPaymentSetup(null);
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

        {/* Trial Badge */}
        {eligibility?.eligible && !paymentSetup && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {t('subscription.trial.eligible')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('subscription.trial.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Organization Details Form */}
        {!paymentSetup && (
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.create.detailsTitle')}</CardTitle>
              <CardDescription>
                {t('organizations.create.detailsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)}>
                  <Stack space="lg">
                    {/* Organization Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('organizations.create.nameLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('organizations.create.namePlaceholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Billing Interval Selection */}
                    <div>
                      <FormLabel>{t('subscription.selectPlan')}</FormLabel>
                      <Stack direction="horizontal" space="sm" className="mt-2">
                        <Button
                          type="button"
                          variant={billingInterval === 'MONTHLY' ? 'default' : 'outline'}
                          onClick={() => setBillingInterval('MONTHLY')}
                          className="flex-1"
                        >
                          <Stack space="xs" className="items-center">
                            <span className="font-semibold">{t('subscription.monthly')}</span>
                            <span className="text-xs opacity-80">€29.99/mo</span>
                          </Stack>
                        </Button>
                        <Button
                          type="button"
                          variant={billingInterval === 'YEARLY' ? 'default' : 'outline'}
                          onClick={() => setBillingInterval('YEARLY')}
                          className="flex-1"
                        >
                          <Stack space="xs" className="items-center">
                            <span className="font-semibold">{t('subscription.yearly')}</span>
                            <span className="text-xs opacity-80">
                              €299/yr
                              <span className="ml-1 text-success">(-17%)</span>
                            </span>
                          </Stack>
                        </Button>
                      </Stack>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={setupPaymentMutation.isPending}
                    >
                      {setupPaymentMutation.isPending
                        ? t('organizations.create.checkingEligibility')
                        : t('common.continue')}
                    </Button>
                  </Stack>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment Form with Stripe Elements */}
        {paymentSetup && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentSetup.clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <CreateOrganizationPaymentForm
              stripeSubscriptionId={paymentSetup.stripeSubscriptionId}
              organizationName={organizationName}
              isTrial={paymentSetup.isTrial}
              onBack={handleBackToForm}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}
      </Stack>
    </PageContainer>
  );
};
