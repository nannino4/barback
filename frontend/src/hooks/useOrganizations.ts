import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notify';
import { useOrganizationStore } from '@/stores/organizationStore';
import { organizationApi } from '@/api/organization-api';
import { useI18n } from '@/hooks/useI18n';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';
import type {
  OrganizationMembership,
  OrgRole,
  EditOrganizationFormData,
} from '@/types/organization';

/**
 * Hook for managing organizations
 * Provides queries and mutations for organization management
 */
export const useOrganizations = () =>
{
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
    queryKey: queryKeys.organizations.all,
    queryFn: () => organizationApi.getOrganizations(),
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  /**
   * Query to fetch organizations filtered by role
   */
  const useOrganizationsByRole = (role: OrgRole) =>
  {
    return useQuery({
      queryKey: queryKeys.organizations.byRole(role),
      queryFn: () => organizationApi.getOrganizations(role),
      staleTime: CACHE_TIMES.ORGANIZATIONS,
    });
  };

  /**
   * Mutation to update an organization
   */
  const updateOrganizationMutation = useMutation({
    mutationFn: ({ 
      orgId, 
      data,
    }: {
      orgId: string;
      data: EditOrganizationFormData;
    }) =>
      organizationApi.updateOrganization(orgId, {
        name: data.name,
        settings: {
          defaultCurrency: data.defaultCurrency,
        },
      }),
    onSuccess: (_, variables) =>
    {
      // Invalidate queries to refetch data
      void queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all,
      });
      
      notify.success(t('orgManagement.overview.edit.success'));
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
  const switchOrganization = (org: OrganizationMembership) =>
  {
    setCurrentOrg(org);
    notify.success(t('organizations.switch.success', { name: org.org.name }));
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
    updateOrganization: updateOrganizationMutation.mutate,
    switchOrganization,
    useOrganizationsByRole,
    
    // Mutation states
    isUpdating: updateOrganizationMutation.isPending,
    updateError: updateOrganizationMutation.error,
  };
};
