# Stock Adjustment

## Feature Overview

Stock adjustment is the core operative action in Barback's inventory system. It enables users to track and adjust product stock levels with full audit history, recording all changes with reason codes, timestamps, and user attribution.

The Stock Adjustment Sheet is a **single, complete but compact component** designed for all stock operations - from quick adjustments in the product list to detailed stocktakes.

## Access Points

```
Stock adjustment can be initiated from:
├── Product list → Adjust button (±) on each row
├── Product detail page → "Adjust Stock" button
├── Low stock alert → "Adjust" action
└── Future: Batch adjustment for multiple products
```

## User Experience Flows

### One-Click Stock Adjustment from Product List

```
1. User in Product List View
   ├── Sees product with quantity and adjust button (±)
   └── Each row has a visible adjust button
   ↓
2. One-Click Access
   ├── Click adjust button (±) on product row
   └── Stock adjustment sheet opens immediately
   ↓
3. Stock Adjustment Sheet
   ├── Product context pre-loaded
   ├── Current quantity displayed
   ├── Quantity input focused
   ├── Smart default reason applied
   └── Ready for quick entry
   ↓
4. User Enters Adjustment
   ├── Types quantity (+ or -)
   ├── Reason auto-updates based on sign
   ├── Preview shows new quantity
   └── Optional: add note
   ↓
5. Quick Submit
   ├── Submit button or Enter key
   ├── Sheet closes on success
   └── Product quantity updates in list
   ↓
6. Immediate Feedback
   ├── Success toast notification
   ├── Quantity updates in place
   └── Subtle animation on updated row
```

### Full Stock Adjustment Flow

```
1. User Initiates Stock Adjustment
   ├── From product details → "Adjust Stock" button
   ├── From product list → Adjust button (±)
   └── From low stock alert → "Adjust" link
   ↓
2. Stock Adjustment Sheet Display
   ├── Sheet or modal opens
   ├── Current stock prominently displayed
   ├── Product name and unit shown
   └── Form fields ready
   ↓
3. Adjustment Form Fields
   ├── Quantity (required)
   │   ├── Numeric input with +/- buttons
   │   └── Sign determines increase/decrease
   ├── Reason/Type (required, smart default)
   │   ├── Purchase - stock received
   │   ├── Consumption - stock used
   │   ├── Adjustment - correction
   │   └── Stocktake - inventory count
   ├── Note (optional)
   │   └── Additional context
   └── Preview of new quantity
   ↓
4. Form Validation
   ├── Quantity cannot be zero
   ├── Resulting quantity cannot be negative
   ├── Reason must be selected
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
   │   └── Sheet closes
   └── Error:
       ├── Error message displayed
       ├── Sheet remains open
       └── No data changed
```

## Smart Default Reason Behavior

The adjustment reason has intelligent auto-selection based on quantity sign:

```
Smart Default Logic:
├── When quantity is POSITIVE (+):
│   └── Default reason = "PURCHASE"
├── When quantity is NEGATIVE (-):
│   └── Default reason = "CONSUMPTION"
├── When user manually selects a reason:
│   └── Auto-change STOPS (user choice is locked)
└── User can always change reason manually

Reason Types and Valid Operations:
├── PURCHASE: Increase only (✓ default for +)
├── CONSUMPTION: Decrease only (✓ default for -)
├── ADJUSTMENT: Both increase and decrease
└── STOCKTAKE: Both (sets absolute value)

Mismatch Warning Examples:
├── "PURCHASE" selected but quantity is negative → warning
├── "CONSUMPTION" selected but quantity is positive → warning
└── "ADJUSTMENT" or "STOCKTAKE" → always valid

Visual Feedback for Mismatch:
├── Warning icon next to reason
├── Warning text: "Purchase is typically for stock increases"
├── Yellow/amber warning styling
└── Allow submission (user knows best)
```

## Adjustment Types Explained

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

### Stocktake Special Flow

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

## UI Components

### Stock Adjustment Sheet/Dialog

```
StockAdjustmentSheet (Single, Complete but Compact Component)
├── Header
│   ├── "Adjust Stock" title
│   ├── Product name
│   └── Close button
├── Current Stock Display
│   ├── Current quantity (large)
│   ├── Unit of measure
│   └── Visual stock indicator (optional)
├── Form Body
│   ├── Quantity Input
│   │   ├── Numeric input (or stepper)
│   │   ├── +/- quick buttons
│   │   ├── Sign determines increase/decrease
│   │   └── Validation messages
│   ├── Adjustment Type/Reason
│   │   ├── Reason selector (always visible)
│   │   ├── Smart default applied
│   │   ├── Warning if mismatch
│   │   └── All 4 types selectable
│   ├── Note Input
│   │   ├── Optional textarea
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

## Mobile Considerations

```
Mobile Optimizations:
├── Bottom sheet (slide up from bottom)
├── Large touch targets for reason selection
├── Native number keyboard for quantity
├── Clear visual feedback
└── Same component as desktop (responsive)

Reason Selection (Mobile):
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

## Error Handling

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
```

## Inventory History

### View Product Inventory Logs

```
1. User Navigates to Inventory History
   ├── From product details → "View History" link
   └── Direct URL: /orgs/:orgId/products/:productId/logs
   ↓
2. Inventory Logs Section
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
   │   ├── Stock transition: previousQty → newQty
   │   ├── User who made change
   │   ├── Timestamp
   │   └── Note (if provided)
   └── Pagination for long lists
```

### Log Entry Display

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

### Date Range Filter

```
1. User Accesses Date Filter
   ├── Click date range picker
   ├── Select preset or custom range
   ↓
2. Date Selection
   ├── Presets: Today, Last 7 days, Last 30 days, This month
   └── Custom: Start date + End date pickers
   ↓
3. Filter Application
   ├── Validation: startDate <= endDate
   ├── API call with date parameters
   └── Loading state
   ↓
4. Filtered Results
   ├── Logs within date range
   ├── Active filter indicator
   └── Clear filter option
```

## Performance Optimizations

```
Data Loading:
├── Cache logs per product with TTL
├── Pagination for log history (limit 50)
├── Lazy load user details in logs
├── Debounce date filter changes
└── Optimistic quantity update on adjust
```

## Offline Considerations (Future)

```
Offline Stock Adjustment:
├── Queue adjustments when offline
├── Sync when connection restored
├── Conflict resolution for concurrent edits
├── Visual indicator for pending sync
└── Retry failed submissions
```
