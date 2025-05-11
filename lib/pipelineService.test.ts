import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import * as pipelineService from './pipelineService'; // Import the service functions
import { GraphQLError } from 'graphql';
// Explicitly ensure ONLY these types are imported from generated/graphql for Pipeline related tests
import type { Pipeline, PipelineInput } from './generated/graphql';

// --- Mock Setup ---

// Define mocks globally
const mockGetUser = vi.fn();
const mockPostgrestBuilderMethods = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
};

// Use vi.doMock which is NOT hoisted
vi.doMock('@supabase/supabase-js', () => {
  const mockClient = {
    from: vi.fn(() => mockPostgrestBuilderMethods),
    auth: { getUser: mockGetUser },
  };
  return { 
      createClient: vi.fn(() => mockClient)
  };
});

vi.mock('./supabaseClient');

// --- Helper Types ---
interface MockUser { id: string; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockedBuilderMethods = { [K in keyof typeof mockPostgrestBuilderMethods]: MockedFunction<any>; };

// --- Test Suite ---
describe('pipelineService', () => {
  let mockedCreateClient: MockedFunction<typeof createClient>;
  let mockBuilderMethods: MockedBuilderMethods;
  let mockGetUserRef: MockedFunction<typeof mockGetUser>;
  let service: typeof pipelineService; // To hold the dynamically imported service
  const mockUser: MockUser = { id: 'user-pipe-123' };
  const mockAccessToken = 'mock-pipe-access-token';

  beforeEach(async () => {
    vi.clearAllMocks(); // Clear previous mocks if any
    vi.resetModules(); // IMPORTANT: Reset modules to ensure fresh import after mocking
    
    // Dynamically import the service *after* mocks are set up
    service = await import('./pipelineService.js'); 
    
    // Import the mocked supabase client *after* resetting modules
    const { createClient: actualMockedCreateClient } = await import('@supabase/supabase-js');
    mockedCreateClient = actualMockedCreateClient as MockedFunction<typeof createClient>;
    
    // Assign references to the top-level mocks
    mockBuilderMethods = mockPostgrestBuilderMethods as MockedBuilderMethods;
    mockGetUserRef = mockGetUser; 
    
    // Clear individual mocks (redundant with clearAllMocks but safe)
    mockGetUserRef.mockClear();
    Object.values(mockBuilderMethods).forEach(mockFn => {
        mockFn.mockClear();
        if (mockFn !== mockBuilderMethods.single && mockFn !== mockBuilderMethods.maybeSingle) {
             mockFn.mockReturnThis(); 
        }
    });
  });

  // --- Test Cases ---
  // Use `service.` prefix when calling pipelineService functions
  
  describe('getPipelines', () => {
    it('should fetch pipelines for the user', async () => {
      const mockPipelinesData: Pipeline[] = [
        { id: 'pipe-1', name: 'Pipeline Alpha', user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' },
        { id: 'pipe-2', name: 'Pipeline Beta', user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' },
      ];
      mockBuilderMethods.select.mockResolvedValueOnce({ data: mockPipelinesData, error: null }); 

      const pipelines = await service.getPipelines(mockAccessToken);

      expect(mockedCreateClient).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(Object));
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('pipelines');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(pipelines).toEqual(mockPipelinesData);
    });

    it('should throw GraphQLError if Supabase fails', async () => {
      const mockDbError: Partial<PostgrestError> = { message: 'DB Select failed' };
      mockBuilderMethods.select.mockResolvedValueOnce({ data: null, error: mockDbError as PostgrestError });
      await expect(service.getPipelines(mockAccessToken))
        .rejects.toThrow(new GraphQLError('Database error during fetching pipelines. Please try again later.', {
            extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: mockDbError.message, code: undefined } }
        }));
    });
  });

  describe('getPipelineById', () => {
    const pipelineId = 'pipe-abc';
    it('should fetch a single pipeline by ID', async () => {
      const mockPipelineData: Pipeline = { id: pipelineId, name: 'Specific Pipe', user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' };
      mockBuilderMethods.maybeSingle.mockResolvedValueOnce({ data: mockPipelineData, error: null });

      const pipeline = await service.getPipelineById(mockAccessToken, pipelineId);

      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('pipelines');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', pipelineId);
      expect(mockBuilderMethods.maybeSingle).toHaveBeenCalled();
      expect(pipeline).toEqual(mockPipelineData);
    });

     it('should return null if pipeline not found', async () => {
        mockBuilderMethods.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
        const pipeline = await service.getPipelineById(mockAccessToken, pipelineId);
        expect(pipeline).toBeNull();
    });

    it('should throw GraphQLError for database errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'DB error on maybeSingle' };
        mockBuilderMethods.maybeSingle.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(service.getPipelineById(mockAccessToken, pipelineId))
            .rejects.toThrow(new GraphQLError(`Database error during fetching pipeline with id ${pipelineId}. Please try again later.`, {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
            }));
    });
  });

  describe('createPipeline', () => {
    const pipelineInput: PipelineInput = { name: 'New Pipeline' };
    const expectedRecord: Pipeline = { ...pipelineInput, id: 'new-pipe-xyz', user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' };

    it('should create a pipeline and return the record', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
        
        const newPipeline = await service.createPipeline(mockAccessToken, pipelineInput);

        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.auth.getUser).toHaveBeenCalled();
        expect(clientInstance.from).toHaveBeenCalledWith('pipelines');
        expect(mockBuilderMethods.insert).toHaveBeenCalledWith([{ ...pipelineInput, user_id: mockUser.id }]);
        expect(mockBuilderMethods.select).toHaveBeenCalled();
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(newPipeline).toEqual(expectedRecord);
    });

    it('should throw error if getUser fails', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Auth error'} });
         await expect(service.createPipeline(mockAccessToken, pipelineInput))
            .rejects.toThrow("Could not get authenticated user to create pipeline.");
    });

    it('should throw GraphQLError if insert fails', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        const dbError: Partial<PostgrestError> = { message: 'Insert failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(service.createPipeline(mockAccessToken, pipelineInput))
            .rejects.toThrow(new GraphQLError('Database error during creating pipeline. Please try again later.', {
                 extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
            }));
    });

    it('should throw Error if insert returns no data', async () => {
        mockGetUserRef.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        await expect(service.createPipeline(mockAccessToken, pipelineInput))
            .rejects.toThrow("Failed to create pipeline, no data returned.");
    });
  });

  describe('updatePipeline', () => {
    const pipelineId = 'pipe-to-update';
    const updateInput: PipelineInput = { name: 'Updated Pipe Name' };
    const expectedRecord: Pipeline = { id: pipelineId, name: 'Updated Pipe Name', user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' };

    it('should update a pipeline and return the record', async () => {
      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
      const updatedPipeline = await service.updatePipeline(mockAccessToken, pipelineId, updateInput);

      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('pipelines');
      expect(mockBuilderMethods.update).toHaveBeenCalledWith(updateInput);
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', pipelineId);
      expect(mockBuilderMethods.select).toHaveBeenCalled();
      expect(mockBuilderMethods.single).toHaveBeenCalled();
      expect(updatedPipeline).toEqual(expectedRecord);
    });

    it('should throw Error if pipeline not found or update fails (no data returned)', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        await expect(service.updatePipeline(mockAccessToken, pipelineId, updateInput))
            .rejects.toThrow(`Pipeline with id ${pipelineId} not found or update failed.`);
    });

    it('should throw GraphQLError for database errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Update DB error' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(service.updatePipeline(mockAccessToken, pipelineId, updateInput))
            .rejects.toThrow(new GraphQLError(`Database error during updating pipeline with id ${pipelineId}. Please try again later.`, {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
            }));
    });
  });

  describe('deletePipeline', () => {
    const pipelineId = 'pipe-to-delete';
    it('should return true on successful deletion', async () => {
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 1 }); 
      const result = await service.deletePipeline(mockAccessToken, pipelineId);

      expect(result).toBe(true);
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('pipelines');
      expect(mockBuilderMethods.delete).toHaveBeenCalledWith({ count: 'exact' });
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', pipelineId);
    });

    it('should return true even if count is 0 or null (already deleted)', async () => {
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 0 });
      const result1 = await service.deletePipeline(mockAccessToken, pipelineId);
      expect(result1).toBe(true);
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: null });
      const result2 = await service.deletePipeline(mockAccessToken, pipelineId);
       expect(result2).toBe(true);
    });

    it('should throw GraphQLError if delete fails', async () => {
      const dbError: Partial<PostgrestError> = { message: 'Delete failed' };
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: dbError as PostgrestError, count: null });
      await expect(service.deletePipeline(mockAccessToken, pipelineId))
        .rejects.toThrow(new GraphQLError(`Database error during deleting pipeline with id ${pipelineId}. Please try again later.`, {
            extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: dbError.message, code: undefined } }
        }));
    });
  });
}); 