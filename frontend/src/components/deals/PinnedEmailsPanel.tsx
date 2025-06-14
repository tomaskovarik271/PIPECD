import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Card,
  CardBody,
  Badge,
  Tooltip,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Divider,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { FiTrash2, FiEdit3, FiMail } from 'react-icons/fi';
import { TbPin } from 'react-icons/tb';
import { useThemeColors } from '../../hooks/useThemeColors';

const GET_PINNED_EMAILS = gql`
  query GetPinnedEmails($dealId: ID!) {
    getPinnedEmails(dealId: $dealId) {
      id
      emailId
      threadId
      subject
      fromEmail
      pinnedAt
      notes
      createdAt
      updatedAt
    }
  }
`;

const UNPIN_EMAIL = gql`
  mutation UnpinEmail($id: ID!) {
    unpinEmail(id: $id)
  }
`;

const UPDATE_EMAIL_PIN = gql`
  mutation UpdateEmailPin($id: ID!, $input: UpdateEmailPinInput!) {
    updateEmailPin(id: $id, input: $input) {
      id
      notes
      updatedAt
    }
  }
`;

interface PinnedEmailsPanelProps {
  dealId: string;
}

interface EmailPin {
  id: string;
  emailId: string;
  threadId: string;
  subject: string;
  fromEmail: string;
  pinnedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const PinnedEmailsPanel: React.FC<PinnedEmailsPanelProps> = ({ dealId }) => {
  const colors = useThemeColors();
  const toast = useToast();

  const [editingPin, setEditingPin] = useState<EmailPin | null>(null);
  const [editNotes, setEditNotes] = useState('');

  // GraphQL hooks
  const { data, loading, error, refetch } = useQuery(GET_PINNED_EMAILS, {
    variables: { dealId },
    fetchPolicy: 'cache-and-network',
  });

  const [unpinEmail] = useMutation(UNPIN_EMAIL, {
    onCompleted: () => {
      toast({
        title: 'Email Unpinned',
        description: 'The email has been removed from pinned emails.',
        status: 'success',
        duration: 3000,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to Unpin Email',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const [updateEmailPin, { loading: updating }] = useMutation(UPDATE_EMAIL_PIN, {
    onCompleted: () => {
      toast({
        title: 'Notes Updated',
        description: 'Pin notes have been updated successfully.',
        status: 'success',
        duration: 3000,
      });
      setEditingPin(null);
      setEditNotes('');
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to Update Notes',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleUnpin = (pinId: string) => {
    unpinEmail({ variables: { id: pinId } });
  };

  const handleEditNotes = (pin: EmailPin) => {
    setEditingPin(pin);
    setEditNotes(pin.notes || '');
  };

  const handleSaveNotes = () => {
    if (!editingPin) return;

    updateEmailPin({
      variables: {
        id: editingPin.id,
        input: {
          notes: editNotes,
        },
      },
    });
  };

  const handleCloseEdit = () => {
    setEditingPin(null);
    setEditNotes('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Center>
          <VStack spacing={3}>
            <Spinner size="lg" color={colors.interactive.default} />
            <Text color={colors.text.secondary}>Loading pinned emails...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} textAlign="center">
        <Text color={colors.text.error}>Failed to load pinned emails</Text>
        <Button size="sm" mt={2} onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  const pinnedEmails = data?.getPinnedEmails || [];

  if (pinnedEmails.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <VStack spacing={3}>
          <TbPin size={32} color={colors.text.muted} />
          <Text color={colors.text.secondary} fontSize="lg">
            No Pinned Emails
          </Text>
          <Text color={colors.text.muted} fontSize="sm">
            Pin important emails to keep them easily accessible for this deal.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={3} align="stretch">
        {pinnedEmails.map((pin: EmailPin) => (
          <Card key={pin.id} variant="outline">
            <CardBody>
              <VStack spacing={3} align="stretch">
                {/* Email Header */}
                <HStack justify="space-between" align="start">
                  <VStack spacing={1} align="start" flex={1}>
                    <HStack spacing={2}>
                      <FiMail color={colors.text.secondary} />
                      <Text fontWeight="medium" color={colors.text.primary} fontSize="sm">
                        {pin.subject || '(No Subject)'}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      From: {pin.fromEmail}
                    </Text>
                  </VStack>

                  <HStack spacing={1}>
                    <Tooltip label="Edit notes">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<FiEdit3 />}
                        aria-label="Edit notes"
                        onClick={() => handleEditNotes(pin)}
                      />
                    </Tooltip>
                    <Tooltip label="Unpin email">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        icon={<FiTrash2 />}
                        aria-label="Unpin email"
                        onClick={() => handleUnpin(pin.id)}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>

                {/* Pin Info */}
                <HStack spacing={4} fontSize="xs" color={colors.text.muted}>
                  <HStack spacing={1}>
                    <TbPin />
                    <Text>Pinned {formatDate(pin.pinnedAt)}</Text>
                  </HStack>
                  <Badge size="sm" colorScheme="blue" variant="subtle">
                    PINNED
                  </Badge>
                </HStack>

                {/* Notes */}
                {pin.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="xs" fontWeight="medium" color={colors.text.secondary} mb={1}>
                        Notes:
                      </Text>
                      <Text fontSize="sm" color={colors.text.primary}>
                        {pin.notes}
                      </Text>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* Edit Notes Modal */}
      <Modal isOpen={!!editingPin} onClose={handleCloseEdit} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Pin Notes</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {editingPin && (
                <Box p={3} bg={colors.bg.elevated} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                    {editingPin.subject || '(No Subject)'}
                  </Text>
                  <Text fontSize="xs" color={colors.text.secondary}>
                    From: {editingPin.fromEmail}
                  </Text>
                </Box>
              )}

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about why this email is important..."
                  rows={4}
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveNotes}
              isLoading={updating}
              loadingText="Saving..."
            >
              Save Notes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PinnedEmailsPanel; 