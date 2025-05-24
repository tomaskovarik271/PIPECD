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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const baseDealInput = { 
      name: 'New Deal', 
      // stage_id is no longer directly part of DealInput for service, 
      // wfmProjectTypeId is used instead. Assuming dealService handles this mapping.
      // For these tests, we'll focus on core fields and assigned_to_user_id.
      wfmProjectTypeId: 'wfm-project-type-123', 
      amount: 1000, 
      person_id: 'person-xyz' 
    };
    
    const mockDealId = 'new-deal-123';
    const mockTimestamp = new Date().toISOString();

    // Test case for creating a deal WITH assigned_to_user_id
    it('should create a deal with assigned_to_user_id and return the new record', async () => {
      const assignedUserId = 'user-assigned-456';
      const dealInputWithAssignment = { ...baseDealInput, assignedToUserId: assignedUserId };
      const expectedDbPayload = {
        name: baseDealInput.name,
        amount: baseDealInput.amount,
        person_id: baseDealInput.person_id,
        wfm_project_id: null, // dealService.createDeal initializes this to null before WFM creation
        user_id: mockUser.id, // Creator
        assigned_to_user_id: assignedUserId, // Explicitly assigned
        // custom_field_values and other probability fields are set by service logic
        // For this test, we focus on the core fields including assignment
      };
      const expectedDealRecord = {
        ...expectedDbPayload, // Fields sent to DB
        id: mockDealId,
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
        // Service might return more fields after processing (e.g. calculated probabilities)
        // We ensure the core assignment is correct.
      };

      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedDealRecord, error: null });
      // Mock for WFM Project Type fetch within createDeal
      mockBuilderMethods.select.mockReturnThis(); // For project_types select
      mockBuilderMethods.eq.mockReturnThis();    // For project_types eq
      mockBuilderMethods.single.mockResolvedValueOnce({ // For project_types single
          data: { id: 'wfm-project-type-123', name: 'Sales Deal', default_workflow_id: 'wf-1' }, 
          error: null 
      });
      // Mock for initial workflow step fetch
      mockBuilderMethods.select.mockReturnThis(); // For workflow_steps select
      mockBuilderMethods.eq.mockReturnThis();    // For workflow_steps eq (workflow_id)
      mockBuilderMethods.eq.mockReturnThis();    // For workflow_steps eq (is_initial_step)
      mockBuilderMethods.order.mockReturnThis();   // For workflow_steps order
      mockBuilderMethods.limit.mockReturnThis();   // For workflow_steps limit
      mockBuilderMethods.single.mockResolvedValueOnce({ // For workflow_steps single
          data: { id: 'step-1', step_order: 1 }, 
          error: null 
      });
      // Mock for WFM Project creation (assuming it's another insert)
      mockBuilderMethods.insert.mockReturnThis(); // For wfm_projects insert
      mockBuilderMethods.select.mockReturnThis(); // For wfm_projects select after insert
      mockBuilderMethods.single.mockResolvedValueOnce({ // For wfm_projects single after insert
          data: { id: 'wfm-project-789', name: 'WFM for New Deal' }, 
          error: null 
      });
      // Mock for final deal update with wfm_project_id
      mockBuilderMethods.update.mockReturnThis(); // For deals update
      mockBuilderMethods.eq.mockReturnThis();    // For deals eq
      mockBuilderMethods.select.mockReturnThis(); // For deals select after update
      mockBuilderMethods.single.mockResolvedValueOnce({ // For deals single after update
          data: { ...expectedDealRecord, wfm_project_id: 'wfm-project-789' }, // Final record with WFM ID
          error: null 
      });


      // The dealService.createDeal now takes GraphQLDealInput which uses camelCase assignedToUserId
      const newDeal = await dealService.createDeal(mockUser.id, dealInputWithAssignment as any, mockAccessToken);

      expect(mockedCreateClient).toHaveBeenCalledTimes(1); // Client initialized once
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('deals');
      
      // Initial insert into 'deals' table
      // The first call to mockBuilderMethods.insert will be for the deal itself.
      // Other inserts (like WFMProject or history) might happen, so we check the specific one.
      const dealInsertCall = mockBuilderMethods.insert.mock.calls.find(call => 
        call[0].name === baseDealInput.name && call[0].user_id === mockUser.id
      );
      expect(dealInsertCall).toBeDefined();
      expect(dealInsertCall![0]).toMatchObject(expectedDbPayload); // Verify payload for the deal insert

      expect(newDeal.assigned_to_user_id).toEqual(assignedUserId);
      expect(newDeal.user_id).toEqual(mockUser.id);
    });

    // Test case for creating a deal WITHOUT assigned_to_user_id (defaults to creator)
    it('should create a deal and default assigned_to_user_id to creator if not provided', async () => {
      const dealInputWithoutAssignment = { ...baseDealInput }; // No assignedToUserId here
      const expectedDbPayloadDefaultAssignment = {
        name: baseDealInput.name,
        amount: baseDealInput.amount,
        person_id: baseDealInput.person_id,
        wfm_project_id: null,
        user_id: mockUser.id, // Creator
        assigned_to_user_id: mockUser.id, // Should default to creator
      };
       const expectedDealRecordDefaultAssignment = {
        ...expectedDbPayloadDefaultAssignment,
        id: mockDealId,
        created_at: mockTimestamp,
        updated_at: mockTimestamp,
      };

      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedDealRecordDefaultAssignment, error: null });
      // Mocks for WFM project creation flow (same as above test)
      mockBuilderMethods.select.mockReturnThis(); 
      mockBuilderMethods.eq.mockReturnThis();    
      mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'wfm-project-type-123', default_workflow_id: 'wf-1' }, error: null });
      mockBuilderMethods.select.mockReturnThis(); 
      mockBuilderMethods.eq.mockReturnThis();    
      mockBuilderMethods.eq.mockReturnThis();    
      mockBuilderMethods.order.mockReturnThis();   
      mockBuilderMethods.limit.mockReturnThis();   
      mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'step-1' }, error: null });
      mockBuilderMethods.insert.mockReturnThis(); 
      mockBuilderMethods.select.mockReturnThis(); 
      mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'wfm-project-789' }, error: null });
      mockBuilderMethods.update.mockReturnThis(); 
      mockBuilderMethods.eq.mockReturnThis();    
      mockBuilderMethods.select.mockReturnThis(); 
      mockBuilderMethods.single.mockResolvedValueOnce({ data: { ...expectedDealRecordDefaultAssignment, wfm_project_id: 'wfm-project-789' }, error: null });


      const newDeal = await dealService.createDeal(mockUser.id, dealInputWithoutAssignment as any, mockAccessToken);
      
      const dealInsertCall = mockBuilderMethods.insert.mock.calls.find(call => 
        call[0].name === baseDealInput.name && call[0].user_id === mockUser.id
      );
      expect(dealInsertCall).toBeDefined();
      expect(dealInsertCall![0]).toMatchObject(expectedDbPayloadDefaultAssignment);

      expect(newDeal.assigned_to_user_id).toEqual(mockUser.id); // Defaulted to creator
      expect(newDeal.user_id).toEqual(mockUser.id);
    });

    it('should throw GraphQLError if Supabase insert fails', async () => {
      const dealInput = { ...baseDealInput };
        const mockDbError: Partial<PostgrestError> = { message: 'Insert failed' };
        const mockDbError: Partial<PostgrestError> = { message: 'Insert failed' };
        // This mock is for the initial deal insert.
        // If it fails, WFM project creation part might not be reached or might also need mocks.
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: mockDbError as PostgrestError });
        // Add mocks for WFM setup if createDeal reaches that far before erroring
        mockBuilderMethods.select.mockReturnThis(); 
        mockBuilderMethods.eq.mockReturnThis();    
        mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'wfm-project-type-123', default_workflow_id: 'wf-1' }, error: null });


        await expect(dealService.createDeal(mockUser.id, dealInput as any, mockAccessToken))
            .rejects
            .toThrow(GraphQLError); // Error message might vary based on where it fails
            // More specific error check if needed: .toThrow(new GraphQLError(..., { extensions: { code: 'INTERNAL_SERVER_ERROR', ...}}))
    });

    it('should throw GraphQLError if insert returns no data (and no error)', async () => {
      const dealInput = { ...baseDealInput };
        // Mock for initial deal insert returning no data
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        // Add mocks for WFM setup if createDeal reaches that far
        mockBuilderMethods.select.mockReturnThis(); 
        mockBuilderMethods.eq.mockReturnThis();    
        mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'wfm-project-type-123', default_workflow_id: 'wf-1' }, error: null });


        await expect(dealService.createDeal(mockUser.id, dealInput as any, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError('Failed to create deal, no data returned', {
                 extensions: { code: 'INTERNAL_SERVER_ERROR' }
            }));
    });
  });

  describe('updateDeal', () => {
    const dealId = 'deal-to-update';
    const mockTimestampUpdate = new Date().toISOString();

    // Test case for updating assigned_to_user_id
    it('should update assigned_to_user_id and return the updated record', async () => {
      const newAssignedUserId = 'user-newly-assigned-789';
      const updateInput = { assigned_to_user_id: newAssignedUserId, name: 'Deal Name Still Same' }; // Service layer expects snake_case
      const expectedDbPayload = { assigned_to_user_id: newAssignedUserId, name: 'Deal Name Still Same' };
      const expectedDealRecord = {
        id: dealId,
        user_id: mockUser.id, // Assuming creator doesn't change on assignment
        name: 'Deal Name Still Same',
        assigned_to_user_id: newAssignedUserId,
        created_at: mockTimestampUpdate,
        updated_at: mockTimestampUpdate,
      };
      
      // Mock getDealById call within updateDeal
      mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: dealId, user_id: mockUser.id, name: 'Old Name' }, error: null }); 
      // Mock the update().eq().select().single() chain for the actual update
      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedDealRecord, error: null });

      const updatedDeal = await dealService.updateDeal(mockUser.id, dealId, updateInput, mockAccessToken);

      expect(mockedCreateClient).toHaveBeenCalledTimes(1);
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('deals');
      expect(mockBuilderMethods.update).toHaveBeenCalledWith(expect.objectContaining(expectedDbPayload));
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', dealId);
      expect(mockBuilderMethods.select).toHaveBeenCalled(); // After update
      expect(mockBuilderMethods.single).toHaveBeenCalledTimes(2); // Once for getDealById, once for the update return
      expect(updatedDeal.assigned_to_user_id).toEqual(newAssignedUserId);
    });

    // Test case for unassigning a deal (setting assigned_to_user_id to null)
    it('should unassign a deal (set assigned_to_user_id to null) and return the updated record', async () => {
      const updateInputUnassign = { assigned_to_user_id: null, name: 'Deal Unassigned' };
      const expectedDbPayloadUnassign = { assigned_to_user_id: null, name: 'Deal Unassigned' };
      const expectedDealRecordUnassigned = {
        id: dealId,
        user_id: mockUser.id,
        name: 'Deal Unassigned',
        assigned_to_user_id: null,
        created_at: mockTimestampUpdate,
        updated_at: mockTimestampUpdate,
      };

      mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: dealId, user_id: mockUser.id, name: 'Old Name', assigned_to_user_id: 'some-user' }, error: null });
      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedDealRecordUnassigned, error: null });

      const updatedDeal = await dealService.updateDeal(mockUser.id, dealId, updateInputUnassign, mockAccessToken);

      expect(mockBuilderMethods.update).toHaveBeenCalledWith(expect.objectContaining(expectedDbPayloadUnassign));
      expect(updatedDeal.assigned_to_user_id).toBeNull();
    });
    
    it('should throw GraphQLError if deal not found for update (from initial getDealById)', async () => {
      const updateInput = { name: 'Updated Name' };
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