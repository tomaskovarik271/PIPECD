import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Spinner,
  useToast,
  Box,
  Flex,
  Badge,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, SmallCloseIcon, EmailIcon, PhoneIcon, InfoIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { FaBuilding } from 'react-icons/fa';
import { useThemeColors } from '../../hooks/useThemeColors';
import { usePeopleStore } from '../../stores/usePeopleStore';
import { useOrganizationsStore } from '../../stores/useOrganizationsStore';
import SearchableSelect, { SearchableSelectOption } from '../common/SearchableSelect';
import type { Person } from '../../generated/graphql/graphql';

interface InlineContactEditorProps {
  person: Person;
  onUpdate?: () => void;
  canEdit?: boolean;
}

interface EditableFieldProps {
  label: string;
  value: string | null | undefined;
  placeholder: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  canEdit?: boolean;
  type?: 'text' | 'email' | 'tel';
  icon?: React.ReactElement;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  placeholder,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isLoading = false,
  canEdit = true,
  type = 'text',
  icon,
}) => {
  const colors = useThemeColors();
  const [editValue, setEditValue] = useState(value || '');

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(editValue);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary} mb={1}>
        {label}
      </Text>
      <HStack spacing={2} align="center">
        {icon && (
          <Box color={colors.text.secondary} flexShrink={0}>
            {icon}
          </Box>
        )}
        
        {isEditing ? (
          <HStack spacing={2} flex={1}>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              size="sm"
              bg={colors.bg.input}
              borderColor={colors.border.input}
              color={colors.text.primary}
              _placeholder={{ color: colors.text.secondary }}
              type={type}
              autoFocus
            />
            <IconButton
              aria-label="Save"
              icon={isLoading ? <Spinner size="xs" /> : <CheckIcon />}
              size="xs"
              colorScheme="green"
              onClick={() => onSave(editValue)}
              isDisabled={isLoading}
            />
            <IconButton
              aria-label="Cancel"
              icon={<SmallCloseIcon />}
              size="xs"
              variant="ghost"
              onClick={onCancel}
              isDisabled={isLoading}
            />
          </HStack>
        ) : (
          <HStack spacing={2} flex={1}>
            <Text
              color={value ? colors.text.primary : colors.text.secondary}
              fontStyle={value ? 'normal' : 'italic'}
              flex={1}
            >
              {value || placeholder}
            </Text>
            {canEdit && (
              <IconButton
                aria-label={`Edit ${label}`}
                icon={<EditIcon />}
                size="xs"
                variant="ghost"
                onClick={onEdit}
              />
            )}
          </HStack>
        )}
      </HStack>
    </Box>
  );
};

