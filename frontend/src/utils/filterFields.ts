import type { FilterField } from '../types/filters';

// Define all available filter fields for deals
export const getAvailableFilterFields = (): FilterField[] => {
  return [
    // Basic fields
    {
      id: 'search',
      label: 'Deal Name / Description',
      type: 'text',
      category: 'basic'
    },
    {
      id: 'deal_name',
      label: 'Deal Name',
      type: 'text',
      category: 'basic'
    },
    
    // Financial fields
    {
      id: 'amount',
      label: 'Deal Amount',
      type: 'currency',
      category: 'financial'
    },
    {
      id: 'probability',
      label: 'Deal Probability',
      type: 'probability',
      category: 'financial'
    },
    {
      id: 'weighted_amount',
      label: 'Weighted Amount',
      type: 'currency',
      category: 'financial'
    },
    
    // Date fields
    {
      id: 'expected_close_date',
      label: 'Expected Close Date',
      type: 'date',
      category: 'dates'
    },
    {
      id: 'created_at',
      label: 'Created Date',
      type: 'date',
      category: 'dates'
    },
    {
      id: 'updated_at',
      label: 'Last Modified',
      type: 'date',
      category: 'dates'
    },
    
    // Relationship fields
    {
      id: 'assigned_user',
      label: 'Assigned To',
      type: 'user',
      category: 'relationships'
    },
    {
      id: 'person',
      label: 'Contact Person',
      type: 'person',
      category: 'relationships'
    },
    {
      id: 'organization',
      label: 'Organization',
      type: 'organization',
      category: 'relationships'
    },
    
    // Workflow fields (these will be enhanced with dynamic options)
    {
      id: 'workflow_step',
      label: 'Pipeline Stage',
      type: 'stage',
      category: 'workflow',
      options: [] // Will be populated dynamically
    },
    {
      id: 'status',
      label: 'Status',
      type: 'status',
      category: 'workflow',
      options: [] // Will be populated dynamically
    },
    {
      id: 'project_type',
      label: 'Project Type',
      type: 'dropdown',
      category: 'workflow',
      options: [] // Will be populated dynamically
    },
    
    // Label fields
    {
      id: 'labels',
      label: 'Labels',
      type: 'label',
      category: 'labels'
    },
    
    // Metadata fields for boolean filters
    {
      id: 'has_activities',
      label: 'Has Activities',
      type: 'boolean',
      category: 'metadata'
    },
    {
      id: 'has_custom_fields',
      label: 'Has Custom Fields',
      type: 'boolean',
      category: 'metadata'
    },
    {
      id: 'has_labels',
      label: 'Has Labels',
      type: 'boolean',
      category: 'metadata'
    },
    {
      id: 'has_notes',
      label: 'Has Notes',
      type: 'boolean',
      category: 'metadata'
    },
    {
      id: 'has_documents',
      label: 'Has Documents',
      type: 'boolean',
      category: 'metadata'
    },
    {
      id: 'is_converted',
      label: 'Is Converted',
      type: 'boolean',
      category: 'metadata'
    },
    
    // Quick date filters
    {
      id: 'closing_today',
      label: 'Closing Today',
      type: 'boolean',
      category: 'dates'
    },
    {
      id: 'closing_this_week',
      label: 'Closing This Week',
      type: 'boolean',
      category: 'dates'
    },
    {
      id: 'closing_this_month',
      label: 'Closing This Month',
      type: 'boolean',
      category: 'dates'
    },
    {
      id: 'overdue',
      label: 'Overdue',
      type: 'boolean',
      category: 'dates'
    }
  ];
};

// Currency options for filtering
export const getCurrencyOptions = () => [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'CHF', label: 'CHF' },
  { value: 'CNY', label: 'CNY (¥)' },
];

// Common filter presets that can be converted to FilterCriteria
export const getFilterPresets = () => ({
  myOpenDeals: {
    name: 'My Open Deals',
    description: 'Deals assigned to me that are not closed',
    filters: {
      // This will be populated by the component based on current user
    }
  },
  closingThisMonth: {
    name: 'Closing This Month',
    description: 'Deals with expected close date in current month',
    filters: {
      closingThisMonth: true
    }
  },
  highValueDeals: {
    name: 'High Value Deals',
    description: 'Deals with amount greater than €50,000',
    filters: {
      minAmount: 50000,
      currency: 'EUR'
    }
  },
  overdueDeals: {
    name: 'Overdue Deals',
    description: 'Deals past their expected close date',
    filters: {
      overdue: true
    }
  },
  unassignedDeals: {
    name: 'Unassigned Deals',
    description: 'Deals without an assigned user',
    filters: {
      unassigned: true
    }
  },
  noRecentActivity: {
    name: 'No Recent Activity',
    description: 'Deals without activities in the last 30 days',
    filters: {
      withoutActivities: true
    }
  }
});

// Helper function to validate filter criteria
export const validateFilterCriteria = (criteria: any): boolean => {
  return !!(criteria.field && criteria.operator && 
    (criteria.value !== undefined || ['IS_NULL', 'IS_NOT_NULL'].includes(criteria.operator)));
};

// Helper function to get field display name
export const getFieldDisplayName = (fieldId: string): string => {
  const fields = getAvailableFilterFields();
  const field = fields.find(f => f.id === fieldId);
  return field?.label || fieldId;
};

// Helper function to get operator display name
export const getOperatorDisplayName = (operator: string): string => {
  const operatorLabels: Record<string, string> = {
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
  return operatorLabels[operator] || operator;
}; 