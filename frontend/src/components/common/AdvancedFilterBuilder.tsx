import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  VStack,
  HStack,
  Button,
  Text,
  Box,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Textarea,
  Select,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  ExternalLinkIcon,
  DownloadIcon 
} from '@chakra-ui/icons';
import { FilterCriteriaRow } from './FilterCriteriaRow';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gqlClient } from '../../lib/graphqlClient';
import {
  GET_CUSTOM_FIELD_DEFINITIONS,
  GET_WORKFLOW_STEPS,
  GET_WFM_STATUSES,
  GET_PROJECT_TYPES,
  type CustomFieldDefinitionsResponse,
  type WorkflowStepsResponse,
  type WfmStatusesResponse,
  type ProjectTypesResponse,
} from '../../lib/graphql/dealOperations';
import type {
  AdvancedFilterBuilderProps,
  FilterCriteria,
  FilterField,
  FilterOperator,
  DealFilters,
  SavedFilter,
  QuickFilter,
} from '../../types/filters';
import { v4 as uuidv4 } from 'uuid';

// Quick filter presets
const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'my-open-deals',
    label: 'My Open Deals',
    description: 'Deals assigned to me that are not closed',
    icon: '👤',
    isDefault: true,
    criteria: []
  },
  {
    id: 'closing-this-month',
    label: 'Closing This Month',
    description: 'Deals with expected close date in current month',
    icon: '📅',
    criteria: []
  },
  {
    id: 'high-value-deals',
    label: 'High Value Deals',
    description: 'Deals with amount > €50,000',
    icon: '💰',
    criteria: []
  },
  {
    id: 'overdue-deals',
    label: 'Overdue Deals',
    description: 'Deals past their expected close date',
    icon: '⚠️',
    criteria: []
  },
  {
    id: 'no-activity',
    label: 'No Recent Activity',
    description: 'Deals without activities in the last 30 days',
    icon: '🔔',
    criteria: []
  }
];

