import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

        {/* Color System */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Color System</h2>
            <p className="mt-2 text-muted-foreground">
                            OKLCH color space for perceptually uniform brightness and vibrant colors
            </p>
          </div>

          {/* Base Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Base Colors</CardTitle>
              <CardDescription>Background and foreground foundations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ColorSwatch
                name="Background"
                className="bg-background text-foreground border-2 border-border"
                description="Deep charcoal base"
              />
              <ColorSwatch
                name="Foreground"
                className="bg-foreground text-background"
                description="High contrast text"
              />
              <ColorSwatch
                name="Card"
                className="bg-card text-card-foreground border-2 border-border"
                description="Elevated surfaces"
              />
            </CardContent>
          </Card>

          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Gold accent - the signature of sophistication</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ColorSwatch
                name="Primary"
                className="bg-primary text-primary-foreground"
                description="Gold primary"
              />
              <ColorSwatch
                name="Primary Hover"
                className="bg-primary/90 text-primary-foreground"
                description="90% opacity"
              />
              <ColorSwatch
                name="Primary Subtle"
                className="bg-primary/20 text-primary"
                description="20% opacity"
              />
              <ColorSwatch
                name="Primary Ring"
                className="border-4 border-ring bg-background text-foreground"
                description="Focus state"
              />
            </CardContent>
          </Card>

          {/* Semantic Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Semantic Colors</CardTitle>
              <CardDescription>Status and feedback colors</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ColorSwatch
                name="Success"
                className="bg-success text-success-foreground"
                description="Success green"
              />
              <ColorSwatch
                name="Warning"
                className="bg-warning text-warning-foreground"
                description="Warning amber"
              />
              <ColorSwatch
                name="Destructive"
                className="bg-destructive text-destructive-foreground"
                description="Error red"
              />
              <ColorSwatch
                name="Info"
                className="bg-info text-info-foreground"
                description="Info blue"
              />
            </CardContent>
          </Card>

          {/* UI Colors */}
          <Card>
            <CardHeader>
              <CardTitle>UI Element Colors</CardTitle>
              <CardDescription>Interactive UI elements with distinct appearances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Border</p>
                  <div className="h-24 rounded-lg border-4 border-border bg-background flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Border color</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Input Background</p>
                  <div className="h-24 rounded-lg bg-input border-2 border-border flex items-center justify-center">
                    <span className="text-sm text-foreground">Input field</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Focus Ring (try tabbing through inputs)</p>
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    placeholder="Focus me"
                    className="rounded-md border-2 border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Then focus me"
                    className="rounded-md border-2 border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Simple 2px outline with gold color matching primary brand. Rounded for elegance.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Typography</h2>
            <p className="mt-2 text-muted-foreground">
                            Playfair Display for headings, Inter for body text
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Heading Scale</CardTitle>
              <CardDescription>Playfair Display - Sophisticated serif</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">4xl - 36px / 2.25rem</p>
                <h1 className="font-heading text-4xl font-bold text-foreground">
                                    The Quick Brown Fox
                </h1>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">3xl - 30px / 1.875rem</p>
                <h2 className="font-heading text-3xl font-bold text-foreground">
                                    The Quick Brown Fox
                </h2>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">2xl - 24px / 1.5rem</p>
                <h3 className="font-heading text-2xl font-semibold text-foreground">
                                    The Quick Brown Fox
                </h3>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">xl - 20px / 1.25rem</p>
                <h4 className="font-heading text-xl font-semibold text-foreground">
                                    The Quick Brown Fox
                </h4>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Text Scale</CardTitle>
              <CardDescription>Inter - Clean, readable sans-serif</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">lg - 18px / 1.125rem</p>
                <p className="text-lg text-foreground">
                                    The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">base - 16px / 1rem</p>
                <p className="text-base text-foreground">
                                    The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">sm - 14px / 0.875rem</p>
                <p className="text-sm text-foreground">
                                    The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">xs - 12px / 0.75rem</p>
                <p className="text-xs text-muted-foreground">
                                    The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Font Weights</CardTitle>
              <CardDescription>Weight variations for emphasis and hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-base font-light text-foreground">Light (300) - Large headings, subtle emphasis</p>
              <p className="text-base font-normal text-foreground">Regular (400) - Default body text</p>
              <p className="text-base font-medium text-foreground">Medium (500) - Labels, emphasized text</p>
              <p className="text-base font-semibold text-foreground">Semibold (600) - Strong emphasis</p>
              <p className="text-base font-bold text-foreground">Bold (700) - Headings, very strong emphasis</p>
            </CardContent>
          </Card>
        </section>

        {/* Spacing & Layout */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Spacing & Layout</h2>
            <p className="mt-2 text-muted-foreground">
                            4px base unit with touch-friendly targets
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Touch Targets</CardTitle>
              <CardDescription>Minimum 44px (2.75rem) for accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <button type="button" className="h-touch rounded-md bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                                    Touch-friendly Button
                </button>
                <button type="button" className="h-touch rounded-md bg-secondary px-6 text-secondary-foreground hover:bg-secondary/90">
                                    Secondary Button
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                                All interactive elements use h-touch class for 44px minimum height
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>4px increments for consistent rhythm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 6, 8, 12, 16, 20, 24].map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">
                      {size} ({size * 4}px)
                    </div>
                    <div
                      className="bg-primary"
                      style={{
                        width: `${size * 4}px`,
                        height: '16px',
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Border Radius */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Border Radius</h2>
            <p className="mt-2 text-muted-foreground">
                            From sharp to rounded corners
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Radius Scale</CardTitle>
              <CardDescription>Subtle to pronounced rounding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <RadiusDemo size="sm" label="Small (2px)" />
                <RadiusDemo size="default" label="Default (4px)" />
                <RadiusDemo size="md" label="Medium (6px)" />
                <RadiusDemo size="lg" label="Large (8px)" />
                <RadiusDemo size="xl" label="XL (12px)" />
                <RadiusDemo size="2xl" label="2XL (16px)" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Shadows */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Elevation & Shadows</h2>
            <p className="mt-2 text-muted-foreground">
                            Stronger shadows optimized for dark backgrounds
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Shadow Scale</CardTitle>
              <CardDescription>From subtle to prominent elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <ShadowDemo level="sm" label="Small" />
                <ShadowDemo level="default" label="Default" />
                <ShadowDemo level="md" label="Medium" />
                <ShadowDemo level="lg" label="Large" />
                <ShadowDemo level="xl" label="XL" />
                <ShadowDemo level="2xl" label="2XL" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colored Shadows (Semantic)</CardTitle>
              <CardDescription>Colored glows for emphasis and branding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex h-32 items-center justify-center rounded-lg bg-card shadow-primary">
                    <span className="font-medium text-primary">Primary Glow</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Gold shadow for brand elements</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-32 items-center justify-center rounded-lg bg-card shadow-success">
                    <span className="font-medium text-success">Success Glow</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Green shadow for positive actions</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-32 items-center justify-center rounded-lg bg-card shadow-destructive">
                    <span className="font-medium text-destructive">Error Glow</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Red shadow for warnings</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-32 items-center justify-center rounded-lg bg-card shadow-warning">
                    <span className="font-medium text-warning">Warning Glow</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Amber shadow for caution</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-32 items-center justify-center rounded-lg bg-card shadow-info">
                    <span className="font-medium text-info">Info Glow</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Blue shadow for information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Components */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Components</h2>
            <p className="mt-2 text-muted-foreground">
                            Interactive elements and patterns
            </p>
          </div>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>All button variants and states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Primary Actions</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default Button</Button>
                    <Button variant="default" disabled>
                                            Disabled
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Secondary Actions</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Semantic Actions</p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="destructive">Delete</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Sizes</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Inputs and form controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text Input</Label>
                  <Input
                    id="text-input"
                    type="text"
                    placeholder="Enter text..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-input">Email Input</Label>
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input
                    id="disabled-input"
                    type="text"
                    placeholder="Disabled"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="error-input">Input with Error</Label>
                  <Input
                    id="error-input"
                    type="text"
                    placeholder="Invalid input"
                    className="border-destructive focus-visible:ring-destructive"
                  />
                  <p className="text-sm text-destructive">This field is required</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>Container components for content grouping</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Simple Card</CardTitle>
                    <CardDescription>Basic card with header</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                                            Card content goes here with consistent spacing and typography.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="highlighted">
                  <CardHeader>
                    <CardTitle className="text-primary">Highlighted Card</CardTitle>
                    <CardDescription>Enhanced visibility variant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                                            Uses stronger border and shadow for emphasis with hover effect.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="primary">
                  <CardHeader>
                    <CardTitle className="text-primary">Primary Card</CardTitle>
                    <CardDescription>With colored glow shadow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                                            Colored shadows add depth and draw attention.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card variant="success">
                  <CardHeader>
                    <CardTitle className="text-success">Success Card</CardTitle>
                    <CardDescription>Positive actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                                            For successful operations or confirmations.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Destructive Card</CardTitle>
                    <CardDescription>Warning or error states</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                                            For errors, deletions, or critical warnings.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card variant="warning">
                  <CardHeader>
                    <CardTitle className="text-warning">Warning Card</CardTitle>
                    <CardDescription>Caution states</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                                            For alerts that need attention.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="info">
                  <CardHeader>
                    <CardTitle className="text-info">Info Card</CardTitle>
                    <CardDescription>Informational content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                                            For helpful information and tips.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Accessibility */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Accessibility Features</h2>
            <p className="mt-2 text-muted-foreground">
                            Built-in support for accessibility standards
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Focus States</CardTitle>
              <CardDescription>Visible focus indicators for keyboard navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                                    Tab through these elements to see focus rings:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button>Button 1</Button>
                  <Button variant="secondary">Button 2</Button>
                  <Input placeholder="Focus me" className="max-w-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reduced Motion</CardTitle>
              <CardDescription>
                                Respects prefers-reduced-motion preference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                                All animations and transitions are automatically disabled for users who prefer reduced motion.
                                This ensures a comfortable experience for users with vestibular disorders or motion sensitivity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Contrast</CardTitle>
              <CardDescription>WCAG AA compliant color combinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 rounded-md bg-background p-4">
                  <p className="text-sm font-medium text-foreground">
                                        Foreground on Background
                  </p>
                  <p className="text-xs text-muted-foreground">High contrast</p>
                </div>
                <div className="space-y-2 rounded-md bg-primary p-4">
                  <p className="text-sm font-medium text-primary-foreground">
                                        Primary Foreground on Primary
                  </p>
                  <p className="text-xs text-primary-foreground/80">Readable contrast</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
                        Barback Design System • Built with React, TypeScript, Tailwind v4, and shadcn/ui
          </p>
        </footer>
      </div>
    </div>
  );
};

// Helper Components
interface ColorSwatchProps
{
    name: string;
    className: string;
    description: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, className, description }) => 
{
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-lg ${className} flex items-center justify-center`}>
        <span className="font-medium">{name}</span>
      </div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

interface RadiusDemoProps
{
    size: 'sm' | 'default' | 'md' | 'lg' | 'xl' | '2xl';
    label: string;
}

const RadiusDemo: React.FC<RadiusDemoProps> = ({ size, label }) => 
{
  const radiusClass = size === 'default' ? 'rounded' : `rounded-${size}`;
    
  return (
    <div className="space-y-2">
      <div className={`h-20 bg-primary ${radiusClass}`} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

interface ShadowDemoProps
{
    level: 'sm' | 'default' | 'md' | 'lg' | 'xl' | '2xl';
    label: string;
}

const ShadowDemo: React.FC<ShadowDemoProps> = ({ level, label }) => 
{
  const shadowClass = level === 'default' ? 'shadow' : `shadow-${level}`;
    
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-lg bg-card ${shadowClass} flex items-center justify-center`}>
        <span className="text-sm font-medium text-card-foreground">{label}</span>
      </div>
    </div>
  );
};

export default DesignSystemPage;
