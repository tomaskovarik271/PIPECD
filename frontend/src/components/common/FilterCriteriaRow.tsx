import React, { useMemo } from 'react';
import {
  HStack,
  VStack,
  Select,
  IconButton,
  Text,
  Box,
  Divider,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { FilterValueInput } from './FilterValueInput';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { 
  FilterCriteriaRowProps, 
  FilterField, 
  FilterOperator 
} from '../../types/filters';
import { 
  OPERATORS_BY_FIELD_TYPE, 
  OPERATOR_LABELS 
} from '../../types/filters';

// Category colors for visual organization
const CATEGORY_COLORS: Record<string, string> = {
  basic: 'blue',
  financial: 'green',
  dates: 'purple',
  relationships: 'orange',
  workflow: 'teal',
  custom: 'pink',
  labels: 'cyan',
  metadata: 'gray'
};

export const FilterCriteriaRow: React.FC<FilterCriteriaRowProps> = ({
  criteria,
  availableFields,
  onUpdate,
  onRemove,
  showLogicalOperator = true,
  isLast = false
}) => {
  const colors = useThemeColors();

  // Get available operators for the current field type
  const availableOperators = useMemo(() => {
    if (!criteria.field?.type) return [];
    return OPERATORS_BY_FIELD_TYPE[criteria.field.type] || [];
  }, [criteria.field?.type]);

  // Group fields by category for better UX
  const fieldsByCategory = useMemo(() => {
    const grouped = availableFields.reduce((acc, field) => {
      const category = field.category || 'basic';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    }, {} as Record<string, FilterField[]>);

    // Sort categories in a logical order
    const categoryOrder = ['basic', 'financial', 'dates', 'relationships', 'workflow', 'custom', 'labels', 'metadata'];
    const sortedGrouped: Record<string, FilterField[]> = {};
    
    categoryOrder.forEach(category => {
      if (grouped[category]) {
        sortedGrouped[category] = grouped[category].sort((a, b) => a.label.localeCompare(b.label));
      }
    });

    // Add any remaining categories
    Object.keys(grouped).forEach(category => {
      if (!sortedGrouped[category]) {
        sortedGrouped[category] = grouped[category].sort((a, b) => a.label.localeCompare(b.label));
      }
    });

    return sortedGrouped;
  }, [availableFields]);

  // Handle field selection
  const handleFieldChange = (fieldId: string) => {
    const newField = availableFields.find(f => f.id === fieldId);
    if (!newField) return;

    // Reset operator and value when field changes
    const defaultOperator = OPERATORS_BY_FIELD_TYPE[newField.type]?.[0] || 'EQUALS';
    
    onUpdate({
      ...criteria,
      field: newField,
      operator: defaultOperator,
      value: undefined // Reset value when field changes
    });
  };

  // Handle operator change
  const handleOperatorChange = (operator: FilterOperator) => {
    onUpdate({
      ...criteria,
      operator,
      value: undefined // Reset value when operator changes
    });
  };

  // Handle value change
  const handleValueChange = (value: any) => {
    onUpdate({
      ...criteria,
      value
    });
  };

  // Handle logical operator change
  const handleLogicalOperatorChange = (logicalOperator: 'AND' | 'OR') => {
    onUpdate({
      ...criteria,
      logicalOperator
    });
  };

  // Capitalize category name for display
  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <VStack spacing={3} align="stretch" w="100%">
      {/* Logical Operator (for connecting to previous criteria) */}
      {showLogicalOperator && (
        <HStack justify="center">
          <Select
            value={criteria.logicalOperator || 'AND'}
            onChange={(e) => handleLogicalOperatorChange(e.target.value as 'AND' | 'OR')}
            width="80px"
            size="sm"
            variant="filled"
            bg={colors.bg.elevated}
            borderColor={colors.border.subtle}
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </Select>
        </HStack>
      )}

      {/* Main criteria row */}
      <HStack spacing={3} align="flex-start" w="100%">
        {/* Field Selection */}
        <VStack spacing={1} align="stretch" minW="200px" maxW="250px">
          <Text fontSize="xs" fontWeight="medium" color={colors.text.muted}>
            Field
          </Text>
          <Select
            value={criteria.field?.id || ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder="Select field..."
            size="sm"
            bg={colors.bg.elevated}
            borderColor={colors.border.subtle}
          >
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <optgroup key={category} label={formatCategoryName(category)}>
                {fields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          {criteria.field && (
            <Badge 
              size="sm" 
              colorScheme={CATEGORY_COLORS[criteria.field.category] || 'gray'}
              alignSelf="flex-start"
            >
              {formatCategoryName(criteria.field.category)}
            </Badge>
          )}
        </VStack>

        {/* Operator Selection */}
        <VStack spacing={1} align="stretch" minW="150px" maxW="200px">
          <Text fontSize="xs" fontWeight="medium" color={colors.text.muted}>
            Operator
          </Text>
          <Select
            value={criteria.operator}
            onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
            placeholder="Select operator..."
            size="sm"
            isDisabled={!criteria.field}
            bg={colors.bg.elevated}
            borderColor={colors.border.subtle}
          >
            {availableOperators.map(operator => (
              <option key={operator} value={operator}>
                {OPERATOR_LABELS[operator]}
              </option>
            ))}
          </Select>
        </VStack>

        {/* Value Input */}
        <VStack spacing={1} align="stretch" flex={1} minW="200px">
          <Text fontSize="xs" fontWeight="medium" color={colors.text.muted}>
            Value
          </Text>
          <Box minH="32px">
            {criteria.field && criteria.operator ? (
              <FilterValueInput
                field={criteria.field}
                operator={criteria.operator}
                value={criteria.value}
                onChange={handleValueChange}
              />
            ) : (
              <Text fontSize="sm" color={colors.text.muted} fontStyle="italic">
                Select field and operator first
              </Text>
            )}
          </Box>
        </VStack>

        {/* Remove Button */}
        <VStack spacing={1} align="center">
          <Text fontSize="xs" color="transparent">
            Remove
          </Text>
          <Tooltip label="Remove this filter" placement="top">
            <IconButton
              icon={<DeleteIcon />}
              onClick={() => onRemove(criteria.id)}
              size="sm"
              variant="ghost"
              colorScheme="red"
              aria-label="Remove filter"
            />
          </Tooltip>
        </VStack>
      </HStack>

      {/* Divider between criteria (except for last one) */}
      {!isLast && (
        <Divider 
          borderColor={colors.border.subtle} 
          opacity={0.3}
        />
      )}
    </VStack>
  );
}; 