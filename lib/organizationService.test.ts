import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  organizationService, // Import the service object
  type OrganizationRecord, // Import types from the service file
  type OrganizationInput,
  type OrganizationUpdateInput
} from './organizationService';

// Define mockUserId (assuming services implicitly use RLS via client)
// const mockUserId = 'user-test-org-123'; // Not needed for calling service functions anymore

// --- Standardized Mock Supabase Client ---
const mockSupabaseClient = {
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
};

// Reset and configure mocks before each test
beforeEach(() => {
  vi.resetAllMocks();

  // Configure chainable methods (excluding select/delete) to return `this`
  mockSupabaseClient.from.mockReturnThis();
  mockSupabaseClient.insert.mockReturnThis();
  mockSupabaseClient.update.mockReturnThis();
  mockSupabaseClient.eq.mockReturnThis();
  mockSupabaseClient.order.mockReturnThis();

  // Clear mocks for terminal/potentially-terminal methods.
  mockSupabaseClient.select = vi.fn(); // Clear default
  mockSupabaseClient.delete = vi.fn(); // Clear default
  mockSupabaseClient.single = vi.fn();
  mockSupabaseClient.maybeSingle = vi.fn();
});

describe('organizationService', () => {
  // Use OrganizationRecord type
  const mockOrganization: OrganizationRecord = {
    id: 'org1',
    user_id: 'user-dummy', // user_id exists on the record
    name: 'Test Org 1',
    address: '123 Main St',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Use OrganizationRecord[] type
  const mockOrganizationList: OrganizationRecord[] = [
    mockOrganization,
    {
      id: 'org2',
      user_id: 'user-dummy',
      name: 'Test Org 2',
      address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  describe('getOrganizations', () => {
    it('should return a list of organizations', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis(); // Make select chainable
      // Mock the final terminal method (.order resolves the promise)
      mockSupabaseClient.order.mockResolvedValue({ data: mockOrganizationList, error: null });

      // Act
      const result = await organizationService.getOrganizations(mockSupabaseClient as any);

      // Assert
      expect(result).toEqual(mockOrganizationList);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should throw an error if Supabase query fails', async () => {
      // Arrange
      const error = { message: 'DB error', code: '500', details: '', hint: '' };
      mockSupabaseClient.select.mockReturnThis();
       mockSupabaseClient.order.mockResolvedValue({ data: null, error });

      // Act & Assert
      await expect(organizationService.getOrganizations(mockSupabaseClient as any)).rejects.toThrow(
        'Database operation failed in getOrganizations: DB error'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
       expect(mockSupabaseClient.order).toHaveBeenCalledWith('name', { ascending: true });
    });
  });

  describe('getOrganizationById', () => {
    it('should return an organization if found', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.maybeSingle.mockResolvedValue({ data: mockOrganization, error: null });

      // Act
      const result = await organizationService.getOrganizationById(mockSupabaseClient as any, 'org1');

      // Assert
      expect(result).toEqual(mockOrganization);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org1');
      expect(mockSupabaseClient.maybeSingle).toHaveBeenCalled();
    });

    it('should return null if organization not found', async () => {
        // Arrange
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.eq.mockReturnThis();
        mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await organizationService.getOrganizationById(mockSupabaseClient as any, 'nonexistent');

        // Assert
        expect(result).toBeNull();
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'nonexistent');
        expect(mockSupabaseClient.maybeSingle).toHaveBeenCalled();
    });

    it('should throw an error if Supabase query fails', async () => {
      // Arrange
      const error = { message: 'DB error', code: '500', details: '', hint: '' };
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error });

      // Act & Assert
      await expect(organizationService.getOrganizationById(mockSupabaseClient as any, 'org1')).rejects.toThrow(
        'Database operation failed in getOrganizationById: DB error'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org1');
       expect(mockSupabaseClient.maybeSingle).toHaveBeenCalled();
    });
  });

  describe('createOrganization', () => {
    const orgInput: OrganizationInput = { name: 'New Org', address: '456 Side St' };
    // createOrganization requires user_id
    const mockUserId = 'user-create-test';
    const expectedDbInput = { ...orgInput, user_id: mockUserId };
    const createdOrg: OrganizationRecord = {
      id: 'org3',
      user_id: mockUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: orgInput.name,
      address: orgInput.address ?? null,
    };

    it('should create and return a new organization', async () => {
      // Arrange
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: createdOrg, error: null });

      // Act
      // Pass userId
      const result = await organizationService.createOrganization(mockSupabaseClient as any, mockUserId, orgInput);

      // Assert
      expect(result).toEqual(createdOrg);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput); // Check userId is included
      expect(mockSupabaseClient.select).toHaveBeenCalledWith();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
    });

    it('should throw an error if Supabase insert fails', async () => {
      // Arrange
      const error = { message: 'Insert failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: null, error });

      // Act & Assert
      await expect(organizationService.createOrganization(mockSupabaseClient as any, mockUserId, orgInput)).rejects.toThrow(
        'Database operation failed in createOrganization: Insert failed'
      );
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput);
      expect(mockSupabaseClient.select).toHaveBeenCalledWith();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
    });

     it('should throw an error if Supabase returns no data after insert', async () => {
         // Arrange
         mockSupabaseClient.insert.mockReturnThis();
         mockSupabaseClient.select.mockReturnThis();
         mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });

         // Act & Assert
         await expect(organizationService.createOrganization(mockSupabaseClient as any, mockUserId, orgInput)).rejects.toThrow(
             'Failed to create organization, no data returned.'
         );
         expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
         expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput);
         expect(mockSupabaseClient.select).toHaveBeenCalledWith();
         expect(mockSupabaseClient.single).toHaveBeenCalled();
     });
  });

  describe('updateOrganization', () => {
    const orgUpdate: OrganizationUpdateInput = { name: 'Updated Org Name' };
    const updatedOrg: OrganizationRecord = { ...mockOrganization, ...orgUpdate, updated_at: new Date().toISOString() };

    it('should update and return the organization', async () => {
      // Arrange
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: updatedOrg, error: null });

      // Act
      const result = await organizationService.updateOrganization(mockSupabaseClient as any, 'org1', orgUpdate);

      // Assert
      expect(result).toEqual(updatedOrg);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(orgUpdate);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org1');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
    });

    it('should return null if org to update is not found or RLS prevents', async () => {
        // Arrange
        mockSupabaseClient.update.mockReturnThis();
        mockSupabaseClient.eq.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await organizationService.updateOrganization(mockSupabaseClient as any, 'nonexistent', orgUpdate);

        // Assert
        expect(result).toBeNull(); // Service returns null
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
        expect(mockSupabaseClient.update).toHaveBeenCalledWith(orgUpdate);
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'nonexistent');
        expect(mockSupabaseClient.select).toHaveBeenCalledWith();
        expect(mockSupabaseClient.single).toHaveBeenCalled();
    });

    it('should throw an error if Supabase update fails', async () => {
      // Arrange
      const error = { message: 'Update failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: null, error });

      // Act & Assert
      await expect(organizationService.updateOrganization(mockSupabaseClient as any, 'org1', orgUpdate)).rejects.toThrow(
        'Database operation failed in updateOrganization: Update failed'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
       expect(mockSupabaseClient.update).toHaveBeenCalledWith(orgUpdate);
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org1');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith();
       expect(mockSupabaseClient.single).toHaveBeenCalled();
    });
  });

  describe('deleteOrganization', () => {
    it('should delete the organization and return true if count > 0', async () => {
       // Arrange
       mockSupabaseClient.delete.mockReturnThis(); // delete returns this
       mockSupabaseClient.eq.mockResolvedValue({ error: null, count: 1 }); // eq resolves

       // Act
       const result = await organizationService.deleteOrganization(mockSupabaseClient as any, 'org1');

       // Assert
       expect(result).toBe(true);
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' }); // delete first
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org1'); // eq second
    });

    it('should return false if organization to delete is not found (count is 0)', async () => {
        // Arrange
        mockSupabaseClient.delete.mockReturnThis(); // delete returns this
        mockSupabaseClient.eq.mockResolvedValue({ error: null, count: 0 }); // eq resolves

        // Act
        const result = await organizationService.deleteOrganization(mockSupabaseClient as any, 'nonexistent');

        // Assert
        expect(result).toBe(false); // Service returns false
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
        expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'nonexistent');
    });

     it('should return true if RLS prevents delete (error code 42501)', async () => {
       // Arrange
       const rlsError = { message: 'RLS violation', code: '42501', details: '', hint: '' };
       mockSupabaseClient.delete.mockReturnThis(); // delete returns this
       mockSupabaseClient.eq.mockResolvedValue({ error: rlsError, count: 0 }); // eq resolves

       // Act
       const result = await organizationService.deleteOrganization(mockSupabaseClient as any, 'org1');

       // Assert
        // Service returns false on RLS error
       expect(result).toBe(false);
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org1');
   });

    it('should throw an error if Supabase delete fails with non-RLS error', async () => {
      // Arrange
      const deleteError = { message: 'Delete failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.delete.mockReturnThis(); // delete returns this
      mockSupabaseClient.eq.mockResolvedValue({ error: deleteError, count: null }); // eq resolves

      // Act & Assert
      await expect(organizationService.deleteOrganization(mockSupabaseClient as any, 'org1')).rejects.toThrow(
        'Database operation failed in deleteOrganization: Delete failed'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'org1');
    });
  });
}); 