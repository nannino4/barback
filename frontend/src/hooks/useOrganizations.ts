import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useOrganizationStore } from '@/stores/organizationStore';
import { organizationApi } from '@/api/organization-api';
import { subscriptionApi } from '@/api/subscription-api';
import { useI18n } from '@/hooks/useI18n';
import type {
  OrganizationMembership,
  OrgRole,
  CreateOrganizationRequest,
} from '@/types/organization';
import type { CreateSubscriptionRequest } from '@/types/subscription';

/**
 * Hook for managing organizations
 * Provides queries and mutations for organization management
 */
export const useOrganizations = () =>
{
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const {
    currentOrg,
    organizations,
    setCurrentOrg,
    setOrganizations,
  } = useOrganizationStore();

  /**
   * Query to fetch all organizations the user is a member of
   */
  const organizationsQuery = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationApi.getOrganizations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Query to fetch organizations filtered by role
   */
  const useOrganizationsByRole = (role: OrgRole) =>
  {
    return useQuery({
      queryKey: ['organizations', role],
      queryFn: () => organizationApi.getOrganizations(role),
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Mutation to create a new organization
   * Includes subscription creation logic
   */
  const createOrganizationMutation = useMutation({
    mutationFn: async ({ 
      orgData, 
      subscriptionData,
    }: {
      orgData: Omit<CreateOrganizationRequest, 'subscriptionId'>;
      subscriptionData: CreateSubscriptionRequest;
    }) =>
    {
      // Step 1: Create subscription
      const subscription = await subscriptionApi.createSubscription(subscriptionData);
      
      // Step 2: Create organization with subscription ID
      const organization = await organizationApi.createOrganization({
        ...orgData,
        subscriptionId: subscription.id,
      });
      
      return { organization, subscription };
    },
    onSuccess: () =>
    {
      // Invalidate and refetch organizations
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      toast.success(t('organizations.create.success'));
      
      // Organization will be selected and user redirected by the component
      // The component has access to redirectTo query param
    },
    // No onError - errors are displayed declaratively in the component
  });

  /**
   * Update organizations in store when query succeeds
   */
  useEffect(() =>
  {
    if (organizationsQuery.data)
    {
      setOrganizations(organizationsQuery.data);
      
      // Auto-select if only one org and no current selection
      // Note: We intentionally don't include currentOrg in deps to avoid infinite loops.
      // This effect should only run when the query data changes from the API.
      if (organizationsQuery.data.length === 1 && !currentOrg)
      {
        setCurrentOrg(organizationsQuery.data[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationsQuery.data, setOrganizations, setCurrentOrg]);

  /**
   * Switch to a different organization
   */
  const switchOrganization = (org: OrganizationMembership, redirectTo?: string) =>
  {
    setCurrentOrg(org);
    toast.success(t('organizations.switch.success', { name: org.org.name }));
    
    // Navigate to dashboard or specified redirect
    void navigate(redirectTo || '/dashboard');
  };

  return {
    // State
    currentOrg,
    organizations,
    
    // Query
    organizationsQuery,
    isLoading: organizationsQuery.isLoading,
    error: organizationsQuery.error,
    
    // Actions
    createOrganization: createOrganizationMutation.mutate,
    switchOrganization,
    useOrganizationsByRole,
    
    // Mutation states
    isCreating: createOrganizationMutation.isPending,
    createError: createOrganizationMutation.error,
  };
};
