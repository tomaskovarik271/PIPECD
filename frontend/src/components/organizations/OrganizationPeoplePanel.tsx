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
  Button,
  useDisclosure,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FaUser, FaPlus } from 'react-icons/fa';

// GraphQL operations
import { 
  GET_PEOPLE_BY_ORGANIZATION, 
  DELETE_PERSON_ORGANIZATION_ROLE
} from '../../lib/graphql/personOrganizationRoleOperations';
import type { PersonOrganizationRole } from '../../generated/graphql/graphql';
import AddOrganizationRoleModal from '../people/AddOrganizationRoleModal';
import AddPersonToOrganizationModal from './AddPersonToOrganizationModal';

interface OrganizationPeoplePanelProps {
  organizationId: string;
  organizationName: string;
}

interface SimplePerson {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

const OrganizationPeoplePanel: React.FC<OrganizationPeoplePanelProps> = ({
  organizationId,
  organizationName,
}) => {
  const colors = useThemeColors();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddPersonOpen, onOpen: onAddPersonOpen, onClose: onAddPersonClose } = useDisclosure();
  const [selectedPerson, setSelectedPerson] = useState<SimplePerson | null>(null);
  const [includeFormerEmployees, setIncludeFormerEmployees] = useState(false);

  // Fetch people in this organization
  const { data: peopleData, loading: peopleLoading, error: peopleError, refetch: refetchPeople } = useQuery(
    GET_PEOPLE_BY_ORGANIZATION,
    {
      variables: { organizationId, includeFormerEmployees },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Helper to get person's full name
  const getPersonName = (person: SimplePerson) => {
    return `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown Person';
  };

  const handleAddRole = (person: SimplePerson) => {
    setSelectedPerson(person);
    onOpen();
  };

  const handleSuccess = () => {
    refetchPeople();
  };

  if (peopleLoading) {
    return (
      <Center py={8}>
        <Spinner size="lg" color={colors.interactive.default} />
      </Center>
    );
  }

  if (peopleError) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Error loading people: {peopleError.message}</Text>
      </Alert>
    );
  }

  const people = peopleData?.peopleByOrganization || [];
  
  // Get existing people IDs for filtering
  const existingPeopleIds = people.map((person: SimplePerson) => person.id);

  return (
    <VStack spacing={4} align="stretch">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading size="md" color={colors.text.primary}>
          People & Roles ({people.length})
        </Heading>
        <HStack spacing={4}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="include-former" mb="0" fontSize="sm" color={colors.text.secondary}>
              Include former employees
            </FormLabel>
            <Switch
              id="include-former"
              isChecked={includeFormerEmployees}
              onChange={(e) => setIncludeFormerEmployees(e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
            onClick={onAddPersonOpen}
          >
            Add Person
          </Button>
        </HStack>
      </HStack>

      {people.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>
            No {includeFormerEmployees ? '' : 'active '}people found for {organizationName}.
          </Text>
        </Alert>
      ) : (
        <VStack spacing={3} align="stretch">
          {people.map((person: SimplePerson) => (
            <Card 
              key={person.id}
              bg={colors.bg.elevated}
              borderColor={colors.border.default}
              borderWidth="1px"
            >
              <CardBody>
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack spacing={3}>
                    <Icon as={FaUser} color={colors.text.secondary} />
                    <VStack align="start" spacing={0}>
                      <Link 
                        as={RouterLink} 
                        to={`/people/${person.id}`}
                        fontWeight="semibold"
                        color={colors.text.link}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {getPersonName(person)}
                      </Link>
                      <Text fontSize="sm" color={colors.text.secondary}>
                        {person.email}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Icon as={FaPlus} />}
                      onClick={() => handleAddRole(person)}
                    >
                      Manage Roles
                    </Button>
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Add/Edit Role Modal */}
      {selectedPerson && (
        <AddOrganizationRoleModal
          isOpen={isOpen}
          onClose={onClose}
          personId={selectedPerson.id}
          personName={getPersonName(selectedPerson)}
          existingRole={null} // For now, always add new roles from organization view
          onSuccess={handleSuccess}
        />
      )}

      {/* Add Person to Organization Modal */}
      <AddPersonToOrganizationModal
        isOpen={isAddPersonOpen}
        onClose={onAddPersonClose}
        organizationId={organizationId}
        organizationName={organizationName}
        existingPeopleIds={existingPeopleIds}
        onSuccess={handleSuccess}
      />
    </VStack>
  );
};

export default OrganizationPeoplePanel; 