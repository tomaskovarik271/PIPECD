import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import * as stageService from './stageService'; // Import the service to reference its types initially
import { GraphQLError } from 'graphql';
import { Stage } from './types'; // Import Stage from shared types
// Import locally defined input types from the service file itself
import { CreateStageInput, UpdateStageInput } from './stageService'; 

// --- Mock Setup ---

const mockGetUser = vi.fn();
const mockPostgrestBuilderMethods = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(), // Used in getStagesByPipelineId
};

vi.doMock('@supabase/supabase-js', () => {
  const mockClient = {
    from: vi.fn(() => mockPostgrestBuilderMethods),
    auth: { getUser: mockGetUser },
  };
  return { 
      createClient: vi.fn(() => mockClient)
  };
});

// --- Helper Types ---
interface MockUser { id: string; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockedBuilderMethods = { [K in keyof typeof mockPostgrestBuilderMethods]: MockedFunction<any>; };

// --- Test Suite ---
describe('stageService', () => {
  let mockedCreateClient: MockedFunction<typeof createClient>;
  let mockBuilderMethods: MockedBuilderMethods;
  let mockGetUserRef: MockedFunction<typeof mockGetUser>;
  let service: typeof stageService; // To hold the dynamically imported service
  const mockUser: MockUser = { id: 'user-stage-456' };
  const mockAccessToken = 'mock-stage-access-token';
  const mockPipelineId = 'pipe-stage-789';

  beforeEach(async () => {
    vi.clearAllMocks(); 
    vi.resetModules(); 
    
    service = await import('./stageService.js'); 
    
    const { createClient: actualMockedCreateClient } = await import('@supabase/supabase-js');
    mockedCreateClient = actualMockedCreateClient as MockedFunction<typeof createClient>;
    
    mockBuilderMethods = mockPostgrestBuilderMethods as MockedBuilderMethods;
    mockGetUserRef = mockGetUser; 
    
    mockGetUserRef.mockClear();
    Object.values(mockBuilderMethods).forEach(mockFn => {
        mockFn.mockClear();
        if (mockFn !== mockBuilderMethods.single && mockFn !== mockBuilderMethods.maybeSingle) {
             mockFn.mockReturnThis(); 
        }
    });
  });

  // --- Test Cases ---
  
  describe('getStagesByPipelineId', () => {
    it('should fetch stages for a given pipeline, ordered by order', async () => {
      const mockStagesData: Stage[] = [
        { id: 'stage-1', name: 'Stage A', pipeline_id: mockPipelineId, order: 0, user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' },
        { id: 'stage-2', name: 'Stage B', pipeline_id: mockPipelineId, order: 1, user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' },
      ];
      mockBuilderMethods.order.mockResolvedValueOnce({ data: mockStagesData, error: null }); 

      const stages = await service.getStagesByPipelineId(mockAccessToken, mockPipelineId);

      expect(mockedCreateClient).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(Object));
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('stages');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('pipeline_id', mockPipelineId);
      expect(mockBuilderMethods.order).toHaveBeenCalledWith('order', { ascending: true });
      expect(stages).toEqual(mockStagesData);
    });

    it('should return empty array if no stages found', async () => {
        mockBuilderMethods.order.mockResolvedValueOnce({ data: [], error: null });
        const stages = await service.getStagesByPipelineId(mockAccessToken, mockPipelineId);
        expect(stages).toEqual([]);
    });

    it('should throw GraphQLError if Supabase fails', async () => {
      const mockDbError: Partial<PostgrestError> = { message: 'DB Select failed' };
      mockBuilderMethods.order.mockResolvedValueOnce({ data: null, error: mockDbError as PostgrestError });
      await expect(service.getStagesByPipelineId(mockAccessToken, mockPipelineId))
        .rejects.toThrow(new GraphQLError(`Database error during fetching stages for pipeline ${mockPipelineId}. Please try again later.`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: mockDbError.message, code: undefined } }
        }));
    });
     it('should throw Error if pipelineId is missing', async () => {
        await expect(service.getStagesByPipelineId(mockAccessToken, ''))
            .rejects.toThrow("Pipeline ID is required to fetch stages.");
    });
  });

