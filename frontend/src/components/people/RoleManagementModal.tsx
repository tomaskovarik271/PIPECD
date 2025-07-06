import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
  Box,
  Divider,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { FaUserTie } from 'react-icons/fa';
import type { PersonOrganizationRole } from '../../generated/graphql/graphql';
import AddOrganizationRoleModal from './AddOrganizationRoleModal';
import DeleteRoleConfirmationModal from './DeleteRoleConfirmationModal';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  organizationId: string;
  organizationName: string;
  existingRoles: PersonOrganizationRole[];
  onSuccess: () => void;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  personId,
  personName,
  organizationId,
  organizationName,
  existingRoles,
  onSuccess,
}) => {
  const colors = useThemeColors();
  
  // Modal states
  const { isOpen: isAddRoleOpen, onOpen: onAddRoleOpen, onClose: onAddRoleClose } = useDisclosure();
  const { isOpen: isEditRoleOpen, onOpen: onEditRoleOpen, onClose: onEditRoleClose } = useDisclosure();
  const { isOpen: isDeleteRoleOpen, onOpen: onDeleteRoleOpen, onClose: onDeleteRoleClose } = useDisclosure();
  
  // Selected role for edit/delete operations
  const [selectedRole, setSelectedRole] = useState<PersonOrganizationRole | null>(null);

  const handleEditRole = (role: PersonOrganizationRole) => {
    setSelectedRole(role);
    onEditRoleOpen();
  };

  const handleDeleteRole = (role: PersonOrganizationRole) => {
    setSelectedRole(role);
    onDeleteRoleOpen();
  };

  const handleAddRole = () => {
    setSelectedRole(null);
    onAddRoleOpen();
  };

  const handleSuccess = () => {
    onSuccess();
    // Close any open sub-modals
    onAddRoleClose();
    onEditRoleClose();
    onDeleteRoleClose();
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
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={colors.bg.elevated} borderColor={colors.border.default}>
          <ModalHeader color={colors.text.primary}>
            <HStack spacing={3}>
              <Icon as={FaUserTie} color={colors.text.secondary} />
              <VStack align="start" spacing={0}>
                <Text>Manage Roles</Text>
                <Text fontSize="sm" fontWeight="normal" color={colors.text.secondary}>
                  {personName} at {organizationName}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={colors.text.secondary} />
          
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {existingRoles.length === 0 ? (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">No roles found</Text>
                    <Text fontSize="sm">
                      {personName} doesn't have any roles at {organizationName} yet.
                    </Text>
                  </VStack>
                </Alert>
              ) : (
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" color={colors.text.secondary} fontWeight="medium">
                    Current Roles ({existingRoles.length})
                  </Text>
                  
                  {existingRoles.map((role) => (
                    <Box
                      key={role.id}
                      p={4}
                      bg={colors.bg.surface}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={colors.border.default}
                    >
                      <HStack justifyContent="space-between" align="start">
                        <VStack align="start" spacing={2} flex={1}>
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
                          
                          {role.department && (
                            <Text fontSize="sm" color={colors.text.secondary}>
                              Department: {role.department}
                            </Text>
                          )}
                          
                          <HStack spacing={4}>
                            <Text fontSize="xs" color={colors.text.muted}>
                              Start: {formatDate(role.start_date)}
                            </Text>
                            {role.end_date && (
                              <Text fontSize="xs" color={colors.text.muted}>
                                End: {formatDate(role.end_date)}
                              </Text>
                            )}
                          </HStack>
                          
                          {role.notes && (
                            <Text fontSize="sm" color={colors.text.secondary} fontStyle="italic">
                              "{role.notes}"
                            </Text>
                          )}
                        </VStack>
                        
                        <VStack spacing={1}>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<EditIcon />}
                            onClick={() => handleEditRole(role)}
                            colorScheme="blue"
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<DeleteIcon />}
                            onClick={() => handleDeleteRole(role)}
                            colorScheme="red"
                          >
                            Delete
                          </Button>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
              
              <Divider />
              
              <Button
                colorScheme="blue"
                leftIcon={<AddIcon />}
                onClick={handleAddRole}
                size="md"
              >
                Add New Role
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add/Edit Role Modal */}
      <AddOrganizationRoleModal
        isOpen={isAddRoleOpen || isEditRoleOpen}
        onClose={() => {
          onAddRoleClose();
          onEditRoleClose();
          setSelectedRole(null);
        }}
        personId={personId}
        personName={personName}
        existingRole={selectedRole}
        preselectedOrganizationId={organizationId}
        onSuccess={handleSuccess}
      />

      {/* Delete Role Confirmation Modal */}
      {selectedRole && (
        <DeleteRoleConfirmationModal
          isOpen={isDeleteRoleOpen}
          onClose={() => {
            onDeleteRoleClose();
            setSelectedRole(null);
          }}
          role={selectedRole}
          personName={personName}
          organizationName={organizationName}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default RoleManagementModal; 