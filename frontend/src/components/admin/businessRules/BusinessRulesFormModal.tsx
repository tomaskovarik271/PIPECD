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
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  IconButton,
  Divider,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  useToast,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  InfoIcon,
  CheckIcon,
  WarningIcon 
} from '@chakra-ui/icons';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface BusinessRuleCondition {
  field: string;
  operator: string;
  value: string;
  logicalOperator: 'AND' | 'OR';
}

interface BusinessRuleAction {
  type: string;
  target?: string;
  template?: string;
  message?: string;
  priority: number;
  metadata?: any;
}

interface BusinessRuleFormData {
  name: string;
  description?: string;
  entityType: string;
  triggerType: string;
  triggerEvents?: string[];
  triggerFields?: string[];
  conditions: BusinessRuleCondition[];
  actions: BusinessRuleAction[];
  status: string;
  wfmWorkflowId?: string;
  wfmStepId?: string;
  wfmStatusId?: string;
}

interface BusinessRulesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessRuleFormData) => Promise<void>;
  initialValues?: any;
  isEditing?: boolean;
}

const ENTITY_TYPES = [
  { value: 'DEAL', label: 'Deal' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'PERSON', label: 'Person' },
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'TASK', label: 'Task' },
  { value: 'ACTIVITY', label: 'Activity' },
];

const TRIGGER_TYPES = [
  { value: 'EVENT_BASED', label: 'Event Based' },
  { value: 'FIELD_CHANGE', label: 'Field Change' },
  { value: 'TIME_BASED', label: 'Time Based (Future)' },
];

const OPERATORS = [
  { value: 'EQUALS', label: 'Equals' },
  { value: 'NOT_EQUALS', label: 'Not Equals' },
  { value: 'GREATER_THAN', label: 'Greater Than' },
  { value: 'LESS_THAN', label: 'Less Than' },
  { value: 'GREATER_THAN_OR_EQUAL', label: 'Greater Than or Equal' },
  { value: 'LESS_THAN_OR_EQUAL', label: 'Less Than or Equal' },
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'NOT_CONTAINS', label: 'Does Not Contain' },
  { value: 'STARTS_WITH', label: 'Starts With' },
  { value: 'ENDS_WITH', label: 'Ends With' },
  { value: 'IS_EMPTY', label: 'Is Empty' },
  { value: 'IS_NOT_EMPTY', label: 'Is Not Empty' },
  { value: 'IN', label: 'In List' },
  { value: 'NOT_IN', label: 'Not In List' },
  { value: 'REGEX_MATCH', label: 'Regex Match' },
];

const ACTION_TYPES = [
  { value: 'NOTIFY_USER', label: 'Notify User' },
  { value: 'SEND_EMAIL', label: 'Send Email' },
  { value: 'CREATE_TASK', label: 'Create Task' },
  { value: 'CREATE_ACTIVITY', label: 'Create Activity' },
  { value: 'UPDATE_FIELD', label: 'Update Field' },
  { value: 'ASSIGN_USER', label: 'Assign User' },
  { value: 'CHANGE_STAGE', label: 'Change Stage' },
  { value: 'ADD_TAG', label: 'Add Tag' },
  { value: 'WEBHOOK', label: 'Webhook (Future)' },
];

const TRIGGER_EVENTS = {
  DEAL: [
    { value: 'DEAL_CREATED', label: 'Deal Created' },
    { value: 'DEAL_UPDATED', label: 'Deal Updated' },
    { value: 'DEAL_ASSIGNED', label: 'Deal Assigned' },
    { value: 'DEAL_WFM_STATUS_CHANGED', label: 'Deal Stage Changed' },
    { value: 'DEAL_AMOUNT_CHANGED', label: 'Deal Amount Changed' },
    { value: 'DEAL_CLOSED', label: 'Deal Closed' },
  ],
  LEAD: [
    { value: 'LEAD_CREATED', label: 'Lead Created' },
    { value: 'LEAD_UPDATED', label: 'Lead Updated' },
    { value: 'LEAD_ASSIGNED', label: 'Lead Assigned' },
    { value: 'LEAD_WFM_STATUS_CHANGED', label: 'Lead Stage Changed' },
    { value: 'LEAD_CONVERTED', label: 'Lead Converted' },
  ],
  PERSON: [
    { value: 'PERSON_CREATED', label: 'Person Created' },
    { value: 'PERSON_UPDATED', label: 'Person Updated' },
  ],
  ORGANIZATION: [
    { value: 'ORGANIZATION_CREATED', label: 'Organization Created' },
    { value: 'ORGANIZATION_UPDATED', label: 'Organization Updated' },
  ],
  TASK: [
    { value: 'TASK_CREATED', label: 'Task Created' },
    { value: 'TASK_UPDATED', label: 'Task Updated' },
    { value: 'TASK_COMPLETED', label: 'Task Completed' },
    { value: 'TASK_OVERDUE', label: 'Task Overdue' },
  ],
  ACTIVITY: [
    { value: 'ACTIVITY_CREATED', label: 'Activity Created' },
    { value: 'ACTIVITY_UPDATED', label: 'Activity Updated' },
    { value: 'ACTIVITY_COMPLETED', label: 'Activity Completed' },
  ],
};

