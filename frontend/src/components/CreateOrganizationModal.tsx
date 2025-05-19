import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  SimpleGrid,
  Box,
  Text
} from '@chakra-ui/react';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import type { 
    OrganizationInput, 
    CustomFieldValueInput, 
    CustomFieldDefinition
} from '../generated/graphql/graphql';
import { CustomFieldEntityType, CustomFieldType } from '../generated/graphql/graphql';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationCreated: () => void;
}

const getDefaultValueForFieldType = (fieldType: CustomFieldType): any => {
    switch (fieldType) {
        case CustomFieldType.Number:
            return undefined; 
        case CustomFieldType.Boolean:
            return false;
        case CustomFieldType.Date:
        case CustomFieldType.Text: // Text and Date start as empty strings
            return ''; 
        case CustomFieldType.Dropdown: // Dropdown (single-select) also starts as empty string
            return '';
        case CustomFieldType.MultiSelect:
            return []; // Multi-select starts as an empty array
        default:
            return '';
    }
};

// Helper component for rendering individual custom fields
const CustomFieldRenderer = ({ 
    definition, 
    value, 
    onChange 
}: { 
    definition: CustomFieldDefinition, 
    value: any, 
    onChange: (fieldName: string, value: any, fieldType: CustomFieldType) => void 
}) => {
    const { fieldName, fieldLabel, fieldType, isRequired, dropdownOptions } = definition;

    return (
        <FormControl key={fieldName} isRequired={isRequired} mb={2}>
            <FormLabel htmlFor={fieldName} fontSize="sm">{fieldLabel}</FormLabel>
            {fieldType === CustomFieldType.Text && (
                <Input 
                    id={fieldName}
                    value={value || ''} 
                    onChange={(e) => onChange(fieldName, e.target.value, fieldType)} 
                />
            )}
            {fieldType === CustomFieldType.Number && (
                <NumberInput 
                    id={fieldName}
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(valueString) => onChange(fieldName, valueString, fieldType)}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            )}
            {fieldType === CustomFieldType.Boolean && (
                <Checkbox 
                    id={fieldName}
                    isChecked={Boolean(value)} 
                    onChange={(e) => onChange(fieldName, e.target.checked, fieldType)}
                />
            )}
            {fieldType === CustomFieldType.Date && (
                <Input 
                    id={fieldName}
                    type="date" 
                    value={value || ''} 
                    onChange={(e) => onChange(fieldName, e.target.value, fieldType)} 
                />
            )}
            {fieldType === CustomFieldType.Dropdown && ( // Single Select
                <Select 
                    id={fieldName}
                    placeholder={isRequired ? "Select option (required)" : "Select option"}
                    value={value || ''} 
                    onChange={(e) => onChange(fieldName, e.target.value, fieldType)} // Store as string
                >
                    {dropdownOptions?.map((opt: {value: string, label: string}) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Select>
            )}
            {fieldType === CustomFieldType.MultiSelect && (
                 <VStack align="start" spacing={1}>
                    {dropdownOptions?.map((opt: {value: string, label: string}) => (
                        <Checkbox 
                            key={opt.value} 
                            isChecked={(value as string[] | undefined || []).includes(opt.value)}
                            onChange={(e) => {
                                const currentValues = (value as string[] | undefined || []);
                                let newValues: string[];
                                if (e.target.checked) {
                                    newValues = [...currentValues, opt.value];
                                } else {
                                    newValues = currentValues.filter((v: string) => v !== opt.value);
                                }
                                onChange(fieldName, newValues, fieldType);
                            }}
                        >
                            {opt.label}
                        </Checkbox>
                    ))}
                </VStack>
            )}
        </FormControl>
    );
};

function CreateOrganizationModal({ isOpen, onClose, onOrganizationCreated }: CreateOrganizationModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const toast = useToast();

  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [organizationCustomFieldDefinitions, setOrganizationCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [hasAttemptedDefFetch, setHasAttemptedDefFetch] = useState(false);

  const { 
    createOrganization: createOrganizationAction, 
    organizationsError: storeError, 
  } = useOrganizationsStore();

  const {
    definitions, // This is the state variable from the store holding all definitions
    loading: definitionsLoading,
    fetchCustomFieldDefinitions,
    error: definitionStoreError,
  } = useCustomFieldDefinitionStore();

  useEffect(() => {
    if (isOpen && !hasAttemptedDefFetch) {
      fetchCustomFieldDefinitions(CustomFieldEntityType.Organization); 
      setHasAttemptedDefFetch(true);
    }
  }, [isOpen, hasAttemptedDefFetch, fetchCustomFieldDefinitions]);

  useEffect(() => {
    if (isOpen) {
        const orgDefs = (definitions || [])
            .filter((def: CustomFieldDefinition) => def.entityType === CustomFieldEntityType.Organization && def.isActive)
            .sort((a: CustomFieldDefinition, b: CustomFieldDefinition) => a.displayOrder - b.displayOrder);
        
        setOrganizationCustomFieldDefinitions(orgDefs);

        const initialCustomData: Record<string, any> = {};
        orgDefs.forEach((def: CustomFieldDefinition) => {
            initialCustomData[def.fieldName] = getDefaultValueForFieldType(def.fieldType);
        });
        setCustomFieldData(initialCustomData);

        // Reset standard fields only when modal opens and definitions are processed
        setName('');
        setAddress('');
        setNotes('');
        setLocalError(null);
    } else {
        // Clear state when modal is closed to ensure fresh state on reopen
        setHasAttemptedDefFetch(false);
        setOrganizationCustomFieldDefinitions([]);
        setCustomFieldData({});
        setName('');
        setAddress('');
        setNotes('');
        setLocalError(null);
        setIsLoading(false); // Also reset loading on close
    }
  }, [isOpen, definitions]); // Depend on `definitions` from store

  const handleCustomFieldChange = (fieldName: string, value: any, fieldType: CustomFieldType) => {
    setCustomFieldData(prev => {
        let processedValue = value;
        if (fieldType === CustomFieldType.Number) {
            processedValue = (value === '' || value === null || value === undefined) ? null : parseFloat(value);
        }
        return { ...prev, [fieldName]: processedValue };
    });
  };

  const processCustomFieldsForSubmit = (): { fields: CustomFieldValueInput[], error?: string } => {
    const fields: CustomFieldValueInput[] = [];
    let missingRequiredFieldLabel = '';

    for (const def of organizationCustomFieldDefinitions) {
      const rawValue = customFieldData[def.fieldName];
      
      if (def.isRequired) {
        let isEmpty = false;
        if (rawValue === undefined || rawValue === null || rawValue === '') isEmpty = true;
        else if (Array.isArray(rawValue) && rawValue.length === 0) isEmpty = true;
        if (isEmpty) {
            missingRequiredFieldLabel = def.fieldLabel;
            break;
        }
      }

      let valueToSubmit: any = undefined;
      let includeField = false;

      switch (def.fieldType) {
        case CustomFieldType.Text:
          if (rawValue !== '' && rawValue !== null && rawValue !== undefined) { valueToSubmit = String(rawValue); includeField = true; }
          else if (rawValue === null) { valueToSubmit = null; includeField = true; }
          break;
        case CustomFieldType.Number:
          if (typeof rawValue === 'number' && !isNaN(rawValue)) { valueToSubmit = rawValue; includeField = true; }
          else if (rawValue === null) { valueToSubmit = null; includeField = true; }
          break;
        case CustomFieldType.Boolean:
          valueToSubmit = Boolean(rawValue); includeField = true; 
          break;
        case CustomFieldType.Date:
          if (rawValue && String(rawValue).trim() !== '') { valueToSubmit = String(rawValue); includeField = true; } 
          else if (rawValue === null) { valueToSubmit = null; includeField = true; }
          break;
        case CustomFieldType.Dropdown: 
           if (typeof rawValue === 'string' && rawValue.trim() !== '') { valueToSubmit = [rawValue]; includeField = true; }
           else if (rawValue === null || rawValue === '') { valueToSubmit = null; includeField = true; }
          break;
        case CustomFieldType.MultiSelect:
          if (Array.isArray(rawValue)) { // handles empty array [] too
             valueToSubmit = rawValue; includeField = true; 
          }
          else if (rawValue === null) { valueToSubmit = null; includeField = true;}
          break;
        default: console.warn(`Unknown field type ${def.fieldType}`);
      }

      if (includeField) {
        const fieldInput: CustomFieldValueInput = { definitionId: def.id };
        if (def.fieldType === CustomFieldType.Text && valueToSubmit !== undefined) fieldInput.stringValue = valueToSubmit;
        else if (def.fieldType === CustomFieldType.Number && valueToSubmit !== undefined) fieldInput.numberValue = valueToSubmit;
        else if (def.fieldType === CustomFieldType.Boolean && valueToSubmit !== undefined) fieldInput.booleanValue = valueToSubmit;
        else if (def.fieldType === CustomFieldType.Date && valueToSubmit !== undefined) fieldInput.dateValue = valueToSubmit; 
        else if ((def.fieldType === CustomFieldType.Dropdown || def.fieldType === CustomFieldType.MultiSelect) && valueToSubmit !== undefined) {
            fieldInput.selectedOptionValues = valueToSubmit;
        }
        if (Object.keys(fieldInput).length > 1) fields.push(fieldInput);
      }
    }

    if (missingRequiredFieldLabel) return { fields, error: `Custom field "${missingRequiredFieldLabel}" is required.` };
    return { fields };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    if (!name.trim()) {
        setLocalError('Organization name is required.');
        setIsLoading(false);
        return;
    }

    const { fields: processedCustomFields, error: customFieldsError } = processCustomFieldsForSubmit();
    if (customFieldsError) {
        setLocalError(customFieldsError);
        setIsLoading(false);
        return;
    }

    try {
        const input: OrganizationInput = {
            name: name.trim(),
            address: address.trim() || null,
            notes: notes.trim() || null,
            customFields: processedCustomFields.length > 0 ? processedCustomFields : null,
        };

        const createdOrg = await createOrganizationAction(input);
        
        if (createdOrg) {
            toast({ title: 'Organization Created', status: 'success', duration: 3000, isClosable: true });
            onOrganizationCreated();
            onClose();
        } else {
             setLocalError(storeError || definitionStoreError || 'Failed to create organization.');
        }
    } catch (err: unknown) {
      let message = 'An unexpected error occurred.';
       if (err instanceof Error) {
        const gqlError = (err as any).graphQLErrors?.[0];
        if (gqlError) {
            const originalError = gqlError.extensions?.originalError;
            if (originalError?.issues) message = originalError.issues.map((issue: any) => issue.message).join(', ');
            else if (originalError?.message) message = originalError.message;
            else if (gqlError.message) message = gqlError.message;
        } else message = err.message;
      } else if (typeof err === 'string') message = err;
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Organization</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {(localError || storeError || definitionStoreError) && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                    {localError && <Text>{localError}</Text>}
                    {storeError && <Text mt={localError ? 1 : 0}>Store Error: {storeError}</Text>}
                    {definitionStoreError && <Text mt={(localError || storeError) ? 1 : 0}>Definition Store Error: {definitionStoreError}</Text>}
                </Box>
            </Alert>
          )}
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={!!localError && localError.includes('name')}>
              <FormLabel>Organization Name</FormLabel>
              <Input placeholder='Enter organization name' value={name} onChange={(e) => setName(e.target.value)} />
              {!!localError && localError.includes('name') && <FormErrorMessage>{localError}</FormErrorMessage>}
            </FormControl>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input placeholder='Enter address (optional)' value={address} onChange={(e) => setAddress(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea placeholder='Enter notes (optional)' value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </FormControl>
            
            {definitionsLoading && <Spinner label="Loading custom fields..." /> }
            {!definitionsLoading && organizationCustomFieldDefinitions.length > 0 && (
                 <Box borderTopWidth="1px" borderColor="gray.200" mt={5} pt={5}>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Custom Fields</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={3}>
                        {organizationCustomFieldDefinitions.map((def: CustomFieldDefinition) => (
                            <CustomFieldRenderer 
                                key={def.id}
                                definition={def}
                                value={customFieldData[def.fieldName]}
                                onChange={handleCustomFieldChange}
                            />
                        ))}
                    </SimpleGrid>
                 </Box>
            )}
             {!definitionsLoading && hasAttemptedDefFetch && organizationCustomFieldDefinitions.length === 0 && !definitionStoreError && (
                 <Text fontSize="sm" color="gray.500" mt={3}>No custom fields defined for organizations.</Text>
             )}
             {/* Consider a more specific message if definitionStoreError is present and no defs are shown */}
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="gray.200" mt={3} pt={3}>
          <Button colorScheme='blue' mr={3} type="submit" isLoading={isLoading} leftIcon={isLoading ? <Spinner size="sm" /> : undefined}>
            Save Organization
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateOrganizationModal; 