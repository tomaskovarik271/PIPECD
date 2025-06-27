import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  Tag,
  TagLabel,
  TagLeftIcon,
  Select,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Flex,
  Progress,
  Tooltip,
  Collapse,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  SimpleGrid,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  Heading
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
  TimeIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  WarningIcon,
  InfoIcon,
  SettingsIcon,
  SmallCloseIcon
} from '@chakra-ui/icons';
import { FiClock, FiUser, FiFlag, FiCheckCircle } from 'react-icons/fi';
import { FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { useUserListStore } from '../../stores/useUserListStore';
import { useAppStore } from '../../stores/useAppStore';

// GraphQL
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  GET_TASKS_FOR_DEAL,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  COMPLETE_TASK,
  TASK_FRAGMENT
} from '../../graphql/task.operations';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'WAITING_ON_INTERNAL' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  taskType: string;
  assignedToUser?: {
    id: string;
    display_name?: string;
    email: string;
  };
  createdByUser: {
    id: string;
    display_name?: string;
    email: string;
  };
  dueDate?: string;
  completedAt?: string;
  blocksStageProgression: boolean;
  requiredForDealClosure: boolean;
  calculatedPriority: number;
  businessImpactScore: number;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

interface DealTasksPanelProps {
  dealId: string;
  dealName: string;
  onTaskCountChange?: (count: number) => void;
}

const TASK_TYPES = [
  { value: 'DISCOVERY', label: 'Discovery', icon: '🔍' },
  { value: 'DEMO_PREPARATION', label: 'Demo Preparation', icon: '🎭' },
  { value: 'PROPOSAL_CREATION', label: 'Proposal Creation', icon: '📝' },
  { value: 'NEGOTIATION_PREP', label: 'Negotiation Prep', icon: '🤝' },
  { value: 'CONTRACT_REVIEW', label: 'Contract Review', icon: '📋' },
  { value: 'DEAL_CLOSURE', label: 'Deal Closure', icon: '🎯' },
  { value: 'STAKEHOLDER_MAPPING', label: 'Stakeholder Mapping', icon: '👥' },
  { value: 'RELATIONSHIP_BUILDING', label: 'Relationship Building', icon: '🤝' }
];

const STATUS_COLORS = {
  TODO: 'gray',
  IN_PROGRESS: 'blue',
  WAITING_ON_CUSTOMER: 'orange',
  WAITING_ON_INTERNAL: 'yellow',
  COMPLETED: 'green',
  CANCELLED: 'red'
};

const PRIORITY_COLORS = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red'
};

const PRIORITY_ICONS = {
  LOW: '📄',
  MEDIUM: '📊',
  HIGH: '⚡',
  URGENT: '🚨'
};

