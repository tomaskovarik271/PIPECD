import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { PostgrestError } from '@supabase/supabase-js'; // Only PostgrestError needed from here for types
import * as stageService from './stageService.js';
import { GraphQLError } from 'graphql';
import type { Stage as GraphQLStage, CreateStageInput as GraphQLCreateStageInput, UpdateStageInput as GraphQLUpdateStageInput, Pipeline as GraphQLPipeline } from './generated/graphql';

// --- Vitest Mock Setup for serviceUtils ---

// This is the mock for the Supabase client builder methods (select, insert, etc.)
const mockSupabaseQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
};

// This is the mock for supabase.auth.getUser()
const mockAuthGetUser = vi.fn();

// This is the mock for the Supabase client instance that serviceUtils.getAuthenticatedClient will return
const mockSupabaseClient = {
    from: vi.fn(() => mockSupabaseQueryBuilder),
    auth: { getUser: mockAuthGetUser },
  };

vi.mock('./serviceUtils.js', () => ({
  getAuthenticatedClient: vi.fn(() => mockSupabaseClient),
  handleSupabaseError: vi.fn((error: PostgrestError | null, context: string) => { 
    if (error) { 
      console.error(`Mocked Supabase Error in ${context}:`, error);
      throw new GraphQLError(`Database error during ${context}. Please try again later.`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: error.message, code: error.code } }
      });
    }
  }),
}));

// --- Test Suite Data ---
const mockUser = { id: 'user-stage-456' };
  const mockAccessToken = 'mock-stage-access-token';
  const mockPipelineId = 'pipe-stage-789';

const MOCK_PIPELINE_DATA: GraphQLPipeline = {
    id: mockPipelineId,
    name: 'Mock Pipeline for Stage Test',
    user_id: mockUser.id,
    created_at: 'mock_created_at_ts',
    updated_at: 'mock_updated_at_ts',
};

