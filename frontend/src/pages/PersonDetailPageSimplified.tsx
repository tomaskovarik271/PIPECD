import React, { useEffect, useMemo } from 'react';
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon, WarningIcon, InfoOutlineIcon, TimeIcon } from '@chakra-ui/icons';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useAppStore } from '../stores/useAppStore';
import { format, parseISO } from 'date-fns';
import { useThemeColors, useThemeStyles } from '../hooks/useThemeColors';
import { useThemeStore } from '../stores/useThemeStore';
import { StickerBoard } from '../components/common/StickerBoard';
import InlineContactEditor from '../components/contacts/InlineContactEditor';

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

const PersonDetailPageSimplified = () => {
  const { personId } = useParams<{ personId: string }>();
  
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
        <VStack justify="center" align="center" minH="300px" w="100%">
          <Spinner 
            size="xl" 
            color={colors.interactive.default}
          />
          <Text color={colors.text.secondary} mt={4}>Loading contact...</Text>
        </VStack>
      </Box>
    );
  }

  // Error state
  if (personError) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        p={4}
      >
        <VStack spacing={4} align="center" justify="center" minH="300px">
          <Alert 
            status="error" 
            variant="subtle"
            bg={colors.status.error}
            color={colors.text.onAccent}
            maxW="600px"
          >
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <AlertTitle>Failed to Load Contact</AlertTitle>
              <AlertDescription>{personError}</AlertDescription>
            </VStack>
          </Alert>
          <Text color={colors.text.secondary}>Please try refreshing the page or go back to the people list.</Text>
        </VStack>
      </Box>
    );
  }

  // Not found state
  if (!currentPerson) {
    return (
      <Box 
        bg={colors.bg.app}
        minH="100vh" 
        p={4}
      >
        <VStack spacing={4} align="center" justify="center" minH="300px">
          <Alert 
            status="warning" 
            variant="subtle"
            bg={colors.status.warning}
            color={colors.text.onAccent}
            maxW="600px"
          >
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <AlertTitle>Contact Not Found</AlertTitle>
              <AlertDescription>
                The contact you're looking for doesn't exist or you don't have permission to view it.
              </AlertDescription>
            </VStack>
          </Alert>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      bg={colors.bg.app}
      minH="100vh" 
      overflow="hidden"
    >
      <Box 
        h="100vh" 
        display="flex" 
        flexDirection="column"
        overflow="hidden"
      >
        {/* Header with Breadcrumbs */}
        <Box 
          bg={colors.bg.surface} 
          borderBottom="1px solid" 
          borderBottomColor={colors.border.default}
          px={{base: 4, md: 6}} 
          py={4}
          flexShrink={0}
        >
          <VStack spacing={3} align="start">
            <Breadcrumb color={colors.text.secondary} fontSize="sm">
              <BreadcrumbItem>
                <BreadcrumbLink as={RouterLink} to="/people" color={colors.text.link}>
                  <HStack spacing={2}>
                    <ArrowBackIcon />
                    <Text>People</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <Text color={colors.text.primary}>
                  {`${currentPerson.first_name || ''} ${currentPerson.last_name || ''}`.trim() || 'Unnamed Contact'}
                </Text>
              </BreadcrumbItem>
            </Breadcrumb>
            
            <Heading 
              size="xl" 
              color={colors.text.primary}
            >
              {`${currentPerson.first_name || ''} ${currentPerson.last_name || ''}`.trim() || 'Unnamed Contact'}
            </Heading>
            
            {currentPerson.email && (
              <Text color={colors.text.secondary} fontSize="lg">
                {currentPerson.email}
              </Text>
            )}
          </VStack>
        </Box>

        {/* Main Content */}
        <SimpleGrid 
          columns={{base: 1, lg: 12}} 
          spacing={0} 
          flex="1" 
          minH="0"
          overflow="hidden"
        >
          {/* Left Content Area */}
          <Box 
            gridColumn={{base: "1", lg: "1 / 9"}}
            h="full" 
            overflow="hidden"
            bg={colors.bg.surface}
            borderRightWidth={{base: 0, lg: "1px"}} 
            borderBottomWidth={{base: "1px", lg: 0}}
            borderColor={colors.border.default}
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '2px',
              height: '100%',
              background: currentThemeName === 'industrialMetal' 
                ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.8) 50%, rgba(255, 170, 0, 0.6) 100%)'
                : 'none',
              pointerEvents: 'none',
            }}
          >
            <Box h="full" overflow="hidden">
              <Tabs variant="line" colorScheme="blue" size="md" h="full" display="flex" flexDirection="column">
                <TabList 
                  borderBottomColor={colors.border.default} 
                  flexShrink={0} 
                  bg={colors.bg.surface} 
                  borderTopRadius="xl"
                  px={4}
                >
                  <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                    Overview
                  </Tab>
                  <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                    Activities
                  </Tab>
                  <Tab _selected={{ color: colors.text.link, borderColor: colors.text.link }} color={colors.text.secondary} fontWeight="medium">
                    Notes
                  </Tab>
                </TabList>
                
                <TabPanels flex="1" minH="0" overflow="hidden">
                  {/* Overview Tab - Simplified Contact Management */}
                  <TabPanel h="full" p={0} overflow="hidden">
                    <Box h="full" overflowY="auto" p={{base: 4, md: 6}} sx={{
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '6px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                    }}>
                      <InlineContactEditor 
                        person={currentPerson}
                        onUpdate={() => fetchPersonById(personId!)}
                        canEdit={canEditPerson}
                      />
                    </Box>
                  </TabPanel>

                  {/* Activities Tab - Calendar Integration */}
                  <TabPanel h="full" p={0} overflow="hidden">
                    <Box h="full" overflowY="auto" p={{base: 4, md: 6}} sx={{
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '6px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                    }}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="lg" color={colors.text.primary}>
                          Activities
                        </Heading>
                        <Text color={colors.text.secondary}>
                          Calendar activities and meetings related to this contact will appear here.
                        </Text>
                        {/* TODO: Add calendar integration component */}
                        <Box 
                          p={8} 
                          bg={colors.bg.elevated} 
                          borderRadius="lg" 
                          border="1px solid" 
                          borderColor={colors.border.default}
                          textAlign="center"
                        >
                          <Text color={colors.text.secondary} fontStyle="italic">
                            Calendar integration coming soon...
                          </Text>
                        </Box>
                      </VStack>
                    </Box>
                  </TabPanel>

                  {/* Notes Tab - Simplified Notes */}
                  <TabPanel h="full" p={0} overflow="hidden">
                    <Box h="full" overflowY="auto" p={{base: 4, md: 6}} sx={{
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-thumb': { background: colors.component.table.border, borderRadius: '6px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                    }}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="lg" color={colors.text.primary}>
                          Notes
                        </Heading>
                        <StickerBoard 
                          entityType="PERSON" 
                          entityId={currentPerson.id} 
                        />
                      </VStack>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Box>

          {/* Right Sidebar - Key Information Summary */}
          <Box 
            gridColumn={{base: "1", lg: "9 / 13"}}
            bg={colors.component.kanban.column}
            p={{base: 4, md: 6}} 
            borderLeftWidth={{base: 0, lg: "1px"}} 
            borderTopWidth={{base: "1px", lg: 0}}
            borderColor={colors.component.kanban.cardBorder}
            overflowY="auto"
            h="full"
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
              {/* Contact Summary */}
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
                <Heading size="sm" mb={4} color={colors.text.primary}>Contact Summary</Heading>
                <VStack spacing={3} align="stretch">
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color={colors.text.secondary}>Email</Text>
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                      {currentPerson.email || '-'}
                    </Text>
                  </HStack>
                  
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color={colors.text.secondary}>Phone</Text>
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                      {currentPerson.phone || '-'}
                    </Text>
                  </HStack>
                  
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color={colors.text.secondary}>Company</Text>
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                      {currentPerson.organization?.name || '-'}
                    </Text>
                  </HStack>
                  
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color={colors.text.secondary}>Job Title</Text>
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.primary}>
                      {(currentPerson as any).job_title || '-'}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Activity Timestamps */}
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
                <VStack spacing={3} align="stretch">
                  <HStack justifyContent="space-between">
                    <HStack spacing={2}>
                      <InfoOutlineIcon color={colors.text.muted} />
                      <Text fontSize="sm" color={colors.text.muted}>Created</Text>
                    </HStack>
                    <Text fontSize="sm" color={colors.text.secondary}>
                      {formatDate(currentPerson.created_at)}
                    </Text>
                  </HStack>

                  <HStack justifyContent="space-between">
                    <HStack spacing={2}>
                      <TimeIcon color={colors.text.muted} />
                      <Text fontSize="sm" color={colors.text.muted}>Updated</Text>
                    </HStack>
                    <Text fontSize="sm" color={colors.text.secondary}>
                      {formatDate(currentPerson.updated_at)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default PersonDetailPageSimplified;