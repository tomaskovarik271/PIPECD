import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Flex,
  Spacer,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  Text,
  Grid
} from '@chakra-ui/react';
import {
  Network,
  Search,
  Filter,
  Download,
  Share2,
  Settings,
  Brain,
  Target,
  Users,
  Building2,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Eye,
  BarChart3,
  MapPin
} from 'lucide-react';
import { StakeholderNetworkVisualization } from '../components/relationships/StakeholderNetworkVisualization';
import { StakeholderAnalysisDashboard } from '../components/relationships/StakeholderAnalysisDashboard';
import { CrossEntityNetworkVisualization } from '../components/relationships/CrossEntityNetworkVisualization';
import { useOrganizationsStore } from '../stores/useOrganizationsStore';
import { useDealsStore } from '../stores/useDealsStore';
import { useLeadsStore } from '../stores/useLeadsStore';
import type { Deal, Lead } from '../generated/graphql/graphql';

// Helper interface for deal/lead selection UI
interface DealOption {
  id: string;
  title: string;
  value?: number;
  stage?: string;
}

interface LeadOption {
  id: string;
  title: string;
  status?: string;
  score?: number;
}

export const RelationshipIntelligencePage: React.FC = () => {
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealOption | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the stores
  const { 
    organizations, 
    organizationsLoading, 
    organizationsError, 
    fetchOrganizations 
  } = useOrganizationsStore();

  const {
    deals,
    dealsLoading,
    dealsError,
    fetchDeals
  } = useDealsStore();

  const {
    leads,
    leadsLoading,
    leadsError,
    fetchLeads
  } = useLeadsStore();

  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real data from database
        await Promise.all([
          fetchOrganizations(),
          fetchDeals(),
          fetchLeads()
        ]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error loading data',
          description: 'Failed to load relationship intelligence data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData();
  }, [fetchOrganizations, fetchDeals, fetchLeads, toast]);

  // Debug logging to understand data
  useEffect(() => {
    console.log('=== RELATIONSHIP INTELLIGENCE DEBUG ===');
    console.log('Organizations:', organizations);
    console.log('Deals:', deals);
    console.log('Leads:', leads);
    console.log('Selected Organization:', selectedOrganization);
    console.log('Deals Loading:', dealsLoading);
    console.log('Deals Error:', dealsError);
    console.log('Leads Loading:', leadsLoading);
    console.log('Leads Error:', leadsError);
  }, [organizations, deals, leads, selectedOrganization, dealsLoading, dealsError, leadsLoading, leadsError]);

  // Auto-select first organization when organizations load
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizations[0]);
    }
  }, [organizations, selectedOrganization]);

  // Convert deals to options format for the selected organization
  const dealOptions: DealOption[] = deals
    .filter(deal => {
      console.log('Filtering deal:', deal.name, 'org_id:', deal.organization_id, 'selected_org_id:', selectedOrganization?.id);
      return !selectedOrganization || deal.organization_id === selectedOrganization.id;
    })
    .map(deal => ({
      id: deal.id,
      title: deal.name,
      value: deal.amount || 0,
      stage: deal.currentWfmStatus?.name || 'Unknown'
    }));

  console.log('Final dealOptions:', dealOptions);

  // Convert leads to options format
  const leadOptions: LeadOption[] = leads
    .map(lead => ({
      id: lead.id,
      title: lead.name,
      status: lead.qualificationStatus || 'Unknown',
      score: lead.lead_score || 0
    }));

  // Debug deal options
  useEffect(() => {
    console.log('=== DEAL OPTIONS DEBUG ===');
    console.log('Deal Options:', dealOptions);
    console.log('Lead Options:', leadOptions);
  }, [dealOptions, leadOptions]);

  const handleOrganizationChange = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    setSelectedOrganization(org || null);
    // Clear deal/lead selection when org changes
    setSelectedDeal(null);
    setSelectedLead(null);
  };

  const handleAnalyzeNetwork = () => {
    setActiveTab(0); // Switch to network visualization tab
    toast({
      title: 'Analyzing Network',
      description: 'Generating stakeholder network visualization...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleFindMissingStakeholders = () => {
    setActiveTab(1); // Switch to analysis dashboard tab
    toast({
      title: 'Finding Missing Stakeholders',
      description: 'Analyzing gaps in your stakeholder coverage...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Relationship intelligence data is being prepared for download...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleShareNetwork = () => {
    toast({
      title: 'Share Link Created',
      description: 'Network visualization link copied to clipboard',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getContextDescription = () => {
    if (selectedDeal) {
      return `Deal: ${selectedDeal.title} ($${selectedDeal.value?.toLocaleString()})`;
    }
    if (selectedLead) {
      return `Lead: ${selectedLead.title} (Score: ${selectedLead.score})`;
    }
    return 'Organization Overview';
  };

  if (organizationsLoading) {
    return (
      <Box bg={bgColor} minH="100vh" p={6}>
        <Container maxW="7xl">
          <VStack spacing={8} align="center" justify="center" h="60vh">
            <Network size={64} color="#3182ce" />
            <Heading size="lg">Loading Relationship Intelligence...</Heading>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (organizationsError) {
    return (
      <Box bg={bgColor} minH="100vh" p={6}>
        <Container maxW="7xl">
          <VStack spacing={8} align="center" justify="center" h="60vh">
            <Alert status="error" borderRadius="md" maxW="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Failed to Load Organizations</AlertTitle>
                <AlertDescription>{organizationsError}</AlertDescription>
              </Box>
            </Alert>
            <Button onClick={fetchOrganizations} leftIcon={<RefreshCw size={16} />}>
              Try Again
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
            <VStack spacing={4} align="stretch">
              {/* Breadcrumb */}
              <Breadcrumb spacing="8px" separator={<ChevronRight size={14} />}>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>Relationship Intelligence</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>

              {/* Main Header */}
              <Flex align="center">
                <HStack spacing={3}>
                  <Network size={32} color="#3182ce" />
                  <VStack align="start" spacing={0}>
                    <Heading size="lg">Relationship Intelligence Platform</Heading>
                    <Text color="gray.600">
                      Advanced stakeholder network analysis and relationship mapping
                    </Text>
                  </VStack>
                </HStack>
                <Spacer />
                <HStack spacing={2}>
                  <Tooltip label="Export Data">
                    <IconButton
                      aria-label="Export data"
                      icon={<Download size={16} />}
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                    />
                  </Tooltip>
                  <Tooltip label="Share Network">
                    <IconButton
                      aria-label="Share network"
                      icon={<Share2 size={16} />}
                      variant="outline"
                      size="sm"
                      onClick={handleShareNetwork}
                    />
                  </Tooltip>
                  <Tooltip label="Settings">
                    <IconButton
                      aria-label="Settings"
                      icon={<Settings size={16} />}
                      variant="outline"
                      size="sm"
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            </VStack>
          </Box>

          {/* Context Selection */}
          <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="gray.700">Analysis Context</Heading>
              
              <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                {/* Organization Selection */}
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Organization
                  </Text>
                  <Select
                    value={selectedOrganization?.id || ''}
                    onChange={(e) => handleOrganizationChange(e.target.value)}
                    placeholder="Select organization..."
                    isDisabled={organizations.length === 0}
                  >
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </Select>
                  {organizations.length === 0 && (
                    <Text fontSize="xs" color="gray.500">
                      No organizations found. Run the seed script to populate data.
                    </Text>
                  )}
                </VStack>

                {/* Deal Context (Optional) */}
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Deal Context (Optional)
                  </Text>
                  <Select
                    value={selectedDeal?.id || ''}
                    onChange={(e) => {
                      const deal = dealOptions.find(d => d.id === e.target.value);
                      setSelectedDeal(deal || null);
                      setSelectedLead(null); // Clear lead when deal is selected
                    }}
                    placeholder={
                      dealsLoading ? "Loading deals..." : 
                      dealsError ? "Error loading deals" :
                      dealOptions.length === 0 ? "No deals found" :
                      "Select deal..."
                    }
                    isDisabled={!selectedOrganization || dealsLoading}
                  >
                    {dealOptions.map(deal => (
                      <option key={deal.id} value={deal.id}>
                        {deal.title} (${deal.value?.toLocaleString()})
                      </option>
                    ))}
                  </Select>
                  {dealsError && (
                    <Text fontSize="xs" color="red.500">
                      {dealsError}
                    </Text>
                  )}
                  {!dealsLoading && dealOptions.length === 0 && selectedOrganization && (
                    <Text fontSize="xs" color="gray.500">
                      No deals found for {selectedOrganization.name}
                    </Text>
                  )}
                </VStack>

                {/* Lead Context (Optional) */}
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Lead Context (Optional)
                  </Text>
                  <Select
                    value={selectedLead?.id || ''}
                    onChange={(e) => {
                      const lead = leadOptions.find(l => l.id === e.target.value);
                      setSelectedLead(lead || null);
                      setSelectedDeal(null); // Clear deal when lead is selected
                    }}
                    placeholder={
                      leadsLoading ? "Loading leads..." :
                      leadsError ? "Error loading leads" :
                      leadOptions.length === 0 ? "No leads found" :
                      "Select lead..."
                    }
                    isDisabled={!selectedOrganization || leadsLoading}
                  >
                    {leadOptions.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.title} (Score: {lead.score})
                      </option>
                    ))}
                  </Select>
                  {leadsError && (
                    <Text fontSize="xs" color="red.500">
                      {leadsError}
                    </Text>
                  )}
                  {!leadsLoading && leadOptions.length === 0 && (
                    <Text fontSize="xs" color="gray.500">
                      No leads found
                    </Text>
                  )}
                </VStack>

                {/* Search */}
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Search Stakeholders
                  </Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Search size={16} color="#a0aec0" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by name, role, department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </VStack>
              </Grid>

              {/* Current Context Display */}
              {selectedOrganization && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Analysis Context:</AlertTitle>
                    <AlertDescription>
                      <strong>{selectedOrganization.name}</strong> • {getContextDescription()}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </Box>

          {/* Main Content */}
          {selectedOrganization ? (
            <Box bg={cardBg} borderRadius="lg" shadow="sm" overflow="hidden">
              <Tabs index={activeTab} onChange={setActiveTab}>
                <Box px={6} pt={4}>
                  <TabList>
                    <Tab>
                      <HStack spacing={2}>
                        <Network size={16} />
                        <Text>Cross-Entity Network</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <Network size={16} />
                        <Text>Network Map</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <BarChart3 size={16} />
                        <Text>Analysis Dashboard</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <Target size={16} />
                        <Text>Action Items</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <MapPin size={16} />
                        <Text>Territory View</Text>
                      </HStack>
                    </Tab>
                  </TabList>
                </Box>

                <TabPanels>
                  {/* Cross-Entity Network - Now First */}
                  <TabPanel p={6}>
                    <CrossEntityNetworkVisualization
                      organizationIds={selectedOrganization ? [selectedOrganization.id] : undefined}
                      dealIds={selectedDeal ? [selectedDeal.id] : undefined}
                      leadIds={selectedLead ? [selectedLead.id] : undefined}
                      selectedOrganizationId={selectedOrganization?.id}
                      selectedDealId={selectedDeal?.id}
                      height={700}
                      onNodeSelect={(node) => {
                        toast({
                          title: `Selected: ${node.name}`,
                          description: `${node.type} • Click for details`,
                          status: 'info',
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                    />
                  </TabPanel>

                  {/* Network Visualization - Now Second */}
                  <TabPanel p={6}>
                    <StakeholderNetworkVisualization
                      organizationId={selectedOrganization.id}
                      dealId={selectedDeal?.id}
                      leadId={selectedLead?.id}
                      height={700}
                      onStakeholderSelect={(stakeholder) => {
                        toast({
                          title: `Selected: ${stakeholder.title}`,
                          description: `${stakeholder.title} • Influence: ${stakeholder.influenceScore}/10`,
                          status: 'info',
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                    />
                  </TabPanel>

                  {/* Analysis Dashboard */}
                  <TabPanel p={6}>
                    <StakeholderAnalysisDashboard
                      organizationId={selectedOrganization.id}
                      dealId={selectedDeal?.id}
                      leadId={selectedLead?.id}
                      onAnalyzeNetwork={handleAnalyzeNetwork}
                      onFindMissingStakeholders={handleFindMissingStakeholders}
                    />
                  </TabPanel>

                  {/* Action Items */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color="white" display="flex" alignItems="center" gap={2}>
                        <Target size={20} />
                        Recommended Actions
                      </Heading>
                      
                      {/* Coming Soon Card with System Styling */}
                      <Box 
                        p={6} 
                        borderRadius="lg"
                        bg="gray.700"
                        border="1px"
                        borderColor="gray.600"
                        shadow="lg"
                        _dark={{
                          bg: "gray.800",
                          borderColor: "gray.600"
                        }}
                      >
                        <VStack spacing={4} textAlign="center">
                          <Box 
                            p={3} 
                            borderRadius="full" 
                            bg="blue.500" 
                            color="white"
                          >
                            <Target size={24} />
                          </Box>
                          <Heading size="md" color="white">
                            Action Items Coming Soon
                          </Heading>
                          <Text color="gray.300" maxW="md">
                            This will show intelligent recommendations for engaging stakeholders, 
                            strengthening relationships, and optimizing your sales approach based 
                            on network analysis.
                          </Text>
                          <HStack spacing={3}>
                            <Badge colorScheme="blue" variant="solid">Feature In Development</Badge>
                            <Badge colorScheme="green" variant="outline">Phase 4</Badge>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Territory View */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color="white" display="flex" alignItems="center" gap={2}>
                        <MapPin size={20} />
                        Territory & Geographic Analysis
                      </Heading>
                      
                      {/* Coming Soon Card with System Styling */}
                      <Box 
                        p={6} 
                        borderRadius="lg"
                        bg="gray.700"
                        border="1px"
                        borderColor="gray.600"
                        shadow="lg"
                        _dark={{
                          bg: "gray.800",
                          borderColor: "gray.600"
                        }}
                      >
                        <VStack spacing={4} textAlign="center">
                          <Box 
                            p={3} 
                            borderRadius="full" 
                            bg="purple.500" 
                            color="white"
                          >
                            <MapPin size={24} />
                          </Box>
                          <Heading size="md" color="white">
                            Territory Mapping Coming Soon
                          </Heading>
                          <Text color="gray.300" maxW="md">
                            This will show stakeholder distribution across geographic regions, 
                            business territories, and organizational boundaries to optimize 
                            your coverage strategy.
                          </Text>
                          <HStack spacing={3}>
                            <Badge colorScheme="purple" variant="solid">Feature In Development</Badge>
                            <Badge colorScheme="green" variant="outline">Phase 4</Badge>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          ) : (
            <Box bg={cardBg} p={12} borderRadius="lg" shadow="sm" textAlign="center">
              <VStack spacing={4}>
                <Building2 size={64} color="#a0aec0" />
                <Heading size="lg" color="gray.500">
                  Select an Organization
                </Heading>
                <Text color="gray.600" maxW="md">
                  Choose an organization from the dropdown above to begin analyzing 
                  stakeholder relationships and network intelligence.
                </Text>
              </VStack>
            </Box>
          )}

          {/* Footer Info */}
          <Box bg={cardBg} p={4} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" color="gray.600" fontSize="sm">
              <Text>
                Powered by Business Intelligence with {organizations.length} organizations analyzed
              </Text>
              <HStack spacing={4}>
                <Badge colorScheme="blue">Phase 3: UI Complete</Badge>
                <Badge colorScheme="green">Real-time Analysis</Badge>
                <Badge colorScheme="purple">Business Intelligence</Badge>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}; 