import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  EditIcon, 
  DeleteIcon, 
  ViewIcon, 
  CheckIcon, 
  CloseIcon,
  SearchIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { BusinessRulesFormModal } from '../../components/admin/businessRules/BusinessRulesFormModal';
import { BusinessRuleDetailsModal } from '../../components/admin/businessRules/BusinessRuleDetailsModal';
import { useBusinessRulesStore } from '../../stores/useBusinessRulesStore';

export const BusinessRulesPage: React.FC = () => {
  const colors = useThemeColors();
  const toast = useToast();
  
  // Modal states
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  
  // Local state
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [triggerFilter, setTriggerFilter] = useState<string>('');
  
  // Store
  const { 
    rules, 
    loading, 
    error, 
    fetchBusinessRules, 
    createBusinessRule, 
    updateBusinessRule, 
    deleteBusinessRule,
    activateRule,
    deactivateRule
  } = useBusinessRulesStore();

  // Effects
  useEffect(() => {
    fetchBusinessRules();
  }, [fetchBusinessRules]);

  // Handlers
  const handleCreateRule = () => {
    setSelectedRule(null);
    onFormOpen();
  };

  const handleEditRule = (rule: any) => {
    setSelectedRule(rule);
    onFormOpen();
  };

  const handleViewRule = (rule: any) => {
    setSelectedRule(rule);
    onDetailsOpen();
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedRule) {
        await updateBusinessRule(selectedRule.id, formData);
        toast({
          title: 'Rule Updated',
          description: 'Business rule has been updated successfully.',
          status: 'success',
          duration: 3000,
        });
      } else {
        await createBusinessRule(formData);
        toast({
          title: 'Rule Created',
          description: 'Business rule has been created successfully.',
          status: 'success',
          duration: 3000,
        });
      }
      onFormClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save business rule. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleToggleStatus = async (rule: any) => {
    try {
      if (rule.status === 'ACTIVE') {
        await deactivateRule(rule.id);
        toast({
          title: 'Rule Deactivated',
          description: `Rule "${rule.name}" has been deactivated.`,
          status: 'info',
          duration: 3000,
        });
      } else {
        await activateRule(rule.id);
        toast({
          title: 'Rule Activated',
          description: `Rule "${rule.name}" has been activated.`,
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule status. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeleteRule = async (rule: any) => {
    if (window.confirm(`Are you sure you want to delete the rule "${rule.name}"? This action cannot be undone.`)) {
      try {
        await deleteBusinessRule(rule.id);
        toast({
          title: 'Rule Deleted',
          description: `Rule "${rule.name}" has been deleted.`,
          status: 'success',
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete business rule. Please try again.',
          status: 'error',
          duration: 5000,
        });
      }
    }
  };

  // Filter rules based on search and filters
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || rule.status === statusFilter;
    const matchesEntity = !entityFilter || rule.entityType === entityFilter;
    const matchesTrigger = !triggerFilter || rule.triggerType === triggerFilter;
    
    return matchesSearch && matchesStatus && matchesEntity && matchesTrigger;
  });

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

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={4} align="center" py={16}>
          <Spinner size="lg" color={colors.interactive.default} />
          <Text color={colors.text.secondary}>Loading business rules...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error" bg={colors.bg.surface} borderColor={colors.border.error}>
          <AlertIcon color={colors.status.error} />
          <Text color={colors.text.primary}>Error: {error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <Card 
        bg={colors.bg.surface}
        borderColor={colors.border.default}
        borderWidth="1px"
        shadow="md"
      >
        <CardHeader>
          <VStack spacing={6} align="start" width="100%">
            <Box>
              <Heading 
                as="h1" 
                size="xl" 
                mb={2}
                color={colors.text.primary}
              >
                Business Rules Engine
              </Heading>
              <Text color={colors.text.secondary}>
                Automate business processes with intelligent rules that trigger actions based on entity changes, field updates, and scheduled events.
              </Text>
            </Box>

            <Flex 
              width="100%" 
              gap={4} 
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'flex-end' }}
            >
              <HStack spacing={4} flex={1}>
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <SearchIcon color={colors.text.muted} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={colors.bg.input}
                    borderColor={colors.border.input}
                    color={colors.text.primary}
                    _hover={{ borderColor: colors.border.emphasis }}
                    _focus={{ 
                      borderColor: colors.border.focus,
                      boxShadow: `0 0 0 1px ${colors.border.focus}`
                    }}
                  />
                </InputGroup>

                <Select
                  placeholder="All Statuses"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW="150px"
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                  _hover={{ borderColor: colors.border.emphasis }}
                  _focus={{ 
                    borderColor: colors.border.focus,
                    boxShadow: `0 0 0 1px ${colors.border.focus}`
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ERROR">Error</option>
                </Select>

                <Select
                  placeholder="All Entities"
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  maxW="150px"
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                  _hover={{ borderColor: colors.border.emphasis }}
                  _focus={{ 
                    borderColor: colors.border.focus,
                    boxShadow: `0 0 0 1px ${colors.border.focus}`
                  }}
                >
                  <option value="DEAL">Deals</option>
                  <option value="LEAD">Leads</option>
                  <option value="PERSON">People</option>
                  <option value="ORGANIZATION">Organizations</option>
                  <option value="TASK">Tasks</option>
                  <option value="ACTIVITY">Activities</option>
                </Select>

                <Select
                  placeholder="All Triggers"
                  value={triggerFilter}
                  onChange={(e) => setTriggerFilter(e.target.value)}
                  maxW="150px"
                  bg={colors.bg.input}
                  borderColor={colors.border.input}
                  color={colors.text.primary}
                  _hover={{ borderColor: colors.border.emphasis }}
                  _focus={{ 
                    borderColor: colors.border.focus,
                    boxShadow: `0 0 0 1px ${colors.border.focus}`
                  }}
                >
                  <option value="EVENT_BASED">Event Based</option>
                  <option value="FIELD_CHANGE">Field Change</option>
                  <option value="TIME_BASED">Time Based</option>
                </Select>
              </HStack>

              <Button
                leftIcon={<AddIcon />}
                onClick={handleCreateRule}
                bg={colors.interactive.default}
                color={colors.interactive.text}
                _hover={{ 
                  bg: colors.interactive.hover,
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg'
                }}
                _active={{ 
                  bg: colors.interactive.active,
                  transform: 'translateY(0)'
                }}
                size="md"
                minW="140px"
              >
                Create Rule
              </Button>
            </Flex>
          </VStack>
        </CardHeader>

        <CardBody>
          <Box width="100%" overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color={colors.text.secondary} borderColor={colors.border.default}>
                    Rule Name
                  </Th>
                  <Th color={colors.text.secondary} borderColor={colors.border.default}>
                    Entity Type
                  </Th>
                  <Th color={colors.text.secondary} borderColor={colors.border.default}>
                    Trigger Type
                  </Th>
                  <Th color={colors.text.secondary} borderColor={colors.border.default}>
                    Status
                  </Th>
                  <Th color={colors.text.secondary} borderColor={colors.border.default}>
                    Executions
                  </Th>
                  <Th color={colors.text.secondary} borderColor={colors.border.default}>
                    Last Run
                  </Th>
                  <Th color={colors.text.secondary} borderColor={colors.border.default}>
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRules.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8}>
                      <VStack spacing={4}>
                        <SettingsIcon color={colors.text.muted} boxSize={12} />
                        <Text color={colors.text.muted} fontSize="lg">
                          {searchTerm || statusFilter || entityFilter || triggerFilter 
                            ? 'No rules match your filters' 
                            : 'No business rules created yet'
                          }
                        </Text>
                        {!searchTerm && !statusFilter && !entityFilter && !triggerFilter && (
                          <Button
                            leftIcon={<AddIcon />}
                            onClick={handleCreateRule}
                            variant="outline"
                            colorScheme="blue"
                          >
                            Create your first rule
                          </Button>
                        )}
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  filteredRules.map((rule) => (
                    <Tr 
                      key={rule.id}
                      _hover={{ bg: colors.component.table.rowHover }}
                    >
                      <Td borderColor={colors.border.subtle}>
                        <VStack align="start" spacing={1}>
                          <Text 
                            fontWeight="medium"
                            color={colors.text.primary}
                            cursor="pointer"
                            onClick={() => handleViewRule(rule)}
                            _hover={{ textDecoration: 'underline' }}
                          >
                            {rule.name}
                          </Text>
                          {rule.description && (
                            <Text 
                              fontSize="sm" 
                              color={colors.text.muted}
                              noOfLines={1}
                            >
                              {rule.description}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        {getEntityTypeBadge(rule.entityType)}
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        {getTriggerTypeBadge(rule.triggerType)}
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        {getStatusBadge(rule.status)}
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        <Text color={colors.text.primary}>
                          {rule.executionCount || 0}
                        </Text>
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        <Text color={colors.text.muted} fontSize="sm">
                          {rule.lastExecution 
                            ? new Date(rule.lastExecution).toLocaleDateString()
                            : 'Never'
                          }
                        </Text>
                      </Td>
                      
                      <Td borderColor={colors.border.subtle}>
                        <HStack spacing={2}>
                          <Tooltip label="View Details">
                            <IconButton
                              aria-label="View rule details"
                              icon={<ViewIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewRule(rule)}
                              color={colors.text.secondary}
                              _hover={{ 
                                color: colors.text.primary,
                                bg: colors.bg.subtle
                              }}
                            />
                          </Tooltip>
                          
                          <Tooltip label="Edit Rule">
                            <IconButton
                              aria-label="Edit rule"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRule(rule)}
                              color={colors.text.secondary}
                              _hover={{ 
                                color: colors.text.primary,
                                bg: colors.bg.subtle
                              }}
                            />
                          </Tooltip>
                          
                          <Tooltip label={rule.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              aria-label={rule.status === 'ACTIVE' ? 'Deactivate rule' : 'Activate rule'}
                              icon={rule.status === 'ACTIVE' ? <CloseIcon /> : <CheckIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(rule)}
                              color={rule.status === 'ACTIVE' ? colors.status.warning : colors.status.success}
                              _hover={{ 
                                bg: colors.bg.subtle
                              }}
                            />
                          </Tooltip>
                          
                          <Tooltip label="Delete Rule">
                            <IconButton
                              aria-label="Delete rule"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteRule(rule)}
                              color={colors.status.error}
                              _hover={{ 
                                bg: colors.bg.subtle
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Create/Edit Rule Modal */}
      <BusinessRulesFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        onSubmit={handleFormSubmit}
        initialValues={selectedRule}
        isEditing={!!selectedRule}
      />

      {/* Rule Details Modal */}
      <BusinessRuleDetailsModal
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        rule={selectedRule}
        onEdit={() => {
          onDetailsClose();
          onFormOpen();
        }}
      />
    </Container>
  );
}; 