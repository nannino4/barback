# Product Management

## Feature Overview

Product management is the core of Barback's inventory system and serves as the **main landing page** after authentication and organization selection. The Product List is the default view of the "Inventory" tab in the main navigation, providing immediate visibility into stock levels.

Products represent individual items in a bar's inventory, including spirits, wines, beers, mixers, and other supplies. Each product tracks essential information like name, brand, category, unit of measure, price, and current stock level.

## Navigation Context

```
Main Navigation Structure:
├── Inventory (default landing after auth/org selection)
│   └── Product List (default view) ← THIS DOCUMENT
│   └── Categories (secondary tab)
├── Alerts (when implemented)
└── More/Settings

Mobile Bottom Nav:
├── Inventory (Products)
├── Alerts
└── More

Desktop Top Nav:
├── Inventory (Products)
├── Alerts (when implemented)
└── Organization Settings (role-gated)
```

## User Experience Flows

### Product List View Flow

#### Initial Product Loading Journey
```
1. User Authenticates & Selects Organization
   ├── After login → redirect to /orgs/:orgId/inventory
   ├── After org selection → redirect to inventory
   └── Direct URL: /orgs/:orgId/inventory (or /orgs/:orgId/products)
   ↓
2. Products Page (Main Landing)
   ├── Loading state with skeleton rows
   ├── API call: GET /api/orgs/:orgId/products
   └── Cache products in memory for filtering
   ↓
3. Product List Display (List View - Both Mobile & Desktop)
   ├── Vertically aligned rows for easy scanning
   ├── Each row shows key data at a glance
   ├── Consistent column alignment across rows
   └── Empty state if no products
   ↓
4. User Interaction Ready
   ├── Click/tap product row for details
   ├── Add new product button (FAB on mobile)
   ├── Filter by category (client-side)
   └── Search products (client-side)
```

#### Product Row Data (Visible in List)
```
Each product row displays:
┌────────────────────────────────────────────────────────────────────┐
│ [Img] │ Name              │ Category │ Current Qty │ Unit │ Actions│
├────────────────────────────────────────────────────────────────────┤
│ [🥃]  │ Johnnie Walker    │ Whiskey  │    7        │ btl  │   ⋮    │
│       │ Black Label       │          │             │      │        │
└────────────────────────────────────────────────────────────────────┘

Required visible columns:
├── Product image (thumbnail from preset pool)
├── Product name (primary text)
├── Brand (secondary text, if available)
├── Category (badge or text)
├── Current Quantity (PROMINENT - this is the key info)
├── Unit of measure
└── Actions menu (⋮)

Optional/contextual:
├── Low stock indicator (warning icon/color when below threshold)
├── Purchase price (may be hidden on mobile for space)
└── Quick adjust buttons (+/-) - inline on row
```

#### Product Row Layout (List View - All Devices)
```
Desktop Row Layout:
┌─────┬──────────────────────────┬──────────┬─────────────┬──────┬─────┐
│ Img │ Name / Brand             │ Category │ Current Qty │ Unit │  ⋮  │
├─────┼──────────────────────────┼──────────┼─────────────┼──────┼─────┤
│ 🥃  │ Johnnie Walker Black     │ Whiskey  │     7       │ btl  │  ⋮  │
│     │ Johnnie Walker           │          │  ⚠️ low     │      │     │
├─────┼──────────────────────────┼──────────┼─────────────┼──────┼─────┤
│ 🍷  │ Barolo 2019              │ Red Wine │    12       │ btl  │  ⋮  │
│     │ Marchesi di Barolo       │          │             │      │     │
└─────┴──────────────────────────┴──────────┴─────────────┴──────┴─────┘

Mobile Row Layout (Compact):
┌─────────────────────────────────────────────────────┐
│ [🥃] Johnnie Walker Black          7 btl ⚠️    ⋮   │
│      Johnnie Walker · Whiskey                       │
└─────────────────────────────────────────────────────┘

Key Design Decisions:
├── List view on ALL devices (not grid)
├── Vertical alignment makes scanning easier
├── Current quantity is always visible and prominent
├── Low stock warning integrated into quantity display
└── Consistent row height for visual rhythm
```

### Product Search and Filter Flow

