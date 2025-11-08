import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Mail,
  Package,
  Users,
  Plus,
  Search,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatusMessage } from '@/components/feedback/StatusMessage';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import { Grid } from '@/components/layout/Grid';
import { mockApi, mockData } from '@/lib/mockApi';
import { Spinner } from '@/components/ui/spinner';

/**
 * Interactive Design System - Production-grade component showcase
 * 
 * This page demonstrates:
 * - Real-world usage patterns
 * - Interactive state toggling
 * - Mock API integration
 * - Responsive layouts
 * - All feedback states (loading, error, empty, success)
 */
const DesignSystemPage: React.FC = () =>
{
  const [activeTab, setActiveTab] = useState('components');
  
  return (
    <PageContainer>
      {/* Header */}
      <Section spacing="lg">
        <Stack space="sm">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-primary">
            The Speakeasy
          </h1>
          <p className="text-lg text-muted-foreground">
            Barback Design System - Interactive component showcase with real-world patterns
          </p>
        </Stack>
      </Section>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Section spacing="md">
          <TabsList>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
          </TabsList>
        </Section>

        {/* Components Tab */}
        <TabsContent value="components">
          <ComponentsDemo />
        </TabsContent>

        {/* Layouts Tab */}
        <TabsContent value="layouts">
          <LayoutsDemo />
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns">
          <PatternsDemo />
        </TabsContent>

        {/* States Tab */}
        <TabsContent value="states">
          <StatesDemo />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

/**
 * Components Demo - Shows all UI components with variants
 */
const ComponentsDemo: React.FC = () =>
{
  return (
    <Stack space="xl">
      {/* Buttons Section */}
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Buttons</h2>
            <p className="text-sm text-muted-foreground">
              All button variants with different states and sizes
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Primary, secondary, outline, ghost, and destructive</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="lg">
                {/* Default sizes */}
                <div>
                  <Label className="mb-3 block">Default Size</Label>
                  <Stack direction="horizontal" space="sm" align="center" className="flex-wrap">
                    <Button variant="default">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </Stack>
                </div>

                {/* Small size */}
                <div>
                  <Label className="mb-3 block">Small Size</Label>
                  <Stack direction="horizontal" space="sm" align="center" className="flex-wrap">
                    <Button variant="default" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="ghost" size="sm">Ghost</Button>
                  </Stack>
                </div>

                {/* With icons */}
                <div>
                  <Label className="mb-3 block">With Icons</Label>
                  <Stack direction="horizontal" space="sm" align="center" className="flex-wrap">
                    <Button variant="default" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create New
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Search className="w-4 h-4" />
                      Search
                    </Button>
                    <Button variant="ghost" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </Button>
                  </Stack>
                </div>

                {/* Disabled state */}
                <div>
                  <Label className="mb-3 block">Disabled</Label>
                  <Stack direction="horizontal" space="sm" align="center" className="flex-wrap">
                    <Button variant="default" disabled>Primary</Button>
                    <Button variant="outline" disabled>Outline</Button>
                  </Stack>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Section>

      {/* Form Inputs Section */}
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Form Inputs</h2>
            <p className="text-sm text-muted-foreground">
              Text inputs, labels, and form patterns
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
              <CardDescription>Standard form inputs with labels and validation</CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                <Stack space="xs">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input id="name" placeholder="Enter organization name" />
                </Stack>
                
                <Stack space="xs">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </Stack>
                
                <Stack space="xs">
                  <Label htmlFor="search">Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="search" className="pl-9" placeholder="Search..." />
                  </div>
                </Stack>
                
                <Stack space="xs">
                  <Label htmlFor="disabled">Disabled Input</Label>
                  <Input id="disabled" disabled placeholder="Disabled" />
                </Stack>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </Section>

      {/* Badges Section */}
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Badges</h2>
            <p className="text-sm text-muted-foreground">
              Status indicators and labels
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Different badge styles for various contexts</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack direction="horizontal" space="sm" align="center" className="flex-wrap">
                <Badge variant="default">Owner</Badge>
                <Badge variant="secondary">Manager</Badge>
                <Badge variant="outline">Staff</Badge>
                <Badge variant="destructive">Critical</Badge>
                <Badge className="bg-success text-success-foreground">Active</Badge>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Section>

      {/* Cards Section */}
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Cards</h2>
            <p className="text-sm text-muted-foreground">
              Content containers with headers and sections
            </p>
          </div>
          
          <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle>The Speakeasy</CardTitle>
                    <CardDescription>Cocktail bar in Rome</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A sophisticated cocktail bar specializing in craft spirits and mixology.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>245 products tracked</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive inventory management for spirits, mixers, and garnishes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle>Team</CardTitle>
                    <CardDescription>12 active members</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Collaborate with bartenders, managers, and staff members.
                </p>
              </CardContent>
            </Card>
          </Grid>
        </Stack>
      </Section>

      {/* Spinners Section */}
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Loading Indicators</h2>
            <p className="text-sm text-muted-foreground">
              Spinners for loading states
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Spinner Sizes</CardTitle>
              <CardDescription>Small, medium, and large spinners</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack direction="horizontal" space="lg" align="center" className="flex-wrap">
                <Stack space="xs" align="center">
                  <Spinner size="sm" />
                  <Label>Small</Label>
                </Stack>
                <Stack space="xs" align="center">
                  <Spinner size="md" />
                  <Label>Medium</Label>
                </Stack>
                <Stack space="xs" align="center">
                  <Spinner size="lg" />
                  <Label>Large</Label>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Section>
    </Stack>
  );
};

/**
 * Layouts Demo - Shows layout component usage
 */
const LayoutsDemo: React.FC = () =>
{
  return (
    <Stack space="xl">
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Layout Components</h2>
            <p className="text-sm text-muted-foreground">
              PageContainer, Section, Stack, and Grid for consistent layouts
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grid Layouts</CardTitle>
              <CardDescription>Responsive grid with different column configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="lg">
                {/* 2 columns */}
                <div>
                  <Label className="mb-3 block">2 Columns (mobile: 1, tablet: 2, desktop: 2)</Label>
                  <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 bg-muted rounded-lg text-center">
                        Item {i}
                      </div>
                    ))}
                  </Grid>
                </div>

                {/* 3 columns */}
                <div>
                  <Label className="mb-3 block">3 Columns (mobile: 1, tablet: 2, desktop: 3)</Label>
                  <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="p-4 bg-muted rounded-lg text-center">
                        Item {i}
                      </div>
                    ))}
                  </Grid>
                </div>

                {/* 4 columns */}
                <div>
                  <Label className="mb-3 block">4 Columns (mobile: 2, tablet: 3, desktop: 4)</Label>
                  <Grid cols={{ mobile: 2, tablet: 3, desktop: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="p-4 bg-muted rounded-lg text-center">
                        Item {i}
                      </div>
                    ))}
                  </Grid>
                </div>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stack Layouts</CardTitle>
              <CardDescription>Vertical and horizontal stacks with spacing</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="lg">
                {/* Vertical stack */}
                <div>
                  <Label className="mb-3 block">Vertical Stack (space="md")</Label>
                  <Stack space="md">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-muted rounded-lg">
                        Stacked Item {i}
                      </div>
                    ))}
                  </Stack>
                </div>

                {/* Horizontal stack */}
                <div>
                  <Label className="mb-3 block">Horizontal Stack (space="sm")</Label>
                  <Stack direction="horizontal" space="sm" className="flex-wrap">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 bg-muted rounded-lg">
                        Item {i}
                      </div>
                    ))}
                  </Stack>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Section>
    </Stack>
  );
};

