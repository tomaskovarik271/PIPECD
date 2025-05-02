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
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';

// Interface for the Deal data passed to the modal
// Match the fields fetched in DealsPage query
interface DealToEdit {
  id: string;
  name: string;
  stage: string;
  amount?: number | null;
  contact_id?: string | null; // Add contact_id here
  // Add other fields if they are editable (e.g., contact_id)
}

// Define GraphQL Mutation for Update
const UPDATE_DEAL_MUTATION = gql`
  mutation UpdateDeal($id: ID!, $input: DealInput!) {
    updateDeal(id: $id, input: $input) {
      id # Request fields needed after update
      name
      stage
      amount
      updated_at # Get updated timestamp
    }
  }
`;

// Add query for contact list (can be shared with Create modal)
const GET_CONTACT_LIST_QUERY = gql`
  query GetContactList {
    contactList {
      id
      name
    }
  }
`;

// Type for contact list items
interface ContactListItem {
  id: string;
  name: string;
}

// Type for contact list query result
interface GetContactListQueryResult {
  contactList: ContactListItem[];
}

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated: () => void; // Callback to refresh list
  deal: DealToEdit | null; // The deal data to edit
}

// Re-use stages from Create modal or define centrally later
const dealStages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

function EditDealModal({ isOpen, onClose, onDealUpdated, deal }: EditDealModalProps) {
  // Form state, initialized from the deal prop when modal opens
  const [name, setName] = useState('');
  const [stage, setStage] = useState(dealStages[0]);
  const [amount, setAmount] = useState<string>('');
  const [contactId, setContactId] = useState<string>(''); // State for selected contact ID
  // Contact list state
  const [contacts, setContacts] = useState<ContactListItem[]>([]); 
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsContactsLoading(true);
      setContactsError(null);
      gqlClient.request<GetContactListQueryResult>(GET_CONTACT_LIST_QUERY)
        .then(data => {
          setContacts(data.contactList || []);
        })
        .catch(err => {
          console.error("Error fetching contacts for dropdown:", err);
          const gqlError = err.response?.errors?.[0]?.message;
          setContactsError(gqlError || err.message || 'Failed to load contacts');
        })
        .finally(() => {
          setIsContactsLoading(false);
        });
    }
  }, [isOpen]); // Only depends on isOpen

  // Effect to update form state when the deal prop changes (modal opens with new data)
  useEffect(() => {
    if (deal) {
      setName(deal.name || '');
      setStage(deal.stage || dealStages[0]);
      setAmount(deal.amount != null ? String(deal.amount) : '');
      setContactId(deal.contact_id || ''); // Initialize contactId from deal
      setError(null); // Clear previous errors when opening
      setIsLoading(false); // Reset loading state
    } else {
        // Reset form if deal becomes null (e.g., modal closes)
        setName('');
        setStage(dealStages[0]);
        setAmount('');
        setContactId(''); // Reset contactId too
    }
  }, [deal]); // Dependency array ensures this runs when `deal` changes

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!deal) return; // Should not happen if modal is open with a deal

    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Deal name is required.');
      setIsLoading(false);
      return;
    }

    try {
      const variables = {
        id: deal.id,
        input: {
          name: name.trim(),
          stage: stage,
          amount: amount ? parseFloat(amount) : null,
          contact_id: contactId || null, // Include contact_id
          // Add other fields if they become editable
        },
      };

      console.log('Submitting update variables:', variables);

      // Call the update mutation
      const result = await gqlClient.request(UPDATE_DEAL_MUTATION, variables);
      console.log('Deal updated:', result);

      // Success
      onDealUpdated(); // Trigger refresh
      onClose();       // Close modal

    } catch (err: any) {
      console.error('Error updating deal:', err);
      const gqlError = err.response?.errors?.[0]?.message;
      const validationError = err.response?.errors?.[0]?.extensions?.originalError?.message;
      setError(validationError || gqlError || err.message || 'Failed to update deal');
    } finally {
      setIsLoading(false);
    }
  };

  // Render null if the modal shouldn't be open or no deal is provided
  if (!isOpen || !deal) {
      return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Edit Deal: {deal.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap">
                <AlertIcon />
                {error}
            </Alert>
          )}
          {contactsError && (
             <Alert status="warning" mb={4}>
                <AlertIcon />
                {contactsError}
            </Alert>
          )}
          <VStack spacing={4}>
            {/* Form Controls similar to CreateDealModal, but using state initialized by useEffect */}
            <FormControl isRequired isInvalid={!name.trim() && error?.includes('name')}>
              <FormLabel>Deal Name</FormLabel>
              <Input 
                placeholder='Enter deal name' 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {!name.trim() && error?.includes('name') && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Stage</FormLabel>
              <Select value={stage} onChange={(e) => setStage(e.target.value)}>
                 {/* Ensure deal.stage is included if it's somehow not in dealStages */}
                 {[...new Set([...dealStages, stage])].map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={amount} onChange={(valueAsString) => setAmount(valueAsString)}>
                <NumberInputField placeholder='Enter amount (optional)' />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Link to Contact (Optional)</FormLabel>
              <Select 
                placeholder={isContactsLoading ? 'Loading contacts...' : 'Select contact'}
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                isDisabled={isContactsLoading || !!contactsError}
              >
                 {!isContactsLoading && !contactsError && contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                        {contact.name}
                    </option>
                ))}
              </Select>
            </FormControl>

             {/* TODO: Add Contact Selection Field Later */}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme='teal' 
            mr={3} 
            type="submit" 
            isLoading={isLoading}
            leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
          >
            Update Deal
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditDealModal; 