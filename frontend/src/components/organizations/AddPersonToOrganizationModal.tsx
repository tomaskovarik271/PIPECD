import React, { useState, useMemo } from 'react';
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
  Input,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Avatar,
  Box,
  Badge,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useQuery } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';
import { usePeopleStore } from '../../stores/usePeopleStore';
import type { Person } from '../../generated/graphql/graphql';
import AddOrganizationRoleModal from '../people/AddOrganizationRoleModal';

interface AddPersonToOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  existingPeopleIds: string[]; // People already in the organization
  onSuccess: () => void;
}

const AddPersonToOrganizationModal: React.FC<AddPersonToOrganizationModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  existingPeopleIds,
  onSuccess,
}) => {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  // Modal state for role assignment
  const { 
    isOpen: isRoleModalOpen, 
    onOpen: onRoleModalOpen, 
    onClose: onRoleModalClose 
  } = useDisclosure();

  // Fetch all people
  const { people, peopleLoading, peopleError, fetchPeople } = usePeopleStore();

  // Load people when modal opens
  React.useEffect(() => {
    if (isOpen && people.length === 0) {
      fetchPeople();
    }
  }, [isOpen, people.length, fetchPeople]);

  // Filter people based on search term and exclude existing members
  const filteredPeople = useMemo(() => {
    if (!people) return [];

    return people
      .filter(person => !existingPeopleIds.includes(person.id))
      .filter(person => {
        if (!searchTerm.trim()) return true;
        
        const search = searchTerm.toLowerCase();
        const firstName = person.first_name?.toLowerCase() || '';
        const lastName = person.last_name?.toLowerCase() || '';
        const email = person.email?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        return (
          fullName.includes(search) ||
          firstName.includes(search) ||
          lastName.includes(search) ||
          email.includes(search)
        );
      });
  }, [people, searchTerm, existingPeopleIds]);

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
    onRoleModalOpen();
  };

  const handleRoleSuccess = () => {
    onRoleModalClose();
    onClose();
    onSuccess();
    setSelectedPerson(null);
    setSearchTerm('');
  };

  const handleModalClose = () => {
    onClose();
    setSearchTerm('');
    setSelectedPerson(null);
  };

  const getPersonName = (person: Person) => {
    return `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown Person';
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={colors.bg.surface} borderColor={colors.border.default}>
          <ModalHeader color={colors.text.primary}>
            Add Person to {organizationName}
          </ModalHeader>
          <ModalCloseButton color={colors.text.secondary} />
          
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={colors.text.secondary}>
                Select an existing person to add to this organization. You'll be able to set their role and details in the next step.
              </Text>

              {/* Search Input */}
              <HStack>
                <Icon as={SearchIcon} color={colors.text.muted} />
                <Input
                  placeholder="Search people by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={colors.bg.input}
                  borderColor={colors.border.default}
                  _hover={{ borderColor: colors.border.emphasis }}
                  _focus={{ 
                    borderColor: colors.border.focus, 
                    boxShadow: `0 0 0 1px ${colors.border.focus}` 
                  }}
                />
              </HStack>

              {/* Loading State */}
              {peopleLoading && (
                <Center py={8}>
                  <VStack spacing={3}>
                    <Spinner size="lg" color={colors.interactive.default} />
                    <Text fontSize="sm" color={colors.text.secondary}>Loading people...</Text>
                  </VStack>
                </Center>
              )}

              {/* Error State */}
              {peopleError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">Error loading people: {peopleError}</Text>
                </Alert>
              )}

              {/* People List */}
              {!peopleLoading && !peopleError && (
                <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
                  {filteredPeople.length === 0 ? (
                    <Center py={8}>
                      <VStack spacing={3}>
                        <Text fontSize="sm" color={colors.text.secondary}>
                          {searchTerm.trim() 
                            ? `No people found matching "${searchTerm}"`
                            : 'All people are already members of this organization'
                          }
                        </Text>
                        {searchTerm.trim() && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setSearchTerm('')}
                          >
                            Clear search
                          </Button>
                        )}
                      </VStack>
                    </Center>
                  ) : (
                    filteredPeople.map((person) => (
                      <Box
                        key={person.id}
                        p={3}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={colors.border.default}
                        bg={colors.bg.elevated}
                        cursor="pointer"
                        _hover={{
                          borderColor: colors.border.emphasis,
                          bg: colors.bg.elevated,
                        }}
                        onClick={() => handlePersonSelect(person)}
                      >
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={getPersonName(person)}
                            bg={colors.interactive.default}
                            color={colors.text.onAccent}
                          />
                          <VStack align="start" spacing={0} flex={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="medium" color={colors.text.primary}>
                                {getPersonName(person)}
                              </Text>
                              {person.organization && (
                                <Badge size="sm" colorScheme="blue" variant="subtle">
                                  {person.organization.name}
                                </Badge>
                              )}
                            </HStack>
                            {person.email && (
                              <Text fontSize="sm" color={colors.text.secondary}>
                                {person.email}
                              </Text>
                            )}
                          </VStack>
                          <Button size="sm" colorScheme="blue" variant="outline">
                            Add
                          </Button>
                        </HStack>
                      </Box>
                    ))
                  )}
                </VStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Role Assignment Modal */}
      {selectedPerson && (
        <AddOrganizationRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            onRoleModalClose();
            setSelectedPerson(null);
          }}
          personId={selectedPerson.id}
          personName={getPersonName(selectedPerson)}
          existingRole={null}
          onSuccess={handleRoleSuccess}
        />
      )}
    </>
  );
};

export default AddPersonToOrganizationModal; 