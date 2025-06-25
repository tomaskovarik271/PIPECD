import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Box,
  Text,
  Switch,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { useUserListStore } from '../../stores/useUserListStore';
import { CREATE_TASK } from '../../lib/graphql/taskOperations';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (task: any) => void;
  prefilledData?: {
    dealId?: string;
    leadId?: string;
    personId?: string;
    organizationId?: string;
    emailThreadId?: string;
    calendarEventId?: string;
    title?: string;
    description?: string;
    type?: string;
    dueDate?: string;
  };
}

interface TaskFormData {
  title: string;
  description: string;
  type: string;
  priority: string;
  dueDate: string;
  dueTime: string;
  estimatedDuration: string;
  assignedToUserId: string;
  notes: string;
  tags: string;
}

const TASK_TYPES = [
  { value: 'call', label: '📞 Call' },
  { value: 'email', label: '📧 Email' },
  { value: 'meeting_prep', label: '🤝 Meeting Preparation' },
  { value: 'post_meeting', label: '📋 Post-Meeting Follow-up' },
  { value: 'follow_up', label: '🔄 Follow-up' },
  { value: 'deadline', label: '⏰ Deadline Task' },
  { value: 'research', label: '🔍 Research' },
  { value: 'admin', label: '📊 Administrative' },
  { value: 'creative', label: '🎨 Creative Work' },
  { value: 'other', label: '📋 Other' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours (full day)' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefilledData,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: 'other',
    priority: 'medium',
    dueDate: '',
    dueTime: '09:00',
    estimatedDuration: '30',
    assignedToUserId: '',
    notes: '',
    tags: '',
  });

  const [assignToMe, setAssignToMe] = useState(false);
  const toast = useToast();

  // User list for assignment
  const { users: userList, loading: usersLoading, fetchUsers, currentUser } = useUserListStore();

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  // Set prefilled data when modal opens
  useEffect(() => {
    if (isOpen && prefilledData) {
      const dueDateTime = prefilledData.dueDate ? new Date(prefilledData.dueDate) : null;
      
      setFormData({
        title: prefilledData.title || '',
        description: prefilledData.description || '',
        type: prefilledData.type || 'other',
        priority: 'medium',
        dueDate: dueDateTime ? dueDateTime.toISOString().split('T')[0] : '',
        dueTime: dueDateTime ? dueDateTime.toTimeString().slice(0, 5) : '09:00',
        estimatedDuration: '30',
        assignedToUserId: '',
        notes: '',
        tags: '',
      });
    }
  }, [isOpen, prefilledData]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Combine date and time for due date
      let dueDateTime = null;
      if (formData.dueDate && formData.dueTime) {
        dueDateTime = `${formData.dueDate}T${formData.dueTime}:00.000Z`;
      }

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const taskInput = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        priority: formData.priority,
        dueDate: dueDateTime,
        estimatedDuration: parseInt(formData.estimatedDuration),
        assignedToUserId: formData.assignedToUserId || null,
        notes: formData.notes.trim() || null,
        tags: tags.length > 0 ? tags : null,
        // Business context from prefilled data
        dealId: prefilledData?.dealId || null,
        leadId: prefilledData?.leadId || null,
        personId: prefilledData?.personId || null,
        organizationId: prefilledData?.organizationId || null,
        emailThreadId: prefilledData?.emailThreadId || null,
        calendarEventId: prefilledData?.calendarEventId || null,
      };

      const { data } = await createTask({
        variables: { input: taskInput },
      });

      toast({
        title: 'Task Created',
        description: 'Your task has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onSuccess && data?.createTask) {
        onSuccess(data.createTask);
      }

      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: 'other',
      priority: 'medium',
      dueDate: '',
      dueTime: '09:00',
      estimatedDuration: '30',
      assignedToUserId: '',
      notes: '',
      tags: '',
    });
    setAssignToMe(false);
    onClose();
  };

  const getBusinessContextDisplay = () => {
    if (!prefilledData) return null;

    const contexts = [];
    if (prefilledData.dealId) contexts.push('Deal');
    if (prefilledData.leadId) contexts.push('Lead');
    if (prefilledData.personId) contexts.push('Person');
    if (prefilledData.organizationId) contexts.push('Organization');
    if (prefilledData.emailThreadId) contexts.push('Email Thread');
    if (prefilledData.calendarEventId) contexts.push('Calendar Event');

    return contexts.length > 0 ? contexts.join(', ') : null;
  };

  const businessContext = getBusinessContextDisplay();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {businessContext && (
              <Box 
                p={3} 
                bg="blue.50" 
                borderRadius="md" 
                borderLeft="4px solid" 
                borderColor="blue.400"
                width="100%"
              >
                <Text fontSize="sm" color="blue.700">
                  <Text as="span" fontWeight="medium">Business Context:</Text> {businessContext}
                </Text>
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel>Task Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What needs to be done?"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the task..."
                rows={3}
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>Task Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {TASK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Due Time</FormLabel>
                <Select
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                >
                  {Array.from({ length: 48 }, (_, i) => {
                    const hours = Math.floor(i / 2);
                    const minutes = (i % 2) * 30;
                    const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    return (
                      <option key={timeValue} value={timeValue}>
                        {timeValue}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Duration</FormLabel>
                <Select
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                >
                  {DURATION_OPTIONS.map(duration => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Assignment</FormLabel>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Assign to me</Text>
                  <Switch
                    isChecked={assignToMe}
                    onChange={(e) => setAssignToMe(e.target.checked)}
                  />
                </HStack>
                
                {!assignToMe && (
                  <>
                    {usersLoading && <Spinner size="sm" />}
                    {!usersLoading && (
                      <Select 
                        placeholder='Leave unassigned'
                        value={formData.assignedToUserId}
                        onChange={(e) => setFormData({ ...formData, assignedToUserId: e.target.value })}
                      >
                        {userList.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                          </option>
                        ))}
                      </Select>
                    )}
                  </>
                )}
              </VStack>
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or context..."
                rows={2}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma-separated tags (e.g., urgent, client-call, follow-up)"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={creating}
            loadingText="Creating..."
          >
            Create Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
