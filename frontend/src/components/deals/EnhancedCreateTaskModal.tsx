import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
  RadioGroup,
  Radio,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { FiZap, FiEdit } from 'react-icons/fi';
import { useMutation, gql } from '@apollo/client';
import { useUserListStore } from '../../stores/useUserListStore';

const GENERATE_TASK_CONTENT = gql`
  mutation GenerateTaskContentFromEmail($input: GenerateTaskContentInput!) {
    generateTaskContentFromEmail(input: $input) {
      subject
      description
      suggestedDueDate
      confidence
      emailScope
      sourceContent
    }
  }
`;

interface TaskData {
  subject: string;
  description: string;
  dueDate: string;
  useWholeThread: boolean;
  threadId: string | null;
  assigneeId: string;
}

interface AIGeneratedTaskContent {
  subject: string;
  description: string;
  suggestedDueDate?: string;
  confidence?: number;
  emailScope: string;
  sourceContent: string;
}

interface EnhancedCreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (data: TaskData) => void;
  selectedEmailId: string | null;
  selectedThreadId: string | null;
}

const EnhancedCreateTaskModal: React.FC<EnhancedCreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  selectedEmailId,
  selectedThreadId,
}) => {
  const [step, setStep] = useState<'configure' | 'confirm'>('configure');
  const [useWholeThread, setUseWholeThread] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedTaskContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    dueDate: '',
    assigneeId: '',
  });

  // User list for assignment
  const { users: userList, loading: usersLoading, fetchUsers } = useUserListStore();

  const [generateTaskContent] = useMutation(GENERATE_TASK_CONTENT);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const handleGenerateContent = async () => {
    if (!selectedEmailId) return;
    
    setIsGenerating(true);
    try {
      const { data } = await generateTaskContent({
        variables: {
          input: {
            emailId: selectedEmailId,
            threadId: selectedThreadId,
            useWholeThread: useWholeThread,
          },
        },
      });
      
      setGeneratedContent(data.generateTaskContentFromEmail);
      setStep('confirm');
    } catch (error) {
      console.error('Error generating task content:', error);
      // Fallback to manual creation
      setStep('confirm');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmTask = () => {
    const taskData = {
      subject: formData.subject || generatedContent?.subject || '',
      description: formData.description || generatedContent?.description || '',
      dueDate: formData.dueDate || generatedContent?.suggestedDueDate || '',
      useWholeThread,
      threadId: selectedThreadId,
      assigneeId: formData.assigneeId,
    };
    onCreateTask(taskData);
    handleClose();
  };

  const handleClose = () => {
    setStep('configure');
    setGeneratedContent(null);
    setFormData({ subject: '', description: '', dueDate: '', assigneeId: '' });
    setUseWholeThread(false);
    onClose();
  };

  const handleBack = () => {
    setStep('configure');
    setGeneratedContent(null);
  };

  if (step === 'configure') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configure Task Creation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box 
                p={3} 
                bg="blue.50" 
                borderRadius="md" 
                borderLeft="4px solid" 
                borderColor="blue.400"
              >
                <Text fontSize="sm" color="blue.700">
                  🤖 <strong>AI-Powered Task Creation:</strong> Choose your email scope and let Claude 3 Haiku generate intelligent task content, or create manually.
                </Text>
              </Box>

              <FormControl>
                <FormLabel>Email Scope</FormLabel>
                <RadioGroup 
                  value={useWholeThread ? 'thread' : 'message'} 
                  onChange={(value) => setUseWholeThread(value === 'thread')}
                >
                  <VStack align="start" spacing={2}>
                    <Radio value="message">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Single Message</Text>
                        <Text fontSize="sm" color="gray.600">
                          Analyze only the selected email message
                        </Text>
                      </VStack>
                    </Radio>
                    <Radio value="thread" isDisabled={!selectedThreadId}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Entire Thread</Text>
                        <Text fontSize="sm" color="gray.600">
                          Analyze the complete email conversation for better context
                        </Text>
                      </VStack>
                    </Radio>
                  </VStack>
                </RadioGroup>
              </FormControl>

              <Divider />

              <Text fontWeight="medium" color="gray.700">
                Choose how to create your task:
              </Text>

              <HStack spacing={4} width="100%">
                <Button
                  flex={1}
                  colorScheme="blue"
                  variant="outline"
                  onClick={handleGenerateContent}
                  isLoading={isGenerating}
                  loadingText="Generating..."
                  leftIcon={<Icon as={FiZap} />}
                >
                  Generate with AI
                </Button>
                <Button
                  flex={1}
                  variant="outline"
                  onClick={() => setStep('confirm')}
                  leftIcon={<Icon as={FiEdit} />}
                >
                  Create Manually
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {generatedContent ? 'Review AI-Generated Task' : 'Create Task from Email'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {generatedContent && (
              <Box 
                p={3} 
                bg="green.50" 
                borderRadius="md" 
                borderLeft="4px solid" 
                borderColor="green.400"
                width="100%"
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium" color="green.700">
                    ✨ AI-Generated Content ({generatedContent.emailScope})
                  </Text>
                  <Badge colorScheme="green" variant="subtle">
                    {Math.round(generatedContent.confidence * 100)}% confidence
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="green.600">
                  Review and edit the generated content below, or use as-is.
                </Text>
              </Box>
            )}
            
            <FormControl>
              <FormLabel>Task Subject</FormLabel>
              <Input
                value={formData.subject || generatedContent?.subject || ''}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter task subject"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description || generatedContent?.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={6}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Due Date</FormLabel>
              <Box 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor="inherit"
                bg="inherit"
                _hover={{ borderColor: "gray.300" }}
                _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                transition="all 0.2s"
              >
                <HStack spacing={0} divider={<Box w="1px" h="6" bg="gray.200" />}>
                  <Box flex={1}>
                    <Input
                      type="date"
                      border="none"
                      _focus={{ boxShadow: "none" }}
                      placeholder="Select date"
                      value={(() => {
                        const dateValue = formData.dueDate || generatedContent?.suggestedDueDate || '';
                        return dateValue ? dateValue.split('T')[0] : '';
                      })()}
                      onChange={(e) => {
                        const currentValue = formData.dueDate || generatedContent?.suggestedDueDate || '';
                        const timeValue = currentValue && currentValue.includes('T') ? currentValue.split('T')[1] : '09:00';
                        const newDateTime = e.target.value ? `${e.target.value}T${timeValue}` : '';
                        setFormData({ ...formData, dueDate: newDateTime });
                      }}
                    />
                  </Box>
                  <Box flex={0} minW="120px">
                    <Select
                      placeholder="Time"
                      border="none"
                      _focus={{ boxShadow: "none" }}
                      value={(() => {
                        const dateValue = formData.dueDate || generatedContent?.suggestedDueDate || '';
                        return dateValue && dateValue.includes('T') ? dateValue.split('T')[1]?.substring(0, 5) : '';
                      })()}
                      onChange={(e) => {
                        const currentValue = formData.dueDate || generatedContent?.suggestedDueDate || '';
                        const dateValue = currentValue && currentValue.includes('T') ? currentValue.split('T')[0] : new Date().toISOString().split('T')[0];
                        const newDateTime = dateValue && e.target.value ? `${dateValue}T${e.target.value}` : '';
                        setFormData({ ...formData, dueDate: newDateTime });
                      }}
                    >
                      {Array.from({ length: 96 }, (_, i) => {
                        const hours = Math.floor(i / 4);
                        const minutes = (i % 4) * 15;
                        const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        const displayValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        return (
                          <option key={timeValue} value={timeValue}>
                            {displayValue}
                          </option>
                        );
                      })}
                    </Select>
                  </Box>
                </HStack>
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Assign To</FormLabel>
              {usersLoading && <Spinner size="sm" />}
              {!usersLoading && (
                <Select 
                  placeholder='Unassigned'
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                >
                  {userList.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.email}
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>

            {generatedContent && (
              <Accordion allowToggle width="100%">
                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" color="gray.600">
                        View Source Email Content
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <Box 
                      p={3} 
                      bg="gray.50" 
                      borderRadius="md" 
                      maxH="200px" 
                      overflowY="auto"
                    >
                      <Text fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap">
                        {generatedContent.sourceContent}
                      </Text>
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          {generatedContent && (
            <Button variant="ghost" mr={3} onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleConfirmTask}>
            Create Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnhancedCreateTaskModal; 