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
  Tag,
  Flex,
  useToast,
  useColorModeValue,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Grid,
  GridItem,
  Input,
  IconButton,
  Select,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';

import { useActivitiesStore } from '../stores/useActivitiesStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAppStore } from '../stores/useAppStore';

const ActivityDetailPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const { 
    currentActivity, 
    currentActivityLoading,
    currentActivityError,
    fetchActivityById,
    updateActivity,
  } = useActivitiesStore(); 

  const toast = useToast();
  const colors = useThemeColors();
  
  // Get user permissions for edit checks
  const userPermissions = useAppStore((state) => state.userPermissions);
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;
  
  // Check if user can edit activities (update_any OR update_own for activities they own)
  const canEditActivity = currentActivity && (
    userPermissions?.includes('activity:update_any') || 
    (userPermissions?.includes('activity:update_own') && 
     (currentActivity.user_id === currentUserId || currentActivity.assigned_to_user_id === currentUserId))
  );
  
  // Inline editing states
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [isEditingType, setIsEditingType] = useState(false);
  const [newType, setNewType] = useState('');
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(false);
  
  useEffect(() => {
    if (activityId) {
      fetchActivityById(activityId); 
    }
    // Optional: Clear currentActivity on unmount or if activityId changes
    return () => {
      // Consider if this is the desired behavior, it might cause refetch on back navigation
      // useActivitiesStore.setState({ currentActivity: null, currentActivityError: null, currentActivityLoading: false });
    };
  }, [activityId, fetchActivityById]);

  // Update handlers for inline editing
  const handleSubjectUpdate = async () => {
    if (!currentActivity || !activityId) return;
    try {
      await updateActivity(activityId, { subject: newSubject });
      toast({ title: 'Subject Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingSubject(false);
      fetchActivityById(activityId);
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to update this activity.', status: 'error', duration: 4000, isClosable: true });
      } else {
        toast({ title: 'Error Updating Subject', description: errorMessage, status: 'error', duration: 3000, isClosable: true });
      }
      setIsEditingSubject(false);
    }
  };

  const handleTypeUpdate = async () => {
    if (!currentActivity || !activityId) return;
    try {
      await updateActivity(activityId, { type: newType as any });
      toast({ title: 'Type Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingType(false);
      fetchActivityById(activityId);
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (errorMessage.includes('Forbidden') || errorMessage.includes('permission')) {
        toast({ title: 'Permission Denied', description: 'You do not have permission to update this activity.', status: 'error', duration: 4000, isClosable: true });
      } else {
        toast({ title: 'Error Updating Type', description: errorMessage, status: 'error', duration: 3000, isClosable: true });
      }
      setIsEditingType(false);
    }
  };

  const handleDueDateUpdate = async () => {
    if (!currentActivity || !activityId) return;
    try {
      await updateActivity(activityId, { due_date: newDueDate });
      toast({ title: 'Due Date Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingDueDate(false);
      fetchActivityById(activityId);
    } catch (e) {
      toast({ title: 'Error Updating Due Date', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };



  const handleStatusUpdate = async () => {
    if (!currentActivity || !activityId) return;
    try {
      await updateActivity(activityId, { is_done: newStatus });
      toast({ title: 'Status Updated', status: 'success', duration: 2000, isClosable: true });
      setIsEditingStatus(false);
      fetchActivityById(activityId);
    } catch (e) {
      toast({ title: 'Error Updating Status', description: (e as Error).message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  if (currentActivityLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (currentActivityError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error Loading Activity</AlertTitle>
        <AlertDescription>{currentActivityError}</AlertDescription>
      </Alert>
    );
  }

  if (!currentActivity) {
    // This condition might be hit briefly even if loading is false and no error, if activity is null initially
    // Or if fetch returns null for a valid ID not found by RLS/DB query without throwing specific error
    return (
      <Alert status="info">
        <AlertIcon />
        Activity not found or you may not have permission to view it.
      </Alert>
    );
  }

  // Destructure directly from currentActivity for cleaner JSX
  const { 
    type, 
    subject, 
    due_date, 
    is_done, 
    created_at, 
    updated_at, 
    user, 
    deal, 
    person, 
    organization,
    assignedToUser,
    is_system_activity
  } = currentActivity;

  return (
    <Box p={5}>
      {/* Header: Breadcrumbs, Title */}
      <Box 
        pb={4} 
        borderBottomWidth="1px" 
        borderColor={colors.border.default}
        mb={6}
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
              to="/activities" 
              color={colors.text.link}
              _hover={{textDecoration: 'underline'}}
            >
              Activities
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink 
              href="#" 
              color={colors.text.secondary}
              _hover={{textDecoration: 'none', cursor: 'default'}}
            >
              {subject || 'Activity Details'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Heading 
          size="xl" 
          color={colors.text.primary}
          mt={2}
        >
          Activity: {subject || 'Details'}
        </Heading>
      </Box>

      <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
        {/* Activity Details Card */}
        <GridItem>
          <Box 
            bg={colors.bg.elevated}
            p={6} 
            borderRadius="xl" 
            borderWidth="1px" 
            borderColor={colors.border.default}
            h="fit-content"
          >
            <HStack justifyContent="space-between" alignItems="center" mb={5}>
              <Heading 
                size="md" 
                color={colors.text.primary}
              >
                Activity Details
              </Heading>
            </HStack>
            <VStack spacing={4} align="stretch">
              {/* Subject Field */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color={colors.text.muted}>Subject</Text>
                {!isEditingSubject ? (
                  <HStack spacing={2}>
                    <Text 
                      fontSize="md" 
                      fontWeight="medium" 
                      color={colors.text.secondary}
                    >
                      {subject || '-'}
                    </Text>
                    <IconButton 
                      icon={<EditIcon />} 
                      size="xs" 
                      variant="ghost" 
                      aria-label="Edit Subject" 
                      onClick={() => {
                        setIsEditingSubject(true);
                        setNewSubject(subject || '');
                      }}
                      color={colors.text.muted}
                      _hover={{color: colors.text.link}}
                      isDisabled={!canEditActivity}
                    />
                  </HStack>
                ) : (
                  <HStack spacing={2} flex={1} justifyContent="flex-end">
                    <Input 
                      value={newSubject} 
                      onChange={(e) => setNewSubject(e.target.value)} 
                      placeholder="Enter subject" 
                      size="sm" 
                      w="300px"
                      bg={colors.bg.input}
                      borderColor={colors.border.default}
                      _hover={{borderColor: colors.border.emphasis}}
                      _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                    />
                    <IconButton 
                      icon={<CheckIcon />} 
                      size="xs" 
                      colorScheme="green" 
                      aria-label="Save Subject" 
                      onClick={handleSubjectUpdate}
                    />
                    <IconButton 
                      icon={<SmallCloseIcon />} 
                      size="xs" 
                      variant="ghost" 
                      colorScheme="red" 
                      aria-label="Cancel Edit Subject" 
                      onClick={() => setIsEditingSubject(false)}
                    />
                  </HStack>
                )}
              </HStack>

              {/* Status Field */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color={colors.text.muted}>Status</Text>
                {!isEditingStatus ? (
                  <HStack spacing={2}>
                    <Tag colorScheme={is_done ? 'green' : 'orange'}>
                      {is_done ? 'Completed' : 'Open'}
                    </Tag>
                    <IconButton 
                      icon={<EditIcon />} 
                      size="xs" 
                      variant="ghost" 
                      aria-label="Edit Status" 
                      onClick={() => {
                        setIsEditingStatus(true);
                        setNewStatus(is_done);
                      }}
                      color={colors.text.muted}
                      _hover={{color: colors.text.link}}
                      isDisabled={!canEditActivity}
                    />
                  </HStack>
                ) : (
                  <HStack spacing={2} flex={1} justifyContent="flex-end">
                    <Select 
                      value={newStatus ? 'true' : 'false'} 
                      onChange={(e) => setNewStatus(e.target.value === 'true')} 
                      size="sm" 
                      w="150px"
                      bg={colors.bg.input}
                      borderColor={colors.border.default}
                      _hover={{borderColor: colors.border.emphasis}}
                      _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                    >
                      <option value="false">Open</option>
                      <option value="true">Completed</option>
                    </Select>
                    <IconButton 
                      icon={<CheckIcon />} 
                      size="xs" 
                      colorScheme="green" 
                      aria-label="Save Status" 
                      onClick={handleStatusUpdate}
                    />
                    <IconButton 
                      icon={<SmallCloseIcon />} 
                      size="xs" 
                      variant="ghost" 
                      colorScheme="red" 
                      aria-label="Cancel Edit Status" 
                      onClick={() => setIsEditingStatus(false)}
                    />
                  </HStack>
                )}
              </HStack>

              {/* Type Field */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color={colors.text.muted}>Type</Text>
                {!isEditingType ? (
                  <HStack spacing={2}>
                    <Text 
                      fontSize="md" 
                      fontWeight="medium" 
                      color={colors.text.secondary}
                    >
                      {type || '-'}
                    </Text>
                    <IconButton 
                      icon={<EditIcon />} 
                      size="xs" 
                      variant="ghost" 
                      aria-label="Edit Type" 
                      onClick={() => {
                        setIsEditingType(true);
                        setNewType(type || '');
                      }}
                      color={colors.text.muted}
                      _hover={{color: colors.text.link}}
                      isDisabled={!canEditActivity}
                    />
                  </HStack>
                ) : (
                  <HStack spacing={2} flex={1} justifyContent="flex-end">
                    <Select 
                      value={newType} 
                      onChange={(e) => setNewType(e.target.value)} 
                      placeholder="Select type"
                      size="sm" 
                      w="200px"
                      bg={colors.bg.input}
                      borderColor={colors.border.default}
                      _hover={{borderColor: colors.border.emphasis}}
                      _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                    >
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="task">Task</option>
                      <option value="note">Note</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="demo">Demo</option>
                      <option value="proposal">Proposal</option>
                      <option value="contract">Contract</option>
                      <option value="other">Other</option>
                    </Select>
                    <IconButton 
                      icon={<CheckIcon />} 
                      size="xs" 
                      colorScheme="green" 
                      aria-label="Save Type" 
                      onClick={handleTypeUpdate}
                    />
                    <IconButton 
                      icon={<SmallCloseIcon />} 
                      size="xs" 
                      variant="ghost" 
                      colorScheme="red" 
                      aria-label="Cancel Edit Type" 
                      onClick={() => setIsEditingType(false)}
                    />
                  </HStack>
                )}
              </HStack>

              {/* Due Date Field */}
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color={colors.text.muted}>Due Date</Text>
                {!isEditingDueDate ? (
                  <HStack spacing={2}>
                    <Text 
                      fontSize="md" 
                      fontWeight="medium" 
                      color={colors.text.secondary}
                    >
                      {due_date ? new Date(due_date).toLocaleDateString() : '-'}
                    </Text>
                    <IconButton 
                      icon={<EditIcon />} 
                      size="xs" 
                      variant="ghost" 
                      aria-label="Edit Due Date" 
                      onClick={() => {
                        setIsEditingDueDate(true);
                        setNewDueDate(due_date ? new Date(due_date).toISOString().split('T')[0] : '');
                      }}
                      color={colors.text.muted}
                      _hover={{color: colors.text.link}}
                      isDisabled={!canEditActivity}
                    />
                  </HStack>
                ) : (
                  <HStack spacing={2} flex={1} justifyContent="flex-end">
                    <Input 
                      type="date"
                      value={newDueDate} 
                      onChange={(e) => setNewDueDate(e.target.value)} 
                      size="sm" 
                      w="180px"
                      bg={colors.bg.input}
                      borderColor={colors.border.default}
                      _hover={{borderColor: colors.border.emphasis}}
                      _focus={{borderColor: colors.border.focus, boxShadow: `0 0 0 1px ${colors.border.focus}`}}
                    />
                    <IconButton 
                      icon={<CheckIcon />} 
                      size="xs" 
                      colorScheme="green" 
                      aria-label="Save Due Date" 
                      onClick={handleDueDateUpdate}
                    />
                    <IconButton 
                      icon={<SmallCloseIcon />} 
                      size="xs" 
                      variant="ghost" 
                      colorScheme="red" 
                      aria-label="Cancel Edit Due Date" 
                      onClick={() => setIsEditingDueDate(false)}
                    />
                  </HStack>
                )}
              </HStack>

            </VStack>
          </Box>
        </GridItem>

        {/* Linked Items Card */}
        <GridItem>
          <Box 
            bg={colors.bg.elevated}
            p={6} 
            borderRadius="xl" 
            borderWidth="1px" 
            borderColor={colors.border.default}
            h="fit-content"
          >
            <Heading 
              size="md" 
              mb={5} 
              color={colors.text.primary}
            >
              Linked Items
            </Heading>
            
            <VStack spacing={3} align="stretch">
              {deal?.id && deal.name && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Deal</Text>
                  <RouterLink to={`/deals/${deal.id}`}>
                    <Link 
                      fontSize="md" 
                      fontWeight="medium" 
                      color={colors.text.link}
                      _hover={{textDecoration: 'underline'}}
                    >
                      {deal.name}
                    </Link>
                  </RouterLink>
                </HStack>
              )}
              {person?.id && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Person</Text>
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.secondary}
                  >
                    {person.first_name} {person.last_name || ''}
                  </Text>
                </HStack>
              )}
              {organization?.id && (
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color={colors.text.muted}>Organization</Text>
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={colors.text.secondary}
                  >
                    {organization.name}
                  </Text>
                </HStack>
              )}
              {!deal?.id && !person?.id && !organization?.id && (
                <Text color={colors.text.muted} fontSize="sm" fontStyle="italic">
                  No items linked to this activity.
                </Text>
              )}
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Other Information - Full Width Card */}
      <Box 
        bg={colors.bg.elevated}
        p={6} 
        borderRadius="xl" 
        borderWidth="1px" 
        borderColor={colors.border.default}
        mt={6}
      >
        <Heading 
          size="md" 
          mb={5} 
          color={colors.text.primary}
        >
          Other Information
        </Heading>
        <VStack spacing={4} align="stretch">
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color={colors.text.muted}>Assigned to</Text>
            <Text 
              fontSize="md" 
              fontWeight="medium" 
              color={colors.text.secondary}
            >
              {assignedToUser?.display_name || assignedToUser?.email || 'N/A'}
            </Text>
          </HStack>
          {is_system_activity && user && (
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color={colors.text.muted}>Created by</Text>
              <Text 
                fontSize="sm" 
                color={colors.text.muted}
                fontStyle="italic"
              >
                {user.display_name || user.email}
              </Text>
            </HStack>
          )}
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color={colors.text.muted}>Created</Text>
            <Text 
              fontSize="md" 
              fontWeight="medium" 
              color={colors.text.secondary}
            >
              {created_at ? new Date(created_at).toLocaleString() : 'N/A'}
            </Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color={colors.text.muted}>Last Updated</Text>
            <Text 
              fontSize="md" 
              fontWeight="medium" 
              color={colors.text.secondary}
            >
              {updated_at ? new Date(updated_at).toLocaleString() : 'N/A'}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default ActivityDetailPage; 