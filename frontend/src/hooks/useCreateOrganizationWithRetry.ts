import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization-api';
import { ApiError } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import type { OrganizationResponse } from '@/types/organization';

type CreateOrganizationWithRetryOptions = {
  organizationName: string;
  stripeSubscriptionId: string;
  onAttempt?: (attempt: number, maxAttempts: number) => void;
};

const CREATE_ORG_MAX_ATTEMPTS = 5;
const CREATE_ORG_RETRY_DELAY_MS = 2000;

const wait = (ms: number): Promise<void> =>
{
  return new Promise((resolve) =>
  {
    window.setTimeout(resolve, ms);
  });
};

const shouldRetryOrganizationCreation = (error: unknown): boolean =>
{
  if (!ApiError.isApiError(error))
  {
    return false;
  }

  return error.error === 'SUBSCRIPTION_NOT_FOUND' || error.error === 'SUBSCRIPTION_NOT_ACTIVE';
};

export const useCreateOrganizationWithRetry = () =>
{
  const queryClient = useQueryClient();

  const createOrganizationMutation = useMutation({
    mutationFn: ({
      organizationName,
      stripeSubscriptionId,
    }: CreateOrganizationWithRetryOptions) =>
      organizationApi.createOrganization({
        name: organizationName,
        stripeSubscriptionId,
      }),
    onSuccess: () =>
    {
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
  });

  const createOrganizationWithRetry = async (
    options: CreateOrganizationWithRetryOptions,
  ): Promise<OrganizationResponse> =>
  {
    for (let attempt = 1; attempt <= CREATE_ORG_MAX_ATTEMPTS; attempt += 1)
    {
      options.onAttempt?.(attempt, CREATE_ORG_MAX_ATTEMPTS);

      try
      {
        return await createOrganizationMutation.mutateAsync(options);
      }
      catch (error)
      {
        if (!shouldRetryOrganizationCreation(error) || attempt === CREATE_ORG_MAX_ATTEMPTS)
        {
          throw error;
        }

        await wait(CREATE_ORG_RETRY_DELAY_MS);
      }
    }

    throw new Error('Unexpected organization creation failure.');
  };

  return {
    createOrganizationWithRetry,
    isCreating: createOrganizationMutation.isPending,
  };
};
