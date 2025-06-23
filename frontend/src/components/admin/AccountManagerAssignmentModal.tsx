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
  VStack,
  HStack,
  Text,
  Select,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Box,
  Avatar,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ASSIGN_ACCOUNT_MANAGER, REMOVE_ACCOUNT_MANAGER } from '../../lib/graphql/accountOperations';

const GET_ASSIGNABLE_USERS_QUERY = gql`
  query GetAssignableUsersForAccountMgmt {
    assignableUsers {
      id
      display_name
      email
      avatar_url
    }
  }
`;

interface User {
  id: string;
  display_name?: string;
  email: string;
  avatar_url?: string;
}

interface AccountManagerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: {
    id: string;
    name: string;
    accountManager?: {
      id: string;
      display_name: string;
      email: string;
      avatar_url?: string;
    } | null;
  } | null;
  onAssignmentComplete: () => void;
}

const AccountManagerAssignmentModal: React.FC<AccountManagerAssignmentModalProps> = ({
  isOpen,
  onClose,
  organization,
  onAssignmentComplete,
}) => {
  const colors = useThemeColors();
  const toast = useToast();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get assignable users
  const { data: usersData, loading: usersLoading } = useQuery(GET_ASSIGNABLE_USERS_QUERY);

  // Mutations
  const [assignAccountManager] = useMutation(ASSIGN_ACCOUNT_MANAGER);
  const [removeAccountManager] = useMutation(REMOVE_ACCOUNT_MANAGER);

  const users = usersData?.assignableUsers || [];
  const currentAccountManager = organization?.accountManager;

  const handleAssign = async () => {
    if (!organization || !selectedUserId) return;

    setIsLoading(true);
    try {
      await assignAccountManager({
        variables: {
          organizationId: organization.id,
          userId: selectedUserId,
        },
      });

      const selectedUser = users.find((u: User) => u.id === selectedUserId);
      toast({
        title: 'Account Manager Assigned',
        description: `${selectedUser?.display_name || selectedUser?.email} has been assigned to ${organization.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onAssignmentComplete();
      onClose();
    } catch (error: unknown) {
      toast({
        title: 'Assignment Failed',
        description: error instanceof Error ? error.message : 'Failed to assign account manager',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!organization || !currentAccountManager) return;

    setIsLoading(true);
    try {
      await removeAccountManager({
        variables: {
          organizationId: organization.id,
        },
      });

      toast({
        title: 'Account Manager Removed',
        description: `${currentAccountManager.display_name} has been removed from ${organization.name}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      onAssignmentComplete();
      onClose();
    } catch (error: unknown) {
      toast({
        title: 'Removal Failed',
        description: error instanceof Error ? error.message : 'Failed to remove account manager',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    onClose();
  };

  if (!organization) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Account Manager</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Organization Info */}
            <Box p={3} bg={colors.bg.surface} borderRadius="md" borderWidth="1px" borderColor={colors.border.default}>
              <Text fontWeight="semibold" color={colors.text.primary}>
                {organization.name}
              </Text>
            </Box>

            {/* Current Account Manager */}
            {currentAccountManager ? (
              <Box>
                <Text fontSize="sm" color={colors.text.muted} mb={2}>
                  Current Account Manager
                </Text>
                <HStack p={3} bg={colors.bg.surface} borderRadius="md" borderWidth="1px" borderColor={colors.border.default}>
                  <Avatar 
                    size="sm" 
                    src={currentAccountManager.avatar_url} 
                    name={currentAccountManager.display_name || currentAccountManager.email}
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="medium" color={colors.text.primary}>
                      {currentAccountManager.display_name || 'Unknown User'}
                    </Text>
                    <Text fontSize="sm" color={colors.text.secondary}>
                      {currentAccountManager.email}
                    </Text>
                  </VStack>
                  <Badge colorScheme="green" variant="subtle">
                    Assigned
                  </Badge>
                </HStack>
              </Box>
            ) : (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text>No account manager currently assigned to this organization.</Text>
              </Alert>
            )}

            <Divider />

            {/* Assignment Section */}
            <Box>
              <FormControl>
                <FormLabel>
                  {currentAccountManager ? 'Change Account Manager' : 'Assign Account Manager'}
                </FormLabel>
                <Select
                  placeholder="Select a user..."
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  isDisabled={usersLoading || isLoading}
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                >
                  {users.map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.email}
                    </option>
                  ))}
                </Select>
                {usersLoading && (
                  <HStack mt={2}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color={colors.text.muted}>
                      Loading users...
                    </Text>
                  </HStack>
                )}
              </FormControl>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose} isDisabled={isLoading}>
              Cancel
            </Button>
            
            {currentAccountManager && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleRemove}
                isLoading={isLoading}
                loadingText="Removing..."
              >
                Remove Current
              </Button>
            )}
            
            <Button
              colorScheme="blue"
              onClick={handleAssign}
              isDisabled={!selectedUserId || usersLoading}
              isLoading={isLoading}
              loadingText="Assigning..."
            >
              {currentAccountManager ? 'Change' : 'Assign'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccountManagerAssignmentModal; 