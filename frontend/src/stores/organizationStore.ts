import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrganizationMembershipResponse } from '@/types/organization';
import type { InvitationResponse } from '@/types/invitation';

/**
 * Organization store state interface
 * 
 * This store manages:
 * - currentOrg: The user's selected organization (persisted across sessions)
 * - organizations: List of all orgs the user is a member of (in-memory, refreshed on mount)
 * - pendingInvitations: List of pending invites for the user (in-memory, refreshed on mount)
 * 
 * Note: Only currentOrg is persisted. Organizations and invitations are fetched
 * fresh on app mount to ensure data consistency.
 */
interface OrganizationStore
{
  // Persisted state
  currentOrg: OrganizationMembershipResponse | null;

  // In-memory state (refreshed on mount)
  organizations: OrganizationMembershipResponse[];
  pendingInvitations: InvitationResponse[];

  // Actions
  setCurrentOrg: (org: OrganizationMembershipResponse | null) => void;
  setOrganizations: (orgs: OrganizationMembershipResponse[]) => void;
  setPendingInvitations: (invites: InvitationResponse[]) => void;
  clearOrganizationData: () => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      // Initial state
      currentOrg: null,
      organizations: [],
      pendingInvitations: [],

      // Set the current organization (user's selection)
      setCurrentOrg: (org) =>
        set({
          currentOrg: org,
        }),

      // Update the list of organizations the user is a member of
      setOrganizations: (orgs) =>
        set((state) =>
        {
          // If currentOrg is set but no longer in the list, clear it
          const currentOrgStillExists = state.currentOrg
            ? orgs.some((o) => o.org.id === state.currentOrg!.org.id)
            : false;

          return {
            organizations: orgs,
            currentOrg: currentOrgStillExists ? state.currentOrg : null,
          };
        }),

      // Update the list of pending invitations
      setPendingInvitations: (invites) =>
        set({
          pendingInvitations: invites,
        }),

      // Clear all organization data (used on logout)
      clearOrganizationData: () =>
        set({
          currentOrg: null,
          organizations: [],
          pendingInvitations: [],
        }),
    }),
    {
      name: 'organization-storage',
      // Only persist currentOrg - organizations and invitations are fetched fresh
      partialize: (state) => ({
        currentOrg: state.currentOrg,
      }),
    },
  ),
);
