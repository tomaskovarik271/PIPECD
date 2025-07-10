import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Link,
  Icon,
  Button,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  IconButton,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { EmailIcon, PhoneIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useQuery } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../stores/useThemeStore';
import { GET_ORGANIZATION_PEOPLE_WITH_ROLES } from '../../lib/graphql/personOrganizationRoleOperations';
import type { Person, PersonOrganizationRole } from '../../generated/graphql/graphql';
import RoleManagementModal from '../people/RoleManagementModal';
import AddPersonToOrganizationModal from '../organizations/AddPersonToOrganizationModal';
import { SmartEmailButton } from '../common/SmartEmailComposer';

interface ContactRole extends Omit<PersonOrganizationRole, 'person'> {
  person: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

interface DealOrganizationContactsPanelProps {
  organization: {
    id: string;
    name: string;
  } | null;
  onContactCountChange?: (count: number) => void;
  dealId?: string;
  dealName?: string;
}

export const DealOrganizationContactsPanel: React.FC<DealOrganizationContactsPanelProps> = ({
  organization,
  onContactCountChange,
  dealId,
  dealName,
}) => {
  const colors = useThemeColors();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const [includeFormerEmployees, setIncludeFormerEmployees] = useState(false);
  
  // Modal state for role management
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddPersonOpen, onOpen: onAddPersonOpen, onClose: onAddPersonClose } = useDisclosure();
  const [selectedPerson, setSelectedPerson] = useState<{ id: string; name: string } | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ORGANIZATION_PEOPLE_WITH_ROLES, {
    variables: { 
      organizationId: organization?.id || '',
      includeFormerEmployees 
    },
    skip: !organization?.id,
  });

  const people = data?.peopleByOrganization || [];
  
  // Consolidate people with multiple roles to avoid duplicates
  const consolidatedContacts = useMemo(() => {
    const contactMap = new Map<string, {
      person: {
        id: string;
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
        phone?: string | null;
      };
      roles: PersonOrganizationRole[];
    }>();

    people.forEach((person: Person) => {
      const personRoles = person.organizationRoles?.filter(
        (role: PersonOrganizationRole) => role.organization_id === organization?.id
      ) || [];

      if (personRoles.length > 0) {
        contactMap.set(person.id, {
        person: {
          id: person.id,
          first_name: person.first_name,
          last_name: person.last_name,
          email: person.email,
          phone: person.phone,
          },
          roles: personRoles,
        });
        }
    });

    return Array.from(contactMap.values());
  }, [people, organization?.id]);

  // Handler functions for role management
  const handleManageRoles = (person: { id: string; first_name?: string | null; last_name?: string | null }) => {
    const personName = `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown Person';
    setSelectedPerson({ id: person.id, name: personName });
    onOpen();
  };

  const handleSuccess = () => {
    refetch();
    onClose();
  };

  const handleAddPersonSuccess = () => {
    refetch();
    onAddPersonClose();
  };
  
  // Get existing people IDs for filtering
  const existingPeopleIds = people.map((person: Person) => person.id);
  
      // Notify parent component of contact count
  React.useEffect(() => {
      if (onContactCountChange) {
      onContactCountChange(consolidatedContacts.length);
      }
  }, [consolidatedContacts.length, onContactCountChange]);

  if (!organization) {
    return (
      <>
        <Heading size="sm" mb={3} color={colors.text.primary}>Organization Contacts</Heading>
        <Center minH="100px" flexDirection="column" bg={colors.bg.elevated} borderRadius="md" p={4}>
          <Icon as={InfoIcon} w={6} h={6} color={colors.text.muted} mb={3} />
          <Text color={colors.text.secondary} fontSize="sm">No organization associated with this deal.</Text>
        </Center>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Heading size="sm" mb={3} color={colors.text.primary}>Organization Contacts</Heading>
        <Center minH="100px" flexDirection="column" bg={colors.bg.elevated} borderRadius="md" p={4}>
          <Spinner color={colors.interactive.default} />
          <Text color={colors.text.secondary} fontSize="sm" mt={2}>Loading contacts...</Text>
        </Center>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Heading size="sm" mb={3} color={colors.text.primary}>Organization Contacts</Heading>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">Error loading contacts: {error.message}</Text>
        </Alert>
      </>
    );
  }

  return (
    <Box
      bg={colors.component.kanban.column} 
      borderRadius="xl" 
      borderWidth="1px"
      borderColor={colors.component.kanban.cardBorder}
      boxShadow="steelPlate"
      p={6}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent 0%, ${currentThemeName === 'industrialMetal' ? 'rgba(255, 170, 0, 0.6)' : 'transparent'} 50%, transparent 100%)`,
        pointerEvents: 'none',
      }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading size="sm" color={colors.text.primary}>Organization Contacts</Heading>
        <HStack spacing={2}>
          <Badge variant="subtle" colorScheme="blue" fontSize="xs">
            {consolidatedContacts.length} contact{consolidatedContacts.length !== 1 ? 's' : ''}
          </Badge>
          {organization && (
            <Tooltip label="View organization profile">
              <IconButton
                as={RouterLink}
                to={`/organizations/${organization.id}`}
                icon={<ExternalLinkIcon />}
                aria-label="View organization"
                size="xs"
                variant="ghost"
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>

      {consolidatedContacts.length > 0 && (
        <FormControl display="flex" alignItems="center" mb={3}>
          <FormLabel htmlFor="include-former" fontSize="sm" mb={0} color={colors.text.secondary}>
            Include former employees
          </FormLabel>
          <Switch
            id="include-former"
            size="sm"
            isChecked={includeFormerEmployees}
            onChange={(e) => setIncludeFormerEmployees(e.target.checked)}
          />
        </FormControl>
      )}

      {consolidatedContacts.length === 0 ? (
        <Center minH="100px" flexDirection="column" bg={colors.bg.elevated} borderRadius="md" p={4}>
          <Icon as={InfoIcon} w={6} h={6} color={colors.text.muted} mb={3} />
          <Text color={colors.text.secondary} fontSize="sm" textAlign="center">
            No contacts found for {organization.name}
          </Text>
          <HStack spacing={2} mt={3}>
            <Button 
              size="sm" 
              colorScheme="blue"
              onClick={onAddPersonOpen}
            >
              Add Person
            </Button>
          <Button 
            as={RouterLink} 
            to="/people" 
            size="sm" 
            variant="outline" 
          >
              Manage All People
          </Button>
          </HStack>
        </Center>
      ) : (
        <VStack spacing={3} align="stretch" bg={colors.component.kanban.card} p={4} borderRadius="lg" borderWidth="1px" borderColor={colors.component.kanban.cardBorder} boxShadow="metallic">
          {consolidatedContacts.map((contact) => {
            const primaryRole = contact.roles.find(role => role.is_primary) || contact.roles[0];
            const hasPrimaryRole = contact.roles.some(role => role.is_primary);
            const hasFormerRole = contact.roles.some(role => role.status === 'former');
            
            return (
            <Box 
                key={contact.person.id} 
              p={3}
              borderRadius="md"
              bg={colors.component.kanban.card}
              borderWidth="1px"
              borderColor={colors.component.kanban.cardBorder}
              boxShadow="metallic"
              position="relative"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '3px',
                height: '100%',
                background: currentThemeName === 'industrialMetal' ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.8) 50%, rgba(255, 170, 0, 0.6) 100%)' : 'transparent',
                borderRadius: '0 0 0 md',
              }}
              _hover={{ 
                borderColor: colors.component.kanban.cardBorder,
                transform: 'translateX(4px) translateY(-1px)',
                boxShadow: 'industrial3d',
                bg: colors.component.kanban.cardHover,
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              <HStack spacing={3} align="start">
                <Avatar 
                  size="sm"
                    name={`${contact.person.first_name || ''} ${contact.person.last_name || ''}`}
                  bg={colors.interactive.default}
                  color={colors.text.onAccent}
                />
                <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2} align="center" wrap="wrap">
                  <Link 
                    as={RouterLink} 
                        to={`/people/${contact.person.id}`} 
                    fontWeight="medium" 
                    color={colors.text.link} 
                    _hover={{ textDecoration: 'underline' }}
                    fontSize="sm"
                  >
                        {contact.person.first_name} {contact.person.last_name}
                  </Link>
                      {hasPrimaryRole && (
                      <Badge size="sm" colorScheme="blue" variant="subtle">
                        PRIMARY
                      </Badge>
                    )}
                      {hasFormerRole && (
                      <Badge size="sm" colorScheme="gray" variant="subtle">
                        FORMER
                      </Badge>
                    )}
                  </HStack>
                  
                    {/* Show all roles as badges */}
                    <HStack spacing={1} wrap="wrap">
                      {contact.roles.map((role, index) => (
                        <Badge 
                          key={role.id} 
                          size="xs" 
                          colorScheme={role.is_primary ? "purple" : "gray"} 
                          variant="outline"
                        >
                    {role.role_title}
                          {role.department && ` (${role.department})`}
                        </Badge>
                      ))}
                    </HStack>
                  
                    {contact.person.email && (
                    <HStack spacing={1}>
                      <Icon as={EmailIcon} w={3} h={3} color={colors.text.muted} />
                      <Link 
                          href={`mailto:${contact.person.email}`} 
                        fontSize="xs" 
                        color={colors.text.secondary}
                        _hover={{ color: colors.text.link }}
                      >
                          {contact.person.email}
                      </Link>
                    </HStack>
                  )}
                  
                    {contact.person.phone && (
                    <HStack spacing={1}>
                      <Icon as={PhoneIcon} w={3} h={3} color={colors.text.muted} />
                      <Link 
                          href={`tel:${contact.person.phone}`} 
                        fontSize="xs" 
                        color={colors.text.secondary}
                        _hover={{ color: colors.text.link }}
                      >
                          {contact.person.phone}
                      </Link>
                    </HStack>
                  )}
                </VStack>
                
                <VStack spacing={1}>
                  <Tooltip label="Manage Roles">
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="blue"
                        onClick={() => handleManageRoles(contact.person)}
                    >
                      Manage
                    </Button>
                  </Tooltip>
                    {contact.person.email && (
                    <SmartEmailButton
                        to={contact.person.email}
                        size="xs"
                        variant="ghost"
                      isIconButton={true}
                      tooltip="Send email"
                      context={{
                        dealId,
                        dealName,
                          personId: contact.person.id,
                          personName: `${contact.person.first_name || ''} ${contact.person.last_name || ''}`.trim(),
                        organizationId: organization?.id,
                        organizationName: organization?.name,
                      }}
                      />
                  )}
                    {contact.person.phone && (
                    <Tooltip label="Call">
                      <IconButton
                        icon={<PhoneIcon />}
                        aria-label="Call"
                        size="xs"
                        variant="ghost"
                          onClick={() => window.open(`tel:${contact.person.phone}`)}
                      />
                    </Tooltip>
                  )}
                </VStack>
              </HStack>
            </Box>
            );
          })}
          
          {consolidatedContacts.length > 0 && (
            <HStack spacing={2}>
              <Button 
                size="sm" 
                colorScheme="blue"
                onClick={onAddPersonOpen}
              >
                Add Person
              </Button>
            <Button 
              as={RouterLink} 
              to={`/organizations/${organization.id}`}
              size="sm" 
              variant="outline"
              leftIcon={<ExternalLinkIcon />}
            >
              View Organization Profile
            </Button>
            </HStack>
          )}
        </VStack>
      )}
      
      {/* Role Management Modal */}
      {selectedPerson && organization && (
        <RoleManagementModal
          isOpen={isOpen}
          onClose={onClose}
          personId={selectedPerson.id}
          personName={selectedPerson.name}
          organizationId={organization.id}
          organizationName={organization.name}
          existingRoles={
            consolidatedContacts.find(contact => contact.person.id === selectedPerson.id)?.roles || []
          }
          onSuccess={handleSuccess}
        />
      )}

      {/* Add Person to Organization Modal */}
      {organization && (
        <AddPersonToOrganizationModal
          isOpen={isAddPersonOpen}
          onClose={onAddPersonClose}
          organizationId={organization.id}
          organizationName={organization.name}
          existingPeopleIds={existingPeopleIds}
          onSuccess={handleAddPersonSuccess}
        />
      )}
    </Box>
  );
}; 