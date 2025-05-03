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
  VStack, // For layout
  FormErrorMessage,
  Alert, 
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';

// TODO: Define GraphQL Mutation
const CREATE_DEAL_MUTATION = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      id # Request fields needed after creation
      name
      stage
      amount
      # Potentially add user_id, created_at if needed immediately
    }
  }
`;

// Define the expected shape of the mutation result
interface CreateDealMutationResult {
    createDeal: {
        id: string;
        // Include other fields returned by mutation if needed
    };
}

// Rename query for person list
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

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: () => void; // Callback to refresh list
}

// Basic stage options
const dealStages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

function CreateDealModal({ isOpen, onClose, onDealCreated }: CreateDealModalProps) {
  const [name, setName] = useState('');
  const [stage, setStage] = useState(dealStages[0]); // Default to first stage
  const [amount, setAmount] = useState<string>(''); // Store as string for input
  const [personId, setPersonId] = useState<string>(''); // Renamed from contactId
  const [people, setPeople] = useState<PersonListItem[]>([]); // Renamed from contacts
  const [isPeopleLoading, setIsPeopleLoading] = useState(false); // Renamed from isContactsLoading
  const [peopleError, setPeopleError] = useState<string | null>(null); // Renamed from contactsError
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch people when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form state when opening
      setName('');
      setStage(dealStages[0]);
      setAmount('');
      setPersonId('');
      setError(null);
      setIsLoading(false);
      // Fetch people
      setIsPeopleLoading(true);
      setPeopleError(null);
      gqlClient.request<GetPersonListQueryResult>(GET_PERSON_LIST_QUERY)
        .then(data => {
          setPeople(data.personList || []);
        })
        .catch(err => {
          console.error("Error fetching people for dropdown:", err);
          const gqlError = err.response?.errors?.[0]?.message;
          setPeopleError(gqlError || err.message || 'Failed to load people');
        })
        .finally(() => {
          setIsPeopleLoading(false);
        });
    }
  }, [isOpen]); // Re-run when isOpen changes

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!name.trim()) {
        setError('Deal name is required.');
        setIsLoading(false);
        return;
    }

    try {
        const variables = {
            input: {
                name: name.trim(),
                stage: stage,
                // Parse amount only if it's a valid number string
                amount: amount ? parseFloat(amount) : null,
                person_id: personId || null, // Send person_id, renamed variable
            },
        };

        console.log('Submitting variables:', variables);

        // Call the mutation using gqlClient
        const result = await gqlClient.request<CreateDealMutationResult>(
            CREATE_DEAL_MUTATION, 
            variables
        );
        console.log('Deal created:', result); // Log success

        // Success
        onDealCreated(); // Trigger refresh on the parent page
        onClose();       // Close the modal
        // Reset form fields (optional, as modal unmounts/remounts)
        setName('');
        setStage(dealStages[0]);
        setAmount('');
        setPersonId('');

    } catch (err: any) {
      console.error('Error creating deal:', err);
      const gqlError = err.response?.errors?.[0]?.message; // Try to get GraphQL error message
      // Check for Zod validation error message from the backend
      const validationError = err.response?.errors?.[0]?.extensions?.originalError?.message;
      setError(validationError || gqlError || err.message || 'Failed to create deal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Create New Deal</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && (
             <Alert status="error" mb={4} whiteSpace="pre-wrap"> {/* Allow wrapping for long errors */}
                <AlertIcon />
                {error}
            </Alert>
          )}
          {peopleError && (
             <Alert status="warning" mb={4}>
                <AlertIcon />
                {peopleError}
            </Alert>
          )}
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!name.trim() && error?.includes('name')}> {/* Basic error state check */}
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
                {dealStages.map(s => (
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
              <FormLabel>Link to Person (Optional)</FormLabel>
              <Select 
                placeholder={isPeopleLoading ? 'Loading people...' : 'Select person'}
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                isDisabled={isPeopleLoading || !!peopleError}
              >
                 {!isPeopleLoading && !peopleError && people.map(person => (
                    <option key={person.id} value={person.id}>
                        {person.name}
                    </option>
                ))}
              </Select>
            </FormControl>

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
            Save Deal
          </Button>
          <Button variant='ghost' onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateDealModal; 