import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
  Alert,
  AlertIcon,
  RadioGroup,
  Radio,
  HStack,
  Box,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { 
    useActivitiesStore, 
    GeneratedUpdateActivityInput as UpdateActivityInput,
    ActivityType, 
    Activity 
} from '../../stores/useActivitiesStore';
import { useDealsStore, Deal } from '../../stores/useDealsStore';
import { usePeopleStore, Person } from '../../stores/usePeopleStore';
import { useOrganizationsStore, Organization } from '../../stores/useOrganizationsStore';

// Define Activity Types matching GraphQL Enum
const activityTypes = [
  'TASK',
  'MEETING',
  'CALL',
  'EMAIL',
  'DEADLINE',
];

interface EditActivityFormProps {
  activity: Activity; // Use Activity type from store
  onClose: () => void;
  onSuccess?: () => void;
}

// Use UpdateActivityInput for form values, but make fields optional as not all are always updated
type FormValues = Partial<UpdateActivityInput>; // Use Partial for flexibility, or define a specific edit type

// Define type for link selection (same as CreateActivityForm)
type LinkType = 'deal' | 'person' | 'organization' | 'none';

function EditActivityForm({ activity, onClose, onSuccess }: EditActivityFormProps) {
  // Actions and state from useActivitiesStore
  const { updateActivity, activitiesError, activitiesLoading } = useActivitiesStore();
  const toast = useToast();
  
  // Fetching data for linked entities
  const { deals, fetchDeals, dealsLoading } = useDealsStore();
  const { people, fetchPeople, peopleLoading } = usePeopleStore();
  const { organizations, fetchOrganizations, organizationsLoading } = useOrganizationsStore();

  const getInitialLinkType = (): LinkType => {
    if (activity.deal_id) return 'deal';
    if (activity.person_id) return 'person';
    if (activity.organization_id) return 'organization';
    return 'none'; // Should ideally not be 'none' for an existing activity if links are mandatory
  };
  
  const [selectedLinkType, setSelectedLinkType] = useState<LinkType>(getInitialLinkType());

  const { 
    handleSubmit, 
    register, 
    formState: { errors, isSubmitting }, 
    reset, 
    setValue,
    watch
  } = useForm<FormValues>({
      defaultValues: {
          type: activity.type as ActivityType,
          subject: activity.subject,
          due_date: activity.due_date ? new Date(activity.due_date).toISOString().substring(0, 16) : null, // Format for datetime-local
          notes: activity.notes || '',
          is_done: activity.is_done || false,
          deal_id: activity.deal_id || null,
          person_id: activity.person_id || null,
          organization_id: activity.organization_id || null,
      }
  });

  const currentDealId = watch('deal_id');
  const currentPersonId = watch('person_id');
  const currentOrganizationId = watch('organization_id');

  useEffect(() => {
    // Fetch only if a link type is selected and the corresponding entities aren't already in the activity prop
    // (or if we want to allow changing the link)
    if (selectedLinkType === 'deal' && !activity.deal) fetchDeals();
    if (selectedLinkType === 'person' && !activity.person) fetchPeople();
    if (selectedLinkType === 'organization' && !activity.organization) fetchOrganizations();

    // This logic ensures that if you clear a selection, the others are cleared too.
    // And if you set one, others are cleared.
    if (currentDealId) {
        if (selectedLinkType !== 'deal') setSelectedLinkType('deal');
        if (currentPersonId) setValue('person_id', null);
        if (currentOrganizationId) setValue('organization_id', null);
    } else if (currentPersonId) {
        if (selectedLinkType !== 'person') setSelectedLinkType('person');
        if (currentDealId) setValue('deal_id', null);
        if (currentOrganizationId) setValue('organization_id', null);
    } else if (currentOrganizationId) {
        if (selectedLinkType !== 'organization') setSelectedLinkType('organization');
        if (currentDealId) setValue('deal_id', null);
        if (currentPersonId) setValue('person_id', null);
    }


  }, [
    selectedLinkType, 
    fetchDeals, fetchPeople, fetchOrganizations, 
    activity.deal, activity.person, activity.organization,
    currentDealId, currentPersonId, currentOrganizationId, setValue
  ]);

  // Reset form if activity prop changes (e.g. modal is reused for different activities)
  useEffect(() => {
    reset({
      type: activity.type,
      subject: activity.subject,
      due_date: activity.due_date ? new Date(activity.due_date).toISOString().substring(0, 16) : null,
      notes: activity.notes || '',
      is_done: activity.is_done,
      deal_id: activity.deal_id,
      person_id: activity.person_id,
      organization_id: activity.organization_id,
    });
    setSelectedLinkType(getInitialLinkType()); // Reset link type when activity changes
  }, [activity, reset]);

  // Fetch related entities
  useEffect(() => {
    if (deals.length === 0 && !dealsLoading) fetchDeals();
    if (people.length === 0 && !peopleLoading) fetchPeople();
    if (organizations.length === 0 && !organizationsLoading) fetchOrganizations();
  }, [fetchDeals, fetchPeople, fetchOrganizations, deals, people, organizations, dealsLoading, peopleLoading, organizationsLoading]);

  const handleLinkTypeChange = (nextValue: string) => {
    const linkType = nextValue as LinkType;
    setSelectedLinkType(linkType);
    if (linkType !== 'deal') setValue('deal_id', null);
    if (linkType !== 'person') setValue('person_id', null);
    if (linkType !== 'organization') setValue('organization_id', null);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      if (!values.deal_id && !values.person_id && !values.organization_id) {
        toast({ title: 'Link Required', description: 'Please link the activity to a Deal, Person, or Organization.', status: 'warning', duration: 4000, isClosable: true });
        return;
      }

      const submissionData: UpdateActivityInput = {
          // Ensure all fields from UpdateActivityInput are present or explicitly null
          type: values.type || activity.type, // Fallback to original if not in form
          subject: values.subject || activity.subject, // Fallback to original
          due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
          notes: values.notes || null,
          is_done: values.is_done === undefined ? activity.is_done : values.is_done, // Handle boolean carefully
          deal_id: values.deal_id || null,
          person_id: values.person_id || null,
          organization_id: values.organization_id || null,
      };
      
      // Remove fields that weren't actually changed to avoid sending them as null
      // This is tricky with react-hook-form. A better approach might be to compare with initial values.
      // For now, we send all, and the backend should handle partial updates.
      // Let's make sure our UpdateActivityInput in the store handles partial updates gracefully.
      // The generated type usually makes all fields optional.

      const updatedActivity = await updateActivity(activity.id, submissionData);

      if (updatedActivity) {
        toast({ title: 'Activity updated.', status: 'success', duration: 3000, isClosable: true });
        onSuccess?.();
        onClose();
      } else {
        toast({ title: 'Failed to update activity', description: activitiesError || 'Please check the details and try again.', status: 'error', duration: 5000, isClosable: true });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: 'An error occurred', description: 'Please try again.', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const isLoadingLinks = dealsLoading || peopleLoading || organizationsLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} p={4}>
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
            <Select id='type' {...register('type')} defaultValue={activity.type as ActivityType}>
                {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </Select>
            <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
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
                    const dateValue = currentValue.includes('T') ? currentValue.split('T')[0] : new Date().toISOString().split('T')[0];
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
        
        <FormControl isInvalid={!!errors.deal_id || !!errors.person_id || !!errors.organization_id}>
            <FormLabel>Link To (Select One)</FormLabel>
            {isLoadingLinks && <Spinner size="sm" />}
            {!isLoadingLinks && (
              <RadioGroup onChange={handleLinkTypeChange} value={selectedLinkType}>
                <HStack spacing={4}>
                  <Radio value='deal'>Deal</Radio>
                  <Radio value='person'>Person</Radio>
                  <Radio value='organization'>Organization</Radio>
                  <Radio value='none'>None</Radio>
                </HStack>
              </RadioGroup>
            )}

            {!isLoadingLinks && selectedLinkType === 'deal' && (
              <Select 
                id='deal_id' 
                placeholder='Select Deal' 
                {...register('deal_id')} 
                mt={2}
                defaultValue={activity.deal_id || undefined}
              >
                {deals.map((deal: Deal) => (
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
                    defaultValue={activity.person_id || undefined}
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
                    defaultValue={activity.organization_id || undefined}
                 >
                     {organizations.map((org: Organization) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                     ))}
                 </Select>
             )}
             {(errors.deal_id || errors.person_id || errors.organization_id) && 
                <FormErrorMessage>Please select a linked entity if a type is chosen.</FormErrorMessage> }
          </FormControl>
        
        <FormControl isInvalid={!!errors.notes}>
          <FormLabel htmlFor='notes'>Notes</FormLabel>
          <Textarea id='notes' {...register('notes')} />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <Checkbox {...register('is_done')} defaultChecked={activity.is_done}>Mark as Done</Checkbox>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting || activitiesLoading}>
          Update Activity
        </Button>
      </VStack>
    </form>
  );
}

export default EditActivityForm; 