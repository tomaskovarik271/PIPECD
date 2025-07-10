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
  Box,
  Badge,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FiUser, FiHome, FiMail, FiPhone } from 'react-icons/fi';
import { useLeadsStore, LeadInput } from '../stores/useLeadsStore';
import { useOptimizedCustomFields } from '../hooks/useOptimizedCustomFields';
import { CustomFieldEntityType } from '../generated/graphql/graphql';
import { CustomFieldRenderer } from './common/CustomFieldRenderer';
import { 
  initializeCustomFieldValues,
  processCustomFieldsForSubmission 
} from '../lib/utils/customFieldProcessing';
import { useWFMConfigStore } from '../stores/useWFMConfigStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useDebounce } from '../lib/utils/useDebounce';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { duplicateDetectionService, type SimilarPersonResult, type SimilarOrganizationResult } from '../lib/services/duplicateDetectionService';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Smart suggestion interfaces (using the service types)
type PersonSuggestion = SimilarPersonResult;
interface OrganizationSuggestion extends SimilarOrganizationResult {
  address?: string;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose }) => {
  const colors = useThemeColors();
  const { createLead } = useLeadsStore();
  const { people } = usePeopleStore();
  const { organizations } = useOrganizationsStore();
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
  
  // NEW: Track selected entities for linking
  const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | undefined>();
  
  const [customFieldFormValues, setCustomFieldFormValues] = useState<Record<string, string | number | boolean | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smart suggestions state
  const [contactSuggestions, setContactSuggestions] = useState<PersonSuggestion[]>([]);
  const [companySuggestions, setCompanySuggestions] = useState<OrganizationSuggestion[]>([]);
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [selectedContactSuggestion, setSelectedContactSuggestion] = useState<PersonSuggestion | null>(null);
  const [selectedCompanySuggestion, setSelectedCompanySuggestion] = useState<OrganizationSuggestion | null>(null);

  // Use optimized custom fields hook
  const { 
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

  // Smart contact suggestions using real service
  const debouncedContactSearch = useDebounce(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setContactSuggestions([]);
      setShowContactSuggestions(false);
      return;
    }

    try {
      const suggestions = await duplicateDetectionService.findSimilarPeople(searchTerm, people);
      setContactSuggestions(suggestions);
      setShowContactSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error finding similar people:', error);
      setContactSuggestions([]);
      setShowContactSuggestions(false);
    }
  }, 300);

  // Smart company suggestions using real service
  const debouncedCompanySearch = useDebounce(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setCompanySuggestions([]);
      setShowCompanySuggestions(false);
      return;
    }

          try {
        const suggestions = await duplicateDetectionService.findSimilarOrganizations(searchTerm);
        // Add address field for compatibility
        const enhancedSuggestions = suggestions.map(org => ({
          ...org,
          address: organizations.find(o => o.id === org.id)?.address || undefined,
        }));
        setCompanySuggestions(enhancedSuggestions);
        setShowCompanySuggestions(enhancedSuggestions.length > 0);
      } catch (error) {
        console.error('Error finding similar organizations:', error);
        setCompanySuggestions([]);
        setShowCompanySuggestions(false);
      }
  }, 300);

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
        wfmProjectTypeId: 'AUTO_DEFAULT_LEAD_QUALIFICATION',
      });
      setIsSubmitting(false);
      setSelectedContactSuggestion(null);
      setSelectedCompanySuggestion(null);
      setShowContactSuggestions(false);
      setShowCompanySuggestions(false);

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

    // Trigger smart suggestions
    if (field === 'contactName' && typeof value === 'string') {
      debouncedContactSearch(value);
    }
    if (field === 'companyName' && typeof value === 'string') {
      debouncedCompanySearch(value);
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean | string[]) => {
    setCustomFieldFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSelectContactSuggestion = (suggestion: PersonSuggestion) => {
    setSelectedContactSuggestion(suggestion);
    setSelectedPersonId(suggestion.id); // NEW: Capture entity ID for linking
    setFormData(prev => ({
      ...prev,
      contactName: suggestion.name,
      contactEmail: suggestion.email || prev.contactEmail,
      contactPhone: suggestion.phone || prev.contactPhone,
      companyName: suggestion.organization || prev.companyName,
    }));
    setShowContactSuggestions(false);
  };

  const handleSelectCompanySuggestion = (suggestion: OrganizationSuggestion) => {
    setSelectedCompanySuggestion(suggestion);
    setSelectedOrganizationId(suggestion.id); // NEW: Capture entity ID for linking
    setFormData(prev => ({
      ...prev,
      companyName: suggestion.name,
    }));
    setShowCompanySuggestions(false);
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
        // NEW: Entity-based references when suggestions were selected
        personId: selectedPersonId || undefined,
        organizationId: selectedOrganizationId || undefined,
        estimatedValue: formData.estimatedValue || undefined,
        wfmProjectTypeId: 'AUTO_DEFAULT_LEAD_QUALIFICATION',
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
          description: selectedContactSuggestion || selectedCompanySuggestion 
            ? 'Lead created with smart entity linking.' 
            : 'The lead has been successfully created.',
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
              <FormControl position="relative">
                <FormLabel>
                  <Flex align="center" gap={2}>
                    <Icon as={FiUser} />
                    Contact Name
                    {selectedContactSuggestion && (
                      <Badge colorScheme="blue" size="sm">Smart Linked</Badge>
                    )}
                  </Flex>
                </FormLabel>
                <Input
                  value={formData.contactName || ''}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Contact person name"
                  isDisabled={isSubmitting}
                />
                
                {/* Contact Suggestions Dropdown */}
                {showContactSuggestions && contactSuggestions.length > 0 && (
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    zIndex={1000}
                    bg={colors.bg.card}
                    border="1px solid"
                    borderColor={colors.border.default}
                    borderRadius="md"
                    boxShadow="lg"
                    maxH="200px"
                    overflowY="auto"
                    mt={1}
                  >
                    {contactSuggestions.map((suggestion) => (
                      <Box
                        key={suggestion.id}
                        p={3}
                        cursor="pointer"
                        _hover={{ bg: colors.interactive.hover }}
                        onClick={() => handleSelectContactSuggestion(suggestion)}
                        borderBottom="1px solid"
                        borderColor={colors.border.default}
                        _last={{ border: 'none' }}
                      >
                        <Flex align="center" gap={2}>
                          <Icon as={FiUser} color={colors.text.accent} />
                          <Box flex={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {suggestion.name}
                            </Text>
                            {suggestion.email && (
                              <Text fontSize="xs" color={colors.text.secondary}>
                                {suggestion.email}
                              </Text>
                            )}
                            {suggestion.organization && (
                              <Text fontSize="xs" color={colors.text.secondary}>
                                at {suggestion.organization}
                              </Text>
                            )}
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </Box>
                )}
              </FormControl>

              <FormControl position="relative">
                <FormLabel>
                  <Flex align="center" gap={2}>
                    <Icon as={FiHome} />
                    Company Name
                    {selectedCompanySuggestion && (
                      <Badge colorScheme="green" size="sm">Smart Linked</Badge>
                    )}
                  </Flex>
                </FormLabel>
                <Input
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Company name"
                  isDisabled={isSubmitting}
                />
                
                {/* Company Suggestions Dropdown */}
                {showCompanySuggestions && companySuggestions.length > 0 && (
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    zIndex={1000}
                    bg={colors.bg.card}
                    border="1px solid"
                    borderColor={colors.border.default}
                    borderRadius="md"
                    boxShadow="lg"
                    maxH="200px"
                    overflowY="auto"
                    mt={1}
                  >
                    {companySuggestions.map((suggestion) => (
                      <Box
                        key={suggestion.id}
                        p={3}
                        cursor="pointer"
                        _hover={{ bg: colors.interactive.hover }}
                        onClick={() => handleSelectCompanySuggestion(suggestion)}
                        borderBottom="1px solid"
                        borderColor={colors.border.default}
                        _last={{ border: 'none' }}
                      >
                        <Flex align="center" gap={2}>
                          <Icon as={FiHome} color={colors.text.accent} />
                          <Box flex={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {suggestion.name}
                            </Text>
                            {suggestion.address && (
                              <Text fontSize="xs" color={colors.text.secondary}>
                                {suggestion.address}
                              </Text>
                            )}
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </Box>
                )}
              </FormControl>
            </HStack>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>
                  <Flex align="center" gap={2}>
                    <Icon as={FiMail} />
                    Contact Email
                  </Flex>
                </FormLabel>
                <Input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                  isDisabled={isSubmitting}
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  <Flex align="center" gap={2}>
                    <Icon as={FiPhone} />
                    Contact Phone
                  </Flex>
                </FormLabel>
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

            {/* Smart Linking Summary */}
            {(selectedContactSuggestion || selectedCompanySuggestion) && (
              <Box
                p={3}
                bg={colors.bg.card}
                borderRadius="md"
                border="1px solid"
                borderColor={colors.border.default}
                width="100%"
              >
                <Text fontSize="sm" fontWeight="semibold" mb={2} color={colors.text.accent}>
                  Smart Entity Linking Active
                </Text>
                {selectedContactSuggestion && (
                  <Text fontSize="xs" color={colors.text.secondary}>
                    • Contact linked to existing person: {selectedContactSuggestion.name}
                  </Text>
                )}
                {selectedCompanySuggestion && (
                  <Text fontSize="xs" color={colors.text.secondary}>
                    • Company linked to existing organization: {selectedCompanySuggestion.name}
                  </Text>
                )}
                <Text fontSize="xs" color={colors.text.secondary} mt={1}>
                  This will help with future lead conversion and duplicate prevention.
                </Text>
              </Box>
            )}
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