#### Filtering Strategy
```
Client-Side Filtering (Default):
├── All products loaded on initial page load
├── Search and category filters applied in-memory
├── Instant results with no loading states
├── Works offline once data is cached
└── Threshold: Use client-side when products < 1000

Server-Side Filtering (Large Inventories):
├── Only when product count > 1000
├── API call with search/category parameters
├── Loading indicator during fetch
└── Consider pagination for very large datasets
```

#### Search Products Journey
```
1. Search Interaction
   ├── Focus search input
   ├── Type product name or brand
   └── Debounced filtering (150ms for client-side)
   ↓
2. Search Execution (Client-Side - Default)
   ├── Filter cached products in memory
   ├── Match against: name, brand, description
   ├── Case-insensitive partial matching
   └── No API call needed
   ↓
3. Results Display
   ├── Filtered product list (instant update)
   ├── Result count: "Showing X of Y products"
   └── Clear search button (X icon in input)
```

#### Filter by Category Flow
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
3. Filter Application (Client-Side)
   ├── Filter cached products by categoryId
   ├── Instant update (no loading)
   └── Combine with search filter
   ↓
4. Filter Feedback
   ├── Active filter chip/badge shown
   ├── "Showing X of Y products"
   └── "Clear filters" action
```

### View Single Product Flow

#### Product Details Journey
```
1. User Selects Product
   ├── Click product card/row
   └── Direct URL: /orgs/:orgId/products/:productId
   ↓
2. Product Details Page/Modal
   ├── API call: GET /api/orgs/:orgId/products/:id
   ├── Loading state
   └── Error handling
   ↓
3. Product Information Display
   ├── Header Section
   │   ├── Product image (large)
   │   ├── Name and brand
   │   ├── Edit button (if authorized)
   │   └── Delete button (if authorized)
   ├── Details Section
   │   ├── Description
   │   ├── Categories (clickable)
   │   ├── Unit of measure
   │   ├── Purchase price
   │   └── Image URL
   ├── Stock Section
   │   ├── Current quantity (prominent)
   │   ├── Adjust stock button
   │   └── View history link
   └── History Section (optional)
       └── Recent inventory logs
   ↓
4. Available Actions
   ├── Edit product
   ├── Adjust stock
   ├── View inventory history
   ├── Delete product
   └── Navigate to category
```

### Create Product Flow

#### New Product Creation Journey
```
1. User Initiates Product Creation
   ├── Click "Add Product" button
   └── From empty state CTA
   ↓
2. Product Form Display
   ├── Full page or large modal
   ├── Multi-section form
   └── Progress indicator (optional)
   ↓
3. Form Sections
   ├── Basic Information
   │   ├── Name (required)
   │   ├── Brand (optional)
   │   ├── Description (optional)
   │   └── Product Image (optional - select from presets)
   ├── Inventory Settings
   │   ├── Unit of measure (required)
   │   ├── Initial quantity (optional, default 0)
   │   └── Purchase price (optional)
   └── Categorization
       └── Categories (multi-select)
   ↓
4. Form Validation
   ├── Real-time field validation
   ├── Required field indicators
   └── Character limits enforcement
   ↓
5. Product Submission
   ├── Loading state
   ├── API call: POST /api/orgs/:orgId/products
   └── Handle response
   ↓
6. Creation Result
   ├── Success:
   │   ├── Toast notification
   │   ├── Redirect to product details or list
   │   └── Update product cache
   └── Error:
       ├── Display error message
       ├── Highlight problematic fields
       └── Keep form data intact
```

#### Product Form Validation Details
```
Field Validation Rules:

Name Field:
├── Required
├── Max length: 200 characters
├── Trim whitespace
├── Unique within organization (server-side)
└── Show character count

Brand Field:
├── Optional
├── Max length: 100 characters
└── Trim whitespace

Description Field:
├── Optional
├── Max length: 1000 characters
├── Multiline text area
└── Show character count when typing

Unit of Measure Field:
├── Required
├── Max length: 50 characters
├── Common options: bottle, ml, oz, can, case, kg, unit
├── Custom input allowed
└── Autocomplete suggestions

Purchase Price Field:
├── Optional
├── Numeric input only
├── Min value: 0
├── Currency formatting
└── Two decimal places

Initial Quantity Field:
├── Optional (defaults to 0)
├── Numeric input only
├── Min value: 0
├── Integer or decimal based on unit
└── Cannot be negative

