import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
  Button,
  useToast,
  Grid,
  GridItem,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { usePeopleStore, Person } from '../stores/usePeopleStore';
import { useAppStore } from '../stores/useAppStore';
import {
  EmailIcon,
  PhoneIcon,
  InfoOutlineIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import { format, parseISO } from 'date-fns';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { StickerBoard } from '../components/common/StickerBoard';

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

const PersonDetailPage = () => {
  const { personId } = useParams<{ personId: string }>();
  const toast = useToast();
  
  // Inline editing states
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [newLastName, setNewLastName] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  // Theme colors
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const fetchPersonById = usePeopleStore((state) => state.fetchPersonById);
  const updatePerson = usePeopleStore((state) => state.updatePerson);
  const currentPerson = usePeopleStore((state) => state.currentPerson);
  const isLoadingPerson = usePeopleStore((state) => state.isLoadingSinglePerson);
  const personError = usePeopleStore((state) => state.errorSinglePerson);
  
  // Get user permissions for edit checks
  const userPermissions = useAppStore((state) => state.userPermissions);
  
  // Check if user can edit persons
  const canEditPerson = userPermissions?.includes('person:update_any');

  useEffect(() => {
    if (personId && fetchPersonById) {
      fetchPersonById(personId);
    }
  }, [personId, fetchPersonById]);

  // Update handlers for inline editing
  const handleFirstNameUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { first_name: newFirstName });
      toast({ title: 'First Name Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingFirstName(false);
      fetchPersonById(personId); // Refresh data
    } catch (e) {
      console.error('Error updating first name:', e);
      toast({ title: 'Update Failed', description: 'Could not update first name', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleLastNameUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { last_name: newLastName });
      toast({ title: 'Last Name Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingLastName(false);
      fetchPersonById(personId); // Refresh data
    } catch (e) {
      console.error('Error updating last name:', e);
      toast({ title: 'Update Failed', description: 'Could not update last name', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEmailUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { email: newEmail });
      toast({ title: 'Email Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingEmail(false);
      fetchPersonById(personId); // Refresh data
    } catch (e) {
      console.error('Error updating email:', e);
      toast({ title: 'Update Failed', description: 'Could not update email', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handlePhoneUpdate = async () => {
    if (!currentPerson || !personId) return;
    try {
      await updatePerson(personId, { phone: newPhone });
      toast({ title: 'Phone Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingPhone(false);
      fetchPersonById(personId); // Refresh data
    } catch (e) {
      console.error('Error updating phone:', e);
      toast({ title: 'Update Failed', description: 'Could not update phone', status: 'error', duration: 3000, isClosable: true });
    }
  };

  return (
    <Box 
      h="calc(100vh - 40px)" 
      maxH="calc(100vh - 40px)"
      m={0} 
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4} 
      bg={colors.bg.app}
    >
      <Box 
        bg={colors.bg.surface}
        maxW="90vw" 
        w="full" 
        h="full"  
        maxH="calc(100% - 0px)" 
        borderRadius="xl" 
        borderWidth="1px"
        borderColor={colors.border.default}
        overflowY="auto"
        p={{base: 4, md: 8}}
        sx={{
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { background: colors.border.subtle, borderRadius: '8px' },
            '&::-webkit-scrollbar-track': { background: colors.bg.input },
        }}
      >
        {isLoadingPerson && (
          <Center h="full">
            <Spinner 
              size="xl" 
              color={colors.interactive.default}
            />
          </Center>
        )}
        
        {personError && (
          <Alert 
            status="error" 
            variant="subtle" 
            borderRadius="lg" 
            bg={colors.status.error}
            color={colors.text.onAccent}
            mt={4}
          >
            <AlertIcon color={colors.text.onAccent} />
            <AlertTitle>Error Loading Person!</AlertTitle>
            <AlertDescription>
              {typeof personError === 'string' ? personError : JSON.stringify(personError)}
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoadingPerson && !personError && currentPerson && (
          <VStack spacing={6} align="stretch">
            {/* Header: Breadcrumbs, Title */}
            <Box 
              pb={4} 
              borderBottomWidth="1px" 
              borderColor={colors.border.default}
              mb={2}
            >
              <Breadcrumb 
                spacing="8px" 
                separator={<Text color={colors.text.muted}>/</Text>}
                color={colors.text.muted}
                fontSize="sm"
              >
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    as={RouterLink} 
                    to="/people" 
                    color={colors.text.link}
                    _hover={{textDecoration: 'underline'}}
                  >
                    People
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink 
                    href="#" 
                    color={colors.text.secondary}
                    _hover={{textDecoration: 'none', cursor: 'default'}}
                  >
                    {currentPerson.first_name} {currentPerson.last_name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading 
                size="xl" 
                color={colors.text.primary}
                mt={2}
              >
                {currentPerson.first_name} {currentPerson.last_name}
              </Heading>
            </Box>

            {/* Tabs Content */}
            <Box 
              bg={colors.bg.elevated}
              borderRadius="xl" 
              borderWidth="1px" 
              borderColor={colors.border.default}
              minH="400px"
            >
              <Tabs variant="line" colorScheme="blue" size="md">
                <TabList 
                  px={6} 
                  borderBottomColor={colors.border.default}
                  bg={colors.bg.elevated}
                >
                  <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                    Contact Information
                  </Tab>
                  <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                    <HStack spacing={2}>
                      <Text>Notes</Text>
                      <Badge colorScheme="yellow" variant="solid" borderRadius="full" fontSize="xs">
                        0
                      </Badge>
                    </HStack>
                  </Tab>
                </TabList>
                
                <TabPanels>
                  {/* Contact Information Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading 
                        size="md" 
                        color={colors.text.primary}
                      >
                        Contact Information
                      </Heading>
                      <VStack spacing={4} align="stretch">
                        {/* First Name Field */}
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontSize="sm" color={colors.text.muted}>First Name</Text>
                          {!isEditingFirstName ? (
                            <HStack spacing={2}>
                              <Text 
                                fontSize="md" 
                                fontWeight="medium" 
                                color={colors.text.secondary}
                              >
                                {currentPerson.first_name || '-'}
                              </Text>
                              <IconButton 
                                icon={<EditIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Edit First Name" 
                                onClick={() => {
                                  setIsEditingFirstName(true);
                                  setNewFirstName(currentPerson.first_name || '');
                                }}
                                color={colors.text.muted}
                                _hover={{color: colors.text.link}}
                                isDisabled={!canEditPerson}
                              />
                            </HStack>
                          ) : (
                            <HStack spacing={2} flex={1} justifyContent="flex-end">
                              <Input 
                                value={newFirstName} 
                                onChange={(e) => setNewFirstName(e.target.value)} 
                                placeholder="Enter first name" 
                                size="sm" 
                                w="160px"
                                bg={colors.bg.input}
                                borderColor={colors.border.default}
                                _hover={{borderColor: colors.border.emphasis}}
                                _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                              />
                              <IconButton 
                                icon={<CheckIcon />} 
                                size="xs" 
                                colorScheme="green" 
                                aria-label="Save First Name" 
                                onClick={handleFirstNameUpdate}
                              />
                              <IconButton 
                                icon={<SmallCloseIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Cancel Edit" 
                                onClick={() => setIsEditingFirstName(false)}
                                color={colors.text.muted}
                              />
                            </HStack>
                          )}
                        </HStack>

                        {/* Last Name Field */}
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontSize="sm" color={colors.text.muted}>Last Name</Text>
                          {!isEditingLastName ? (
                            <HStack spacing={2}>
                              <Text 
                                fontSize="md" 
                                fontWeight="medium" 
                                color={colors.text.secondary}
                              >
                                {currentPerson.last_name || '-'}
                              </Text>
                              <IconButton 
                                icon={<EditIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Edit Last Name" 
                                onClick={() => {
                                  setIsEditingLastName(true);
                                  setNewLastName(currentPerson.last_name || '');
                                }}
                                color={colors.text.muted}
                                _hover={{color: colors.text.link}}
                                isDisabled={!canEditPerson}
                              />
                            </HStack>
                          ) : (
                            <HStack spacing={2} flex={1} justifyContent="flex-end">
                              <Input 
                                value={newLastName} 
                                onChange={(e) => setNewLastName(e.target.value)} 
                                placeholder="Enter last name" 
                                size="sm" 
                                w="160px"
                                bg={colors.bg.input}
                                borderColor={colors.border.default}
                                _hover={{borderColor: colors.border.emphasis}}
                                _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                              />
                              <IconButton 
                                icon={<CheckIcon />} 
                                size="xs" 
                                colorScheme="green" 
                                aria-label="Save Last Name" 
                                onClick={handleLastNameUpdate}
                              />
                              <IconButton 
                                icon={<SmallCloseIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Cancel Edit" 
                                onClick={() => setIsEditingLastName(false)}
                                color={colors.text.muted}
                              />
                            </HStack>
                          )}
                        </HStack>

                        {/* Email Field */}
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack spacing={2}>
                            <EmailIcon color={colors.text.muted} />
                            <Text fontSize="sm" color={colors.text.muted}>Email</Text>
                          </HStack>
                          {!isEditingEmail ? (
                            <HStack spacing={2}>
                              <Text 
                                fontSize="md" 
                                fontWeight="medium" 
                                color={colors.text.secondary}
                              >
                                {currentPerson.email || '-'}
                              </Text>
                              <IconButton 
                                icon={<EditIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Edit Email" 
                                onClick={() => {
                                  setIsEditingEmail(true);
                                  setNewEmail(currentPerson.email || '');
                                }}
                                color={colors.text.muted}
                                _hover={{color: colors.text.link}}
                                isDisabled={!canEditPerson}
                              />
                            </HStack>
                          ) : (
                            <HStack spacing={2} flex={1} justifyContent="flex-end">
                              <Input 
                                value={newEmail} 
                                onChange={(e) => setNewEmail(e.target.value)} 
                                placeholder="Enter email" 
                                size="sm" 
                                w="200px"
                                bg={colors.bg.input}
                                borderColor={colors.border.default}
                                _hover={{borderColor: colors.border.emphasis}}
                                _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                              />
                              <IconButton 
                                icon={<CheckIcon />} 
                                size="xs" 
                                colorScheme="green" 
                                aria-label="Save Email" 
                                onClick={handleEmailUpdate}
                              />
                              <IconButton 
                                icon={<SmallCloseIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Cancel Edit" 
                                onClick={() => setIsEditingEmail(false)}
                                color={colors.text.muted}
                              />
                            </HStack>
                          )}
                        </HStack>

                        {/* Phone Field */}
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack spacing={2}>
                            <PhoneIcon color={colors.text.muted} />
                            <Text fontSize="sm" color={colors.text.muted}>Phone</Text>
                          </HStack>
                          {!isEditingPhone ? (
                            <HStack spacing={2}>
                              <Text 
                                fontSize="md" 
                                fontWeight="medium" 
                                color={colors.text.secondary}
                              >
                                {currentPerson.phone || '-'}
                              </Text>
                              <IconButton 
                                icon={<EditIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Edit Phone" 
                                onClick={() => {
                                  setIsEditingPhone(true);
                                  setNewPhone(currentPerson.phone || '');
                                }}
                                color={colors.text.muted}
                                _hover={{color: colors.text.link}}
                                isDisabled={!canEditPerson}
                              />
                            </HStack>
                          ) : (
                            <HStack spacing={2} flex={1} justifyContent="flex-end">
                              <Input 
                                value={newPhone} 
                                onChange={(e) => setNewPhone(e.target.value)} 
                                placeholder="Enter phone" 
                                size="sm" 
                                w="160px"
                                bg={colors.bg.input}
                                borderColor={colors.border.default}
                                _hover={{borderColor: colors.border.emphasis}}
                                _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                              />
                              <IconButton 
                                icon={<CheckIcon />} 
                                size="xs" 
                                colorScheme="green" 
                                aria-label="Save Phone" 
                                onClick={handlePhoneUpdate}
                              />
                              <IconButton 
                                icon={<SmallCloseIcon />} 
                                size="xs" 
                                variant="ghost" 
                                aria-label="Cancel Edit" 
                                onClick={() => setIsEditingPhone(false)}
                                color={colors.text.muted}
                              />
                            </HStack>
                          )}
                        </HStack>

                        {/* Notes Field */}
                        <HStack justifyContent="space-between" alignItems="flex-start">
                          <HStack spacing={2}>
                            <InfoOutlineIcon color={colors.text.muted} />
                            <Text fontSize="sm" color={colors.text.muted}>Notes</Text>
                          </HStack>
                          <Text 
                            fontSize="md" 
                            fontWeight="medium" 
                            color={colors.text.secondary}
                            textAlign="right"
                            maxW="300px"
                            wordBreak="break-word"
                          >
                            {currentPerson.notes || '-'}
                          </Text>
                        </HStack>

                        {/* Timestamps */}
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack spacing={2}>
                            <TimeIcon color={colors.text.muted} />
                            <Text fontSize="sm" color={colors.text.muted}>Created</Text>
                          </HStack>
                          <Text 
                            fontSize="sm" 
                            color={colors.text.secondary}
                          >
                            {formatDate(currentPerson.created_at)}
                          </Text>
                        </HStack>

                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack spacing={2}>
                            <TimeIcon color={colors.text.muted} />
                            <Text fontSize="sm" color={colors.text.muted}>Updated</Text>
                          </HStack>
                          <Text 
                            fontSize="sm" 
                            color={colors.text.secondary}
                          >
                            {formatDate(currentPerson.updated_at)}
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </TabPanel>

                  {/* Notes/Stickers Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={4} align="stretch">
                      <Heading 
                        size="md" 
                        color={colors.text.primary}
                      >
                        Notes & Stickers
                      </Heading>
                      <Box>
                        <StickerBoard 
                          entityType="PERSON" 
                          entityId={currentPerson.id} 
                        />
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default PersonDetailPage; 