export const DealTasksPanel: React.FC<DealTasksPanelProps> = ({
  dealId,
  dealName,
  onTaskCountChange
}) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const toast = useToast();
  
  const { users } = useUserListStore();
  const session = useAppStore((state) => state.session);
  const currentUserId = session?.user.id;

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    taskType: 'all'
  });
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState('priority');

  // Create/Edit task modal
  const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    taskType: 'DISCOVERY',
    priority: 'MEDIUM' as Task['priority'],
    assignedToUserId: '',
    dueDate: '',
    estimatedHours: '',
    blocksStageProgression: false,
    requiredForDealClosure: false,
    tags: [] as string[]
  });

  // GraphQL
  const [getTasksForDeal] = useLazyQuery(GET_TASKS_FOR_DEAL, {
    onCompleted: (data) => {
      const dealTasks = data.tasksForDeal || [];
      setTasks(dealTasks);
      
      // Count only active tasks (excluding completed and cancelled)
      const activeTasks = dealTasks.filter(task => 
        task.status !== 'COMPLETED' && task.status !== 'CANCELLED'
      );
      onTaskCountChange?.(activeTasks.length);
      
      setLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error loading tasks',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  });

  const [createTask] = useMutation(CREATE_TASK, {
    onCompleted: (data) => {
      toast({
        title: 'Task created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refreshTasks();
      onTaskModalClose();
      resetTaskForm();
    },
    onError: (error) => {
      toast({
        title: 'Error creating task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    update: (cache, { data }) => {
      if (data?.createTask) {
        // Update the cache for GET_TASKS_FOR_DEAL query
        const cacheId = cache.identify({
          __typename: 'Query',
        });
        cache.modify({
          id: cacheId,
          fields: {
            tasksForDeal(existingTasks = [], { readField }) {
              const newTaskRef = cache.writeFragment({
                data: data.createTask,
                fragment: TASK_FRAGMENT,
              });
              return [...existingTasks, newTaskRef];
            },
          },
        });
        
        // Update task count (refresh to get accurate count)
        refreshTasks();
      }
    },
  });

  const [updateTask] = useMutation(UPDATE_TASK, {
    onCompleted: (data) => {
      toast({
        title: 'Task updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refreshTasks();
      onTaskModalClose();
      resetTaskForm();
    },
    onError: (error) => {
      toast({
        title: 'Error updating task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    update: (cache, { data }) => {
      if (data?.updateTask) {
        // Update the existing task in cache
        cache.writeFragment({
          id: cache.identify(data.updateTask),
          fragment: TASK_FRAGMENT,
          data: data.updateTask,
        });
      }
    },
  });

  const [deleteTask] = useMutation(DELETE_TASK, {
    onCompleted: () => {
      toast({
        title: 'Task deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refreshTasks();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    update: (cache, { data }, { variables }) => {
      if (variables?.id) {
        // Remove the task from cache
        const cacheId = cache.identify({
          __typename: 'Query',
        });
        cache.modify({
          id: cacheId,
          fields: {
            tasksForDeal(existingTasks, { readField }) {
              return existingTasks.filter(
                (taskRef: any) => readField('id', taskRef) !== variables.id
              );
            },
          },
        });
      }
    },
  });

  const [completeTask] = useMutation(COMPLETE_TASK, {
    onCompleted: (data) => {
      toast({
        title: 'Task completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refreshTasks();
    },
    onError: (error) => {
      toast({
        title: 'Error completing task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    update: (cache, { data }) => {
      if (data?.completeTask) {
        // Update the existing task in cache
        cache.writeFragment({
          id: cache.identify(data.completeTask),
          fragment: TASK_FRAGMENT,
          data: data.completeTask,
        });
      }
    },
  });

  // Effects
  useEffect(() => {
    if (dealId) {
      refreshTasks();
    }
  }, [dealId]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filter, showCompleted, sortBy]);

  // Update task count whenever tasks change
  useEffect(() => {
    const activeTaskCount = calculateActiveTaskCount(tasks);
    onTaskCountChange?.(activeTaskCount);
  }, [tasks, onTaskCountChange]);

  // Helper functions
  const refreshTasks = () => {
    getTasksForDeal({
      variables: { dealId }
    });
  };

  const calculateActiveTaskCount = (taskList: Task[]) => {
    return taskList.filter(task => 
      task.status !== 'COMPLETED' && task.status !== 'CANCELLED'
    ).length;
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      taskType: 'DISCOVERY',
      priority: 'MEDIUM',
      assignedToUserId: '',
      dueDate: '',
      estimatedHours: '',
      blocksStageProgression: false,
      requiredForDealClosure: false,
      tags: []
    });
    setEditingTask(null);
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'COMPLETED' && task.status !== 'CANCELLED');
    }

    // Apply other filters
    if (filter.status !== 'all') {
      filtered = filtered.filter(task => task.status === filter.status);
    }

    if (filter.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }

    if (filter.assignee !== 'all') {
      if (filter.assignee === 'me') {
        filtered = filtered.filter(task => task.assignedToUser?.id === currentUserId);
      } else if (filter.assignee === 'unassigned') {
        filtered = filtered.filter(task => !task.assignedToUser);
      } else {
        filtered = filtered.filter(task => task.assignedToUser?.id === filter.assignee);
      }
    }

    if (filter.taskType !== 'all') {
      filtered = filtered.filter(task => task.taskType === filter.taskType);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.calculatedPriority - a.calculatedPriority;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    resetTaskForm();
    onTaskModalOpen();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      taskType: task.taskType,
      priority: task.priority,
      assignedToUserId: task.assignedToUser?.id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task.estimatedHours?.toString() || '',
      blocksStageProgression: task.blocksStageProgression,
      requiredForDealClosure: task.requiredForDealClosure,
      tags: task.tags
    });
    onTaskModalOpen();
  };

  const handleSubmitTask = async () => {
    if (!taskForm.title.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editingTask) {
      // Update existing task - use UpdateTaskInput (no entity context fields)
      const updateInput = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        taskType: taskForm.taskType,
        priority: taskForm.priority,
        assignedToUserId: taskForm.assignedToUserId || undefined,
        dueDate: taskForm.dueDate || undefined,
        estimatedHours: taskForm.estimatedHours ? parseInt(taskForm.estimatedHours) : undefined,
        blocksStageProgression: taskForm.blocksStageProgression,
        requiredForDealClosure: taskForm.requiredForDealClosure,
        tags: taskForm.tags.filter(tag => tag.trim())
      };

      await updateTask({
        variables: {
          id: editingTask.id,
          input: updateInput
        }
      });
    } else {
      // Create new task - use CreateTaskInput (includes entity context fields)
      const createInput = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        taskType: taskForm.taskType,
        priority: taskForm.priority,
        entityType: 'DEAL',
        entityId: dealId,
        dealId: dealId,
        assignedToUserId: taskForm.assignedToUserId || undefined,
        dueDate: taskForm.dueDate || undefined,
        estimatedHours: taskForm.estimatedHours ? parseInt(taskForm.estimatedHours) : undefined,
        blocksStageProgression: taskForm.blocksStageProgression,
        requiredForDealClosure: taskForm.requiredForDealClosure,
        tags: taskForm.tags.filter(tag => tag.trim())
      };

      await createTask({
        variables: {
          input: createInput
        }
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask({
        variables: { id: taskId }
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask({
      variables: {
        id: taskId,
        completionData: {
          completedAt: new Date().toISOString()
        }
      }
    });
  };

  const handleQuickStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    await updateTask({
      variables: {
        id: taskId,
        input: { status: newStatus }
      }
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days overdue`;
  };

  const getTaskTypeInfo = (taskType: string) => {
    return TASK_TYPES.find(type => type.value === taskType) || { value: taskType, label: taskType, icon: '📋' };
  };

  // Stats
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const overdue = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'COMPLETED').length;
    const blocking = tasks.filter(t => t.blocksStageProgression && t.status !== 'COMPLETED').length;
    
    return { total, completed, overdue, blocking };
  }, [tasks]);

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" color={colors.interactive.default} />
      </Center>
    );
  }

  return (
    <Box w="100%" maxW="100%">
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="md" color={colors.text.primary}>
            Deal Tasks
          </Heading>
          <HStack spacing={4}>
            <Text fontSize="sm" color={colors.text.secondary}>
              {taskStats.total} total • {taskStats.completed} completed
            </Text>
            {taskStats.overdue > 0 && (
              <Badge colorScheme="red" variant="subtle">
                {taskStats.overdue} overdue
              </Badge>
            )}
            {taskStats.blocking > 0 && (
              <Badge colorScheme="orange" variant="subtle">
                {taskStats.blocking} blocking
              </Badge>
            )}
          </HStack>
        </VStack>
        
        <Button
          leftIcon={<AddIcon />}
          onClick={handleCreateTask}
          {...styles.button.primary}
          size="sm"
        >
          Add Task
        </Button>
      </Flex>

      {/* Progress Bar */}
      {taskStats.total > 0 && (
        <Box mb={6}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color={colors.text.secondary}>
              Progress
            </Text>
            <Text fontSize="sm" color={colors.text.secondary}>
              {Math.round((taskStats.completed / taskStats.total) * 100)}%
            </Text>
          </HStack>
          <Progress
            value={(taskStats.completed / taskStats.total) * 100}
            colorScheme="green"
            size="sm"
            borderRadius="md"
          />
        </Box>
      )}

      {/* Filters */}
      <Box
        p={4}
        bg={colors.bg.elevated}
        borderRadius="lg"
        border="1px solid"
        borderColor={colors.border.default}
        mb={6}
      >
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
          <FormControl>
            <FormLabel fontSize="sm">Status</FormLabel>
            <Select
              size="sm"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
              <option value="WAITING_ON_INTERNAL">Waiting on Internal</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Priority</FormLabel>
            <Select
              size="sm"
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            >
              <option value="all">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Assignee</FormLabel>
            <Select
              size="sm"
              value={filter.assignee}
              onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
            >
              <option value="all">All Assignees</option>
              <option value="me">My Tasks</option>
              <option value="unassigned">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Sort By</FormLabel>
            <Select
              size="sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="status">Status</option>
              <option value="created">Created Date</option>
            </Select>
          </FormControl>
        </SimpleGrid>

        <HStack spacing={4}>
          <Checkbox
            isChecked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          >
            Show completed tasks
          </Checkbox>
        </HStack>
      </Box>

      {/* Tasks List */}
      <VStack spacing={3} align="stretch">
        {filteredTasks.length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            bg={colors.bg.elevated}
            borderRadius="lg"
            border="1px solid"
            borderColor={colors.border.default}
          >
            <Icon as={FaClipboardList} w={8} h={8} color={colors.text.secondary} mb={4} />
            <Text color={colors.text.secondary} fontSize="lg" mb={2}>
              No tasks found
            </Text>
            <Text color={colors.text.tertiary} fontSize="sm" mb={4}>
              {tasks.length === 0 
                ? `Create your first task for ${dealName}`
                : 'Try adjusting your filters'
              }
            </Text>
            {tasks.length === 0 && (
              <Button
                leftIcon={<AddIcon />}
                onClick={handleCreateTask}
                {...styles.button.primary}
                size="sm"
              >
                Create First Task
              </Button>
            )}
          </Box>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
              onStatusUpdate={handleQuickStatusUpdate}
              users={users}
              colors={colors}
              styles={styles}
              isOverdue={isOverdue}
              formatDueDate={formatDueDate}
              getTaskTypeInfo={getTaskTypeInfo}
            />
          ))
        )}
      </VStack>

      {/* Create/Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={onTaskModalClose}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        editingTask={editingTask}
        onSubmit={handleSubmitTask}
        users={users}
        colors={colors}
        styles={styles}
      />
    </Box>
  );
};

// TaskCard Component
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: Task['status']) => void;
  users: Array<{ id: string; display_name?: string; email: string }>;
  colors: any;
  styles: any;
  isOverdue: (date?: string) => boolean;
  formatDueDate: (date?: string) => string | null;
  getTaskTypeInfo: (taskType: string) => any;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onComplete,
  onStatusUpdate,
  users,
  colors,
  styles,
  isOverdue,
  formatDueDate,
  getTaskTypeInfo
}) => {
  const [expanded, setExpanded] = useState(false);
  const taskTypeInfo = getTaskTypeInfo(task.taskType);
  const assignedUser = users.find(user => user.id === task.assignedToUser?.id);
  const dueDisplay = formatDueDate(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  return (
    <Box
      p={4}
      bg={colors.component.kanban.card}
      borderRadius="lg"
      border="1px solid"
      borderColor={task.blocksStageProgression ? colors.status.warning : colors.border.default}
      boxShadow={task.requiredForDealClosure ? 'lg' : 'sm'}
      position="relative"
      _hover={{
        borderColor: colors.interactive.hover,
        boxShadow: 'md'
      }}
    >
      {/* Critical task indicator */}
      {task.requiredForDealClosure && (
        <Box
          position="absolute"
          top="-1px"
          left="-1px"
          right="-1px"
          height="3px"
          bg="linear-gradient(90deg, red.400, orange.400, red.400)"
          borderTopRadius="lg"
        />
      )}

      <VStack spacing={3} align="stretch">
        {/* Header Row */}
        <Flex justify="space-between" align="start">
          <VStack align="start" spacing={2} flex="1" mr={4}>
            <HStack spacing={3} align="center">
              <Badge
                colorScheme={STATUS_COLORS[task.status]}
                variant="subtle"
                fontSize="xs"
              >
                {task.status.replace('_', ' ')}
              </Badge>
              
              <Badge
                colorScheme={PRIORITY_COLORS[task.priority]}
                variant="outline"
                fontSize="xs"
              >
                {PRIORITY_ICONS[task.priority]} {task.priority}
              </Badge>

              <Tag size="sm" colorScheme="purple" variant="subtle">
                <TagLeftIcon as={() => <Text>{taskTypeInfo.icon}</Text>} />
                <TagLabel>{taskTypeInfo.label}</TagLabel>
              </Tag>
            </HStack>

            <Text
              fontWeight="semibold"
              color={colors.text.primary}
              fontSize="md"
              lineHeight="1.2"
            >
              {task.title}
            </Text>

            <HStack spacing={4} flexWrap="wrap">
              {task.assignedToUser && (
                <HStack spacing={1}>
                  <Icon as={FiUser} w={3} h={3} color={colors.text.secondary} />
                  <Text fontSize="xs" color={colors.text.secondary}>
                    {assignedUser?.display_name || task.assignedToUser.email}
                  </Text>
                </HStack>
              )}

              {task.dueDate && (
                <HStack spacing={1}>
                  <Icon as={FiClock} w={3} h={3} color={overdue ? colors.status.error : colors.text.secondary} />
                  <Text
                    fontSize="xs"
                    color={overdue ? colors.status.error : colors.text.secondary}
                    fontWeight={overdue ? 'semibold' : 'normal'}
                  >
                    {dueDisplay}
                  </Text>
                </HStack>
              )}

              {task.estimatedHours && (
                <HStack spacing={1}>
                  <Icon as={TimeIcon} w={3} h={3} color={colors.text.secondary} />
                  <Text fontSize="xs" color={colors.text.secondary}>
                    {task.estimatedHours}h estimated
                  </Text>
                </HStack>
              )}
            </HStack>

            {/* Important indicators */}
            <HStack spacing={2}>
              {task.blocksStageProgression && (
                <Tag size="sm" colorScheme="orange" variant="solid">
                  <TagLeftIcon as={WarningIcon} />
                  <TagLabel>Blocks Progress</TagLabel>
                </Tag>
              )}
              
              {task.requiredForDealClosure && (
                <Tag size="sm" colorScheme="red" variant="solid">
                  <TagLeftIcon as={FaExclamationTriangle} />
                  <TagLabel>Required for Closure</TagLabel>
                </Tag>
              )}
            </HStack>
          </VStack>

          {/* Actions */}
          <HStack spacing={1}>
            {task.status !== 'COMPLETED' && (
              <Tooltip label="Mark Complete">
                <IconButton
                  icon={<CheckIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="green"
                  onClick={() => onComplete(task.id)}
                  aria-label="Complete task"
                />
              </Tooltip>
            )}

            <Menu>
              <MenuButton
                as={IconButton}
                icon={<SettingsIcon />}
                size="sm"
                variant="ghost"
                aria-label="Task actions"
              />
              <MenuList>
                <MenuItem onClick={() => onEdit(task)}>
                  <EditIcon mr={2} /> Edit
                </MenuItem>
                <MenuItem onClick={() => onStatusUpdate(task.id, 'IN_PROGRESS')}>
                  Start Task
                </MenuItem>
                <MenuItem onClick={() => onStatusUpdate(task.id, 'WAITING_ON_CUSTOMER')}>
                  Wait for Customer
                </MenuItem>
                <MenuItem onClick={() => onStatusUpdate(task.id, 'WAITING_ON_INTERNAL')}>
                  Wait for Internal
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => onDelete(task.id)} color="red.500">
                  <DeleteIcon mr={2} /> Delete
                </MenuItem>
              </MenuList>
            </Menu>

            <IconButton
              icon={expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse" : "Expand"}
            />
          </HStack>
        </Flex>

        {/* Expanded Content */}
        <Collapse in={expanded} animateOpacity>
          <VStack spacing={3} align="stretch" pt={2} borderTop="1px solid" borderColor={colors.border.subtle}>
            {task.description && (
              <Box>
                <Text fontSize="sm" color={colors.text.secondary} mb={1} fontWeight="medium">
                  Description
                </Text>
                <Text fontSize="sm" color={colors.text.primary} lineHeight="1.4">
                  {task.description}
                </Text>
              </Box>
            )}

            {task.tags.length > 0 && (
              <Box>
                <Text fontSize="sm" color={colors.text.secondary} mb={2} fontWeight="medium">
                  Tags
                </Text>
                <HStack spacing={1} flexWrap="wrap">
                  {task.tags.map((tag, index) => (
                    <Tag key={index} size="sm" colorScheme="blue" variant="subtle">
                      {tag}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}

            <HStack justify="space-between" fontSize="xs" color={colors.text.tertiary}>
              <Text>
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </Text>
              <Text>
                Priority Score: {task.calculatedPriority.toFixed(1)}
              </Text>
            </HStack>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

// TaskModal Component
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskForm: any;
  setTaskForm: (form: any) => void;
  editingTask: Task | null;
  onSubmit: () => void;
  users: Array<{ id: string; display_name?: string; email: string }>;
  colors: any;
  styles: any;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskForm,
  setTaskForm,
  editingTask,
  onSubmit,
  users,
  colors,
  styles
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !taskForm.tags.includes(tagInput.trim())) {
      setTaskForm({
        ...taskForm,
        tags: [...taskForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTaskForm({
      ...taskForm,
      tags: taskForm.tags.filter((tag: string) => tag !== tagToRemove)
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={colors.bg.surface}>
        <ModalHeader color={colors.text.primary}>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter task description..."
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Task Type</FormLabel>
                <Select
                  value={taskForm.taskType}
                  onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                >
                  {TASK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Assign To</FormLabel>
                <Select
                  value={taskForm.assignedToUserId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.email}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Estimated Hours</FormLabel>
              <NumberInput
                value={taskForm.estimatedHours}
                onChange={(value) => setTaskForm({ ...taskForm, estimatedHours: value })}
                min={0}
                max={999}
              >
                <NumberInputField placeholder="0" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <VStack spacing={3} align="stretch">
              <FormControl>
                <HStack>
                  <Switch
                    isChecked={taskForm.blocksStageProgression}
                    onChange={(e) => setTaskForm({ ...taskForm, blocksStageProgression: e.target.checked })}
                    isDisabled={true}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.muted}>
                      Blocks Stage Progression (Not yet implemented)
                    </Text>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      Deal cannot advance to next stage until this task is completed
                    </Text>
                  </VStack>
                </HStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={taskForm.requiredForDealClosure}
                    onChange={(e) => setTaskForm({ ...taskForm, requiredForDealClosure: e.target.checked })}
                    isDisabled={true}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium" color={colors.text.muted}>
                      Required for Deal Closure (Not yet implemented)
                    </Text>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      This task must be completed before the deal can be closed
                    </Text>
                  </VStack>
                </HStack>
              </FormControl>
            </VStack>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <HStack spacing={2} mb={2}>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  size="sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </HStack>
              <HStack spacing={1} flexWrap="wrap">
                {taskForm.tags.map((tag: string, index: number) => (
                  <Tag key={index} size="sm" colorScheme="blue" variant="solid">
                    <TagLabel>{tag}</TagLabel>
                    <IconButton
                      icon={<SmallCloseIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove ${tag} tag`}
                      ml={1}
                    />
                  </Tag>
                ))}
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button {...styles.button.primary} onClick={onSubmit}>
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DealTasksPanel; 