export const AdvancedFilterBuilder: React.FC<AdvancedFilterBuilderProps> = ({
  initialFilters = [],
  onFiltersChange,
  onApplyFilters,
  onSaveFilter,
  savedFilters = [],
  availableFields,
  isLoading = false
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  
  // State for current filter criteria
  const [criteria, setCriteria] = useState<FilterCriteria[]>(initialFilters);
  const [globalLogicalOperator, setGlobalLogicalOperator] = useState<'AND' | 'OR'>('AND');
  
  // State for additional filter data loading
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(false);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<any[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  
  // Save filter modal state
  const { 
    isOpen: isSaveModalOpen, 
    onOpen: onOpenSaveModal, 
    onClose: onCloseSaveModal 
  } = useDisclosure();
  
  const [saveFilterForm, setSaveFilterForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  // Load additional filter data on mount
  useEffect(() => {
    const loadFilterData = async () => {
      setIsLoadingFilterData(true);
      try {
        const [customFieldsData, workflowStepsData, statusesData, projectTypesData] = await Promise.all([
          gqlClient.request<CustomFieldDefinitionsResponse>(GET_CUSTOM_FIELD_DEFINITIONS, { 
            entityType: 'DEAL' 
          }),
          gqlClient.request<WorkflowStepsResponse>(GET_WORKFLOW_STEPS),
          gqlClient.request<WfmStatusesResponse>(GET_WFM_STATUSES),
          gqlClient.request<ProjectTypesResponse>(GET_PROJECT_TYPES),
        ]);

        setCustomFieldDefinitions(customFieldsData.customFieldDefinitions || []);
        // Flatten workflow steps from nested workflows structure
        const flattenedSteps = workflowStepsData.wfmWorkflows?.flatMap(workflow => 
          workflow.steps.map(step => ({
            ...step,
            workflowId: workflow.id,
            workflowName: workflow.name
          }))
        ) || [];
        setWorkflowSteps(flattenedSteps);
        setStatuses(statusesData.wfmStatuses || []);
        setProjectTypes(projectTypesData.wfmProjectTypes || []);
      } catch (error) {
        console.error('Error loading filter data:', error);
        toast({
          title: 'Error Loading Filter Options',
          description: 'Some filter options may not be available',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoadingFilterData(false);
      }
    };

    loadFilterData();
  }, [toast]);

  // Enhanced available fields with dynamic options
  const enhancedAvailableFields = useMemo(() => {
    // Start with base fields but filter out workflow fields that will be replaced with dynamic ones
    const baseFields = availableFields.filter(field => 
      !['workflow_step', 'status', 'project_type'].includes(field.id)
    );
    
    // Add custom fields
    customFieldDefinitions.forEach(customField => {
      let fieldType: any = 'text';
      let options: any[] | undefined;

      switch (customField.fieldType) {
        case 'dropdown':
          fieldType = 'dropdown';
          options = customField.dropdownOptions?.map((opt: string) => ({
            value: opt,
            label: opt
          }));
          break;
        case 'boolean':
          fieldType = 'boolean';
          break;
        case 'number':
          fieldType = 'number';
          break;
        case 'date':
          fieldType = 'date';
          break;
        default:
          fieldType = 'text';
      }

      baseFields.push({
        id: `custom_${customField.id}`,
        label: customField.fieldLabel || customField.fieldName,
        type: fieldType,
        category: 'custom',
        options,
        customFieldDefinitionId: customField.id
      });
    });

    // Add deal-specific workflow steps (filter to deal workflows only)
    const dealWorkflowSteps = workflowSteps.filter(step => 
      step.workflowName?.toLowerCase().includes('sales') || 
      step.workflowName?.toLowerCase().includes('deal')
    );
    
    if (dealWorkflowSteps.length > 0) {
      baseFields.push({
        id: 'workflow_step',
        label: 'Pipeline Stage',
        type: 'stage',
        category: 'workflow',
        options: dealWorkflowSteps.map(step => ({
          value: step.id,
          label: step.status?.name || 'Unknown Status'
        }))
      });
    }

    // Add statuses (global, used across all workflows)
    baseFields.push({
      id: 'status',
      label: 'Status',
      type: 'status',
      category: 'workflow',
      options: statuses.map(status => ({
        value: status.id,
        label: status.name
      }))
    });

    // Add deal-specific project types (filter to deal-related types)
    const dealProjectTypes = projectTypes.filter(type => 
      type.name?.toLowerCase().includes('sales') || 
      type.name?.toLowerCase().includes('deal')
    );
    
    if (dealProjectTypes.length > 0) {
      baseFields.push({
        id: 'project_type',
        label: 'Project Type',
        type: 'dropdown',
        category: 'workflow',
        options: dealProjectTypes.map(type => ({
          value: type.id,
          label: type.name
        }))
      });
    }

    return baseFields;
  }, [availableFields, customFieldDefinitions, workflowSteps, statuses, projectTypes]);

  // Convert criteria to DealFilters format for backend
  const convertCriteriaToFilters = useCallback((criteriaList: FilterCriteria[]): DealFilters => {
    const filters: DealFilters = {};
    
    criteriaList.forEach(criterion => {
      if (!criterion.field || !criterion.operator || criterion.value === undefined) return;

      const fieldId = criterion.field.id;
      const operator = criterion.operator;
      const value = criterion.value;

      switch (fieldId) {
        case 'search':
          filters.search = value;
          break;
        case 'amount':
          if (operator === 'GREATER_THAN' || operator === 'GREATER_EQUAL') {
            filters.amountMin = value.amount || value;
            filters.currency = value.currency;
          } else if (operator === 'LESS_THAN' || operator === 'LESS_EQUAL') {
            filters.amountMax = value.amount || value;
            filters.currency = value.currency;
          } else if (operator === 'BETWEEN') {
            filters.amountMin = value[0]?.amount || value[0];
            filters.amountMax = value[1]?.amount || value[1];
            filters.currency = value[0]?.currency || value.currency;
          }
          break;
        case 'probability':
          if (operator === 'GREATER_THAN' || operator === 'GREATER_EQUAL') {
            filters.minProbability = value;
          } else if (operator === 'LESS_THAN' || operator === 'LESS_EQUAL') {
            filters.maxProbability = value;
          } else if (operator === 'BETWEEN') {
            filters.minProbability = value[0];
            filters.maxProbability = value[1];
          }
          break;
        case 'expected_close_date':
          if (operator === 'GREATER_THAN' || operator === 'GREATER_EQUAL') {
            filters.expectedCloseAfter = value;
          } else if (operator === 'LESS_THAN' || operator === 'LESS_EQUAL') {
            filters.expectedCloseBefore = value;
          } else if (operator === 'BETWEEN') {
            filters.expectedCloseAfter = value[0];
            filters.expectedCloseBefore = value[1];
          }
          break;
        case 'created_at':
          if (operator === 'GREATER_THAN' || operator === 'GREATER_EQUAL') {
            filters.createdAfter = value;
          } else if (operator === 'LESS_THAN' || operator === 'LESS_EQUAL') {
            filters.createdBefore = value;
          } else if (operator === 'BETWEEN') {
            filters.createdAfter = value[0];
            filters.createdBefore = value[1];
          }
          break;
        case 'assigned_user':
          if (operator === 'IS_NULL') {
            filters.unassigned = true;
          } else if (operator === 'IN' || operator === 'NOT_IN') {
            filters.assignedUserIds = Array.isArray(value) ? value : [value];
          } else {
            filters.assignedUserIds = [value];
          }
          break;
        case 'person':
          filters.personIds = Array.isArray(value) ? value : [value];
          break;
        case 'organization':
          filters.organizationIds = Array.isArray(value) ? value : [value];
          break;
        case 'workflow_step':
          filters.stepIds = Array.isArray(value) ? value : [value];
          break;
        case 'status':
          filters.statusIds = Array.isArray(value) ? value : [value];
          break;
        case 'project_type':
          filters.projectTypeIds = Array.isArray(value) ? value : [value];
          break;
        default:
          // Handle custom fields
          if (fieldId.startsWith('custom_')) {
            const customFieldId = fieldId.replace('custom_', '');
            if (!filters.customFieldFilters) {
              filters.customFieldFilters = [];
            }
            filters.customFieldFilters.push({
              fieldId: customFieldId,
              operator,
              value
            });
          }
      }
    });

    return filters;
  }, []);

  // Handle adding new criteria
  const handleAddCriteria = () => {
    const newCriteria: FilterCriteria = {
      id: uuidv4(),
      field: enhancedAvailableFields[0], // Default to first field
      operator: 'EQUALS',
      value: undefined,
      logicalOperator: criteria.length > 0 ? globalLogicalOperator : undefined
    };
    
    const newCriteriaList = [...criteria, newCriteria];
    setCriteria(newCriteriaList);
    onFiltersChange(newCriteriaList);
  };

  // Handle updating criteria
  const handleUpdateCriteria = (updatedCriteria: FilterCriteria) => {
    const newCriteriaList = criteria.map(c => 
      c.id === updatedCriteria.id ? updatedCriteria : c
    );
    setCriteria(newCriteriaList);
    onFiltersChange(newCriteriaList);
  };

  // Handle removing criteria
  const handleRemoveCriteria = (id: string) => {
    const newCriteriaList = criteria.filter(c => c.id !== id);
    setCriteria(newCriteriaList);
    onFiltersChange(newCriteriaList);
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    const filters = convertCriteriaToFilters(criteria);
    onApplyFilters(filters);
  };

  // Handle quick filter selection
  const handleQuickFilterSelect = (quickFilter: QuickFilter) => {
    // For now, set basic criteria. In a real implementation, 
    // you'd convert the quick filter to actual criteria
    setCriteria([]);
    
    // Apply quick filter logic based on the filter type
    const filters: DealFilters = {};
    switch (quickFilter.id) {
      case 'closing-this-month':
        filters.closingThisMonth = true;
        break;
      case 'overdue-deals':
        filters.overdue = true;
        break;
      case 'high-value-deals':
        filters.amountMin = 50000;
        filters.currency = 'EUR';
        break;
      case 'no-activity':
        filters.withoutActivities = true;
        break;
    }
    
    onApplyFilters(filters);
  };

  // Handle saving filter
  const handleSaveFilter = async () => {
    if (!saveFilterForm.name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the filter',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newFilter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'> = {
      name: saveFilterForm.name.trim(),
      description: saveFilterForm.description.trim(),
      criteria: criteria,
      isPublic: saveFilterForm.isPublic,
      createdBy: 'current_user' // This would come from auth context
    };

    onSaveFilter?.(newFilter);
    onCloseSaveModal();
    setSaveFilterForm({ name: '', description: '', isPublic: false });
    
    toast({
      title: 'Filter Saved',
      description: `Filter "${newFilter.name}" has been saved`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle clearing all filters
  const handleClearAll = () => {
    setCriteria([]);
    onFiltersChange([]);
  };

  // Calculate filter summary
  const filterSummary = useMemo(() => {
    const validCriteria = criteria.filter(c => c.field && c.operator && c.value !== undefined);
    return {
      total: criteria.length,
      valid: validCriteria.length,
      invalid: criteria.length - validCriteria.length
    };
  }, [criteria]);

  if (isLoading || isLoadingFilterData) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="lg" color={colors.interactive.default} />
        <Text color={colors.text.muted}>Loading filter options...</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Header with quick filters and actions */}
      <VStack spacing={4} align="stretch">
        {/* Saved filters */}
        {savedFilters && savedFilters.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary} mb={2}>
              Saved Filters
              <Text as="span" fontSize="xs" color={colors.text.muted} ml={2}>
                (Click to apply instantly)
              </Text>
            </Text>
            <HStack spacing={2} wrap="wrap">
              {savedFilters.map(savedFilter => (
                <Button
                  key={savedFilter.id}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<ExternalLinkIcon />}
                  onClick={() => {
                    console.log('🔍 Loading saved filter:', savedFilter.name, savedFilter.criteria);
                    setCriteria(savedFilter.criteria);
                    onFiltersChange(savedFilter.criteria);
                    
                    // Auto-apply the saved filter
                    const filters = convertCriteriaToFilters(savedFilter.criteria);
                    onApplyFilters(filters);
                    
                    toast({
                      title: 'Filter Applied',
                      description: `Applied "${savedFilter.name}" filter with ${savedFilter.criteria.length} criteria`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                  }}
                  title={savedFilter.description || 'Saved filter'}
                >
                  {savedFilter.name}
                </Button>
              ))}
            </HStack>
          </Box>
        )}

        {/* Quick filters */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary} mb={2}>
            Quick Filters
          </Text>
          <HStack spacing={2} wrap="wrap">
            {QUICK_FILTERS.map(quickFilter => (
              <Button
                key={quickFilter.id}
                size="sm"
                variant="outline"
                leftIcon={<Text fontSize="xs">{quickFilter.icon}</Text>}
                onClick={() => handleQuickFilterSelect(quickFilter)}
                title={quickFilter.description}
              >
                {quickFilter.label}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Filter summary and actions */}
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <Badge colorScheme="blue" variant="subtle">
              {filterSummary.total} filter{filterSummary.total !== 1 ? 's' : ''}
            </Badge>
            {filterSummary.invalid > 0 && (
              <Badge colorScheme="red" variant="subtle">
                {filterSummary.invalid} incomplete
              </Badge>
            )}
          </HStack>
          
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearAll}
              isDisabled={criteria.length === 0}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ExternalLinkIcon />}
              onClick={onOpenSaveModal}
              isDisabled={filterSummary.valid === 0}
            >
              Save
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleApplyFilters}
              isDisabled={filterSummary.valid === 0}
              fontWeight="bold"
            >
              Apply Filters ({filterSummary.valid})
            </Button>
          </HStack>
        </HStack>
      </VStack>

      <Divider borderColor={colors.border.subtle} />

      {/* Info box for new users */}
      {criteria.length === 0 && (!savedFilters || savedFilters.length === 0) && (
        <Alert status="info" variant="subtle" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="medium">
              How to use filters:
            </Text>
            <Text fontSize="xs" color={colors.text.muted}>
              1. Use Quick Filters for common scenarios, or 2. Build custom filters below, 3. Click "Apply Filters" to search, 4. Save filters for reuse
            </Text>
          </VStack>
        </Alert>
      )}

      {/* Filter criteria */}
      <VStack spacing={4} align="stretch">
        {criteria.length === 0 ? (
          <Box
            textAlign="center"
            py={8}
            bg={colors.bg.surface}
            borderRadius="md"
            borderWidth="1px"
            borderColor={colors.border.subtle}
            borderStyle="dashed"
          >
            <Text color={colors.text.muted} mb={4}>
              No filters added yet
            </Text>
            <Button
              leftIcon={<AddIcon />}
              onClick={handleAddCriteria}
              colorScheme="blue"
              variant="outline"
            >
              Add Your First Filter
            </Button>
          </Box>
        ) : (
          <>
            {criteria.map((criterion, index) => (
              <FilterCriteriaRow
                key={criterion.id}
                criteria={criterion}
                availableFields={enhancedAvailableFields}
                onUpdate={handleUpdateCriteria}
                onRemove={handleRemoveCriteria}
                showLogicalOperator={index > 0}
                isLast={index === criteria.length - 1}
              />
            ))}
            
            <HStack justify="center" pt={4}>
              <Button
                leftIcon={<AddIcon />}
                onClick={handleAddCriteria}
                variant="outline"
                size="sm"
              >
                Add Filter
              </Button>
            </HStack>
          </>
        )}
      </VStack>

      {/* Save Filter Modal */}
      <Modal isOpen={isSaveModalOpen} onClose={onCloseSaveModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Filter</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Filter Name</FormLabel>
                <Input
                  value={saveFilterForm.name}
                  onChange={(e) => setSaveFilterForm(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter filter name..."
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={saveFilterForm.description}
                  onChange={(e) => setSaveFilterForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Optional description..."
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>Make Public</FormLabel>
                  <Switch
                    isChecked={saveFilterForm.isPublic}
                    onChange={(e) => setSaveFilterForm(prev => ({
                      ...prev,
                      isPublic: e.target.checked
                    }))}
                  />
                </HStack>
                <Text fontSize="sm" color={colors.text.muted}>
                  Public filters can be used by other team members
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onCloseSaveModal} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveFilter}>
              Save Filter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}; 