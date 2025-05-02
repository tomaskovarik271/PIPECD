import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { HandlerEvent, HandlerContext } from '@netlify/functions'; // Import Netlify types

// Mock dependencies BEFORE importing the module under test
vi.mock('../../lib/contactService', () => ({
  contactService: {
    getContacts: vi.fn(),
    getContactById: vi.fn(),
    createContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn(),
    getContactListForUser: vi.fn(),
  },
}));

vi.mock('../../lib/dealService', () => ({
  dealService: {
    getDeals: vi.fn(),
    getDealById: vi.fn(),
    createDeal: vi.fn(),
    updateDeal: vi.fn(),
    deleteDeal: vi.fn(),
    // getDealsByContactId: vi.fn(), // If added later
  },
}));

// Remove this mock, it's not directly imported by graphql.ts
// vi.mock('inngest/netlify', () => ({
//   serve: vi.fn(), 
// }));

// Adjust mock path to target the local file importing/exporting inngest client
vi.mock('./inngest', () => ({ 
  inngest: {
    send: vi.fn(), // Mock the inngest send method
  },
}));

// Import the parts needed from graphql.ts AFTER mocks are set up
import { resolvers } from './graphql'; // Assuming resolvers are exported
import type { GraphQLContext } from './graphql'; // Assuming context type is exported

// --- Mock Data & Context --- 

// More complete mock User matching the @supabase/supabase-js type
const mockUser: User = {
  id: 'user-gql-test-123',
  aud: 'authenticated',
  role: 'authenticated', // or specific role if needed
  email: 'test@example.com',
  phone: '', // Add other fields as needed by tests or context factory
  created_at: new Date().toISOString(),
  app_metadata: { provider: 'email' }, // Example metadata
  user_metadata: { name: 'Test User' }, // Example metadata
  identities: [],
  factors: [],
  updated_at: new Date().toISOString(),
};

// Mock Request object (simplified)
const mockRequest = {
    headers: new Headers(),
} as Request;

// Mock Netlify event/context (simplified)
const mockNetlifyEvent = {} as HandlerEvent;
const mockNetlifyContext = {} as HandlerContext;

// Correct mock context matching GraphQLContext type
const mockAuthenticatedContext: GraphQLContext = {
  currentUser: mockUser, // Not a promise here, context factory resolves it
  request: new Request('http://localhost', { // Need a realistic Request object
      headers: { 'authorization': 'Bearer mock-token' } 
  }),
  event: mockNetlifyEvent,
  context: mockNetlifyContext,
  // Remove inngest and token
};

const mockUnauthenticatedContext: GraphQLContext = {
  currentUser: null,
  request: new Request('http://localhost'), // Request without auth header
  event: mockNetlifyEvent,
  context: mockNetlifyContext,
  // Remove inngest and token
};

// Type helper for mocked services
type MockedContactService = typeof import('../../lib/contactService').contactService;
type MockedDealService = typeof import('../../lib/dealService').dealService;

