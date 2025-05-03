import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { supabase } from './supabaseClient'; // The actual client
import { leadService } from './leadService';
import type { LeadRecord, LeadInput, LeadUpdateInput } from './leadService';
import type { User } from '@supabase/supabase-js';

// --- Mock Supabase Client ---
vi.mock('./supabaseClient');

// Declare variables for mocks - will be assigned in beforeAll
let mockedSupabase: any; // Use a single variable for the mocked client

// --- Test Data ---
const mockUserId = 'user-test-123';
const mockAccessToken = 'mock-token';
const mockUser: User = { id: mockUserId, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' }; // Minimal mock User

const mockLead1: LeadRecord = {
    id: 'lead-uuid-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: mockUserId,
    name: 'Test Lead One',
    email: 'lead1@test.com',
    phone: '111-1111',
    company_name: 'Company A',
    source: 'Website',
    status: 'New',
    notes: 'First lead note'
};

const mockLead2: LeadRecord = {
    id: 'lead-uuid-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: mockUserId,
    name: 'Test Lead Two',
    email: 'lead2@test.com',
    phone: null,
    company_name: 'Company B',
    source: 'Referral',
    status: 'Contacted',
    notes: null
};

// --- Test Suite ---
describe('leadService', () => {

    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks();

        // Get a fresh mocked instance before each test
        mockedSupabase = vi.mocked(supabase, true); // Deep mock

        // Default successful auth mock for most tests
        mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

        // Mock the query builder chain structure
        const queryBuilderMock = {
            // Methods that return the builder for further chaining
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            // Methods that execute the query and return a result (promise)
            maybeSingle: vi.fn(),
            single: vi.fn(),
            // For `select()` without single/maybeSingle, it implicitly resolves.
            // We can mock the resolution by configuring the mock function itself.
            // For `delete()`, it resolves with count/error after the chain.
            // We configure the `delete` function itself to resolve.
        };

        // Make `supabase.from()` return our mock query builder
        mockedSupabase.from.mockReturnValue(queryBuilderMock);

        // Make chainable methods on the query builder return the builder itself
        // This allows chaining like .select().eq().order()
        queryBuilderMock.select.mockReturnThis();
        queryBuilderMock.insert.mockReturnThis(); // .insert(...).select().single()
        queryBuilderMock.update.mockReturnThis(); // .update(...).eq().select().single()
        queryBuilderMock.delete.mockReturnThis(); // .delete(...).eq().eq() -> resolves promise
        queryBuilderMock.eq.mockReturnThis();
        queryBuilderMock.order.mockReturnThis();

        // Now, individual tests can configure the final method in the chain
        // e.g., queryBuilderMock.maybeSingle.mockResolvedValue(...)
        // or queryBuilderMock.select.mockResolvedValue(...) for simple selects
        // or queryBuilderMock.delete.mockResolvedValue(...) for delete operations
    });

    // --- getLeads Tests ---
    describe('getLeads', () => {
        it('should fetch leads for a user successfully', async () => {
            // Arrange
            const mockLeads = [mockLead1, mockLead2];
            vi.mocked(mockedSupabase.from('leads').select).mockResolvedValue({ data: mockLeads, error: null });

            // Act
            const result = await leadService.getLeads(mockUserId, mockAccessToken);

            // Assert
            expect(result).toEqual(mockLeads);
            expect(mockedSupabase.auth.getUser).toHaveBeenCalledWith(mockAccessToken);
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').select).toHaveBeenCalledWith('*');
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockedSupabase.from('leads').order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('should return an empty array if no leads are found', async () => {
            // Arrange
            vi.mocked(mockedSupabase.from('leads').select).mockResolvedValue({ data: [], error: null });

            // Act
            const result = await leadService.getLeads(mockUserId, mockAccessToken);

            // Assert
            expect(result).toEqual([]);
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').select).toHaveBeenCalledWith('*');
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('user_id', mockUserId);
        });

        it('should throw an error if Supabase select fails', async () => {
            // Arrange
            const dbError = { message: 'Select failed', code: '500', details: '', hint: '' };
            vi.mocked(mockedSupabase.from('leads').select).mockResolvedValue({ data: null, error: dbError });

            // Act & Assert
            await expect(leadService.getLeads(mockUserId, mockAccessToken))
                .rejects.toThrow(/Database operation failed in getLeads: Select failed/);
        });

        it('should throw an error if auth fails', async () => {
             // Arrange
             const authError = { message: 'Invalid token', status: 401 };
             mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: authError as any });

             // Act & Assert
             await expect(leadService.getLeads(mockUserId, mockAccessToken))
                 .rejects.toThrow('Invalid user or access token');
             expect(mockedSupabase.from).not.toHaveBeenCalled(); // Ensure DB wasn't queried
        });

         it('should throw an error if auth user ID does not match requested user ID', async () => {
             // Arrange
             const differentUser = { ...mockUser, id: 'other-user-id' };
             mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: differentUser }, error: null });

             // Act & Assert
             await expect(leadService.getLeads(mockUserId, mockAccessToken)) // Requesting for mockUserId
                 .rejects.toThrow('Invalid user or access token');
             expect(mockedSupabase.from).not.toHaveBeenCalled();
        });
    });

    // --- getLeadById Tests ---
    describe('getLeadById', () => {
        const leadId = mockLead1.id;

        it('should fetch a single lead by ID successfully', async () => {
            // Arrange
            mockedSupabase.from('leads').maybeSingle.mockResolvedValue({ data: mockLead1, error: null });

            // Act
            const result = await leadService.getLeadById(mockUserId, leadId, mockAccessToken);

            // Assert
            expect(result).toEqual(mockLead1);
            expect(mockedSupabase.auth.getUser).toHaveBeenCalledWith(mockAccessToken);
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').select).toHaveBeenCalledWith('*');
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('id', leadId);
            expect(mockedSupabase.from('leads').maybeSingle).toHaveBeenCalledTimes(1);
        });

        it('should return null if lead is not found', async () => {
             // Arrange
             mockedSupabase.from('leads').maybeSingle.mockResolvedValue({ data: null, error: null });

            // Act
            const result = await leadService.getLeadById(mockUserId, 'non-existent-id', mockAccessToken);

            // Assert
            expect(result).toBeNull();
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('id', 'non-existent-id');
            expect(mockedSupabase.from('leads').maybeSingle).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if Supabase maybeSingle fails', async () => {
             // Arrange
            const dbError = { message: 'maybeSingle failed', code: '500', details: '', hint: '' };
            mockedSupabase.from('leads').maybeSingle.mockResolvedValue({ data: null, error: dbError });

            // Act & Assert
            await expect(leadService.getLeadById(mockUserId, leadId, mockAccessToken))
                .rejects.toThrow(/Database operation failed in getLeadById: maybeSingle failed/);
        });

         it('should throw an error if auth fails', async () => {
             // Arrange
             const authError = { message: 'Invalid token', status: 401 };
             mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: authError as any });

             // Act & Assert
             await expect(leadService.getLeadById(mockUserId, leadId, mockAccessToken))
                 .rejects.toThrow('Invalid user or access token');
             expect(mockedSupabase.from).not.toHaveBeenCalled();
        });
    });

    // --- createLead Tests ---
    describe('createLead', () => {
        const leadInput: LeadInput = {
            name: 'New Lead',
            email: 'new@lead.com',
            status: 'Qualified',
        };
        const expectedDbInput = {
            ...leadInput,
            user_id: mockUserId,
        };
         const createdLeadRecord: LeadRecord = {
            id: 'new-lead-uuid',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: mockUserId,
            name: leadInput.name,
            email: leadInput.email,
            status: leadInput.status || 'New',
            phone: null,
            company_name: null,
            source: null,
            notes: null,
        };

        it('should create a lead successfully', async () => {
            // Arrange
            mockedSupabase.from('leads').single.mockResolvedValue({ data: createdLeadRecord, error: null });

            // Act
            const result = await leadService.createLead(mockUserId, leadInput, mockAccessToken);

            // Assert
            expect(result).toEqual(createdLeadRecord);
            expect(mockedSupabase.auth.getUser).toHaveBeenCalledWith(mockAccessToken);
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').insert).toHaveBeenCalledWith(expectedDbInput);
            expect(mockedSupabase.from('leads').select).toHaveBeenCalledTimes(1);
            expect(mockedSupabase.from('leads').single).toHaveBeenCalledTimes(1);
        });

         it('should default status to \'New\' if not provided', async () => {
            // Arrange
            const inputWithoutStatus = { name: 'Another New Lead' };
            const expectedInputWithDefaultStatus = { ...inputWithoutStatus, user_id: mockUserId, status: 'New' };
            // Ensure the mock result has the correct, non-nullable status
            // Explicitly construct the result record to satisfy LeadRecord type
            const resultRecord: LeadRecord = {
                id: 'new-lead-uuid',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: mockUserId,
                name: expectedInputWithDefaultStatus.name,
                email: null,
                status: 'New',
                phone: null,
                company_name: null,
                source: null,
                notes: null,
            };
            mockedSupabase.from('leads').single.mockResolvedValue({ data: resultRecord, error: null });

            // Act
            await leadService.createLead(mockUserId, inputWithoutStatus, mockAccessToken);

            // Assert
            expect(mockedSupabase.from('leads').insert).toHaveBeenCalledWith(expectedInputWithDefaultStatus);
        });

        it('should throw an error if Supabase insert fails', async () => {
            // Arrange
            const dbError = { message: 'Insert failed', code: '23505', details: '', hint: '' }; // Example unique violation
            mockedSupabase.from('leads').single.mockResolvedValue({ data: null, error: dbError });

            // Act & Assert
            await expect(leadService.createLead(mockUserId, leadInput, mockAccessToken))
                .rejects.toThrow(/Database operation failed in createLead: Insert failed/);
        });

        it('should throw an error if Supabase returns no data after insert', async () => {
            // Arrange
            mockedSupabase.from('leads').single.mockResolvedValue({ data: null, error: null }); // Unexpected null data

            // Act & Assert
            await expect(leadService.createLead(mockUserId, leadInput, mockAccessToken))
                .rejects.toThrow('Failed to create lead, no data returned.');
        });

        it('should throw an error if auth fails', async () => {
            // Arrange
            const authError = { message: 'Invalid token', status: 401 };
            mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: authError as any });

            // Act & Assert
            await expect(leadService.createLead(mockUserId, leadInput, mockAccessToken))
                .rejects.toThrow('Invalid user or access token');
            expect(mockedSupabase.from).not.toHaveBeenCalled();
       });
    });

    // --- updateLead Tests ---
    describe('updateLead', () => {
        const leadId = mockLead1.id;
        const updateInput: LeadUpdateInput = {
            status: 'Unqualified',
            notes: 'Updated note.',
        };
        const updatedLeadRecord: LeadRecord = {
            ...mockLead1,
            ...updateInput,
            updated_at: new Date().toISOString(), // Should be updated
        };

        it('should update a lead successfully', async () => {
            // Arrange
            mockedSupabase.from('leads').single.mockResolvedValue({ data: updatedLeadRecord, error: null });

            // Act
            const result = await leadService.updateLead(mockUserId, leadId, updateInput, mockAccessToken);

            // Assert
            expect(result).toEqual(updatedLeadRecord);
            expect(mockedSupabase.auth.getUser).toHaveBeenCalledWith(mockAccessToken);
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').update).toHaveBeenCalledWith(updateInput);
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('id', leadId);
            expect(mockedSupabase.from('leads').select).toHaveBeenCalledTimes(1);
            expect(mockedSupabase.from('leads').single).toHaveBeenCalledTimes(1);
        });

        it('should return current lead if update input is empty', async () => {
            // Arrange: Mock getLeadById for the check
            mockedSupabase.from('leads').maybeSingle.mockResolvedValue({ data: mockLead1, error: null }); 

            // Act
            const result = await leadService.updateLead(mockUserId, leadId, {}, mockAccessToken);

            // Assert
            expect(result).toEqual(mockLead1);
            expect(mockedSupabase.from('leads').update).not.toHaveBeenCalled();
            // Ensure getLeadById was called internally
            expect(mockedSupabase.from('leads').maybeSingle).toHaveBeenCalledTimes(1);
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('id', leadId); // Check getLeadById call args
        });

        it('should throw error if lead not found when checking empty update', async () => {
            // Arrange: Mock getLeadById return null
            mockedSupabase.from('leads').maybeSingle.mockResolvedValue({ data: null, error: null });

            // Act & Assert
            await expect(leadService.updateLead(mockUserId, leadId, {}, mockAccessToken))
                 .rejects.toThrow('Lead not found or access denied for update check.');
            expect(mockedSupabase.from('leads').update).not.toHaveBeenCalled();
        });


        it('should throw an error if Supabase update fails', async () => {
            // Arrange
            const dbError = { message: 'Update failed', code: '500', details: '', hint: '' };
            mockedSupabase.from('leads').single.mockResolvedValue({ data: null, error: dbError });

            // Act & Assert
            await expect(leadService.updateLead(mockUserId, leadId, updateInput, mockAccessToken))
                .rejects.toThrow(/Database operation failed in updateLead: Update failed/);
        });

        it('should throw an error if Supabase returns no data after update (e.g., RLS/not found)', async () => {
            // Arrange
            mockedSupabase.from('leads').single.mockResolvedValue({ data: null, error: null }); // Update succeeded but returned null

            // Act & Assert
            await expect(leadService.updateLead(mockUserId, leadId, updateInput, mockAccessToken))
                .rejects.toThrow('Failed to update lead or lead not found.');
        });

         it('should throw an error if auth fails', async () => {
             // Arrange
             const authError = { message: 'Invalid token', status: 401 };
             mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: authError as any });

             // Act & Assert
             await expect(leadService.updateLead(mockUserId, leadId, updateInput, mockAccessToken))
                 .rejects.toThrow('Invalid user or access token');
             expect(mockedSupabase.from).not.toHaveBeenCalled();
        });
    });

    // --- deleteLead Tests ---
    describe('deleteLead', () => {
        const leadId = 'lead-to-delete-uuid';

        it('should delete a lead successfully and return true', async () => {
            // Arrange
            mockedSupabase.from('leads').delete.mockResolvedValue({ error: null, count: 1 });

            // Act
            const result = await leadService.deleteLead(mockUserId, leadId, mockAccessToken);

            // Assert
            expect(result).toBe(true);
            expect(mockedSupabase.auth.getUser).toHaveBeenCalledWith(mockAccessToken);
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').delete).toHaveBeenCalledWith({ count: 'exact' });
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockedSupabase.from('leads').eq).toHaveBeenCalledWith('id', leadId);
        });

        it('should return true if lead was not found (count 0)', async () => {
            // Arrange
            mockedSupabase.from('leads').delete.mockResolvedValue({ error: null, count: 0 });

            // Act
            const result = await leadService.deleteLead(mockUserId, leadId, mockAccessToken);

            // Assert
            expect(result).toBe(true);
            expect(mockedSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockedSupabase.from('leads').delete).toHaveBeenCalledTimes(1);
        });

        it('should return true even if RLS prevents delete (specific error message)', async () => {
             // Arrange
             const rlsError = { message: 'Row level security policy violation', code: '42501', details: '', hint: '' };
             mockedSupabase.from('leads').delete.mockResolvedValue({ error: rlsError, count: 0 });

             // Act
             const result = await leadService.deleteLead(mockUserId, leadId, mockAccessToken);

             // Assert
             expect(result).toBe(true); // Consider RLS violation as non-fatal for this return value
             expect(mockedSupabase.from('leads').delete).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if Supabase delete fails with other error', async () => {
            // Arrange
            const dbError = { message: 'Delete failed unexpectedly', code: '500', details: '', hint: '' };
            mockedSupabase.from('leads').delete.mockResolvedValue({ error: dbError, count: null });

            // Act & Assert
            await expect(leadService.deleteLead(mockUserId, leadId, mockAccessToken))
                .rejects.toThrow(/Database operation failed in deleteLead: Delete failed unexpectedly/);
        });

        it('should throw an error if auth fails', async () => {
            // Arrange
            const authError = { message: 'Invalid token', status: 401 };
            mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: authError as any });

            // Act & Assert
            await expect(leadService.deleteLead(mockUserId, leadId, mockAccessToken))
                .rejects.toThrow('Invalid user or access token');
            expect(mockedSupabase.from).not.toHaveBeenCalled();
        });
    });
}); 