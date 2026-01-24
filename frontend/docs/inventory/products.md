# Product Management

## Feature Overview

Product management is the core of Barback's inventory system. Products represent individual items in a bar's inventory, including spirits, wines, beers, mixers, and other supplies. Each product tracks essential information like name, brand, category, unit of measure, price, and current stock level.

## User Experience Flows

### Product List View Flow

#### Initial Product Loading Journey
```
1. User Navigates to Products
   ├── From dashboard quick action
   ├── From sidebar navigation
   └── Deep link /orgs/:orgId/products
   ↓
2. Products Page (/orgs/:orgId/products)
   ├── Loading state with skeleton cards
   ├── API call: GET /api/orgs/:orgId/products
   └── Cache check for existing data
   ↓
3. Product List Display
   ├── Grid view (default for desktop)
   │   ├── Product cards with image
   │   ├── Name, brand, quantity
   │   └── Quick actions
   ├── List view (default for mobile)
   │   ├── Compact rows
   │   ├── Essential info visible
   │   └── Tap for details
   └── Empty state if no products
   ↓
4. User Interaction Ready
   ├── Click/tap product for details
   ├── Add new product button
   ├── Filter by category
   └── Search products
```

#### Product Card Display
```
Product Card Layout (Grid View):
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │                       │  │
│  │     Product Image     │  │
│  │      or Placeholder   │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  Johnnie Walker Black       │
│  Johnnie Walker             │
│                             │
│  ┌─────────┐  ┌──────────┐  │
│  │ 7 units │  │ Whiskey  │  │
│  └─────────┘  └──────────┘  │
│                             │
│  ⋮ Actions                  │
└─────────────────────────────┘

Product Row Layout (List View):
┌─────┬──────────────────────────────┬────────┬─────────┐
│ Img │ Name / Brand / Category      │ 7 btl  │   ⋮     │
└─────┴──────────────────────────────┴────────┴─────────┘
```

### Product Search and Filter Flow

#### Search Products Journey
```
1. Search Interaction
   ├── Focus search input
   ├── Type product name or brand
   └── Debounced search (300ms)
   ↓
2. Search Execution
   ├── Client-side filter (small inventory)
   │   └── Filter by name, brand, description
   └── Server-side search (large inventory)
       └── API call with search query
   ↓
3. Results Display
   ├── Filtered product list
   ├── Match highlighting (optional)
   ├── Result count
   └── Clear search option
```

#### Filter by Category Flow
```
1. Category Filter Interaction
   ├── Click category filter dropdown
   ├── Quick filter chips on page
   └── Category sidebar (desktop)
   ↓
2. Category Selection
   ├── Single category select
   ├── Multi-category select (optional)
   ├── "All Categories" option
   └── Show category hierarchy
   ↓
3. Filter Application
   ├── API call: GET /api/orgs/:orgId/products?categoryId=...
   ├── Loading state
   └── Update product list
   ↓
4. Filter Feedback
   ├── Active filter indicator
   ├── Filtered count display
   └── Clear filter option
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
   ├── From empty state CTA
   └── Keyboard shortcut
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
   │   └── Image URL (optional)
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

Image URL Field:
├── Optional
├── Valid URL format
├── Preview image on valid URL
└── Fallback placeholder

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
│   ├── Title: "Products"
│   ├── Product count
│   └── Add Product button (if authorized)
├── Toolbar
│   ├── Search input
│   ├── Category filter
│   ├── View toggle (grid/list)
│   └── Sort dropdown
├── Product Grid/List
│   ├── ProductCard or ProductRow (for each product)
│   │   ├── Product image
│   │   ├── Product info
│   │   ├── Stock quantity
│   │   └── Action menu
│   └── Loading/Empty states
└── Pagination (if needed)
    ├── Page numbers or infinite scroll
    └── Items per page selector
```

