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
  Spinner
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
    setValue
  } = useForm<UpdateActivityInput>({
      defaultValues: {
      type: activity.type as ActivityType,
          subject: activity.subject,
      due_date: activity.due_date ? new Date(activity.due_date).toISOString().substring(0, 16) : null,
      notes: activity.notes || '',
          is_done: activity.is_done,
          deal_id: activity.deal_id,
          person_id: activity.person_id,
          organization_id: activity.organization_id,
      }
  });

  // Reset form if activity prop changes (e.g. modal is reused for different activities)
  useEffect(() => {
    reset({
      type: activity.type as ActivityType,
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
    setValue('deal_id', linkType === 'deal' ? (activity.deal_id || null) : null, { shouldDirty: true });
    setValue('person_id', linkType === 'person' ? (activity.person_id || null) : null, { shouldDirty: true });
    setValue('organization_id', linkType === 'organization' ? (activity.organization_id || null) : null, { shouldDirty: true });
  };

  const onSubmit: SubmitHandler<UpdateActivityInput> = async (values) => {
    const submissionData: UpdateActivityInput = { ...values }; 

    if (!submissionData.deal_id && !submissionData.person_id && !submissionData.organization_id) {
        toast({ title: 'Link Required', description: 'Activity must be linked to a Deal, Person, or Organization.', status: 'warning', duration: 4000, isClosable: true });
        return;
    }

    if (submissionData.notes === '') submissionData.notes = null;
    if (submissionData.due_date) {
                    try {
        const date = new Date(submissionData.due_date);
        submissionData.due_date = !isNaN(date.getTime()) ? date.toISOString() : null;
      } catch { submissionData.due_date = null; }
                        } else {
      submissionData.due_date = null;
    }

    const updatedActivity = await updateActivity(activity.id, submissionData);
    if (updatedActivity) {
      toast({ title: 'Activity updated.', status: 'success', duration: 3000, isClosable: true });
      onSuccess?.();
      onClose();
    } else {
      toast({ title: 'Failed to update activity', description: activitiesError || 'Please check details and try again.', status: 'error', duration: 5000, isClosable: true });
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
            <Select id='type' {...register('type', { required: 'Type is required' })}>
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
            type='datetime-local'
            {...register('due_date')}
          />
          <FormErrorMessage>{errors.due_date?.message as string}</FormErrorMessage>
        </FormControl>
        
        <FormControl isInvalid={!!errors.deal_id || !!errors.person_id || !!errors.organization_id}>
             <FormLabel>Linked To</FormLabel>
             <RadioGroup onChange={handleLinkTypeChange} value={selectedLinkType}>
                 <HStack spacing='20px' mb={2}>
                     <Radio value='deal'>Deal</Radio>
                     <Radio value='person'>Person</Radio>
                     <Radio value='organization'>Organization</Radio>
                 </HStack>
             </RadioGroup>
             
             {isLoadingLinks && <Spinner size="sm" my={2}/>}

             {!isLoadingLinks && selectedLinkType === 'deal' && (
                 <Select id='deal_id' placeholder='Select Deal' {...register('deal_id')} defaultValue={activity.deal_id || ''}>
                     {deals.map((deal: Deal) => (<option key={deal.id} value={deal.id}>{deal.name}</option>))}
                 </Select>
             )}
            {!isLoadingLinks && selectedLinkType === 'person' && (
                 <Select id='person_id' placeholder='Select Person' {...register('person_id')} defaultValue={activity.person_id || ''}>
                     {people.map((person: Person) => (<option key={person.id} value={person.id}>{`${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email}</option>))}
                 </Select>
             )}
             {!isLoadingLinks && selectedLinkType === 'organization' && (
                 <Select id='organization_id' placeholder='Select Organization' {...register('organization_id')} defaultValue={activity.organization_id || ''}>
                     {organizations.map((org: Organization) => (<option key={org.id} value={org.id}>{org.name}</option>))}
                 </Select>
             )}
             {(errors.deal_id && selectedLinkType ==='deal' || errors.person_id && selectedLinkType ==='person' || errors.organization_id && selectedLinkType ==='organization') && 
                <FormErrorMessage>Please select a linked entity.</FormErrorMessage> }
        </FormControl>
        
        <FormControl isInvalid={!!errors.notes}>
          <FormLabel htmlFor='notes'>Notes</FormLabel>
          <Textarea
            id='notes'
            {...register('notes')}
          />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <Checkbox id='is_done' {...register('is_done')}>
            Mark as Done
          </Checkbox>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting || activitiesLoading}>
          Update Activity
        </Button>
      </VStack>
    </form>
  );
}

export default EditActivityForm; 