/**
 * Patterns Demo - Shows common UI patterns
 */
const PatternsDemo: React.FC = () =>
{
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Stack space="xl">
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Common Patterns</h2>
            <p className="text-sm text-muted-foreground">
              Real-world UI patterns used throughout the app
            </p>
          </div>

          {/* Search Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Pattern</CardTitle>
              <CardDescription>Common pattern for searchable lists</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    placeholder="Search products..."
                  />
                </div>
                <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
                  {['Whiskey', 'Vodka', 'Gin', 'Rum', 'Tequila', 'Brandy']
                    .filter((item) =>
                      item.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((item) => (
                      <Card key={item}>
                        <CardHeader>
                          <CardTitle className="text-base">{item}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* Status Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Status Messages</CardTitle>
              <CardDescription>Contextual feedback for user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="md">
                <StatusMessage
                  variant="success"
                  title="Organization created successfully"
                  description="Your new organization is ready to use"
                />
                <StatusMessage
                  variant="error"
                  title="Failed to save changes"
                  description="Please check your internet connection and try again"
                />
                <StatusMessage
                  variant="warning"
                  title="Trial expires in 3 days"
                  description="Upgrade to a paid plan to continue using all features"
                />
                <StatusMessage
                  variant="info"
                  title="New feature available"
                  description="Check out the new inventory analytics dashboard"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Icon + Text Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Icon + Text Pattern</CardTitle>
              <CardDescription>Standard pattern for labeled content</CardDescription>
            </CardHeader>
            <CardContent>
              <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                <Stack space="xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Organization</span>
                  </div>
                  <p className="text-base font-medium">The Speakeasy</p>
                </Stack>

                <Stack space="xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Team Members</span>
                  </div>
                  <p className="text-base font-medium">12 active</p>
                </Stack>

                <Stack space="xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">Total Products</span>
                  </div>
                  <p className="text-base font-medium">245 items</p>
                </Stack>

                <Stack space="xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Last Updated</span>
                  </div>
                  <p className="text-base font-medium">2 hours ago</p>
                </Stack>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </Section>
    </Stack>
  );
};

/**
 * States Demo - Shows interactive state management
 */
const StatesDemo: React.FC = () =>
{
  const [forceError, setForceError] = useState(false);
  const [forceEmpty, setForceEmpty] = useState(false);
  
  // Mock query with controlled states
  const organizationsQuery = useQuery({
    queryKey: ['demo-organizations', forceError, forceEmpty],
    queryFn: async () =>
    {
      if (forceError)
      {
        return mockApi.error('Failed to load organizations');
      }
      
      if (forceEmpty)
      {
        return mockApi.success([], 800);
      }
      
      return mockApi.success([
        mockData.organization('1', 'The Speakeasy'),
        mockData.organization('2', 'Midnight Bar'),
        mockData.organization('3', 'Golden Hour Lounge'),
      ], 800);
    },
  });

  return (
    <Stack space="xl">
      <Section>
        <Stack space="md">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Interactive States</h2>
            <p className="text-sm text-muted-foreground">
              Toggle between loading, error, empty, and success states
            </p>
          </div>

          {/* State Controls */}
          <Card>
            <CardHeader>
              <CardTitle>State Controls</CardTitle>
              <CardDescription>Toggle different states to see how components respond</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack direction="horizontal" space="sm" className="flex-wrap">
                <Button
                  variant={forceError ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                  {
                    setForceError(!forceError);
                    setForceEmpty(false);
                  }}
                >
                  {forceError ? 'Show Success' : 'Force Error'}
                </Button>
                <Button
                  variant={forceEmpty ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                  {
                    setForceEmpty(!forceEmpty);
                    setForceError(false);
                  }}
                >
                  {forceEmpty ? 'Show Data' : 'Force Empty'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void organizationsQuery.refetch()}
                  disabled={organizationsQuery.isFetching}
                >
                  Refetch
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Interactive Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Organizations List Demo</CardTitle>
              <CardDescription>Real-world example with all states</CardDescription>
            </CardHeader>
            <CardContent>
              {organizationsQuery.isLoading ? (
                <LoadingState message="Loading organizations..." />
              ) : organizationsQuery.error ? (
                <ErrorState
                  title="Failed to load organizations"
                  description="We couldn't load your organizations. Please try again."
                  onRetry={() => void organizationsQuery.refetch()}
                  isRetrying={organizationsQuery.isFetching}
                />
              ) : organizationsQuery.data && organizationsQuery.data.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No organizations yet"
                  description="Create your first organization to get started with inventory management"
                  action={{
                    label: 'Create Organization',
                    onClick: () => alert('Create dialog would open here'),
                  }}
                />
              ) : (
                <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
                  {organizationsQuery.data?.map((org) => (
                    <Card key={org.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{org.name}</CardTitle>
                            <CardDescription>
                              Owner: {org.owner.firstName} {org.owner.lastName}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="default">Owner</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Empty States Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Empty State Variants</CardTitle>
              <CardDescription>Different sizes and with/without actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="lg">
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description="Try adjusting your search or filters"
                  size="sm"
                />
                <EmptyState
                  icon={Mail}
                  title="No invitations"
                  description="You don't have any pending invitations at the moment"
                  size="md"
                />
                <EmptyState
                  icon={Users}
                  title="No team members yet"
                  description="Invite your first team member to start collaborating"
                  action={{
                    label: 'Invite Team Member',
                    onClick: () => alert('Invite dialog would open'),
                  }}
                  size="lg"
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Section>
    </Stack>
  );
};

export default DesignSystemPage;
