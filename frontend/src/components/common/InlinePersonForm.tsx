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
import { duplicateDetectionService, type SimilarPersonResult } from '../../lib/services/duplicateDetectionService';
import type { Person, Organization } from '../../generated/graphql/graphql';
import { useMutation } from '@apollo/client';
import { CREATE_PERSON_ORGANIZATION_ROLE } from '../../lib/graphql/personOrganizationRoleOperations';

interface SimilarOrganizationResult {
  id: string;
  suggestion: string;
}

interface InlinePersonFormProps {
  onCreated: (person: Person) => void;
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
  const { createPerson, peopleLoading, people } = usePeopleStore();
  const { organizations, fetchOrganizations } = useOrganizationsStore();

  const [formData, setFormData] = useState<PersonFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization_id: prefilledOrganizationId || '',
    notes: '',
  });

  // Organization suggestions state (existing)
  const [orgSuggestions, setOrgSuggestions] = useState<SimilarOrganizationResult[]>([]);
  const [isCheckingSuggestions, setIsCheckingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // NEW: Person duplicate detection state
  const [personDuplicates, setPersonDuplicates] = useState<SimilarPersonResult[]>([]);
  const [isCheckingPersonDuplicates, setIsCheckingPersonDuplicates] = useState(false);
  const [showPersonDuplicates, setShowPersonDuplicates] = useState(false);

  // GraphQL mutation for creating organization role
  const [createPersonOrganizationRole] = useMutation(CREATE_PERSON_ORGANIZATION_ROLE);

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Existing: Debounced organization suggestion based on email using real service
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

  // NEW: Debounced person duplicate detection
  const debouncedPersonCheck = useDebounce(async (formData: PersonFormData) => {
    // Build search term from available data
    const searchTerms = [
      formData.first_name.trim(),
      formData.last_name.trim(),
      formData.email.trim()
    ].filter(Boolean).join(' ');
    
    if (searchTerms.length < 2) {
      setPersonDuplicates([]);
      setShowPersonDuplicates(false);
      return;
    }

    setIsCheckingPersonDuplicates(true);
    try {
      // Check for similar people using name + email
      const personSuggestions = await duplicateDetectionService.findSimilarPeople(
        searchTerms, 
        people
      );
      setPersonDuplicates(personSuggestions);
      setShowPersonDuplicates(personSuggestions.length > 0);
    } catch (error) {
      console.error('Error checking person duplicates:', error);
    } finally {
      setIsCheckingPersonDuplicates(false);
    }
  }, 500);

  useEffect(() => {
    debouncedEmailCheck(formData.email);
  }, [formData.email, debouncedEmailCheck]);

  // NEW: Trigger person duplicate check when name or email changes
  useEffect(() => {
    debouncedPersonCheck(formData);
  }, [
    formData.first_name,
    formData.last_name,
    formData.email,
    debouncedPersonCheck
  ]);

  const handleInputChange = (field: keyof PersonFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectSuggestedOrg = (suggestion: SimilarOrganizationResult) => {
    setFormData(prev => ({ ...prev, organization_id: suggestion.id }));
    setShowSuggestions(false);
  };

  // NEW: Handle selecting existing person
  const handleSelectExistingPerson = (person: SimilarPersonResult) => {
    // Create a Person object from SimilarPersonResult
    const existingPerson: Person = {
      __typename: 'Person',
      id: person.id,
      first_name: person.name.split(' ')[0] || '',
      last_name: person.name.split(' ').slice(1).join(' ') || '',
      email: person.email || '',
      phone: person.phone || '',
      notes: '',
      created_at: '',
      updated_at: '',
      user_id: '', // Will be filled by the actual person data
      customFieldValues: [],
      deals: [],
      organizationRoles: [],
    };

    toast({
      title: 'Existing Person Selected',
      description: `Selected ${person.name} instead of creating duplicate.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    onCreated(existingPerson);
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
      // Create person WITHOUT organization_id (using new role-based system)
      const personInput = {
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        // NOTE: No organization_id - we'll use organization roles instead
      };

      const newPerson = await createPerson(personInput);
      
      if (newPerson && formData.organization_id) {
        // Create primary organization role for the new person
        try {
          await createPersonOrganizationRole({
            variables: {
              personId: newPerson.id,
              input: {
                organization_id: formData.organization_id,
                role_title: 'Contact', // Default role title
                is_primary: false, // Don't automatically make it primary
                status: 'active'
              }
            }
          });
        } catch (roleError) {
          console.error('Error creating organization role:', roleError);
          // Person was created successfully, just show a warning about the role
          toast({
            title: 'Person created with warning',
            description: 'Person was created but organization role could not be set. You can add it manually.',
            status: 'warning',
            duration: 5000,
          });
        }
      }
      
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
            <HStack>
              <Input
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                bg={colors.bg.input}
                borderColor={colors.border.input}
              />
              {isCheckingPersonDuplicates && <Spinner size="sm" />}
            </HStack>
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

        {/* NEW: Person Duplicate Suggestions */}
        {showPersonDuplicates && (
          <Alert status="warning" size="sm" borderRadius="md">
            <AlertIcon />
            <Box flex={1}>
              <AlertTitle fontSize="sm" color={colors.text.primary}>Similar people found:</AlertTitle>
              <VStack align="start" mt={2} spacing={1}>
                {personDuplicates.map(person => (
                  <Button
                    key={person.id}
                    variant="solid"
                    size="xs"
                    leftIcon={<FiUser />}
                    onClick={() => handleSelectExistingPerson(person)}
                    colorScheme="blue"
                    bg="blue.500"
                    color="white"
                    _hover={{ bg: 'blue.600' }}
                    fontWeight="medium"
                  >
                    {person.suggestion}
                  </Button>
                ))}
                                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setShowPersonDuplicates(false)}
                    borderColor={colors.border.default}
                    color={colors.text.secondary}
                    _hover={{ bg: colors.bg.elevated }}
                  >
                  Create new person anyway
                </Button>
              </VStack>
            </Box>
          </Alert>
        )}

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
            {organizations.map((org: Organization) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
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
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default InlinePersonForm; 