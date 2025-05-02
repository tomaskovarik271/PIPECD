import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { contactService } from './contactService'; // Import the exported object
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

describe('contactService', () => {
  let mockedCreateClient: MockedFunction<typeof createClient>;
  let mockBuilderMethods: MockedBuilderMethods; 

  const mockUser: MockUser = { id: 'user-contact-123' };
  const mockAccessToken = 'mock-contact-access-token';

  beforeEach(async () => {
    vi.clearAllMocks();

    const supabaseModule = await import('@supabase/supabase-js');
    mockedCreateClient = supabaseModule.createClient as MockedFunction<typeof createClient>;

    mockBuilderMethods = mockPostgrestBuilderMethods as MockedBuilderMethods;

    Object.values(mockBuilderMethods).forEach(mockFn => {
        if (typeof mockFn?.mockClear === 'function') {
            mockFn.mockClear();
            if (mockFn !== mockBuilderMethods.single) { 
               mockFn.mockReturnThis();
            }
        }
    });
  });

  // --- Test Cases --- 

  describe('getContacts', () => {
    it('should fetch contacts for the user', async () => {
      const mockContactsData = [
        { id: 'contact-1', first_name: 'John', last_name: 'Doe', user_id: mockUser.id },
        { id: 'contact-2', first_name: 'Jane', last_name: 'Smith', user_id: mockUser.id },
      ];

      // Mock the order() call which resolves the promise
      mockBuilderMethods.order.mockResolvedValueOnce({ data: mockContactsData, error: null });

      const contacts = await contactService.getContacts(mockUser.id, mockAccessToken);

      // Assertions
      expect(mockedCreateClient).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.objectContaining({ global: { headers: { Authorization: `Bearer ${mockAccessToken}` } } }));
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('contacts');
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(contacts).toEqual(mockContactsData);
    });

    it('should throw GraphQLError on DB error', async () => {
      const dbError: Partial<PostgrestError> = { message: 'Fetch failed' };
      mockBuilderMethods.order.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });

      await expect(contactService.getContacts(mockUser.id, mockAccessToken))
        .rejects.toThrow(new GraphQLError('Database error during fetching contacts', { extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: dbError.message } }));
    });
  });

  describe('getContactById', () => {
    const contactId = 'contact-get-999';

    it('should fetch a single contact by ID', async () => {
        const mockContactData = { id: contactId, first_name: 'Single', last_name: 'Contact', user_id: mockUser.id };
        // Mock single() which resolves the promise here
        mockBuilderMethods.single.mockResolvedValueOnce({ data: mockContactData, error: null });

        const contact = await contactService.getContactById(mockUser.id, contactId, mockAccessToken);

        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('contacts');
        expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
        expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', contactId);
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(contact).toEqual(mockContactData);
    });

    it('should return null if contact not found (PGRST116)', async () => {
        const notFoundError: Partial<PostgrestError> = { code: 'PGRST116', message: 'Not Found' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: notFoundError as PostgrestError });

        const contact = await contactService.getContactById(mockUser.id, contactId, mockAccessToken);
        expect(contact).toBeNull();
    });

    it('should throw GraphQLError for other DB errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'DB Connection Failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });

        await expect(contactService.getContactById(mockUser.id, contactId, mockAccessToken))
          .rejects.toThrow(new GraphQLError('Database error during fetching contact by ID', { extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: dbError.message } }));
    });
  });

  describe('createContact', () => {
    const contactInput = { first_name: 'New', last_name: 'Contact', email: 'new@test.com' };
    const expectedRecord = { 
        ...contactInput, 
        id: 'new-contact-id', 
        user_id: mockUser.id, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString()
    };

    it('should create a contact and return the record', async () => {
        // Mock single() which resolves the insert().select()... chain
        mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });

        const result = await contactService.createContact(mockUser.id, contactInput, mockAccessToken);

        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('contacts');
        expect(mockBuilderMethods.insert).toHaveBeenCalledWith({ ...contactInput, user_id: mockUser.id });
        expect(mockBuilderMethods.select).toHaveBeenCalled();
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(result).toEqual(expectedRecord);
    });

    it('should throw GraphQLError on DB error', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Insert Constraint Violation' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });

        await expect(contactService.createContact(mockUser.id, contactInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during creating contact', { extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: dbError.message } }));
    });

    it('should throw GraphQLError if insert returns no data', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });

        await expect(contactService.createContact(mockUser.id, contactInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Failed to create contact, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } }));
    });
  });

  describe('updateContact', () => {
    const contactIdToUpdate = 'contact-update-456';
    const updateInput = { first_name: 'Updated', company: 'New Co' };
    const expectedUpdatedRecord = { 
        id: contactIdToUpdate, 
        user_id: mockUser.id, 
        first_name: 'Updated', 
        last_name: 'Contact', // Assuming previous value 
        email: 'update@test.com', // Assuming previous value
        phone: null, // Assuming previous value
        company: 'New Co',
        notes: null, // Assuming previous value
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    it('should update a contact and return the updated record', async () => {
        // Mock single() which resolves the update().eq().select()... chain
        mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedUpdatedRecord, error: null });

        const result = await contactService.updateContact(mockUser.id, contactIdToUpdate, updateInput, mockAccessToken);

        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('contacts');
        expect(mockBuilderMethods.update).toHaveBeenCalledWith(updateInput);
        expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', contactIdToUpdate);
        expect(mockBuilderMethods.select).toHaveBeenCalled();
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(result).toEqual(expectedUpdatedRecord);
    });

    it('should throw GraphQLError on DB error', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Update Failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });

        await expect(contactService.updateContact(mockUser.id, contactIdToUpdate, updateInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during updating contact', { extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: dbError.message } }));
    });

     it('should throw GraphQLError if update returns no data (not found)', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });

        await expect(contactService.updateContact(mockUser.id, contactIdToUpdate, updateInput, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Contact not found or update failed', { extensions: { code: 'NOT_FOUND' } }));
    });

  });

  describe('deleteContact', () => {
    const contactIdToDelete = 'contact-delete-789';

    it('should return true on successful deletion (count > 0)', async () => {
        // Mock eq() which resolves the delete()... chain
        mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 1 });

        const result = await contactService.deleteContact(mockUser.id, contactIdToDelete, mockAccessToken);

        expect(result).toBe(true);
        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('contacts');
        expect(mockBuilderMethods.delete).toHaveBeenCalled();
        expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', contactIdToDelete);
    });

    it('should return false if count is 0 or null (item not found/deleted)', async () => {
        mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 0 });
        const result1 = await contactService.deleteContact(mockUser.id, contactIdToDelete, mockAccessToken);
        expect(result1).toBe(false);

        mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: null });
        const result2 = await contactService.deleteContact(mockUser.id, contactIdToDelete, mockAccessToken);
        expect(result2).toBe(false);
    });

    it('should throw GraphQLError if delete fails', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Delete permission denied' };
        // Mock error on eq()
        mockBuilderMethods.eq.mockResolvedValueOnce({ error: dbError as PostgrestError, count: null });

        await expect(contactService.deleteContact(mockUser.id, contactIdToDelete, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during deleting contact', { extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: dbError.message } }));
    });
  });

  describe('getContactListForUser', () => {
    it('should return formatted contact list', async () => {
        const mockRawData = [
            { id: 'c1', first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com' },
            { id: 'c2', first_name: null, last_name: 'Bob', email: 'bob@test.com' },
            { id: 'c3', first_name: 'Charlie', last_name: null, email: 'charlie@test.com' },
            { id: 'c4', first_name: null, last_name: null, email: 'david@test.com' },
            { id: 'c5', first_name: 'Eve', last_name: 'Adams', email: null }, // Test null email
        ];
        const expectedFormattedData = [
            { id: 'c1', name: 'Smith, Alice' },
            { id: 'c2', name: 'Bob' },
            { id: 'c3', name: 'Charlie' },
            { id: 'c4', name: 'david@test.com' },
            { id: 'c5', name: 'Adams, Eve' },
        ];

        // Mock the order chain: first call returns this, second call resolves
        mockBuilderMethods.order
            .mockImplementationOnce(() => mockBuilderMethods) // 1st call returns builder
            .mockResolvedValueOnce({ data: mockRawData, error: null }); // 2nd call resolves promise

        const result = await contactService.getContactListForUser(mockUser.id, mockAccessToken);

        expect(mockedCreateClient).toHaveBeenCalledTimes(1);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('contacts');
        expect(mockBuilderMethods.select).toHaveBeenCalledWith('id, first_name, last_name, email');
        // Check order calls
        expect(mockBuilderMethods.order).toHaveBeenCalledTimes(2);
        expect(mockBuilderMethods.order).toHaveBeenNthCalledWith(1, 'last_name', { ascending: true });
        expect(mockBuilderMethods.order).toHaveBeenNthCalledWith(2, 'first_name', { ascending: true });
        expect(result).toEqual(expectedFormattedData);
    });

    it('should return empty array if no contacts found', async () => {
         // Mock the order chain: first call returns this, second call resolves with empty data
        mockBuilderMethods.order
            .mockImplementationOnce(() => mockBuilderMethods)
            .mockResolvedValueOnce({ data: [], error: null }); 
            
        const result = await contactService.getContactListForUser(mockUser.id, mockAccessToken);
        expect(result).toEqual([]);
        expect(mockBuilderMethods.order).toHaveBeenCalledTimes(2); // Still called twice
    });

     it('should throw GraphQLError on DB error', async () => {
        const dbError: Partial<PostgrestError> = { message: 'List Fetch Failed' };
        // Mock the order chain: first call returns this, second call resolves with error
        mockBuilderMethods.order
            .mockImplementationOnce(() => mockBuilderMethods)
            .mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });

        await expect(contactService.getContactListForUser(mockUser.id, mockAccessToken))
            .rejects.toThrow(new GraphQLError('Database error during fetching contact list', { extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: dbError.message } }));
        expect(mockBuilderMethods.order).toHaveBeenCalledTimes(2); // Still called twice before error
    });
  });
}); 