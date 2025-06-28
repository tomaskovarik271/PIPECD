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
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Text,
  Badge,
  Divider,
  useToast,
  Spinner,
  Icon,
  Collapse,
  useDisclosure,
  Select
} from '@chakra-ui/react';
import { FiArrowLeft, FiUser, FiHome, FiTrendingDown, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { gql, useMutation } from '@apollo/client';
import { useHelp } from '../../contexts/HelpContext';

// GraphQL mutation for deal conversion
const CONVERT_DEAL_TO_LEAD_MODAL = gql`
  mutation ConvertDealToLeadModal($id: ID!, $input: DealToLeadConversionInput!) {
    convertDealToLead(id: $id, input: $input) {
      success
      message
      conversionId
      lead {
        id
        name
        estimated_value
        contact_name
        company_name
      }
    }
  }
`;

// Types
interface Deal {
  id: string;
  name: string;
  amount?: number;
  currency?: string;
  expected_close_date?: string;
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  currentWfmStep?: {
    id: string;
    name: string;
    status?: {
      id: string;
      name: string;
      color?: string;
    };
  };
  wfmProject?: {
    id: string;
    name: string;
  };
}

interface ConversionResult {
  success: boolean;
  newLeadId: string;
  message?: string;
  preservedActivities: boolean;
  createdConversionActivity: boolean;
  archivedDeal: boolean;
}

interface ConvertDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  onConversionComplete: (result: ConversionResult) => void;
}

interface ConversionValidation {
  isValid: boolean;
  canProceed: boolean;
  errors: string[];
  warnings: string[];
  statusValidation?: {
    currentStatus: string;
    allowedStatuses: string[];
    canConvert: boolean;
    reason?: string;
  };
}

interface ConversionPreview {
  leadData: {
    name: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    company_name: string;
    estimated_value: number;
    estimated_close_date?: string;
    source: string;
    description: string;
  };
  willArchiveDeal: boolean;
  wfmTransition?: {
    fromStatus: string;
    toStatus: string;
    reason: string;
  };
}

const CONVERSION_REASONS = [
  { value: 'unqualified', label: 'Prospect was unqualified' },
  { value: 'timing', label: 'Wrong timing - too early' },
  { value: 'budget', label: 'Budget constraints' },
  { value: 'competition', label: 'Lost to competition' },
  { value: 'requirements', label: 'Requirements mismatch' },
  { value: 'nurture', label: 'Needs more nurturing' },
  { value: 'other', label: 'Other reason' }
];

