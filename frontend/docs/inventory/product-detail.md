# Product Detail

## Feature Overview

The Product Detail view provides comprehensive information about a single product, including its full details, current stock level, and inventory history. This is where users can view complete product information and access edit/delete actions (Owner/Manager only).

## Navigation

```
Access Points:
├── From product list → Tap product row
├── Direct URL: /orgs/:orgId/products/:productId
└── From low stock alert → Product link
```

## User Experience Flow

### View Product Details

```
1. User Selects Product
   ├── Click product row in list
   └── Direct URL access
   ↓
2. Product Details Page
   ├── API call: GET /api/orgs/:orgId/products/:id
   ├── Loading state with skeleton
   └── Error handling
   ↓
3. Product Information Display
   ├── Header Section
   │   ├── Product image (large)
   │   │   └── Preset image or custom uploaded image
   │   ├── Name and brand
   │   ├── Edit button (Owner/Manager only)
   │   └── Delete button (Owner/Manager only)
   ├── Details Section
   │   ├── Description
   │   ├── Categories (clickable)
   │   ├── Unit of measure
   │   └── Purchase price
   ├── Stock Section
   │   ├── Current quantity (prominent)
   │   ├── Adjust stock button
   │   └── (DEFERRED) Low stock warning - requires parLevel field
   └── History Section
       ├── Recent inventory logs preview
       └── "View all history" link
   ↓
4. Available Actions
   ├── Adjust stock (all roles)
   ├── View inventory history (all roles)
   ├── Edit product (Owner/Manager only)
   └── Delete product (Owner/Manager only)
```

## UI Component

### Product Details Layout

```
ProductDetails
├── Header
│   ├── Back navigation
│   ├── Product name
│   ├── Edit button (Owner/Manager only)
│   └── Delete button (Owner/Manager only)
├── Main Content
│   ├── Image Display
│   │   ├── Large product image
│   │   └── Placeholder if no image
│   ├── Product Info
│   │   ├── Brand
│   │   ├── Description
│   │   ├── Categories (clickable badges)
│   │   ├── Unit of measure
│   │   └── Purchase price
│   └── Stock Display
│       ├── Large quantity display
│       ├── Adjust stock button
│       └── Low stock warning
├── Inventory History Section
│   ├── Recent logs preview (last 5)
│   └── "View all history" link
└── Actions (available ONLY in this detail view)
    ├── Adjust stock button
    ├── Edit product button (Owner/Manager)
    └── Delete product button (Owner/Manager)
```

## Mobile Layout

```
Mobile Details Layout:
├── Large hero image (preset or custom uploaded)
├── Prominent stock display with adjust button
├── Collapsible info sections
├── Bottom sheet for actions menu
└── Back button in header
```

## Delete Product Flow

**Important**: Delete is intentionally only available in the product detail page (not in product list) to prevent accidental deletions during daily operations.

```
1. User Initiates Delete
   ├── Click delete button in product details
   └── Owner/Manager role required
   ↓
2. Confirmation Dialog
   ├── Product name displayed prominently
   ├── Warning: "This will permanently delete 
   │            the product and its inventory history."
   └── Cancel and Confirm buttons
   ↓
3. Deletion Execution
   ├── User confirms
   ├── API call: DELETE /api/orgs/:orgId/products/:id
   └── Loading state
   ↓
4. Deletion Result
   ├── Success:
   │   ├── Toast notification
   │   ├── Navigate to product list
   │   └── Update product cache
   └── Error:
       ├── Error message displayed
       └── Product remains in place
```

## Error Handling

```
Product Fetch Errors:
├── Network error → Retry button
├── 404 Not found → Navigate to product list + error message
├── 401 Unauthorized → Redirect to login
├── 403 Forbidden → "Access denied" message
└── 500 Server error → Generic error + retry

Product Delete Errors:
├── 404 Not found → Refresh product list
└── 500 Server error → Generic error + retry
```

## Related Documentation

- [Stock Adjustment](stock-adjustment.md) - For adjusting stock from this page
- [Product CRUD](../org/products.md) - For editing product details
