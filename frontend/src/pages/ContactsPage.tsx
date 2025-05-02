import { useEffect, useState, useCallback } from 'react';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import {
  Button,
  Box,
  Heading,
  List, ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Spinner,
  Text,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
  Spacer,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import CreateContactForm from '../components/CreateContactForm';
import EditContactForm from '../components/EditContactForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

// Define the query to fetch contacts
const GET_CONTACTS_QUERY = gql`
  query GetContacts {
    contacts {
      id
      first_name
      last_name
      email
      phone
      company
      notes
      created_at
      updated_at
    }
  }
`;

// Define the expected shape of a contact
interface Contact {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gqlClient.request<{ contacts: Contact[] }>(GET_CONTACTS_QUERY);
      setContacts(data.contacts || []);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCreateSuccess = () => {
    fetchContacts();
    onCreateClose();
  };

  const handleEditClick = (contact: Contact) => {
    setContactToEdit(contact);
    onEditOpen();
  };

  const handleEditSuccess = () => {
    fetchContacts();
    onEditClose();
    setContactToEdit(null);
  };

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    onDeleteOpen();
  };

  const handleDeleteSuccess = () => {
    fetchContacts();
    onDeleteClose();
    setContactToDelete(null);
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg">Contacts</Heading>
        <Button colorScheme="blue" onClick={onCreateOpen}>
          Add Contact
        </Button>
      </Box>

      {loading && <Spinner size="xl" />}
      {error && <Text color="red.500">{error}</Text>}

      {!loading && !error && (
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          {contacts.length === 0 ? (
            <Text>No contacts found.</Text>
          ) : (
            <List spacing={3}>
              {contacts.map(contact => (
                <ListItem key={contact.id} borderWidth="1px" borderRadius="md" p={3} display="flex" alignItems="center">
                  <Box flexGrow={1}>
                    <Text fontWeight="bold">
                      {contact.first_name} {contact.last_name}
                    </Text>
                    <Text fontSize="sm">{contact.email || 'No email'}</Text>
                    <Text fontSize="sm">{contact.phone || 'No phone'}</Text>
                    <Text fontSize="sm">{contact.company || 'No company'}</Text>
                  </Box>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Edit contact"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEditClick(contact)}
                    />
                    <IconButton
                      aria-label="Delete contact"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDeleteClick(contact)}
                    />
                  </HStack>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Contact</ModalHeader>
          <ModalCloseButton />
          <CreateContactForm onClose={onCreateClose} onSuccess={handleCreateSuccess} />
        </ModalContent>
      </Modal>

      {contactToEdit && (
        <Modal isOpen={isEditOpen} onClose={() => { setContactToEdit(null); onEditClose(); }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Contact</ModalHeader>
            <ModalCloseButton onClick={() => { setContactToEdit(null); onEditClose(); }} />
            <EditContactForm 
              contact={contactToEdit} 
              onClose={() => { setContactToEdit(null); onEditClose(); }} 
              onSuccess={handleEditSuccess} 
            />
          </ModalContent>
        </Modal>
      )}

      {contactToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteOpen}
          onClose={() => { setContactToDelete(null); onDeleteClose(); }}
          contact={contactToDelete}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </VStack>
  );
}

export default ContactsPage; 