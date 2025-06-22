// Export all CRUD operations and utility functions
export {
  createLead,
  getLeadById,
  getLeads,
  updateLead,
  deleteLead,
  qualifyLead,
  recalculateLeadScore,
  type DbLead,
  type LeadServiceUpdateData,
} from './leadCrud';

// Import functions for the service object with different names
import {
  createLead as createLeadInternal,
  getLeadById as getLeadByIdInternal,
  getLeads as getLeadsInternal,
  updateLead as updateLeadInternal,
  deleteLead as deleteLeadInternal,
  qualifyLead as qualifyLeadInternal,
} from './leadCrud';

// Export scoring functions
export {
  calculateLeadScoreFields,
  type LeadScoringResult,
} from './leadScoring';

// Export custom fields functions  
export {
  processCustomFieldsForCreate,
  processCustomFieldsForUpdate,
} from './leadCustomFields';

// Export history functions
export {
  generateLeadChanges,
  TRACKED_LEAD_FIELDS
} from './leadHistory';

// Export leadService object for compatibility
export const leadService = {
  getLeads: (filters: any, userId: string, accessToken: string) => 
    getLeadsInternal(filters, userId, accessToken),
  
  getLeadById: (id: string, userId: string, accessToken: string) => 
    getLeadByIdInternal(id, userId, accessToken),
  
  createLead: (input: any, userId: string, accessToken: string) => 
    createLeadInternal(input, userId, accessToken),
  
  updateLead: (id: string, input: any, userId: string, accessToken: string) => 
    updateLeadInternal(userId, id, input, accessToken),
  
  deleteLead: (id: string, userId: string, accessToken: string) => 
    deleteLeadInternal(id, userId, accessToken),
  
  qualifyLead: (id: string, userId: string, accessToken: string) => 
    qualifyLeadInternal(id, userId, accessToken),
}; 