const InlineContactEditor: React.FC<InlineContactEditorProps> = ({
  person,
  onUpdate,
  canEdit = true,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const { updatePerson } = usePeopleStore();
  const { organizations, organizationsLoading, fetchOrganizations } = useOrganizationsStore();

  // Editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (organizations.length === 0) {
      fetchOrganizations();
    }
  }, [organizations.length, fetchOrganizations]);

  const handleFieldUpdate = async (field: string, newValue: string) => {
    if (!person.id) return;

    setIsLoading(true);
    try {
      await updatePerson(person.id, { [field]: newValue.trim() || null });
      toast({
        title: `${field.replace('_', ' ')} Updated`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setEditingField(null);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error(`Error updating ${field}:`, error);
      const errorMessage = error.message;
      if (errorMessage?.includes('Forbidden') || errorMessage?.includes('permission')) {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to update this contact.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Update Failed',
          description: `Could not update ${field.replace('_', ' ')}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationUpdate = async (organizationId: string) => {
    if (!person.id) return;

    setIsLoading(true);
    try {
      await updatePerson(person.id, { organization_id: organizationId || null });
      toast({
        title: 'Company Updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setEditingField(null);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update company',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Convert organizations to SearchableSelect options
  const organizationOptions: SearchableSelectOption[] = organizations.map(org => ({
    value: org.id,
    label: org.name,
  }));

  // Get organization name for display
  const organizationName = person.organization?.name || 
    (person.organization_id && organizations.find(org => org.id === person.organization_id)?.name);

  return (
    <VStack spacing={6} align="stretch">
      {/* Personal Information */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" color={colors.text.primary} mb={4}>
          Contact Information
        </Text>
        
        <VStack spacing={4} align="stretch">
          <EditableField
            label="First Name"
            value={person.first_name}
            placeholder="Enter first name"
            isEditing={editingField === 'first_name'}
            onEdit={() => setEditingField('first_name')}
            onSave={(value) => handleFieldUpdate('first_name', value)}
            onCancel={() => setEditingField(null)}
            isLoading={isLoading && editingField === 'first_name'}
            canEdit={canEdit}
          />

          <EditableField
            label="Last Name"
            value={person.last_name}
            placeholder="Enter last name"
            isEditing={editingField === 'last_name'}
            onEdit={() => setEditingField('last_name')}
            onSave={(value) => handleFieldUpdate('last_name', value)}
            onCancel={() => setEditingField(null)}
            isLoading={isLoading && editingField === 'last_name'}
            canEdit={canEdit}
          />

          <EditableField
            label="Email"
            value={person.email}
            placeholder="Enter email address"
            isEditing={editingField === 'email'}
            onEdit={() => setEditingField('email')}
            onSave={(value) => handleFieldUpdate('email', value)}
            onCancel={() => setEditingField(null)}
            isLoading={isLoading && editingField === 'email'}
            canEdit={canEdit}
            type="email"
            icon={<EmailIcon />}
          />

          <EditableField
            label="Phone"
            value={person.phone}
            placeholder="Enter phone number"
            isEditing={editingField === 'phone'}
            onEdit={() => setEditingField('phone')}
            onSave={(value) => handleFieldUpdate('phone', value)}
            onCancel={() => setEditingField(null)}
            isLoading={isLoading && editingField === 'phone'}
            canEdit={canEdit}
            type="tel"
            icon={<PhoneIcon />}
          />
        </VStack>
      </Box>

      {/* Professional Information */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" color={colors.text.primary} mb={4}>
          Professional Information
        </Text>
        
        <VStack spacing={4} align="stretch">
          <EditableField
            label="Job Title"
            value={(person as any).job_title}
            placeholder="Enter job title"
            isEditing={editingField === 'job_title'}
            onEdit={() => setEditingField('job_title')}
            onSave={(value) => handleFieldUpdate('job_title', value)}
            onCancel={() => setEditingField(null)}
            isLoading={isLoading && editingField === 'job_title'}
            canEdit={canEdit}
          />

          {/* Company Selection */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary} mb={1}>
              Company
            </Text>
            <HStack spacing={2} align="center">
              <Box color={colors.text.secondary} flexShrink={0}>
                <FaBuilding />
              </Box>
              
              {editingField === 'organization' ? (
                <HStack spacing={2} flex={1}>
                  <SearchableSelect
                    options={organizationOptions}
                    value={person.organization_id || ''}
                    onChange={handleOrganizationUpdate}
                    placeholder="Select company (optional)"
                    isLoading={organizationsLoading || isLoading}
                    isDisabled={organizationsLoading || isLoading}
                    size="sm"
                  />
                  <IconButton
                    aria-label="Cancel"
                    icon={<SmallCloseIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setEditingField(null)}
                    isDisabled={isLoading}
                  />
                </HStack>
              ) : (
                <HStack spacing={2} flex={1}>
                  {organizationName ? (
                    <ChakraLink
                      as={RouterLink}
                      to={`/organizations/${person.organization_id}`}
                      color={colors.interactive.default}
                      _hover={{ textDecoration: 'underline' }}
                      flex={1}
                    >
                      {organizationName}
                    </ChakraLink>
                  ) : (
                    <Text
                      color={colors.text.secondary}
                      fontStyle="italic"
                      flex={1}
                    >
                      No company assigned
                    </Text>
                  )}
                  {canEdit && (
                    <IconButton
                      aria-label="Edit Company"
                      icon={<EditIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => setEditingField('organization')}
                    />
                  )}
                </HStack>
              )}
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Notes Section */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" color={colors.text.primary} mb={4}>
          Notes
        </Text>
        
        <EditableField
          label="Additional Information"
          value={person.notes}
          placeholder="Add notes about this contact..."
          isEditing={editingField === 'notes'}
          onEdit={() => setEditingField('notes')}
          onSave={(value) => handleFieldUpdate('notes', value)}
          onCancel={() => setEditingField(null)}
          isLoading={isLoading && editingField === 'notes'}
          canEdit={canEdit}
          icon={<InfoIcon />}
        />
      </Box>
    </VStack>
  );
};

export default InlineContactEditor;