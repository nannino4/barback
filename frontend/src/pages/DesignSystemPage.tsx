import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check, X, AlertTriangle, Info } from 'lucide-react';

const DesignSystemPage: React.FC = () =>
{
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl lg:text-6xl">
            The Speakeasy
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Barback Design System - A sophisticated, mobile-first design for cocktail bar inventory management
          </p>
        </header>

        {/* Color System - Interactive Real-World Examples */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Color System</h2>
            <p className="mt-2 text-muted-foreground">
              OKLCH color space for perceptually uniform brightness and vibrant colors
            </p>
          </div>

          {/* Base & Surface Colors - Interactive Demo */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Background Hierarchy</CardTitle>
              <CardDescription>Proper layering from deepest (page base) to elevated (cards) - hover to see depth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deepest layer - page base */}
              <div className="rounded-lg bg-background-dark border-2 border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">background-dark</p>
                    <p className="text-xs text-muted-foreground">Deepest - Page base, recessed wells</p>
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">bg-background-dark</code>
                </div>
                
                {/* Middle layer - containers */}
                <div className="rounded-md bg-background border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">background</p>
                      <p className="text-xs text-muted-foreground">Middle - Container cards, main sections</p>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded">bg-background</code>
                  </div>
                  
                  {/* Elevated layer - background-light */}
                  <div className="rounded-md bg-background-light border border-border p-3">
                    <p className="text-sm text-foreground">background-light</p>
                    <p className="text-xs text-muted-foreground">Elevated - Raised panels (rarely used)</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">bg-background-light</code>
                  </div>
                  
                  {/* Highest layer - card */}
                  <div className="rounded-lg bg-card shadow-md border border-border p-4 space-y-3 transition-shadow hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">card</p>
                        <p className="text-xs text-muted-foreground">Highest - Card component (use with &lt;Card&gt;)</p>
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">bg-card</code>
                    </div>

                    {/* Input field inside card */}
                    <div className="rounded-md bg-input border border-border p-3 shadow-sm">
                      <p className="text-sm text-foreground">input</p>
                      <p className="text-xs text-muted-foreground">Sunken - Input fields (use with &lt;Input&gt;)</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">bg-input</code>
                    </div>

                    {/* Muted sections */}
                    <div className="rounded-md bg-muted p-3">
                      <p className="text-sm text-muted-foreground">muted</p>
                      <p className="text-xs text-muted-foreground">Subtle - Secondary content areas</p>
                      <code className="text-xs bg-background px-2 py-1 rounded mt-1 inline-block">bg-muted</code>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Usage Rules:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li><strong>background-dark:</strong> Rarely needed - use for special sunken panels</li>
                  <li><strong>background:</strong> Page base layer + Container panels that hold other cards/examples</li>
                  <li><strong>background-light:</strong> Rarely needed - use for special elevated panels</li>
                  <li><strong>card:</strong> ONLY for actual Card components (auto-applied by Card component)</li>
                  <li><strong>input:</strong> ONLY for Input fields (auto-applied by Input component)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Brand Colors - Interactive Buttons */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Brand Colors (Gold)</CardTitle>
              <CardDescription>Primary color with interactive states - hover and focus to see variations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Solid primary */}
                <div className="space-y-3">
                  <div className="rounded-lg bg-primary shadow-primary p-6 text-center transition-all hover:bg-primary/90 hover:scale-105 cursor-pointer">
                    <p className="font-medium text-primary-foreground">Primary</p>
                    <p className="text-xs text-primary-foreground/80 mt-1">Hover me</p>
                  </div>
                  <code className="text-xs text-muted-foreground block text-center">shadow-primary</code>
                </div>

                {/* Primary text on background */}
                <div className="space-y-3">
                  <div className="rounded-lg bg-background border-2 border-primary p-6 text-center transition-all hover:bg-primary/10">
                    <p className="font-medium text-primary">Primary Text</p>
                    <p className="text-xs text-muted-foreground mt-1">On background</p>
                  </div>
                  <code className="text-xs text-muted-foreground block text-center">text-primary border-primary</code>
                </div>

                {/* Subtle primary */}
                <div className="space-y-3">
                  <div className="rounded-lg bg-primary/20 border border-primary/30 p-6 text-center transition-all hover:bg-primary/30">
                    <p className="font-medium text-primary">Subtle Accent</p>
                    <p className="text-xs text-primary/80 mt-1">20% opacity</p>
                  </div>
                  <code className="text-xs text-muted-foreground block text-center">bg-primary/20</code>
                </div>
              </div>

              {/* Focus ring demo */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Focus State (Tab to focus)</p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
                    Focus this button
                  </button>
                  <input 
                    type="text" 
                    placeholder="Or this input..."
                    className="rounded-md border-2 border-border bg-input px-4 py-2 text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  2px gold outline (ring-ring) with 2px offset - automatic from focus-visible
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Semantic Colors - Real Feedback Components */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Semantic Colors</CardTitle>
              <CardDescription>Status feedback in real components - hover for interaction states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success alert */}
              <div className="rounded-lg bg-success/10 border-l-4 border-success shadow-md p-4 transition-all hover:bg-success/20 hover:scale-[1.02]">
                <div className="flex gap-3">
                  <Check className="size-5 text-success shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-success">Stock updated successfully</p>
                    <p className="text-xs text-muted-foreground mt-1">Your inventory has been updated with 12 new items</p>
                  </div>
                </div>
              </div>

              {/* Warning alert */}
              <div className="rounded-lg bg-warning/10 border-l-4 border-warning shadow-md p-4 transition-all hover:bg-warning/20 hover:scale-[1.02]">
                <div className="flex gap-3">
                  <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warning">Low stock alert</p>
                    <p className="text-xs text-muted-foreground mt-1">5 items are below par level and need reordering</p>
                  </div>
                </div>
              </div>

              {/* Error alert */}
              <div className="rounded-lg bg-destructive/10 border-l-4 border-destructive shadow-md p-4 transition-all hover:bg-destructive/20 hover:scale-[1.02]">
                <div className="flex gap-3">
                  <X className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Failed to save changes</p>
                    <p className="text-xs text-muted-foreground mt-1">Please check your connection and try again</p>
                  </div>
                </div>
              </div>

              {/* Info alert */}
              <div className="rounded-lg bg-info/10 border-l-4 border-info shadow-md p-4 transition-all hover:bg-info/20 hover:scale-[1.02]">
                <div className="flex gap-3">
                  <Info className="size-5 text-info shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-info">Inventory report ready</p>
                    <p className="text-xs text-muted-foreground mt-1">Your monthly inventory report is available for download</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography - Real Content Examples */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Typography</h2>
            <p className="mt-2 text-muted-foreground">
              Playfair Display for headings, Inter for body - creating hierarchy and readability
            </p>
          </div>

          {/* Heading Hierarchy in Context */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Heading Hierarchy</CardTitle>
              <CardDescription>Real-world heading structure with Playfair Display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Page title example */}
              <div className="space-y-3 pb-6 border-b border-border">
                <div className="flex items-baseline gap-3">
                  <h1 className="font-heading text-4xl font-bold text-foreground">
                    Inventory Dashboard
                  </h1>
                  <code className="text-xs text-muted-foreground">text-4xl font-bold</code>
                </div>
                <p className="text-base text-muted-foreground">
                  Main page titles and primary headings
                </p>
              </div>

              {/* Section title example */}
              <div className="space-y-3 pb-6 border-b border-border">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-heading text-3xl font-bold text-foreground">
                    Low Stock Items
                  </h2>
                  <code className="text-xs text-muted-foreground">text-3xl font-bold</code>
                </div>
                <p className="text-base text-muted-foreground">
                  Major section dividers and category headers
                </p>
              </div>

              {/* Subsection title example */}
              <div className="space-y-3 pb-6 border-b border-border">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-heading text-2xl font-semibold text-foreground">
                    Spirits & Liquors
                  </h3>
                  <code className="text-xs text-muted-foreground">text-2xl font-semibold</code>
                </div>
                <p className="text-base text-muted-foreground">
                  Subsection headers within categories
                </p>
              </div>

              {/* Card title example */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <h4 className="font-heading text-xl font-semibold text-primary">
                    Aperol Spritz
                  </h4>
                  <code className="text-xs text-muted-foreground">text-xl font-semibold text-primary</code>
                </div>
                <p className="text-base text-muted-foreground">
                  Card titles and item names with brand color
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Body Text in Real Components */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Body Text & Reading Hierarchy</CardTitle>
              <CardDescription>Inter font family with proper sizing for readability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Large text for emphasis */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-lg text-foreground">
                    Total inventory value: €12,450
                  </p>
                  <code className="text-xs text-muted-foreground">text-lg</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Emphasis text, important stats, featured content
                </p>
              </div>

              {/* Default body text */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-base text-foreground">
                    You have 15 items below par level that require immediate attention.
                  </p>
                  <code className="text-xs text-muted-foreground">text-base</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Default body text, descriptions, general content (16px)
                </p>
              </div>

              {/* Small text for UI */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm text-foreground">
                    Last updated: 2 hours ago by Marco Rossi
                  </p>
                  <code className="text-xs text-muted-foreground">text-sm</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  UI labels, secondary information, metadata (14px)
                </p>
              </div>

              {/* Extra small for captions */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-muted-foreground">
                    Stock levels are updated in real-time across all locations
                  </p>
                  <code className="text-xs text-muted-foreground">text-xs</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Captions, hints, helper text with muted color (12px)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weight Combinations */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Font Weights in Context</CardTitle>
              <CardDescription>Weight variations create visual hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="shadow-sm">
                <CardContent className="space-y-2 pt-6">
                  <p className="text-base font-semibold text-foreground">Product Name</p>
                  <p className="text-sm font-normal text-muted-foreground">Category: Spirits • Stock: 12 bottles</p>
                  <p className="text-xs font-medium text-primary">Reorder recommended</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-lg font-bold text-foreground">€145.00</p>
                    <p className="text-sm font-normal text-muted-foreground">Total value</p>
                  </div>
                  <Button size="sm">View Details</Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Components - Buttons */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Interactive Components</h2>
            <p className="mt-2 text-muted-foreground">
              Buttons, forms, and interactive elements with all states
            </p>
          </div>

          {/* Button Variants - All States */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Button Variants & States</CardTitle>
              <CardDescription>Hover, focus, and disabled states - try interacting with each</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Primary Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Primary Actions (Default)</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default">Save Inventory</Button>
                  <Button variant="default" disabled>Processing...</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gold background, white text. Hover: 90% opacity. Focus: gold ring. Use for primary CTAs.
                </p>
              </div>

              {/* Secondary Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Secondary & Outline</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="outline">View Details</Button>
                  <Button variant="ghost">Edit</Button>
                  <Button variant="link">Learn More</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Secondary: muted bg. Outline: border with hover bg. Ghost: transparent with hover. Link: underline.
                </p>
              </div>

              {/* Semantic Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Semantic Variants</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="success">Stock Updated</Button>
                  <Button variant="warning">Low Stock</Button>
                  <Button variant="destructive">Delete Item</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Success: green. Warning: amber. Destructive: red. Each has matching focus ring color.
                </p>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Size Variants</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default" size="sm">Small</Button>
                  <Button variant="default" size="default">Default</Button>
                  <Button variant="default" size="lg">Large</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Small: h-9 (36px). Default: h-11 (44px). Large: h-12 (48px).
                </p>
                <p className="text-xs text-success">
                  ✅ Default now meets WCAG AAA touch target minimum (44px)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Form Elements & Validation</CardTitle>
              <CardDescription>Inputs with bg-input background and all validation states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl space-y-6">
                {/* Normal input */}
                <div className="space-y-2">
                  <Label htmlFor="normal">Product Name</Label>
                  <Input
                    id="normal"
                    type="text"
                    placeholder="Enter product name..."
                    className="bg-input shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground">bg-input with subtle inset shadow</p>
                </div>

                {/* With value */}
                <div className="space-y-2">
                  <Label htmlFor="filled">Category</Label>
                  <Input
                    id="filled"
                    type="text"
                    defaultValue="Spirits & Liquors"
                    className="bg-input shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground">Input with value - hover and focus to see states</p>
                </div>

                {/* Disabled */}
                <div className="space-y-2">
                  <Label htmlFor="disabled">SKU (Auto-generated)</Label>
                  <Input
                    id="disabled"
                    type="text"
                    defaultValue="SKU-2024-001"
                    disabled
                    className="bg-input shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground">Disabled state with reduced opacity</p>
                </div>

                {/* Error state */}
                <div className="space-y-2">
                  <Label htmlFor="error" className="text-destructive">Stock Quantity *</Label>
                  <Input
                    id="error"
                    type="number"
                    placeholder="0"
                    aria-invalid="true"
                  />
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="size-4" />
                    This field is required
                  </p>
                </div>

                {/* Success state */}
                <div className="space-y-2">
                  <Label htmlFor="success" className="text-success">Email Address</Label>
                  <Input
                    id="success"
                    type="email"
                    defaultValue="inventory@barback.com"
                    className="bg-input shadow-sm border-success"
                  />
                  <p className="text-sm text-success flex items-center gap-1">
                    <Check className="size-4" />
                    Email verified successfully
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dropdown Menu */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Dropdown Menu</CardTitle>
              <CardDescription>Interactive menu component with hover states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions
                      <ChevronDown className="ml-2 size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Inventory Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Check className="mr-2 size-4" />
                      Update Stock
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Info className="mr-2 size-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <X className="mr-2 size-4" />
                      Delete Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default">
                      Filter by Category
                      <ChevronDown className="ml-2 size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Product Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>All Items</DropdownMenuItem>
                    <DropdownMenuItem>Spirits & Liquors</DropdownMenuItem>
                    <DropdownMenuItem>Wine & Champagne</DropdownMenuItem>
                    <DropdownMenuItem>Beer & Cider</DropdownMenuItem>
                    <DropdownMenuItem>Mixers & Syrups</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Click buttons to see dropdown menus with hover effects and proper elevation
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Card Variants */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Card Variants</h2>
            <p className="mt-2 text-muted-foreground">
              Content containers with semantic colors and hover states
            </p>
          </div>

          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Card Component Variants</CardTitle>
              <CardDescription>All card styles with real inventory use cases - hover to see effects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default cards */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Default, Bordered & Highlighted</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Default Card</CardTitle>
                      <CardDescription>Standard content container</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Basic card styling with shadow-md. No border by default.
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant="bordered" className="shadow-md">
                    <CardHeader>
                      <CardTitle>Bordered Card</CardTitle>
                      <CardDescription>With subtle border</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Default card with a subtle border using border-border color.
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant="highlighted">
                    <CardHeader>
                      <CardTitle className="text-primary">Highlighted Card</CardTitle>
                      <CardDescription>Enhanced visibility</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Stronger border (primary/30) with shadow-lg for featured content and important sections.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Gradients */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Gradient Highlights</h2>
            <p className="mt-2 text-muted-foreground">
              Premium effects for featured content - hover to see transitions
            </p>
          </div>

          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Available Gradients</CardTitle>
              <CardDescription>CSS custom properties for premium visual effects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Highlight gradient */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Subtle Highlight (--gradient-highlight)</h4>
                <div className="rounded-xl border border-primary/20 bg-[image:var(--gradient-highlight)] p-6 transition-all hover:bg-[image:var(--gradient-highlight-hover)] hover:shadow-lg">
                  <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                    Featured Cocktail Menu
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Subtle gold gradient background. Hover changes to --gradient-highlight-hover with stronger gold tint.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">bg-[image:var(--gradient-highlight)]</code>
                </div>
              </div>

              {/* Premium gradient */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Premium Shimmer (--gradient-premium)</h4>
                <div className="rounded-xl bg-[image:var(--gradient-premium)] p-6 shadow-md transition-transform hover:scale-[1.02]">
                  <h3 className="font-heading text-xl font-semibold text-primary-foreground mb-2">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-primary-foreground/90 mb-4">
                    Bold gold shimmer for CTAs and premium features. Scales slightly on hover for attention.
                  </p>
                  <Button variant="secondary" size="sm">Learn More</Button>
                </div>
                <code className="text-xs text-muted-foreground">bg-[image:var(--gradient-premium)]</code>
              </div>

              {/* Surface gradient - Light mode only */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Popover vs Card Colors</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
                    <h3 className="font-heading text-xl font-semibold text-card-foreground mb-2">
                      Card Component
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Uses <code className="text-xs bg-muted px-1 rounded">--color-card</code> for elevated surfaces
                    </p>
                  </div>
                  
                  <div className="rounded-xl bg-popover border border-border p-6 shadow-md">
                    <h3 className="font-heading text-xl font-semibold text-popover-foreground mb-2">
                      Popover Component
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Uses <code className="text-xs bg-muted px-1 rounded">--color-popover</code> for dropdown menus
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Currently identical values - kept as semantic aliases. Popover may get higher elevation styling in the future.
                </p>
              </div>

              {/* Combined example */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Combining Gradient + Colored Shadow</h4>
                <div className="rounded-xl border border-success/30 bg-[image:var(--gradient-highlight)] p-6 shadow-success transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-success mb-1">
                        Best Seller This Month
                      </h3>
                      <p className="text-sm text-muted-foreground">Negroni • 127 sold</p>
                    </div>
                    <Check className="size-6 text-success" />
                  </div>
                  <Button variant="success" size="sm">View Analytics</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gradient background + semantic colored shadow for maximum visual impact
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacing & Shadows */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Spacing & Elevation</h2>
            <p className="mt-2 text-muted-foreground">
              Touch-friendly spacing and dual-layer shadow system
            </p>
          </div>

          {/* Touch targets */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Touch-Friendly Spacing</CardTitle>
              <CardDescription>Mobile-first with 44px minimum touch targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Touch Target Class (h-touch = 44px)</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button type="button" className="h-touch rounded-md bg-primary px-6 text-primary-foreground hover:bg-primary/90 transition-colors">
                    Touch Button
                  </button>
                  <button type="button" className="h-touch rounded-md bg-secondary px-6 text-secondary-foreground hover:bg-secondary/80 transition-colors">
                    Secondary
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use h-touch class for 44px minimum height (WCAG AAA compliance for mobile)
                </p>
                <p className="text-xs text-success">
                  ✅ Button default size now h-11 (44px) - meets accessibility standards
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Spacing Scale (4px base unit)</p>
                <div className="space-y-2">
                  {[1, 2, 4, 6, 8, 12].map((size) => (
                    <div key={size} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-muted-foreground">
                        {size} ({size * 4}px)
                      </div>
                      <div
                        className="bg-primary rounded"
                        style={{
                          width: `${size * 4}px`,
                          height: '16px',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shadow system */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Elevation Shadow System</CardTitle>
              <CardDescription>Dual-layer shadows (contact + ambient) with inset highlight on top edge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(['sm', 'default', 'md', 'lg', 'xl', '2xl'] as const).map((level) => (
                  <div key={level} className="space-y-2">
                    <Card className={`${level === 'default' ? 'shadow' : `shadow-${level}`} transition-transform hover:scale-105`}>
                      <CardContent className="h-24 flex items-center justify-center">
                        <span className="text-sm font-medium text-card-foreground">
                          shadow-{level === 'default' ? 'default' : level}
                        </span>
                      </CardContent>
                    </Card>
                    <p className="text-xs text-center text-muted-foreground">
                      {level === 'sm' && 'Subtle depth'}
                      {level === 'default' && 'Standard cards'}
                      {level === 'md' && 'Elevated elements'}
                      {level === 'lg' && 'Modal dialogs'}
                      {level === 'xl' && 'Top-layer UI'}
                      {level === '2xl' && 'Maximum depth'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Shadow Structure:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li><strong>Inset highlight:</strong> Subtle top inner glow for premium feel</li>
                  <li><strong>Contact shadow:</strong> Sharper, darker shadow close to element</li>
                  <li><strong>Ambient shadow:</strong> Softer, diffused shadow for depth</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Colored shadows with Tailwind utilities */}
          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Colored Shadows (Tailwind Utilities)</CardTitle>
              <CardDescription>Using Tailwind's shadow-{'{'}color{'}'} utilities for semantic emphasis - hover to see effect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Primary colored shadow */}
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-card border-2 border-primary/20 shadow-lg shadow-primary/25 flex items-center justify-center transition-all hover:shadow-xl hover:shadow-primary/40 hover:border-primary/30 cursor-pointer">
                    <span className="text-sm font-medium text-primary">
                      shadow-primary
                    </span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Gold glow for CTAs</p>
                  <code className="text-xs text-muted-foreground block text-center">shadow-lg shadow-primary/25</code>
                </div>

                {/* Success colored shadow */}
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-card border-2 border-success/20 shadow-lg shadow-success/25 flex items-center justify-center transition-all hover:shadow-xl hover:shadow-success/40 hover:border-success/30 cursor-pointer">
                    <span className="text-sm font-medium text-success">
                      shadow-success
                    </span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Green glow for positive actions</p>
                  <code className="text-xs text-muted-foreground block text-center">shadow-lg shadow-success/25</code>
                </div>

                {/* Destructive colored shadow */}
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-card border-2 border-destructive/20 shadow-lg shadow-destructive/25 flex items-center justify-center transition-all hover:shadow-xl hover:shadow-destructive/40 hover:border-destructive/30 cursor-pointer">
                    <span className="text-sm font-medium text-destructive">
                      shadow-destructive
                    </span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Red glow for warnings</p>
                  <code className="text-xs text-muted-foreground block text-center">shadow-lg shadow-destructive/25</code>
                </div>

                {/* Warning colored shadow */}
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-card border-2 border-warning/20 shadow-lg shadow-warning/25 flex items-center justify-center transition-all hover:shadow-xl hover:shadow-warning/40 hover:border-warning/30 cursor-pointer">
                    <span className="text-sm font-medium text-warning">
                      shadow-warning
                    </span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Amber glow for caution</p>
                  <code className="text-xs text-muted-foreground block text-center">shadow-lg shadow-warning/25</code>
                </div>

                {/* Info colored shadow */}
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-card border-2 border-info/20 shadow-lg shadow-info/25 flex items-center justify-center transition-all hover:shadow-xl hover:shadow-info/40 hover:border-info/30 cursor-pointer">
                    <span className="text-sm font-medium text-info">
                      shadow-info
                    </span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Blue glow for information</p>
                  <code className="text-xs text-muted-foreground block text-center">shadow-lg shadow-info/25</code>
                </div>

                {/* Combined example */}
                <div className="space-y-2">
                  <div className="h-24 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 shadow-xl shadow-primary/30 flex items-center justify-center transition-all hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 cursor-pointer">
                    <span className="text-sm font-medium text-primary">
                      Featured
                    </span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Combined effects</p>
                  <code className="text-xs text-muted-foreground block text-center">shadow-xl shadow-primary/30</code>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">How It Works:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Tailwind automatically provides <code className="bg-background px-1 rounded">shadow-{'{'}color{'}'}</code> utilities for all theme colors</li>
                  <li>Combine elevation (<code className="bg-background px-1 rounded">shadow-lg</code>) with color (<code className="bg-background px-1 rounded">shadow-primary/25</code>)</li>
                  <li>Use opacity modifiers (e.g., <code className="bg-background px-1 rounded">/25</code>) to control glow intensity</li>
                  <li>Best combined with matching borders for strongest visual effect</li>
                </ul>
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <p className="font-medium text-foreground">Example Usage:</p>
                  <code className="block bg-background-dark px-2 py-1 rounded">
                    &lt;Card className="shadow-lg shadow-primary/25 border-2 border-primary/20"&gt;
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Border Radius */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Border Radius</h2>
            <p className="mt-2 text-muted-foreground">
              From sharp to rounded - creating visual hierarchy
            </p>
          </div>

          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Radius Scale in Action</CardTitle>
              <CardDescription>Real component examples showing each radius size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-sm flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">rounded-sm (2px)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Subtle rounding for tight spaces</p>
                </div>

                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">rounded-md (6px)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Default for inputs and buttons</p>
                </div>

                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">rounded-lg (8px)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Standard for cards and containers</p>
                </div>

                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">rounded-xl (12px)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Larger cards and modals</p>
                </div>

                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-2xl flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">rounded-2xl (16px)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Feature cards and hero sections</p>
                </div>

                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">rounded-full</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pills, badges, and avatars</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Accessibility */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Accessibility</h2>
            <p className="mt-2 text-muted-foreground">
              Built-in accessibility features and best practices
            </p>
          </div>

          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Focus Management</CardTitle>
              <CardDescription>Tab through these elements to see focus indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>First Button</Button>
                <Button variant="secondary">Second Button</Button>
                <Input placeholder="Then this input" className="max-w-xs" />
                <Button variant="outline">Final Button</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                2px gold outline (--color-ring) with 2px offset. Automatically applied to interactive elements.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background shadow-md">
            <CardHeader>
              <CardTitle>Color Contrast & Motion</CardTitle>
              <CardDescription>WCAG compliance and motion sensitivity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 rounded-md bg-background border border-border p-4">
                  <p className="text-sm font-medium text-foreground">
                    High Contrast Text
                  </p>
                  <p className="text-xs text-muted-foreground">OKLCH ensures perceptually uniform brightness</p>
                </div>
                <div className="space-y-2 rounded-md bg-primary p-4">
                  <p className="text-sm font-medium text-primary-foreground">
                    Primary Contrast
                  </p>
                  <p className="text-xs text-primary-foreground/80">Readable white text on gold</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                All animations respect prefers-reduced-motion. Transitions are disabled for users with motion sensitivity.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center pb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Barback Design System • Built with React, TypeScript, Tailwind v4, and shadcn/ui
          </p>
          <p className="text-xs text-muted-foreground">
            Interactive design system showcasing all components, variants, and states
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DesignSystemPage;
