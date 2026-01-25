# Product List (Inventory Page)

## Feature Overview

The Product List is the **main operative view** of Barback, serving as the default landing page after authentication and organization selection. It provides immediate visibility into stock levels and enables quick stock adjustments during daily bar operations.

This view is **operative-only** - focused on viewing products and adjusting stock. Administrative tasks like editing product details or deleting products are handled in Organization Settings.

## Navigation Context

```
Main Navigation Structure:
├── Inventory (default landing) ← THIS DOCUMENT
├── Alerts (when implemented)
└── More/Settings

Mobile Bottom Nav:
├── Inventory (Products)
├── Alerts
└── More

The Inventory page:
├── Shows product list with current stock levels
├── Enables one-click stock adjustments
├── Provides search and filtering
└── Links to product details
```

## User Experience Flows

### Initial Product Loading Journey

```
1. User Authenticates & Selects Organization
   ├── After login → redirect to /orgs/:orgId/inventory
   ├── After org selection → redirect to inventory
   └── Direct URL: /orgs/:orgId/inventory
   ↓
2. Products Page (Main Landing)
   ├── Loading state with skeleton rows
   ├── API call: GET /api/orgs/:orgId/products
   └── Cache products in memory for filtering
   ↓
3. Product List Display
   ├── Vertically aligned rows for easy scanning
   ├── Each row shows key data at a glance
   ├── Consistent column alignment across rows
   └── Empty state if no products
   ↓
4. User Interaction Ready
   ├── Click/tap product row for details
   ├── Add new product button (above list)
   ├── Filter by category (client-side)
   └── Search products (client-side)
```

### Product Row Layout

```
Desktop Row Layout:
┌─────┬──────────────────────────┬──────────┬─────────────┬──────┬─────┐
│ Img │ Name / Brand             │ Category │ Current Qty │ Unit │ [±] │
├─────┼──────────────────────────┼──────────┼─────────────┼──────┼─────┤
│ 🥃  │ Johnnie Walker Black     │ Whiskey  │     7       │ btl  │ [±] │
│     │ Johnnie Walker           │          │  ⚠️ low     │      │     │
└─────┴──────────────────────────┴──────────┴─────────────┴──────┴─────┘

Mobile Row Layout (Compact):
┌───────────────────────────────────────────────────┐
│ [🥃] Johnnie Walker Black     7 btl ⚠️  [±] │
│      Johnnie Walker · Whiskey                │
└───────────────────────────────────────────────────┘

Visible columns:
├── Product image (thumbnail from preset pool)
├── Product name (primary text)
├── Brand (secondary text, if available)
├── Category (badge or text)
├── Current Quantity (PROMINENT - key info)
├── Unit of measure
├── Low stock indicator (when below threshold)
└── Adjust stock button (±) - opens adjustment sheet

Row interactions:
├── Tap row → View product details
└── Tap adjust button (±) → Open stock adjustment sheet
```

## Search and Filtering

### Filtering Strategy (MVP - All Client-Side)

```
Client-Side Filtering:
├── All products loaded on initial page load
├── Search and category filters applied in-memory
├── Instant results with no loading states
├── Works offline once data is cached
├── Product count per category calculated locally
└── Assumption: products per org < 1000
```

### Search Products Flow

```
1. Search Interaction
   ├── Focus search input
   ├── Type product name or brand
   └── Debounced filtering (150ms)
   ↓
2. Search Execution
   ├── Filter cached products in memory
   ├── Match against: name, brand, description
   ├── Case-insensitive partial matching
   └── No API call needed
   ↓
3. Results Display
   ├── Filtered product list (instant update)
   ├── Result count: "Showing X of Y products"
   └── Clear search button (X icon)
```

### Filter by Category Flow

```
1. Category Filter Interaction
   ├── Click category filter dropdown/chips
   └── "All Categories" shown by default
   ↓
2. Category Selection
   ├── Single category select (simpler UX)
   ├── "All Categories" option to reset
   └── Show category name with product count
   ↓
3. Filter Application
   ├── Filter cached products by categoryId
   ├── Instant update (no loading)
   └── Combine with search filter
   ↓
4. Filter Feedback
   ├── Active filter chip/badge shown
   ├── "Showing X of Y products"
   └── "Clear filters" action
```

## UI Components

### Product List Component

```
ProductList
├── Header
│   ├── Title: "Inventory"
│   ├── Product count: "X products"
│   └── Add Product button (always visible, above list)
├── Toolbar
│   ├── Search input
│   ├── Category filter (dropdown or chips)
│   └── Low-stock filter toggle
├── Product List
│   ├── ProductRow (for each product)
│   └── Loading/Empty states
└── Filter Status
    └── "Showing X of Y products" (when filtered)
```

### Product Row Component

```
ProductRow
├── Image Section (left)
│   ├── Product image thumbnail (40x40 or 48x48)
│   └── Default placeholder if no image
├── Info Section (center, flexible)
│   ├── Product name (primary text, bold)
│   ├── Brand (secondary text, muted)
│   └── Category badge or text
├── Stock Section (right-aligned)
│   ├── Current quantity (large/bold)
│   ├── Unit of measure
│   └── Low stock indicator (⚠️ icon or color)
└── Actions Section (far right)
    └── Adjust stock button (± icon)
        └── Opens stock adjustment sheet (one click)

Row tap behavior:
└── Tap anywhere (except adjust button) → View product details
```

## Mobile Considerations

```
Mobile Optimizations:
├── List view (same as desktop for consistency)
├── Pull-to-refresh to reload products
├── Add Product button above list (no FAB)
├── Bottom sheet for filters
├── Tap row to view details
└── Tap adjust button (±) to open stock adjustment sheet

Touch Targets:
├── Min 48px row height
├── Large tap area for entire row
├── Adjust button easily tappable (±)
└── Adequate spacing between elements
```

## Empty States

```
No Products:
├── Icon: Package or inventory illustration
├── Title: "No products yet"
├── Description: "Add your first product to start tracking inventory"
└── CTA: "Add Product" button

No Search Results:
├── Icon: Search illustration
├── Title: "No products found"
├── Description: "Try adjusting your search or filters"
└── CTA: "Clear filters" button
```

## Loading States

```
Initial Load:
├── Skeleton rows matching product row layout
├── 5-8 skeleton rows visible
└── Toolbar visible (not skeleton)

Refresh:
├── Pull-to-refresh indicator (mobile)
└── Existing content remains visible
```

## Error Handling

```
Product Fetch Errors:
├── Network error → Retry button + cached data if available
├── 401 Unauthorized → Redirect to login
├── 403 Forbidden → "Access denied" message
└── 500 Server error → Generic error + retry
```

## Performance Optimizations

```
Data Loading (MVP - No Pagination):
├── Load ALL products on initial page load
├── Cache products in store with TTL (5 minutes)
├── Client-side filtering and search (instant)
├── Calculate category product counts in memory
├── Stale-while-revalidate for list refresh
├── Lazy load product images
├── Debounce search input (150ms)
└── Optimistic updates for stock adjustments

MVP Assumptions:
├── Products per organization < 1000
├── All products fit in memory
├── Client-side filtering is fast enough
└── Server-side pagination deferred to Growth stage
```
