import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Flex,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { FiRefreshCw } from 'react-icons/fi';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TASKS, COMPLETE_TASK } from '../../lib/graphql/taskOperations';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';

interface TasksListProps {
  dealId?: string;
  leadId?: string;
  personId?: string;
  organizationId?: string;
  compact?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
}

export const TasksList: React.FC<TasksListProps> = ({
  dealId,
  leadId,
  personId,
  organizationId,
  compact = false,
  showFilters = true,
  maxHeight = '600px',
}) => {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    assignedToMe: false,
    search: '',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');

  // Build filter variables for GraphQL query
  const getFilterVariables = () => {
    const variables: any = {
      limit: 50,
      offset: 0,
    };

    // Business context filters
    if (dealId) variables.dealId = dealId;
    if (leadId) variables.leadId = leadId;
    if (personId) variables.personId = personId;
    if (organizationId) variables.organizationId = organizationId;

    // Status filters
    if (filters.status) variables.status = [filters.status];
    if (filters.priority) variables.priority = [filters.priority];
    if (filters.type) variables.type = [filters.type];
    if (filters.assignedToMe) variables.assignedToMe = true;
    if (filters.search) variables.search = filters.search;

    return variables;
  };

  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: getFilterVariables(),
    fetchPolicy: 'cache-and-network',
  });

  const [completeTask] = useMutation(COMPLETE_TASK, {
    refetchQueries: [{ query: GET_TASKS, variables: getFilterVariables() }],
  });

  const handleCompleteTask = async (taskId: string, notes?: string) => {
    try {
      await completeTask({
        variables: { taskId, notes },
      });
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleTaskCreated = () => {
    refetch();
  };

  const tasks = data?.tasks || [];

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task: any) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.notes?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Sort by due date and priority
  const sortedTasks = [...filteredTasks].sort((a: any, b: any) => {
    // Completed tasks go to the bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;

    // Sort by due date (overdue first, then by date)
    if (a.dueDate && b.dueDate) {
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      const now = new Date();

      const aOverdue = aDate < now && a.status !== 'completed';
      const bOverdue = bDate < now && b.status !== 'completed';

      if (aOverdue && !bOverdue) return -1;
      if (bOverdue && !aOverdue) return 1;

      return aDate.getTime() - bDate.getTime();
    }

    // Tasks with due dates come before those without
    if (a.dueDate && !b.dueDate) return -1;
    if (b.dueDate && !a.dueDate) return 1;

    // Sort by priority
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;

    return bPriority - aPriority;
  });

  const getTaskCounts = () => {
    const counts = {
      total: tasks.length,
      pending: tasks.filter((t: any) => t.status === 'pending').length,
      inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
      completed: tasks.filter((t: any) => t.status === 'completed').length,
      overdue: tasks.filter((t: any) => {
        if (t.status === 'completed' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      }).length,
    };
    return counts;
  };

  const counts = getTaskCounts();

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading tasks: {error.message}
      </Alert>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="lg" p={4}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <VStack align="flex-start" spacing={1}>
          <Text fontSize="lg" fontWeight="semibold">
            Tasks {counts.total > 0 && `(${counts.total})`}
          </Text>
          {counts.total > 0 && (
            <HStack spacing={2}>
              {counts.overdue > 0 && (
                <Badge colorScheme="red" variant="solid">
                  {counts.overdue} overdue
                </Badge>
              )}
              {counts.inProgress > 0 && (
                <Badge colorScheme="blue">
                  {counts.inProgress} in progress
                </Badge>
              )}
              {counts.pending > 0 && (
                <Badge colorScheme="yellow">
                  {counts.pending} pending
                </Badge>
              )}
            </HStack>
          )}
        </VStack>

        <HStack spacing={2}>
          <Tooltip label="Refresh">
            <IconButton
              aria-label="Refresh tasks"
              icon={<FiRefreshCw />}
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              isLoading={loading}
            />
          </Tooltip>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            size="sm"
            onClick={onOpen}
          >
            Add Task
          </Button>
        </HStack>
      </Flex>

      {/* Filters */}
      {showFilters && (
        <VStack spacing={3} mb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </InputGroup>

          <HStack spacing={3} width="100%" wrap="wrap">
            <Select
              placeholder="All statuses"
              size="sm"
              maxW="150px"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="waiting">Waiting</option>
            </Select>

            <Select
              placeholder="All priorities"
              size="sm"
              maxW="150px"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>

            <Select
              placeholder="All types"
              size="sm"
              maxW="150px"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting_prep">Meeting Prep</option>
              <option value="post_meeting">Post-Meeting</option>
              <option value="follow_up">Follow-up</option>
              <option value="deadline">Deadline</option>
              <option value="research">Research</option>
              <option value="admin">Administrative</option>
              <option value="creative">Creative</option>
              <option value="other">Other</option>
            </Select>
          </HStack>
        </VStack>
      )}

      {/* Tasks List */}
      <Box maxHeight={maxHeight} overflowY="auto">
        {loading && (
          <Flex justify="center" p={4}>
            <Spinner />
          </Flex>
        )}

        {!loading && sortedTasks.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500" mb={4}>
              {filters.search || filters.status || filters.priority || filters.type
                ? 'No tasks match your filters'
                : 'No tasks found'}
            </Text>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
              Create Your First Task
            </Button>
          </Box>
        )}

        {!loading && sortedTasks.length > 0 && (
          <VStack spacing={compact ? 2 : 3} align="stretch">
            {sortedTasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                compact={compact}
                onComplete={handleCompleteTask}
                onEdit={(task) => {
                  // TODO: Implement edit functionality
                  console.log('Edit task:', task);
                }}
              />
            ))}
          </VStack>
        )}
      </Box>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleTaskCreated}
        prefilledData={{
          dealId,
          leadId,
          personId,
          organizationId,
        }}
      />
    </Box>
  );
}; 