export function ConvertDealModal({ isOpen, onClose, deal, onConversionComplete }: ConvertDealModalProps) {
  const colors = useThemeColors();
  const toast = useToast();
  const { addHelpFeature, removeHelpFeature } = useHelp();
  const { isOpen: showAdvanced, onToggle: toggleAdvanced } = useDisclosure();

  // GraphQL mutation
  const [convertDealMutation] = useMutation(CONVERT_DEAL_TO_LEAD_MODAL);

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ConversionValidation | null>(null);
  const [preview, setPreview] = useState<ConversionPreview | null>(null);

  // Conversion options
  const [preserveActivities, setPreserveActivities] = useState(true);
  const [createConversionActivity, setCreateConversionActivity] = useState(true);
  const [archiveDeal, setArchiveDeal] = useState(true);
  const [conversionReason, setConversionReason] = useState('');
  const [notes, setNotes] = useState('');

  // Lead data customization
  const [leadName, setLeadName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [estimatedCloseDate, setEstimatedCloseDate] = useState('');
  const [leadSource, setLeadSource] = useState('deal_conversion');
  const [leadDescription, setLeadDescription] = useState('');

  // Add help feature when modal opens
  useEffect(() => {
    if (isOpen) {
      addHelpFeature('deal-to-lead-conversion');
    } else {
      removeHelpFeature('deal-to-lead-conversion');
    }
  }, [isOpen, addHelpFeature, removeHelpFeature]);

  // Initialize form data when deal changes
  useEffect(() => {
    if (deal && isOpen) {
      // Initialize lead data from deal
      setLeadName(deal.name || '');
      setContactName(deal.person ? `${deal.person.first_name} ${deal.person.last_name}` : '');
      setContactEmail(deal.person?.email || '');
      setContactPhone(deal.person?.phone || '');
      setCompanyName(deal.organization?.name || '');
      setEstimatedValue(deal.amount || 0);
      setEstimatedCloseDate(deal.expected_close_date || '');
      setLeadDescription(`Converted from deal: ${deal.name}`);
      setNotes(`Deal converted back to lead due to: ${conversionReason || 'needs further qualification'}`);

      // Generate preview
      generatePreview();
      
      // Validate conversion
      validateConversion();
    }
  }, [deal, isOpen, conversionReason]);

  const generatePreview = () => {
    if (!deal) return;

    const preview: ConversionPreview = {
      leadData: {
        name: leadName || deal.name,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        company_name: companyName,
        estimated_value: estimatedValue || deal.amount || 0,
        estimated_close_date: estimatedCloseDate || deal.expected_close_date,
        source: leadSource,
        description: leadDescription
      },
      willArchiveDeal: archiveDeal
    };

    // Add WFM transition info if applicable
    if (deal.currentWfmStep && archiveDeal) {
      preview.wfmTransition = {
        fromStatus: deal.currentWfmStep.status?.name || deal.currentWfmStep.name,
        toStatus: 'Archived',
        reason: conversionReason || 'Converted to lead'
      };
    }

    setPreview(preview);
  };

  const validateConversion = async () => {
    if (!deal) return;

    setIsValidating(true);
    try {
      // TODO: Call GraphQL validation query
      // const result = await validateConversionQuery({
      //   sourceType: 'deal',
      //   sourceId: deal.id,
      //   targetType: 'lead'
      // });

      // Mock validation with WFM status checks
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check if deal has activities that might be lost
      if (!preserveActivities) {
        warnings.push('Deal activities will not be preserved in the lead');
      }

      // Check if deal is in a final status
      const currentStatus = deal.currentWfmStep?.status?.name?.toLowerCase();
      if (currentStatus === 'won' || currentStatus === 'closed won') {
        errors.push('Cannot convert won deals back to leads');
      }

      // Check if deal has significant progress
      if (deal.amount && deal.amount > 50000) {
        warnings.push('High-value deal conversion - consider if this is the right approach');
      }

      const mockValidation: ConversionValidation = {
        isValid: errors.length === 0,
        canProceed: errors.length === 0,
        errors,
        warnings,
        statusValidation: {
          currentStatus: deal.currentWfmStep?.status?.name || 'Unknown',
          allowedStatuses: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'],
          canConvert: !currentStatus || !['won', 'closed won', 'closed lost'].includes(currentStatus),
          reason: currentStatus === 'won' ? 'Won deals cannot be converted back to leads' : undefined
        }
      };

      setValidation(mockValidation);
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        isValid: false,
        canProceed: false,
        errors: ['Failed to validate conversion'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleConvert = async () => {
    if (!deal || !validation?.canProceed || !conversionReason) return;

    setIsLoading(true);
    try {
      // Prepare conversion input
      const conversionInput = {
        preserveActivities,
        createConversionActivity,
        archiveDeal,
        conversionReason,
        notes,
        leadData: {
          name: leadName || deal.name,
          contact_name: contactName || '',
          contact_email: contactEmail || '',
          contact_phone: contactPhone || '',
          company_name: companyName || '',
          estimated_value: estimatedValue || deal.amount || 0,
          estimated_close_date: estimatedCloseDate || deal.expected_close_date,
          source: leadSource || 'deal_conversion',
          description: leadDescription || `Converted from deal: ${deal.name}`
        }
      };

      console.log('🔄 Executing deal conversion with input:', conversionInput);

      // Execute the conversion using the GraphQL mutation
      const result = await convertDealMutation({
        variables: {
          id: deal.id,
          input: conversionInput
        }
      });

      console.log('✅ Deal conversion mutation result:', result);

      if (result.data?.convertDealToLead) {
        const conversionResult = result.data.convertDealToLead;
        console.log('✅ Deal conversion successful, result data:', conversionResult);
        
        toast({
          title: 'Conversion Successful!',
          description: conversionResult.message || `Deal "${deal.name}" has been converted to a lead successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        onConversionComplete(conversionResult);
        onClose();
      } else {
        console.error('❌ No conversion result returned:', result);
        throw new Error('Conversion failed - no result returned');
      }

    } catch (error: unknown) {
      console.error('❌ Deal conversion error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        graphQLErrors: (error as { graphQLErrors?: unknown[] })?.graphQLErrors,
        networkError: (error as { networkError?: unknown })?.networkError,
        extraInfo: (error as { extraInfo?: unknown })?.extraInfo
      });
      toast({
        title: 'Conversion Failed',
        description: error instanceof Error ? error.message : 'Failed to convert deal to lead. Please try again.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNotes('');
    setConversionReason('');
    setPreserveActivities(true);
    setCreateConversionActivity(true);
    setArchiveDeal(true);
    setValidation(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Update preview when form changes
  useEffect(() => {
    if (deal && isOpen) {
      generatePreview();
    }
  }, [
    leadName, contactName, contactEmail, contactPhone, companyName,
    estimatedValue, estimatedCloseDate, leadSource, leadDescription,
    archiveDeal, conversionReason
  ]);

  if (!deal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiTrendingDown} color={colors.text.accent} />
            <Text>Convert Deal to Lead</Text>
            <Icon as={FiArrowLeft} color={colors.text.muted} />
            <Badge colorScheme="orange" variant="subtle">
              Deal → Lead
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Deal Summary */}
            <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px" borderColor={colors.border.subtle}>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold" color={colors.text.primary}>
                  Converting Deal: {deal.name}
                </Text>
                {deal.currentWfmStep?.status && (
                  <Badge 
                    colorScheme={deal.currentWfmStep.status.color === 'green' ? 'green' : 'blue'}
                    variant="subtle"
                  >
                    {deal.currentWfmStep.status.name}
                  </Badge>
                )}
              </HStack>
              <HStack spacing={4} fontSize="sm" color={colors.text.muted}>
                {deal.person && (
                  <HStack>
                    <Icon as={FiUser} />
                    <Text>{deal.person.first_name} {deal.person.last_name}</Text>
                  </HStack>
                )}
                {deal.organization && (
                  <HStack>
                    <Icon as={FiHome} />
                    <Text>{deal.organization.name}</Text>
                  </HStack>
                )}
                {deal.amount && (
                  <Text>Value: {deal.currency || 'USD'} {deal.amount.toLocaleString()}</Text>
                )}
              </HStack>
            </Box>

            {/* Conversion Reason */}
            <FormControl isRequired>
              <FormLabel>Reason for Conversion</FormLabel>
              <Select
                value={conversionReason}
                onChange={(e) => setConversionReason(e.target.value)}
                placeholder="Select reason for converting deal to lead"
              >
                {CONVERSION_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Validation Status */}
            {isValidating ? (
              <HStack p={4} bg={colors.bg.elevated} borderRadius="md">
                <Spinner size="sm" />
                <Text color={colors.text.muted}>Validating conversion...</Text>
              </HStack>
            ) : validation && (
              <VStack spacing={3} align="stretch">
                {validation.errors.length > 0 && (
                  <Alert status="error">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Conversion Blocked!</AlertTitle>
                      <AlertDescription>
                        <VStack align="start" spacing={1}>
                          {validation.errors.map((error, index) => (
                            <Text key={index} fontSize="sm">{error}</Text>
                          ))}
                        </VStack>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {validation.warnings.length > 0 && (
                  <Alert status="warning">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Conversion Warnings</AlertTitle>
                      <AlertDescription>
                        <VStack align="start" spacing={1}>
                          {validation.warnings.map((warning, index) => (
                            <Text key={index} fontSize="sm">{warning}</Text>
                          ))}
                        </VStack>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {validation.statusValidation && (
                  <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px" borderColor={colors.border.subtle}>
                    <Text fontWeight="semibold" mb={2} color={colors.text.primary}>
                      WFM Status Check
                    </Text>
                    <HStack spacing={4} fontSize="sm">
                      <HStack>
                        <Text color={colors.text.muted}>Current Status:</Text>
                        <Badge colorScheme={validation.statusValidation.canConvert ? 'green' : 'red'}>
                          {validation.statusValidation.currentStatus}
                        </Badge>
                      </HStack>
                      <HStack>
                        <Icon 
                          as={validation.statusValidation.canConvert ? FiCheckCircle : FiXCircle} 
                          color={validation.statusValidation.canConvert ? 'green.500' : 'red.500'}
                        />
                        <Text color={validation.statusValidation.canConvert ? 'green.500' : 'red.500'}>
                          {validation.statusValidation.canConvert ? 'Conversion Allowed' : 'Conversion Blocked'}
                        </Text>
                      </HStack>
                    </HStack>
                    {validation.statusValidation.reason && (
                      <Text fontSize="sm" color={colors.text.muted} mt={2}>
                        {validation.statusValidation.reason}
                      </Text>
                    )}
                  </Box>
                )}

                {validation.canProceed && validation.errors.length === 0 && (
                  <Alert status="success">
                    <AlertIcon />
                    <AlertTitle>Ready to Convert!</AlertTitle>
                    <AlertDescription>All validation checks passed.</AlertDescription>
                  </Alert>
                )}
              </VStack>
            )}

            {/* Conversion Preview */}
            {preview && (
              <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px" borderColor={colors.border.subtle}>
                <Text fontWeight="semibold" mb={3} color={colors.text.primary}>
                  Conversion Preview
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Icon as={FiTrendingDown} color={colors.text.accent} />
                    <Text>
                      <strong>Lead:</strong> {preview.leadData.name}
                      {preview.leadData.estimated_value > 0 && ` (${preview.leadData.estimated_value.toLocaleString()})`}
                    </Text>
                  </HStack>
                  
                  {preview.leadData.contact_name && (
                    <HStack>
                      <Icon as={FiUser} color={colors.text.accent} />
                      <Text>
                        <strong>Contact:</strong> {preview.leadData.contact_name}
                        {preview.leadData.contact_email && ` (${preview.leadData.contact_email})`}
                      </Text>
                    </HStack>
                  )}
                  
                  {preview.leadData.company_name && (
                    <HStack>
                      <Icon as={FiHome} color={colors.text.accent} />
                      <Text>
                        <strong>Company:</strong> {preview.leadData.company_name}
                      </Text>
                    </HStack>
                  )}

                  {preview.willArchiveDeal && (
                    <HStack>
                      <Icon as={FiXCircle} color="orange.500" />
                      <Text color="orange.500">
                        <strong>Deal will be archived</strong>
                      </Text>
                    </HStack>
                  )}

                  {preview.wfmTransition && (
                    <Box pl={6} fontSize="sm" color={colors.text.muted}>
                      <Text>
                        WFM Status: {preview.wfmTransition.fromStatus} → {preview.wfmTransition.toStatus}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* Conversion Options */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold" color={colors.text.primary}>
                  Conversion Options
                </Text>
                <Button size="sm" variant="ghost" onClick={toggleAdvanced}>
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>
              </HStack>

              <VStack spacing={4} align="stretch">
                <HStack spacing={6}>
                  {/* Activity options removed - using Google Calendar integration instead */}
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="archive-deal" mb="0" fontSize="sm">
                      Archive Deal
                    </FormLabel>
                    <Switch 
                      id="archive-deal"
                      isChecked={archiveDeal}
                      onChange={(e) => setArchiveDeal(e.target.checked)}
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel fontSize="sm">Conversion Notes</FormLabel>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this conversion..."
                    size="sm"
                    rows={3}
                  />
                </FormControl>
              </VStack>

              <Collapse in={showAdvanced}>
                <VStack spacing={4} align="stretch" pt={4}>
                  <Divider />
                  
                  {/* Lead Customization */}
                  <Box>
                    <Text fontWeight="semibold" mb={3} color={colors.text.primary}>
                      Lead Details
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <FormControl>
                        <FormLabel fontSize="sm">Lead Name</FormLabel>
                        <Input
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          size="sm"
                        />
                      </FormControl>
                      
                      <HStack>
                        <FormControl>
                          <FormLabel fontSize="sm">Contact Name</FormLabel>
                          <Input
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Company Name</FormLabel>
                          <Input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                      </HStack>
                      
                      <HStack>
                        <FormControl>
                          <FormLabel fontSize="sm">Contact Email</FormLabel>
                          <Input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Contact Phone</FormLabel>
                          <Input
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                      </HStack>
                      
                      <HStack>
                        <FormControl>
                          <FormLabel fontSize="sm">Estimated Value</FormLabel>
                          <NumberInput
                            value={estimatedValue}
                            onChange={(value) => setEstimatedValue(Number(value) || 0)}
                            size="sm"
                            min={0}
                          >
                            <NumberInputField />
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel fontSize="sm">Estimated Close Date</FormLabel>
                          <Input
                            type="date"
                            value={estimatedCloseDate}
                            onChange={(e) => setEstimatedCloseDate(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                      </HStack>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Lead Source</FormLabel>
                        <Input
                          value={leadSource}
                          onChange={(e) => setLeadSource(e.target.value)}
                          size="sm"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Description</FormLabel>
                        <Textarea
                          value={leadDescription}
                          onChange={(e) => setLeadDescription(e.target.value)}
                          size="sm"
                          rows={3}
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                </VStack>
              </Collapse>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleConvert}
              isLoading={isLoading}
              loadingText="Converting..."
              isDisabled={!validation?.canProceed || isValidating || !conversionReason}
              leftIcon={<Icon as={FiTrendingDown} />}
            >
              Convert to Lead
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 