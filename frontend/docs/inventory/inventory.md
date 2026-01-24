# Inventory Management

## Feature Overview

Inventory management in Barback enables users to track and adjust product stock levels with full audit history. The system records all stock changes with reason codes, timestamps, and user attribution, providing complete traceability for inventory operations. This is essential for bar operations to track consumption, purchases, and adjustments.

## User Experience Flows

### Stock Adjustment Flow

#### Manual Stock Adjustment Journey
```
1. User Initiates Stock Adjustment
   ├── From product details page → "Adjust Stock" button
   ├── From product list → Quick adjust action
   ├── From low stock alert → "Adjust" link
   └── Direct URL: /orgs/:orgId/products/:productId/adjust
   ↓
2. Stock Adjustment Form Display
   ├── Modal or slide-over panel
   ├── Current stock prominently displayed
   ├── Product name and unit shown
   └── Form fields ready
   ↓
3. Adjustment Form Fields
   ├── Adjustment Type (required)
   │   ├── Purchase - stock received
   │   ├── Consumption - stock used
   │   ├── Adjustment - correction
   │   └── Stocktake - inventory count
   ├── Quantity (required)
   │   ├── Numeric input
   │   ├── Positive for additions
   │   └── Negative for deductions
   ├── Note (optional)
   │   └── Reason or explanation
   └── Preview of new quantity
   ↓
4. Form Validation
   ├── Quantity cannot be zero
   ├── Resulting quantity cannot be negative
   ├── Type must be selected
   └── Note max length: 500 characters
   ↓
5. Adjustment Submission
   ├── Loading state on submit button
   ├── API call: POST /api/orgs/:orgId/products/:productId/adjust-stock
   └── Transaction with logging
   ↓
6. Adjustment Result
   ├── Success:
   │   ├── Toast notification with new quantity
   │   ├── Product quantity updated in UI
   │   ├── Log entry created
   │   └── Form closes
   └── Error:
       ├── Error message displayed
       ├── Form remains open
       └── No data changed
```

#### Adjustment Type Flows
```
PURCHASE - Receiving Stock:
├── Use case: Delivery received, restocking
├── Quantity: Always positive
├── Example: "+5 bottles received from supplier"
├── Note suggestion: "Supplier invoice #12345"
└── Effect: Increases current quantity

CONSUMPTION - Using Stock:
├── Use case: Products used, drinks made
├── Quantity: Always negative
├── Example: "-3 bottles used tonight"
├── Note suggestion: "Event: Saturday Night"
└── Effect: Decreases current quantity

ADJUSTMENT - Corrections:
├── Use case: Fix errors, damage, loss
├── Quantity: Positive or negative
├── Example: "-1 bottle (damaged)"
├── Note suggestion: "Broken during handling"
└── Effect: Corrects current quantity

STOCKTAKE - Inventory Count:
├── Use case: Physical count reconciliation
├── Quantity: Sets absolute value (calculated as difference)
├── Example: "Count: 12 bottles (was 15, diff: -3)"
├── Note suggestion: "Monthly inventory count"
└── Effect: Adjusts to match physical count
```

#### Stocktake Special Flow
```
1. User Selects Stocktake Type
   ├── Form shows current quantity: 15
   └── Input label changes to "Actual Count"
   ↓
2. User Enters Physical Count
   ├── User enters: 12
   ├── System calculates difference: -3
   └── Preview shows: "15 → 12 (-3)"
   ↓
3. Automatic Difference Calculation
   ├── quantity = actualCount - currentQuantity
   ├── Negative if shrinkage
   └── Positive if unexpected gain
   ↓
4. Submission
   ├── Log type: STOCKTAKE
   ├── Log quantity: -3
   ├── previousQuantity: 15
   └── newQuantity: 12
```

### Inventory History Flow

#### View Product Inventory Logs Journey
```
1. User Navigates to Inventory History
   ├── From product details → "View History" link
   ├── From inventory section
   └── Direct URL: /orgs/:orgId/products/:productId/logs
   ↓
2. Inventory Logs Page/Section
   ├── Product context displayed
   ├── API call: GET /api/orgs/:orgId/products/:productId/logs
   ├── Loading state with skeleton
   └── Date range filter available
   ↓
3. Log List Display
   ├── Chronological list (newest first)
   ├── Each log shows:
   │   ├── Type badge (color-coded)
   │   ├── Quantity change (+5 / -3)
   │   ├── Stock after: previousQty → newQty
   │   ├── User who made change
   │   ├── Timestamp (formatted)
   │   └── Note (if provided)
   └── Pagination for long lists
   ↓
4. Filter and Analysis
   ├── Filter by date range
   ├── Filter by type
   ├── Filter by user (future)
   └── Summary statistics
```

