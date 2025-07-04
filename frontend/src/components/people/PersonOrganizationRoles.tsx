import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  Card,
  CardBody,
  Icon,
  Link,
  Divider,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeColors } from '../../hooks/useThemeColors';
import { CalendarIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { FaBuilding } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

// Types from generated GraphQL
import type { PersonOrganizationRole } from '../../generated/graphql/graphql';
import AddOrganizationRoleModal from './AddOrganizationRoleModal';

interface PersonOrganizationRolesProps {
  organizationRoles: PersonOrganizationRole[];
  primaryOrganization?: {
    id: string;
    name: string;
  } | null;
  legacyOrganization?: {
    id: string;
    name: string;
  } | null;
  personId: string;
  personName: string;
  onRefresh?: () => void;
}

const PersonOrganizationRoles: React.FC<PersonOrganizationRolesProps> = ({
  organizationRoles,
  primaryOrganization,
  legacyOrganization,
  personId,
  personName,
  onRefresh,
  }) => {
  const colors = useThemeColors();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingRole, setEditingRole] = useState<PersonOrganizationRole | null>(null);

  const handleAddRole = () => {
    setEditingRole(null);
    onOpen();
  };

  const handleEditRole = (role: PersonOrganizationRole) => {
    setEditingRole(role);
    onOpen();
  };

  const handleSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Helper to format dates
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  // Helper to get status color
  const getStatusColor = (status: string, isPrimary: boolean) => {
    if (isPrimary) return 'blue';
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'former': return 'red';
      default: return 'gray';
    }
  };

  // Fallback to legacy organization if no roles exist
  const hasRoles = organizationRoles && organizationRoles.length > 0;
  const displayPrimaryOrg = primaryOrganization || legacyOrganization;

  return (
    <VStack spacing={4} align="stretch">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="md" color={colors.text.primary}>
          Organization Affiliations
        </Heading>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={handleAddRole}
        >
          Add Role
        </Button>
      </HStack>

      {!hasRoles && displayPrimaryOrg ? (
        // Legacy single organization display
        <Card 
          bg={colors.bg.elevated}
          borderColor={colors.border.default}
          borderWidth="2px"
        >
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <HStack spacing={3}>
                  <Icon as={FaBuilding} color={colors.text.secondary} />
                  <VStack align="start" spacing={0}>
                    <Link 
                      as={RouterLink} 
                      to={`/organizations/${displayPrimaryOrg.id}`}
                      fontWeight="semibold"
                      color={colors.text.link}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {displayPrimaryOrg.name}
                    </Link>
                    <Text fontSize="sm" color={colors.text.secondary}>
                      Contact (Legacy)
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme="blue" variant="solid">
                  Primary
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ) : hasRoles ? (
        // Multi-organization roles display
        <VStack spacing={3} align="stretch">
          {organizationRoles.map((role) => (
            <Card 
              key={role.id}
              bg={colors.bg.elevated}
              borderColor={role.is_primary ? colors.border.accent : colors.border.default}
              borderWidth={role.is_primary ? "2px" : "1px"}
            >
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  {/* Organization and Role Header */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3}>
                      <Icon as={FaBuilding} color={colors.text.secondary} />
                      <VStack align="start" spacing={0}>
                        <Link 
                          as={RouterLink} 
                          to={`/organizations/${role.organization_id}`}
                          fontWeight="semibold"
                          color={colors.text.link}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          {role.organization?.name || 'Unknown Organization'}
                        </Link>
                        <Text fontSize="sm" color={colors.text.secondary}>
                          {role.role_title}
                          {role.department && ` • ${role.department}`}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={2}>
                      {role.is_primary && (
                        <Badge colorScheme="blue" variant="solid">
                          Primary
                        </Badge>
                      )}
                      <Badge 
                        colorScheme={getStatusColor(role.status, role.is_primary)}
                        variant="outline"
                      >
                        {role.status}
                      </Badge>
                    </HStack>
                  </HStack>

                  {/* Duration and Additional Info */}
                  {(role.start_date || role.end_date || role.notes) && (
                    <>
                      <Divider borderColor={colors.border.default} />
                      <VStack align="stretch" spacing={2}>
                        {(role.start_date || role.end_date) && (
                          <HStack spacing={2}>
                            <Icon as={CalendarIcon} color={colors.text.secondary} boxSize={3} />
                            <Text fontSize="xs" color={colors.text.secondary}>
                              {role.start_date && formatDate(role.start_date)}
                              {role.start_date && role.end_date && ' - '}
                              {role.end_date ? formatDate(role.end_date) : 'Present'}
                            </Text>
                          </HStack>
                        )}
                        
                        {role.notes && (
                          <HStack spacing={2} align="start">
                            <Icon as={InfoOutlineIcon} color={colors.text.secondary} boxSize={3} mt={0.5} />
                            <Text fontSize="xs" color={colors.text.secondary}>
                              {role.notes}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      ) : (
        // No organizations
        <Card 
          bg={colors.bg.surface}
          borderColor={colors.border.default}
          borderStyle="dashed"
        >
          <CardBody textAlign="center" py={8}>
            <VStack spacing={3}>
              <Icon as={FaBuilding} color={colors.text.secondary} boxSize={8} />
              <VStack spacing={1}>
                <Text fontWeight="medium" color={colors.text.secondary}>
                  No Organization Affiliations
                </Text>
                <Text fontSize="sm" color={colors.text.secondary}>
                  This person is not currently associated with any organizations
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Add/Edit Organization Role Modal */}
      <AddOrganizationRoleModal
        isOpen={isOpen}
        onClose={onClose}
        personId={personId}
        personName={personName}
        existingRole={editingRole}
        onSuccess={handleSuccess}
      />
    </VStack>
  );
};

export default PersonOrganizationRoles; 