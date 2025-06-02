import React from 'react';
import {
  Avatar,
  Box,
  Center,
  Heading,
  HStack,
  Icon,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface DealRelatedPanelProps {
  person?: Person | null;
  organization?: Organization | null;
}

export const DealRelatedPanel: React.FC<DealRelatedPanelProps> = ({
  person,
  organization,
}) => {
  const hasRelatedData = person || organization;

  return (
    <>
      <Heading size="sm" mb={4} color="white">Related People & Organizations</Heading>
      <VStack spacing={5} align="stretch">
        {person && (
          <Box p={4} bg="gray.750" borderRadius="lg" borderWidth="1px" borderColor="gray.600">
            <Heading size="xs" mb={2} color="gray.200">Primary Contact</Heading>
            <HStack spacing={3}>
              <Avatar 
                size="sm"
                name={`${person.first_name} ${person.last_name}`}
                bg="gray.500"
              />
              <VStack align="start" spacing={0}>
                <Link 
                  as={RouterLink} 
                  to={`/people/${person.id}`} 
                  fontWeight="medium" 
                  color="blue.300" 
                  _hover={{textDecoration: 'underline'}}
                >
                  {person.first_name} {person.last_name}
                </Link>
                {person.email && (
                  <Link 
                    href={`mailto:${person.email}`} 
                    fontSize="sm" 
                    color="blue.400" 
                    _hover={{textDecoration: 'underline'}}
                  >
                    {person.email}
                  </Link>
                )}
              </VStack>
            </HStack>
          </Box>
        )}
        
        {organization && (
          <Box p={4} bg="gray.750" borderRadius="lg" borderWidth="1px" borderColor="gray.600">
            <Heading size="xs" mb={2} color="gray.200">Primary Organization</Heading>
            <HStack spacing={3}>
              <VStack align="start" spacing={0}>
                <Link 
                  as={RouterLink} 
                  to={`/organizations/${organization.id}`} 
                  fontWeight="medium" 
                  color="blue.300" 
                  _hover={{textDecoration: 'underline'}}
                >
                  {organization.name}
                </Link>
              </VStack>
            </HStack>
          </Box>
        )}
        
        {!hasRelatedData && (
          <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
            <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
            <Text color="gray.400" fontSize="sm">No primary contact or organization linked.</Text>
          </Center>
        )}
      </VStack>
    </>
  );
}; 