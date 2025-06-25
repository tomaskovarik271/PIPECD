import React, { useState } from 'react';
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
  VStack,
  HStack,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { CREATE_CALENDAR_EVENT } from '../../lib/graphql/calendarOperations';
import { Deal } from '../../stores/useDealsStore';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  deal,
}) => {
  const [title, setTitle] = useState(`Meeting: ${deal.name}`);
  const [description, setDescription] = useState(`Meeting regarding deal: ${deal.name}`);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('MEETING');
  const [attendeeEmails, setAttendeeEmails] = useState('');
  const [addGoogleMeet, setAddGoogleMeet] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const [createCalendarEvent] = useMutation(CREATE_CALENDAR_EVENT, {
    onCompleted: () => {
      toast({
        title: 'Meeting Scheduled',
        description: 'The meeting has been successfully added to your calendar.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error Scheduling Meeting',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setTitle(`Meeting: ${deal.name}`);
    setDescription(`Meeting regarding deal: ${deal.name}`);
    setStartDateTime('');
    setEndDateTime('');
    setLocation('');
    setEventType('MEETING');
    setAttendeeEmails('');
    setAddGoogleMeet(true);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!startDateTime || !endDateTime) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both start and end times for the meeting.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    const input = {
      title,
      description: description || undefined,
      startDateTime,
      endDateTime,
      location: location || undefined,
      eventType,
      addGoogleMeet,
      dealId: deal.id,
      personId: deal.person?.id || undefined,
      organizationId: deal.organization?.id || undefined,
      attendeeEmails: attendeeEmails ? attendeeEmails.split(',').map(email => email.trim()).filter(Boolean) : undefined,
    };

    try {
      await createCalendarEvent({ variables: { input } });
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Auto-fill end time when start time changes (default 30 minutes later)
  const handleStartTimeChange = (value: string) => {
    setStartDateTime(value);
    if (value && !endDateTime) {
      const start = new Date(value);
      const end = new Date(start.getTime() + 30 * 60000); // Add 30 minutes
      const endISOString = end.toISOString().slice(0, 16); // Format for datetime-local input
      setEndDateTime(endISOString);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Schedule Meeting</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Meeting Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter meeting title"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Meeting agenda or notes"
                rows={3}
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl isRequired flex="1">
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired flex="1">
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Meeting Type</FormLabel>
              <Select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="MEETING">General Meeting</option>
                <option value="DEMO">Product Demo</option>
                <option value="PROPOSAL_PRESENTATION">Proposal Presentation</option>
                <option value="CONTRACT_REVIEW">Contract Review</option>
                <option value="FOLLOW_UP">Follow-up</option>
                <option value="CHECK_IN">Check-in</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Location</FormLabel>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Meeting location or leave empty for Google Meet"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Attendee Emails (comma-separated)</FormLabel>
              <Input
                value={attendeeEmails}
                onChange={(e) => setAttendeeEmails(e.target.value)}
                placeholder={deal.person?.email ? `${deal.person.email}, others...` : 'email1@example.com, email2@example.com'}
              />
            </FormControl>

            <FormControl>
              <HStack justifyContent="space-between">
                <FormLabel mb="0">Add Google Meet</FormLabel>
                <Switch
                  isChecked={addGoogleMeet}
                  onChange={(e) => setAddGoogleMeet(e.target.checked)}
                />
              </HStack>
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
            isLoading={isSubmitting}
            loadingText="Scheduling..."
          >
            Schedule Meeting
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 