  describe('getStageById', () => {
    const stageId = 'stage-xyz';
    it('should fetch a single stage by ID', async () => {
      const mockStageData: Stage = { id: stageId, name: 'Specific Stage', pipeline_id: mockPipelineId, order: 0, user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' };
      mockBuilderMethods.maybeSingle.mockResolvedValueOnce({ data: mockStageData, error: null });

      const stage = await service.getStageById(mockAccessToken, stageId);

      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('stages');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', stageId);
      expect(mockBuilderMethods.maybeSingle).toHaveBeenCalled();
      expect(stage).toEqual(mockStageData);
    });

     it('should return null if stage not found', async () => {
        mockBuilderMethods.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
        const stage = await service.getStageById(mockAccessToken, stageId);
        expect(stage).toBeNull();
    });

    it('should throw GraphQLError for database errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'DB error on maybeSingle' };
        mockBuilderMethods.maybeSingle.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(service.getStageById(mockAccessToken, stageId))
            .rejects.toThrow(new GraphQLError(`Database error during fetching stage with id ${stageId}. Please try again later.`, {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
            }));
    });
     it('should throw Error if stageId is missing', async () => {
        await expect(service.getStageById(mockAccessToken, ''))
            .rejects.toThrow("Stage ID is required.");
    });
  });

  describe('createStage', () => {
    const stageInput: CreateStageInput = { name: 'New Stage', order: 0, pipeline_id: mockPipelineId, deal_probability: 0.1 };
    const expectedRecord: Stage = { ...stageInput, id: 'new-stage-abc', user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' };

    it('should create a stage and return the record', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
        
        const newStage = await service.createStage(mockAccessToken, stageInput);

        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.auth.getUser).toHaveBeenCalled();
        expect(clientInstance.from).toHaveBeenCalledWith('stages');
        expect(mockBuilderMethods.insert).toHaveBeenCalledWith([{ ...stageInput, user_id: mockUser.id }]);
        expect(mockBuilderMethods.select).toHaveBeenCalled();
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(newStage).toEqual(expectedRecord);
    });

    it('should throw error if input validation fails (missing fields)', async () => {
        await expect(service.createStage(mockAccessToken, { name: 'Test', pipeline_id: 'p1' } as CreateStageInput)) // Missing order
            .rejects.toThrow("Pipeline ID, stage name, and order are required for creation.");
         await expect(service.createStage(mockAccessToken, { order: 0, pipeline_id: 'p1' } as CreateStageInput)) // Missing name
            .rejects.toThrow("Pipeline ID, stage name, and order are required for creation.");
        await expect(service.createStage(mockAccessToken, { name: 'Test', order: 0 } as CreateStageInput)) // Missing pipeline_id
            .rejects.toThrow("Pipeline ID, stage name, and order are required for creation.");
    });
    
    it('should throw error if deal_probability is invalid', async () => {
        await expect(service.createStage(mockAccessToken, { ...stageInput, deal_probability: -0.1 }))
            .rejects.toThrow("Deal probability must be between 0 and 1.");
         await expect(service.createStage(mockAccessToken, { ...stageInput, deal_probability: 1.1 }))
            .rejects.toThrow("Deal probability must be between 0 and 1.");
    });


    it('should throw error if getUser fails', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Auth error'} });
         await expect(service.createStage(mockAccessToken, stageInput))
            .rejects.toThrow("Could not get authenticated user to create stage.");
    });

    it('should throw GraphQLError if insert fails', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        const dbError: Partial<PostgrestError> = { message: 'Insert failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(service.createStage(mockAccessToken, stageInput))
            .rejects.toThrow(new GraphQLError('Database error during creating stage. Please try again later.', {
                 extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
            }));
    });