describe('stageService', () => {
  let service: typeof stageService;

  beforeEach(async () => {
    vi.clearAllMocks(); 
    // Reset modules to ensure service uses the fresh mocks, especially for serviceUtils
    vi.resetModules(); 
    service = await import('./stageService.js'); 
    
    // Clear specific mocks that are frequently re-assigned in tests
    mockAuthGetUser.mockClear();
    Object.values(mockSupabaseQueryBuilder).forEach(mockFn => {
        mockFn.mockClear();
        // Ensure chaining for all builder methods except those that terminate the chain (single, maybeSingle)
        if (mockFn !== mockSupabaseQueryBuilder.single && mockFn !== mockSupabaseQueryBuilder.maybeSingle) {
             mockFn.mockReturnThis(); 
        }
    });
    // Ensure from() is also reset if it has specific mockResolvedValueOnce for example
    mockSupabaseClient.from.mockClear().mockReturnValue(mockSupabaseQueryBuilder);
  });
  
  describe('getStagesByPipelineId', () => {
    it('should fetch stages for a given pipeline, ordered by order', async () => {
      const mockStagesData: GraphQLStage[] = [
        { id: 'stage-1', name: 'Stage A', pipeline_id: mockPipelineId, order: 0, user_id: mockUser.id, created_at: 'ts', updated_at: 'ts', pipeline: MOCK_PIPELINE_DATA, deal_probability: 0.5 },
        { id: 'stage-2', name: 'Stage B', pipeline_id: mockPipelineId, order: 1, user_id: mockUser.id, created_at: 'ts', updated_at: 'ts', pipeline: MOCK_PIPELINE_DATA, deal_probability: 0.8 },
      ];
      // Mock the chain: supabase.from('stages').select('*').eq('pipeline_id', ...).order(...)
      mockSupabaseQueryBuilder.order.mockResolvedValueOnce({ data: mockStagesData, error: null }); 
      const stages = await service.getStagesByPipelineId(mockAccessToken, mockPipelineId);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('stages');
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith('pipeline_id', mockPipelineId);
      expect(mockSupabaseQueryBuilder.order).toHaveBeenCalledWith('order', { ascending: true });
      expect(stages).toEqual(mockStagesData);
    });
  });

  describe('getStageById', () => {
    const stageId = 'stage-xyz';
    it('should fetch a single stage by ID', async () => {
      const mockStageData: GraphQLStage = { id: stageId, name: 'Specific Stage', pipeline_id: mockPipelineId, order: 0, user_id: mockUser.id, created_at: 'ts', updated_at: 'ts', pipeline: MOCK_PIPELINE_DATA, deal_probability: 0.2 };
      mockSupabaseQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: mockStageData, error: null });
      const stage = await service.getStageById(mockAccessToken, stageId);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('stages');
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith('id', stageId);
      expect(stage).toEqual(mockStageData);
    });
  });

  describe('createStage', () => {
    const stageInput: GraphQLCreateStageInput = { name: 'New Stage', order: 0, pipeline_id: mockPipelineId, deal_probability: 0.1 };
    const expectedDbRecord = { ...stageInput, id: 'new-stage-abc', user_id: mockUser.id, created_at: 'ts', updated_at: 'ts' }; 

    it('should create a stage and return the record', async () => {
        mockAuthGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
        mockSupabaseQueryBuilder.single.mockResolvedValueOnce({ data: expectedDbRecord, error: null });
        const newStage = await service.createStage(mockAccessToken, stageInput);
        expect(mockAuthGetUser).toHaveBeenCalled();
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('stages');
        expect(mockSupabaseQueryBuilder.insert).toHaveBeenCalledWith([expect.objectContaining({ ...stageInput, user_id: mockUser.id })]);
        expect(newStage).toEqual(expectedDbRecord);
    });

    it('should throw error if input validation fails (missing order)', async () => {
        // No mock for getUser needed as it shouldn't be called
        const invalidInput = { name: 'Test Stage', pipeline_id: mockPipelineId } as GraphQLCreateStageInput;
        await expect(service.createStage(mockAccessToken, invalidInput))
            .rejects.toThrow("Pipeline ID, stage name, and order are required for creation.");
    });
    
    it('should throw error if getUser fails for createStage', async () => {
        mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Auth Error'} as PostgrestError });
         await expect(service.createStage(mockAccessToken, stageInput))
            .rejects.toThrow("Could not get authenticated user to create stage.");
    });
  });

  describe('updateStage', () => {
    const stageId = 'stage-to-update';
    const updateInput: GraphQLUpdateStageInput = { name: 'Updated Stage Name', order: 1, deal_probability: 0.9 };
    const expectedDbRecord = { id: stageId, pipeline_id: mockPipelineId, user_id: mockUser.id, name: 'Updated Stage Name', order: 1, deal_probability: 0.9, created_at: 'ts', updated_at: 'ts' };

    it('should update a stage and return the record', async () => {
      mockAuthGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null }); // For the getUser call in updateStage
      mockSupabaseQueryBuilder.single.mockResolvedValueOnce({ data: expectedDbRecord, error: null });
      const updatedStage = await service.updateStage(mockAccessToken, stageId, updateInput);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('stages');
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledWith(updateInput);
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith('id', stageId);
      expect(updatedStage).toEqual(expectedDbRecord);
    });
  });

  describe('deleteStage', () => {
    const stageId = 'stage-to-delete';
    it('should delete a stage and return true', async () => {
      // Mock the chain: supabase.from('stages').delete({ count: 'exact' }).eq('id', ...)
      mockSupabaseQueryBuilder.eq.mockResolvedValueOnce({ error: null, count: 1 }); 
      const result = await service.deleteStage(mockAccessToken, stageId);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('stages');
      expect(mockSupabaseQueryBuilder.delete).toHaveBeenCalledWith({ count: 'exact' });
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith('id', stageId);
      expect(result).toBe(true);
    });
  });
}); 