# Organizations and Membership

Organizations represent venues. Each organization has one inventory workspace and
role-based access for owners, managers, and staff.

## Roles

- **Owner**: full organization control, subscription/payment management, member
  management, product/category administration, inventory operations.
- **Manager**: member/invitation management where allowed, product/category
  administration, inventory operations.
- **Staff**: focused inventory access and stock adjustments; no admin settings.

`UserOrgRelation` is the backend source of truth for membership and organization
roles.

## Core flows

### Organization creation

1. Authenticated and email-verified user starts organization creation.
2. Subscription/trial eligibility is checked.
3. Eligible first organization can start a 90-day frictionless trial without a
   payment method.
4. Non-trial path uses the paid yearly Stripe flow.
5. Organization and owner relationship are created atomically.
6. User lands in the inventory workspace for the new organization.

### Organization hub

The organizations hub shows:

- pending invitations that need attention;
- organizations the user belongs to;
- search/filtering by name or role;
- create-venue entrypoint when allowed.

### Organization switching

- The current organization context is explicit in the top navigation.
- Desktop uses a popover switcher.
- Mobile uses a sheet/bottom-sheet switcher.
- Selecting an organization changes context and routes to its inventory.

### Invitations

Owners/managers can invite users by email with a target organization role.

Invitation behavior:

- Invited users receive localized email invitations.
- Existing users can accept/decline after login.
- New users can register and then accept.
- Invitations can be revoked before acceptance.
- Pending invitations are shown in the organization hub and user menu cues.

### Member management

- Owners/managers can view members.
- Owners/managers can update eligible member roles.
- Owners/managers can remove members except the owner.
- Non-owner members can leave an organization.
- Owner transfer/deletion flows are deferred.

## Organization settings

Organization settings are role-gated and contain org-level admin work:

- organization name/settings;
- subscription and organization payment method;
- members and invitations;
- products;
- categories.

These tasks do not belong in the personal user menu.

## Important backend endpoints

Examples include:

- `GET /api/orgs`
- `POST /api/orgs`
- `GET /api/orgs/:id`
- `PUT /api/orgs/:id`
- `GET /api/orgs/:id/members`
- `PUT /api/orgs/:id/members/:userId/role`
- `DELETE /api/orgs/:id/members/:userId`
- `POST /api/orgs/:id/leave`
- `POST /api/orgs/:id/invites`
- `GET /api/orgs/:id/invitations`
- `DELETE /api/orgs/:id/invites/:invitationId`
- `GET /api/invitations`
- `POST /api/invitations/accept/:token`
- `POST /api/invitations/decline/:token`
- public invitation detail/accept/decline endpoints for unauthenticated flows.

Confirm exact route names and DTOs in backend code before changing clients.

## UX principles

- Inventory is the default destination after auth/org selection.
- Keep organization context visible.
- Keep staff focused on high-frequency stock operations.
- Keep owner/manager admin affordances discoverable but not intrusive.
- Use confirmation dialogs for destructive/high-impact actions.

## Related docs

- Product definition: `docs/product.md`
- Subscriptions and billing: `docs/features/subscriptions-billing.md`
- Inventory: `docs/features/inventory.md`
- Frontend UX reference: `frontend/docs/ux.md`
