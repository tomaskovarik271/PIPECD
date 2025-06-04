import React, { useState, useEffect, useMemo } from 'react';
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
  Select,
  useToast,
  VStack,
  HStack,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useLeadsStore, LeadInput } from '../stores/useLeadsStore';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValues,
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';
import { useWFMConfigStore } from '../stores/useWFMConfigStore';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose }) => {
  const { createLead } = useLeadsStore();
  const { 
    leadQualificationWorkflowId, 
    isLoadingLeadQualificationWorkflowId,
    fetchLeadQualificationWorkflowId 
  } = useWFMConfigStore();
  const toast = useToast();
  
  const [formData, setFormData] = useState<Partial<LeadInput>>({
    name: '',
    source: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    estimatedValue: undefined,
    wfmProjectTypeId: '',
  });
  
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use optimized custom fields hook
  const { 
    loading: customFieldsLoading, 
    error: customFieldsError,
    getDefinitionsForEntity 
  } = useOptimizedCustomFields({ 
    entityTypes: useMemo(() => ['LEAD' as CustomFieldEntityType], []) 
  });

  // Get active lead custom field definitions
  const activeLeadCustomFields = useMemo(() => {
    return getDefinitionsForEntity('LEAD' as CustomFieldEntityType).filter(def => def.isActive);
  }, [getDefinitionsForEntity]);

  // Fetch lead qualification workflow ID on mount
  useEffect(() => {
    if (!leadQualificationWorkflowId && !isLoadingLeadQualificationWorkflowId) {
      fetchLeadQualificationWorkflowId();
    }
  }, [leadQualificationWorkflowId, isLoadingLeadQualificationWorkflowId, fetchLeadQualificationWorkflowId]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({
        name: '',
        source: '',
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        companyName: '',
        estimatedValue: undefined,
        wfmProjectTypeId: 'AUTO_DEFAULT_LEAD_QUALIFICATION', // Use auto-default like deals
      });
      setIsSubmitting(false);

      // Initialize custom fields
      const initialCustomValues = initializeCustomFieldValues(activeLeadCustomFields);
      setCustomFieldFormValues(initialCustomValues);
    }
  }, [isOpen, activeLeadCustomFields]);

  const handleInputChange = (field: keyof LeadInput, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Lead name is required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const leadInput: LeadInput = {
        name: formData.name,
        source: formData.source || undefined,
        description: formData.description || undefined,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        companyName: formData.companyName || undefined,
        estimatedValue: formData.estimatedValue || undefined,
        wfmProjectTypeId: 'AUTO_DEFAULT_LEAD_QUALIFICATION', // Use auto-default like deals
      };

      // Process custom fields using utility
      const processedCustomFields = processCustomFieldsForSubmission(
        activeLeadCustomFields,
        customFieldFormValues
      );
      leadInput.customFields = processedCustomFields;

      const result = await createLead(leadInput);
      
      if (result) {
        toast({
          title: 'Lead Created',
          description: 'The lead has been successfully created.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to create lead. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Lead</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Lead Name</FormLabel>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter lead name"
                isDisabled={isSubmitting}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Source</FormLabel>
              <Select
                value={formData.source || ''}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="Select lead source"
                isDisabled={isSubmitting}
              >
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Trade Show">Trade Show</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>Contact Name</FormLabel>
                <Input
                  value={formData.contactName || ''}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Contact person name"
                  isDisabled={isSubmitting}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Company name"
                  isDisabled={isSubmitting}
                />
              </FormControl>
            </HStack>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>Contact Email</FormLabel>
                <Input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                  isDisabled={isSubmitting}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Contact Phone</FormLabel>
                <Input
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="Phone number"
                  isDisabled={isSubmitting}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Estimated Value</FormLabel>
              <Input
                type="number"
                value={formData.estimatedValue || ''}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                isDisabled={isSubmitting}
              />
            </FormControl>

            {/* Custom Fields Section */}
            {activeLeadCustomFields.length > 0 && (
              <>
                <Divider />
                <Text fontSize="lg" fontWeight="semibold" alignSelf="flex-start">
                  Custom Fields
                </Text>
                {activeLeadCustomFields.map((fieldDef) => (
                  <CustomFieldRenderer
                    key={fieldDef.id}
                    definition={fieldDef}
                    value={customFieldFormValues[fieldDef.fieldName]}
                    onChange={(value) => handleCustomFieldChange(fieldDef.fieldName, value)}
                    isDisabled={isSubmitting}
                  />
                ))}
              </>
            )}

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Lead description or notes"
                rows={3}
                isDisabled={isSubmitting}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Creating..."
          >
            Create Lead
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateLeadModal; 