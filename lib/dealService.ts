import { /* createClient, SupabaseClient, PostgrestError */ } from '@supabase/supabase-js';
// import type { User } from '@supabase/supabase-js'; // Keep User type if needed later (Commented out)
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError, recordEntityHistory } from './serviceUtils'; // Import shared helpers
import type { DealInput } from './generated/graphql'; // Changed to DealInput for both create and update
import { diff, Diff } from 'deep-diff';
import { inngest } from './inngestClient'; // Import the shared Inngest client
import { getCustomFieldDefinitionById } from './customFieldDefinitionService'; // Correctly import the specific function needed
import { generateDealChanges, TRACKED_DEAL_FIELDS } from './dealService/dealHistory'; // ADDED IMPORT
import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from './dealService/dealCustomFields';
import { calculateDealProbabilityFields } from './dealService/dealProbability';
import {
    getDeals as getDealsInternal,
    getDealById as getDealByIdInternal,
    createDeal as createDealInternal,
    updateDeal as updateDealInternal,
    deleteDeal as deleteDealInternal
} from './dealService/dealCrud';
import type { DealServiceUpdateData, DbDeal } from './dealService/dealCrud'; // Import the DbDeal type



// Define a more specific type for the update payload to include weighted_amount
// Removed DealUpdatePayload as DealServiceUpdateData is now used.

// --- Deal Service ---
export const dealService = {
  getDeals: (userId: string, accessToken: string): Promise<DbDeal[]> => 
    getDealsInternal(userId, accessToken),
  
  getDealById: (userId: string, id: string, accessToken: string): Promise<DbDeal | null> => 
    getDealByIdInternal(userId, id, accessToken),
  
  createDeal: (userId: string, input: DealInput, accessToken: string): Promise<DbDeal> => 
    createDealInternal(userId, input, accessToken),
  
  updateDeal: (userId: string, id: string, input: DealServiceUpdateData, accessToken: string): Promise<DbDeal | null> => 
    updateDealInternal(userId, id, input, accessToken),
  
  deleteDeal: (userId: string, id: string, accessToken: string): Promise<boolean> => 
    deleteDealInternal(userId, id, accessToken),
}; 