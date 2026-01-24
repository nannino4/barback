# Category Management

## Feature Overview

Category management enables organization members to organize products into hierarchical groups for better inventory organization. Categories support parent-child relationships, allowing for nested structures like "Spirits > Whiskey > Bourbon". All category operations are scoped to the user's current organization.

## User Experience Flows

### Category List View Flow

#### Initial Category Loading Journey
```
1. User Navigates to Categories
   ├── From sidebar navigation
   ├── From products page
   └── Deep link /orgs/:orgId/categories
   ↓
2. Categories Page (/orgs/:orgId/categories)
   ├── Loading state with skeleton
   ├── API call: GET /api/orgs/:orgId/categories
   └── Cache check for existing data
   ↓
3. Category List Display
   ├── Tree structure view (default)
   │   ├── Parent categories shown as expandable
   │   ├── Child categories indented
   │   └── Expand/collapse controls
   ├── Flat list view (optional toggle)
   └── Empty state if no categories
   ↓
4. User Interaction Ready
   ├── Click category to view details
   ├── Add new category button
   ├── Edit/delete actions (owners/managers)
   └── Search/filter categories
```

#### Category Tree Interaction
```
Tree Structure Display:
├── Spirits (expandable)
│   ├── Whiskey (expandable)
│   │   ├── Bourbon
│   │   ├── Scotch
│   │   └── Rye
│   ├── Vodka
│   ├── Gin
│   └── Rum
├── Wine (expandable)
│   ├── Red Wine
│   ├── White Wine
│   └── Sparkling
├── Beer
└── Mixers
```

Interaction States:
- Collapsed: Shows only parent, + icon
- Expanded: Shows all children, - icon
- Loading: Spinner while fetching children
- Selected: Highlighted background

### Create Category Flow

#### New Category Creation Journey
```
1. User Initiates Category Creation
   ├── Click "Add Category" button
   └── Click "Add Subcategory" on parent
   ↓
2. Category Form Display
   ├── Modal or slide-over panel
   ├── Form fields:
   │   ├── Name (required)
   │   ├── Description (optional)
   │   └── Parent Category (optional dropdown)
   └── Pre-fill parent if adding subcategory
   ↓
3. Form Validation
   ├── Name: Required, max 255 characters
   ├── Description: Max 500 characters
   ├── Parent: Valid category from same org
   └── Real-time validation feedback
   ↓
4. Category Submission
   ├── Loading state on submit button
   ├── API call: POST /api/orgs/:orgId/categories
   └── Optimistic UI update (optional)
   ↓
5. Creation Result
   ├── Success: 
   │   ├── Toast notification
   │   ├── Category added to tree
   │   └── Form closes or resets
   └── Error:
       ├── Error message displayed
       ├── Form remains open
       └── Focus on problematic field
```

#### Category Form Validation Details
```
Field Validation Rules:

Name Field:
├── Required
├── Max length: 255 characters
├── Trim whitespace
├── Show character count
└── Unique within organization (server-side)

Description Field:
├── Optional
├── Max length: 500 characters
├── Multiline text area
└── Show character count when typing

Parent Category Field:
├── Optional dropdown/select
├── Searchable for large lists
├── Shows category hierarchy
├── Excludes current category (on edit)
└── Excludes descendants (on edit - prevents circular)
```

### Edit Category Flow

#### Category Update Journey
```
1. User Initiates Edit
   ├── Click edit icon on category row
   ├── Click category → Edit button
   └── Right-click context menu → Edit
   ↓
2. Edit Form Display
   ├── Pre-filled with current values
   ├── Same form as create
   └── Cancel returns to previous state
   ↓
3. User Makes Changes
   ├── Modify name
   ├── Modify description
   └── Change parent (with validation)
   ↓
4. Form Submission
   ├── Dirty check (only submit if changed)
   ├── API call: PUT /api/orgs/:orgId/categories/:id
   └── Loading state during request
   ↓
5. Update Result
   ├── Success:
   │   ├── Toast notification
   │   ├── Tree updated with new values
   │   └── Form closes
   └── Error:
       ├── Error message displayed
       └── Form remains open
```

#### Parent Category Change Validation
```
When Changing Parent Category:
1. Cannot set parent to itself
2. Cannot set parent to a descendant
3. Backend validates circular reference prevention

Visual Feedback:
├── Invalid parents disabled in dropdown
├── Warning message if attempting invalid selection
└── Clear explanation of restriction
```

