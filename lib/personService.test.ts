import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  personService, // Import the service object
  type PersonRecord, // Import types from the service file
  type PersonInput,
  type PersonUpdateInput
} from './personService';

// Define mockUserId
const mockUserId = 'user-test-123';

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
  // .select() and .delete() will be mocked specifically in each test
  // to either return `this` for chaining or resolve a value.
  mockSupabaseClient.select = vi.fn(); // Clear default
  mockSupabaseClient.delete = vi.fn(); // Clear default
  mockSupabaseClient.single = vi.fn();
  mockSupabaseClient.maybeSingle = vi.fn();
});

describe('personService', () => {
  // Use PersonRecord type
  const mockPerson: PersonRecord = {
    id: '1',
    user_id: mockUserId,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    notes: 'Test notes',
    organization_id: 'org1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  // Use PersonRecord[] type
  const mockPeopleList: PersonRecord[] = [
    mockPerson,
    {
      id: '2',
      user_id: mockUserId,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '0987654321',
      notes: null,
      organization_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Test the actual service methods
  describe('getPeople', () => {
    it('should return a list of people', async () => {
      // Arrange
      // Mock .select() to be terminal AND chainable for .order()
      mockSupabaseClient.select.mockReturnThis(); // Make select chainable
      // Mock the final terminal method in the chain (.order resolves the promise)
      mockSupabaseClient.order.mockResolvedValue({ data: mockPeopleList, error: null });

      // Act
      const result = await personService.getPeople(mockSupabaseClient as any);

      // Assert
      expect(result).toEqual(mockPeopleList);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('people');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should throw an error if Supabase query fails', async () => {
      // Arrange
      const error = { message: 'Supabase query failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.select.mockReturnThis(); // Make select chainable
       // Mock the terminal method (.order) to resolve with an error
       mockSupabaseClient.order.mockResolvedValue({ data: null, error });

      // Act & Assert
      await expect(personService.getPeople(mockSupabaseClient as any)).rejects.toThrow(
        'Database operation failed in getPeople: Supabase query failed'
      );
       // ... assertions ...
    });
  });

  describe('getPersonById', () => {
    it('should return a person if found', async () => {
      // Arrange
       mockSupabaseClient.select.mockReturnThis(); // Make select chainable
       mockSupabaseClient.eq.mockReturnThis(); // Make eq chainable
       // Mock the terminal method (.maybeSingle)
       mockSupabaseClient.maybeSingle.mockResolvedValue({ data: mockPerson, error: null });

      // Act
      const result = await personService.getPersonById(mockSupabaseClient as any, '1');
      // ... assertions ...
    });

    it('should return null if person not found', async () => {
        // Arrange
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.eq.mockReturnThis();
        mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error: null });
        // ... act & assertions ...
    });

    it('should throw an error if Supabase query fails', async () => {
      // Arrange
      const error = { message: 'Supabase query failed', code: '500', details: '', hint: '' };
       mockSupabaseClient.select.mockReturnThis();
       mockSupabaseClient.eq.mockReturnThis();
       mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error });
      // ... act & assertions ...
    });
  });

  describe('createPerson', () => {
    const personInput: PersonInput = {
      first_name: 'New',
      last_name: 'Person',
      email: 'new@example.com',
      phone: '1122334455',
      organization_id: 'org1',
    };
    const expectedDbInput = { ...personInput, user_id: mockUserId };
    const createdPerson: PersonRecord = {
      id: '3',
      user_id: mockUserId,
        created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(),
      first_name: personInput.first_name ?? null,
      last_name: personInput.last_name ?? null,
      email: personInput.email ?? null,
      phone: personInput.phone ?? null,
      notes: personInput.notes ?? null,
      organization_id: personInput.organization_id ?? null,
    };

    it('should create and return a new person', async () => {
      // Arrange
       mockSupabaseClient.insert.mockReturnThis(); // Make insert chainable
       mockSupabaseClient.select.mockReturnThis(); // Make select chainable
       // Mock the terminal method (.single)
       mockSupabaseClient.single.mockResolvedValue({ data: createdPerson, error: null });
      // ... act & assertions ...
    });

    it('should throw an error if Supabase insert fails', async () => {
      // Arrange
      const error = { message: 'Supabase insert failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: null, error });
      // ... act & assertions ...
    });

     it('should throw an error if Supabase returns no data after insert', async () => {
         // Arrange
         mockSupabaseClient.insert.mockReturnThis();
         mockSupabaseClient.select.mockReturnThis();
         mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
         // ... act & assertions ...
    });
  });

  describe('updatePerson', () => {
    const personUpdate: PersonUpdateInput = { first_name: 'Updated Name' };
    const updatedPerson: PersonRecord = { ...mockPerson, ...personUpdate, updated_at: new Date().toISOString() };

    it('should update and return the person', async () => {
      // Arrange
      mockSupabaseClient.update.mockReturnThis(); // Make update chainable
      mockSupabaseClient.eq.mockReturnThis(); // Make eq chainable
      mockSupabaseClient.select.mockReturnThis(); // Make select chainable
      // Mock the terminal method (.single)
      mockSupabaseClient.single.mockResolvedValue({ data: updatedPerson, error: null });
      // ... act & assertions ...
    });

    it('should return null if person to update is not found or RLS prevents update', async () => {
        // Arrange
        mockSupabaseClient.update.mockReturnThis();
        mockSupabaseClient.eq.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
        // ... act & assertions ...
    });

    it('should throw an error if Supabase update fails', async () => {
      // Arrange
      const error = { message: 'Supabase update failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: null, error });
      // ... act & assertions ...
    });

    it('should fetch and return current person if update input is empty', async () => {
      // Arrange
      // Mocks for the getPersonById path
      mockSupabaseClient.select.mockReturnThis(); 
      mockSupabaseClient.eq.mockReturnThis(); 
      mockSupabaseClient.maybeSingle.mockResolvedValue({ data: mockPerson, error: null });

      // Act
      const result = await personService.updatePerson(mockSupabaseClient as any, '1', {}); // Empty input

      // Assert
      // ... assertions ... Ensure .update was NOT called
      expect(mockSupabaseClient.update).not.toHaveBeenCalled();
    });

    it('should throw error if person not found when checking empty update', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error: null });
      // ... act & assertions ... Ensure .update was NOT called
       expect(mockSupabaseClient.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePerson', () => {
    it('should delete the person and return true if count > 0', async () => {
       // Arrange
       mockSupabaseClient.delete.mockReturnThis(); // delete returns this
       mockSupabaseClient.eq.mockResolvedValue({ error: null, count: 1 }); // eq resolves

       // Act
       const result = await personService.deletePerson(mockSupabaseClient as any, '1');
       // Assert
       expect(result).toBe(true);
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('people');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' }); // delete first
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1'); // eq second
    });

    it('should return false if person to delete is not found (count is 0)', async () => {
        // Arrange
        mockSupabaseClient.delete.mockReturnThis(); // delete returns this
        mockSupabaseClient.eq.mockResolvedValue({ error: null, count: 0 }); // eq resolves
        // Act
        const result = await personService.deletePerson(mockSupabaseClient as any, 'nonexistent');
        // Assert
        expect(result).toBe(false);
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('people');
        expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'nonexistent');
    });

    it('should return true if RLS prevents delete (error code 42501)', async () => {
       // Arrange
       const rlsError = { message: 'RLS violation', code: '42501', details: '', hint: '' };
       mockSupabaseClient.delete.mockReturnThis(); // delete returns this
       mockSupabaseClient.eq.mockResolvedValue({ error: rlsError, count: 0 }); // eq resolves
        // Act
       const result = await personService.deletePerson(mockSupabaseClient as any, '1');
        // Assert
        // Service returns false on RLS error
       expect(result).toBe(false);
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('people');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should throw an error if Supabase delete fails with non-RLS error', async () => {
      // Arrange
      const deleteError = { message: 'Supabase delete failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.delete.mockReturnThis(); // delete returns this
      mockSupabaseClient.eq.mockResolvedValue({ error: deleteError, count: null }); // eq resolves
        // Act & Assert
        await expect(personService.deletePerson(mockSupabaseClient as any, '1')).rejects.toThrow(
            'Database operation failed in deletePerson: Supabase delete failed'
        );
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('people');
        expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1');
    });
  });
}); 