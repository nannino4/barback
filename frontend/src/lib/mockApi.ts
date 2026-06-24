/**
 * Mock API utility for design system demos
 * Simulates API calls with configurable delays and error states
 */

export interface MockApiOptions
{
  delay?: number;
  shouldFail?: boolean;
  errorMessage?: string;
}

export const mockApi = {
  /**
   * Simulates a successful API call with delay
   */
  async success<T>(data: T, delay = 1000): Promise<T>
  {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return data;
  },

  /**
   * Simulates a failed API call with delay
   */
  async error(message = 'Something went wrong', delay = 1000): Promise<never>
  {
    await new Promise((resolve) => setTimeout(resolve, delay));
    throw new Error(message);
  },

  /**
   * Simulates an API call with configurable behavior
   */
  async call<T>(data: T, options: MockApiOptions = {}): Promise<T>
  {
    const { delay = 1000, shouldFail = false, errorMessage = 'Something went wrong' } = options;
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    if (shouldFail)
    {
      throw new Error(errorMessage);
    }
    
    return data;
  },
};

/**
 * Mock data generators for common entities
 */
export const mockData = {
  organization: (id: string, name: string) => ({
    id,
    name,
    owner: {
      id: 'owner-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    createdAt: new Date().toISOString(),
  }),

  user: (id: string, firstName: string, lastName: string) => ({
    id,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}@example.com`,
    timezone: 'auto',
  }),

  product: (id: string, name: string, category: string) => ({
    id,
    name,
    category,
    unit: 'bottle',
    currentQuantity: Math.floor(Math.random() * 20),
    parLevel: 10,
    lastUpdated: new Date().toISOString(),
  }),

  invitation: (id: string, organizationName: string) => ({
    id,
    organization: mockData.organization('org-1', organizationName),
    invitedBy: mockData.user('user-1', 'Jane', 'Smith'),
    role: 'STAFF' as const,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }),
};
