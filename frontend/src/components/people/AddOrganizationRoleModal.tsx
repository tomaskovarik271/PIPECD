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
  Select,
  Switch,
  Textarea,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useOrganizationsStore } from '../../stores/useOrganizationsStore';
import type { PersonOrganizationRole } from '../../generated/graphql/graphql';
import { 
  CREATE_PERSON_ORGANIZATION_ROLE,
  UPDATE_PERSON_ORGANIZATION_ROLE,
  GET_PERSON_ORGANIZATION_ROLES,
  PersonOrganizationRoleInput,
  PersonOrganizationRoleUpdateInput
} from '../../lib/graphql/personOrganizationRoleOperations';

interface AddOrganizationRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
  existingRole?: PersonOrganizationRole | null;
  preselectedOrganizationId?: string;
  onSuccess: () => void;
}

const AddOrganizationRoleModal: React.FC<AddOrganizationRoleModalProps> = ({
  isOpen,
  onClose,
  personId,
  personName,
  existingRole,
  preselectedOrganizationId,
  onSuccess,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const { organizations, fetchOrganizations } = useOrganizationsStore();

  // GraphQL mutations
  const [createPersonOrganizationRole] = useMutation(CREATE_PERSON_ORGANIZATION_ROLE, {
    refetchQueries: [
      { query: GET_PERSON_ORGANIZATION_ROLES, variables: { personId } }
    ],
  });

  const [updatePersonOrganizationRole] = useMutation(UPDATE_PERSON_ORGANIZATION_ROLE, {
    refetchQueries: [
      { query: GET_PERSON_ORGANIZATION_ROLES, variables: { personId } }
    ],
  });

  // Form state
  const [formData, setFormData] = useState({
    organization_id: '',
    role_title: '',
    department: '',
    is_primary: false,
    status: 'active' as 'active' | 'inactive' | 'former',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load organizations on mount
  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
    }
  }, [isOpen, fetchOrganizations]);

  // Populate form for editing
  useEffect(() => {
    if (existingRole) {
      setFormData({
        organization_id: existingRole.organization_id,
        role_title: existingRole.role_title,
        department: existingRole.department || '',
        is_primary: existingRole.is_primary,
        status: existingRole.status as 'active' | 'inactive' | 'former',
        start_date: existingRole.start_date ? existingRole.start_date.split('T')[0] : '',
        end_date: existingRole.end_date ? existingRole.end_date.split('T')[0] : '',
        notes: existingRole.notes || '',
      });
    } else {
      // Reset form for new role
      setFormData({
        organization_id: preselectedOrganizationId || '',
        role_title: '',
        department: '',
        is_primary: false,
        status: 'active',
        start_date: '',
        end_date: '',
        notes: '',
      });
    }
    setErrors({});
  }, [existingRole, preselectedOrganizationId, isOpen]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    if (!formData.role_title.trim()) {
      newErrors.role_title = 'Role title is required';
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (existingRole) {
        // Update existing role
        const updateInput: PersonOrganizationRoleUpdateInput = {
          role_title: formData.role_title,
          department: formData.department || undefined,
          is_primary: formData.is_primary,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          notes: formData.notes || undefined,
        };

        await updatePersonOrganizationRole({
          variables: {
            id: existingRole.id,
            input: updateInput,
          },
        });

        toast({
          title: 'Role Updated',
          description: `Successfully updated organization role for ${personName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new role
        const createInput: PersonOrganizationRoleInput = {
          organization_id: formData.organization_id,
          role_title: formData.role_title,
          department: formData.department || undefined,
          is_primary: formData.is_primary,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          notes: formData.notes || undefined,
        };

        await createPersonOrganizationRole({
          variables: {
            personId,
            input: createInput,
          },
        });

        toast({
          title: 'Role Added',
          description: `Successfully added organization role for ${personName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting organization role:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${existingRole ? 'update' : 'add'} organization role`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={colors.bg.elevated} borderColor={colors.border.default}>
        <ModalHeader color={colors.text.primary}>
          {existingRole ? 'Edit Organization Role' : 'Add Organization Role'}
        </ModalHeader>
        <ModalCloseButton color={colors.text.secondary} />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                {existingRole ? 'Update' : 'Add'} an organization role for <strong>{personName}</strong>
              </Text>
            </Alert>

            {/* Organization Selection */}
            <FormControl isInvalid={!!errors.organization_id} isRequired>
              <FormLabel color={colors.text.primary}>Organization</FormLabel>
              <Select
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                placeholder="Select organization..."
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
                isDisabled={!!preselectedOrganizationId && !existingRole}
                opacity={!!preselectedOrganizationId && !existingRole ? 0.6 : 1}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </Select>
              {errors.organization_id && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {errors.organization_id}
                </Text>
              )}
              {!!preselectedOrganizationId && !existingRole && (
                <Text fontSize="xs" color={colors.text.muted} mt={1}>
                  Organization pre-selected from context
                </Text>
              )}
            </FormControl>

            {/* Role Information */}
            <HStack spacing={4}>
              <FormControl isInvalid={!!errors.role_title} isRequired flex={2}>
                <FormLabel color={colors.text.primary}>Role Title</FormLabel>
                <Input
                  value={formData.role_title}
                  onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                  placeholder="e.g., CFO, Board Member, Manager..."
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                  _placeholder={{ color: colors.text.secondary }}
                />
                {errors.role_title && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.role_title}
                  </Text>
                )}
              </FormControl>

              <FormControl flex={1}>
                <FormLabel color={colors.text.primary}>Department</FormLabel>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Finance, Sales..."
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                  _placeholder={{ color: colors.text.secondary }}
                />
              </FormControl>
            </HStack>

            {/* Primary Role & Status */}
            <HStack spacing={6}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="is_primary" mb="0" color={colors.text.primary}>
                  Primary Organization
                </FormLabel>
                <Switch
                  id="is_primary"
                  isChecked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  colorScheme="blue"
                />
              </FormControl>

              <FormControl>
                <FormLabel color={colors.text.primary}>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="former">Former</option>
                </Select>
              </FormControl>
            </HStack>

            {/* Date Range */}
            <HStack spacing={4}>
              <FormControl>
                <FormLabel color={colors.text.primary}>Start Date</FormLabel>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.end_date}>
                <FormLabel color={colors.text.primary}>End Date</FormLabel>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                />
                {errors.end_date && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.end_date}
                  </Text>
                )}
              </FormControl>
            </HStack>

            {/* Notes */}
            <FormControl>
              <FormLabel color={colors.text.primary}>Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional context about this role..."
                bg={colors.bg.input}
                borderColor={colors.border.input}
                color={colors.text.primary}
                _placeholder={{ color: colors.text.secondary }}
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleClose}
              borderColor={colors.border.default}
              color={colors.text.secondary}
              _hover={{ bg: colors.bg.surface }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={existingRole ? 'Updating...' : 'Adding...'}
            >
              {existingRole ? 'Update Role' : 'Add Role'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOrganizationRoleModal; 