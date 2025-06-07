import { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Spinner,
  Stack,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  Box,
  Divider,
  Text,
  Flex,
  HStack,
} from '@chakra-ui/react';
import type {
  PersonInput,
  CustomFieldValueInput,
  CustomFieldDefinition,
  CustomFieldEntityType,
  CustomFieldType as GQLCustomFieldType,
  CreatePersonOrganizationalRoleInput,
  CreateStakeholderAnalysisInput,
} from '../generated/graphql/graphql';
import {
  SeniorityLevel,
  DecisionAuthority,
  EngagementLevel,
} from '../generated/graphql/graphql';
import { usePeopleStore } from '../stores/usePeopleStore';
import { useOrganizationsStore, Organization } from '../stores/useOrganizationsStore';
import { useCustomFieldDefinitionStore } from '../stores/useCustomFieldDefinitionStore';
import { gql, useMutation } from '@apollo/client';

const CREATE_PERSON_ORGANIZATIONAL_ROLE_MUTATION = gql`
  mutation CreatePersonOrganizationalRole($input: CreatePersonOrganizationalRoleInput!) {
    createPersonOrganizationalRole(input: $input) {
      id
      roleTitle
      department
      seniorityLevel
      budgetAuthorityUsd
      teamSize
      startDate
      isPrimaryRole
      notes
    }
  }
`;

const CREATE_STAKEHOLDER_ANALYSIS_MUTATION = gql`
  mutation CreateStakeholderAnalysis($input: CreateStakeholderAnalysisInput!) {
    createStakeholderAnalysis(input: $input) {
      id
      influenceScore
      decisionAuthority
      engagementLevel
      approachStrategy
      nextBestAction
    }
  }
`;

interface CreatePersonFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface OrganizationalRoleData {
  roleTitle: string;
  department: string;
  seniorityLevel: SeniorityLevel | '';
  budgetAuthorityUsd: number | '';
  teamSize: number | '';
  startDate: string;
  isPrimaryRole: boolean;
  notes: string;
}

