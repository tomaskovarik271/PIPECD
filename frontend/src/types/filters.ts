// Filter Builder Types for Advanced Deal Filtering

export interface FilterCriteria {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR'; // For connecting multiple criteria
}

export interface FilterField {
  id: string;
  label: string;
  type: FilterFieldType;
  category: FilterFieldCategory;
  options?: FilterFieldOption[]; // For dropdown fields
  customFieldDefinitionId?: string; // For custom fields
}

export interface FilterFieldOption {
  value: string;
  label: string;
}

export type FilterFieldType = 
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'dateRange'
  | 'dropdown'
  | 'multiSelect'
  | 'boolean'
  | 'user'
  | 'organization'
  | 'person'
  | 'probability'
  | 'label'
  | 'stage'
  | 'status';

export type FilterFieldCategory = 
  | 'basic'
  | 'financial'
  | 'dates'
  | 'relationships'
  | 'workflow'
  | 'custom'
  | 'labels'
  | 'metadata';

export type FilterOperator = 
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_EQUAL'
  | 'LESS_EQUAL'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'IN'
  | 'NOT_IN'
  | 'BETWEEN';

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  criteria: FilterCriteria[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickFilter {
  id: string;
  label: string;
  description?: string;
  criteria: FilterCriteria[];
  icon?: string;
  isDefault?: boolean;
}

// Filter state for the current session
export interface FilterState {
  criteria: FilterCriteria[];
  globalLogicalOperator: 'AND' | 'OR';
  activeSavedFilter?: SavedFilter;
  hasUnsavedChanges: boolean;
}

// For GraphQL integration - matches backend DealFiltersInput
export interface DealFilters {
  search?: string;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  minProbability?: number;
  maxProbability?: number;
  createdAfter?: string;
  createdBefore?: string;
  expectedCloseAfter?: string;
  expectedCloseBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  personIds?: string[];
  organizationIds?: string[];
  assignedUserIds?: string[];
  unassigned?: boolean;
  workflowIds?: string[];
  stepIds?: string[];
  statusIds?: string[];
  projectTypeIds?: string[];
  labelFilters?: LabelFilter[];
  labelFilterLogic?: 'AND' | 'OR';
  customFieldFilters?: CustomFieldFilter[];
  includeConverted?: boolean;
  closingToday?: boolean;
  closingThisWeek?: boolean;
  closingThisMonth?: boolean;
  overdue?: boolean;
  hasActivities?: boolean;
  hasCustomFields?: boolean;
  hasLabels?: boolean;
  hasNotes?: boolean;
  hasDocuments?: boolean;
  withoutActivities?: boolean;
}

export interface LabelFilter {
  labelText: string;
  colorHex?: string;
}

export interface CustomFieldFilter {
  fieldId: string;
  operator: FilterOperator;
  value: any;
}

// Component props interfaces
export interface AdvancedFilterBuilderProps {
  initialFilters?: FilterCriteria[];
  onFiltersChange: (criteria: FilterCriteria[]) => void;
  onApplyFilters: (filters: DealFilters) => void;
  onSaveFilter?: (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  savedFilters?: SavedFilter[];
  availableFields: FilterField[];
  isLoading?: boolean;
}

export interface FilterCriteriaRowProps {
  criteria: FilterCriteria;
  availableFields: FilterField[];
  onUpdate: (criteria: FilterCriteria) => void;
  onRemove: (id: string) => void;
  showLogicalOperator?: boolean;
  isLast?: boolean;
}

export interface FilterValueInputProps {
  field: FilterField;
  operator: FilterOperator;
  value: any;
  onChange: (value: any) => void;
  isLoading?: boolean;
}

// Operator definitions for different field types
export const OPERATORS_BY_FIELD_TYPE: Record<FilterFieldType, FilterOperator[]> = {
  text: ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'IS_NULL', 'IS_NOT_NULL'],
  number: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'BETWEEN', 'IS_NULL', 'IS_NOT_NULL'],
  currency: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'BETWEEN', 'IS_NULL', 'IS_NOT_NULL'],
  date: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'BETWEEN', 'IS_NULL', 'IS_NOT_NULL'],
  dateRange: ['BETWEEN'],
  dropdown: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  multiSelect: ['IN', 'NOT_IN', 'CONTAINS', 'NOT_CONTAINS'],
  boolean: ['EQUALS', 'NOT_EQUALS'],
  user: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  organization: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  person: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL'],
  probability: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'BETWEEN'],
  label: ['CONTAINS', 'NOT_CONTAINS', 'IN', 'NOT_IN'],
  stage: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN'],
  status: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN']
};

// Operator labels for UI display
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  EQUALS: 'equals',
  NOT_EQUALS: 'does not equal',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'does not contain',
  STARTS_WITH: 'starts with',
  ENDS_WITH: 'ends with',
  GREATER_THAN: 'greater than',
  LESS_THAN: 'less than',
  GREATER_EQUAL: 'greater than or equal',
  LESS_EQUAL: 'less than or equal',
  IS_NULL: 'is empty',
  IS_NOT_NULL: 'is not empty',
  IN: 'is one of',
  NOT_IN: 'is not one of',
  BETWEEN: 'is between'
}; 