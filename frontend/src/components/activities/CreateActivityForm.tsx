import { useForm, SubmitHandler } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Checkbox,
  VStack,
  useToast,
  RadioGroup,
  Radio,
  HStack,
  Box,
  Spinner,
  Alert,
  AlertIcon,
  Text,
} from '@chakra-ui/react';
import { useActivitiesStore, GeneratedCreateActivityInput as CreateActivityInput, ActivityType } from '../../stores/useActivitiesStore';
import { usePeopleStore, Person } from '../../stores/usePeopleStore';
import { useDealsStore, Deal } from '../../stores/useDealsStore';
import { useOrganizationsStore, Organization } from '../../stores/useOrganizationsStore';
import { useUserListStore } from '../../stores/useUserListStore';

// Define Activity Types matching GraphQL Enum
const activityTypes = [
  'TASK',
  'MEETING',
  'CALL',
  'EMAIL',
  'DEADLINE',
];

interface CreateActivityFormProps {
  onClose: () => void;
  onSuccess?: () => void; // Optional callback on successful creation
  initialDealId?: string; 
  initialDealName?: string; // ADDED: To display the name of the pre-linked deal
}

// Use the store's CreateActivityInput for form values
type FormValues = CreateActivityInput;

// Define type for link selection (keeping for backwards compatibility with existing logic)
type LinkType = 'deal' | 'person' | 'organization' | 'none';

