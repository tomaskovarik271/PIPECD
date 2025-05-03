import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form'; // Using react-hook-form for consistency
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Button,
    Select,
    Textarea,
    useToast,
    FormErrorMessage,
    VStack
} from '@chakra-ui/react';

// Define the GraphQL mutation
const CREATE_LEAD = gql`
  mutation CreateLead($input: LeadInput!) {
    createLead(input: $input) {
      id
      name
      status
      # Include other fields if needed upon creation
    }
  }
`;

// Define the shape of the form data
interface LeadFormData {
    name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    source?: string;
    status: string; // Required
    notes?: string;
}

// Define component props
interface CreateLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLeadCreated: () => void; // Callback to refetch leads list
}

// Define available lead statuses (adjust as needed)
const leadStatuses = [
    'New',
    'Contacted',
    'Qualified',
    'Lost',
    'Converted'
];

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose, onLeadCreated }) => {
    const { 
        handleSubmit, 
        register, 
        formState: { errors, isSubmitting },
        reset // Function to reset form fields
    } = useForm<LeadFormData>();
    const toast = useToast();
    const [createLead, { loading }] = useMutation(CREATE_LEAD);

    const onSubmit = async (values: LeadFormData) => {
        // Filter out empty strings for optional fields before sending
        const input = {
            ...values,
            name: values.name || null,
            email: values.email || null,
            phone: values.phone || null,
            company_name: values.company_name || null,
            source: values.source || null,
            notes: values.notes || null,
        };
        
        try {
            await createLead({ variables: { input } });
            toast({ title: 'Lead created.', status: 'success', duration: 3000, isClosable: true });
            reset(); // Reset form fields
            onLeadCreated(); // Refetch the leads list in the parent component
            onClose(); // Close the modal
        } catch (err: any) {
            console.error('Error creating lead:', err);
            toast({ title: 'Error creating lead.', description: err.message, status: 'error', duration: 5000, isClosable: true });
        }
    };

    // Reset form when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>Create New Lead</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <FormControl isInvalid={!!errors.name}>
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <Input id="name" placeholder="Lead name" {...register('name')} />
                            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <Input id="email" type="email" placeholder="lead@example.com" {...register('email')} />
                             <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.phone}>
                            <FormLabel htmlFor="phone">Phone</FormLabel>
                            <Input id="phone" type="tel" placeholder="+1234567890" {...register('phone')} />
                             <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.company_name}>
                            <FormLabel htmlFor="company_name">Company Name</FormLabel>
                            <Input id="company_name" placeholder="Lead's company" {...register('company_name')} />
                             <FormErrorMessage>{errors.company_name?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.source}>
                            <FormLabel htmlFor="source">Source</FormLabel>
                            <Input id="source" placeholder="e.g., Website, Referral" {...register('source')} />
                             <FormErrorMessage>{errors.source?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.status}>
                            <FormLabel htmlFor="status">Status</FormLabel>
                            <Select id="status" placeholder="Select status" {...register('status', { required: 'Status is required' })}>
                                {leadStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </Select>
                            <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.notes}>
                            <FormLabel htmlFor="notes">Notes</FormLabel>
                            <Textarea id="notes" placeholder="Additional notes about the lead" {...register('notes')} />
                             <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} isLoading={isSubmitting || loading} type="submit">
                        Save
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateLeadModal; 