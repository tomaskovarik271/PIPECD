import React, { useState, useEffect } from 'react';
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
import { usePeopleStore } from '../../stores/usePeopleStore';
import { useOrganizationsStore } from '../../stores/useOrganizationsStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useDebounce } from '../../lib/utils/useDebounce';
import { duplicateDetectionService, type SimilarOrganizationResult } from '../../lib/services/duplicateDetectionService';

interface InlinePersonFormProps {
  onCreated: (person: any) => void;
  onCancel: () => void;
  prefilledOrganizationId?: string;
}

interface PersonFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization_id: string;
  notes: string;
}

const InlinePersonForm: React.FC<InlinePersonFormProps> = ({
  onCreated,
  onCancel,
  prefilledOrganizationId,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const { createPerson, peopleLoading } = usePeopleStore();
  const { organizations, fetchOrganizations } = useOrganizationsStore();

  const [formData, setFormData] = useState<PersonFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization_id: prefilledOrganizationId || '',
    notes: '',
  });

  const [orgSuggestions, setOrgSuggestions] = useState<SimilarOrganizationResult[]>([]);
  const [isCheckingSuggestions, setIsCheckingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Debounced organization suggestion based on email using real service
  const debouncedEmailCheck = useDebounce(async (email: string) => {
    if (!email.includes('@') || email.split('@')[1]?.length < 3) {
      setOrgSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsCheckingSuggestions(true);
    try {
      const suggestions = await duplicateDetectionService.findOrganizationByEmailDomain(email, organizations);
      setOrgSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0 && !formData.organization_id);
    } catch (error) {
      console.error('Error checking email suggestions:', error);
    } finally {
      setIsCheckingSuggestions(false);
    }
  }, 500);

  useEffect(() => {
    debouncedEmailCheck(formData.email);
  }, [formData.email, debouncedEmailCheck]);

  const handleInputChange = (field: keyof PersonFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectSuggestedOrg = (organization: any) => {
    setFormData(prev => ({ ...prev, organization_id: organization.id }));
    setShowSuggestions(false);
  };

  const handleCreate = async () => {
    if (!formData.first_name.trim() && !formData.last_name.trim() && !formData.email.trim()) {
      toast({
        title: 'Person information required',
        description: 'Please provide at least a name or email address.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const personInput = {
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        organization_id: formData.organization_id || undefined,
        notes: formData.notes.trim() || undefined,
      };

      const newPerson = await createPerson(personInput);
      
      if (newPerson) {
        const displayName = [newPerson.first_name, newPerson.last_name].filter(Boolean).join(' ') || newPerson.email;
        toast({
          title: 'Person Created',
          description: `${displayName} has been created successfully.`,
          status: 'success',
          duration: 3000,
        });
        onCreated(newPerson);
      }
    } catch (error) {
      toast({
        title: 'Failed to create person',
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
          Create New Person
        </Text>
        <Button size="xs" variant="ghost" onClick={onCancel}>
          <FiX />
        </Button>
      </HStack>

      <VStack spacing={3} align="stretch">
        <HStack spacing={2}>
          <FormControl>
            <FormLabel fontSize="sm">First Name</FormLabel>
            <Input
              placeholder="John"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              bg={colors.bg.input}
              borderColor={colors.border.input}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Last Name</FormLabel>
            <Input
              placeholder="Doe"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              bg={colors.bg.input}
              borderColor={colors.border.input}
            />
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel fontSize="sm">Email</FormLabel>
          <HStack>
            <Input
              type="email"
              placeholder="john.doe@company.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              bg={colors.bg.input}
              borderColor={colors.border.input}
            />
            {isCheckingSuggestions && <Spinner size="sm" />}
          </HStack>
        </FormControl>

        {/* Organization Suggestions based on Email */}
        {showSuggestions && (
          <Alert status="info" size="sm" borderRadius="md">
            <AlertIcon />
            <Box flex={1}>
              <AlertTitle fontSize="sm">Organization suggestion:</AlertTitle>
              <VStack align="start" mt={2} spacing={1}>
                {orgSuggestions.map(org => (
                  <Button
                    key={org.id}
                    variant="ghost"
                    size="xs"
                    leftIcon={<FiUser />}
                    onClick={() => handleSelectSuggestedOrg(org)}
                    color={colors.text.primary}
                  >
                    {org.suggestion}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowSuggestions(false)}
                  color={colors.text.secondary}
                >
                  Skip organization linking
                </Button>
              </VStack>
            </Box>
          </Alert>
        )}

        <FormControl>
          <FormLabel fontSize="sm">Phone</FormLabel>
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            bg={colors.bg.input}
            borderColor={colors.border.input}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">Organization</FormLabel>
          <Select 
            placeholder="Select organization (optional)"
            value={formData.organization_id}
            onChange={(e) => handleInputChange('organization_id', e.target.value)}
            bg={colors.bg.input}
            borderColor={colors.border.input}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </Select>
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

        <HStack spacing={2} pt={2}>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleCreate}
            isLoading={peopleLoading}
            loadingText="Creating..."
          >
            Create Person
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

export default InlinePersonForm; 