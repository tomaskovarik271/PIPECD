import React from 'react';
import {
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, EditIcon, CalendarIcon, LinkIcon } from '@chakra-ui/icons';
import { FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

// Task type interface (will be replaced with generated types)
interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  estimatedDuration?: number;
  assignedToUser?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdByUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  deal?: {
    id: string;
    name: string;
    amount?: number;
    currency?: string;
  };
  lead?: {
    id: string;
    contactName: string;
    contactEmail: string;
  };
  person?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  notes?: string;
  tags?: string[];
}

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string, notes?: string) => void;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'blue';
    case 'low':
      return 'gray';
    default:
      return 'gray';
  }
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'green';
    case 'in_progress':
      return 'blue';
    case 'pending':
      return 'yellow';
    case 'cancelled':
      return 'red';
    case 'waiting':
      return 'purple';
    default:
      return 'gray';
  }
};

// Task type icon mapping
const getTaskTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'call':
      return '📞';
    case 'email':
      return '📧';
    case 'meeting_prep':
    case 'post_meeting':
      return '🤝';
    case 'follow_up':
      return '🔄';
    case 'deadline':
      return '⏰';
    case 'research':
      return '🔍';
    default:
      return '📋';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  compact = false
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  const isCompleted = task.status.toLowerCase() === 'completed';
  const isOverdue = task.dueDate && !isCompleted && new Date(task.dueDate) < new Date();

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (taskDate.getTime() === today.getTime()) {
      return `Today ${format(date, 'HH:mm')}`;
    } else if (taskDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return `Tomorrow ${format(date, 'HH:mm')}`;
    } else if (taskDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const getBusinessContext = () => {
    if (task.deal) {
      return {
        type: 'deal',
        name: task.deal.name,
        value: task.deal.amount ? `${task.deal.currency || '$'}${task.deal.amount}` : null,
        link: `/deals/${task.deal.id}`
      };
    }
    if (task.lead) {
      return {
        type: 'lead',
        name: task.lead.contactName,
        value: task.lead.contactEmail,
        link: `/leads/${task.lead.id}`
      };
    }
    if (task.person) {
      return {
        type: 'person',
        name: `${task.person.firstName} ${task.person.lastName}`,
        value: task.person.email,
        link: `/people/${task.person.id}`
      };
    }
    if (task.organization) {
      return {
        type: 'organization',
        name: task.organization.name,
        value: null,
        link: `/organizations/${task.organization.id}`
      };
    }
    return null;
  };

  const businessContext = getBusinessContext();

  if (compact) {
    return (
      <Box
        p={3}
        bg={cardBg}
        borderLeft="3px solid"
        borderLeftColor={isOverdue ? 'red.400' : getPriorityColor(task.priority) + '.400'}
        borderRadius="md"
        _hover={{ shadow: 'sm' }}
        opacity={isCompleted ? 0.7 : 1}
      >
        <HStack justify="space-between" align="flex-start">
          <HStack flex={1} align="flex-start" spacing={3}>
            <Text fontSize="lg">{getTaskTypeIcon(task.type)}</Text>
            <VStack align="flex-start" spacing={1} flex={1}>
              <Text 
                fontWeight="medium" 
                textDecoration={isCompleted ? 'line-through' : 'none'}
                fontSize="sm"
              >
                {task.title}
              </Text>
              <HStack spacing={2} wrap="wrap">
                <Badge size="sm" colorScheme={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>
                {task.dueDate && (
                  <HStack spacing={1}>
                    <CalendarIcon boxSize={3} color={textColor} />
                    <Text fontSize="xs" color={isOverdue ? 'red.500' : textColor}>
                      {formatDueDate(task.dueDate)}
                    </Text>
                  </HStack>
                )}
                {businessContext && (
                  <HStack spacing={1}>
                    <LinkIcon boxSize={3} color={textColor} />
                    <Link href={businessContext.link} fontSize="xs" color="blue.500">
                      {businessContext.name}
                    </Link>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </HStack>
          
          <HStack spacing={1}>
            {!isCompleted && onComplete && (
              <Tooltip label="Mark Complete">
                <IconButton
                  aria-label="Complete task"
                  icon={<CheckIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => onComplete(task.id)}
                />
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip label="Edit Task">
                <IconButton
                  aria-label="Edit task"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(task)}
                />
              </Tooltip>
            )}
          </HStack>
        </HStack>
      </Box>
    );
  }

  // Full card layout
  return (
    <Box
      p={4}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      opacity={isCompleted ? 0.8 : 1}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="flex-start">
          <HStack spacing={3} flex={1}>
            <Text fontSize="xl">{getTaskTypeIcon(task.type)}</Text>
            <VStack align="flex-start" spacing={1} flex={1}>
              <Text 
                fontWeight="semibold" 
                textDecoration={isCompleted ? 'line-through' : 'none'}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text fontSize="sm" color={textColor} noOfLines={2}>
                  {task.description}
                </Text>
              )}
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            <Badge colorScheme={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge colorScheme={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
          </HStack>
        </HStack>

        <HStack justify="space-between" align="center" wrap="wrap">
          <HStack spacing={4} wrap="wrap">
            {task.dueDate && (
              <HStack spacing={1}>
                <CalendarIcon boxSize={4} color={textColor} />
                <Text fontSize="sm" color={isOverdue ? 'red.500' : textColor}>
                  {formatDueDate(task.dueDate)}
                </Text>
              </HStack>
            )}
            
            {task.assignedToUser && (
              <HStack spacing={1}>
                <FiUser size={20} color={textColor} />
                <Text fontSize="sm" color={textColor}>
                  {task.assignedToUser.firstName && task.assignedToUser.lastName
                    ? `${task.assignedToUser.firstName} ${task.assignedToUser.lastName}`
                    : task.assignedToUser.email}
                </Text>
              </HStack>
            )}

            {businessContext && (
              <HStack spacing={1}>
                <LinkIcon boxSize={4} color={textColor} />
                <Link href={businessContext.link} fontSize="sm" color="blue.500">
                  {businessContext.name}
                  {businessContext.value && (
                    <Text as="span" color={textColor} ml={1}>
                      ({businessContext.value})
                    </Text>
                  )}
                </Link>
              </HStack>
            )}
          </HStack>

          <HStack spacing={2}>
            {!isCompleted && onComplete && (
              <Tooltip label="Mark Complete">
                <IconButton
                  aria-label="Complete task"
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  onClick={() => onComplete(task.id)}
                />
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip label="Edit Task">
                <IconButton
                  aria-label="Edit task"
                  icon={<EditIcon />}
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(task)}
                />
              </Tooltip>
            )}
          </HStack>
        </HStack>

        {task.tags && task.tags.length > 0 && (
          <HStack spacing={1} wrap="wrap">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="subtle" fontSize="xs">
                {tag}
              </Badge>
            ))}
          </HStack>
        )}
      </VStack>
    </Box>
  );
}; 