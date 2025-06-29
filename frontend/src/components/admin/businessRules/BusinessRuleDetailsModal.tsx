import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Progress,
  Alert,
  AlertIcon,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { EditIcon, InfoIcon, CheckIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface BusinessRuleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: any;
  onEdit: () => void;
}

export const BusinessRuleDetailsModal: React.FC<BusinessRuleDetailsModalProps> = ({
  isOpen,
  onClose,
  rule,
  onEdit,
}) => {
  const colors = useThemeColors();

  if (!rule) return null;

  const getStatusBadge = (status: string) => {
    const colorScheme = {
      ACTIVE: 'green',
      INACTIVE: 'gray',
      ERROR: 'red',
    };
    
    return (
      <Badge colorScheme={colorScheme[status as keyof typeof colorScheme] || 'gray'}>
        {status}
      </Badge>
    );
  };

  const getEntityTypeBadge = (entityType: string) => {
    const colorScheme = {
      DEAL: 'blue',
      LEAD: 'purple',
      PERSON: 'orange',
      ORGANIZATION: 'teal',
      TASK: 'cyan',
      ACTIVITY: 'pink',
    };
    
    return (
      <Badge colorScheme={colorScheme[entityType as keyof typeof colorScheme] || 'gray'}>
        {entityType}
      </Badge>
    );
  };

  const getTriggerTypeBadge = (triggerType: string) => {
    const colorScheme = {
      EVENT_BASED: 'green',
      FIELD_CHANGE: 'blue',
      TIME_BASED: 'yellow',
    };
    
    return (
      <Badge colorScheme={colorScheme[triggerType as keyof typeof colorScheme] || 'gray'}>
        {triggerType.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseConditions = (conditionsData: any) => {
    try {
      // If it's already an array, return it directly
      if (Array.isArray(conditionsData)) {
        return conditionsData;
      }
      // If it's a string, try to parse it
      if (typeof conditionsData === 'string') {
        return JSON.parse(conditionsData);
      }
      // If it's null/undefined, return empty array
      return [];
    } catch {
      return [];
    }
  };

  const parseActions = (actionsData: any) => {
    try {
      // If it's already an array, return it directly
      if (Array.isArray(actionsData)) {
        return actionsData;
      }
      // If it's a string, try to parse it
      if (typeof actionsData === 'string') {
        return JSON.parse(actionsData);
      }
      // If it's null/undefined, return empty array
      return [];
    } catch {
      return [];
    }
  };

  const conditions = parseConditions(rule.conditions);
  const actions = parseActions(rule.actions);
  const successRate = rule.executionCount > 0 ? ((rule.executionCount - (rule.errorCount || 0)) / rule.executionCount * 100) : 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent bg={colors.bg.surface} borderColor={colors.border.default} maxH="90vh">
        <ModalHeader color={colors.text.primary}>
          <HStack justify="space-between">
            <Text>{rule.name}</Text>
            <HStack spacing={2}>
              {getStatusBadge(rule.status)}
              {getEntityTypeBadge(rule.entityType)}
              {getTriggerTypeBadge(rule.triggerType)}
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color={colors.text.secondary} />
        
        <ModalBody overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Rule Overview */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" color={colors.text.primary} mb={3}>
                Overview
              </Text>
              
              {rule.description && (
                <Text color={colors.text.secondary} mb={4}>
                  {rule.description}
                </Text>
              )}

              <StatGroup>
                <Stat>
                  <StatLabel color={colors.text.secondary}>Total Executions</StatLabel>
                  <StatNumber color={colors.text.primary}>{rule.executionCount || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color={colors.text.secondary}>Success Rate</StatLabel>
                  <StatNumber color={colors.text.primary}>
                    {successRate.toFixed(1)}%
                  </StatNumber>
                  <Progress
                    value={successRate}
                    colorScheme={successRate >= 95 ? 'green' : successRate >= 80 ? 'yellow' : 'red'}
                    size="sm"
                    mt={2}
                  />
                </Stat>
                <Stat>
                  <StatLabel color={colors.text.secondary}>Last Execution</StatLabel>
                  <StatNumber color={colors.text.primary} fontSize="md">
                    {rule.lastExecution ? formatDate(rule.lastExecution) : 'Never'}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </Box>

            <Divider borderColor={colors.border.default} />

            {/* Rule Configuration */}
            <Accordion allowMultiple defaultIndex={[0]}>
              {/* Conditions */}
                             <AccordionItem border="none">
                 <AccordionButton
                   bg={colors.bg.surface}
                   color={colors.text.primary}
                   _hover={{ bg: colors.bg.elevated }}
                 >
                   <Box flex="1" textAlign="left">
                     <HStack>
                       <InfoIcon color={colors.interactive.default} />
                       <Text fontWeight="bold">Conditions ({conditions.length})</Text>
                     </HStack>
                   </Box>
                   <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {conditions.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {conditions.map((condition: any, index: number) => (
                        <Box
                          key={index}
                          p={3}
                          border="1px"
                          borderColor={colors.border.subtle}
                          borderRadius="md"
                          bg={colors.bg.surface}
                        >
                          <HStack spacing={3} wrap="wrap">
                            <Badge colorScheme="blue" fontSize="xs">
                              {condition.field}
                            </Badge>
                            <Code colorScheme="gray" fontSize="xs">
                              {condition.operator}
                            </Code>
                            <Badge colorScheme="purple" fontSize="xs">
                              {condition.value}
                            </Badge>
                            {index < conditions.length - 1 && condition.logicalOperator && (
                              <Badge colorScheme="orange" fontSize="xs">
                                {condition.logicalOperator}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="warning">
                      <AlertIcon />
                      No conditions defined for this rule.
                    </Alert>
                  )}
                </AccordionPanel>
              </AccordionItem>

              {/* Actions */}
                             <AccordionItem border="none">
                 <AccordionButton
                   bg={colors.bg.surface}
                   color={colors.text.primary}
                   _hover={{ bg: colors.bg.elevated }}
                 >
                   <Box flex="1" textAlign="left">
                     <HStack>
                       <CheckIcon color={colors.status.success} />
                       <Text fontWeight="bold">Actions ({actions.length})</Text>
                     </HStack>
                   </Box>
                   <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {actions.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {actions.map((action: any, index: number) => (
                        <Box
                          key={index}
                          p={3}
                          border="1px"
                          borderColor={colors.border.subtle}
                          borderRadius="md"
                          bg={colors.bg.surface}
                        >
                          <VStack align="stretch" spacing={2}>
                            <HStack spacing={3}>
                              <Badge colorScheme="green" fontSize="xs">
                                {action.type}
                              </Badge>
                              {action.priority && (
                                <Badge colorScheme="red" fontSize="xs">
                                  Priority: {action.priority}
                                </Badge>
                              )}
                              {action.target && (
                                <Badge colorScheme="teal" fontSize="xs">
                                  Target: {action.target}
                                </Badge>
                              )}
                            </HStack>
                            
                            {action.message && (
                              <Text fontSize="sm" color={colors.text.secondary}>
                                <strong>Message:</strong> {action.message}
                              </Text>
                            )}
                            
                            {action.emailTo && (
                              <Text fontSize="sm" color={colors.text.secondary}>
                                <strong>Email To:</strong> {action.emailTo}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="warning">
                      <AlertIcon />
                      No actions defined for this rule.
                    </Alert>
                  )}
                </AccordionPanel>
              </AccordionItem>

              {/* Trigger Fields */}
              {rule.triggerFields && rule.triggerFields.length > 0 && (
                                 <AccordionItem border="none">
                   <AccordionButton
                     bg={colors.bg.surface}
                     color={colors.text.primary}
                     _hover={{ bg: colors.bg.elevated }}
                   >
                     <Box flex="1" textAlign="left">
                       <HStack>
                         <TimeIcon color={colors.status.warning} />
                         <Text fontWeight="bold">Trigger Fields ({rule.triggerFields.length})</Text>
                       </HStack>
                     </Box>
                     <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <HStack spacing={2} wrap="wrap">
                      {rule.triggerFields.map((field: string, index: number) => (
                        <Badge key={index} colorScheme="yellow" fontSize="xs">
                          {field}
                        </Badge>
                      ))}
                    </HStack>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Metadata */}
                             <AccordionItem border="none">
                 <AccordionButton
                   bg={colors.bg.surface}
                   color={colors.text.primary}
                   _hover={{ bg: colors.bg.elevated }}
                 >
                   <Box flex="1" textAlign="left">
                     <HStack>
                       <InfoIcon color={colors.text.muted} />
                       <Text fontWeight="bold">Metadata</Text>
                     </HStack>
                   </Box>
                   <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Table variant="simple" size="sm">
                    <Tbody>
                      <Tr>
                        <Td fontWeight="bold" color={colors.text.primary}>Created</Td>
                        <Td color={colors.text.secondary}>
                          {formatDate(rule.createdAt)}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="bold" color={colors.text.primary}>Last Updated</Td>
                        <Td color={colors.text.secondary}>
                          {formatDate(rule.updatedAt)}
                        </Td>
                      </Tr>
                      {rule.schedule && (
                        <Tr>
                          <Td fontWeight="bold" color={colors.text.primary}>Schedule</Td>
                          <Td color={colors.text.secondary}>
                            <Code>{rule.schedule}</Code>
                          </Td>
                        </Tr>
                      )}
                      {rule.nextExecution && (
                        <Tr>
                          <Td fontWeight="bold" color={colors.text.primary}>Next Execution</Td>
                          <Td color={colors.text.secondary}>
                            {formatDate(rule.nextExecution)}
                          </Td>
                        </Tr>
                      )}
                      {rule.wfmWorkflowId && (
                        <Tr>
                          <Td fontWeight="bold" color={colors.text.primary}>Workflow ID</Td>
                          <Td color={colors.text.secondary}>
                            <Code>{rule.wfmWorkflowId}</Code>
                          </Td>
                        </Tr>
                      )}
                      {rule.lastError && (
                        <Tr>
                          <Td fontWeight="bold" color={colors.text.primary}>Last Error</Td>
                          <Td color={colors.status.error}>
                            <Code colorScheme="red">{rule.lastError}</Code>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {/* Error Alert */}
            {rule.status === 'ERROR' && rule.lastError && (
              <Alert status="error">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Rule Error</Text>
                  <Text fontSize="sm">{rule.lastError}</Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              leftIcon={<EditIcon />}
              onClick={onEdit}
              bg={colors.interactive.default}
                             color="white"
              _hover={{ bg: colors.interactive.hover }}
              _active={{ bg: colors.interactive.active }}
            >
              Edit Rule
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 