### Product Card Component
```
ProductCard
├── Image Section
│   ├── Product image or placeholder
│   ├── Category badge (optional)
│   └── Low stock indicator
├── Content Section
│   ├── Product name
│   ├── Brand (if available)
│   └── Category tags
├── Stock Section
│   ├── Current quantity
│   ├── Unit of measure
│   └── Low stock warning
└── Action Section
    ├── Quick adjust button
    ├── More actions menu
    │   ├── View details
    │   ├── Edit
    │   ├── Adjust stock
    │   └── Delete
    └── Favorite/Pin option (future)
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
│   └── Image URL input with preview
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

## State Management

### Product Store (Zustand)
```typescript
interface ProductState {
  // Data
  products: Product[];
  selectedProduct: Product | null;
  totalCount: number;
  
  // Filters
  filters: {
    search: string;
    categoryId: string | null;
    sortBy: 'name' | 'quantity' | 'updatedAt';
    sortOrder: 'asc' | 'desc';
  };
  
  // Pagination (if implemented)
  pagination: {
    page: number;
    limit: number;
  };
  
  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  
  // Actions
  fetchProducts: (orgId: string) => Promise<void>;
  fetchProduct: (orgId: string, productId: string) => Promise<Product>;
  createProduct: (orgId: string, data: CreateProductDto) => Promise<Product>;
  updateProduct: (orgId: string, id: string, data: UpdateProductDto) => Promise<Product>;
  deleteProduct: (orgId: string, id: string) => Promise<void>;
  
  // Filter Actions
  setSearch: (search: string) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  resetFilters: () => void;
  
  // UI Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedProduct: (product: Product | null) => void;
  clearError: () => void;
}
```

### Product Helpers
```typescript
// Filter products by search query
function filterProductsBySearch(products: Product[], query: string): Product[];

// Filter products by category (including child categories)
function filterProductsByCategory(products: Product[], categoryId: string, categories: Category[]): Product[];

// Sort products
function sortProducts(products: Product[], sortBy: string, order: 'asc' | 'desc'): Product[];

// Check if product is low stock (based on alerts - future)
function isLowStock(product: Product, threshold?: number): boolean;

// Get products by category with counts
function getProductCountsByCategory(products: Product[]): Map<string, number>;
```

## Mobile Considerations

### Mobile Product List
```
Mobile Optimizations:
├── List view by default (better density)
├── Pull-to-refresh
├── Infinite scroll pagination
├── Swipe actions (adjust, delete)
├── Floating action button for add
└── Bottom sheet for filters

Product Row (Mobile):
┌─────────────────────────────────────────┐
│ [img] Johnnie Walker Black        7 btl │
│       Johnnie Walker · Whiskey      ⋮   │
└─────────────────────────────────────────┘

Touch Targets:
├── Min 44px row height
├── Large tap area for entire row
├── Clear swipe affordances
└── Haptic feedback on actions
```

### Mobile Product Form
```
Mobile Form Adaptations:
├── Full-screen form with sticky header
├── Section-based layout
├── Native input types (number, url)
├── Bottom sheet for category selection
├── Camera integration for image (future)
├── Auto-save draft (optional)
└── Gesture to dismiss with confirmation
```

### Mobile Product Details
```
Mobile Details Layout:
├── Large hero image
├── Floating action button for stock adjust
├── Collapsible sections
├── Bottom sheet for actions
└── Swipe between products (optional)
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

## Accessibility

### Keyboard Navigation
```
Product List Keyboard Controls:
├── Tab: Navigate between interactive elements
├── Arrow keys: Navigate product grid/list
├── Enter: Open product details
├── Space: Toggle selection (bulk mode)
├── Escape: Close modals/forms
├── Ctrl+N: New product (shortcut)
└── /: Focus search input

Product Form Keyboard Controls:
├── Tab: Move between form fields
├── Enter: Submit form (on button focus)
├── Escape: Close form (with confirmation if dirty)
└── Ctrl+S: Save form (shortcut)

Focus Management:
├── Focus visible on all interactive elements
├── Focus trap in modals
├── Auto-focus first field in forms
└── Return focus after modal close
```

### Screen Reader Support
```
ARIA Implementation:
├── role="grid" or role="list" for product list
├── aria-label on product cards
├── aria-describedby for product details
├── aria-live for dynamic updates
└── aria-busy during loading states

Announcements:
├── "X products found"
├── "Product created successfully"
├── "Product updated"
├── "Product deleted"
├── "Low stock warning: X items"
└── Error messages
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
