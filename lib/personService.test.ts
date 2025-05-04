import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { createClient, /* SupabaseClient, */ PostgrestError } from '@supabase/supabase-js'; // Comment out SupabaseClient
import { personService } from './personService';
import { GraphQLError } from 'graphql';

// --- Mock Setup (Same as dealService.test.ts) ---
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
describe('personService', () => { // Updated describe block
  let mockedCreateClient: MockedFunction<typeof createClient>;
  let mockBuilderMethods: MockedBuilderMethods; 
  const mockUser: MockUser = { id: 'user-456' };
  const mockAccessToken = 'mock-person-access-token';

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
  describe('getPeople', () => { // Updated method name
    it('should fetch people for a given user', async () => {
      const mockPeopleData = [
        { id: 'person-1', first_name: 'John', user_id: mockUser.id },
        { id: 'person-2', last_name: 'Doe', user_id: mockUser.id },
      ];
      mockBuilderMethods.order.mockResolvedValueOnce({ data: mockPeopleData, error: null });

      const people = await personService.getPeople(mockUser.id, mockAccessToken);

      expect(mockedCreateClient).toHaveBeenCalledWith(
          process.env.SUPABASE_URL, 
          process.env.SUPABASE_ANON_KEY, 
          { global: { headers: { Authorization: `Bearer ${mockAccessToken}` } } }
      );
      const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('people'); // Check table name
      expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(people).toEqual(mockPeopleData);
    });

    it('should throw GraphQLError if Supabase fails', async () => {
      const mockDbError: Partial<PostgrestError> = { message: 'Select failed' };
      mockBuilderMethods.order.mockResolvedValueOnce({ data: null, error: mockDbError as PostgrestError });

      await expect(personService.getPeople(mockUser.id, mockAccessToken))
        .rejects
        .toThrow(new GraphQLError('Database error during fetching people. Please try again later.', {
          extensions: { 
            code: 'INTERNAL_SERVER_ERROR', 
            originalError: { message: mockDbError.message, code: undefined }
          }
        }));
    });
  });

  describe('getPersonById', () => { // Updated method name
    const personId = 'person-abc';
    it('should fetch a single person by ID', async () => {
      const mockPersonData = { id: personId, first_name: 'Jane', user_id: mockUser.id };
      mockBuilderMethods.single.mockResolvedValueOnce({ data: mockPersonData, error: null });

      const person = await personService.getPersonById(mockUser.id, personId, mockAccessToken);

        const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('people'); // Check table name
        expect(mockBuilderMethods.select).toHaveBeenCalledWith('*');
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', personId);
        expect(mockBuilderMethods.single).toHaveBeenCalled();
      expect(person).toEqual(mockPersonData);
    });

     it('should return null if person not found (PGRST116)', async () => {
        const notFoundError: Partial<PostgrestError> = { code: 'PGRST116' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: notFoundError as PostgrestError });
        const person = await personService.getPersonById(mockUser.id, personId, mockAccessToken);
        expect(person).toBeNull();
    });

    it('should throw GraphQLError for other errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'DB error' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(personService.getPersonById(mockUser.id, personId, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError('Database error during fetching person by ID. Please try again later.', {
                extensions: { 
                  code: 'INTERNAL_SERVER_ERROR', 
                  originalError: { message: dbError.message, code: undefined }
                }
            }));
    });
  });

  describe('createPerson', () => { // Updated method name
    const personInput = { first_name: 'New', last_name: 'Person', email: 'new@test.com', organization_id: 'org-123' }; // Added org id
    const expectedRecord = { ...personInput, id: 'new-person-xyz', user_id: mockUser.id }; 

    it('should create a person and return the record', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
        const newPerson = await personService.createPerson(mockUser.id, personInput, mockAccessToken);

        const clientInstance = mockedCreateClient.mock.results[0]!.value;
        expect(clientInstance.from).toHaveBeenCalledWith('people'); // Check table name
        expect(mockBuilderMethods.insert).toHaveBeenCalledWith({ ...personInput, user_id: mockUser.id });
        expect(mockBuilderMethods.select).toHaveBeenCalled();
        expect(mockBuilderMethods.single).toHaveBeenCalled();
        expect(newPerson).toEqual(expectedRecord);
    });

    it('should throw GraphQLError if insert fails', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Insert failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(personService.createPerson(mockUser.id, personInput, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError('Database error during creating person. Please try again later.', {
                 extensions: { 
                   code: 'INTERNAL_SERVER_ERROR', 
                   originalError: { message: dbError.message, code: undefined }
                 }
            }));
    });

    it('should throw GraphQLError if insert returns no data', async () => {
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        await expect(personService.createPerson(mockUser.id, personInput, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError('Failed to create person, no data returned', {
                 extensions: { code: 'INTERNAL_SERVER_ERROR' }
            }));
    });
  });

  describe('updatePerson', () => { // Updated method name
    const personId = 'person-to-update';
    const updateInput = { last_name: 'UpdatedName', organization_id: 'org-456' }; // Added org id
    const expectedRecord = { id: personId, user_id: mockUser.id, ...updateInput };

    it('should update a person and return the record', async () => {
      mockBuilderMethods.single.mockResolvedValueOnce({ data: expectedRecord, error: null });
      const updatedPerson = await personService.updatePerson(mockUser.id, personId, updateInput, mockAccessToken);

        const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('people'); // Check table name
        expect(mockBuilderMethods.update).toHaveBeenCalledWith(updateInput);
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', personId);
        expect(mockBuilderMethods.select).toHaveBeenCalled();
        expect(mockBuilderMethods.single).toHaveBeenCalled();
      expect(updatedPerson).toEqual(expectedRecord);
    });

    it('should throw GraphQLError if person not found (PGRST116)', async () => {
        const notFoundError: Partial<PostgrestError> = { code: 'PGRST116' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: notFoundError as PostgrestError });
        await expect(personService.updatePerson(mockUser.id, personId, updateInput, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError('Person not found', {
                 extensions: { code: 'NOT_FOUND' }
            }));
    });

     it('should throw GraphQLError for other errors', async () => {
        const dbError: Partial<PostgrestError> = { message: 'Update failed' };
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: dbError as PostgrestError });
        await expect(personService.updatePerson(mockUser.id, personId, updateInput, mockAccessToken))
            .rejects
            .toThrow(new GraphQLError('Database error during updating person. Please try again later.', {
                 extensions: { 
                   code: 'INTERNAL_SERVER_ERROR', 
                   originalError: { message: dbError.message, code: undefined }
                 }
            }));
    });
  });

  describe('deletePerson', () => { // Updated method name
    const personId = 'person-to-delete';
    it('should return true on successful deletion', async () => {
        mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 1 });
      const result = await personService.deletePerson(mockUser.id, personId, mockAccessToken);

        expect(result).toBe(true);
        const clientInstance = mockedCreateClient.mock.results[0]!.value;
      expect(clientInstance.from).toHaveBeenCalledWith('people'); // Check table name
      expect(mockBuilderMethods.eq).toHaveBeenCalledWith('id', personId);
    });

     it('should return true even if count is 0 or null', async () => {
        mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: 0 });
      const result1 = await personService.deletePerson(mockUser.id, personId, mockAccessToken);
      expect(result1).toBe(true);
        mockBuilderMethods.eq.mockResolvedValueOnce({ error: null, count: null });
      const result2 = await personService.deletePerson(mockUser.id, personId, mockAccessToken);
       expect(result2).toBe(true);
    });

    it('should throw GraphQLError if delete fails', async () => {
      const dbError: Partial<PostgrestError> = { message: 'Delete failed' };
        mockBuilderMethods.eq.mockResolvedValueOnce({ error: dbError as PostgrestError, count: null });
      await expect(personService.deletePerson(mockUser.id, personId, mockAccessToken))
        .rejects
        .toThrow(new GraphQLError('Database error during deleting person. Please try again later.', {
            extensions: { 
              code: 'INTERNAL_SERVER_ERROR', 
              originalError: { message: dbError.message, code: undefined }
            }
        }));
    });
  });
}); 