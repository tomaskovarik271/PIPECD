import React, { useState } from 'react';
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
import AddOrganizationRoleModal from '../people/AddOrganizationRoleModal';
import AddPersonToOrganizationModal from '../organizations/AddPersonToOrganizationModal';

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
}

export const DealOrganizationContactsPanel: React.FC<DealOrganizationContactsPanelProps> = ({
  organization,
  onContactCountChange,
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
  
  // Extract all organization roles for the current organization from all people
  const organizationRoles: ContactRole[] = people.flatMap((person: Person) => 
    person.organizationRoles
      ?.filter((role: PersonOrganizationRole) => role.organization_id === organization?.id)
      ?.map((role: PersonOrganizationRole): ContactRole => ({
        ...role,
        person: {
          id: person.id,
          first_name: person.first_name,
          last_name: person.last_name,
          email: person.email,
          phone: person.phone,
        }
      })) || []
  );

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
      onContactCountChange(organizationRoles.length);
    }
  }, [organizationRoles.length, onContactCountChange]);

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
            {organizationRoles.length} contact{organizationRoles.length !== 1 ? 's' : ''}
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

      {organizationRoles.length > 0 && (
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

      {organizationRoles.length === 0 ? (
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
          {organizationRoles.map((role: ContactRole) => (
            <Box 
              key={role.id} 
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
                  name={`${role.person.first_name || ''} ${role.person.last_name || ''}`}
                  bg={colors.interactive.default}
                  color={colors.text.onAccent}
                />
                <VStack align="start" spacing={1} flex={1}>
                  <HStack spacing={2} align="center">
                    <Link 
                      as={RouterLink} 
                      to={`/people/${role.person.id}`} 
                      fontWeight="medium" 
                      color={colors.text.link} 
                      _hover={{ textDecoration: 'underline' }}
                      fontSize="sm"
                    >
                      {role.person.first_name} {role.person.last_name}
                    </Link>
                    {role.is_primary && (
                      <Badge size="sm" colorScheme="blue" variant="subtle">
                        PRIMARY
                      </Badge>
                    )}
                    {role.status === 'former' && (
                      <Badge size="sm" colorScheme="gray" variant="subtle">
                        FORMER
                      </Badge>
                    )}
                  </HStack>
                  
                  <Text fontSize="xs" color={colors.text.secondary} fontWeight="medium">
                    {role.role_title}
                    {role.department && ` • ${role.department}`}
                  </Text>
                  
                  {role.person.email && (
                    <HStack spacing={1}>
                      <Icon as={EmailIcon} w={3} h={3} color={colors.text.muted} />
                      <Link 
                        href={`mailto:${role.person.email}`} 
                        fontSize="xs" 
                        color={colors.text.secondary}
                        _hover={{ color: colors.text.link }}
                      >
                        {role.person.email}
                      </Link>
                    </HStack>
                  )}
                  
                  {role.person.phone && (
                    <HStack spacing={1}>
                      <Icon as={PhoneIcon} w={3} h={3} color={colors.text.muted} />
                      <Link 
                        href={`tel:${role.person.phone}`} 
                        fontSize="xs" 
                        color={colors.text.secondary}
                        _hover={{ color: colors.text.link }}
                      >
                        {role.person.phone}
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
                      onClick={() => handleManageRoles(role.person)}
                    >
                      Manage
                    </Button>
                  </Tooltip>
                  {role.person.email && (
                    <Tooltip label="Send email">
                      <IconButton
                        icon={<EmailIcon />}
                        aria-label="Send email"
                        size="xs"
                        variant="ghost"
                        onClick={() => window.open(`mailto:${role.person.email}`)}
                      />
                    </Tooltip>
                  )}
                  {role.person.phone && (
                    <Tooltip label="Call">
                      <IconButton
                        icon={<PhoneIcon />}
                        aria-label="Call"
                        size="xs"
                        variant="ghost"
                        onClick={() => window.open(`tel:${role.person.phone}`)}
                      />
                    </Tooltip>
                  )}
                </VStack>
              </HStack>
            </Box>
          ))}
          
          {organizationRoles.length > 0 && (
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
      {selectedPerson && (
        <AddOrganizationRoleModal
          isOpen={isOpen}
          onClose={onClose}
          personId={selectedPerson.id}
          personName={selectedPerson.name}
          existingRole={null} // For now, always add new roles from deal view
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