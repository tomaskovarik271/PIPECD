import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiX, FiUser } from 'react-icons/fi';
import { useOrganizationsStore } from '../../stores/useOrganizationsStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDebounce } from '../../lib/utils/useDebounce';
import { useOptimizedCustomFields } from '../../hooks/useOptimizedCustomFields';
import { CustomFieldRenderer } from './CustomFieldRenderer';
import { 
  initializeCustomFieldValues,
  processCustomFieldsForSubmission 
} from '../../lib/utils/customFieldProcessing';
import { CustomFieldEntityType } from '../../generated/graphql/graphql';
import { duplicateDetectionService, type SimilarOrganizationResult } from '../../lib/services/duplicateDetectionService';

interface InlineOrganizationFormProps {
  onCreated: (organization: any) => void;
  onCancel: () => void;
  onDuplicatesFound?: (duplicates: SimilarOrganizationResult[]) => void;
}

interface OrganizationFormData {
  name: string;
  address: string;
  notes: string;
}

const InlineOrganizationForm: React.FC<InlineOrganizationFormProps> = ({
  onCreated,
  onCancel,
  onDuplicatesFound,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const { createOrganization, organizationsLoading } = useOrganizationsStore();

  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    address: '',
    notes: '',
  });

  const [duplicates, setDuplicates] = useState<SimilarOrganizationResult[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, string | number | boolean | string[]>>({});

  // Use optimized custom fields hook for organizations
  const { 
    loading: customFieldsLoading, 
    error: customFieldsError,
    getDefinitionsForEntity 
  } = useOptimizedCustomFields({ 
    entityTypes: useMemo(() => ['ORGANIZATION' as CustomFieldEntityType], []) 
  });

  // Get active organization custom field definitions
  const activeOrgCustomFields = useMemo(() => {
    return getDefinitionsForEntity('ORGANIZATION' as CustomFieldEntityType).filter(def => def.isActive);
  }, [getDefinitionsForEntity]);

  // Initialize custom fields when component mounts
  useEffect(() => {
    const initialCustomValues = initializeCustomFieldValues(activeOrgCustomFields);
    setCustomFieldFormValues(initialCustomValues);
  }, [activeOrgCustomFields]);

  // Debounced duplicate checking using real service
  const debouncedDuplicateCheck = useDebounce(async (name: string) => {
    if (name.length < 3) {
      setDuplicates([]);
      setShowDuplicates(false);
      return;
    }

    setIsCheckingDuplicates(true);
    try {
      const similar = await duplicateDetectionService.findSimilarOrganizations(name);
      setDuplicates(similar);
      setShowDuplicates(similar.length > 0);
      onDuplicatesFound?.(similar);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setIsCheckingDuplicates(false);
    }
  }, 500);

  useEffect(() => {
    debouncedDuplicateCheck(formData.name);
  }, [formData.name, debouncedDuplicateCheck]);

  const handleInputChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean | string[]) => {
    setCustomFieldFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSelectExisting = (organization: any) => {
    onCreated(organization);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Organization name required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      // Process custom fields using utility
      const processedCustomFields = processCustomFieldsForSubmission(
        activeOrgCustomFields,
        customFieldFormValues
      );

      const organizationInput = {
        name: formData.name.trim(),
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        customFields: processedCustomFields,
      };

      const newOrganization = await createOrganization(organizationInput);
      
      if (newOrganization) {
        toast({
          title: 'Organization Created',
          description: `${newOrganization.name} has been created successfully.`,
          status: 'success',
          duration: 3000,
        });
        onCreated(newOrganization);
      }
    } catch (error) {
      toast({
        title: 'Failed to create organization',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box 
      mt={3} 
      p={4} 
      borderWidth="1px" 
      borderRadius="md" 
      bg={colors.bg.elevated}
      borderColor={colors.border.default}
    >
      <HStack justify="space-between" mb={3}>
        <Text fontSize="sm" fontWeight="semibold" color={colors.text.primary}>
          Create New Organization
        </Text>
        <Button size="xs" variant="ghost" onClick={onCancel}>
          <FiX />
        </Button>
      </HStack>

      <VStack spacing={3} align="stretch">
        <FormControl isRequired>
          <FormLabel fontSize="sm">Organization Name</FormLabel>
          <HStack>
            <Input
              placeholder="Enter organization name..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              bg={colors.bg.input}
              borderColor={colors.border.input}
            />
            {isCheckingDuplicates && <Spinner size="sm" />}
          </HStack>
        </FormControl>

        {/* Duplicate Suggestions */}
        {showDuplicates && (
          <Alert status="info" size="sm" borderRadius="md">
            <AlertIcon />
            <Box flex={1}>
              <AlertTitle fontSize="sm">Similar organizations found:</AlertTitle>
              <VStack align="start" mt={2} spacing={1}>
                {duplicates.map(org => (
                  <Button
                    key={org.id}
                    variant="ghost"
                    size="xs"
                    leftIcon={<FiUser />}
                    onClick={() => handleSelectExisting(org)}
                    color={colors.text.primary}
                  >
                    {org.suggestion}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowDuplicates(false)}
                  color={colors.text.secondary}
                >
                  Create new organization anyway
                </Button>
              </VStack>
            </Box>
          </Alert>
        )}

        <FormControl>
          <FormLabel fontSize="sm">Address</FormLabel>
          <Input
            placeholder="Company address (optional)"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            bg={colors.bg.input}
            borderColor={colors.border.input}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">Notes</FormLabel>
          <Input
            placeholder="Additional notes (optional)"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            bg={colors.bg.input}
            borderColor={colors.border.input}
          />
        </FormControl>

        {/* Custom Fields Section */}
        {customFieldsLoading && <Spinner size="sm" />}
        {customFieldsError && (
          <Alert status="error" size="sm">
            <AlertIcon />
            <Text fontSize="sm">Error loading custom fields: {customFieldsError}</Text>
          </Alert>
        )}
        
        {!customFieldsLoading && !customFieldsError && activeOrgCustomFields.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2} color={colors.text.primary}>
              Additional Information
            </Text>
            {activeOrgCustomFields.map((def) => (
              <Box key={def.id} mb={3}>
                <CustomFieldRenderer
                  definition={def}
                  value={customFieldFormValues[def.fieldName]}
                  onChange={(value) => handleCustomFieldChange(def.fieldName, value)}
                  isRequired={def.isRequired}
                />
              </Box>
            ))}
          </Box>
        )}

        <HStack spacing={2} pt={2}>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleCreate}
            isLoading={organizationsLoading}
            loadingText="Creating..."
          >
            Create Organization
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default InlineOrganizationForm; 