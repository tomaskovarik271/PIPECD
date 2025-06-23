import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Switch,
  Box,
  Text,
  Badge,
  useToast,
  Icon,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Select,
  Textarea
} from '@chakra-ui/react';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiUsers,
  FiPlay
} from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useConversions, ConversionHelpers } from '../../hooks/useConversions';

// Types
interface Lead {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  estimated_value?: number;
  estimated_close_date?: string;
  lead_score?: number;
  source?: string;
  description?: string;
}

interface BulkConversionResult {
  summary: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
  };
  results: Array<{
    sourceEntity: {
      id: string;
      name: string;
    };
    targetEntity?: {
      id: string;
      name: string;
    };
    success: boolean;
    error?: string;
  }>;
}

interface BulkConvertLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onConversionComplete: (results: BulkConversionResult) => void;
}

interface LeadConversionConfig {
  leadId: string;
  selected: boolean;
  canConvert: boolean;
  recommendation: {
    recommend: boolean;
    reason: string;
  };
  customDealName?: string;
  customOwnerId?: string;
}

interface ConversionProgress {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  current?: string;
  results: Array<{
    leadId: string;
    leadName: string;
    success: boolean;
    error?: string;
    dealId?: string;
  }>;
}

export function BulkConvertLeadsModal({ 
  isOpen, 
  onClose, 
  leads, 
  onConversionComplete 
}: BulkConvertLeadsModalProps) {
  const colors = useThemeColors();
  const toast = useToast();
  const { bulkConvertLeads } = useConversions();

  // Form state
  const [leadConfigs, setLeadConfigs] = useState<LeadConversionConfig[]>([]);
  const [globalOptions, setGlobalOptions] = useState({
    preserveActivities: true,
    createConversionActivity: true,
    defaultOwnerId: ''
  });
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Available users for assignment (mock data)
  const [availableUsers] = useState([
    { id: 'user_1', name: 'John Doe' },
    { id: 'user_2', name: 'Jane Smith' },
    { id: 'user_3', name: 'Bob Johnson' }
  ]);

  // Initialize lead configurations
  useEffect(() => {
    if (leads.length > 0) {
      const configs: LeadConversionConfig[] = leads.map(lead => {
        const canConvert = ConversionHelpers.canConvertLeadToDeal(lead);
        const recommendation = ConversionHelpers.getConversionRecommendation(lead, 'lead');
        
        return {
          leadId: lead.id,
          selected: canConvert && recommendation.recommend,
          canConvert,
          recommendation,
          customDealName: lead.name,
          customOwnerId: globalOptions.defaultOwnerId
        };
      });
      
      setLeadConfigs(configs);
    }
  }, [leads, globalOptions.defaultOwnerId]);

  const selectedLeads = leadConfigs.filter(config => config.selected);
  const convertibleLeads = leadConfigs.filter(config => config.canConvert);

  const handleSelectAll = (checked: boolean) => {
    setLeadConfigs(configs =>
      configs.map(config => ({
        ...config,
        selected: checked && config.canConvert
      }))
    );
  };

  const handleSelectLead = (leadId: string, selected: boolean) => {
    setLeadConfigs(configs =>
      configs.map(config =>
        config.leadId === leadId ? { ...config, selected } : config
      )
    );
  };

  const handleCustomDealName = (leadId: string, customDealName: string) => {
    setLeadConfigs(configs =>
      configs.map(config =>
        config.leadId === leadId ? { ...config, customDealName } : config
      )
    );
  };

  const handleCustomOwner = (leadId: string, customOwnerId: string) => {
    setLeadConfigs(configs =>
      configs.map(config =>
        config.leadId === leadId ? { ...config, customOwnerId } : config
      )
    );
  };

  const handleBulkConvert = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: 'No Leads Selected',
        description: 'Please select at least one lead to convert.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    setConversionProgress({
      total: selectedLeads.length,
      completed: 0,
      succeeded: 0,
      failed: 0,
      results: []
    });

    try {
      // Prepare bulk conversion input
      const leadIds = selectedLeads.map(config => config.leadId);
      const individualConfigurations = selectedLeads.map(config => {
        const lead = leads.find(l => l.id === config.leadId)!;
        return {
          leadId: config.leadId,
          dealData: {
            name: config.customDealName || lead.name,
            amount: lead.estimated_value,
            currency: 'USD',
            expected_close_date: lead.estimated_close_date,
            owner_id: config.customOwnerId || globalOptions.defaultOwnerId
          },
          personData: (lead.contact_name || lead.contact_email) ? {
            first_name: lead.contact_name?.split(' ')[0] || '',
            last_name: lead.contact_name?.split(' ').slice(1).join(' ') || '',
            email: lead.contact_email,
            phone: lead.contact_phone
          } : undefined,
          organizationData: lead.company_name ? {
            name: lead.company_name,
            address: '',
            notes: `Created from lead: ${lead.name}`
          } : undefined
        };
      });

      const bulkInput = {
        leadIds,
        defaultOptions: globalOptions,
        individualConfigurations
      };

      // Execute bulk conversion
      const result = await bulkConvertLeads(bulkInput);
      
      if (result) {
        setConversionProgress(prev => prev ? {
          ...prev,
          completed: result.summary.totalProcessed,
          succeeded: result.summary.successCount,
          failed: result.summary.errorCount,
          results: result.results.map((r: BulkConversionResult['results'][0]) => ({
            leadId: r.sourceEntity.id,
            leadName: r.sourceEntity.name,
            success: r.success,
            error: r.success ? undefined : 'Conversion failed',
            dealId: r.success ? r.targetEntity?.id : undefined
          }))
        } : null);

        // Call completion callback
        onConversionComplete(result);
      }

    } catch (error) {
      console.error('Bulk conversion error:', error);
      toast({
        title: 'Bulk Conversion Failed',
        description: 'An error occurred during bulk conversion.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setLeadConfigs([]);
    setConversionProgress(null);
    setNotes('');
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const getLeadById = (leadId: string) => leads.find(l => l.id === leadId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="1200px">
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiUsers} color={colors.accent.primary} />
            <Text>Bulk Convert Leads to Deals</Text>
            <Badge colorScheme="blue" variant="subtle">
              {leads.length} Lead{leads.length !== 1 ? 's' : ''}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Summary */}
            <Box p={4} bg={colors.background.elevated} borderRadius="md" border="1px" borderColor={colors.border.subtle}>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold" color={colors.text.primary}>
                  Conversion Summary
                </Text>
              </HStack>
              <HStack spacing={6} fontSize="sm">
                <HStack>
                  <Badge colorScheme="blue">{leads.length}</Badge>
                  <Text color={colors.text.muted}>Total Leads</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="green">{convertibleLeads.length}</Badge>
                  <Text color={colors.text.muted}>Convertible</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="purple">{selectedLeads.length}</Badge>
                  <Text color={colors.text.muted}>Selected</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="red">{leads.length - convertibleLeads.length}</Badge>
                  <Text color={colors.text.muted}>Blocked</Text>
                </HStack>
              </HStack>
            </Box>

            {/* Global Options */}
            <Box>
              <Text fontWeight="semibold" mb={4} color={colors.text.primary}>
                Global Options
              </Text>
              <VStack spacing={4} align="stretch">
                <HStack spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="preserve-activities" mb="0" fontSize="sm">
                      Preserve Activities
                    </FormLabel>
                    <Switch 
                      id="preserve-activities"
                      isChecked={globalOptions.preserveActivities}
                      onChange={(e) => setGlobalOptions(prev => ({ 
                        ...prev, 
                        preserveActivities: e.target.checked 
                      }))}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="create-activity" mb="0" fontSize="sm">
                      Create Conversion Activity
                    </FormLabel>
                    <Switch 
                      id="create-activity"
                      isChecked={globalOptions.createConversionActivity}
                      onChange={(e) => setGlobalOptions(prev => ({ 
                        ...prev, 
                        createConversionActivity: e.target.checked 
                      }))}
                    />
                  </FormControl>
                </HStack>

                <HStack>
                  <FormControl maxW="300px">
                    <FormLabel fontSize="sm">Default Owner</FormLabel>
                    <Select
                      value={globalOptions.defaultOwnerId}
                      onChange={(e) => setGlobalOptions(prev => ({ 
                        ...prev, 
                        defaultOwnerId: e.target.value 
                      }))}
                      placeholder="Select default owner"
                      size="sm"
                    >
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Conversion Notes</FormLabel>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes for bulk conversion..."
                      size="sm"
                      rows={2}
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            {/* Conversion Progress */}
            {conversionProgress && (
              <Box p={4} bg={colors.background.elevated} borderRadius="md" border="1px" borderColor={colors.border.subtle}>
                <Text fontWeight="semibold" mb={3} color={colors.text.primary}>
                  Conversion Progress
                </Text>
                <VStack spacing={3} align="stretch">
                  <Progress 
                    value={(conversionProgress.completed / conversionProgress.total) * 100}
                    colorScheme="blue"
                    size="lg"
                  />
                  <HStack justify="space-between" fontSize="sm">
                    <Text color={colors.text.muted}>
                      {conversionProgress.completed} of {conversionProgress.total} processed
                    </Text>
                    <HStack spacing={4}>
                      <HStack>
                        <Icon as={FiCheckCircle} color="green.500" />
                        <Text color="green.500">{conversionProgress.succeeded} succeeded</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiXCircle} color="red.500" />
                        <Text color="red.500">{conversionProgress.failed} failed</Text>
                      </HStack>
                    </HStack>
                  </HStack>
                  {conversionProgress.current && (
                    <Text fontSize="sm" color={colors.text.muted}>
                      Currently processing: {conversionProgress.current}
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            {/* Lead Selection Table */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontWeight="semibold" color={colors.text.primary}>
                  Select Leads to Convert
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSelectAll(!selectedLeads.length)}
                  isDisabled={convertibleLeads.length === 0}
                >
                  {selectedLeads.length === convertibleLeads.length ? 'Deselect All' : 'Select All Convertible'}
                </Button>
              </HStack>

              <Box overflowX="auto" maxH="400px" overflowY="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th width="50px">Select</Th>
                      <Th>Lead Name</Th>
                      <Th>Contact</Th>
                      <Th>Company</Th>
                      <Th>Value</Th>
                      <Th>Score</Th>
                      <Th>Status</Th>
                      <Th>Deal Name</Th>
                      <Th>Owner</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {leadConfigs.map(config => {
                      const lead = getLeadById(config.leadId);
                      if (!lead) return null;

                      return (
                        <Tr key={config.leadId}>
                          <Td>
                            <Checkbox
                              isChecked={config.selected}
                              isDisabled={!config.canConvert}
                              onChange={(e) => handleSelectLead(config.leadId, e.target.checked)}
                            />
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium">
                              {lead.name}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="xs" color={colors.text.muted}>
                              {lead.contact_name || lead.contact_email || '-'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="xs" color={colors.text.muted}>
                              {lead.company_name || '-'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="xs">
                              {lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : '-'}
                            </Text>
                          </Td>
                          <Td>
                            {lead.lead_score && (
                              <Badge 
                                size="sm"
                                colorScheme={lead.lead_score >= 70 ? 'green' : lead.lead_score >= 50 ? 'yellow' : 'red'}
                              >
                                {lead.lead_score}
                              </Badge>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Icon 
                                as={config.canConvert ? FiCheckCircle : FiXCircle}
                                color={config.canConvert ? 'green.500' : 'red.500'}
                                size="sm"
                              />
                              <Badge 
                                size="sm"
                                colorScheme={config.recommendation.recommend ? 'green' : 'orange'}
                              >
                                {config.recommendation.recommend ? 'Ready' : 'Review'}
                              </Badge>
                            </HStack>
                          </Td>
                          <Td>
                            <Input
                              size="xs"
                              value={config.customDealName || ''}
                              onChange={(e) => handleCustomDealName(config.leadId, e.target.value)}
                              isDisabled={!config.selected}
                              placeholder="Deal name"
                            />
                          </Td>
                          <Td>
                            <Select
                              size="xs"
                              value={config.customOwnerId || ''}
                              onChange={(e) => handleCustomOwner(config.leadId, e.target.value)}
                              isDisabled={!config.selected}
                              placeholder="Owner"
                            >
                              {availableUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </Select>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            {/* Conversion Results */}
            {conversionProgress?.results.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={3} color={colors.text.primary}>
                  Conversion Results
                </Text>
                <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                  {conversionProgress.results.map(result => (
                    <HStack key={result.leadId} justify="space-between" p={2} bg={colors.background.elevated} borderRadius="sm">
                      <HStack>
                        <Icon 
                          as={result.success ? FiCheckCircle : FiXCircle}
                          color={result.success ? 'green.500' : 'red.500'}
                        />
                        <Text fontSize="sm">{result.leadName}</Text>
                      </HStack>
                      <Text fontSize="xs" color={colors.text.muted}>
                        {result.success ? `Deal created: ${result.dealId}` : result.error}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isProcessing}>
              {conversionProgress ? 'Close' : 'Cancel'}
            </Button>
            {!conversionProgress && (
              <Button
                colorScheme="blue"
                onClick={handleBulkConvert}
                isLoading={isProcessing}
                loadingText="Converting..."
                isDisabled={selectedLeads.length === 0}
                leftIcon={<Icon as={FiPlay} />}
              >
                Convert {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 