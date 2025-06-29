# Inventory Management UI Specifications

## Overview

The Inventory management system is the core of Barback, allowing users to manage products, track stock levels, and perform stock adjustments. The design prioritizes mobile-first interactions with touch-optimized controls.

## Product List View (`/inventory`)

### Mobile Product List
```
┌─────────────────────────────────┐
│ 🔍 Search products...      🎛️  │ ← Search with filter button
├─────────────────────────────────┤
│ 📋 All Categories (42)     ▼   │ ← Category filter dropdown
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🥃 Johnnie Walker Black │     │ ← Product card (tap to view)
│ │    7 bottles            │     │   Current stock
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🍸 Grey Goose Vodka     │     │
│ │    12 bottles           │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🍷 Aperol          ⚠️   │     │ ← Low stock icon only
│ │    1 bottle             │     │   when below threshold
│ └─────────────────────────┘     │
│                                 │
│        [Loading more...]        │ ← Infinite scroll
│                                 │
│ [Floating Action Button: +]     │ ← Add new product
└─────────────────────────────────┘
```

### Product Card Interactions
```
Tap Product Card:
→ Navigate to Product Detail Page

Swipe Product Card:
→ Navigate to Product Detail Page

All actions (view, edit, adjust stock) happen on the product detail page.
```

### Product List Components
```tsx
<ProductList>
├── <ProductSearchBar 
│     onSearch={handleSearch}
│     onFilterToggle={showFilters}
│   />
├── <CategoryFilter 
│     categories={categories}
│     selectedCategory={selectedCategory}
│     onCategoryChange={handleCategoryChange}
│   />
├── <ProductGrid>
│   └── <ProductCard 
│       product={product}
│       onSwipeRight={handleQuickAdjust}
│       onSwipeLeft={showProductActions}
│       onClick={openProductDetails}
│     />
└── <FloatingActionButton 
    onClick={openNewProductForm}
    icon={<Plus />}
  />
```

## Product Detail & Stock Adjustment (Unified View)

### Mobile Product Detail/Adjustment View (`/inventory/products/:id`)
```
┌─────────────────────────────────┐
│ ← Back    Johnnie Walker   ⋮   │ ← Navigation with menu
├─────────────────────────────────┤
│                                 │
│ 🥃 Johnnie Walker Black Label   │ ← Product header
│    Whiskey • 700ml bottles     │   Category and unit
│                                 │
│ ┌─────────────────────────┐     │
│ │ Current Stock           │     │ ← Stock info card
│ │ 7 bottles               │     │   Large, prominent
│ │ ──────────────────────  │     │
│ │ Par Level: 10 bottles   │     │
│ │ Status: ⚠️ Low Stock    │     │
│ └─────────────────────────┘     │
│                                 │
│ ⚡ Quick Stock Adjustment       │ ← Quick adjustment section
│ ┌─────────────────────────┐     │
│ │ Adjust Stock Amount     │     │
│ │ ┌───┬─────────┬───┐     │     │ ← Simple +/- with number
│ │ │ - │   +3    │ + │     │     │   (editable with sign)
│ │ └───┴─────────┴───┘     │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Reason ▼                │     │ ← Auto-selected based on +/-
│ │ Purchase (Delivery)     │     │   User can override
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Notes (optional)        │     │ ← Optional notes
│ │ Weekly delivery         │     │
│ └─────────────────────────┘     │
│                                 │
│ Preview: 7 → 10 bottles (✅)    │ ← Adjustment preview
│                                 │
│ ┌─────────────────────────┐     │
│ │    Confirm Adjustment   │     │ ← Confirmation button
│ └─────────────────────────┘     │
│                                 │
│ ──────────────────────────      │
│                                 │
│ 📝 Product Details              │ ← Collapsible sections
│ ┌─────────────────────────┐     │
│ │ Name     [Edit]         │     │ ← Editable fields
│ │ Johnnie Walker Black    │     │
│ ├─────────────────────────┤     │
│ │ Category [Edit]         │     │
│ │ Whiskey                 │     │
│ ├─────────────────────────┤     │
│ │ Unit     [Edit]         │     │
│ │ 700ml bottles           │     │
│ ├─────────────────────────┤     │
│ │ Par Level [Edit]        │     │
│ │ 10 bottles              │     │
│ ├─────────────────────────┤     │
│ │ Description [Edit]      │     │
│ │ 12-year blended Scotch  │     │
│ └─────────────────────────┘     │
│                                 │
│ 📊 Stock History                │ ← Stock history section
│ ┌─────────────────────────┐     │
│ │ • +5 bottles (Delivery) │     │ ← Recent adjustments
│ │   2 days ago by Mike    │     │
│ │ • -2 bottles (Sale)     │     │
│ │   3 days ago by Sarah   │     │
│ │ • +10 bottles (Delivery)│     │
│ │   1 week ago by John    │     │
│ │ [View Full History]     │     │
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Product Detail Components
```tsx
<ProductDetailView productId={productId}>
├── <ProductHeader>
│   ├── <ProductName />
│   ├── <ProductCategory />
│   └── <ProductUnit />
├── <StockInfoCard>
│   ├── <CurrentStock value={currentStock} />
│   ├── <ParLevel value={parLevel} />
│   └── <StockStatus status={stockStatus} />
├── <QuickAdjustmentSection>
│   ├── <QuickAdjustmentButtons values={[-5, -1, +1, +5]} />
│   ├── <CustomQuantityInput />
│   ├── <ReasonSelector reasons={adjustmentReasons} />
│   ├── <NotesInput optional />
│   ├── <AdjustmentPreview 
│       currentStock={currentStock}
│       adjustment={adjustment}
│     />
│   └── <RecordAdjustmentButton 
│       onSubmit={handleAdjustment}
│     />
├── <CollapsibleSection title="Product Details">
│   └── <ProductEditForm>
│       ├── <EditableField name="name" />
│       ├── <EditableField name="category" type="select" />
│       ├── <EditableField name="unit" />
│       ├── <EditableField name="parLevel" type="number" />
│       └── <EditableField name="description" type="textarea" />
└── <CollapsibleSection title="Stock History">
    └── <StockHistoryList>
        ├── <StockHistoryItem />
        └── <ViewFullHistoryButton />
