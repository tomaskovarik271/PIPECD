import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Tag,
  Divider,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Link as ChakraLink,
  Icon,
  Flex
} from '@chakra-ui/react';
import { usePeopleStore } from '../stores/usePeopleStore';
import {
  EmailIcon,
  PhoneIcon,
  InfoOutlineIcon, // For Notes
  TimeIcon, // For created_at/updated_at
  LinkIcon // For related items
} from '@chakra-ui/icons';
// import { Organization } from '../stores/useOrganizationsStore'; // Type can be inferred or imported if specific props needed
import { Deal } from '../stores/useDealsStore'; 
import { Activity } from '../stores/useActivitiesStore'; 
import { format, parseISO } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
// import { getLinkDisplayDetails } from '../utils/getLinkDisplayDetails'; // Removed for now

// Helper to format dates
const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'PPPppp');
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateString);
  }
};

export default function PersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  const {
    currentPerson,
    isLoadingSinglePerson: isLoading,
    errorSinglePerson: error,
    fetchPersonById,
  } = usePeopleStore();

  useEffect(() => {
    if (personId) {
      fetchPersonById(personId);
    }
  }, [personId, fetchPersonById]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 200px)">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={4}>
        <AlertIcon />
        Error fetching person details: {typeof error === 'string' ? error : JSON.stringify(error)}
      </Alert>
    );
  }

  if (!currentPerson) {
    return <Text>Person not found.</Text>;
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    notes,
    created_at,
    updated_at,
    organization,
    deals,
    activities,
    // customFieldValues, // Ensure this is not used if commented out
  } = currentPerson;

  const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'N/A';

  return (
    <Box p={5}>
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="xl">
          {fullName}
        </Heading>

        <Card>
          <CardHeader><Heading size="md">Contact Information</Heading></CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <HStack>
                <EmailIcon />
                <Text><strong>Email:</strong> {email || 'N/A'}</Text>
              </HStack>
              <HStack>
                <PhoneIcon />
                <Text><strong>Phone:</strong> {phone || 'N/A'}</Text>
              </HStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {notes && (
          <Card>
            <CardHeader><Heading size="md"><Icon as={InfoOutlineIcon} mr={2}/>Notes</Heading></CardHeader>
            <CardBody>
              <Text whiteSpace="pre-wrap">{notes}</Text>
            </CardBody>
          </Card>
        )}

        {organization && (
           <Card>
            <CardHeader><Heading size="md">Associated Organization</Heading></CardHeader>
            <CardBody>
                <ChakraLink as={RouterLink} to={`/organizations/${organization.id}`} color="blue.500">
                    <HStack><Icon as={LinkIcon} /><Text>{organization.name}</Text></HStack>
                </ChakraLink>
            </CardBody>
          </Card>
        )}

        {/* 
        Custom fields section properly commented out for JSX 
        {currentPerson.customFieldValues && currentPerson.customFieldValues.length > 0 && (
          <Card>
            <CardHeader><Heading size="md">Custom Fields</Heading></CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                {currentPerson.customFieldValues.map((cfValue: any) => ( // Added any type for cfValue temporarily
                  <HStack key={cfValue.custom_field_id}>
                    <Text fontWeight="bold">{cfValue.fieldDefinition?.name || 'Unknown Field'}:</Text>
                    <Text>Value: {JSON.stringify(cfValue.value_string || cfValue.value_number || cfValue.value_date || cfValue.value_boolean)} </Text> 
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
        */}

        {deals && deals.length > 0 && (
          <Card>
            <CardHeader><Heading size="md">Associated Deals ({deals.length})</Heading></CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                {deals.map((deal: Deal) => (
                  <ChakraLink as={RouterLink} key={deal.id} to={`/deals/${deal.id}`} color="blue.500">
                    <HStack>
                      <Icon as={LinkIcon} />
                      <Text>{deal.name || `Deal ${deal.id}`}</Text>
                      {deal.stage?.name && <Tag size="sm">{deal.stage.name}</Tag>}
                    </HStack>
                  </ChakraLink>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {activities && activities.length > 0 && (
          <Card>
            <CardHeader><Heading size="md">Related Activities ({activities.length})</Heading></CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                {activities.map((activity: Activity) => (
                  <ChakraLink as={RouterLink} key={activity.id} to={`/activities/${activity.id}`} color="blue.500">
                    <HStack>
                        <Icon as={LinkIcon} />
                        <Text>{activity.subject || `Activity ${activity.id}`}</Text>
                        <Tag size="sm" colorScheme={activity.is_done ? 'green' : 'yellow'}>
                            {activity.is_done ? 'Done' : 'Open'}
                        </Tag>
                        {activity.due_date && <Text fontSize="sm">Due: {formatDate(activity.due_date)}</Text>}
                    </HStack>
                  </ChakraLink>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
        
        <Divider my={4} />

        <Flex justifyContent="space-between" color="gray.500" fontSize="sm">
          <HStack><TimeIcon /><Text>Created: {formatDate(created_at)}</Text></HStack>
          <HStack><TimeIcon /><Text>Last Updated: {formatDate(updated_at)}</Text></HStack>
        </Flex>
      </VStack>
    </Box>
  );
} 