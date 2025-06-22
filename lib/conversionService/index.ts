// Export all conversion service functions
export {
  convertLeadToDeal,
  type LeadToDealConversionInput,
  type LeadToDealConversionResult,
} from './forwardConversion';

// Backward conversion
export {
  convertDealToLead,
  type DealToLeadConversionInput,
  type DealToLeadConversionResult,
} from './backwardConversion';

export {
  validateConversion,
  type ConversionValidationResult,
} from './conversionValidation';

export {
  recordConversionHistory,
  getConversionHistory,
  type ConversionHistoryEntry,
  type RecordConversionHistoryInput,
} from './conversionHistory';

export {
  planWFMTransition,
  executeWFMTransition,
  type WFMTransitionPlan,
} from './wfmTransitionManager';

// Common types
export interface BaseConversionInput {
  preserveActivities?: boolean;
  createConversionActivity?: boolean;
  notes?: string;
}

export interface BaseConversionResult {
  success: boolean;
  conversionId: string;
  message: string;
  errors?: string[];
}

export enum ConversionType {
  LEAD_TO_DEAL = 'LEAD_TO_DEAL',
  DEAL_TO_LEAD = 'DEAL_TO_LEAD'
}

export enum ConversionReason {
  // Forward conversion reasons
  QUALIFIED = 'QUALIFIED',
  HOT_LEAD = 'HOT_LEAD',
  DEMO_SCHEDULED = 'DEMO_SCHEDULED',
  
  // Backwards conversion reasons
  COOLING = 'COOLING',
  TIMELINE_EXTENDED = 'TIMELINE_EXTENDED',
  BUDGET_CONSTRAINTS = 'BUDGET_CONSTRAINTS',
  STAKEHOLDER_CHANGE = 'STAKEHOLDER_CHANGE',
  COMPETITIVE_LOSS = 'COMPETITIVE_LOSS',
  REQUIREMENTS_CHANGE = 'REQUIREMENTS_CHANGE',
  RELATIONSHIP_RESET = 'RELATIONSHIP_RESET'
} 