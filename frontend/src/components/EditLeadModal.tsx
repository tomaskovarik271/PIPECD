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
import { useLeadsStore, Lead, LeadUpdateInput } from '../stores/useLeadsStore';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValuesFromEntity, 
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, lead }) => {
  const { updateLead } = useLeadsStore();
  const toast = useToast();
  
  const [formData, setFormData] = useState<Partial<LeadUpdateInput>>({});
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use optimized custom fields hook
  const { 
    loading: customFieldsLoading, 
    error: customFieldsError,
    getDefinitionsForEntity 
  } = useOptimizedCustomFields({ 
    entityTypes: useMemo(() => ['LEAD'], []) 
  });

  // Get active lead custom field definitions
  const activeLeadCustomFields = useMemo(() => {
    return getDefinitionsForEntity('LEAD').filter(def => def.isActive);
  }, [getDefinitionsForEntity]);

  // Initialize form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        source: lead.source || '',
        description: lead.description || '',
        contactName: lead.contact_name || '',
        contactEmail: lead.contact_email || '',
        contactPhone: lead.contact_phone || '',
        companyName: lead.company_name || '',
        estimatedValue: lead.estimated_value || undefined,
      });

      // Initialize custom field values if definitions are available
      if (activeLeadCustomFields.length > 0) {
        const initialCustomValues = initializeCustomFieldValuesFromEntity(
          activeLeadCustomFields,
          lead.customFieldValues || []
        );
        setCustomFieldFormValues(initialCustomValues);
      } else {
        setCustomFieldFormValues({});
      }
    }
  }, [lead, activeLeadCustomFields]);

  const handleInputChange = (field: keyof LeadUpdateInput, value: string | number | undefined) => {
    setFormData((prev: Partial<LeadUpdateInput>) => ({
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
      const updateInput: Partial<LeadUpdateInput> = {
        name: formData.name,
        source: formData.source || undefined,
        description: formData.description || undefined,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        companyName: formData.companyName || undefined,
        estimatedValue: formData.estimatedValue || undefined,
      };

      // Process custom fields using utility
      const processedCustomFields = processCustomFieldsForSubmission(
        activeLeadCustomFields,
        customFieldFormValues
      );
      if (processedCustomFields.length > 0) {
        updateInput.customFields = processedCustomFields;
      }

      const result = await updateLead(lead.id, updateInput);
      
      if (result.lead) {
        toast({
          title: 'Lead Updated',
          description: 'The lead has been successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Failed to update lead.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead. Please try again.',
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
        <ModalHeader>Edit Lead</ModalHeader>
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
            loadingText="Updating..."
          >
            Update Lead
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditLeadModal; 