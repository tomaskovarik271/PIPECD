import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { createClient, /* SupabaseClient, */ PostgrestError } from '@supabase/supabase-js'; // Comment out SupabaseClient
import { organizationService } from './organizationService'; // Import the service
import { GraphQLError } from 'graphql';

// --- Mock Setup (Same pattern) ---
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
  const mockClient = { from: vi.fn(() => mockPostgrestBuilderMethods), auth: {} };
  return { createClient: vi.fn(() => mockClient) };
});

// --- Helper Types ---
interface MockUser { id: string; }
type MockedBuilderMethods = { [K in keyof typeof mockPostgrestBuilderMethods]: MockedFunction<any>; };

// --- Test Suite --- 
describe('organizationService', () => {
  let mockedCreateClient: MockedFunction<typeof createClient>;
  let mockBuilderMethods: MockedBuilderMethods; 
  const mockUser: MockUser = { id: 'user-org-789' };
  const mockAccessToken = 'mock-org-access-token';

  beforeEach(async () => { 
    vi.clearAllMocks();
    const { createClient: actualMockedCreateClient } = await import('@supabase/supabase-js');
    mockedCreateClient = actualMockedCreateClient as MockedFunction<typeof createClient>;
    mockBuilderMethods = mockPostgrestBuilderMethods as MockedBuilderMethods;
    Object.values(mockBuilderMethods).forEach(mockFn => {
        mockFn.mockClear();
        if (mockFn !== mockBuilderMethods.single) { mockFn.mockReturnThis(); }
    });
  });

  // --- Test Cases --- 

  describe('getOrganizations', () => {
    it('should fetch organizations for a given user', async () => {
      const mockOrgsData = [
        { id: 'org-1', name: 'Org Alpha', user_id: mockUser.id },
        { id: 'org-2', name: 'Org Beta', user_id: mockUser.id },
      ];
      mockBuilderMethods.order.mockResolvedValueOnce({ data: mockOrgsData, error: null });

      const orgs = await organizationService.getOrganizations(mockUser.id, mockAccessToken);

      expect(mockedCreateClient).toHaveBeenCalledWith(
          process.env.SUPABASE_URL, 
          process.env.SUPABASE_ANON_KEY, 
          { global: { headers: { Authorization: `Bearer ${mockAccessToken}` } } }
      );
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('organizations');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.order).toHaveBeenCalledWith('name', { ascending: true }); 
      expect(orgs).toEqual(mockOrgsData);
    });

    it('should throw GraphQLError if Supabase fails', async () => {
      const mockDbError: Partial<PostgrestError> = { message: 'Org Select failed' };
      mockBuilderMethods.order.mockResolvedValueOnce({ data: null, error: mockDbError as PostgrestError });
      await expect(organizationService.getOrganizations(mockUser.id, mockAccessToken))
        .rejects.toThrow(new GraphQLError('Database error during fetching organizations', {
            extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: 'Org Select failed' }
        }));
    });
  });

  describe('getOrganizationById', () => {
    const orgId = 'org-def';
    it('should fetch a single organization by ID', async () => {
      const mockOrgData = { id: orgId, name: 'Specific Org', user_id: mockUser.id };
      mockBuilderMethods.single.mockResolvedValueOnce({ data: mockOrgData, error: null });

      const org = await organizationService.getOrganizationById(mockUser.id, orgId, mockAccessToken);

      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('organizations');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', orgId);
      expect(mockBuilderMethods.single).toHaveBeenCalled();
      expect(org).toEqual(mockOrgData);
    });

     it('should return null if organization not found (PGRST116)', async () => {
        const notFoundError: Partial<PostgrestError> = { code: 'PGRST116' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: notFoundError as PostgrestError });
        const org = await organizationService.getOrganizationById(mockUser.id, orgId, mockAccessToken);
        expect(org).toBeNull();
    });

    it('should throw GraphQLError for other errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'DB org error' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(organizationService.getOrganizationById(mockUser.id, orgId, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during fetching organization by ID', {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: 'DB org error' }
            }));
    });
  });

  describe('createOrganization', () => {
    const orgInput = { name: 'New Org', address: '123 Main St' };
    const expectedRecord = { ...orgInput, id: 'new-org-uuid', user_id: mockUser.id }; 

    it('should create an organization and return the record', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
        const newOrg = await organizationService.createOrganization(mockUser.id, orgInput, mockAccessToken);

        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('organizations');
        expect(mockBuilderMethods.insert).toHaveBeenCalledWith({ ...orgInput, user_id: mockUser.id });
        expect(mockBuilderMethods.select).toHaveBeenCalled(); 
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(newOrg).toEqual(expectedRecord);
    });

    it('should throw GraphQLError if insert fails', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Org Insert failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(organizationService.createOrganization(mockUser.id, orgInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during creating organization', {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: 'Org Insert failed' }
            }));
    });

     it('should throw GraphQLError if insert returns no data', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        await expect(organizationService.createOrganization(mockUser.id, orgInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Failed to create organization, no data returned', {
                 extensions: { code: 'INTERNAL_SERVER_ERROR' }
            }));
    });
  });

  describe('updateOrganization', () => {
    const orgId = 'org-to-update';
    const updateInput = { name: 'Updated Org Name' };
    const expectedRecord = { id: orgId, user_id: mockUser.id, ...updateInput };

    it('should update an organization and return the record', async () => {
      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
      const updatedOrg = await organizationService.updateOrganization(mockUser.id, orgId, updateInput, mockAccessToken);

      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('organizations');
      expect(mockBuilderMethods.update).toHaveBeenCalledWith(updateInput);
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', orgId);
      expect(mockBuilderMethods.select).toHaveBeenCalled();
      expect(mockBuilderMethods.single).toHaveBeenCalled();
      expect(updatedOrg).toEqual(expectedRecord);
    });

    it('should throw GraphQLError if organization not found (PGRST116)', async () => {
        const notFoundError: Partial<PostgrestError> = { code: 'PGRST116' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: notFoundError as PostgrestError });
        await expect(organizationService.updateOrganization(mockUser.id, orgId, updateInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Organization not found', {
                extensions: { code: 'NOT_FOUND' }
            }));
    });

     it('should throw GraphQLError for other errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Org Update failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(organizationService.updateOrganization(mockUser.id, orgId, updateInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during updating organization', {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: 'Org Update failed' }
            }));
    });
  });

  describe('deleteOrganization', () => {
    const orgId = 'org-to-delete';
    it('should return true on successful deletion', async () => {
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 1 });
      const result = await organizationService.deleteOrganization(mockUser.id, orgId, mockAccessToken);

      expect(result).toBe(true);
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('organizations');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', orgId);
    });

     it('should return true even if count is 0 or null', async () => {
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 0 });
      const result1 = await organizationService.deleteOrganization(mockUser.id, orgId, mockAccessToken);
      expect(result1).toBe(true);
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: null });
      const result2 = await organizationService.deleteOrganization(mockUser.id, orgId, mockAccessToken);
       expect(result2).toBe(true);
    });

    it('should throw GraphQLError if delete fails', async () => {
      const dbError: Partial<PostgrestError> = { message: 'Org Delete failed' };
      mockBuilderMethods.eq.mockResolvedValueOnce({ error: dbError as PostgrestError, count: null });
      await expect(organizationService.deleteOrganization(mockUser.id, orgId, mockAccessToken))
        .rejects.toThrow(new GraphQLError('Database error during deleting organization', {
            extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: 'Org Delete failed' }
        }));
    });
  });
}); 