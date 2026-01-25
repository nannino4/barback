# Product Management (Organization Settings)

## Feature Overview

Product management in Organization Settings provides full CRUD operations for products. This is the **admin view** where Owners and Managers can create, edit, and delete products. This is separate from the operative Inventory page which focuses on daily stock operations.

## Location

```
Organization Settings
├── Overview (name, timezone)
├── Members
├── Products ← THIS DOCUMENT
└── Categories
```

## Access Control

```
Role Permissions:
├── Owner: Full access (create, edit, delete)
├── Manager: Full access (create, edit, delete)
└── Staff: View only (no CRUD)
```

## User Experience Flows

### Create Product Flow

```
1. User Initiates Product Creation
   ├── Click "Add Product" button in Org Settings
   ├── Click "Add Product" in Inventory page
   └── From empty state CTA
   ↓
2. Product Form Display
   ├── Sheet or modal
   ├── Multi-section form
   └── All fields visible
   ↓
3. Form Sections
   ├── Basic Information
   │   ├── Name (required)
   │   ├── Brand (optional)
   │   ├── Description (optional)
   │   └── Product Image
   │       ├── Option 1: Select from preset library (searchable)
   │       └── Option 2: Upload custom image (after product creation)
   ├── Inventory Settings
   │   ├── Unit of measure (required)
   │   ├── Initial quantity (optional, default 0)
   │   └── Purchase price (optional)
   └── Categorization
       └── Categories (multi-select with inline creation)
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

### Edit Product Flow

```
1. User Initiates Edit
   ├── Click edit button in product details
   ├── From Org Settings product list
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

**Note**: Delete is only available from product detail page, not from product list, to prevent accidental deletions.

```
1. User Initiates Delete
   ├── Click delete button on product details page
   └── From Organization Settings product management
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
   │   ├── Remove from list
   │   └── Navigate to product list
   └── Error:
       ├── Error message displayed
       └── Product remains in place
```

## Form Validation Rules

```
Name Field:
├── Required
├── Max length: 200 characters
├── Trim whitespace
└── Unique within organization (server-side)

Brand Field:
├── Optional
├── Max length: 100 characters
└── Trim whitespace

Description Field:
├── Optional
├── Max length: 1000 characters
└── Multiline text area

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
└── Cannot be negative

Product Image Field:
├── Optional
├── Two options:
│   ├── Select from preset image library (searchable by name/category)
│   └── Upload custom image (only available AFTER product creation)
├── Preset images: stored as URL in imageUrl field
├── Custom images: uploaded via separate API call, then imageUrl updated
└── Default placeholder when no image selected

Categories Field:
├── Optional multi-select
├── Searchable dropdown
├── Shows category hierarchy
├── Inline category creation option ("+ Create new category")
│   ├── Opens inline form or small dialog
│   ├── Category name input (required)
│   ├── Parent category select (optional)
│   └── Creates category and auto-selects it
└── Tag display for selected categories
```

## UI Components

### Product Form Component

```
ProductForm
├── Form Container
├── Basic Info Section
│   ├── Section header
│   ├── Name input
│   ├── Brand input
│   ├── Description textarea
│   └── Image picker
│       ├── Current image preview
│       ├── "Choose from library" button → Opens ImagePickerDialog
│       ├── "Upload custom" button (edit mode only) → File upload
│       └── "Remove image" button (if image set)
├── Inventory Section
│   ├── Section header
│   ├── Unit of measure input
│   ├── Purchase price input
│   └── Initial quantity input (create only)
├── Categories Section
│   ├── Section header
│   ├── Category multi-select
│   ├── Inline category creation
│   └── Selected categories display
└── Form Actions
    ├── Cancel button
    ├── Save button
    └── Save & Add Another (create only, optional)
```

### Image Picker Component

```
ImagePickerDialog
├── Dialog/Sheet Container
├── Header: "Select Product Image"
├── Search Input (search by image name)
├── Category Tabs (to organize preset images)
│   ├── All
│   ├── Spirits
│   ├── Wine
│   ├── Beer
│   ├── Mixers
│   └── Other
├── Image Grid (preset images from API)
│   ├── Selectable image thumbnails
│   ├── Selected state highlight
│   └── "No image" option
└── Actions
    ├── Cancel button
    └── Select button

Custom Image Upload (Edit Mode Only):
├── File picker (images only)
├── Client-side validation (size, format)
├── Upload progress indicator
├── API: POST /api/orgs/:orgId/products/:productId/image
└── Success: imageUrl updated, preview refreshed
```

## Mobile Considerations

```
Mobile Form Adaptations:
├── Full-screen form with sticky header
├── Section-based layout
├── Native input types (number for quantities)
├── Bottom sheet for category selection
├── Image picker opens as bottom sheet
└── Clear Cancel/Save buttons in header
```

## Error Handling

```
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

## Related Documentation

- [Product List (Inventory)](../inventory/product-list.md) - Operative view for daily operations
- [Categories](categories.md) - Category management in Org Settings
