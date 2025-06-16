import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Tag,
  Text,
  Tooltip,
  VStack,
  Badge,
  Divider,
  ButtonGroup,
} from '@chakra-ui/react';
import {
  AddIcon,
  CheckIcon,
  DeleteIcon,
  EditIcon,
  InfoIcon,
  SmallCloseIcon,
  CalendarIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { Activity, ActivityType as GQLActivityType } from '../../stores/useActivitiesStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAppStore } from '../../stores/useAppStore';
import ActivitiesCalendarView from '../activities/ActivitiesCalendarView';

interface DealActivitiesPanelProps {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  onCreateActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onToggleComplete: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  getActivityTypeIcon: (type?: GQLActivityType | null) => React.ElementType;
}

export const DealActivitiesPanel: React.FC<DealActivitiesPanelProps> = ({
  activities,
  loading,
  error,
  onCreateActivity,
  onEditActivity,
  onToggleComplete,
  onDeleteActivity,
  getActivityTypeIcon,
}) => {
  const colors = useThemeColors();
  const appStore = useAppStore();
  
  // NEW: Check for industrial theme for conditional 3D effects
  const isIndustrialTheme = colors.themeName === 'industrialMetal';
  
  // View mode state (local to this component)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Get user permissions and current user ID for RBAC checks
  const userPermissions = appStore.userPermissions;
  const session = appStore.session;
  const currentUserId = session?.user.id;

  // Sort activities by due date and completion status for better timeline view
  const sortedActivities = React.useMemo(() => {
    return [...activities].sort((a, b) => {
      // Completed activities go to bottom
      if (a.is_done !== b.is_done) {
        return a.is_done ? 1 : -1;
      }
      
      // For incomplete activities, sort by due date (overdue first, then by date)
      if (!a.is_done && !b.is_done) {
        const aDate = a.due_date ? new Date(a.due_date) : null;
        const bDate = b.due_date ? new Date(b.due_date) : null;
        
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        
        return aDate.getTime() - bDate.getTime();
      }
      
      // For completed activities, sort by completion date (most recent first)
      return 0;
    });
  }, [activities]);

  // Separate activities into categories for better organization
  const categorizedActivities = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const overdue: Activity[] = [];
    const dueToday: Activity[] = [];
    const upcoming: Activity[] = [];
    const completed: Activity[] = [];
    const noDueDate: Activity[] = [];

    sortedActivities.forEach(activity => {
      if (activity.is_done) {
        completed.push(activity);
        return;
      }

      if (!activity.due_date) {
        noDueDate.push(activity);
        return;
      }

      const dueDate = new Date(activity.due_date);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
      if (dueDateOnly < today) {
        overdue.push(activity);
      } else if (dueDateOnly.getTime() === today.getTime()) {
        dueToday.push(activity);
      } else {
        upcoming.push(activity);
      }
    });

    return { overdue, dueToday, upcoming, noDueDate, completed };
  }, [sortedActivities]);

  const renderActivityCard = (activity: Activity, showBadge = false, badgeProps: any = {}) => {
    const dueDate = activity.due_date ? new Date(activity.due_date) : null;
    const now = new Date();
    const isOverdue = dueDate && dueDate < now && !activity.is_done;
    const isDueToday = dueDate && dueDate.toDateString() === now.toDateString();

    return (
      <Flex 
        key={activity.id} 
        p={4} 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor={isOverdue ? colors.status.error : (
          isIndustrialTheme ? 'rgba(255, 170, 0, 0.3)' : (colors.border.default || 'gray.200')
        )}
        justifyContent="space-between" 
        alignItems="center" 
        bg={
          isIndustrialTheme 
            ? (activity.is_done 
                ? 'linear-gradient(135deg, #2A2A2A 0%, #1E1E1E 100%)' 
                : 'linear-gradient(135deg, #303030 0%, #262626 100%)'
              )
            : (activity.is_done ? colors.bg.surface : (colors.bg.surface || 'gray.50'))
        }
        _hover={{
          borderColor: isIndustrialTheme 
            ? 'rgba(255, 170, 0, 0.6)' 
            : (colors.interactive.default || 'blue.400'), 
          transform: 'translateY(-1px)',
          boxShadow: isIndustrialTheme 
            ? '0 4px 12px rgba(0,0,0,0.35), 0 0 20px rgba(255,170,0,0.2)' 
            : 'md',
          ...(isIndustrialTheme ? {
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '3px',
              background: 'linear-gradient(180deg, rgba(255,170,0,0.6) 0%, rgba(255,170,0,0.3) 50%, rgba(255,170,0,0.6) 100%)',
              borderTopLeftRadius: 'lg',
              borderBottomLeftRadius: 'lg',
            }
          } : {})
        }}
        minW={0}
        w="100%"
        position="relative"
        transition="all 0.2s ease"
        boxShadow={
          isOverdue 
            ? `0 0 0 1px ${colors.status.error}` 
            : (isIndustrialTheme 
                ? '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' 
                : 'sm'
              )
        }
      >
        <HStack spacing={3} alignItems="center" flex={1} minW={0}>
          <Tooltip 
            label={activity.is_done ? "Mark Incomplete" : "Mark Complete"} 
            placement="top"
          >
            <IconButton 
              icon={activity.is_done ? <CheckIcon /> : <SmallCloseIcon />} 
              onClick={() => onToggleComplete(activity)}
              size="sm"
              variant="ghost"
              colorScheme={activity.is_done ? 'green' : 'gray'}
              aria-label={activity.is_done ? "Mark Incomplete" : "Mark Complete"}
              color={activity.is_done ? colors.status.success : colors.text.secondary}
              _hover={{bg: colors.bg.surface}}
              flexShrink={0}
            />
          </Tooltip>
          <Icon 
            as={getActivityTypeIcon(activity.type as GQLActivityType)} 
            color={activity.is_done ? colors.status.success : colors.text.primary} 
            boxSize={4}
            flexShrink={0}
          />
          <VStack align="start" spacing={1} flex={1} minW={0}>
            <HStack spacing={2} wrap="wrap">
              <Text 
                fontWeight="medium" 
                color={activity.is_done ? colors.text.muted : colors.text.primary} 
                textDecoration={activity.is_done ? 'line-through' : 'none'} 
                fontSize="sm"
                noOfLines={2}
                wordBreak="break-word"
              >
                {activity.subject}
              </Text>
              {showBadge && (
                <Badge {...badgeProps} fontSize="xs">
                  {badgeProps.children}
                </Badge>
              )}
              {activity.is_done && (
                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                  Completed
                </Badge>
              )}
              {isOverdue && (
                <Badge colorScheme="red" variant="solid" fontSize="xs">
                  Overdue
                </Badge>
              )}
              {isDueToday && !activity.is_done && (
                <Badge colorScheme="orange" variant="solid" fontSize="xs">
                  Due Today
                </Badge>
              )}
            </HStack>
            {activity.due_date && (
              <Text fontSize="xs" color={isOverdue ? colors.status.error : colors.text.secondary} noOfLines={1}>
                Due: {dueDate?.toLocaleDateString()} {dueDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isDueToday && ' (Today)'}
              </Text>
            )}
            {activity.assignedToUser && (
              <Text fontSize="xs" color={colors.text.secondary} noOfLines={1}>
                Assigned to: {activity.assignedToUser.display_name}
              </Text>
            )}
            {activity.is_system_activity && (
              <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full">
                System Generated
              </Tag>
            )}
          </VStack>
        </HStack>
        <HStack spacing={1} flexShrink={0}>
          <Tooltip label="Edit Activity" placement="top">
            <IconButton 
              icon={<EditIcon />} 
              size="xs" 
              variant="ghost" 
              aria-label="Edit Activity" 
              onClick={() => onEditActivity(activity)} 
              color={colors.text.secondary} 
              _hover={{color: colors.interactive.default, bg: colors.bg.surface}}
              isDisabled={
                !(
                  userPermissions?.includes('activity:update_any') ||
                  (userPermissions?.includes('activity:update_own') && activity.user_id === currentUserId)
                )
              }
            />
          </Tooltip>
          <Tooltip label="Delete Activity" placement="top">
            <IconButton 
              icon={<DeleteIcon />} 
              size="xs" 
              variant="ghost" 
              colorScheme="red" 
              aria-label="Delete Activity" 
              onClick={() => onDeleteActivity(activity)} 
              color={colors.status.error} 
              _hover={{color: colors.status.error, bg: colors.bg.surface}}
              isDisabled={
                !(
                  userPermissions?.includes('activity:delete_any') ||
                  (userPermissions?.includes('activity:delete_own') && activity.user_id === currentUserId)
                )
              }
            />
          </Tooltip>
        </HStack>
      </Flex>
    );
  };

  const renderActivitySection = (title: string, activities: Activity[], badgeProps: any = {}, emptyMessage = '') => {
    if (activities.length === 0) return null;

    return (
      <Box mb={6}>
        <HStack spacing={2} mb={3}>
          <Heading size="xs" color={colors.text.secondary} textTransform="uppercase" letterSpacing="wide">
            {title}
          </Heading>
          <Badge {...badgeProps} fontSize="xs">
            {activities.length}
          </Badge>
        </HStack>
        <VStack spacing={2} align="stretch">
          {activities.map((activity) => renderActivityCard(activity))}
        </VStack>
      </Box>
    );
  };

  return (
    <Box
      bg={isIndustrialTheme ? 'linear-gradient(180deg, #1C1C1C 0%, #181818 50%, #141414 100%)' : 'transparent'}
      borderRadius="lg"
      p={isIndustrialTheme ? 4 : 0}
      position="relative"
      boxShadow={isIndustrialTheme ? '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none'}
      _before={isIndustrialTheme ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, rgba(255,170,0,0.3) 0%, rgba(255,170,0,0.1) 50%, rgba(255,170,0,0.3) 100%)',
        borderTopRadius: 'lg',
        zIndex: 1
      } : {}}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="md" color={colors.text.primary}>Activities Timeline</Heading>
        <HStack spacing={3}>
          {/* View Mode Toggle */}
          <ButtonGroup size="sm" isAttached variant="outline">
            <IconButton
              aria-label="List view"
              icon={<ViewIcon />}
              isActive={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              bg={viewMode === 'list' ? colors.interactive.default : colors.component.button.secondary}
              borderColor={colors.border.input}
              color={viewMode === 'list' ? colors.text.onAccent : colors.text.primary}
              _hover={{
                bg: viewMode === 'list' ? colors.interactive.hover : colors.component.button.secondaryHover
              }}
            />
            <IconButton
              aria-label="Calendar view"
              icon={<CalendarIcon />}
              isActive={viewMode === 'calendar'}
              onClick={() => setViewMode('calendar')}
              bg={viewMode === 'calendar' ? colors.interactive.default : colors.component.button.secondary}
              borderColor={colors.border.input}
              color={viewMode === 'calendar' ? colors.text.onAccent : colors.text.primary}
              _hover={{
                bg: viewMode === 'calendar' ? colors.interactive.hover : colors.component.button.secondaryHover
              }}
            />
          </ButtonGroup>
          
          <Button 
            leftIcon={<AddIcon />} 
            size="sm" 
            colorScheme="blue" 
            onClick={onCreateActivity} 
            variant="solid"
          >
            Add Activity
          </Button>
        </HStack>
      </Flex>
      
      {loading && (
        <Center py={8}>
          <Spinner color={colors.interactive.default} size="lg"/>
        </Center>
      )}
      
      {error && (
        <Box p={4} bg={colors.bg.surface} borderRadius="md" border="1px solid" borderColor={colors.status.error}>
          <Text color={colors.status.error}>Error: {error}</Text>
        </Box>
      )}
      
      {!loading && !error && activities.length === 0 && (
        <Center minH="200px" flexDirection="column" bg={colors.bg.surface} borderRadius="lg" p={8}>
          <Icon as={InfoIcon} w={8} h={8} color={colors.text.muted} mb={4} />
          <Text color={colors.text.secondary} fontSize="md" textAlign="center">
            No activities for this deal yet.
          </Text>
          <Text color={colors.text.muted} fontSize="sm" textAlign="center" mt={2}>
            Create your first activity to start tracking progress.
          </Text>
        </Center>
      )}
      
      {!loading && !error && activities.length > 0 && (
        <>
          {viewMode === 'calendar' ? (
            <ActivitiesCalendarView
              activities={activities}
              onActivityClick={onEditActivity}
            />
          ) : (
            <VStack spacing={0} align="stretch">
              {/* Overdue Activities */}
              {renderActivitySection(
                "Overdue", 
                categorizedActivities.overdue, 
                { colorScheme: "red", variant: "solid" }
              )}
              
              {/* Due Today */}
              {renderActivitySection(
                "Due Today", 
                categorizedActivities.dueToday, 
                { colorScheme: "orange", variant: "solid" }
              )}
              
              {/* Upcoming Activities */}
              {renderActivitySection(
                "Upcoming", 
                categorizedActivities.upcoming, 
                { colorScheme: "blue", variant: "outline" }
              )}
              
              {/* No Due Date */}
              {renderActivitySection(
                "No Due Date", 
                categorizedActivities.noDueDate, 
                { colorScheme: "gray", variant: "outline" }
              )}
              
              {/* Completed Activities */}
              {categorizedActivities.completed.length > 0 && (
                <>
                  <Divider my={4} />
                  {renderActivitySection(
                    "Completed", 
                    categorizedActivities.completed, 
                    { colorScheme: "green", variant: "subtle" }
                  )}
                </>
              )}
            </VStack>
          )}
        </>
      )}
    </Box>
  );
}; 