Product Image Field:
├── Optional
├── Select from preset image pool (not custom URLs)
├── Image picker UI with category-organized presets
├── Preview selected image
└── Default placeholder when no image selected

Categories Field:
├── Optional multi-select
├── Searchable dropdown
├── Shows category hierarchy
├── Create new category option (optional)
└── Tag display for selected categories
```

### Edit Product Flow

#### Product Update Journey
```
1. User Initiates Edit
   ├── Click edit button on product details
   ├── Edit action on product card
   └── Direct URL: /orgs/:orgId/products/:id/edit
   ↓
2. Edit Form Display
   ├── Pre-filled with current values
   ├── Same structure as create form
   └── Highlight changed fields (optional)
   ↓
3. User Makes Changes
   ├── Modify any field
   ├── Track dirty state
   └── Unsaved changes warning
   ↓
4. Form Submission
   ├── Only submit changed fields (optional)
   ├── API call: PUT /api/orgs/:orgId/products/:id
   └── Loading state
   ↓
5. Update Result
   ├── Success:
   │   ├── Toast notification
   │   ├── Update UI with new values
   │   └── Navigate back to details
   └── Error:
       ├── Display error message
       └── Keep form open
```

### Delete Product Flow

#### Product Deletion Journey
```
1. User Initiates Delete
   ├── Click delete button on product
   ├── Delete action in dropdown menu
   └── Bulk delete selection
   ↓
2. Deletion Check
   ├── Check for inventory logs
   └── Determine deletion impact
   ↓
3. Confirmation Dialog
   ├── Product name displayed prominently
   ├── Warning: "This will permanently delete 
   │            the product and its inventory history."
   ├── Optional: Require typing product name
   └── Cancel and Confirm buttons
   ↓
4. Deletion Execution
   ├── User confirms
   ├── API call: DELETE /api/orgs/:orgId/products/:id
   └── Loading state
   ↓
5. Deletion Result
   ├── Success:
   │   ├── Toast notification
   │   ├── Remove from list
   │   └── Navigate to product list if on details page
   └── Error:
       ├── Error message displayed
       └── Product remains in place
```

## UI Components

### Product List Component
```
ProductList
├── Header
│   ├── Title: "Inventory" or "Products"
│   ├── Product count: "X products"
│   └── Add Product button (desktop) / FAB (mobile)
├── Toolbar
│   ├── Search input
│   ├── Category filter (dropdown or chips)
│   └── Sort dropdown (optional)
├── Product List
│   ├── ProductRow (for each product)
│   │   ├── Product image thumbnail
│   │   ├── Product name (primary)
│   │   ├── Brand (secondary)
│   │   ├── Category badge
│   │   ├── Current quantity (prominent)
│   │   ├── Unit of measure
│   │   ├── Low stock indicator (when applicable)
│   │   └── Actions menu (⋮)
│   └── Loading/Empty states
└── Filter Status
    └── "Showing X of Y products" (when filtered)
```
│   │   ├── Product info
│   │   ├── Stock quantity
│   │   └── Action menu
│   └── Loading/Empty states
└── Pagination (if needed)
    ├── Page numbers or infinite scroll
    └── Items per page selector
```

### Product Row Component
```
ProductRow
├── Image Section (left)
│   ├── Product image thumbnail (40x40 or 48x48)
│   └── Default placeholder if no image
├── Info Section (center, flexible)
│   ├── Product name (primary text, bold)
│   ├── Brand (secondary text, muted) - optional
│   └── Category badge or text
├── Stock Section (right-aligned)
│   ├── Current quantity (large/bold)
│   ├── Unit of measure
│   └── Low stock indicator (⚠️ icon or color)
└── Actions Section (far right)
    └── Actions menu (⋮)
        ├── View details
        ├── Edit
        ├── Adjust stock
        └── Delete
```

### Product Form Component
```
ProductForm
├── Form Container
├── Basic Info Section
│   ├── Section header
│   ├── Name input
│   ├── Brand input
│   ├── Description textarea
│   └── Image picker (select from presets)
│       ├── Current image preview
│       ├── "Change image" button
│       └── Opens ImagePickerDialog
├── Inventory Section
│   ├── Section header
│   ├── Unit of measure input
│   ├── Purchase price input
│   └── Initial quantity input (create only)
├── Categories Section
│   ├── Section header
│   ├── Category multi-select
│   └── Selected categories display
└── Form Actions
    ├── Cancel button
    ├── Save button
    └── Save & Add Another (create only)
```

