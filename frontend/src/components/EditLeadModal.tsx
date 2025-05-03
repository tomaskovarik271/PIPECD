import React, { useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
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
import type { Lead } from '../pages/LeadsPage'; // Import Lead type from LeadsPage

// Define the GraphQL mutation for updating a lead
const UPDATE_LEAD = gql`
  mutation UpdateLead($id: ID!, $input: LeadUpdateInput!) {
    updateLead(id: $id, input: $input) {
      id
      name
      email
      phone
      company_name
      source
      status
      notes
      updated_at
    }
  }
`;

// Define the shape of the form data (can reuse LeadFormData definition or similar)
interface LeadFormData {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company_name?: string | null;
    source?: string | null;
    status: string;
    notes?: string | null;
}

// Define component props
interface EditLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null; // The lead data to edit
    onLeadUpdated: () => void; // Callback to refetch leads list
}

// Define available lead statuses (ensure consistency with CreateLeadModal)
const leadStatuses = [
    'New',
    'Contacted',
    'Qualified',
    'Lost',
    'Converted'
];

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, lead, onLeadUpdated }) => {
    const { 
        handleSubmit, 
        register, 
        formState: { errors, isSubmitting },
        reset // Use reset to populate form
    } = useForm<LeadFormData>();
    const toast = useToast();
    const [updateLead, { loading }] = useMutation(UPDATE_LEAD);

    // Populate form with lead data when the modal opens or lead data changes
    useEffect(() => {
        if (lead) {
            reset({
                name: lead.name,
                email: lead.email,
                phone: lead.phone, // Assuming Lead interface includes phone
                company_name: lead.company_name,
                source: lead.source, // Assuming Lead interface includes source
                status: lead.status,
                notes: lead.notes, // Assuming Lead interface includes notes
            });
        } else {
             reset(); // Clear form if no lead is provided (safety check)
        }
    }, [lead, reset, isOpen]); // Depend on isOpen to reset when modal re-opens with different lead

    const onSubmit = async (values: LeadFormData) => {
        if (!lead) return; // Should not happen if modal is open with a lead

        // Filter out empty strings for optional fields
        const input = {
            name: values.name || null,
            email: values.email || null,
            phone: values.phone || null,
            company_name: values.company_name || null,
            source: values.source || null,
            status: values.status,
            notes: values.notes || null,
        };

        try {
            await updateLead({ variables: { id: lead.id, input } });
            toast({ title: 'Lead updated.', status: 'success', duration: 3000, isClosable: true });
            onLeadUpdated(); // Refetch the leads list
            onClose(); // Close the modal
        } catch (err: any) {
            console.error('Error updating lead:', err);
            toast({ title: 'Error updating lead.', description: err.message, status: 'error', duration: 5000, isClosable: true });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>Edit Lead</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                     <VStack spacing={4}>
                        {/* Form Controls similar to CreateLeadModal */}
                        <FormControl isInvalid={!!errors.name}>
                            <FormLabel htmlFor="edit-name">Name</FormLabel>
                            <Input id="edit-name" placeholder="Lead name" {...register('name')} />
                            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel htmlFor="edit-email">Email</FormLabel>
                            <Input id="edit-email" type="email" placeholder="lead@example.com" {...register('email')} />
                             <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.phone}>
                            <FormLabel htmlFor="edit-phone">Phone</FormLabel>
                            <Input id="edit-phone" type="tel" placeholder="+1234567890" {...register('phone')} />
                             <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.company_name}>
                            <FormLabel htmlFor="edit-company_name">Company Name</FormLabel>
                            <Input id="edit-company_name" placeholder="Lead's company" {...register('company_name')} />
                             <FormErrorMessage>{errors.company_name?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.source}>
                            <FormLabel htmlFor="edit-source">Source</FormLabel>
                            <Input id="edit-source" placeholder="e.g., Website, Referral" {...register('source')} />
                             <FormErrorMessage>{errors.source?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.status}>
                            <FormLabel htmlFor="edit-status">Status</FormLabel>
                            <Select id="edit-status" placeholder="Select status" {...register('status', { required: 'Status is required' })}>
                                {leadStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </Select>
                            <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.notes}>
                            <FormLabel htmlFor="edit-notes">Notes</FormLabel>
                            <Textarea id="edit-notes" placeholder="Additional notes about the lead" {...register('notes')} />
                             <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} isLoading={isSubmitting || loading} type="submit">
                        Save Changes
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditLeadModal; 