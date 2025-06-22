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
  useDisclosure
} from '@chakra-ui/react';
import { FiArrowRight, FiUser, FiHome, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useMutation, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';

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

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onConversionComplete: (result: any) => void;
}

interface ConversionValidation {
  isValid: boolean;
  canProceed: boolean;
  errors: string[];
  warnings: string[];
}

interface ConversionPreview {
  willCreatePerson: boolean;
  willCreateOrganization: boolean;
  personData?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  organizationData?: {
    name: string;
    address: string;
    notes: string;
  };
  dealData: {
    name: string;
    amount: number;
    currency: string;
    expected_close_date?: string;
  };
}

// GraphQL mutation for lead conversion
const CONVERT_LEAD = gql`
  mutation ConvertLead($id: ID!, $input: LeadConversionInput!) {
    convertLead(id: $id, input: $input) {
      leadId
      convertedEntities {
        person {
          id
          first_name
          last_name
          email
        }
        organization {
          id
          name
        }
        deal {
          id
          name
          amount
          currency
        }
      }
    }
  }
`;

export function ConvertLeadModal({ isOpen, onClose, lead, onConversionComplete }: ConvertLeadModalProps) {
  const colors = useThemeColors();
  const toast = useToast();
  const { isOpen: showAdvanced, onToggle: toggleAdvanced } = useDisclosure();
  const apolloClient = useApolloClient();

  // GraphQL mutation
  const [convertLeadMutation] = useMutation(CONVERT_LEAD);

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ConversionValidation | null>(null);
  const [preview, setPreview] = useState<ConversionPreview | null>(null);

  // Conversion options
  const [preserveActivities, setPreserveActivities] = useState(false);
  const [createConversionActivity, setCreateConversionActivity] = useState(true);
  const [notes, setNotes] = useState('');

  // Deal data customization
  const [dealName, setDealName] = useState('');
  const [dealAmount, setDealAmount] = useState<number>(0);
  const [dealCurrency, setDealCurrency] = useState('USD');
  const [dealCloseDate, setDealCloseDate] = useState('');

  // Person data customization
  const [personFirstName, setPersonFirstName] = useState('');
  const [personLastName, setPersonLastName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [personPhone, setPersonPhone] = useState('');

  // Organization data customization
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgNotes, setOrgNotes] = useState('');

  // Initialize form data when lead changes
  useEffect(() => {
    if (lead && isOpen) {
      // Initialize deal data
      setDealName(lead.name || '');
      setDealAmount(lead.estimated_value || 0);
      setDealCloseDate(lead.estimated_close_date || '');

      // Initialize person data
      const nameParts = (lead.contact_name || '').split(' ');
      setPersonFirstName(nameParts[0] || '');
      setPersonLastName(nameParts.slice(1).join(' ') || '');
      setPersonEmail(lead.contact_email || '');
      setPersonPhone(lead.contact_phone || '');

      // Initialize organization data
      setOrgName(lead.company_name || '');
      setOrgAddress('');
      setOrgNotes(`Created from lead: ${lead.name}`);

      // Generate preview
      generatePreview();
      
      // Validate conversion
      validateConversion();
    }
  }, [lead, isOpen]);

  const generatePreview = () => {
    if (!lead) return;

    const willCreatePerson = !!(lead.contact_name || lead.contact_email);
    const willCreateOrganization = !!lead.company_name;

    const preview: ConversionPreview = {
      willCreatePerson,
      willCreateOrganization,
      dealData: {
        name: dealName || lead.name,
        amount: dealAmount || lead.estimated_value || 0,
        currency: dealCurrency,
        expected_close_date: dealCloseDate || lead.estimated_close_date
      }
    };

    if (willCreatePerson) {
      preview.personData = {
        first_name: personFirstName,
        last_name: personLastName,
        email: personEmail,
        phone: personPhone
      };
    }

    if (willCreateOrganization) {
      preview.organizationData = {
        name: orgName,
        address: orgAddress,
        notes: orgNotes
      };
    }

    setPreview(preview);
  };

  const validateConversion = async () => {
    if (!lead) return;

    setIsValidating(true);
    try {
      // TODO: Call GraphQL validation query
      // const result = await validateConversionQuery({
      //   sourceType: 'lead',
      //   sourceId: lead.id,
      //   targetType: 'deal'
      // });

      // Mock validation for now
      const mockValidation: ConversionValidation = {
        isValid: true,
        canProceed: true,
        errors: [],
        warnings: lead.lead_score && lead.lead_score < 50 
          ? ['Lead score is below 50 - consider qualification before conversion']
          : []
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
    if (!lead || !validation?.canProceed) return;

    setIsLoading(true);
    try {
      // First, get the "Sales Deal" project type ID dynamically
      const projectTypesQuery = gql`
        query GetProjectTypes {
          wfmProjectTypes {
            id
            name
          }
        }
      `;
      
      const projectTypesResult = await apolloClient.query({
        query: projectTypesQuery
      });
      
      const projectTypes = projectTypesResult.data?.wfmProjectTypes || [];
      const salesDealProjectType = projectTypes.find((pt: any) => pt.name === 'Sales Deal');
      
      if (!salesDealProjectType) {
        throw new Error('Sales Deal project type not found. Please ensure the project type exists.');
      }

      // Prepare conversion input with the correct project type ID
      const conversionInput: any = {
        targetType: 'DEAL',
        preserveActivities,
        createConversionActivity,
        dealData: {
          name: dealName || lead.name,
          amount: dealAmount || lead.estimated_value || 0,
          currency: dealCurrency,
          expected_close_date: dealCloseDate || lead.estimated_close_date,
          wfmProjectTypeId: salesDealProjectType.id
        }
      };

      // Add person data if needed
      if (preview?.willCreatePerson && (personFirstName || personLastName || personEmail)) {
        conversionInput.personData = {
          first_name: personFirstName || '',
          last_name: personLastName || '',
          email: personEmail || '',
          phone: personPhone || ''
        };
      }

      // Add organization data if needed  
      if (preview?.willCreateOrganization && orgName) {
        conversionInput.organizationData = {
          name: orgName,
          address: orgAddress,
          notes: orgNotes
        };
      }

      // Execute the conversion
      console.log('🔄 Executing lead conversion with input:', conversionInput);
      const result = await convertLeadMutation({
        variables: {
          id: lead.id,
          input: conversionInput
        }
      });

      console.log('✅ Conversion mutation result:', result);

      if (result.data?.convertLead) {
        console.log('✅ Conversion successful, result data:', result.data.convertLead);
        toast({
          title: 'Conversion Successful',
          description: `Lead "${lead.name}" has been converted to a deal successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Call the completion callback
        if (onConversionComplete) {
          onConversionComplete(result.data.convertLead);
        }

        // Close the modal
        onClose();
      } else {
        console.error('❌ No conversion result returned:', result);
        throw new Error('Conversion failed - no result returned');
      }
    } catch (error: any) {
      console.error('❌ Conversion error details:', {
        error,
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        extraInfo: error.extraInfo
      });
      toast({
        title: 'Conversion Failed',
        description: error.message || 'Failed to convert lead to deal. Please try again.',
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
    setPreserveActivities(false);
    setCreateConversionActivity(true);
    setValidation(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!lead) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiTrendingUp} color={colors.text.accent} />
            <Text>Convert Lead to Deal</Text>
            <Icon as={FiArrowRight} color={colors.text.muted} />
            <Badge colorScheme="green" variant="subtle">
              Lead → Deal
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Lead Summary */}
            <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px" borderColor={colors.border.subtle}>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold" color={colors.text.primary}>
                  Converting Lead: {lead.name}
                </Text>
                {lead.lead_score && (
                  <Badge colorScheme={lead.lead_score >= 70 ? 'green' : lead.lead_score >= 50 ? 'yellow' : 'red'}>
                    Score: {lead.lead_score}
                  </Badge>
                )}
              </HStack>
              <HStack spacing={4} fontSize="sm" color={colors.text.muted}>
                {lead.contact_name && (
                  <HStack>
                    <Icon as={FiUser} />
                    <Text>{lead.contact_name}</Text>
                  </HStack>
                )}
                {lead.company_name && (
                  <HStack>
                    <Icon as={FiHome} />
                    <Text>{lead.company_name}</Text>
                  </HStack>
                )}
                {lead.estimated_value && (
                  <Text>Value: ${lead.estimated_value.toLocaleString()}</Text>
                )}
              </HStack>
            </Box>

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
                    <Icon as={FiTrendingUp} color={colors.text.accent} />
                    <Text>
                      <strong>Deal:</strong> {preview.dealData.name} 
                      {preview.dealData.amount > 0 && ` (${preview.dealData.currency} ${preview.dealData.amount.toLocaleString()})`}
                    </Text>
                  </HStack>
                  
                  {preview.willCreatePerson && preview.personData && (
                    <HStack>
                      <Icon as={FiUser} color={colors.status.info} />
                      <Text>
                        <strong>New Person:</strong> {preview.personData.first_name} {preview.personData.last_name}
                        {preview.personData.email && ` (${preview.personData.email})`}
                      </Text>
                    </HStack>
                  )}
                  
                  {preview.willCreateOrganization && preview.organizationData && (
                    <HStack>
                      <Icon as={FiHome} color={colors.status.success} />
                      <Text>
                        <strong>New Organization:</strong> {preview.organizationData.name}
                      </Text>
                    </HStack>
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

              <HStack spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="preserve-activities" mb="0" fontSize="sm">
                    Preserve Activities
                  </FormLabel>
                  <Switch 
                    id="preserve-activities"
                    isChecked={preserveActivities}
                    onChange={(e) => setPreserveActivities(e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="create-activity" mb="0" fontSize="sm">
                    Create Conversion Activity
                  </FormLabel>
                  <Switch 
                    id="create-activity"
                    isChecked={createConversionActivity}
                    onChange={(e) => setCreateConversionActivity(e.target.checked)}
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

              <Collapse in={showAdvanced}>
                <VStack spacing={4} align="stretch" pt={4}>
                  <Divider />
                  
                  {/* Deal Customization */}
                  <Box>
                    <Text fontWeight="semibold" mb={3} color={colors.text.primary}>
                      Deal Details
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <FormControl>
                        <FormLabel fontSize="sm">Deal Name</FormLabel>
                        <Input
                          value={dealName}
                          onChange={(e) => setDealName(e.target.value)}
                          size="sm"
                        />
                      </FormControl>
                      
                      <HStack>
                        <FormControl>
                          <FormLabel fontSize="sm">Amount</FormLabel>
                          <NumberInput
                            value={dealAmount}
                            onChange={(value) => setDealAmount(Number(value) || 0)}
                            size="sm"
                            min={0}
                          >
                            <NumberInputField />
                          </NumberInput>
                        </FormControl>
                        
                        <FormControl maxW="120px">
                          <FormLabel fontSize="sm">Currency</FormLabel>
                          <Input
                            value={dealCurrency}
                            onChange={(e) => setDealCurrency(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                      </HStack>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Expected Close Date</FormLabel>
                        <Input
                          type="date"
                          value={dealCloseDate}
                          onChange={(e) => setDealCloseDate(e.target.value)}
                          size="sm"
                        />
                      </FormControl>
                    </VStack>
                  </Box>

                  {/* Person Customization */}
                  {preview?.willCreatePerson && (
                    <Box>
                      <Text fontWeight="semibold" mb={3} color={colors.text.primary}>
                        Person Details
                      </Text>
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <FormControl>
                            <FormLabel fontSize="sm">First Name</FormLabel>
                            <Input
                              value={personFirstName}
                              onChange={(e) => setPersonFirstName(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Last Name</FormLabel>
                            <Input
                              value={personLastName}
                              onChange={(e) => setPersonLastName(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                        </HStack>
                        
                        <HStack>
                          <FormControl>
                            <FormLabel fontSize="sm">Email</FormLabel>
                            <Input
                              type="email"
                              value={personEmail}
                              onChange={(e) => setPersonEmail(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Phone</FormLabel>
                            <Input
                              value={personPhone}
                              onChange={(e) => setPersonPhone(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  {/* Organization Customization */}
                  {preview?.willCreateOrganization && (
                    <Box>
                      <Text fontWeight="semibold" mb={3} color={colors.text.primary}>
                        Organization Details
                      </Text>
                      <VStack spacing={3} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="sm">Organization Name</FormLabel>
                          <Input
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel fontSize="sm">Address</FormLabel>
                          <Input
                            value={orgAddress}
                            onChange={(e) => setOrgAddress(e.target.value)}
                            size="sm"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel fontSize="sm">Notes</FormLabel>
                          <Textarea
                            value={orgNotes}
                            onChange={(e) => setOrgNotes(e.target.value)}
                            size="sm"
                            rows={2}
                          />
                        </FormControl>
                      </VStack>
                    </Box>
                  )}
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
              colorScheme="blue"
              onClick={handleConvert}
              isLoading={isLoading}
              loadingText="Converting..."
              isDisabled={!validation?.canProceed || isValidating}
              leftIcon={<Icon as={FiCheckCircle} />}
            >
              Convert to Deal
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 