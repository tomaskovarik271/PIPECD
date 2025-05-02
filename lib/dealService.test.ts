import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { dealService } from './dealService';
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';

// --- Mock Setup --- 

// Define the shape of the builder mock here for typing
const mockPostgrestBuilderMethods = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
};

vi.mock('@supabase/supabase-js', () => {
  const mockClient = {
    // Reference the methods defined outside
    from: vi.fn(() => mockPostgrestBuilderMethods), 
    auth: {},
  };
  return {
    createClient: vi.fn(() => mockClient),
  };
});

// --- Helper Types --- 

interface MockUser {
  id: string;
}

// Type helper for the mocked PostgrestBuilder methods
type MockedBuilderMethods = {
  [K in keyof typeof mockPostgrestBuilderMethods]: MockedFunction<any>;
};

// --- Test Suite --- 

describe('dealService', () => {
  // Store the reference to the mock function
  let mockedCreateClient: MockedFunction<typeof createClient>;
  let mockBuilderMethods: MockedBuilderMethods; 

  const mockUser: MockUser = { id: 'user-123' };
  const mockAccessToken = 'mock-access-token';

  beforeEach(async () => { // Make beforeEach async if needed for imports
    vi.clearAllMocks();

    // Import the mocked createClient directly
    // vi.mock hoists this, so it should refer to our mock
    const { createClient: actualMockedCreateClient } = await import('@supabase/supabase-js');
    mockedCreateClient = actualMockedCreateClient as MockedFunction<typeof createClient>;

    // Assign references to the builder methods (defined outside vi.mock)
    mockBuilderMethods = mockPostgrestBuilderMethods as MockedBuilderMethods;

    // Reset builder mocks (ensure mockReturnThis is reset correctly)
    Object.values(mockBuilderMethods).forEach(mockFn => {
        if (typeof mockFn?.mockClear === 'function') {
            mockFn.mockClear();
            // Reset mockReturnThis for chainable methods
            if (mockFn !== mockBuilderMethods.single) { 
               mockFn.mockReturnThis();
            }
        }
    });
  });

  // --- Test Cases --- 

  describe('getDeals', () => {
    it('should fetch deals for a given user using access token', async () => {
      const mockDealsData = [
        { id: 'deal-1', name: 'Deal One', user_id: mockUser.id },
        { id: 'deal-2', name: 'Deal Two', user_id: mockUser.id },
      ];
      
      // Setup mock response for the ORDER method, the last in the chain
      mockBuilderMethods.order.mockResolvedValueOnce({ 
        data: mockDealsData, 
        error: null 
      });

      const deals = await dealService.getDeals(mockUser.id, mockAccessToken);

      // Assertions
      expect(mockedCreateClient).toHaveBeenCalledWith(
          process.env.SUPABASE_URL, 
          process.env.SUPABASE_ANON_KEY, 
          { global: { headers: { Authorization: `Bearer ${mockAccessToken}` } } }
      );
      // Check from() was called on the client *instance* returned by createClient
      expect(mockedCreateClient.mock.results.length).toBeGreaterThan(0);
      const mockClientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(mockClientInstance).toBeDefined();
      expect(mockClientInstance.from).toHaveBeenCalledWith('deals'); 
      // Check methods called on the builder
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.order).toHaveBeenCalledWith('created_at', { ascending: false }); 
      expect(deals).toEqual(mockDealsData);
    });

    it('should throw GraphQLError if Supabase select fails', async () => {
      const mockDbError: Partial<PostgrestError> = { message: 'Select failed' };
      
      // Setup mock error response for the ORDER method
      mockBuilderMethods.order.mockResolvedValueOnce({ 
        data: null, 
        error: mockDbError as PostgrestError
      });

      // Assertions
      await expect(dealService.getDeals(mockUser.id, mockAccessToken))
        .rejects
        .toThrow(new GraphQLError(`Database error during fetching deals`, { 
            extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: mockDbError.message },
        }));

      expect(mockedCreateClient).toHaveBeenCalledTimes(1);
      expect(mockedCreateClient.mock.results.length).toBe(1);
      const mockClientInstance_error = mockedCreateClient.mock.results[0]!.value;
      expect(mockClientInstance_error).toBeDefined();
      expect(mockClientInstance_error.from).toHaveBeenCalledWith('deals');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  // --- TODO: Add describe blocks for getDealById, createDeal, updateDeal, deleteDeal --- 

}); 