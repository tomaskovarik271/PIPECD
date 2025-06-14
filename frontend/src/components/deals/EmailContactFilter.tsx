import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  CheckboxGroup,
  Checkbox,
  Text,
  Box,
  HStack,
  Badge,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { FiInfo, FiUsers, FiUser, FiSettings } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';

// =============================================
// Types
// =============================================

export type ContactScopeType = 'PRIMARY' | 'ALL' | 'CUSTOM' | 'SELECTED_ROLES';
export type ContactRoleType = 'PRIMARY' | 'DECISION_MAKER' | 'INFLUENCER' | 'TECHNICAL' | 'LEGAL' | 'OTHER';

export interface EmailContactFilterProps {
  dealId: string;
  currentScope: ContactScopeType;
  selectedContacts: string[];
  selectedRoles: ContactRoleType[];
  includeNewParticipants: boolean;
  onScopeChange: (scope: ContactScopeType) => void;
  onContactsChange: (contactIds: string[]) => void;
  onRolesChange: (roles: ContactRoleType[]) => void;
  onNewParticipantsChange: (include: boolean) => void;
  contactAssociations?: Array<{
    id: string;
    personId: string;
    personFirstName?: string;
    personLastName?: string;
    personEmail?: string;
    role: ContactRoleType;
    customRoleLabel?: string;
  }>;
  isLoading?: boolean;
}

// =============================================
// Contact Multi-Select Component
// =============================================

interface ContactMultiSelectProps {
  dealId: string;
  selectedContacts: string[];
  onSelectionChange: (contactIds: string[]) => void;
  contactAssociations?: Array<{
    id: string;
    personId: string;
    personFirstName?: string;
    personLastName?: string;
    personEmail?: string;
    role: ContactRoleType;
    customRoleLabel?: string;
  }>;
}