### Image Picker Component
```
ImagePickerDialog
├── Dialog/Sheet Container
├── Header: "Select Product Image"
├── Category Tabs (to organize preset images)
│   ├── Spirits
│   ├── Wine
│   ├── Beer
│   ├── Mixers
│   └── Other
├── Image Grid (preset images)
│   ├── Selectable image thumbnails
│   ├── Selected state highlight
│   └── "No image" option
└── Actions
    ├── Cancel button
    └── Select button
```

### Product Details Component
```
ProductDetails
├── Header
│   ├── Back navigation
│   ├── Product name
│   ├── Edit button
│   └── More actions menu
├── Main Content
│   ├── Image Display
│   │   ├── Large product image
│   │   └── Placeholder if no image
│   ├── Product Info
│   │   ├── Brand
│   │   ├── Description
│   │   ├── Categories (clickable)
│   │   ├── Unit of measure
│   │   └── Purchase price
│   └── Stock Display
│       ├── Large quantity display
│       ├── Adjust stock button
│       └── Low stock warning
├── Inventory History Section
│   ├── Recent logs preview
│   └── View all history link
└── Actions
    ├── Adjust stock button
    ├── Edit product button
    └── Delete product button
```

## Mobile Considerations

### Mobile Product List
```
Mobile Optimizations:
├── List view (same as desktop for consistency)
├── Pull-to-refresh to reload products
├── Floating action button (FAB) for "Add Product"
├── Bottom sheet for filters
├── Tap row to view details
└── Tap actions menu (⋮) for quick actions

Product Row (Mobile - same as desktop, responsive):
┌─────────────────────────────────────────┐
│ [🥃] Johnnie Walker Black    7 btl ⚠️  ⋮ │
│      Johnnie Walker · Whiskey            │
└─────────────────────────────────────────┘

Touch Targets:
├── Min 48px row height (better than 44px)
├── Large tap area for entire row
├── Actions button easily tappable
└── Adequate spacing between interactive elements

Swipe Gestures - DEFERRED:
├── Not implementing swipe actions initially
├── Web-based swipe gestures add complexity
├── Use explicit tap actions instead
└── Consider for future native app version
```

### Mobile Product Form
```
Mobile Form Adaptations:
├── Full-screen form with sticky header
├── Section-based layout
├── Native input types (number for quantities)
├── Bottom sheet for category selection
├── Image picker opens as bottom sheet
└── Clear Cancel/Save buttons in header
```

### Mobile Product Details
```
Mobile Details Layout:
├── Large hero image (preset image)
├── Prominent stock display with adjust button
├── Collapsible info sections
├── Bottom sheet for actions menu
└── Back button in header
```

## Error Handling

### Common Error Scenarios
```
Product Fetch Errors:
├── Network error → Retry button + cached data
├── 401 Unauthorized → Redirect to login
├── 403 Forbidden → "Access denied" message
└── 500 Server error → Generic error + retry

Product Create Errors:
├── 400 Validation → Show field errors
│   ├── Name required → Focus name field
│   ├── Unit required → Focus unit field
│   ├── Invalid category → Show category error
│   └── Invalid price → Show price error
├── 409 Duplicate name → "Product already exists"
└── 500 Server error → Generic error + retry

Product Update Errors:
├── 400 Validation → Show field errors
├── 404 Not found → Refresh product list
├── 409 Conflict → "Product already exists"
└── 500 Server error → Generic error + retry

Product Delete Errors:
├── 404 Not found → Refresh product list
└── 500 Server error → Generic error + retry
```

## Performance Optimizations

### Data Loading
```
Optimization Strategies:
├── Cache products in store with TTL
├── Stale-while-revalidate for list
├── Prefetch next page for pagination
├── Lazy load product images
├── Debounce search input (300ms)
└── Optimistic updates for CRUD operations

Image Loading:
├── Lazy load images with placeholder
├── Progressive image loading
├── Image error fallback
├── Cache product images
└── Thumbnail sizes for list view
```

### Rendering Performance
```
Optimization Strategies:
├── Virtualize long product lists
├── Memoize product card components
├── Debounce filter changes
├── Skeleton loading states
└── Batch DOM updates
```
