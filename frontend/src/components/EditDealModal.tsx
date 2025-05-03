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
  person_id?: string | null; // Renamed from contact_id
  // Add other fields if they are editable
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
      person_id # Also fetch person_id after update
    }
  }
`;

// Rename query for person list (can be shared with Create modal)
const GET_PERSON_LIST_QUERY = gql`
  query GetPersonList {
    personList {
      id
      name
    }
  }
`;

// Type for person list items
interface PersonListItem {
  id: string;
  name: string;
}

// Type for person list query result
interface GetPersonListQueryResult {
  personList: PersonListItem[];
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
  const [personId, setPersonId] = useState<string>(''); // Renamed state variable
  // Person list state
  const [people, setPeople] = useState<PersonListItem[]>([]); // Renamed state variable
  const [isPeopleLoading, setIsPeopleLoading] = useState(false); // Renamed state variable
  const [peopleError, setPeopleError] = useState<string | null>(null); // Renamed state variable
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch people when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPeopleLoading(true); // Use renamed setter
      setPeopleError(null); // Use renamed setter
      gqlClient.request<GetPersonListQueryResult>(GET_PERSON_LIST_QUERY)
        .then(data => {
          setPeople(data.personList || []); // Use renamed setter and data field
        })
        .catch(err => {
          console.error("Error fetching people for dropdown:", err);
          const gqlError = err.response?.errors?.[0]?.message;
          setPeopleError(gqlError || err.message || 'Failed to load people'); // Use renamed setter
        })
        .finally(() => {
          setIsPeopleLoading(false); // Use renamed setter
        });
    }
  }, [isOpen]); // Only depends on isOpen

  // Effect to update form state when the deal prop changes (modal opens with new data)
  useEffect(() => {
    if (deal) {
      setName(deal.name || '');
      setStage(deal.stage || dealStages[0]);
      setAmount(deal.amount != null ? String(deal.amount) : '');
      setPersonId(deal.person_id || ''); // Use renamed deal prop field and setter
      setError(null); // Clear previous errors when opening
      setIsLoading(false); // Reset loading state
    } else {
        // Reset form if deal becomes null (e.g., modal closes)
        setName('');
        setStage(dealStages[0]);
        setAmount('');
        setPersonId(''); // Use renamed setter
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
          person_id: personId || null, // Use renamed state variable for mutation input field
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
          {peopleError && ( // Use renamed state variable
             <Alert status="warning" mb={4}>
                <AlertIcon />
                {peopleError} {/* Use renamed state variable */}
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
              <FormLabel>Link to Person (Optional)</FormLabel> {/* Renamed label */}
              <Select 
                placeholder={isPeopleLoading ? 'Loading people...' : 'Select person'} /* Renamed placeholder */
                value={personId} /* Use renamed state variable */
                onChange={(e) => setPersonId(e.target.value)} /* Use renamed state setter */
                isDisabled={isPeopleLoading || !!peopleError} /* Use renamed state variable */
              >
                 {/* Add an option for 'None' or empty selection */}
                 <option value="">-- None --</option>
                 {/* Iterate over people state */}
                 {!isPeopleLoading && !peopleError && people.map(person => (
                    <option key={person.id} value={person.id}>
                        {person.name}
                    </option>
                ))}
              </Select>
            </FormControl>

             {/* Removed outdated TODO */}
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
            Save Changes
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