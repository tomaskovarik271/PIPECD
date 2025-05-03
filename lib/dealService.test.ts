import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  dealService, // Import the service object
  type DealRecord, // Import types from the service file
  type DealInput,
  type DealUpdateInput
} from './dealService';

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

describe('dealService', () => {
  const mockUserId = 'user-deal-test-123';

  const mockDeal: DealRecord = {
    id: 'deal1',
    user_id: mockUserId,
    name: 'Test Deal 1',
    amount: 1000,
    stage: 'Prospecting',
    person_id: 'person1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const mockDealList: DealRecord[] = [
    mockDeal,
    {
      id: 'deal2',
      user_id: mockUserId,
      name: 'Test Deal 2',
      amount: 500,
      stage: 'Closed Won',
      person_id: 'person2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  describe('getDeals', () => {
    it('should return a list of deals', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis(); // Make select chainable
      mockSupabaseClient.order.mockResolvedValue({ data: mockDealList, error: null });

      // Act
      const result = await dealService.getDeals(mockSupabaseClient as any);

      // Assert
      expect(result).toEqual(mockDealList);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should throw an error if Supabase query fails', async () => {
      // Arrange
      const error = { message: 'DB error', code: '500', details: '', hint: '' };
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.order.mockResolvedValue({ data: null, error });

      // Act & Assert
      await expect(dealService.getDeals(mockSupabaseClient as any)).rejects.toThrow(
        'Database operation failed in getDeals: DB error'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
       expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('getDealById', () => {
    it('should return a deal if found', async () => {
      // Arrange
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.maybeSingle.mockResolvedValue({ data: mockDeal, error: null });

      // Act
      const result = await dealService.getDealById(mockSupabaseClient as any, 'deal1');

      // Assert
      expect(result).toEqual(mockDeal);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'deal1');
      expect(mockSupabaseClient.maybeSingle).toHaveBeenCalled();
    });

    it('should return null if deal not found', async () => {
        // Arrange
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.eq.mockReturnThis();
        mockSupabaseClient.maybeSingle.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await dealService.getDealById(mockSupabaseClient as any, 'nonexistent');

        // Assert
        expect(result).toBeNull();
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
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
      await expect(dealService.getDealById(mockSupabaseClient as any, 'deal1')).rejects.toThrow(
        'Database operation failed in getDealById: DB error'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'deal1');
       expect(mockSupabaseClient.maybeSingle).toHaveBeenCalled();
    });
  });

  describe('createDeal', () => {
    const dealInput: DealInput = {
      name: 'New Deal',
      amount: 2500,
      stage: 'Negotiation',
      person_id: 'person3',
    };
    const expectedDbInput = { ...dealInput, user_id: mockUserId };
    const createdDeal: DealRecord = {
      id: 'deal3',
      user_id: mockUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: dealInput.name,
      amount: dealInput.amount ?? null,
      stage: dealInput.stage,
      person_id: dealInput.person_id ?? null,
    };

    it('should create and return a new deal', async () => {
      // Arrange
      mockSupabaseClient.insert.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: createdDeal, error: null });

      // Act
      const result = await dealService.createDeal(mockSupabaseClient as any, mockUserId, dealInput);

      // Assert
      expect(result).toEqual(createdDeal);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput);
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
      await expect(dealService.createDeal(mockSupabaseClient as any, mockUserId, dealInput)).rejects.toThrow(
        'Database operation failed in createDeal: Insert failed'
      );
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
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
         await expect(dealService.createDeal(mockSupabaseClient as any, mockUserId, dealInput)).rejects.toThrow(
             'Failed to create deal, no data returned.'
         );
         expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
         expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expectedDbInput);
         expect(mockSupabaseClient.select).toHaveBeenCalledWith();
         expect(mockSupabaseClient.single).toHaveBeenCalled();
     });
  });

  describe('updateDeal', () => {
    const dealUpdate: DealUpdateInput = { stage: 'Closed Lost', amount: 900 };
    const updatedDeal: DealRecord = { ...mockDeal, ...dealUpdate, updated_at: new Date().toISOString() };

    it('should update and return the deal', async () => {
      // Arrange
      mockSupabaseClient.update.mockReturnThis();
      mockSupabaseClient.eq.mockReturnThis();
      mockSupabaseClient.select.mockReturnThis();
      mockSupabaseClient.single.mockResolvedValue({ data: updatedDeal, error: null });

      // Act
      const result = await dealService.updateDeal(mockSupabaseClient as any, 'deal1', dealUpdate);

      // Assert
      expect(result).toEqual(updatedDeal);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(dealUpdate);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'deal1');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
    });

    it('should return null if deal to update is not found or RLS prevents', async () => {
        // Arrange
        mockSupabaseClient.update.mockReturnThis();
        mockSupabaseClient.eq.mockReturnThis();
        mockSupabaseClient.select.mockReturnThis();
        mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });

        // Act
        const result = await dealService.updateDeal(mockSupabaseClient as any, 'nonexistent', dealUpdate);

        // Assert
        expect(result).toBeNull();
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
        expect(mockSupabaseClient.update).toHaveBeenCalledWith(dealUpdate);
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
      await expect(dealService.updateDeal(mockSupabaseClient as any, 'deal1', dealUpdate)).rejects.toThrow(
        'Database operation failed in updateDeal: Update failed'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
       expect(mockSupabaseClient.update).toHaveBeenCalledWith(dealUpdate);
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'deal1');
       expect(mockSupabaseClient.select).toHaveBeenCalledWith();
       expect(mockSupabaseClient.single).toHaveBeenCalled();
    });
  });

  describe('deleteDeal', () => {
    it('should delete the deal and return true if count > 0', async () => {
       // Arrange
       mockSupabaseClient.delete.mockReturnThis(); // delete returns this
       mockSupabaseClient.eq.mockResolvedValue({ error: null, count: 1 }); // eq resolves the promise

       // Act
       const result = await dealService.deleteDeal(mockSupabaseClient as any, 'deal1');

       // Assert
       expect(result).toBe(true);
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' }); // Delete called first
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'deal1'); // eq called second
    });

    it('should return false if deal to delete is not found (count is 0)', async () => {
        // Arrange
        mockSupabaseClient.delete.mockReturnThis(); // delete returns this
        mockSupabaseClient.eq.mockResolvedValue({ error: null, count: 0 }); // eq resolves the promise

        // Act
        const result = await dealService.deleteDeal(mockSupabaseClient as any, 'nonexistent');

        // Assert
        expect(result).toBe(false);
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'nonexistent');
    });

     it('should return true if RLS prevents delete (error code 42501)', async () => {
       // Arrange
       const rlsError = { message: 'RLS violation', code: '42501', details: '', hint: '' };
       mockSupabaseClient.delete.mockReturnThis(); // delete returns this
       mockSupabaseClient.eq.mockResolvedValue({ error: rlsError, count: 0 }); // eq resolves the promise

       // Act
       const result = await dealService.deleteDeal(mockSupabaseClient as any, 'deal1');

       // Assert
       expect(result).toBe(false);
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'deal1');
   });

    it('should throw an error if Supabase delete fails with non-RLS error', async () => {
      // Arrange
      const deleteError = { message: 'Delete failed', code: '500', details: '', hint: '' };
      mockSupabaseClient.delete.mockReturnThis(); // delete returns this
      mockSupabaseClient.eq.mockResolvedValue({ error: deleteError, count: null }); // eq resolves the promise

      // Act & Assert
      await expect(dealService.deleteDeal(mockSupabaseClient as any, 'deal1')).rejects.toThrow(
        'Database operation failed in deleteDeal: Delete failed'
      );
       expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
       expect(mockSupabaseClient.delete).toHaveBeenCalledWith({ count: 'exact' });
       expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'deal1');
    });
  });
}); 