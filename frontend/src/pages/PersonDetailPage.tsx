import React, { useEffect, useState, useMemo } from 'react';
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
  Flex,
  Icon,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, SmallCloseIcon, WarningIcon } from '@chakra-ui/icons';
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
import { useThemeStore } from '../stores/useThemeStore';
import { StickerBoard } from '../components/common/StickerBoard';
import PersonOrganizationRoles from '../components/people/PersonOrganizationRoles';
import { GET_PERSON_ORGANIZATION_ROLES } from '../lib/graphql/personOrganizationRoleOperations';

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

  // Theme colors and styling
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  
  // Helper function for theme-specific accent colors
  const getAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.6)'; // Hazard yellow for industrial only
      default:
        return 'transparent'; // No accent for modern themes
    }
  };

  const fetchPersonById = usePeopleStore((state) => state.fetchPersonById);
  const updatePerson = usePeopleStore((state) => state.updatePerson);
  const currentPerson = usePeopleStore((state) => state.currentPerson);
  const isLoadingPerson = usePeopleStore((state) => state.isLoadingSinglePerson);
  const personError = usePeopleStore((state) => state.errorSinglePerson);
  
  // Get user permissions for edit checks
  const userPermissions = useAppStore((state) => state.userPermissions);
  
  // Check if user can edit persons - using memoization for performance
  const canEditPerson = useMemo(() => {
    if (!userPermissions) return false;
    return userPermissions.includes('person:update_any');
  }, [userPermissions]);

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

  // Loading state
  if (isLoadingPerson) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        h="100vh" 
        overflow="hidden" 
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4} 
      >
        <Center h="full">
          <Spinner size="xl" color={colors.interactive.default} />
        </Center>
      </Box>
    );
  }

  // Error state
  if (personError) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        h="100vh" 
        overflow="hidden" 
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4} 
      >
        <Center h="100vh" flexDirection="column" bg={colors.bg.elevated} borderRadius="xl" p={6}>
          <Icon as={WarningIcon} w={8} h={8} color={colors.text.warning} mb={4} />
          <Text color={colors.text.secondary} fontSize="lg">Error loading person.</Text>
          <Text color={colors.text.muted} fontSize="sm" mb={4}>
            {typeof personError === 'string' ? personError : JSON.stringify(personError)}
          </Text>
          <Button as={RouterLink} to="/people" mt={6} {...styles.button.primary}>Back to People</Button>
        </Center>
      </Box>
    );
  }

  // Person not found
  if (!currentPerson) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        h="100vh" 
        overflow="hidden" 
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4} 
      >
        <Center h="100vh" flexDirection="column" bg={colors.bg.elevated} borderRadius="xl" p={6}>
          <Icon as={WarningIcon} w={8} h={8} color={colors.text.warning} mb={4} />
          <Text color={colors.text.secondary} fontSize="lg">Person not found.</Text>
          <Button as={RouterLink} to="/people" mt={6} {...styles.button.primary}>Back to People</Button>
        </Center>
      </Box>
    );
  }

  return (
    <Box 
      bg={colors.bg.app}
      minH="100vh" 
      h="100vh" 
      overflow="hidden" 
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4} 
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
        overflow="hidden" 
      >
        <Flex h="full" direction={{base: "column", lg: "row"}} w="100%" maxW="100%">
          {/* Main Content (Left Column) */}
          <Box 
            flex="1"
            minW="0"
            w={{base: "100%", lg: "calc(100vw - 450px - 20rem)"}}
            maxW={{base: "100%", lg: "calc(100vw - 450px - 20rem)"}}
            p={{base: 4, md: 8}} 
        overflowY="auto"
            overflowX="hidden"
        sx={{
            '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '8px' },
              '&::-webkit-scrollbar-track': { background: colors.bg.elevated },
            }}
          >
            <VStack spacing={6} align="stretch" maxW="100%" w="100%">
              {/* Header Section */}
              <Box>
              <Breadcrumb 
                spacing="8px" 
                separator={<Text color={colors.text.muted}>/</Text>}
                color={colors.text.muted}
                fontSize="sm"
                  mb={4}
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
              >
                {currentPerson.first_name} {currentPerson.last_name}
              </Heading>
            </Box>

              {/* Tabs Section */}
            <Box 
                bg={colors.component.kanban.column} 
              borderRadius="xl" 
                border="1px solid" 
                borderColor={colors.component.kanban.cardBorder} 
              minH="400px"
                w="100%" 
                maxW="100%"
                boxShadow="steelPlate"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${getAccentColor()} 50%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
            >
                <Tabs variant="line" colorScheme="blue" size="md" isFitted>
                  <TabList borderBottomColor={colors.border.default}>
                  <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                    Contact Information
                  </Tab>
                  <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                    <HStack spacing={2}>
                      <Text>Organizations</Text>
                      <Badge colorScheme="blue" variant="solid" borderRadius="full" fontSize="xs">
                        {currentPerson.organizationRoles?.length || (currentPerson.organization ? 1 : 0)}
                      </Badge>
                    </HStack>
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
                
                  <TabPanels p={{base: 3, md: 4}} minH="350px" w="100%" maxW="100%">
                  {/* Contact Information Tab */}
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
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
                          </VStack>
                        </VStack>
                      </Box>
                    </TabPanel>

                    {/* Organizations Tab */}
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
                        <PersonOrganizationRoles 
                          organizationRoles={currentPerson.organizationRoles || []}
                          primaryOrganization={currentPerson.primaryOrganization}
                          legacyOrganization={currentPerson.organization}
                          personId={currentPerson.id}
                          personName={`${currentPerson.first_name || ''} ${currentPerson.last_name || ''}`.trim()}
                          onRefresh={() => fetchPersonById(personId!)}
                        />
                      </Box>
                    </TabPanel>

                    {/* Notes/Stickers Tab */}
                    <TabPanel w="100%" maxW="100%" overflowX="auto" overflowY="visible">
                      <Box w="100%" maxW="100%">
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
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </Box>

          {/* Right Sidebar - Key Information */}
          <Box 
            bg={colors.component.kanban.column}
            p={{base: 4, md: 6}} 
            borderLeftWidth={{base: 0, lg: "1px"}} 
            borderTopWidth={{base: "1px", lg: 0}}
            borderColor={colors.component.kanban.cardBorder}
            overflowY="auto"
            w="450px"
            minW="450px"
            maxW="450px"
            flexShrink={0}
            boxShadow="steelPlate"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '2px',
              height: '100%',
              background: currentThemeName === 'industrialMetal' 
                ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.8) 50%, rgba(255, 170, 0, 0.6) 100%)'
                : 'none',
              pointerEvents: 'none',
            }}
            sx={{
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '8px' },
              '&::-webkit-scrollbar-track': { background: colors.bg.elevated },
            }}
          >
            <VStack spacing={6} align="stretch">
              {/* Key Information Section */}
              <Box 
                p={5} 
                bg={colors.component.kanban.card} 
                borderRadius="lg" 
                border="1px solid" 
                borderColor={colors.component.kanban.cardBorder}
                boxShadow="metallic"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${getAccentColor()} 50%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              >
                <Heading size="sm" mb={4} color={colors.text.primary}>Personal Information</Heading>
                <VStack spacing={4} align="stretch">
                  {/* Full Name */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Full Name</Text>
                    <Text fontSize="md" fontWeight="semibold" color={colors.text.primary}>
                      {`${currentPerson.first_name || ''} ${currentPerson.last_name || ''}`.trim() || '-'}
                    </Text>
                          </HStack>

                  {/* Email */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Email</Text>
                    <Text fontSize="md" fontWeight="medium" color={colors.text.primary}>
                      {currentPerson.email || '-'}
                    </Text>
                  </HStack>

                  {/* Phone */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Phone</Text>
                    <Text fontSize="md" fontWeight="medium" color={colors.text.primary}>
                      {currentPerson.phone || '-'}
                          </Text>
                        </HStack>

                  {/* Organization Count */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm" color={colors.text.secondary}>Organizations</Text>
                    <Badge colorScheme="blue" variant="solid" borderRadius="full">
                      {currentPerson.organizationRoles?.length || (currentPerson.organization ? 1 : 0)}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              {/* Timestamps Section */}
              <Box 
                p={5} 
                bg={colors.component.kanban.card} 
                borderRadius="lg" 
                border="1px solid" 
                borderColor={colors.component.kanban.cardBorder}
                boxShadow="metallic"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${getAccentColor()} 50%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              >
                <Heading size="sm" mb={4} color={colors.text.primary}>Activity</Heading>
                <VStack spacing={4} align="stretch">
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack spacing={2}>
                      <InfoOutlineIcon color={colors.text.muted} />
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
                      </Box>
                    </VStack>
            </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default PersonDetailPage; 