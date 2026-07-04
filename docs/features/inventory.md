# Inventory

Inventory is Barback's primary workspace. The MVP focuses on product/category
management, current stock visibility, and manual stock adjustments with audit
history.

## Information architecture

- Inventory is the default landing page after authentication and organization
  selection.
- The Inventory page is operative: product list, search/filter, quick stock
  adjustment, product details.
- Organization Settings is administrative: product/category CRUD, members,
  subscription settings.
- Product deletion is intentionally available from product detail/admin contexts,
  not as a casual row action in the daily inventory list.

## Roles

- Owner/Manager: full product/category CRUD and stock adjustments.
- Staff: stock visibility and stock adjustments; admin CRUD is limited/hidden.

## Product list

The inventory product list shows all products for the selected organization.

MVP behavior:

- all products load at once;
- client-side search/filtering;
- category filter;
- product count calculated client-side;
- quick adjust button on every product row;
- row tap opens product detail;
- no pagination for MVP assumption of fewer than ~1000 products per org.

Visible row information should include:

- product image/placeholder;
- name;
- brand, if available;
- category;
- current quantity;
- unit of measure;
- low-stock indicator once threshold/par-level support exists;
- adjust-stock action.

## Product details

Product detail provides:

- full product information;
- prominent current stock;
- adjust-stock action;
- recent inventory history;
- edit/delete actions for owner/manager roles.

## Product management

Product creation/editing includes:

- name, required;
- brand, optional;
- description, optional;
- unit of measure, required;
- purchase price, optional;
- initial quantity on create;
- categories, optional/multi-select;
- inline category creation;
- preset/custom image support once implemented.

## Categories

Categories organize products and can be nested.

MVP behavior:

- category CRUD in Organization Settings;
- parent/child category relationships;
- circular parent references prevented;
- product counts calculated client-side;
- categories available for product filtering and product assignment;
- inline category creation from product forms.

## Stock adjustments

Stock adjustment is the core operative action.

Access points:

- product list row adjust button;
- product detail adjust button;
- future low-stock alert action.

Adjustment form captures:

- quantity/change;
- reason/type;
- optional note;
- current stock and preview of resulting quantity.

Reason types:

- `PURCHASE`: stock received; usually positive.
- `CONSUMPTION`: stock used; usually negative.
- `ADJUSTMENT`: correction; positive or negative.
- `STOCKTAKE`: physical count reconciliation.

Smart defaults:

- positive quantity defaults to purchase;
- negative quantity defaults to consumption;
- once the user manually selects a reason, auto-selection stops;
- mismatched reason/sign can warn but should not necessarily block submission.

Backend stock adjustment must atomically update product quantity and create an
inventory log.

## Inventory history

Inventory logs should show:

- adjustment type;
- quantity change;
- previous and new quantity;
- user who made the change;
- timestamp localized to the user's locale/timezone;
- note, if provided.

## Important backend endpoints

Examples include:

- `GET /api/orgs/:orgId/products`
- `GET /api/orgs/:orgId/products/:id`
- `POST /api/orgs/:orgId/products`
- `PUT /api/orgs/:orgId/products/:id`
- `DELETE /api/orgs/:orgId/products/:id`
- `POST /api/orgs/:orgId/products/:productId/adjust-stock`
- `GET /api/orgs/:orgId/products/:productId/logs`
- `GET /api/orgs/:orgId/categories`
- `POST /api/orgs/:orgId/categories`
- `PUT /api/orgs/:orgId/categories/:id`
- `DELETE /api/orgs/:orgId/categories/:id`

Confirm exact DTOs and route details in backend code before changing clients.

## Future work

- Product par level / low-stock threshold support.
- Alerts route and low-stock workflows.
- Product image preset library and custom upload.
- Offline read support and queued offline stock adjustments.
- Consumption analytics from inventory logs.
