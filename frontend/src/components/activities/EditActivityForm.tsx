import { useForm, SubmitHandler, Controller } from 'react-hook-form';
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
  SimpleGrid,
  RadioGroup,
  Radio,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { useAppStore, Activity, UpdateActivityInput, Deal, Person, Organization } from '../../stores/useAppStore';

// Define Activity Types matching GraphQL Enum
const activityTypes = [
  'TASK',
  'MEETING',
  'CALL',
  'EMAIL',
  'DEADLINE',
];

interface EditActivityFormProps {
  activity: Activity; // The activity to edit
  onClose: () => void;
  onSuccess?: () => void; // Optional callback on successful update
}

// Use UpdateActivityInput for form values, but make links non-optional initially
// RHF will handle making them optional based on user interaction
type FormValues = Omit<UpdateActivityInput, 'deal_id' | 'person_id' | 'organization_id'> & {
    deal_id: string | null;
    person_id: string | null;
    organization_id: string | null;
};

// Define type for link selection
type LinkType = 'deal' | 'person' | 'organization' | 'none';

function EditActivityForm({ activity, onClose, onSuccess }: EditActivityFormProps) {
  // Select state individually
  const updateActivity = useAppStore((state) => state.updateActivity);
  const deals = useAppStore((state) => state.deals);
  const people = useAppStore((state) => state.people);
  const organizations = useAppStore((state) => state.organizations);
  const fetchDeals = useAppStore((state) => state.fetchDeals);
  const fetchPeople = useAppStore((state) => state.fetchPeople);
  const fetchOrganizations = useAppStore((state) => state.fetchOrganizations);
  const dealsLoading = useAppStore((state) => state.dealsLoading);
  const peopleLoading = useAppStore((state) => state.peopleLoading);
  const organizationsLoading = useAppStore((state) => state.organizationsLoading);

  const toast = useToast();
  
  // Determine initial link type and ID
  const getInitialLinkType = (): LinkType => {
    if (activity.deal_id) return 'deal';
    if (activity.person_id) return 'person';
    if (activity.organization_id) return 'organization';
    return 'none';
  };

  // Format ISO date string for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return ''; // Handle invalid date
        // Adjust for timezone offset to display correctly in local time
        const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
        return localISOTime;
    } catch (e) {
        console.error('Error formatting date for input:', isoString, e);
        return '';
    }
  };

  const { 
    handleSubmit, 
    register, 
    control, 
    formState: { errors, isSubmitting, dirtyFields }, // Use dirtyFields to send only changed values
    reset, 
    setValue, 
    watch 
  } = useForm<FormValues>({
      defaultValues: {
          type: activity.type,
          subject: activity.subject,
          // Use helper to format for input, ensure it handles null/undefined
          due_date: formatDateTimeLocal(activity.due_date),
          notes: activity.notes ?? '', // Ensure notes isn't null for the form control
          is_done: activity.is_done,
          deal_id: activity.deal_id,
          person_id: activity.person_id,
          organization_id: activity.organization_id,
      }
  });

  const [selectedLinkType, setSelectedLinkType] = useState<LinkType>(getInitialLinkType());

  // Fetch related entities if needed (might already be loaded)
  useEffect(() => {
    if (deals.length === 0) fetchDeals();
    if (people.length === 0) fetchPeople();
    if (organizations.length === 0) fetchOrganizations();
  }, [fetchDeals, fetchPeople, fetchOrganizations, deals.length, people.length, organizations.length]);

  const handleLinkTypeChange = (nextValue: string) => {
    const linkType = nextValue as LinkType;
    setSelectedLinkType(linkType);
    // Explicitly set other link IDs to null when changing type
    if (linkType !== 'deal') setValue('deal_id', null, { shouldDirty: true });
    if (linkType !== 'person') setValue('person_id', null, { shouldDirty: true });
    if (linkType !== 'organization') setValue('organization_id', null, { shouldDirty: true });
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    console.log('Submitting updated activity:', values);
    console.log('Dirty fields:', dirtyFields);

    // Ensure at least one link is present
    if (!values.deal_id && !values.person_id && !values.organization_id) {
        toast({ title: 'Link Required', description: 'Please link the activity to a Deal, Person, or Organization.', status: 'warning', duration: 4000, isClosable: true });
        return;
    }

    // Construct the UpdateActivityInput, only including changed fields
    const updateData: UpdateActivityInput = {};
    let key: keyof typeof dirtyFields;
    for (key in dirtyFields) {
        if (dirtyFields[key]) {
            // Special handling for due_date formatting
            if (key === 'due_date') {
                const dateValue = values[key];
                if (dateValue) {
                    try {
                        const date = new Date(dateValue);
                        if (!isNaN(date.getTime())) {
                            updateData[key] = date.toISOString();
                        } else {
                           console.warn("Invalid date string during update submission:", dateValue);
                           updateData[key] = null; // Send null if invalid date selected
                        }
                    } catch (error) {
                        console.error("Error parsing date on update:", error);
                        updateData[key] = null;
                    }
                } else {
                    updateData[key] = null; // Send null if cleared
                }
            } else {
                 // Handle potential empty strings for notes -> null
                 if (key === 'notes' && values[key] === '') {
                     (updateData as any)[key] = null;
                 } else {
                     // Assign other dirty fields directly, ensuring correct type
                     (updateData as any)[key] = values[key];
                 }
            }
        }
    }
    
    // Ensure link fields are explicitly set to null if changed to 'none' or another type
    if (dirtyFields.deal_id || dirtyFields.person_id || dirtyFields.organization_id) {
        updateData.deal_id = values.deal_id;
        updateData.person_id = values.person_id;
        updateData.organization_id = values.organization_id;
    }
    
    // Prevent API call if no fields were actually changed
    if (Object.keys(updateData).length === 0) {
        toast({ title: 'No changes detected', status: 'info', duration: 2000, isClosable: true });
        onClose();
        return;
    }

    console.log('Sending update data:', updateData);

    const updatedActivity = await updateActivity(activity.id, updateData);

    if (updatedActivity) {
      toast({ title: 'Activity updated.', status: 'success', duration: 3000, isClosable: true });
      reset(values); // Reset form state to the updated values
      onSuccess?.();
      onClose();
    } else {
      toast({ title: 'Failed to update activity', description: 'Please check the details and try again.', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const isLoadingLinks = dealsLoading || peopleLoading || organizationsLoading;

  return (
    // Form structure is identical to CreateActivityForm, just with pre-filled values
    // and using updateActivity instead of createActivity
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} p={4}>
        {/* Subject */}
        <FormControl isInvalid={!!errors.subject}>
          <FormLabel htmlFor='subject'>Subject</FormLabel>
          <Input
            id='subject'
            {...register('subject', { required: 'Subject is required' })}
          />
          <FormErrorMessage>{errors.subject?.message}</FormErrorMessage>
        </FormControl>

        {/* Type */}
        <FormControl isInvalid={!!errors.type}>
            <FormLabel htmlFor='type'>Type</FormLabel>
            <Select id='type' {...register('type', { required: 'Type is required' })}>
                {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </Select>
            <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
        </FormControl>

        {/* Due Date */}
        <FormControl isInvalid={!!errors.due_date}>
          <FormLabel htmlFor='due_date'>Due Date/Time</FormLabel>
          <Input
            id='due_date'
            type='datetime-local'
            {...register('due_date')}
          />
          <FormErrorMessage>{errors.due_date?.message}</FormErrorMessage>
        </FormControl>
        
        {/* Linked Entity */}
        <FormControl isInvalid={!!errors.deal_id || !!errors.person_id || !!errors.organization_id}>
             <FormLabel>Linked To</FormLabel>
             <RadioGroup onChange={handleLinkTypeChange} value={selectedLinkType}>
                 <HStack spacing='20px' mb={2}>
                     <Radio value='deal'>Deal</Radio>
                     <Radio value='person'>Person</Radio>
                     <Radio value='organization'>Organization</Radio>
                     {/* No 'none' option for editing - must be linked */}
                 </HStack>
             </RadioGroup>
             
             {isLoadingLinks && <Spinner size="sm" my={2}/>}

             {selectedLinkType === 'deal' && (
                 <Select 
                    id='deal_id' 
                    placeholder='Select Deal'
                    isDisabled={isLoadingLinks} 
                    {...register('deal_id')}
                 >
                     {deals.map(deal => (
                        <option key={deal.id} value={deal.id}>{deal.name}</option>
                     ))}
                 </Select>
             )}
             {selectedLinkType === 'person' && (
                 <Select 
                    id='person_id' 
                    placeholder='Select Person'
                    isDisabled={isLoadingLinks} 
                    {...register('person_id')}
                 >
                     {people.map(person => (
                        <option key={person.id} value={person.id}>
                            {[person.first_name, person.last_name].filter(Boolean).join(' ') || person.email}
                        </option>
                     ))}
                 </Select>
             )}
             {selectedLinkType === 'organization' && (
                 <Select 
                    id='organization_id' 
                    placeholder='Select Organization'
                    isDisabled={isLoadingLinks} 
                    {...register('organization_id')}
                 >
                     {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                     ))}
                 </Select>
             )}
        </FormControl>
        
        {/* Notes */}
        <FormControl isInvalid={!!errors.notes}>
          <FormLabel htmlFor='notes'>Notes</FormLabel>
          <Textarea id='notes' {...register('notes')} />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        {/* Is Done */}
        <FormControl>
          <Checkbox {...register('is_done')}>Mark as Done</Checkbox>
        </FormControl>

        {/* Submit Button */}
        <Button mt={4} colorScheme='blue' isLoading={isSubmitting} type='submit'>
          Update Activity
        </Button>
      </VStack>
    </form>
  );
}

export default EditActivityForm; 