### Delete Category Flow

#### Category Deletion Journey
```
1. User Initiates Delete
   ├── Click delete icon on category
   ├── Category details → Delete button
   └── Context menu → Delete
   ↓
2. Deletion Check
   ├── Check for child categories
   ├── Check for associated products
   └── Determine deletion strategy
   ↓
3. Confirmation Dialog
   ├── Category has children:
   │   └── "This category has X subcategories. 
   │        Delete will also remove all subcategories.
   │        Are you sure?"
   ├── Category has products:
   │   └── "X products are assigned to this category.
   │        They will be removed from this category.
   │        Are you sure?"
   └── No dependencies:
       └── "Delete category 'Name'? This cannot be undone."
   ↓
4. Deletion Execution
   ├── User confirms
   ├── API call: DELETE /api/orgs/:orgId/categories/:id
   └── Loading state
   ↓
5. Deletion Result
   ├── Success:
   │   ├── Toast notification
   │   ├── Category removed from tree
   │   └── Refresh products if needed
   └── Error:
       ├── Error message displayed
       └── Category remains in place
```

### Category Search and Filter Flow

#### Filtering Categories
```
1. Search Input
   ├── Search bar at top of category list
   ├── Filter by name (partial match)
   └── Debounced search (300ms)
   ↓
2. Filter Application
   ├── Client-side filtering (small lists)
   │   ├── Filter categories by name
   │   ├── Show matching parents expanded
   │   └── Highlight matching text
   └── Server-side filtering (large lists)
       ├── API call with search parameter
       └── Return matching categories
   ↓
3. Filter Results
   ├── Matching categories displayed
   ├── "No results" state if empty
   └── Clear filter button
```

## UI Components

### Category List Component
```
CategoryList
├── Header
│   ├── Title: "Categories"
│   ├── Search input
│   └── Add Category button (if authorized)
├── View Toggle
│   ├── Tree view (default)
│   └── Flat list view
├── Category Tree/List
│   ├── CategoryTreeItem (recursive)
│   │   ├── Expand/collapse control
│   │   ├── Category name
│   │   ├── Product count badge
│   │   └── Action buttons (edit/delete)
│   └── Loading/Empty states
└── Footer
    └── Category count
```

### Category Form Component
```
CategoryForm
├── Modal/Panel Container
├── Form Header
│   └── "New Category" / "Edit Category"
├── Form Body
│   ├── Name Input
│   │   ├── Label + required indicator
│   │   ├── Text input
│   │   ├── Character count
│   │   └── Error message
│   ├── Description Input
│   │   ├── Label
│   │   ├── Textarea
│   │   ├── Character count
│   │   └── Error message
│   └── Parent Category Select
│       ├── Label
│       ├── Searchable select
│       ├── Clear option
│       └── Error message
└── Form Footer
    ├── Cancel button
    └── Submit button (with loading)
```

## Mobile Considerations

### Mobile Category List
```
Mobile Optimizations:
├── Full-width list items
├── Swipe actions (edit, delete)
├── Touch-friendly expand/collapse
├── Bottom sheet for category form
├── Pull-to-refresh
└── Floating action button for add

Touch Targets:
├── Min 44px height for list items
├── Expand button: 44x44px minimum
├── Action buttons: adequate spacing
└── Clear tap feedback
```

### Mobile Category Form
```
Mobile Form Adaptations:
├── Full-screen modal or bottom sheet
└── Auto-focus on first field
```

## Error Handling

### Common Error Scenarios
```
Category Fetch Errors:
├── Network error → Retry button + cached data
├── 401 Unauthorized → Redirect to login
├── 403 Forbidden → "Access denied" message
└── 500 Server error → Generic error + retry

Category Create Errors:
├── 400 Validation → Show field errors
├── 409 Duplicate name → "Category already exists"
└── 500 Server error → Generic error + retry

Category Update Errors:
├── 400 Validation → Show field errors
├── 404 Not found → Refresh category list
├── 409 Circular reference → "Invalid parent selection"
└── 500 Server error → Generic error + retry

Category Delete Errors:
├── 404 Not found → Refresh category list
├── 409 Has dependencies → Show dependency info
└── 500 Server error → Generic error + retry
```
