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
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { usePeopleStore } from '../../stores/usePeopleStore';
import { useOrganizationsStore } from '../../stores/useOrganizationsStore';
import SearchableSelect, { SearchableSelectOption } from '../common/SearchableSelect';
import InlineOrganizationForm from '../common/InlineOrganizationForm';
import type { PersonInput } from '../../generated/graphql/graphql';

interface QuickContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefilledData?: Partial<PersonInput>;
}

const QuickContactModal: React.FC<QuickContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefilledData = {},
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const { createPerson: createPersonAction, peopleError } = usePeopleStore();
  const { organizations, organizationsLoading, fetchOrganizations } = useOrganizationsStore();

  // Form state
  const [formData, setFormData] = useState<PersonInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    organization_id: '',
    notes: '',
    customFields: [],
  });

  const [showInlineOrgForm, setShowInlineOrgForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load organizations when modal opens
  useEffect(() => {
    if (isOpen && organizations.length === 0) {
      fetchOrganizations();
    }
  }, [isOpen, organizations.length, fetchOrganizations]);

  // Pre-fill form data when provided
  useEffect(() => {
    if (isOpen && prefilledData) {
      setFormData(prev => ({
        ...prev,
        ...prefilledData,
      }));
    }
  }, [isOpen, prefilledData]);

  // Convert organizations to SearchableSelect options
  const organizationOptions: SearchableSelectOption[] = organizations.map(org => ({
    value: org.id,
    label: org.name,
  }));

  const handleInputChange = (field: keyof PersonInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || '',
    }));
    if (localError) setLocalError(null);
  };

  const handleOrganizationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      organization_id: value,
    }));
  };

  const handleCreateNewOrganization = () => {
    setShowInlineOrgForm(true);
  };

  const handleOrganizationCreated = (organization: { id: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      organization_id: organization.id,
    }));
    setShowInlineOrgForm(false);
    toast({
      title: 'Organization Created',
      description: `${organization.name} has been added to your organizations.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.first_name?.trim() && !formData.last_name?.trim() && !formData.email?.trim()) {
      setLocalError('Please provide at least a first name, last name, or email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setLocalError(null);

    try {
      // Create person with simplified data
      const personInput: PersonInput = {
        first_name: formData.first_name?.trim() || undefined,
        last_name: formData.last_name?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        job_title: formData.job_title?.trim() || undefined,
        organization_id: formData.organization_id || undefined,
        notes: formData.notes?.trim() || undefined,
        customFields: [],
      };

      const createdPerson = await createPersonAction(personInput);

      if (createdPerson) {
        toast({
          title: 'Contact Created',
          description: `${formData.first_name || formData.last_name || 'Contact'} has been successfully created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
        handleClose();
      } else {
        setLocalError(peopleError || 'Failed to create contact. Unknown error.');
      }
    } catch (error: any) {
      console.error('Error creating contact:', error);
      setLocalError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      job_title: '',
      organization_id: '',
      notes: '',
      customFields: [],
    });
    setLocalError(null);
    setShowInlineOrgForm(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg={colors.bg.elevated} borderColor={colors.border.default}>
        <ModalHeader color={colors.text.primary}>
          Create Contact
        </ModalHeader>
        <ModalCloseButton color={colors.text.secondary} />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {localError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {localError}
              </Alert>
            )}

            {/* Name Fields */}
            <FormControl>
              <FormLabel color={colors.text.primary}>First Name</FormLabel>
              <Input
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name..."
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color={colors.text.primary}>Last Name</FormLabel>
              <Input
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name..."
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
              />
            </FormControl>

            {/* Contact Info */}
            <FormControl>
              <FormLabel color={colors.text.primary}>Email</FormLabel>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address..."
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color={colors.text.primary}>Phone</FormLabel>
              <Input
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number..."
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
              />
            </FormControl>

            {/* Simplified Organization & Job Title */}
            <FormControl>
              <FormLabel color={colors.text.primary}>Job Title</FormLabel>
              <Input
                value={formData.job_title || ''}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="e.g., CEO, Manager, Sales Rep..."
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color={colors.text.primary}>Company</FormLabel>
              <SearchableSelect
                options={organizationOptions}
                value={formData.organization_id || ''}
                onChange={handleOrganizationChange}
                placeholder="Select company (optional)"
                isLoading={organizationsLoading}
                isDisabled={organizationsLoading || showInlineOrgForm}
                allowCreate={true}
                createLabel="Create New Company"
                onCreateNew={handleCreateNewOrganization}
              />
              
              {/* Inline Organization Creation */}
              {showInlineOrgForm && (
                <VStack mt={3} spacing={3}>
                  <InlineOrganizationForm
                    onCreated={handleOrganizationCreated}
                    onCancel={() => setShowInlineOrgForm(false)}
                  />
                </VStack>
              )}
            </FormControl>

            {/* Notes */}
            <FormControl>
              <FormLabel color={colors.text.primary}>Notes</FormLabel>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this contact..."
                rows={3}
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Creating..."
            isDisabled={showInlineOrgForm}
          >
            Create Contact
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuickContactModal;