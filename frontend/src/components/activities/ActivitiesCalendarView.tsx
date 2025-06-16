import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Heading,
  IconButton,
  Badge,
  Tag,
  Tooltip,
  useColorModeValue,
  Flex,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Activity } from '../../stores/useActivitiesStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Link as RouterLink } from 'react-router-dom';

interface ActivitiesCalendarViewProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

// Helper function to get activity type color
const getActivityTypeColor = (type: string): string => {
  switch (type?.toUpperCase()) {
    case 'TASK': return 'blue';
    case 'MEETING': return 'purple';
    case 'CALL': return 'green';
    case 'EMAIL': return 'orange';
    case 'DEADLINE': return 'red';
    default: return 'gray';
  }
};

const ActivitiesCalendarView: React.FC<ActivitiesCalendarViewProps> = ({
  activities,
  onActivityClick,
}) => {
  const colors = useThemeColors();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Generate calendar grid (6 weeks x 7 days = 42 cells)
    const calendarDays: Array<{
      date: Date;
      isCurrentMonth: boolean;
      activities: Activity[];
    }> = [];

    // Previous month's trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        activities: [],
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayActivities = activities.filter(activity => {
        if (!activity.due_date) return false;
        const activityDate = new Date(activity.due_date);
        return (
          activityDate.getFullYear() === year &&
          activityDate.getMonth() === month &&
          activityDate.getDate() === day
        );
      });

      calendarDays.push({
        date,
        isCurrentMonth: true,
        activities: dayActivities,
      });
    }

    // Next month's leading days (fill to 42 total cells)
    const remainingCells = 42 - calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        activities: [],
      });
    }

    return {
      calendarDays,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }, [currentDate, activities]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card bg={colors.bg.surface} borderColor={colors.border.default}>
      <CardBody p={6}>
        {/* Calendar Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color={colors.text.primary}>
            {calendarData.monthName}
          </Heading>
          <HStack spacing={2}>
            <IconButton
              aria-label="Previous month"
              icon={<ChevronLeftIcon />}
              size="md"
              variant="outline"
              onClick={() => navigateMonth('prev')}
              borderColor={colors.border.input}
              color={colors.text.primary}
              _hover={{
                bg: colors.component.button.secondaryHover,
                borderColor: colors.interactive.hover,
              }}
            />
            <IconButton
              aria-label="Next month"
              icon={<ChevronRightIcon />}
              size="md"
              variant="outline"
              onClick={() => navigateMonth('next')}
              borderColor={colors.border.input}
              color={colors.text.primary}
              _hover={{
                bg: colors.component.button.secondaryHover,
                borderColor: colors.interactive.hover,
              }}
            />
          </HStack>
        </Flex>

        {/* Calendar Grid */}
        <Box>
          {/* Week Day Headers */}
          <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
            {weekDays.map(day => (
              <Box
                key={day}
                p={3}
                textAlign="center"
                bg={colors.bg.elevated}
                borderRadius="md"
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={colors.text.secondary}
                >
                  {day}
                </Text>
              </Box>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid templateColumns="repeat(7, 1fr)" gap={1}>
            {calendarData.calendarDays.map((dayData) => {
              const isCurrentDay = isToday(dayData.date);
              // Use date string as unique key instead of index for better React reconciliation
              const dayKey = `${dayData.date.getFullYear()}-${dayData.date.getMonth()}-${dayData.date.getDate()}`;
              
              return (
                <Box
                  key={dayKey}
                  minH="120px"
                  p={2}
                  border="1px solid"
                  borderColor={colors.border.subtle}
                  borderRadius="md"
                  bg={dayData.isCurrentMonth ? colors.bg.surface : colors.bg.overlay}
                  opacity={dayData.isCurrentMonth ? 1 : 0.5}
                  position="relative"
                  _hover={{
                    bg: dayData.isCurrentMonth ? colors.bg.elevated : colors.bg.overlay,
                    borderColor: colors.border.input,
                  }}
                >
                  {/* Day Number */}
                  <Text
                    fontSize="sm"
                    fontWeight={isCurrentDay ? "bold" : "medium"}
                    color={
                      isCurrentDay
                        ? colors.interactive.default
                        : dayData.isCurrentMonth
                        ? colors.text.primary
                        : colors.text.muted
                    }
                    mb={1}
                  >
                    {dayData.date.getDate()}
                  </Text>

                  {/* Today Indicator */}
                  {isCurrentDay && (
                    <Box
                      position="absolute"
                      top={1}
                      right={1}
                      w={2}
                      h={2}
                      bg={colors.interactive.default}
                      borderRadius="full"
                    />
                  )}

                  {/* Activities */}
                  <VStack spacing={1} align="stretch">
                    {dayData.activities.slice(0, 3).map((activity) => (
                      <Tooltip
                        key={activity.id}
                        label={`${activity.subject} (${activity.type})`}
                        placement="top"
                        hasArrow
                      >
                        <Box
                          as={RouterLink}
                          to={`/activities/${activity.id}`}
                          onClick={(e: React.MouseEvent) => {
                            if (onActivityClick) {
                              e.preventDefault();
                              onActivityClick(activity);
                            }
                          }}
                          p={1}
                          borderRadius="sm"
                          bg={colors.bg.surface}
                          border="1px solid"
                          borderColor={colors.border.subtle}
                          cursor="pointer"
                          _hover={{
                            bg: colors.bg.elevated,
                            borderColor: colors.border.input,
                            transform: 'translateY(-1px)',
                            boxShadow: 'sm',
                          }}
                          transition="all 0.2s"
                        >
                          <HStack spacing={1}>
                            <Tag
                              size="xs"
                              colorScheme={getActivityTypeColor(activity.type)}
                              opacity={activity.is_done ? 0.6 : 1}
                              textDecoration={activity.is_done ? 'line-through' : 'none'}
                            >
                              {activity.type}
                            </Tag>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color={colors.text.secondary}
                            noOfLines={1}
                            opacity={activity.is_done ? 0.6 : 1}
                            textDecoration={activity.is_done ? 'line-through' : 'none'}
                          >
                            {activity.subject}
                          </Text>
                        </Box>
                      </Tooltip>
                    ))}
                    
                    {/* Show count if more activities */}
                    {dayData.activities.length > 3 && (
                      <Badge
                        size="sm"
                        colorScheme="blue"
                        variant="subtle"
                        fontSize="xs"
                        textAlign="center"
                      >
                        +{dayData.activities.length - 3} more
                      </Badge>
                    )}
                  </VStack>
                </Box>
              );
            })}
          </Grid>
        </Box>

        {/* Legend */}
        <HStack spacing={4} mt={6} justify="center" flexWrap="wrap">
          <HStack spacing={2}>
            <Text fontSize="sm" color={colors.text.secondary}>Activity Types:</Text>
            {['TASK', 'MEETING', 'CALL', 'EMAIL', 'DEADLINE'].map((type) => (
              <Tag key={type} size="sm" colorScheme={getActivityTypeColor(type)}>
                {type}
              </Tag>
            ))}
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default ActivitiesCalendarView; 