function CreateActivityForm({ onClose, onSuccess, initialDealId, initialDealName }: CreateActivityFormProps) {
  // Actions and state from useActivitiesStore
  const { createActivity, activitiesError, activitiesLoading } = useActivitiesStore();

  // People state & actions from usePeopleStore
  const { people, fetchPeople, peopleLoading, peopleError: _peopleError } = usePeopleStore();

  // Deals state & actions from useDealsStore
  const { deals, fetchDeals, dealsLoading, dealsError: _dealsError } = useDealsStore(); 

  // Organizations state & actions from useOrganizationsStore
  const { organizations, fetchOrganizations, organizationsLoading, organizationsError: _organizationsError } = useOrganizationsStore();

  // Users state & actions from useUserListStore
  const { users: userList, loading: usersLoading, fetchUsers, hasFetched: hasFetchedUsers } = useUserListStore();

  const toast = useToast();
  const { 
    handleSubmit, 
    register, 
    formState: { errors, isSubmitting },
    reset, 
    setValue,
    watch
  } = useForm<FormValues>({
      defaultValues: {
          type: activityTypes[0] as ActivityType,
          subject: '',
          due_date: null,
          notes: '',
          is_done: false,
          assigned_to_user_id: null,
          deal_id: initialDealId || null, 
          person_id: null,
          organization_id: null,
      }
  });

  // State for the selected link type
  const [selectedLinkType, setSelectedLinkType] = useState<LinkType>(initialDealId ? 'deal' : 'none');
  const [showDealDropdown, setShowDealDropdown] = useState(!!initialDealId);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [showOrganizationDropdown, setShowOrganizationDropdown] = useState(false); 

  // Fetch related entities (only if not pre-linking via initialDealId)
  useEffect(() => {
    if (!initialDealId) {
      fetchDeals(); 
      fetchPeople();
      fetchOrganizations();
    } 
    // Always fetch users for assignment
    if (!hasFetchedUsers) {
      fetchUsers();
    }
  }, [fetchDeals, fetchPeople, fetchOrganizations, initialDealId, fetchUsers, hasFetchedUsers]);
  
  // If initialDealId is provided, ensure the form value for deal_id is set.
  useEffect(() => {
    if (initialDealId) {
      setValue('deal_id', initialDealId);
      setSelectedLinkType('deal'); 
    }
  }, [initialDealId, setValue]);


  // Clear other link IDs when radio selection changes (Only if not initialDealId context)
  const handleLinkTypeChange = (nextValue: string) => {
      if (initialDealId) return; // Don't allow changing link type if pre-set

      const linkType = nextValue as LinkType;
      setSelectedLinkType(linkType);
      // Clear other fields when changing type
      if (linkType !== 'deal') setValue('deal_id', null);
      if (linkType !== 'person') setValue('person_id', null);
      if (linkType !== 'organization') setValue('organization_id', null);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    // console.log('Submitting activity:', values);
    try {
      // Ensure at least one link is present (client-side check mimicking backend)
      // This check is still valid, as initialDealId would satisfy it.
      if (!values.deal_id && !values.person_id && !values.organization_id) {
        toast({ title: 'Link Required', description: 'Please link the activity to a Deal, Person, or Organization.', status: 'warning', duration: 4000, isClosable: true });
        return; // Prevent submission
      }

      // Convert empty strings to null for optional fields if necessary (esp. links)
      const submissionData = { ...values };
      if (!submissionData.deal_id) submissionData.deal_id = null;
      if (!submissionData.person_id) submissionData.person_id = null;
      if (!submissionData.organization_id) submissionData.organization_id = null;
      if (!submissionData.notes) submissionData.notes = null;

      // Format due_date to ISO 8601 if it exists
      if (submissionData.due_date) {
        try {
          // Create a Date object from the local datetime string
          const date = new Date(submissionData.due_date);
          // Check if the date is valid before converting
          if (!isNaN(date.getTime())) {
            submissionData.due_date = date.toISOString();
          } else {
            // Handle invalid date input from the browser - could clear or keep original string based on desired UX
            console.warn("Invalid date string from datetime-local input:", submissionData.due_date);
            // Setting to null to avoid sending invalid string to backend
            submissionData.due_date = null; 
          }
        } catch (error) {
            console.error("Error parsing date:", error);
            // Handle potential errors during Date construction/conversion, set to null
            submissionData.due_date = null;
        }
      } else {
         // Ensure it's explicitly null if not provided or cleared
         submissionData.due_date = null;
      }

      const createdActivity = await createActivity(submissionData);

      if (createdActivity) {
        toast({ title: 'Activity created.', status: 'success', duration: 3000, isClosable: true });
        reset(); // Reset form on success
        onSuccess?.(); // Call optional success callback (e.g., refresh list)
        onClose(); // Close modal
      } else {
        // Error toast is likely handled by the store hook or generic error boundary
        // but we can add a specific one here if desired.
        toast({ title: 'Failed to create activity', description: activitiesError || 'Please check the details and try again.', status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: 'An error occurred', description: 'Please try again.', status: 'error', duration: 5000, isClosable: true });
    }
  };

  // Loading state for dropdowns
  const isLoadingLinks = dealsLoading || peopleLoading || organizationsLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} p={4}>
        {/* Optionally display activityError if it means form submission error */}
        {activitiesError && (
            <Alert status="error" mb={4}>
                <AlertIcon />
                {activitiesError}
            </Alert>
        )}
        <FormControl isInvalid={!!errors.subject}>
          <FormLabel htmlFor='subject'>Subject</FormLabel>
          <Input
            id='subject'
            {...register('subject', { required: 'Subject is required' })}
          />
          <FormErrorMessage>{errors.subject?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.type}>
            <FormLabel htmlFor='type'>Type</FormLabel>
            <Select id='type' {...register('type', { required: 'Type is required' })} defaultValue={activityTypes[0] as ActivityType}>
                {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </Select>
            <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.assigned_to_user_id}>
          <FormLabel htmlFor='assigned_to_user_id'>Assign To</FormLabel>
          {usersLoading && <Spinner size="sm" />}
          {!usersLoading && (
            <Select 
              id='assigned_to_user_id' 
              placeholder='Unassigned'
              {...register('assigned_to_user_id')}
            >
              {userList.map(user => (
                <option key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </option>
              ))}
            </Select>
          )}
          <FormErrorMessage>{errors.assigned_to_user_id?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.due_date}>
          <FormLabel htmlFor='due_date'>Due Date/Time</FormLabel>
          <Box 
            borderWidth="1px" 
            borderRadius="md" 
            borderColor="inherit"
            bg="inherit"
            _hover={{ borderColor: "gray.300" }}
            _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
            transition="all 0.2s"
          >
            <HStack spacing={0} divider={<Box w="1px" h="6" bg="gray.200" />}>
              <Box flex={1}>
                <Input
                  id='due_date_date'
                  type='date'
                  border="none"
                  _focus={{ boxShadow: "none" }}
                  placeholder='Select date'
                  onChange={(e) => {
                    const currentValue = watch('due_date') || '';
                    const timeValue = currentValue.includes('T') ? currentValue.split('T')[1] : '09:00';
                    const newDateTime = e.target.value ? `${e.target.value}T${timeValue}` : '';
                    setValue('due_date', newDateTime);
                  }}
                  value={watch('due_date') ? watch('due_date')?.split('T')[0] || '' : ''}
                />
              </Box>
              <Box flex={0} minW="120px">
                <Select
                  placeholder='Time'
                  border="none"
                  _focus={{ boxShadow: "none" }}
                  onChange={(e) => {
                    const currentValue = watch('due_date') || '';
                    // Use existing date or fallback (optimized to prevent Date creation in render)
                    const dateValue = currentValue.includes('T') ? currentValue.split('T')[0] : 
                      (currentValue || new Date().toISOString().split('T')[0]);
                    const newDateTime = dateValue && e.target.value ? `${dateValue}T${e.target.value}` : '';
                    setValue('due_date', newDateTime);
                  }}
                  value={watch('due_date') ? watch('due_date')?.split('T')[1]?.substring(0, 5) || '' : ''}
                >
                  {/* Generate 15-minute interval options */}
                  {Array.from({ length: 96 }, (_, i) => {
                    const hours = Math.floor(i / 4);
                    const minutes = (i % 4) * 15;
                    const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    const displayValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    return (
                      <option key={timeValue} value={timeValue}>
                        {displayValue}
                      </option>
                    );
                  })}
                </Select>
              </Box>
            </HStack>
          </Box>
          <FormErrorMessage>{errors.due_date?.message as string}</FormErrorMessage>
        </FormControl>
        
        {/* --- Linked Entity Selection --- */}
        {initialDealId && initialDealName && (
          <FormControl mt={2}>
            <FormLabel>Linked To</FormLabel>
            <Text fontWeight="bold">Deal: {initialDealName}</Text>
          </FormControl>
        )}

        {!initialDealId && (
          <FormControl isInvalid={!!errors.deal_id || !!errors.person_id || !!errors.organization_id}>
            <FormLabel>Link To (Select One or More)</FormLabel>
            {isLoadingLinks && <Spinner size="sm" />}
            
            {!isLoadingLinks && (
              <VStack align="stretch" spacing={3}>
                {/* Deal Selection */}
                <Box>
                  <Checkbox 
                    onChange={(e) => {
                      setShowDealDropdown(e.target.checked);
                      if (!e.target.checked) setValue('deal_id', null);
                    }}
                    isChecked={showDealDropdown}
                    isDisabled={!!initialDealId}
                  >
                    Link to Deal
                  </Checkbox>
                  {showDealDropdown && (
                    <Select 
                      id='deal_id' 
                      placeholder='Select Deal' 
                      {...register('deal_id')} 
                      mt={2}
                    >
                      {deals.filter(d => d && d.id && d.name).map((deal: Deal) => (
                        <option key={deal.id} value={deal.id}>{deal.name}</option>
                      ))}
                    </Select>
                  )}
                </Box>

                {/* Person Selection */}
                <Box>
                  <Checkbox 
                    onChange={(e) => {
                      setShowPersonDropdown(e.target.checked);
                      if (!e.target.checked) setValue('person_id', null);
                    }}
                    isChecked={showPersonDropdown}
                  >
                    Link to Person
                  </Checkbox>
                  {showPersonDropdown && (
                    <Select 
                      id='person_id' 
                      placeholder='Select Person' 
                      {...register('person_id')} 
                      mt={2}
                    >
                      {people.map((person: Person) => (
                        <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>
                      ))}
                    </Select>
                  )}
                </Box>

                {/* Organization Selection */}
                <Box>
                  <Checkbox 
                    onChange={(e) => {
                      setShowOrganizationDropdown(e.target.checked);
                      if (!e.target.checked) setValue('organization_id', null);
                    }}
                    isChecked={showOrganizationDropdown}
                  >
                    Link to Organization
                  </Checkbox>
                  {showOrganizationDropdown && (
                    <Select 
                      id='organization_id' 
                      placeholder='Select Organization' 
                      {...register('organization_id')} 
                      mt={2}
                    >
                      {organizations.map((org: Organization) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </Select>
                  )}
                </Box>
              </VStack>
            )}
            
            {(errors.deal_id || errors.person_id || errors.organization_id) && 
              <FormErrorMessage>Please select at least one entity to link to.</FormErrorMessage> }
          </FormControl>
        )}
        {/* --- End Linked Entity Selection --- */}
        
        <FormControl isInvalid={!!errors.notes}>
          <FormLabel htmlFor='notes'>Notes</FormLabel>
          <Textarea id='notes' {...register('notes')} />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <Checkbox {...register('is_done')}>Mark as Done</Checkbox>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting || activitiesLoading}>
          Create Activity
        </Button>
      </VStack>
    </form>
  );
}

export default CreateActivityForm; 