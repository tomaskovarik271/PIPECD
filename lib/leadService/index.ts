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