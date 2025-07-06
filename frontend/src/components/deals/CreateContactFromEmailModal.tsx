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
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Text,
  Divider,
  Badge,
  useToast,
  Box,
} from '@chakra-ui/react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import SearchableSelect, { SearchableSelectOption } from '../common/SearchableSelect';
import InlineOrganizationForm from '../common/InlineOrganizationForm';

const CREATE_CONTACT_FROM_EMAIL = gql`
  mutation CreateContactFromEmail($input: CreateContactFromEmailInput!) {
    createContactFromEmail(input: $input) {
      id
      first_name
      last_name
      email
    }
  }
`;

const GET_ORGANIZATIONS = gql`
  query GetOrganizationsForContact {
    organizations {
      id
      name
    }
  }
`;

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  content?: string;
  date?: string;
}

interface Organization {
  id: string;
  name: string;
  website?: string | null;
  address?: string | null;
}

interface CreateContactFromEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailMessage: EmailMessage;
  dealId: string;
}

// Helper function to parse email contact information
function parseEmailContact(emailString: string): {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
} {
  const match = emailString.match(/^(.+?)\s*<(.+?)>$/) || [null, null, emailString];
  const name = match[1]?.trim();
  const email = match[2]?.trim() || emailString.trim();
  
  if (name) {
    const nameParts = name.split(' ');
    return {
      email,
      name,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || undefined
    };
  }
  
  return { email };
}

const CreateContactFromEmailModal: React.FC<CreateContactFromEmailModalProps> = ({
  isOpen,
  onClose,
  emailMessage,
  dealId,
}) => {
  const colors = useThemeColors();
  const toast = useToast();

  const [formData, setFormData] = useState({
    emailAddress: '',
    firstName: '',
    lastName: '',
    organizationId: '',
    addAsDealParticipant: true,
    notes: '',
  });

  const [showInlineOrgForm, setShowInlineOrgForm] = useState(false);

  // Parse email information when modal opens
  useEffect(() => {
    if (isOpen && emailMessage) {
      const contactInfo = parseEmailContact(emailMessage.from);
      setFormData({
        emailAddress: contactInfo.email,
        firstName: contactInfo.firstName || '',
        lastName: contactInfo.lastName || '',
        organizationId: '',
        addAsDealParticipant: true,
        notes: `Contact created from email: ${emailMessage.subject}`,
      });
    }
  }, [isOpen, emailMessage]);

  // GraphQL hooks
  const { data: organizationsData, loading: organizationsLoading, error: organizationsError } = useQuery(GET_ORGANIZATIONS);

  // Convert organizations to SearchableSelect options
  const organizationOptions: SearchableSelectOption[] = useMemo(() => {
    return (organizationsData?.organizations || []).map((org: Organization) => ({
      value: org.id,
      label: org.name,
    }));
  }, [organizationsData]);

  const handleOrganizationChange = (value: string) => {
    setFormData({ ...formData, organizationId: value });
  };

  const handleCreateNewOrganization = () => {
    setShowInlineOrgForm(true);
  };

  const handleOrganizationCreated = (organization: Organization) => {
    setFormData({ ...formData, organizationId: organization.id });
    setShowInlineOrgForm(false);
  };

  const [createContactFromEmail, { loading }] = useMutation(CREATE_CONTACT_FROM_EMAIL, {
    onCompleted: (data) => {
      toast({
        title: 'Contact Created Successfully',
        description: `${data.createContactFromEmail.first_name} ${data.createContactFromEmail.last_name} has been added to your contacts.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      onClose();
      // Reset form
      setFormData({
        emailAddress: '',
        firstName: '',
        lastName: '',
        organizationId: '',
        addAsDealParticipant: true,
        notes: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Contact',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleCreate = () => {
    if (!formData.emailAddress) {
      toast({
        title: 'Email Required',
        description: 'Please provide an email address for the contact.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    createContactFromEmail({
      variables: {
        input: {
          emailId: emailMessage.id,
          emailAddress: formData.emailAddress,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          dealId: dealId,
          organizationId: formData.organizationId || undefined,
          addAsDealParticipant: formData.addAsDealParticipant,
          notes: formData.notes || undefined,
        },
      },
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      emailAddress: '',
      firstName: '',
      lastName: '',
      organizationId: '',
      addAsDealParticipant: true,
      notes: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Text>Create Contact from Email</Text>
            <Badge colorScheme="blue" variant="subtle">
              NEW
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Email Context */}
            {emailMessage && (
              <VStack spacing={2} align="stretch" p={3} bg={colors.bg.elevated} borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                  Email Context
                </Text>
                <Text fontSize="sm" color={colors.text.secondary}>
                  <strong>From:</strong> {emailMessage.from}
                </Text>
                <Text fontSize="sm" color={colors.text.secondary}>
                  <strong>Subject:</strong> {emailMessage.subject}
                </Text>
              </VStack>
            )}

            <Divider />

            {/* Contact Information */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" fontWeight="medium" color={colors.text.primary}>
                Contact Information
              </Text>

              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  placeholder="contact@company.com"
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Organization</FormLabel>
                <SearchableSelect
                  options={organizationOptions}
                  value={formData.organizationId || ''}
                  onChange={handleOrganizationChange}
                  placeholder="Select organization (optional)"
                  isLoading={organizationsLoading}
                  error={organizationsError?.message}
                  isDisabled={organizationsLoading}
                  allowCreate={true}
                  createLabel="Create New Organization"
                  onCreateNew={handleCreateNewOrganization}
                />
                
                {/* Inline Organization Creation */}
                {showInlineOrgForm && (
                  <Box mt={3}>
                    <InlineOrganizationForm
                      onCreated={handleOrganizationCreated}
                      onCancel={() => setShowInlineOrgForm(false)}
                    />
                  </Box>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this contact..."
                  rows={3}
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                />
              </FormControl>

              <Checkbox
                isChecked={formData.addAsDealParticipant}
                onChange={(e) => setFormData({ ...formData, addAsDealParticipant: e.target.checked })}
                colorScheme="blue"
              >
                <Text fontSize="sm">Add as deal participant</Text>
              </Checkbox>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleCreate}
            isLoading={loading}
            loadingText="Creating..."
          >
            Create Contact
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateContactFromEmailModal; 