```

## Stock Adjustment Reasons

### Automatic Reason Selection
The system automatically selects the appropriate adjustment type based on whether stock increases or decreases:

**For Stock Increases (+)**: Defaults to "PURCHASE"
**For Stock Decreases (-)**: Defaults to "CONSUMPTION"

Users can manually override to select a more specific reason if needed.

### Available Adjustment Types
Based on the inventory management API:
- **PURCHASE**: Stock increase from purchases/deliveries
- **CONSUMPTION**: Stock decrease from sales/usage  
- **ADJUSTMENT**: Manual corrections (positive or negative)
- **STOCKTAKE**: Physical count adjustments

### Reason Selector Component
```tsx
<ReasonSelector>
├── <ReasonCategory title="Additions" expanded={adjustment > 0}>
│   └── <ReasonOption value="delivery">Delivery received</ReasonOption>
├── <ReasonCategory title="Reductions" expanded={adjustment < 0}>
│   └── <ReasonOption value="sale">Sale to customer</ReasonOption>
└── <ReasonCategory title="Corrections">
    └── <ReasonOption value="audit">Audit adjustment</ReasonOption>
```

## Add New Product Form (`/inventory/products/new`)

### Mobile New Product Form
```
┌─────────────────────────────────┐
│ ← Cancel    Add Product    Save │ ← Header with actions
├─────────────────────────────────┤
│                                 │
│ 📝 Product Information          │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Product Name *          │     │ ← Required field
│ │ Grey Goose Vodka        │     │
│ ├─────────────────────────┤     │
│ │ Category * ▼            │     │ ← Category dropdown
│ │ Vodka                   │     │   (Spirits > Vodka)
│ ├─────────────────────────┤     │
│ │ Unit * ▼                │     │ ← Unit dropdown
│ │ 750ml bottles           │     │   (bottles, liters, cases)
│ ├─────────────────────────┤     │
│ │ Par Level *             │     │ ← Number input
│ │ 12                      │     │
│ ├─────────────────────────┤     │
│ │ Current Quantity *      │     │ ← Initial stock
│ │ 8                       │     │
│ ├─────────────────────────┤     │
│ │ Description (optional)  │     │ ← Optional field
│ │ Premium French vodka    │     │
│ └─────────────────────────┘     │
│                                 │
│ 💰 Pricing (Optional)           │ ← Collapsible section
│ ┌─────────────────────────┐     │
│ │ Cost per unit           │     │ ← For analytics
│ │ €45.00                  │     │
│ ├─────────────────────────┤     │
│ │ Supplier                │     │ ← For future ordering
│ │ Premium Spirits Ltd     │     │
│ └─────────────────────────┘     │
│                                 │
│ 🏷️ Additional Info (Optional)   │ ← Collapsible section
│ ┌─────────────────────────┐     │
│ │ SKU/Barcode             │     │ ← For scanning (future)
│ │ GG750VD2024             │     │
│ ├─────────────────────────┤     │
│ │ Storage Location        │     │ ← Location tracking
│ │ Main Bar - Top Shelf    │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │      Add Product        │     │ ← Primary button
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### New Product Form Components
```tsx
<NewProductForm>
├── <ProductInfoSection>
│   ├── <Input name="name" required placeholder="Product Name" />
│   ├── <CategorySelect 
│       name="category" 
│       required 
│       categories={productCategories}
│     />
│   ├── <UnitSelect 
│       name="unit" 
│       required 
│       units={['bottles', 'liters', 'cases', 'kg']}
│     />
│   ├── <NumberInput name="parLevel" required min={0} />
│   ├── <NumberInput name="currentQuantity" required min={0} />
│   └── <Textarea name="description" optional />
├── <CollapsibleSection title="Pricing (Optional)">
│   ├── <CurrencyInput name="costPerUnit" />
│   └── <Input name="supplier" />
├── <CollapsibleSection title="Additional Info (Optional)">
│   ├── <Input name="sku" placeholder="SKU/Barcode" />
│   └── <Input name="storageLocation" />
└── <SubmitButton>Add Product</SubmitButton>
```