const COMMON_FIELDS = {
  DEAL: ['name', 'amount', 'currency', 'expected_close_date', 'deal_specific_probability', 'assigned_to_user_id', 'user_id', 'organization_id', 'person_id', 'project_id', 'wfm_project_id', 'created_at', 'updated_at'],
  LEAD: ['contact_name', 'contact_email', 'contact_phone', 'estimated_value', 'estimated_close_date', 'lead_score', 'source', 'status', 'assigned_to_user_id', 'user_id', 'organization_id', 'created_at', 'updated_at'],
  PERSON: ['first_name', 'last_name', 'email', 'phone', 'organization_id', 'user_id', 'created_at', 'updated_at'],
  ORGANIZATION: ['name', 'industry', 'website', 'account_manager_id', 'user_id', 'created_at', 'updated_at'],
  TASK: ['title', 'description', 'status', 'priority', 'due_date', 'assigned_to_user_id', 'user_id', 'created_at', 'updated_at'],
  ACTIVITY: ['subject', 'type', 'status', 'due_date', 'assigned_to_user_id', 'user_id', 'created_at', 'updated_at'],
};

export const BusinessRulesFormModal: React.FC<BusinessRulesFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEditing = false,
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<BusinessRuleFormData>({
    defaultValues: {
      name: '',
      description: '',
      entityType: 'DEAL',
      triggerType: 'EVENT_BASED',
      triggerFields: [],
      conditions: [{ field: '', operator: 'EQUALS', value: '', logicalOperator: 'AND' }],
      actions: [{ type: 'NOTIFY_USER', target: '', message: '', priority: 1 }],
      status: 'ACTIVE',
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: 'conditions',
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: 'actions',
  });

  const watchedEntityType = watch('entityType');
  const watchedTriggerType = watch('triggerType');

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        description: initialValues.description || '',
        entityType: initialValues.entityType || 'DEAL',
        triggerType: initialValues.triggerType || 'EVENT_BASED',
        triggerFields: initialValues.triggerFields || [],
        conditions: initialValues.conditions && Array.isArray(initialValues.conditions) 
          ? initialValues.conditions 
          : [{ field: '', operator: 'EQUALS', value: '', logicalOperator: 'AND' }],
        actions: initialValues.actions && Array.isArray(initialValues.actions) 
          ? initialValues.actions 
          : [{ type: 'NOTIFY_USER', target: '', message: '', priority: 1 }],
        status: initialValues.status || 'ACTIVE',
        wfmWorkflowId: initialValues.wfmWorkflowId || '',
        wfmStepId: initialValues.wfmStepId || '',
        wfmStatusId: initialValues.wfmStatusId || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        entityType: 'DEAL',
        triggerType: 'EVENT_BASED',
        triggerFields: [],
        conditions: [{ field: '', operator: 'EQUALS', value: '', logicalOperator: 'AND' }],
        actions: [{ type: 'NOTIFY_USER', target: '', message: '', priority: 1 }],
        status: 'ACTIVE',
      });
    }
  }, [initialValues, reset]);

  const onFormSubmit = async (data: BusinessRuleFormData) => {
    setIsSubmitting(true);
    try {
      // Validate conditions
      if (data.conditions.length === 0 || data.conditions.some(c => !c.field || !c.operator)) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one valid condition.',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Validate actions
      if (data.actions.length === 0 || data.actions.some(a => !a.type)) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one valid action.',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCondition = () => {
    appendCondition({ field: '', operator: 'EQUALS', value: '', logicalOperator: 'AND' });
  };

  const addAction = () => {
    appendAction({ type: 'NOTIFY_USER', target: '', message: '', priority: 1 });
  };

  const getFieldsForEntity = (entityType: string) => {
    return COMMON_FIELDS[entityType as keyof typeof COMMON_FIELDS] || [];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent bg={colors.bg.surface} borderColor={colors.border.default}>
        <ModalHeader color={colors.text.primary}>
          {isEditing ? 'Edit Business Rule' : 'Create Business Rule'}
        </ModalHeader>
        <ModalCloseButton color={colors.text.secondary} />
        
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" color={colors.text.primary} mb={4}>
                  Basic Information
                </Text>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.name}>
                    <FormLabel color={colors.text.primary}>Rule Name</FormLabel>
                    <Input
                      {...register('name', { required: 'Rule name is required' })}
                      placeholder="e.g., High Value Deal Notification"
                      bg={colors.bg.input}
                      borderColor={colors.border.input}
                      color={colors.text.primary}
                      _hover={{ borderColor: colors.border.emphasis }}
                      _focus={{ borderColor: colors.border.focus }}
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={colors.text.primary}>Description</FormLabel>
                    <Textarea
                      {...register('description')}
                      placeholder="Describe what this rule does..."
                      bg={colors.bg.input}
                      borderColor={colors.border.input}
                      color={colors.text.primary}
                      _hover={{ borderColor: colors.border.emphasis }}
                      _focus={{ borderColor: colors.border.focus }}
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl isInvalid={!!errors.entityType}>
                      <FormLabel color={colors.text.primary}>Entity Type</FormLabel>
                      <Select
                        {...register('entityType', { required: 'Entity type is required' })}
                        bg={colors.bg.input}
                        borderColor={colors.border.input}
                        color={colors.text.primary}
                        _hover={{ borderColor: colors.border.emphasis }}
                        _focus={{ borderColor: colors.border.focus }}
                      >
                        {ENTITY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.entityType?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.triggerType}>
                      <FormLabel color={colors.text.primary}>Trigger Type</FormLabel>
                      <Select
                        {...register('triggerType', { required: 'Trigger type is required' })}
                        bg={colors.bg.input}
                        borderColor={colors.border.input}
                        color={colors.text.primary}
                        _hover={{ borderColor: colors.border.emphasis }}
                        _focus={{ borderColor: colors.border.focus }}
                      >
                        {TRIGGER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{errors.triggerType?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={colors.text.primary}>Status</FormLabel>
                      <Select
                        {...register('status')}
                        bg={colors.bg.input}
                        borderColor={colors.border.input}
                        color={colors.text.primary}
                        _hover={{ borderColor: colors.border.emphasis }}
                        _focus={{ borderColor: colors.border.focus }}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </Select>
                    </FormControl>
                  </HStack>
                </VStack>
              </Box>

              <Divider borderColor={colors.border.default} />

              {/* Trigger Events */}
              {watchedTriggerType === 'EVENT_BASED' && (
                <>
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color={colors.text.primary} mb={4}>
                      Trigger Events
                    </Text>
                    <FormControl>
                      <FormLabel color={colors.text.primary}>
                        Select which events should trigger this rule
                      </FormLabel>
                      <VStack align="stretch" spacing={2}>
                        {TRIGGER_EVENTS[watchedEntityType as keyof typeof TRIGGER_EVENTS]?.map((event) => (
                          <Controller
                            key={event.value}
                            name="triggerEvents"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                isChecked={field.value?.includes(event.value) || false}
                                onChange={(e) => {
                                  const currentEvents = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentEvents, event.value]);
                                  } else {
                                    field.onChange(currentEvents.filter((v: string) => v !== event.value));
                                  }
                                }}
                                colorScheme="blue"
                              >
                                <Text color={colors.text.primary}>{event.label}</Text>
                              </Checkbox>
                            )}
                          />
                        ))}
                      </VStack>
                    </FormControl>
                  </Box>
                  <Divider borderColor={colors.border.default} />
                </>
              )}

              {/* Conditions */}
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="lg" fontWeight="bold" color={colors.text.primary}>
                    Conditions
                  </Text>
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={addCondition}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                  >
                    Add Condition
                  </Button>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {conditionFields.map((field, index) => (
                    <Box
                      key={field.id}
                      p={4}
                      border="1px"
                      borderColor={colors.border.subtle}
                      borderRadius="md"
                      bg={colors.bg.subtle}
                    >
                      <HStack justify="space-between" mb={3}>
                        <Badge colorScheme="blue">Condition {index + 1}</Badge>
                        {conditionFields.length > 1 && (
                          <IconButton
                            aria-label="Remove condition"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeCondition(index)}
                          />
                        )}
                      </HStack>

                      <HStack spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="sm" color={colors.text.primary}>Field</FormLabel>
                          <Select
                            {...register(`conditions.${index}.field` as const)}
                            placeholder="Select field"
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          >
                            {getFieldsForEntity(watchedEntityType).map((fieldName) => (
                              <option key={fieldName} value={fieldName}>
                                {fieldName}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color={colors.text.primary}>Operator</FormLabel>
                          <Select
                            {...register(`conditions.${index}.operator` as const)}
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          >
                            {OPERATORS.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color={colors.text.primary}>Value</FormLabel>
                          <Input
                            {...register(`conditions.${index}.value` as const)}
                            placeholder="Enter value"
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          />
                        </FormControl>

                        {index < conditionFields.length - 1 && (
                          <FormControl maxW="100px">
                            <FormLabel fontSize="sm" color={colors.text.primary}>Logic</FormLabel>
                            <Select
                              {...register(`conditions.${index}.logicalOperator` as const)}
                              size="sm"
                              bg={colors.bg.input}
                              borderColor={colors.border.input}
                              color={colors.text.primary}
                            >
                              <option value="AND">AND</option>
                              <option value="OR">OR</option>
                            </Select>
                          </FormControl>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Divider borderColor={colors.border.default} />

              {/* Actions */}
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="lg" fontWeight="bold" color={colors.text.primary}>
                    Actions
                  </Text>
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={addAction}
                    size="sm"
                    variant="outline"
                    colorScheme="green"
                  >
                    Add Action
                  </Button>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {actionFields.map((field, index) => (
                    <Box
                      key={field.id}
                      p={4}
                      border="1px"
                      borderColor={colors.border.subtle}
                      borderRadius="md"
                      bg={colors.bg.subtle}
                    >
                      <HStack justify="space-between" mb={3}>
                        <Badge colorScheme="green">Action {index + 1}</Badge>
                        {actionFields.length > 1 && (
                          <IconButton
                            aria-label="Remove action"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeAction(index)}
                          />
                        )}
                      </HStack>

                      <VStack spacing={3} align="stretch">
                        <HStack spacing={3}>
                          <FormControl>
                            <FormLabel fontSize="sm" color={colors.text.primary}>Action Type</FormLabel>
                            <Select
                              {...register(`actions.${index}.type` as const)}
                              size="sm"
                              bg={colors.bg.input}
                              borderColor={colors.border.input}
                              color={colors.text.primary}
                            >
                              {ACTION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" color={colors.text.primary}>Priority</FormLabel>
                            <Controller
                              name={`actions.${index}.priority` as const}
                              control={control}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  min={1}
                                  max={10}
                                  size="sm"
                                  bg={colors.bg.input}
                                >
                                  <NumberInputField borderColor={colors.border.input} />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              )}
                            />
                          </FormControl>
                        </HStack>

                        <FormControl>
                          <FormLabel fontSize="sm" color={colors.text.primary}>Message/Description</FormLabel>
                          <Textarea
                            {...register(`actions.${index}.message` as const)}
                            placeholder="Action message or description..."
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" color={colors.text.primary}>Target (User ID, Email, etc.)</FormLabel>
                          <Input
                            {...register(`actions.${index}.target` as const)}
                            placeholder="Target for this action"
                            size="sm"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          />
                        </FormControl>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Advanced Settings */}
              <Accordion allowToggle>
                <AccordionItem border="none">
                  <AccordionButton
                    bg={colors.bg.subtle}
                    color={colors.text.primary}
                    _hover={{ bg: colors.bg.surface }}
                  >
                    <Box flex="1" textAlign="left">
                      <Text fontSize="lg" fontWeight="bold">Advanced Settings</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <VStack spacing={4} align="stretch">
                      {watchedTriggerType === 'TIME_BASED' && (
                        <FormControl>
                          <FormLabel color={colors.text.primary}>Schedule (Cron Expression)</FormLabel>
                          <Input
                            {...register('schedule')}
                            placeholder="0 6 * * 1-5 (weekdays at 6 AM)"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          />
                          <Text fontSize="sm" color={colors.text.muted} mt={1}>
                            Use cron format for scheduling. Leave empty for manual execution.
                          </Text>
                        </FormControl>
                      )}

                      <HStack spacing={4}>
                        <FormControl>
                          <FormLabel color={colors.text.primary}>Workflow ID (Optional)</FormLabel>
                          <Input
                            {...register('wfmWorkflowId')}
                            placeholder="Link to specific workflow"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel color={colors.text.primary}>Step ID (Optional)</FormLabel>
                          <Input
                            {...register('wfmStepId')}
                            placeholder="Link to specific step"
                            bg={colors.bg.input}
                            borderColor={colors.border.input}
                            color={colors.text.primary}
                          />
                        </FormControl>
                      </HStack>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                bg={colors.interactive.default}
                color={colors.interactive.text}
                _hover={{ bg: colors.interactive.hover }}
                _active={{ bg: colors.interactive.active }}
                isLoading={isSubmitting}
                loadingText={isEditing ? 'Updating...' : 'Creating...'}
              >
                {isEditing ? 'Update Rule' : 'Create Rule'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 