    it('should throw Error if insert returns no data', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        await expect(service.createStage(mockAccessToken, stageInput))
            .rejects.toThrow("Failed to create stage, no data returned.");
    });
  });

  describe('updateStage', () => {
    const stageId = 'stage-to-update';
    const updateInput: UpdateStageInput = { name: 'Updated Stage Name', order: 1, deal_probability: 0.9 };
    const expectedRecord: Stage = { 
        id: stageId, 
        pipeline_id: mockPipelineId,
        user_id: mockUser.id, 
        name: 'Updated Stage Name',
        order: 1,
        deal_probability: 0.9,
        created_at: 'ts',
        updated_at: 'ts'
    };

    it('should update a stage and return the record', async () => {
      mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null }); // Needed for updateStage
      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
      const updatedStage = await service.updateStage(mockAccessToken, stageId, updateInput);

      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.auth.getUser).toHaveBeenCalled(); 
      expect(clientInstance.from).toHaveBeenCalledWith('stages');
      expect(mockBuilderMethods.update).toHaveBeenCalledWith(updateInput);
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', stageId);
      expect(mockBuilderMethods.select).toHaveBeenCalled();
      expect(mockBuilderMethods.single).toHaveBeenCalled();
      expect(updatedStage).toEqual(expectedRecord);
    });

    it('should throw error if input validation fails', async () => {
        await expect(service.updateStage(mockAccessToken, stageId, { deal_probability: -0.1 }))
            .rejects.toThrow("Deal probability must be between 0 and 1.");
         await expect(service.updateStage(mockAccessToken, stageId, { deal_probability: 1.1 }))
            .rejects.toThrow("Deal probability must be between 0 and 1.");
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         await expect(service.updateStage(mockAccessToken, stageId, { name: 123 as any }))
            .rejects.toThrow("Invalid type for stage name update.");
        await expect(service.updateStage(mockAccessToken, stageId, { order: 1.5 }))
            .rejects.toThrow("Invalid type for stage order update, must be an integer.");
        await expect(service.updateStage(mockAccessToken, stageId, {}))
            .rejects.toThrow("No update data provided for stage.");
    });
    
     it('should throw error if getUser fails', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Auth error'} });
         await expect(service.updateStage(mockAccessToken, stageId, updateInput))
            .rejects.toThrow("Could not get authenticated user to update stage.");
    });

    it('should throw Error if stage not found or update fails (no data returned)', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        await expect(service.updateStage(mockAccessToken, stageId, updateInput))
            .rejects.toThrow(`Stage with id ${stageId} not found or update failed.`);
    });

    it('should throw GraphQLError for database errors', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        const dbError: Partial<PostgrestError> = { message: 'Update DB error' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(service.updateStage(mockAccessToken, stageId, updateInput))
            .rejects.toThrow(new GraphQLError(`Database error during updating stage with id ${stageId}. Please try again later.`, {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
            }));
    });
  });

  describe('deleteStage', () => {
    const stageId = 'stage-to-delete';
    it('should return true on successful deletion', async () => {
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 1 }); 
      const result = await service.deleteStage(mockAccessToken, stageId);

      expect(result).toBe(true);
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('stages');
      expect(mockBuilderMethods.delete).toHaveBeenCalledWith({ count: 'exact' });
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', stageId);
    });

    it('should return true even if count is 0 or null (already deleted)', async () => {
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 0 });
      const result1 = await service.deleteStage(mockAccessToken, stageId);
      expect(result1).toBe(true);
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: null });
      const result2 = await service.deleteStage(mockAccessToken, stageId);
       expect(result2).toBe(true);
    });

    it('should throw GraphQLError if delete fails', async () => {
      const dbError: Partial<PostgrestError> = { message: 'Delete failed' };
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: dbError as PostgrestError, count: null });
      await expect(service.deleteStage(mockAccessToken, stageId))
        .rejects.toThrow(new GraphQLError(`Database error during deleting stage with id ${stageId}. Please try again later.`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
        }));
    });
      it('should throw Error if stageId is missing', async () => {
        await expect(service.deleteStage(mockAccessToken, ''))
            .rejects.toThrow("Stage ID is required for deletion.");
    });
  });
}); 