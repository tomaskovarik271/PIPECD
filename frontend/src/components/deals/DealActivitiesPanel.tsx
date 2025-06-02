import React from 'react';
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
} from '@chakra-ui/react';
import {
  AddIcon,
  CheckIcon,
  DeleteIcon,
  EditIcon,
  InfoIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
import { Activity, ActivityType as GQLActivityType } from '../../stores/useActivitiesStore';

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
  return (
    <>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="sm" color="white">Activities</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          size="sm" 
          colorScheme="blue" 
          onClick={onCreateActivity} 
          variant="solid"
        >
          Add Activity
        </Button>
      </Flex>
      
      {loading && (
        <Center>
          <Spinner color="blue.400"/>
        </Center>
      )}
      
      {error && (
        <Text color="red.400">Error: {error}</Text>
      )}
      
      {!loading && !error && activities.length === 0 && (
        <Center minH="100px" flexDirection="column" bg="gray.750" borderRadius="md" p={4}>
          <Icon as={InfoIcon} w={6} h={6} color="gray.500" mb={3} />
          <Text color="gray.400" fontSize="sm">No activities for this deal yet.</Text>
        </Center>
      )}
      
      {!loading && !error && activities.length > 0 && (
        <VStack spacing={3} align="stretch">
          {activities.map((activity) => (
            <Flex 
              key={activity.id} 
              p={3} 
              borderWidth="1px" 
              borderRadius="md" 
              borderColor="gray.600" 
              justifyContent="space-between" 
              alignItems="center" 
              bg="gray.750" 
              _hover={{borderColor: "blue.400"}}
            >
              <HStack spacing={3} alignItems="center">
                <Tooltip 
                  label={activity.is_done ? "Mark Incomplete" : "Mark Complete"} 
                  bg="gray.600" 
                  color="white"
                >
                  <IconButton 
                    icon={activity.is_done ? <CheckIcon /> : <SmallCloseIcon />} 
                    onClick={() => onToggleComplete(activity)}
                    size="sm"
                    variant="ghost"
                    colorScheme={activity.is_done ? 'green' : 'gray'}
                    aria-label={activity.is_done ? "Mark Incomplete" : "Mark Complete"}
                    color={activity.is_done ? "green.400" : "gray.300"}
                    _hover={{bg: "gray.600"}}
                  />
                </Tooltip>
                <Icon 
                  as={getActivityTypeIcon(activity.type as GQLActivityType)} 
                  color={activity.is_done ? "green.400" : "gray.300"} 
                  boxSize={4}
                />
                <VStack align="start" spacing={0}>
                  <Text 
                    fontWeight="medium" 
                    color={activity.is_done ? "gray.500" : "gray.100"} 
                    textDecoration={activity.is_done ? 'line-through' : 'none'} 
                    fontSize="sm"
                  >
                    {activity.subject}
                  </Text>
                  {activity.due_date && (
                    <Text fontSize="xs" color="gray.400">
                      Due: {new Date(activity.due_date).toLocaleDateString()} {new Date(activity.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                  {activity.assignedToUser && (
                    <Text fontSize="xs" color="gray.400">
                      To: {activity.assignedToUser.display_name}
                    </Text>
                  )}
                  {activity.is_system_activity && (
                    <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full">
                      System
                    </Tag>
                  )}
                </VStack>
              </HStack>
              <HStack spacing={1}>
                <Tooltip label="Edit Activity" bg="gray.600" color="white">
                  <IconButton 
                    icon={<EditIcon />} 
                    size="xs" 
                    variant="ghost" 
                    aria-label="Edit Activity" 
                    onClick={() => onEditActivity(activity)} 
                    color="gray.300" 
                    _hover={{color: "blue.300", bg:"gray.600"}}
                  />
                </Tooltip>
                <Tooltip label="Delete Activity" bg="gray.600" color="white">
                  <IconButton 
                    icon={<DeleteIcon />} 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="red" 
                    aria-label="Delete Activity" 
                    onClick={() => onDeleteActivity(activity)} 
                    color="red.500" 
                    _hover={{color: "red.300", bg:"gray.600"}}
                  />
                </Tooltip>
              </HStack>
            </Flex>
          ))}
        </VStack>
      )}
    </>
  );
}; 