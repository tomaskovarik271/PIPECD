import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { supabase } from './supabaseClient'; // The actual client
// Import named service functions and types directly
import { 
    getLeads, 
    getLeadById, 
    createLead, 
    updateLead, 
    deleteLead, 
    type LeadRecord, 
    type LeadInput, 
    type LeadUpdateInput 
} from './leadService'; 
// Re-add Supabase User import if needed for mockUser type safety
import type { User } from '@supabase/supabase-js';

// --- Mock Supabase Client ---
vi.mock('./supabaseClient');

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
    auth: {
        getUser: vi.fn()
    }
};

// --- Test Data ---
const mockUserId = 'user-test-123';
// Use the imported User type for mockUser
const mockUser: User = { 
    id: mockUserId, 
    email: 'test@example.com', 
    app_metadata: {}, 
    user_metadata: {}, 
    aud: 'authenticated', 
    created_at: new Date().toISOString(),
    phone: '' 
};

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
        // Reset and configure mocks before each test
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

    // --- getLeads Tests ---
    describe('getLeads', () => {
        it('should fetch leads for a user successfully', async () => {
            // Arrange
            const mockLeads = [mockLead1, mockLead2];
            mockSupabaseClient.select.mockReturnThis(); // Make select chainable
            mockSupabaseClient.eq.mockReturnThis(); // Make eq chainable
            // Mock the terminal method (.order resolves the promise)
            mockSupabaseClient.order.mockResolvedValue({ data: mockLeads, error: null });

            // Act
            // Call the imported function directly
            const result = await getLeads(mockSupabaseClient as any, mockUserId);

            // Assert
            expect(result).toEqual(mockLeads);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('should return an empty array if no leads are found', async () => {
            // Arrange
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.order.mockResolvedValue({ data: [], error: null });

            // Act
            const result = await getLeads(mockSupabaseClient as any, mockUserId);

            // Assert
            expect(result).toEqual([]);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('should throw an error if Supabase select fails', async () => {
            // Arrange
            const dbError = { message: 'Select failed', code: '500', details: '', hint: '' };
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.order.mockResolvedValue({ data: null, error: dbError });

            // Act & Assert
            await expect(getLeads(mockSupabaseClient as any, mockUserId))
                .rejects.toThrow(/Database operation failed in getLeads: Select failed/);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        // Auth tests removed as auth is handled by context/RLS now
    });

    // --- getLeadById Tests ---
    describe('getLeadById', () => {
        const leadId = mockLead1.id;

        it('should fetch a single lead by ID successfully', async () => {
            // Arrange
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis(); // First eq
            mockSupabaseClient.eq.mockReturnThis(); // Second eq
            mockSupabaseClient.maybeSingle.mockResolvedValue({ data: mockLead1, error: null });

            // Act
            const result = await getLeadById(mockSupabaseClient as any, mockUserId, leadId);

            // Assert
            expect(result).toEqual(mockLead1);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.maybeSingle).toHaveBeenCalledTimes(1);
        });

        it('should return null if lead is not found', async () => {
            // Arrange
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error: null });

            // Act
            const result = await getLeadById(mockSupabaseClient as any, mockUserId, 'non-existent-id');

            // Assert
            expect(result).toBeNull();
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'non-existent-id');
            expect(mockSupabaseClient.maybeSingle).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if Supabase maybeSingle fails', async () => {
            // Arrange
            const dbError = { message: 'maybeSingle failed', code: '500', details: '', hint: '' };
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error: dbError });

            // Act & Assert
            await expect(getLeadById(mockSupabaseClient as any, mockUserId, leadId))
                .rejects.toThrow(/Database operation failed in getLeadById: maybeSingle failed/);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.maybeSingle).toHaveBeenCalledTimes(1);
        });

        // Auth tests removed
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
            mockSupabaseClient.insert.mockReturnThis();
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.single.mockResolvedValue({ data: createdLeadRecord, error: null });

            // Act
            const result = await createLead(mockSupabaseClient as any, mockUserId, leadInput);

            // Assert
            expect(result).toEqual(createdLeadRecord);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput);
            expect(mockSupabaseClient.select).toHaveBeenCalledTimes(1);
            expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
        });

         it('should default status to \'New\' if not provided', async () => {
            // Arrange
            const inputWithoutStatus = { name: 'Another New Lead' };
            const expectedInputWithDefaultStatus = { ...inputWithoutStatus, user_id: mockUserId, status: 'New' };
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
            mockSupabaseClient.insert.mockReturnThis();
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.single.mockResolvedValue({ data: resultRecord, error: null });

            // Act
            await createLead(mockSupabaseClient as any, mockUserId, inputWithoutStatus);

            // Assert
            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedInputWithDefaultStatus);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.select).toHaveBeenCalledTimes(1);
            expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if Supabase insert fails', async () => {
            // Arrange
            const dbError = { message: 'Insert failed', code: '23505', details: '', hint: '' };
            mockSupabaseClient.insert.mockReturnThis();
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.single.mockResolvedValue({ data: null, error: dbError });

            // Act & Assert
            await expect(createLead(mockSupabaseClient as any, mockUserId, leadInput))
                .rejects.toThrow(/Database operation failed in createLead: Duplicate value detected./);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput);
            expect(mockSupabaseClient.select).toHaveBeenCalledTimes(1);
            expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if Supabase returns no data after insert', async () => {
            // Arrange
            mockSupabaseClient.insert.mockReturnThis();
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });

            // Act & Assert
            await expect(createLead(mockSupabaseClient as any, mockUserId, leadInput))
                .rejects.toThrow('Failed to create lead, no data returned.');
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput);
            expect(mockSupabaseClient.select).toHaveBeenCalledTimes(1);
            expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
        });

       // Auth tests removed
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
            updated_at: new Date().toISOString(),
        };

        it('should update a lead successfully', async () => {
            // Arrange
            mockSupabaseClient.update.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis(); // First eq
            mockSupabaseClient.eq.mockReturnThis(); // Second eq
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.single.mockResolvedValue({ data: updatedLeadRecord, error: null });

            // Act
            const result = await updateLead(mockSupabaseClient as any, mockUserId, leadId, updateInput);

            // Assert
            expect(result).toEqual(updatedLeadRecord);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateInput);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.select).toHaveBeenCalledTimes(1);
            expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
        });

        it('should throw error if lead not found during update (or RLS prevents)', async () => {
            // Arrange
            mockSupabaseClient.update.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
            const testUpdateInput: LeadUpdateInput = { name: 'Should not matter' }; // Use a specific input for this test

            // Act & Assert
            await expect(updateLead(mockSupabaseClient as any, mockUserId, leadId, testUpdateInput))
                 .rejects.toThrow('Failed to update lead or lead not found.');
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            // Verify update was still CALLED with the input object, even if it failed later
            expect(mockSupabaseClient.update).toHaveBeenCalledWith(testUpdateInput);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.select).toHaveBeenCalledTimes(1);
            expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
        });

         it('should throw an error if update input is empty', async () => {
            // Act & Assert
            // Ensure NO supabase methods are called due to the service's input validation
            await expect(updateLead(mockSupabaseClient as any, mockUserId, leadId, {}))
                 .rejects.toThrow('Update input cannot be empty.');
            expect(mockSupabaseClient.from).not.toHaveBeenCalled();
            expect(mockSupabaseClient.update).not.toHaveBeenCalled();
        });

        it('should throw an error if Supabase update fails', async () => {
            // Arrange
            const dbError = { message: 'Update failed', code: '500', details: '', hint: '' };
            mockSupabaseClient.update.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.eq.mockReturnThis();
            mockSupabaseClient.select.mockReturnThis();
            mockSupabaseClient.single.mockResolvedValue({ data: null, error: dbError });
            const specificUpdateInput = { notes: "Trying failed update" }; // Use specific input

            // Act & Assert
            await expect(updateLead(mockSupabaseClient as any, mockUserId, leadId, specificUpdateInput))
                .rejects.toThrow(/Database operation failed in updateLead: Update failed/);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            // Verify update was called with the input object
            expect(mockSupabaseClient.update).toHaveBeenCalledWith(specificUpdateInput);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.select).toHaveBeenCalledTimes(1);
            expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
        });

         // Auth tests removed
    });

    // --- deleteLead Tests ---
    describe('deleteLead', () => {
        const leadId = 'lead-to-delete-uuid';

        it('should delete a lead successfully and return true', async () => {
            // Arrange
            mockSupabaseClient.delete.mockReturnThis(); // delete returns this
            // eq('id', ...) resolves the value
             mockSupabaseClient.eq.mockResolvedValueOnce({ error: null, count: 1 });

            // Act
            const result = await deleteLead(mockSupabaseClient as any, leadId);

            // Assert
            expect(result).toBe(true);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
            // Only expect eq for id
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledTimes(1); // Ensure only called once
        });

        it('should return false if lead was not found (count 0)', async () => {
            // Arrange
            mockSupabaseClient.delete.mockReturnThis();
            mockSupabaseClient.eq.mockResolvedValueOnce({ error: null, count: 0 });

            // Act
            const result = await deleteLead(mockSupabaseClient as any, leadId);

            // Assert
            expect(result).toBe(false);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
            expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
            // Only expect eq for id
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledTimes(1);
        });

        it('should return false if RLS prevents delete', async () => {
             // Arrange
             const rlsError = { message: 'Row level security policy violation', code: '42501', details: '', hint: '' };
             mockSupabaseClient.delete.mockReturnThis();
             mockSupabaseClient.eq.mockResolvedValueOnce({ error: rlsError, count: 0 }); // RLS error, count is 0
             // Act
             const result = await deleteLead(mockSupabaseClient as any, leadId);

             // Assert: Expect false because the service function returns count === 1
             expect(result).toBe(false);
             expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
             expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
             // Only expect eq for id
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledTimes(1);
            // DO NOT expect handleSupabaseError to have thrown
        });

        it('should throw an error if Supabase delete fails with other error', async () => {
            // Arrange
            const dbError = { message: 'Delete failed unexpectedly', code: '500', details: '', hint: '' };
            mockSupabaseClient.delete.mockReturnThis();
            // eq resolves with the error
            mockSupabaseClient.eq.mockResolvedValueOnce({ error: dbError, count: null });
            // Act & Assert
            // Expect the service's handleSupabaseError to throw
            await expect(deleteLead(mockSupabaseClient as any, leadId))
                .rejects.toThrow('Database operation failed in deleteLead: Delete failed unexpectedly');
             expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
             expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
             // Only expect eq for id
            expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', leadId);
            expect(mockSupabaseClient.eq).toHaveBeenCalledTimes(1);
        });

        // Auth tests removed
    });
}); 