## Category Management

### Category Hierarchy
```
Categories Structure:
├── 🥃 Spirits
│   ├── Whiskey
│   │   ├── Scotch
│   │   ├── Bourbon
│   │   └── Irish
│   ├── Vodka
│   ├── Gin
│   ├── Rum
│   └── Tequila
├── 🍷 Wine
│   ├── Red Wine
│   ├── White Wine
│   ├── Rosé
│   └── Sparkling
├── 🍺 Beer
│   ├── Lager
│   ├── Ale
│   └── Stout
└── 🧊 Mixers
    ├── Juices
    ├── Syrups
    ├── Bitters
    └── Garnishes
```

### Category Filter Interface
```
┌─────────────────────────────────┐
│ 📋 All Categories (42)     ▼   │ ← Dropdown trigger
└─────────────────────────────────┘

Expanded Category Dropdown:
┌─────────────────────────────────┐
│ 📋 All Categories (42)     ✓   │ ← Currently selected
│ 🥃 Spirits (25)                │
│ 🍷 Wine (8)                    │
│ 🍺 Beer (6)                    │
│ 🧊 Mixers (3)                  │
│ ──────────────────────────      │
│ 🔍 Search categories...         │ ← Search within categories
└─────────────────────────────────┘
```

## Search & Filtering

### Advanced Search Modal
```
┌─────────────────────────────────┐
│ ← Back    Search & Filter   ✕  │
├─────────────────────────────────┤
│ 🔍 Search products...           │
│ johnnie                         │ ← Search input
│                                 │
│ Category                        │
│ ☑️ Spirits  ☐ Wine  ☐ Beer     │ ← Category filters
│                                 │
│ Stock Status                    │
│ ☑️ Low Stock  ☐ Good  ☐ High   │ ← Status filters
│                                 │
│ Sort By                         │
│ ⚫ Name A-Z                     │ ← Sort options
│ ⚪ Stock Level (Low first)      │   (radio buttons)
│ ⚪ Last Updated                 │
│ ⚪ Par Level                    │
│                                 │
│ ┌─────────────────────────┐     │
│ │    Apply Filters        │     │ ← Apply button
│ └─────────────────────────┘     │
│                                 │
│ Clear All Filters               │ ← Reset option
└─────────────────────────────────┘
```

## Loading & Empty States

### Loading States
```
Product List Loading:
┌─────────────────────────────────┐
│ ████████████████████████████    │ ← Skeleton cards
│ ████████ ████ ████████          │
│                                 │
│ ████████████████████████████    │
│ ████████ ████ ████████          │
│                                 │
│ ████████████████████████████    │
│ ████████ ████ ████████          │
└─────────────────────────────────┘
```

### Empty States
```
No Products:
┌─────────────────────────────────┐
│        📦 No Products           │
│                                 │
│   Start building your inventory │
│   by adding your first product. │
│                                 │
│   ┌─────────────────────────┐   │
│   │    Add First Product    │   │
│   └─────────────────────────┘   │
└─────────────────────────────────┘

Search No Results:
┌─────────────────────────────────┐
│        🔍 No Results            │
│                                 │
│   No products found matching    │
│   "vodka premium"               │
│                                 │
│   Try adjusting your search     │
│   or check the spelling.        │
│                                 │
│   [Clear Search]                │
└─────────────────────────────────┘
```

## Mobile-Specific Interactions

### Touch Patterns
- **Tap**: Open product details
- **Long Press**: Enter multi-select mode
- **Swipe Right**: Quick stock adjustment
- **Swipe Left**: Product actions (edit, delete)
- **Pull to Refresh**: Update product list
- **Pinch to Zoom**: Future image viewing

### Haptic Feedback
- **Light**: Button taps, navigation
- **Medium**: Successful adjustments, selections
- **Heavy**: Errors, destructive actions
- **Custom**: Swipe action thresholds

### Performance Optimizations
- **Virtual Scrolling**: Large product lists
- **Image Lazy Loading**: Product photos
- **Infinite Scroll**: Pagination
- **Optimistic Updates**: Immediate UI feedback

This inventory management system provides comprehensive product management capabilities while maintaining the mobile-first, touch-optimized experience that makes Barback efficient for real-world bar operations.