const ContactMultiSelect: React.FC<ContactMultiSelectProps> = ({
  dealId,
  selectedContacts,
  onSelectionChange,
  contactAssociations = [],
}) => {
  const colors = useThemeColors();

  const handleContactToggle = (personId: string) => {
    const newSelection = selectedContacts.includes(personId)
      ? selectedContacts.filter(id => id !== personId)
      : [...selectedContacts, personId];
    onSelectionChange(newSelection);
  };

  const getRoleBadgeColor = (role: ContactRoleType) => {
    switch (role) {
      case 'PRIMARY': return 'blue';
      case 'DECISION_MAKER': return 'purple';
      case 'INFLUENCER': return 'green';
      case 'TECHNICAL': return 'orange';
      case 'LEGAL': return 'red';
      default: return 'gray';
    }
  };

  const getRoleLabel = (role: ContactRoleType, customLabel?: string) => {
    if (customLabel) return customLabel;
    switch (role) {
      case 'PRIMARY': return 'Primary';
      case 'DECISION_MAKER': return 'Decision Maker';
      case 'INFLUENCER': return 'Influencer';
      case 'TECHNICAL': return 'Technical';
      case 'LEGAL': return 'Legal';
      default: return 'Other';
    }
  };

  return (
    <VStack align="stretch" spacing={2}>
      <Text fontSize="sm" fontWeight="medium" color={colors.text.secondary}>
        Select Contacts ({selectedContacts.length} selected)
      </Text>
      <Box maxH="200px" overflowY="auto" border="1px solid" borderColor={colors.border.default} borderRadius="md" p={2}>
        {contactAssociations.length === 0 ? (
          <Text fontSize="sm" color={colors.text.muted} textAlign="center" py={4}>
            No contacts associated with this deal
          </Text>
        ) : (
          <VStack align="stretch" spacing={1}>
            {contactAssociations.map((contact) => (
              <Box
                key={contact.personId}
                p={2}
                borderRadius="md"
                bg={selectedContacts.includes(contact.personId) ? colors.bg.selected : 'transparent'}
                border="1px solid"
                borderColor={selectedContacts.includes(contact.personId) ? colors.border.selected : 'transparent'}
                cursor="pointer"
                _hover={{ bg: colors.bg.hover }}
                onClick={() => handleContactToggle(contact.personId)}
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0} flex={1}>
                    <HStack>
                      <Checkbox
                        isChecked={selectedContacts.includes(contact.personId)}
                        onChange={() => handleContactToggle(contact.personId)}
                        size="sm"
                      />
                      <Text fontSize="sm" fontWeight="medium">
                        {contact.personFirstName} {contact.personLastName}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={colors.text.muted} ml={6}>
                      {contact.personEmail}
                    </Text>
                  </VStack>
                  <Badge
                    size="sm"
                    colorScheme={getRoleBadgeColor(contact.role)}
                    variant="subtle"
                  >
                    {getRoleLabel(contact.role, contact.customRoleLabel)}
                  </Badge>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

// =============================================
// Main Email Contact Filter Component
// =============================================

export const EmailContactFilter: React.FC<EmailContactFilterProps> = ({
  dealId,
  currentScope,
  selectedContacts,
  selectedRoles,
  includeNewParticipants,
  onScopeChange,
  onContactsChange,
  onRolesChange,
  onNewParticipantsChange,
  contactAssociations = [],
  isLoading = false,
}) => {
  const colors = useThemeColors();

  const getScopeIcon = (scope: ContactScopeType) => {
    switch (scope) {
      case 'PRIMARY': return FiUser;
      case 'ALL': return FiUsers;
      case 'SELECTED_ROLES': return FiSettings;
      case 'CUSTOM': return FiSettings;
      default: return FiUser;
    }
  };

  const getScopeDescription = (scope: ContactScopeType) => {
    switch (scope) {
      case 'PRIMARY': return 'Show emails from primary contact only';
      case 'ALL': return 'Show emails from all deal contacts';
      case 'SELECTED_ROLES': return 'Show emails from contacts with specific roles';
      case 'CUSTOM': return 'Show emails from manually selected contacts';
      default: return '';
    }
  };

  const getContactCount = () => {
    switch (currentScope) {
      case 'PRIMARY':
        return contactAssociations.filter(c => c.role === 'PRIMARY').length;
      case 'ALL':
        return contactAssociations.length;
      case 'SELECTED_ROLES':
        return contactAssociations.filter(c => selectedRoles.includes(c.role)).length;
      case 'CUSTOM':
        return selectedContacts.length;
      default:
        return 0;
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Contact Scope Selection */}
      <FormControl>
        <HStack justify="space-between" mb={2}>
          <FormLabel fontSize="sm" fontWeight="medium" mb={0}>
            Contact Scope
          </FormLabel>
          <Tooltip label={getScopeDescription(currentScope)} placement="top">
            <Box>
              <Icon as={FiInfo} color={colors.text.muted} boxSize={3} />
            </Box>
          </Tooltip>
        </HStack>
        <Select 
          value={currentScope} 
          onChange={(e) => onScopeChange(e.target.value as ContactScopeType)}
          size="sm"
          isDisabled={isLoading}
        >
          <option value="PRIMARY">Primary Contact Only</option>
          <option value="ALL">All Deal Contacts</option>
          <option value="SELECTED_ROLES">By Role</option>
          <option value="CUSTOM">Custom Selection</option>
        </Select>
        
        {/* Contact Count Badge */}
        <HStack mt={2} spacing={2}>
          <Icon as={getScopeIcon(currentScope)} color={colors.text.muted} boxSize={3} />
          <Badge size="sm" colorScheme="blue" variant="subtle">
            {getContactCount()} contact{getContactCount() !== 1 ? 's' : ''}
          </Badge>
        </HStack>
      </FormControl>

      {/* Role Selection (when SELECTED_ROLES) */}
      {currentScope === 'SELECTED_ROLES' && (
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="medium">
            Contact Roles
          </FormLabel>
          <CheckboxGroup 
            value={selectedRoles} 
            onChange={(values) => onRolesChange(values as ContactRoleType[])}
          >
            <VStack align="start" spacing={2}>
              <Checkbox value="PRIMARY" size="sm" isDisabled={isLoading}>
                <HStack spacing={2}>
                  <Text fontSize="sm">Primary Contact</Text>
                  <Badge size="xs" colorScheme="blue" variant="outline">
                    {contactAssociations.filter(c => c.role === 'PRIMARY').length}
                  </Badge>
                </HStack>
              </Checkbox>
              <Checkbox value="DECISION_MAKER" size="sm" isDisabled={isLoading}>
                <HStack spacing={2}>
                  <Text fontSize="sm">Decision Maker</Text>
                  <Badge size="xs" colorScheme="purple" variant="outline">
                    {contactAssociations.filter(c => c.role === 'DECISION_MAKER').length}
                  </Badge>
                </HStack>
              </Checkbox>
              <Checkbox value="INFLUENCER" size="sm" isDisabled={isLoading}>
                <HStack spacing={2}>
                  <Text fontSize="sm">Influencer</Text>
                  <Badge size="xs" colorScheme="green" variant="outline">
                    {contactAssociations.filter(c => c.role === 'INFLUENCER').length}
                  </Badge>
                </HStack>
              </Checkbox>
              <Checkbox value="TECHNICAL" size="sm" isDisabled={isLoading}>
                <HStack spacing={2}>
                  <Text fontSize="sm">Technical Contact</Text>
                  <Badge size="xs" colorScheme="orange" variant="outline">
                    {contactAssociations.filter(c => c.role === 'TECHNICAL').length}
                  </Badge>
                </HStack>
              </Checkbox>
              <Checkbox value="LEGAL" size="sm" isDisabled={isLoading}>
                <HStack spacing={2}>
                  <Text fontSize="sm">Legal Contact</Text>
                  <Badge size="xs" colorScheme="red" variant="outline">
                    {contactAssociations.filter(c => c.role === 'LEGAL').length}
                  </Badge>
                </HStack>
              </Checkbox>
              <Checkbox value="OTHER" size="sm" isDisabled={isLoading}>
                <HStack spacing={2}>
                  <Text fontSize="sm">Other</Text>
                  <Badge size="xs" colorScheme="gray" variant="outline">
                    {contactAssociations.filter(c => c.role === 'OTHER').length}
                  </Badge>
                </HStack>
              </Checkbox>
            </VStack>
          </CheckboxGroup>
        </FormControl>
      )}

      {/* Custom Contact Selection (when CUSTOM) */}
      {currentScope === 'CUSTOM' && (
        <ContactMultiSelect
          dealId={dealId}
          selectedContacts={selectedContacts}
          onSelectionChange={onContactsChange}
          contactAssociations={contactAssociations}
        />
      )}

      {/* Auto-discovery Option */}
      <FormControl>
        <Checkbox 
          isChecked={includeNewParticipants}
          onChange={(e) => onNewParticipantsChange(e.target.checked)}
          size="sm"
          isDisabled={isLoading}
        >
          <VStack align="start" spacing={0}>
            <Text fontSize="sm">Include new email participants automatically</Text>
            <Text fontSize="xs" color={colors.text.muted}>
              Automatically discover and suggest new contacts from email threads
            </Text>
          </VStack>
        </Checkbox>
      </FormControl>

      {/* Summary */}
      {currentScope !== 'PRIMARY' && (
        <Box 
          p={3} 
          bg={colors.bg.subtle} 
          borderRadius="md" 
          border="1px solid" 
          borderColor={colors.border.subtle}
        >
          <Text fontSize="xs" color={colors.text.muted}>
            <strong>Active Filter:</strong> {getScopeDescription(currentScope)}
            {getContactCount() > 0 && ` (${getContactCount()} contact${getContactCount() !== 1 ? 's' : ''})`}
          </Text>
        </Box>
      )}
    </VStack>
  );
}; 