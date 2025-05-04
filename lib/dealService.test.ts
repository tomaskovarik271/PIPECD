import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { dealService } from './dealService';
import { createClient, /* SupabaseClient, */ PostgrestError } from '@supabase/supabase-js'; // Comment out SupabaseClient
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
        .toThrow(new GraphQLError(`Database error during fetching deals. Please try again later.`, {
            extensions: { 
              code: 'INTERNAL_SERVER_ERROR', 
              originalError: { message: mockDbError.message, code: undefined }
            },
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

  describe('getDealById', () => {
    const dealId = 'deal-999';

    it('should fetch a single deal by ID for the user', async () => {
      const mockDealData = { id: dealId, name: 'Single Deal', user_id: mockUser.id };

      // Setup mock response for the single() call
      mockBuilderMethods.single.mockResolvedValueOnce({ 
        data: mockDealData, 
        error: null 
      });

      const deal = await dealService.getDealById(mockUser.id, dealId, mockAccessToken);

      // Assertions
      expect(mockedCreateClient).toHaveBeenCalledWith(
          process.env.SUPABASE_URL, 
          process.env.SUPABASE_ANON_KEY, 
          { global: { headers: { Authorization: `Bearer ${mockAccessToken}` } } }
      );
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('deals');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', dealId);
      expect(mockBuilderMethods.single).toHaveBeenCalled();
      expect(deal).toEqual(mockDealData);
    });

    it('should return null if deal not found (PGRST116 error)', async () => {
        const notFoundError: Partial<PostgrestError> = { 
            message: 'No rows found', 
            code: 'PGRST116' 
        };

        // Setup mock response for not found
        mockBuilderMethods.single.mockResolvedValueOnce({ 
            data: null, 
            error: notFoundError as PostgrestError
        });

        const deal = await dealService.getDealById(mockUser.id, dealId, mockAccessToken);

        // Assertions
        expect(deal).toBeNull();
        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('deals');
        expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
        expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', dealId);
        expect(mockBuilderMethods.single).toHaveBeenCalled();
    });

    it('should throw GraphQLError for other database errors', async () => {
        const dbError: Partial<PostgrestError> = { 
            message: 'Connection error', 
            code: '500' 
        };

         // Setup mock response for error
        mockBuilderMethods.single.mockResolvedValueOnce({ 
            data: null, 
            error: dbError as PostgrestError
        });

        // Assertions
        await expect(dealService.getDealById(mockUser.id, dealId, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError(`Database error during fetching deal by ID. Please try again later.`, {
                extensions: { 
                  code: 'INTERNAL_SERVER_ERROR', 
                  originalError: { message: dbError.message, code: dbError.code }
                },
            }));
            
        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('deals');
        expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
        expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', dealId);
        expect(mockBuilderMethods.single).toHaveBeenCalled();
    });
  });

  describe('createDeal', () => {
    const dealInput = { name: 'New Deal', stage_id: 'stage-lead-123', amount: 1000, person_id: 'person-xyz' };
    const expectedDealRecord = {
        ...dealInput,
        id: 'new-deal-123',
        user_id: mockUser.id,
        created_at: new Date().toISOString(), // Match structure, exact value doesn't matter in mock
        updated_at: new Date().toISOString(),
    };

    it('should create a deal and return the new record', async () => {
        // Mock the insert().select().single() chain
        mockBuilderMethods.single.mockResolvedValueOnce({ 
            data: expectedDealRecord, 
            error: null 
        });

        const newDeal = await dealService.createDeal(mockUser.id, dealInput, mockAccessToken);

        // Assertions
        expect(mockedCreateClient).toHaveBeenCalledWith(
            process.env.SUPABASE_URL, 
            process.env.SUPABASE_ANON_KEY, 
            { global: { headers: { Authorization: `Bearer ${mockAccessToken}` } } }
        );
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('deals');
        // Check insert was called with the correct data payload (single object)
        expect(mockBuilderMethods.insert).toHaveBeenCalledWith(
            { ...dealInput, user_id: mockUser.id }
        );
        expect(mockBuilderMethods.select).toHaveBeenCalled(); // Implicit call after insert
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(newDeal).toEqual(expectedDealRecord);
    });

    it('should throw GraphQLError if Supabase insert fails', async () => {
        const mockDbError: Partial<PostgrestError> = { message: 'Insert failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ 
            data: null, 
            error: mockDbError as PostgrestError
        });

        await expect(dealService.createDeal(mockUser.id, dealInput, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError(`Database error during creating deal. Please try again later.`, {
                 extensions: { 
                   code: 'INTERNAL_SERVER_ERROR', 
                   originalError: { message: mockDbError.message, code: undefined }
                 },
            }));
    });

    it('should throw GraphQLError if insert returns no data', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        await expect(dealService.createDeal(mockUser.id, dealInput, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError('Failed to create deal, no data returned', {
                 extensions: { code: 'INTERNAL_SERVER_ERROR' }
            }));
    });
  });

  describe('updateDeal', () => {
    const dealId = 'deal-to-update';
    const updateInput = { name: 'Updated Deal Name', amount: 1500, stage_id: 'stage-won-456' };
    const expectedDealRecord = {
        id: dealId,
        user_id: mockUser.id,
        ...updateInput,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    it('should update a deal and return the record', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ 
            data: expectedDealRecord, 
            error: null 
        });

        const updatedDeal = await dealService.updateDeal(mockUser.id, dealId, updateInput, mockAccessToken);

        // Assertions
        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('deals');
        expect(mockBuilderMethods.update).toHaveBeenCalledWith(updateInput);
        expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', dealId);
        expect(mockBuilderMethods.select).toHaveBeenCalled();
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(updatedDeal).toEqual(expectedDealRecord);
    });

    it('should throw GraphQLError if deal not found (PGRST116 error)', async () => {
        const notFoundError: Partial<PostgrestError> = { code: 'PGRST116' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: notFoundError as PostgrestError });

        await expect(dealService.updateDeal(mockUser.id, dealId, updateInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Deal not found', { extensions: { code: 'NOT_FOUND' } }));
    });

    it('should throw GraphQLError for other update errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Update failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });

        await expect(dealService.updateDeal(mockUser.id, dealId, updateInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during updating deal. Please try again later.', {
                extensions: { 
                  code: 'INTERNAL_SERVER_ERROR', 
                  originalError: { message: dbError.message, code: undefined }
                },
            }));
    });
  });

  describe('deleteDeal', () => {
    const dealIdToDelete = 'deal-to-delete-789';

    it('should return true on successful deletion', async () => {
      // Mock the delete().eq() chain - eq resolves
      mockBuilderMethods.eq.mockResolvedValueOnce({ 
          error: null, 
          count: 1 
      });

      const result = await dealService.deleteDeal(mockUser.id, dealIdToDelete, mockAccessToken);

      // Assertions
      expect(result).toBe(true);
      expect(mockedCreateClient).toHaveBeenCalledTimes(1);
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('deals');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', dealIdToDelete);
    });

    it('should return true even if count is 0 or null (item already deleted)', async () => {
      // Mock the delete().eq() chain - eq resolves
      mockBuilderMethods.eq.mockResolvedValueOnce({ 
          error: null, 
          count: 0 
      });
      const result = await dealService.deleteDeal(mockUser.id, dealIdToDelete, mockAccessToken);
      expect(result).toBe(true);

       mockBuilderMethods.eq.mockResolvedValueOnce({ 
          error: null, 
          count: null 
      });
       const result2 = await dealService.deleteDeal(mockUser.id, dealIdToDelete, mockAccessToken);
      expect(result2).toBe(true);
    });

    it('should throw GraphQLError if Supabase delete fails', async () => {
      const dbError: Partial<PostgrestError> = { message: 'Delete failed' };

      // Mock error on eq() as it resolves the delete chain
      mockBuilderMethods.eq.mockResolvedValueOnce({ 
          error: dbError as PostgrestError, 
          count: null 
      });

      // Assertions
      await expect(dealService.deleteDeal(mockUser.id, dealIdToDelete, mockAccessToken))
        .rejects
        .toThrow(new GraphQLError(`Database error during deleting deal. Please try again later.`, {
            extensions: { 
              code: 'INTERNAL_SERVER_ERROR', 
              originalError: { message: dbError.message, code: undefined }
            },
        }));
      
      expect(mockedCreateClient).toHaveBeenCalledTimes(1);
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('deals');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', dealIdToDelete);
    });
  });
}); 