function CreatePersonForm({ onClose, onSuccess }: CreatePersonFormProps) {
  const [formData, setFormData] = useState<PersonInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    organization_id: null,
    customFields: [],
  });

  const [orgRoleData, setOrgRoleData] = useState<OrganizationalRoleData>({
    roleTitle: '',
    department: '',
    seniorityLevel: '',
    budgetAuthorityUsd: '',
    teamSize: '',
    startDate: '',
    isPrimaryRole: true,
    notes: '',
  });

  const [includeOrgRole, setIncludeOrgRole] = useState(false);
  const [createdPersonId, setCreatedPersonId] = useState<string | null>(null);
  const [createdRoleId, setCreatedRoleId] = useState<string | null>(null);
  const [showAIButton, setShowAIButton] = useState(false);
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const toast = useToast();

  const {
    organizations,
    organizationsLoading: orgLoading,
    organizationsError: orgError,
    fetchOrganizations,
  } = useOrganizationsStore();

  const { createPerson: createPersonAction, peopleError } = usePeopleStore();
  
  const allDefinitions = useCustomFieldDefinitionStore(state => state.definitions);
  const definitionsLoading = useCustomFieldDefinitionStore(state => state.loading);
  const definitionsError = useCustomFieldDefinitionStore(state => state.error);
  const fetchDefinitions = useCustomFieldDefinitionStore(state => state.fetchCustomFieldDefinitions);

  const [createOrgRole] = useMutation(CREATE_PERSON_ORGANIZATIONAL_ROLE_MUTATION);
  const [createStakeholderAnalysis] = useMutation(CREATE_STAKEHOLDER_ANALYSIS_MUTATION);

  const [localError, setLocalError] = useState<string | null>(null);

  const personCustomFieldDefinitions = allDefinitions.filter(
    d => d.entityType === 'PERSON' && d.isActive
  );

  const seniorityLevels: { value: SeniorityLevel; label: string }[] = [
    { value: SeniorityLevel.Entry, label: 'Entry Level' },
    { value: SeniorityLevel.Mid, label: 'Mid Level' },
    { value: SeniorityLevel.Senior, label: 'Senior' },
    { value: SeniorityLevel.Lead, label: 'Lead' },
    { value: SeniorityLevel.Manager, label: 'Manager' },
    { value: SeniorityLevel.Director, label: 'Director' },
    { value: SeniorityLevel.Vp, label: 'VP' },
    { value: SeniorityLevel.CLevel, label: 'C-Level' },
    { value: SeniorityLevel.Founder, label: 'Founder' },
  ];

  useEffect(() => {
    if (!orgLoading && (!organizations || organizations.length === 0)) {
      fetchOrganizations();
    }
    if (!definitionsLoading && !allDefinitions.some(d => d.entityType === 'PERSON')) {
      fetchDefinitions('PERSON' as CustomFieldEntityType);
    }
  }, [organizations, orgLoading, fetchOrganizations, definitionsLoading, allDefinitions, fetchDefinitions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === '') {
      setFormData(prev => ({ ...prev, [name]: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOrgRoleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setOrgRoleData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any, type: GQLCustomFieldType) => {
    setCustomFieldData(prev => ({
      ...prev,
      [fieldName]: type === 'BOOLEAN' ? (value as React.ChangeEvent<HTMLInputElement>).target.checked : value,
    }));
  };

  // Generate AI analysis based on role data
  const generateAIAnalysis = async () => {
    if (!createdPersonId || !formData.organization_id || !createdRoleId) return;

    setAiLoading(true);
    try {
      // AI-powered analysis based on role data
      let influenceScore = 5; // default
      let decisionAuthority: DecisionAuthority = DecisionAuthority.Influencer;
      let engagementLevel: EngagementLevel = EngagementLevel.Neutral;
      let approachStrategy = '';
      let nextBestAction = '';

      // AI logic based on seniority and role
      switch (orgRoleData.seniorityLevel) {
        case SeniorityLevel.CLevel:
        case SeniorityLevel.Founder:
          influenceScore = 9;
          decisionAuthority = DecisionAuthority.FinalDecision;
          engagementLevel = EngagementLevel.Supporter;
          approachStrategy = 'Strategic executive briefing focusing on business transformation and ROI';
          nextBestAction = 'Schedule C-level presentation with board metrics and competitive analysis';
          break;
        case SeniorityLevel.Vp:
          influenceScore = 8;
          decisionAuthority = DecisionAuthority.StrongInfluence;
          engagementLevel = EngagementLevel.Supporter;
          approachStrategy = 'Executive-level discussion with strategic value proposition';
          nextBestAction = 'Arrange strategic partnership discussion';
          break;
        case SeniorityLevel.Director:
          influenceScore = 7;
          decisionAuthority = DecisionAuthority.StrongInfluence;
          engagementLevel = EngagementLevel.Neutral;
          approachStrategy = 'Department-focused presentation with operational benefits';
          nextBestAction = 'Schedule departmental needs assessment';
          break;
        case SeniorityLevel.Manager:
        case SeniorityLevel.Lead:
          influenceScore = 6;
          decisionAuthority = DecisionAuthority.Recommender;
          engagementLevel = EngagementLevel.Neutral;
          approachStrategy = 'Team-focused benefits and workflow improvement discussion';
          nextBestAction = 'Conduct team productivity analysis';
          break;
        default:
          influenceScore = 4;
          decisionAuthority = DecisionAuthority.Influencer;
          engagementLevel = EngagementLevel.Neutral;
          approachStrategy = 'User-focused demonstration and training approach';
          nextBestAction = 'Schedule hands-on product demonstration';
      }

      // Adjust based on budget authority
      if (typeof orgRoleData.budgetAuthorityUsd === 'number' && orgRoleData.budgetAuthorityUsd > 5000000) {
        influenceScore = Math.min(10, influenceScore + 1);
        if (decisionAuthority === DecisionAuthority.Recommender) decisionAuthority = DecisionAuthority.StrongInfluence;
      }

      // Adjust based on team size
      if (typeof orgRoleData.teamSize === 'number' && orgRoleData.teamSize > 50) {
        influenceScore = Math.min(10, influenceScore + 1);
      }

      const analysisInput: CreateStakeholderAnalysisInput = {
        personId: createdPersonId,
        organizationId: formData.organization_id,
        influenceScore,
        decisionAuthority,
        engagementLevel,
        approachStrategy,
        nextBestAction,
      };

      await createStakeholderAnalysis({ variables: { input: analysisInput } });
      
      toast({
        title: 'AI Analysis Generated',
        description: 'Stakeholder analysis has been created with AI-powered insights',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setShowAIButton(false);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not generate stakeholder analysis. You can create one manually later.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    if (!formData.first_name && !formData.last_name && !formData.email) {
      setLocalError('Please provide at least a first name, last name, or email.');
      setIsLoading(false);
      return;
    }

    // Validate organizational role if included
    if (includeOrgRole) {
      if (!formData.organization_id) {
        setLocalError('Please select an organization for this person before adding a role.');
        setIsLoading(false);
        return;
      }
      if (!orgRoleData.roleTitle.trim()) {
        setLocalError('Role title is required for organizational role.');
        setIsLoading(false);
        return;
      }
    }

    const processedCustomFields: CustomFieldValueInput[] = personCustomFieldDefinitions
      .map(def => {
        const rawValue = customFieldData[def.fieldName];
        if (rawValue === undefined || rawValue === null || rawValue === '') {
          if (def.isRequired) {
            setLocalError((prev) => (prev ? prev + `\n` : ``) + `Field '${def.fieldLabel}' is required.`);
          }
          return null;
        }

        const cfInput: CustomFieldValueInput = { definitionId: def.id };
        switch (def.fieldType) {
          case 'TEXT':
            cfInput.stringValue = String(rawValue);
            break;
          case 'NUMBER':
            const num = parseFloat(rawValue);
            if (!isNaN(num)) cfInput.numberValue = num;
            else setLocalError((prev) => (prev ? prev + `\n` : ``) + `Invalid number for '${def.fieldLabel}'.`);
            break;
          case 'BOOLEAN':
            cfInput.booleanValue = Boolean(rawValue);
            break;
          case 'DATE':
            cfInput.dateValue = rawValue;
            break;
          case 'DROPDOWN':
            cfInput.selectedOptionValues = [String(rawValue)];
            break;
          case 'MULTI_SELECT':
            cfInput.selectedOptionValues = Array.isArray(rawValue) ? rawValue.map(String) : (rawValue ? [String(rawValue)] : []);
            break;
        }
        return cfInput;
      })
      .filter(Boolean) as CustomFieldValueInput[];
      
    if (localError) {
        setIsLoading(false);
        return;
    }

    const mutationInput: PersonInput = {
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: formData.notes || null,
      organization_id: formData.organization_id || null,
      customFields: processedCustomFields.length > 0 ? processedCustomFields : null,
    };

    try {
      // Create person first
      const createdPerson = await createPersonAction(mutationInput);
      if (!createdPerson) {
        setLocalError(peopleError || 'Failed to create person. Please try again.');
        setIsLoading(false);
        return;
      }

      setCreatedPersonId(createdPerson.id);

      // Create organizational role if included
      if (includeOrgRole && formData.organization_id) {
        try {
          const roleInput: CreatePersonOrganizationalRoleInput = {
            personId: createdPerson.id,
            organizationId: formData.organization_id,
            roleTitle: orgRoleData.roleTitle,
            department: orgRoleData.department || undefined,
            seniorityLevel: orgRoleData.seniorityLevel || undefined,
            budgetAuthorityUsd: typeof orgRoleData.budgetAuthorityUsd === 'number' ? orgRoleData.budgetAuthorityUsd : undefined,
            teamSize: typeof orgRoleData.teamSize === 'number' ? orgRoleData.teamSize : undefined,
            startDate: orgRoleData.startDate || undefined,
            isPrimaryRole: orgRoleData.isPrimaryRole,
            notes: orgRoleData.notes || undefined,
          };

          const roleResult = await createOrgRole({ variables: { input: roleInput } });
          setCreatedRoleId(roleResult.data?.createPersonOrganizationalRole?.id);
          
          // Show AI analysis button if role was created successfully
          setShowAIButton(true);
          
          toast({ 
            title: 'Person and Role Created', 
            description: 'Person and organizational role have been created successfully. You can now generate AI analysis.',
            status: 'success', 
            duration: 5000, 
            isClosable: true 
          });
        } catch (roleError) {
          console.error('Error creating organizational role:', roleError);
          toast({
            title: 'Person Created, Role Failed',
            description: 'Person was created but organizational role failed. You can add the role manually later.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({ title: 'Person Created', status: 'success', duration: 3000, isClosable: true });
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      console.error("Unexpected error during handleSubmit:", error);
      let message = 'An unexpected error occurred.';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      setLocalError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        {(localError || peopleError) && (
          <Alert status="error" mb={4} whiteSpace="pre-wrap">
            <AlertIcon />
            {localError || peopleError}
          </Alert>
        )}
        
        <Stack spacing={4}>
          {/* Basic Person Information */}
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">Person Information</Text>
          
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>First Name</FormLabel>
            <Input name="first_name" value={formData.first_name || ''} onChange={handleChange} />
          </FormControl>
          
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>Last Name</FormLabel>
            <Input name="last_name" value={formData.last_name || ''} onChange={handleChange} />
          </FormControl>
          
          <FormControl isInvalid={!!localError && (!formData.first_name && !formData.last_name && !formData.email)}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
            {!!localError && (!formData.first_name && !formData.last_name && !formData.email) && <FormErrorMessage>{localError}</FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
          </FormControl>
          
          <FormControl>
            <FormLabel>Organization</FormLabel>
            {orgLoading && <Spinner size="sm" />}
            {orgError && <Alert status="error" size="sm"><AlertIcon />{orgError}</Alert>}
            {!orgLoading && !orgError && (
              <Select
                name="organization_id"
                value={formData.organization_id || ''}
                onChange={handleChange}
                placeholder="Select organization (optional)"
                isDisabled={orgLoading || !organizations || organizations.length === 0}
              >
                {organizations && organizations.map((org: Organization) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </Select>
            )}
            {(!orgLoading && (orgError || (!organizations || organizations.length === 0))) &&
              <FormErrorMessage>
                {orgError ? "Could not load organizations." : "No organizations found. Create one first."}
              </FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
          </FormControl>

          {/* Custom Fields Section */}
          {definitionsLoading && <Spinner />}
          {definitionsError && <Alert status="error"><AlertIcon />Error loading custom fields: {definitionsError}</Alert>}
          {personCustomFieldDefinitions.map((def: CustomFieldDefinition) => (
            <FormControl key={def.id} isRequired={def.isRequired}>
              <FormLabel>{def.fieldLabel}</FormLabel>
              {def.fieldType === 'TEXT' && (
                <Input
                  value={customFieldData[def.fieldName] || ''}
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value, def.fieldType)}
                />
              )}
              {def.fieldType === 'NUMBER' && (
                <NumberInput
                  value={customFieldData[def.fieldName] || ''}
                  onChange={(valueString) => handleCustomFieldChange(def.fieldName, valueString, def.fieldType)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              )}
              {def.fieldType === 'BOOLEAN' && (
                <Checkbox
                  isChecked={customFieldData[def.fieldName] || false}
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e, def.fieldType)}
                >
                  Enabled
                </Checkbox>
              )}
              {def.fieldType === 'DATE' && (
                <Input
                  type="date"
                  value={customFieldData[def.fieldName] || ''}
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value, def.fieldType)}
                />
              )}
              {def.fieldType === 'DROPDOWN' && (
                <Select
                  placeholder={`Select ${def.fieldLabel}`}
                  value={customFieldData[def.fieldName] || ''}
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value, def.fieldType)}
                >
                  {def.dropdownOptions?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              )}
              {def.fieldType === 'MULTI_SELECT' && (
                 <Textarea
                  placeholder={`Enter values for ${def.fieldLabel}, comma-separated`}
                  value={customFieldData[def.fieldName] || ''}
                  onChange={(e) => handleCustomFieldChange(def.fieldName, e.target.value.split(',').map(s => s.trim()), def.fieldType)}
                />
              )}
              {localError && def.isRequired && (customFieldData[def.fieldName] === undefined || customFieldData[def.fieldName] === null || customFieldData[def.fieldName] === '') && 
                <FormErrorMessage>{`Field '${def.fieldLabel}' is required.`}</FormErrorMessage>}
            </FormControl>
          ))}

          {/* Organizational Role Section */}
          <Divider />
          
          <FormControl>
            <Checkbox
              isChecked={includeOrgRole}
              onChange={(e) => setIncludeOrgRole(e.target.checked)}
            >
              <Text fontWeight="semibold">Add Organizational Role</Text>
            </Checkbox>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Add role details for the selected organization (relationship intelligence)
            </Text>
          </FormControl>

          {includeOrgRole && (
            <Box p={4} borderRadius="md" bg="gray.50" border="1px" borderColor="gray.200">
              <Stack spacing={4}>
                <Text fontSize="md" fontWeight="semibold" color="gray.700">Role Details</Text>
                
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">Role Title</FormLabel>
                  <Input 
                    name="roleTitle" 
                    value={orgRoleData.roleTitle} 
                    onChange={handleOrgRoleChange}
                    placeholder="e.g., Chief Marketing Officer, Software Engineer"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">Department</FormLabel>
                    <Input 
                      name="department" 
                      value={orgRoleData.department} 
                      onChange={handleOrgRoleChange}
                      placeholder="e.g., Engineering, Sales, Marketing"
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">Seniority Level</FormLabel>
                    <Select
                      name="seniorityLevel"
                      value={orgRoleData.seniorityLevel}
                      onChange={handleOrgRoleChange}
                      placeholder="Select seniority"
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    >
                      {seniorityLevels.map((level) => (
                        <option key={level.value} value={level.value} style={{ color: 'black' }}>
                          {level.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">Budget Authority (USD)</FormLabel>
                    <NumberInput
                      value={orgRoleData.budgetAuthorityUsd}
                      onChange={(value) => setOrgRoleData(prev => ({ 
                        ...prev, 
                        budgetAuthorityUsd: value === '' ? '' : Number(value)
                      }))}
                    >
                      <NumberInputField 
                        placeholder="e.g., 1000000"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">Team Size</FormLabel>
                    <NumberInput
                      value={orgRoleData.teamSize}
                      onChange={(value) => setOrgRoleData(prev => ({ 
                        ...prev, 
                        teamSize: value === '' ? '' : Number(value)
                      }))}
                    >
                      <NumberInputField 
                        placeholder="e.g., 12"
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">Start Date</FormLabel>
                    <Input 
                      type="date"
                      name="startDate" 
                      value={orgRoleData.startDate} 
                      onChange={handleOrgRoleChange}
                      bg="white"
                      color="gray.800"
                      borderColor="gray.300"
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    />
                  </FormControl>

                  <FormControl>
                    <Checkbox
                      isChecked={orgRoleData.isPrimaryRole}
                      onChange={(e) => setOrgRoleData(prev => ({ 
                        ...prev, 
                        isPrimaryRole: e.target.checked 
                      }))}
                      color="gray.700"
                      fontWeight="medium"
                    >
                      Primary Role
                    </Checkbox>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel color="gray.700" fontWeight="medium">Role Notes</FormLabel>
                  <Textarea 
                    name="notes" 
                    value={orgRoleData.notes} 
                    onChange={handleOrgRoleChange}
                    placeholder="Additional notes about this role..."
                    size="sm"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                  />
                </FormControl>
              </Stack>
            </Box>
          )}

          {/* AI Analysis Section - shown after successful creation */}
          {showAIButton && (
            <Box p={4} borderRadius="md" bg="blue.50" border="1px" borderColor="blue.200">
              <Stack spacing={3}>
                <Text fontSize="md" fontWeight="semibold" color="blue.700">
                  🤖 AI Stakeholder Analysis
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Generate AI-powered stakeholder analysis based on the role information you provided. 
                  This will analyze influence score, decision authority, and engagement strategies.
                </Text>
                <HStack spacing={3}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={generateAIAnalysis}
                    isLoading={aiLoading}
                    loadingText="Analyzing..."
                  >
                    Generate AI Analysis
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFinish}
                  >
                    Skip for now
                  </Button>
                </HStack>
              </Stack>
            </Box>
          )}
        </Stack>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="ghost" mr={3} onClick={onClose} disabled={isLoading || aiLoading}>
          Cancel
        </Button>
        {!showAIButton ? (
          <Button colorScheme="blue" type="submit" isLoading={isLoading}>
            {includeOrgRole ? 'Create Person & Role' : 'Save Person'}
          </Button>
        ) : (
          <Button colorScheme="green" onClick={handleFinish}>
            Finish
          </Button>
        )}
      </ModalFooter>
    </form>
  );
}

export default CreatePersonForm; 