#### Inventory Log Entry Display
```
Log Entry Layout:
┌─────────────────────────────────────────────────────────────┐
│ [PURCHASE]  +5 bottles            Jan 24, 2026 • 2:30 PM   │
│ 7 → 12 bottles                              by Maria R.    │
│ Delivery from ABC Distributors - Invoice #1234             │
└─────────────────────────────────────────────────────────────┘

Type Badge Colors:
├── PURCHASE: Green (positive action)
├── CONSUMPTION: Orange (expected decrease)
├── ADJUSTMENT: Blue (neutral correction)
└── STOCKTAKE: Purple (audit action)
```

### Date Range Filter Flow

#### Filter Logs by Date Range Journey
```
1. User Accesses Date Filter
   ├── Click date range picker
   ├── Select preset (Today, Last 7 days, etc.)
   └── Custom range selection
   ↓
2. Date Selection
   ├── Presets:
   │   ├── Today
   │   ├── Last 7 days
   │   ├── Last 30 days
   │   ├── This month
   │   ├── Last month
   │   └── Custom range
   └── Custom:
       ├── Start date picker
       └── End date picker
   ↓
3. Filter Application
   ├── Validation: startDate <= endDate
   ├── API call with date parameters
   │   └── GET /api/orgs/:orgId/products/:productId/logs?startDate=...&endDate=...
   └── Loading state
   ↓
4. Filtered Results
   ├── Logs within date range
   ├── Active filter indicator
   ├── Clear filter option
   └── Summary for period (optional)
```

### Quick Stock Adjust Flow (List View)

#### Rapid Stock Adjustment from List
```
1. User in Product List View
   ├── Sees product quantity
   └── Quick adjust icon visible
   ↓
2. Quick Adjust Interaction
   ├── Click +/- buttons or adjust icon
   ├── Inline quantity editor appears
   └── Keyboard: +/- keys for increment
   ↓
3. Quick Adjust Form
   ├── Compact inline form
   ├── Type quick-select buttons
   ├── Quantity input (smaller)
   └── Optional note (expandable)
   ↓
4. Quick Submit
   ├── Enter to submit
   ├── Escape to cancel
   └── Click outside to cancel
   ↓
5. Immediate Feedback
   ├── Inline success indicator
   ├── Quantity updates in place
   └── Subtle animation
```

## UI Components

### Stock Adjustment Form Component
```
StockAdjustmentForm
├── Header
│   ├── "Adjust Stock" title
│   ├── Product name
│   └── Close button
├── Current Stock Display
│   ├── Current quantity (large)
│   ├── Unit of measure
│   └── Visual stock indicator (optional)
├── Form Body
│   ├── Adjustment Type
│   │   ├── Type selector (radio or segmented)
│   │   ├── Type descriptions
│   │   └── Type-specific UI changes
│   ├── Quantity Input
│   │   ├── Numeric input (or stepper)
│   │   ├── +/- quick buttons
│   │   ├── "Actual count" mode for stocktake
│   │   └── Validation messages
│   ├── Note Input
│   │   ├── Textarea (optional)
│   │   ├── Character count
│   │   └── Suggested templates (optional)
│   └── Preview Section
│       ├── "New quantity: X"
│       ├── Change indicator (+5 / -3)
│       └── Warning if low stock result
└── Form Actions
    ├── Cancel button
    └── Submit button (with loading)
```

### Inventory Log List Component
```
InventoryLogList
├── Header
│   ├── "Inventory History" title
│   ├── Product context
│   └── Adjust stock button
├── Filters Toolbar
│   ├── Date range picker
│   ├── Type filter (multi-select)
│   └── Clear filters button
├── Summary Section (optional)
│   ├── Total changes in period
│   ├── Net change (+ or -)
│   └── Activity chart (optional)
├── Log Entries
│   ├── InventoryLogEntry (for each log)
│   │   ├── Type badge
│   │   ├── Quantity change
│   │   ├── Stock before → after
│   │   ├── User avatar/name
│   │   ├── Timestamp
│   │   └── Note (expandable)
│   └── Loading/Empty states
└── Pagination
    └── Load more or page numbers
```

