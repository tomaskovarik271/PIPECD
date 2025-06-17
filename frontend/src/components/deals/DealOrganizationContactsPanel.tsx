import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { EmailIcon, PhoneIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../stores/useThemeStore';
import { usePeopleStore } from '../../stores/usePeopleStore';

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
  const { people, fetchPeople, peopleLoading, peopleError } = usePeopleStore();
  const [organizationContacts, setOrganizationContacts] = useState<any[]>([]);

  useEffect(() => {
    if (organization?.id) {
      fetchPeople();
    }
  }, [organization?.id, fetchPeople]);

  useEffect(() => {
    if (people && organization?.id) {
      const contacts = people.filter(person => person.organization_id === organization.id);
      setOrganizationContacts(contacts);
      // Notify parent component of contact count
      if (onContactCountChange) {
        onContactCountChange(contacts.length);
      }
    } else {
      // No organization or people loaded yet
      setOrganizationContacts([]);
      if (onContactCountChange) {
        onContactCountChange(0);
      }
    }
  }, [people, organization?.id, onContactCountChange]);

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

  if (peopleLoading) {
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

  if (peopleError) {
    return (
      <>
        <Heading size="sm" mb={3} color={colors.text.primary}>Organization Contacts</Heading>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">Error loading contacts: {peopleError}</Text>
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
            {organizationContacts.length} contact{organizationContacts.length !== 1 ? 's' : ''}
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

      {organizationContacts.length === 0 ? (
        <Center minH="100px" flexDirection="column" bg={colors.bg.elevated} borderRadius="md" p={4}>
          <Icon as={InfoIcon} w={6} h={6} color={colors.text.muted} mb={3} />
          <Text color={colors.text.secondary} fontSize="sm" textAlign="center">
            No contacts found for {organization.name}
          </Text>
          <Button 
            as={RouterLink} 
            to="/people" 
            size="sm" 
            variant="outline" 
            mt={3}
          >
            Add Contacts
          </Button>
        </Center>
      ) : (
        <VStack spacing={3} align="stretch" bg={colors.component.kanban.card} p={4} borderRadius="lg" borderWidth="1px" borderColor={colors.component.kanban.cardBorder} boxShadow="metallic">
          {organizationContacts.map((contact) => (
            <Box 
              key={contact.id} 
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
                  name={`${contact.first_name || ''} ${contact.last_name || ''}`}
                  bg={colors.interactive.default}
                  color={colors.text.onAccent}
                />
                <VStack align="start" spacing={1} flex={1}>
                  <Link 
                    as={RouterLink} 
                    to={`/people/${contact.id}`} 
                    fontWeight="medium" 
                    color={colors.text.link} 
                    _hover={{ textDecoration: 'underline' }}
                    fontSize="sm"
                  >
                    {contact.first_name} {contact.last_name}
                  </Link>
                  
                  {contact.email && (
                    <HStack spacing={1}>
                      <Icon as={EmailIcon} w={3} h={3} color={colors.text.muted} />
                      <Link 
                        href={`mailto:${contact.email}`} 
                        fontSize="xs" 
                        color={colors.text.secondary}
                        _hover={{ color: colors.text.link }}
                      >
                        {contact.email}
                      </Link>
                    </HStack>
                  )}
                  
                  {contact.phone && (
                    <HStack spacing={1}>
                      <Icon as={PhoneIcon} w={3} h={3} color={colors.text.muted} />
                      <Link 
                        href={`tel:${contact.phone}`} 
                        fontSize="xs" 
                        color={colors.text.secondary}
                        _hover={{ color: colors.text.link }}
                      >
                        {contact.phone}
                      </Link>
                    </HStack>
                  )}
                </VStack>
                
                <VStack spacing={1}>
                  {contact.email && (
                    <Tooltip label="Send email">
                      <IconButton
                        icon={<EmailIcon />}
                        aria-label="Send email"
                        size="xs"
                        variant="ghost"
                        onClick={() => window.open(`mailto:${contact.email}`)}
                      />
                    </Tooltip>
                  )}
                  {contact.phone && (
                    <Tooltip label="Call">
                      <IconButton
                        icon={<PhoneIcon />}
                        aria-label="Call"
                        size="xs"
                        variant="ghost"
                        onClick={() => window.open(`tel:${contact.phone}`)}
                      />
                    </Tooltip>
                  )}
                </VStack>
              </HStack>
            </Box>
          ))}
          
          {organizationContacts.length > 0 && (
            <Button 
              as={RouterLink} 
              to={`/organizations/${organization.id}`}
              size="sm" 
              variant="outline"
              leftIcon={<ExternalLinkIcon />}
            >
              View Organization Profile
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );
}; 