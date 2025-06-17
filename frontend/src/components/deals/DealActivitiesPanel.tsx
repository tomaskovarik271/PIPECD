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
import { useThemeStore } from '../../stores/useThemeStore';

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
  const themeStore = useThemeStore();
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  
  // View mode state (local to this component)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Get user permissions and current user ID for RBAC checks
  const userPermissions = appStore.userPermissions;
  const session = appStore.session;
  const currentUserId = session?.user.id;

  // Helper function for theme-specific accent colors
  const getAccentColor = () => {
    switch (currentThemeName) {
      case 'industrialMetal':
        return 'rgba(255, 170, 0, 0.6)'; // Hazard yellow for industrial only
      case 'lightModern':
        return '#6366f1'; // Indigo for light modern
      default:
        return '#667eea'; // Blue for modern dark
    }
  };

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
        borderColor={isOverdue ? colors.status.error : colors.component.kanban.cardBorder}
        justifyContent="space-between" 
        alignItems="center" 
        bg={activity.is_done ? colors.component.kanban.card : colors.component.kanban.card}
        _hover={{
          borderColor: colors.component.kanban.cardBorder, 
          transform: 'translateX(4px) translateY(-1px)',
          boxShadow: 'industrial3d',
          bg: colors.component.kanban.cardHover,
        }}
        minW={0}
        w="100%"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow={isOverdue ? 'forgeFire' : 'metallic'}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          background: isOverdue 
            ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 1) 50%, rgba(239, 68, 68, 0.8) 100%)'
            : activity.is_done
              ? 'linear-gradient(180deg, rgba(34, 197, 94, 0.8) 0%, rgba(34, 197, 94, 1) 50%, rgba(34, 197, 94, 0.8) 100%)'
              : currentThemeName === 'industrialMetal' ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.6) 0%, rgba(255, 170, 0, 0.8) 50%, rgba(255, 170, 0, 0.6) 100%)' : 'transparent',
          borderRadius: '0 0 0 lg',
        }}
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
        <Box
          p={3}
          mb={3}
          bg={colors.component.kanban.card}
          borderRadius="md"
          borderWidth="1px"
          borderColor={colors.component.kanban.cardBorder}
          boxShadow="metallic"
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '8px',
            right: '8px',
            height: '1px',
                          background: currentThemeName === 'industrialMetal' 
                ? 'linear-gradient(90deg, transparent 0%, rgba(255,170,0,0.6) 50%, transparent 100%)'
                : 'transparent',
          }}
        >
          <HStack spacing={2}>
            <Heading size="xs" color={colors.text.secondary} textTransform="uppercase" letterSpacing="wide">
              {title}
            </Heading>
            <Badge {...badgeProps} fontSize="xs">
              {activities.length}
            </Badge>
          </HStack>
        </Box>
        <VStack spacing={2} align="stretch">
          {activities.map((activity) => renderActivityCard(activity))}
        </VStack>
      </Box>
    );
  };

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
        background: `linear-gradient(90deg, transparent 0%, ${getAccentColor()} 50%, transparent 100%)`,
        pointerEvents: 'none',
      }}
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