### Inventory Log Entry Component
```
InventoryLogEntry
├── Left Section
│   ├── Type badge with icon
│   └── Quantity change (+5 / -3)
├── Center Section
│   ├── Stock transition (7 → 12)
│   ├── Note (if provided)
│   └── Expand/collapse for long notes
└── Right Section
    ├── User attribution
    │   ├── User avatar
    │   └── User name
    └── Timestamp
        ├── Relative (2 hours ago)
        └── Full date on hover
```

### Quick Adjust Component
```
QuickAdjustPopover
├── Compact Form
│   ├── Type quick buttons
│   │   ├── [+] Purchase
│   │   ├── [-] Consumption
│   │   └── [±] Adjust
│   ├── Quantity input (inline)
│   └── Note toggle
├── Preview
│   └── New quantity preview
└── Actions
    ├── Apply button (compact)
    └── Escape hint
```

## Mobile Considerations

### Mobile Stock Adjustment
```
Mobile Optimizations:
├── Full-screen modal or bottom sheet
├── Large touch targets for type selection
├── Native number keyboard for quantity
└── Clear visual feedback

Type Selection (Mobile):
┌─────────────────────────────────────┐
│   ┌─────────┐  ┌─────────────┐      │
│   │   📦    │  │     🍸      │      │
│   │Purchase │  │ Consumption │      │
│   └─────────┘  └─────────────┘      │
│                                     │
│   ┌─────────┐  ┌─────────────┐      │
│   │   ✏️    │  │     📋      │      │
│   │ Adjust  │  │  Stocktake  │      │
│   └─────────┘  └─────────────┘      │
└─────────────────────────────────────┘

Quantity Input (Mobile):
├── Large input field
├── Stepper buttons (+/-)
├── Native numeric keyboard
└── Clear current quantity display
```

### Mobile Inventory Logs
```
Mobile Log List:
├── Card-based log entries
├── Swipe for additional details
├── Pull-to-refresh
├── Infinite scroll
├── Bottom sheet for filters
└── Compact date grouping

Log Entry (Mobile):
┌─────────────────────────────────────────┐
│ [PURCHASE]                     2:30 PM  │
│ +5 bottles (7 → 12)          Maria R.   │
│ Delivery from ABC Distributors          │
└─────────────────────────────────────────┘
```

### Offline Considerations (Future)
```
Offline Stock Adjustment:
├── Queue adjustments when offline
├── Sync when connection restored
├── Conflict resolution for concurrent edits
├── Visual indicator for pending sync
└── Retry failed submissions
```

## Error Handling

### Common Error Scenarios
```
Stock Adjustment Errors:
├── Zero quantity
│   ├── Message: "Quantity cannot be zero"
│   └── Action: Focus on quantity field
├── Negative result
│   ├── Message: "Cannot reduce below zero. Current: X, Max reduction: Y"
│   └── Action: Show maximum allowed reduction
├── Product not found
│   ├── Message: "Product no longer exists"
│   └── Action: Close form, refresh product list
├── Network error
│   ├── Message: "Unable to save. Please try again."
│   └── Action: Show retry button
└── Server error
    ├── Message: "Something went wrong. Please try again."
    └── Action: Log error, show retry

Inventory Log Fetch Errors:
├── Network error → Show cached data if available
├── Invalid date range → "Start date must be before end date"
├── 404 Product not found → Redirect to products list
└── 500 Server error → Generic error + retry
```

## Performance Optimizations

### Data Loading
```
Optimization Strategies:
├── Cache logs per product with TTL
├── Pagination for log history (limit 50)
├── Load only visible date range initially
├── Lazy load user details in logs
├── Debounce date filter changes
└── Optimistic quantity update on adjust
```

### Log Rendering
```
Optimization Strategies:
├── Virtualize long log lists
├── Group by date with collapsible sections
├── Memoize log entry components
├── Skeleton loading for each entry
└── Progressive loading (load more on scroll)
```

## Integration Points

### With Product Management
```
Integration:
├── Stock adjustment updates product.currentQuantity
├── Product details shows recent logs
├── Product card shows current quantity
├── Low stock detection triggers alerts (future)
└── Delete product handles associated logs
```
