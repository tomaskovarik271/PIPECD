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
  Spinner,
  Alert,
  AlertIcon,
  Text,
} from '@chakra-ui/react';
import { useActivitiesStore, GeneratedCreateActivityInput as CreateActivityInput, ActivityType } from '../../stores/useActivitiesStore';
import { usePeopleStore, Person } from '../../stores/usePeopleStore';
import { useDealsStore, Deal } from '../../stores/useDealsStore';
import { useOrganizationsStore, Organization } from '../../stores/useOrganizationsStore';

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

// Define type for link selection
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
          deal_id: initialDealId || null, 
          person_id: null,
          organization_id: null,
      }
  });

  // State for the selected link type
  const [selectedLinkType, setSelectedLinkType] = useState<LinkType>(initialDealId ? 'deal' : 'none'); 

  // Fetch related entities (only if not pre-linking via initialDealId)
  useEffect(() => {
    if (!initialDealId) {
      fetchDeals(); 
      fetchPeople();
      fetchOrganizations();
    } 
  }, [fetchDeals, fetchPeople, fetchOrganizations, initialDealId]);
  
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

        <FormControl isInvalid={!!errors.due_date}>
          <FormLabel htmlFor='due_date'>Due Date/Time</FormLabel>
          <Input
            id='due_date'
            type='datetime-local' // Use datetime-local for combined date and time
            {...register('due_date')}
          />
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
            <FormLabel>Link To (Select One)</FormLabel>
            {isLoadingLinks && <Spinner size="sm" />}
            {!isLoadingLinks && (
              <RadioGroup onChange={handleLinkTypeChange} value={selectedLinkType}>
                <HStack spacing={4}>
                  <Radio value='deal'>Deal</Radio>
                  <Radio value='person'>Person</Radio>
                  <Radio value='organization'>Organization</Radio>
                  <Radio value='none'>None</Radio> {/* "None" might be removed if a link is always required */}
                </HStack>
              </RadioGroup>
            )}

            {!isLoadingLinks && selectedLinkType === 'deal' && (
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
            {!isLoadingLinks && selectedLinkType === 'person' && (
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
             {!isLoadingLinks && selectedLinkType === 'organization' && (
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
             {(errors.deal_id || errors.person_id || errors.organization_id) && 
                <FormErrorMessage>Please select a linked entity if a type is chosen.</FormErrorMessage> }
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