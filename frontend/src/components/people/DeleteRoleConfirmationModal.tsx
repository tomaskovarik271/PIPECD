import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { WarningIcon } from '@chakra-ui/icons';
import { useMutation } from '@apollo/client';
import { DELETE_PERSON_ORGANIZATION_ROLE } from '../../lib/graphql/personOrganizationRoleOperations';
import type { PersonOrganizationRole } from '../../generated/graphql/graphql';

interface DeleteRoleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: PersonOrganizationRole;
  personName: string;
  organizationName: string;
  onSuccess: () => void;
}

const DeleteRoleConfirmationModal: React.FC<DeleteRoleConfirmationModalProps> = ({
  isOpen,
  onClose,
  role,
  personName,
  organizationName,
  onSuccess,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteRole] = useMutation(DELETE_PERSON_ORGANIZATION_ROLE, {
    onCompleted: () => {
      toast({
        title: 'Role Deleted',
        description: `Successfully removed ${role.role_title} role from ${personName} at ${organizationName}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting Role',
        description: error.message || 'Failed to delete role. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRole({
        variables: {
          roleId: role.id,
        },
      });
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={colors.bg.elevated} borderColor={colors.border.default}>
        <ModalHeader color={colors.text.primary}>
          <HStack spacing={3}>
            <Icon as={WarningIcon} color="red.500" />
            <Text>Delete Role</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={colors.text.secondary} />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Are you sure you want to delete this role?</Text>
                <Text fontSize="sm">
                  This action cannot be undone. The role will be permanently removed.
                </Text>
              </VStack>
            </Alert>
            
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" color={colors.text.secondary} fontWeight="medium">
                Role Details:
              </Text>
              
              <VStack align="start" spacing={2} p={4} bg={colors.bg.surface} borderRadius="md">
                <HStack spacing={2} wrap="wrap">
                  <Text fontWeight="medium" color={colors.text.primary}>
                    {role.role_title}
                  </Text>
                  {role.is_primary && (
                    <Badge colorScheme="blue" variant="solid" size="sm">
                      PRIMARY
                    </Badge>
                  )}
                  <Badge 
                    colorScheme={role.status === 'active' ? 'green' : role.status === 'former' ? 'gray' : 'orange'} 
                    variant="subtle" 
                    size="sm"
                  >
                    {role.status.toUpperCase()}
                  </Badge>
                </HStack>
                
                <Text fontSize="sm" color={colors.text.secondary}>
                  <strong>Person:</strong> {personName}
                </Text>
                <Text fontSize="sm" color={colors.text.secondary}>
                  <strong>Organization:</strong> {organizationName}
                </Text>
                
                {role.department && (
                  <Text fontSize="sm" color={colors.text.secondary}>
                    <strong>Department:</strong> {role.department}
                  </Text>
                )}
                
                <HStack spacing={4}>
                  <Text fontSize="xs" color={colors.text.muted}>
                    <strong>Start:</strong> {formatDate(role.start_date)}
                  </Text>
                  {role.end_date && (
                    <Text fontSize="xs" color={colors.text.muted}>
                      <strong>End:</strong> {formatDate(role.end_date)}
                    </Text>
                  )}
                </HStack>
                
                {role.notes && (
                  <Text fontSize="sm" color={colors.text.secondary}>
                    <strong>Notes:</strong> "{role.notes}"
                  </Text>
                )}
              </VStack>
            </VStack>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText="Deleting..."
            >
              Delete Role
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteRoleConfirmationModal; 