describe('GraphQL Resolvers', () => {
  let mockContactService: MockedContactService;
  let mockDealService: MockedDealService;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get references to the mocked services using async import
    const contactServiceModule = await import('../../lib/contactService.js');
    mockContactService = contactServiceModule.contactService as MockedContactService;
    const dealServiceModule = await import('../../lib/dealService.js');
    mockDealService = dealServiceModule.dealService as MockedDealService;
  });

  // --- Query Resolvers --- 

  describe('Query.contacts', () => {
    it('should call contactService.getContacts and return contacts for authenticated user', async () => {
      const mockContacts = [{ id: 'c1', first_name: 'Test' }];
      vi.mocked(mockContactService.getContacts).mockResolvedValue(mockContacts);

      const result = await resolvers.Query.contacts!(
        null, 
        {}, 
        mockAuthenticatedContext
      );

      expect(result).toEqual(mockContacts);
      expect(mockContactService.getContacts).toHaveBeenCalledWith(mockUser.id, 'mock-token'); 
    });

    it('should throw an error if user is not authenticated', async () => {
      await expect(resolvers.Query.contacts!(
        null, 
        {}, 
        mockUnauthenticatedContext
      )).rejects.toThrow('Not authenticated');
      expect(mockContactService.getContacts).not.toHaveBeenCalled();
    });

     it('should forward errors from contactService', async () => {
        const serviceError = new Error('Service Failure');
        vi.mocked(mockContactService.getContacts).mockRejectedValue(serviceError);

        await expect(resolvers.Query.contacts!(null, {}, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });
  
  describe('Query.deals', () => {
    it('should call dealService.getDeals and return deals for authenticated user', async () => {
      // Provide more complete mock data matching DealRecord type
      const mockDeals = [{
           id: 'd1', 
           name: 'Test Deal', 
           stage: 'Lead', 
           amount: 1000, 
           user_id: mockUser.id, 
           created_at: new Date().toISOString(), 
           updated_at: new Date().toISOString() 
      }];
      vi.mocked(mockDealService.getDeals).mockResolvedValue(mockDeals);

      const result = await resolvers.Query.deals!(
        null,
        {},
        mockAuthenticatedContext
      );

      expect(result).toEqual(mockDeals);
      expect(mockDealService.getDeals).toHaveBeenCalledWith(mockUser.id, 'mock-token'); 
    });

    it('should throw an error if user is not authenticated', async () => {
      await expect(resolvers.Query.deals!(
        null, 
        {}, 
        mockUnauthenticatedContext
      )).rejects.toThrow('Not authenticated'); 
      expect(mockDealService.getDeals).not.toHaveBeenCalled();
    });

     it('should forward errors from dealService', async () => {
        const serviceError = new Error('Deal Service Failure');
        vi.mocked(mockDealService.getDeals).mockRejectedValue(serviceError);

        await expect(resolvers.Query.deals!(null, {}, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });

  describe('Query.contact', () => {
    const contactId = 'contact-gql-test-1';
    const args = { id: contactId };

    it('should call contactService.getContactById and return contact', async () => {
      const mockContact = { 
          id: contactId, 
          first_name: 'Single', 
          user_id: mockUser.id, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
      };
      vi.mocked(mockContactService.getContactById).mockResolvedValue(mockContact);

      const result = await resolvers.Query.contact!(null, args, mockAuthenticatedContext);

      expect(result).toEqual(mockContact);
      expect(mockContactService.getContactById).toHaveBeenCalledWith(mockUser.id, contactId, 'mock-token');
    });

     it('should return null if contact service returns null (not found)', async () => {
        vi.mocked(mockContactService.getContactById).mockResolvedValue(null);
        const result = await resolvers.Query.contact!(null, args, mockAuthenticatedContext);
        expect(result).toBeNull();
    });

    it('should throw error if user is not authenticated', async () => {
      await expect(resolvers.Query.contact!(null, args, mockUnauthenticatedContext))
        .rejects.toThrow('Not authenticated');
      expect(mockContactService.getContactById).not.toHaveBeenCalled();
    });

     it('should forward errors from contactService', async () => {
        const serviceError = new Error('Service Failure for getContactById');
        vi.mocked(mockContactService.getContactById).mockRejectedValue(serviceError);
        await expect(resolvers.Query.contact!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });

  describe('Query.deal', () => {
    const dealId = 'deal-gql-test-1';
    const args = { id: dealId };

    it('should call dealService.getDealById and return deal', async () => {
      const mockDeal = { 
          id: dealId, 
          name: 'Single Deal', 
          stage: 'Closed Won',
          user_id: mockUser.id, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
      };
      vi.mocked(mockDealService.getDealById).mockResolvedValue(mockDeal);

      const result = await resolvers.Query.deal!(null, args, mockAuthenticatedContext);

      expect(result).toEqual(mockDeal);
      expect(mockDealService.getDealById).toHaveBeenCalledWith(mockUser.id, dealId, 'mock-token');
    });

     it('should return null if deal service returns null (not found)', async () => {
        vi.mocked(mockDealService.getDealById).mockResolvedValue(null);
        const result = await resolvers.Query.deal!(null, args, mockAuthenticatedContext);
        expect(result).toBeNull();
    });

    it('should throw error if user is not authenticated', async () => {
      await expect(resolvers.Query.deal!(null, args, mockUnauthenticatedContext))
        .rejects.toThrow('Not authenticated');
      expect(mockDealService.getDealById).not.toHaveBeenCalled();
    });

     it('should forward errors from dealService', async () => {
        const serviceError = new Error('Service Failure for getDealById');
        vi.mocked(mockDealService.getDealById).mockRejectedValue(serviceError);
        await expect(resolvers.Query.deal!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });

  // --- TODO: Add tests for Deal Contact resolver --- 

  // --- Mutation Resolvers --- 

  describe('Mutation.createContact', () => {
    const input = { first_name: 'New', last_name: 'Contact Mutation', email: 'mut@test.com' };
    const args = { input };
    const expectedRecord = { 
      id: 'new-mut-id', 
      ...input, 
      user_id: mockUser.id, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString()
    };

    it('should call contactService.createContact and return new contact', async () => {
      vi.mocked(mockContactService.createContact).mockResolvedValue(expectedRecord);
      // Mock inngest send separately if needed, but resolver doesn't wait for it
      const mockInngest = await import('./inngest.js');
      vi.mocked(mockInngest.inngest.send).mockResolvedValue({ ids: ['event-id'] }); // Mock successful send

      const result = await resolvers.Mutation.createContact!(null, args, mockAuthenticatedContext);

      expect(result).toEqual(expectedRecord);
      expect(mockContactService.createContact).toHaveBeenCalledWith(mockUser.id, input, 'mock-token');
      // Check Inngest was called
      expect(mockInngest.inngest.send).toHaveBeenCalledWith({
          name: 'crm/contact.created',
          data: {
              contactId: expectedRecord.id,
              email: expectedRecord.email,
              firstName: expectedRecord.first_name,
          },
          user: { 
              id: mockUser.id,
              email: mockUser.email,
          }
      });
    });

    it('should throw error if user is not authenticated', async () => {
      await expect(resolvers.Mutation.createContact!(null, args, mockUnauthenticatedContext))
        .rejects.toThrow('Not authenticated');
      expect(mockContactService.createContact).not.toHaveBeenCalled();
      const mockInngest = await import('./inngest.js');
      expect(mockInngest.inngest.send).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid input', async () => {
        const invalidArgs = { input: { email: 'not-an-email' } }; // Missing required fields/invalid format
        await expect(resolvers.Mutation.createContact!(null, invalidArgs, mockAuthenticatedContext)).rejects.toThrow(/"validation": "email"/);
    });

    it('should forward errors from contactService (before inngest send)', async () => {
        const serviceError = new Error('Create Service Failure');
        vi.mocked(mockContactService.createContact).mockRejectedValue(serviceError);
        const mockInngest = await import('./inngest.js');

        await expect(resolvers.Mutation.createContact!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
        expect(mockInngest.inngest.send).not.toHaveBeenCalled(); // Should not be called if service fails
    });

    it('should still return contact even if inngest send fails (logs error)', async () => {
        vi.mocked(mockContactService.createContact).mockResolvedValue(expectedRecord);
        const inngestError = new Error('Inngest Send Failed');
        const mockInngest = await import('./inngest.js');
        vi.mocked(mockInngest.inngest.send).mockRejectedValue(inngestError);
        // Spy on console.error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await resolvers.Mutation.createContact!(null, args, mockAuthenticatedContext);

        expect(result).toEqual(expectedRecord); // Still returns the contact
        expect(mockContactService.createContact).toHaveBeenCalledTimes(1);
        expect(mockInngest.inngest.send).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith("Failed to send Inngest event:", inngestError);

        consoleSpy.mockRestore(); // Clean up spy
    });

  });

  describe('Mutation.createDeal', () => {
    const input = { 
      name: 'New Deal Mutation', 
      stage: 'Lead', 
      amount: 5000, 
      contact_id: '123e4567-e89b-12d3-a456-426614174000' // Use valid UUID
    };
    const args = { input };
    // Ensure date fields match the expected DealRecord type (string)
    const now = new Date();
    const mockNewDeal = { 
      ...input, 
      id: 'new-deal-mut-id', 
      created_at: now.toISOString(), 
      updated_at: now.toISOString(), 
      user_id: mockUser.id 
    };

    it('should call dealService.createDeal and return new deal', async () => {
      vi.mocked(mockDealService.createDeal).mockResolvedValue(mockNewDeal);
      const mockInngest = await import('./inngest.js');
      vi.mocked(mockInngest.inngest.send).mockResolvedValue({ ids: ['event-id-deal'] });

      const result = await resolvers.Mutation.createDeal!(null, args, mockAuthenticatedContext);

      expect(result).toEqual(mockNewDeal);
      expect(mockDealService.createDeal).toHaveBeenCalledWith(mockUser.id, input, 'mock-token');
      expect(mockInngest.inngest.send).toHaveBeenCalledWith({
          name: 'crm/deal.created',
          data: {
              dealId: mockNewDeal.id,
              name: mockNewDeal.name,
              stage: mockNewDeal.stage,
              amount: mockNewDeal.amount,
              contactId: mockNewDeal.contact_id,
          },
          user: { 
              id: mockUser.id,
              email: mockUser.email,
          }
      });
    });

    it('should throw error if user is not authenticated', async () => {
      await expect(resolvers.Mutation.createDeal!(null, args, mockUnauthenticatedContext))
        .rejects.toThrow('Not authenticated');
      expect(mockDealService.createDeal).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid input', async () => {
        const invalidArgs = { input: { name: '', amount: -100 } }; // Missing stage, empty name
        await expect(resolvers.Mutation.createDeal!(null, invalidArgs, mockAuthenticatedContext)).rejects.toThrow(/"code": "too_small"/); // Check for specific Zod code
    });

    it('should forward errors from dealService (before inngest send)', async () => {
        const serviceError = new Error('Create Deal Service Failure');
        vi.mocked(mockDealService.createDeal).mockRejectedValue(serviceError);
        const mockInngest = await import('./inngest.js');

        await expect(resolvers.Mutation.createDeal!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
        expect(mockInngest.inngest.send).not.toHaveBeenCalled();
    });

     it('should still return deal even if inngest send fails (logs error)', async () => {
        vi.mocked(mockDealService.createDeal).mockResolvedValue(mockNewDeal);
        const inngestError = new Error('Inngest Send Failed');
        const mockInngest = await import('./inngest.js');
        vi.mocked(mockInngest.inngest.send).mockRejectedValue(inngestError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await resolvers.Mutation.createDeal!(null, args, mockAuthenticatedContext);

        expect(result).toEqual(mockNewDeal); 
        expect(mockDealService.createDeal).toHaveBeenCalledTimes(1);
        expect(mockInngest.inngest.send).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith("Failed to send Inngest event for deal creation:", inngestError);

        consoleSpy.mockRestore();
    });

  });

  describe('Mutation.updateContact', () => {
    const contactIdToUpdate = 'contact-mut-update-1';
    const input = { first_name: 'Updated Name' }; // Only update first name
    const args = { id: contactIdToUpdate, input };
    const expectedUpdatedRecord = { 
        id: contactIdToUpdate, 
        first_name: 'Updated Name', 
        last_name: 'Existing', // Assume other fields exist
        email: 'existing@test.com',
        user_id: mockUser.id, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
    };

    it('should call contactService.updateContact and return updated contact', async () => {
        vi.mocked(mockContactService.updateContact).mockResolvedValue(expectedUpdatedRecord);
        const result = await resolvers.Mutation.updateContact!(null, args, mockAuthenticatedContext);
        expect(result).toEqual(expectedUpdatedRecord);
        expect(mockContactService.updateContact).toHaveBeenCalledWith(mockUser.id, contactIdToUpdate, input, 'mock-token');
    });

    it('should throw error if user is not authenticated', async () => {
        await expect(resolvers.Mutation.updateContact!(null, args, mockUnauthenticatedContext))
            .rejects.toThrow('Not authenticated');
        expect(mockContactService.updateContact).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid input', async () => {
        const invalidArgs = { id: contactIdToUpdate, input: { first_name: '' } }; // Empty first name might be invalid if required
        await expect(resolvers.Mutation.updateContact!(null, invalidArgs, mockAuthenticatedContext)).rejects.toThrow(/"code": "too_small"/);
    });

    it('should forward errors from contactService', async () => {
        const serviceError = new Error('Update Contact Service Failure');
        vi.mocked(mockContactService.updateContact).mockRejectedValue(serviceError);
        await expect(resolvers.Mutation.updateContact!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });

  describe('Mutation.updateDeal', () => {
    const dealIdToUpdate = 'deal-mut-update-1';
    const input = { name: 'Updated Deal Mut', stage: 'Proposal' }; // Update name and stage
    const args = { id: dealIdToUpdate, input };
    const expectedUpdatedRecord = { 
        id: dealIdToUpdate, 
        ...input, 
        amount: 1234, // Assume existing
        contact_id: null, // Assume existing
        user_id: mockUser.id, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
    };

    it('should call dealService.updateDeal and return updated deal', async () => {
        vi.mocked(mockDealService.updateDeal).mockResolvedValue(expectedUpdatedRecord);
        const result = await resolvers.Mutation.updateDeal!(null, args, mockAuthenticatedContext);
        expect(result).toEqual(expectedUpdatedRecord);
        expect(mockDealService.updateDeal).toHaveBeenCalledWith(mockUser.id, dealIdToUpdate, input, 'mock-token');
    });

    it('should throw error if user is not authenticated', async () => {
        await expect(resolvers.Mutation.updateDeal!(null, args, mockUnauthenticatedContext))
            .rejects.toThrow('Not authenticated');
        expect(mockDealService.updateDeal).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid input', async () => {
        const invalidArgs = { id: dealIdToUpdate, input: { name: '', stage: null } }; // Empty name, missing stage
        await expect(resolvers.Mutation.updateDeal!(null, invalidArgs, mockAuthenticatedContext)).rejects.toThrow(/"code": "too_small"/); // Check for specific Zod code
    });

    it('should forward errors from dealService', async () => {
        const serviceError = new Error('Update Deal Service Failure');
        vi.mocked(mockDealService.updateDeal).mockRejectedValue(serviceError);
        await expect(resolvers.Mutation.updateDeal!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });

  describe('Mutation.deleteContact', () => {
    const contactIdToDelete = 'contact-mut-delete-1';
    const args = { id: contactIdToDelete };

    it('should call contactService.deleteContact and return result', async () => {
        vi.mocked(mockContactService.deleteContact).mockResolvedValue(true);
        const result = await resolvers.Mutation.deleteContact!(null, args, mockAuthenticatedContext);
        expect(result).toBe(true);
        expect(mockContactService.deleteContact).toHaveBeenCalledWith(mockUser.id, contactIdToDelete, 'mock-token');
    });

    it('should return false if service returns false', async () => {
        vi.mocked(mockContactService.deleteContact).mockResolvedValue(false);
        const result = await resolvers.Mutation.deleteContact!(null, args, mockAuthenticatedContext);
        expect(result).toBe(false);
    });

    it('should throw error if user is not authenticated', async () => {
        await expect(resolvers.Mutation.deleteContact!(null, args, mockUnauthenticatedContext))
            .rejects.toThrow('Not authenticated');
        expect(mockContactService.deleteContact).not.toHaveBeenCalled();
    });

    it('should forward errors from contactService', async () => {
        const serviceError = new Error('Delete Contact Service Failure');
        vi.mocked(mockContactService.deleteContact).mockRejectedValue(serviceError);
        await expect(resolvers.Mutation.deleteContact!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });

  describe('Mutation.deleteDeal', () => {
    const dealIdToDelete = 'deal-mut-delete-1';
    const args = { id: dealIdToDelete };

    it('should call dealService.deleteDeal and return result', async () => {
        vi.mocked(mockDealService.deleteDeal).mockResolvedValue(true); // dealService returns true if no error
        const result = await resolvers.Mutation.deleteDeal!(null, args, mockAuthenticatedContext);
        expect(result).toBe(true);
        expect(mockDealService.deleteDeal).toHaveBeenCalledWith(mockUser.id, dealIdToDelete, 'mock-token');
    });

    // Note: dealService currently returns true even if not found, so no separate 'false' case here
    // unless dealService logic changes.

    it('should throw error if user is not authenticated', async () => {
        await expect(resolvers.Mutation.deleteDeal!(null, args, mockUnauthenticatedContext))
            .rejects.toThrow('Not authenticated');
        expect(mockDealService.deleteDeal).not.toHaveBeenCalled();
    });

    it('should forward errors from dealService', async () => {
        const serviceError = new Error('Delete Deal Service Failure');
        vi.mocked(mockDealService.deleteDeal).mockRejectedValue(serviceError);
        await expect(resolvers.Mutation.deleteDeal!(null, args, mockAuthenticatedContext))
            .rejects.toThrow(serviceError);
    });
  });

}); 