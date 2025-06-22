import React, { useState, useCallback } from 'react';
import {
  Box,
  Center,
  Flex,
  Icon,
  Link,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { CustomFieldDefinition, CustomFieldValue } from '../../generated/graphql/graphql';
import { CustomFieldRenderer } from '../common/CustomFieldRenderer';
import { useThemeColors } from '../../hooks/useThemeColors';

interface DealCustomFieldsPanelProps {
  customFieldDefinitions: CustomFieldDefinition[];
  customFieldValues: CustomFieldValue[];
  dealId: string;
  onUpdate?: (fieldId: string, value: any) => Promise<void>;
  getLinkDisplayDetails: (str: string | null | undefined) => {
    isUrl: boolean;
    displayText: string;
    fullUrl?: string;
    isKnownService?: boolean;
    icon?: React.ElementType;
  };
}

export const DealCustomFieldsPanel: React.FC<DealCustomFieldsPanelProps> = ({
  customFieldDefinitions,
  customFieldValues,
  dealId: _dealId,
  onUpdate,
  getLinkDisplayDetails,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const hasCustomFields = customFieldDefinitions && customFieldValues && customFieldValues.length > 0;

  const processedCustomFields = React.useMemo(() => {
    if (!hasCustomFields) return [];
    
    return customFieldValues
      .filter(cfv => customFieldDefinitions.find(cfd => cfd.id === cfv.definition.id)?.isActive)
      .sort((a, b) => {
        const defA = customFieldDefinitions.find(def => def.id === a.definition.id);
        const defB = customFieldDefinitions.find(def => def.id === b.definition.id);
        return (defA?.displayOrder || 0) - (defB?.displayOrder || 0);
      })
      .map((cfv) => {
        const definition = customFieldDefinitions.find(def => def.id === cfv.definition.id);
        
        if (!definition) return null;

        // Get current value for the field
        let currentValue: any = null;
        switch (definition.fieldType) {
          case 'TEXT':
            currentValue = cfv.stringValue || '';
            break;
          case 'NUMBER':
            currentValue = cfv.numberValue || '';
            break;
          case 'BOOLEAN':
            currentValue = cfv.booleanValue || false;
            break;
          case 'DATE':
            currentValue = cfv.dateValue || '';
            break;
          case 'DROPDOWN':
          case 'MULTI_SELECT':
            currentValue = cfv.selectedOptionValues || [];
            break;
          default:
            currentValue = cfv.stringValue || '';
        }

        // Format display value
        let displayValue: string | React.ReactNode = '-';
        switch (definition.fieldType) {
          case 'TEXT':
            displayValue = cfv.stringValue || '-';
            if (cfv.stringValue && (cfv.stringValue.startsWith('http://') || cfv.stringValue.startsWith('https://'))) {
              const linkDetails = getLinkDisplayDetails(cfv.stringValue);
              if (linkDetails.isUrl) {
                displayValue = (
                  <Link 
                    href={linkDetails.fullUrl} 
                    color={colors.text.link} 
                    isExternal 
                    _hover={{textDecoration: 'underline'}}
                  >
                    {linkDetails.displayText} <ExternalLinkIcon mx='2px' />
                  </Link>
                );
              }
            }
            break;
          case 'NUMBER':
            displayValue = cfv.numberValue?.toString() || '-';
            break;
          case 'BOOLEAN':
            displayValue = cfv.booleanValue ? 'Yes' : 'No';
            break;
          case 'DATE':
            displayValue = cfv.dateValue ? new Date(cfv.dateValue).toLocaleDateString() : '-';
            break;
          case 'DROPDOWN':
          case 'MULTI_SELECT':
            if (cfv.selectedOptionValues && cfv.selectedOptionValues.length > 0) {
              const selectedLabels = cfv.selectedOptionValues.map(val => {
                const opt = definition.dropdownOptions?.find(o => o.value === val);
                return opt ? opt.label : val;
              });
              displayValue = selectedLabels.join(', ');
            } else {
              displayValue = '-';
            }
            break;
          default:
            displayValue = 'N/A';
        }

        return {
          id: definition.id,
          label: definition.fieldLabel || definition.fieldName,
          fieldName: definition.fieldName,
          definition,
          currentValue,
          displayValue,
        };
      })
      .filter(Boolean);
  }, [customFieldDefinitions, customFieldValues, hasCustomFields, getLinkDisplayDetails, colors.text.link]);

  const handleEditClick = useCallback((field: any) => {
    setEditingFieldId(field.id);
    setEditValue(field.currentValue);
  }, []);

  const handleSave = useCallback(async (field: any) => {
    if (!onUpdate) return;
    
    setSaving(true);
    try {
      await onUpdate(field.id, editValue);
      setEditingFieldId(null);
      setEditValue(null);
      toast({
        title: 'Field updated',
        description: `${field.label} has been updated successfully.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to update custom field:', error);
      toast({
        title: 'Update failed',
        description: `Failed to update ${field.label}. Please try again.`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  }, [onUpdate, editValue, toast]);

  const handleCancel = useCallback(() => {
    setEditingFieldId(null);
    setEditValue(null);
  }, []);

  if (!hasCustomFields) {
    return (
      <Center minH="100px" flexDirection="column" bg={colors.bg.elevated} borderRadius="md" p={4}>
        <Icon as={InfoIcon} w={6} h={6} color={colors.text.muted} mb={3} />
        <Text color={colors.text.secondary} fontSize="sm">No custom information available.</Text>
      </Center>
    );
  }

  return (
    <>
      <VStack spacing={0} align="stretch">
        {processedCustomFields.map((field, index) => (
          <Box 
            key={field!.id} 
            p={4}
            borderTopWidth={index === 0 ? "1px" : "0px"}
            borderBottomWidth="1px"
            borderLeftWidth="1px"
            borderRightWidth="1px"
            borderTopRadius={index === 0 ? "lg" : "0"}
            borderBottomRadius={index === processedCustomFields.length - 1 ? "lg" : "0"}
            bg={editingFieldId === field!.id ? colors.bg.surface : colors.bg.elevated}
            borderWidth={editingFieldId === field!.id ? '2px' : '1px'}
            borderColor={editingFieldId === field!.id ? colors.interactive.default : colors.border.default}
            transition="all 0.2s ease"
            _hover={!editingFieldId ? { 
              bg: colors.bg.surface,
              borderColor: onUpdate ? colors.interactive.default : colors.border.default,
              cursor: onUpdate ? 'pointer' : 'default'
            } : {}}
            onClick={!editingFieldId && onUpdate ? () => handleEditClick(field) : undefined}
          >
            {editingFieldId === field!.id ? (
              // Edit mode
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontWeight="semibold" color={colors.text.primary}>
                    Editing: {field!.label}
                  </Text>
                  <HStack spacing={1}>
                    <IconButton
                      icon={<CloseIcon />}
                      aria-label="Cancel"
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      isDisabled={saving}
                      colorScheme="gray"
                    />
                    <IconButton
                      icon={saving ? <Spinner size="sm" /> : <CheckIcon />}
                      aria-label="Save"
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleSave(field)}
                      isDisabled={saving}
                    />
                  </HStack>
                </HStack>
                <Box p={3} bg={colors.bg.app} borderRadius="md" border="1px solid" borderColor={colors.border.default}>
                  <CustomFieldRenderer
                    definition={field!.definition}
                    value={editValue}
                    onChange={setEditValue}
                    isRequired={field!.definition.isRequired}
                  />
                </Box>
              </VStack>
            ) : (
              // View mode
              <Flex 
                justifyContent="space-between" 
                alignItems="center" 
                minH="40px"
              >
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontSize="xs" color={colors.text.secondary} fontWeight="medium" letterSpacing="wide" textTransform="uppercase">
                    {field!.label}
                  </Text>
                  <Text fontSize="sm" color={colors.text.primary} fontWeight="medium">
                    {field!.displayValue}
                  </Text>
                </VStack>
                {onUpdate && (
                  <Box>
                    <IconButton
                      icon={<EditIcon />}
                      aria-label={`Edit ${field!.label}`}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(field);
                      }}
                      opacity={0.7}
                      _hover={{ opacity: 1, transform: 'scale(1.1)' }}
                      transition="all 0.2s"
                    />
                  </Box>
                )}
              </Flex>
            )}
          </Box>
        ))}
      </VStack>
    </>
  );
}; 