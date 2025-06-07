import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Select,
  Button,
  Card,
  CardBody,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { Users, Network, Brain } from 'lucide-react';
import { StakeholderNetworkVisualization } from '../components/relationships/StakeholderNetworkVisualization';
import { StakeholderAnalysisDashboard } from '../components/relationships/StakeholderAnalysisDashboard';

const RelationshipsPage: React.FC = () => {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Mock organization options - in real app, these would come from a GraphQL query
  const organizationOptions = [
    { id: 'ca81c547-3005-4499-872d-b17d11ae8dd6', name: 'Acme Corporation' },
    { id: 'fbac51ef-9d28-44a8-8576-8db4c56228a9', name: 'Global Industries Inc' },
    { id: 'e16642c3-2130-4753-bca7-c684daf46a82', name: 'TechStart Innovations' }
  ];

  const handleStakeholderSelect = (stakeholder: any) => {
    console.log('Selected stakeholder:', stakeholder);
  };

  const handleAnalyzeNetwork = () => {
    console.log('Analyzing network for organization:', selectedOrganizationId);
  };

  const handleFindMissingStakeholders = () => {
    console.log('Finding missing stakeholders for organization:', selectedOrganizationId);
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} display="flex" alignItems="center" gap={3}>
            <Network size={28} />
            Relationship Intelligence
          </Heading>
          <Text color="gray.600">
            Analyze stakeholder networks, identify key decision makers, and optimize your relationship mapping strategy.
          </Text>
        </Box>

        {/* Organization Selector */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Select Organization
                </Text>
                <Select
                  placeholder="Choose an organization..."
                  value={selectedOrganizationId}
                  onChange={(e) => setSelectedOrganizationId(e.target.value)}
                >
                  {organizationOptions.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Deal ID (Optional)
                </Text>
                <Select
                  placeholder="Select deal..."
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                >
                  <option value="deal1">Sample Deal 1</option>
                  <option value="deal2">Sample Deal 2</option>
                </Select>
              </Box>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Lead ID (Optional)
                </Text>
                <Select
                  placeholder="Select lead..."
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                >
                  <option value="lead1">Sample Lead 1</option>
                  <option value="lead2">Sample Lead 2</option>
                </Select>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Main Content */}
        {selectedOrganizationId ? (
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>
                <HStack>
                  <Network size={16} />
                  <Text>Network Visualization</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Brain size={16} />
                  <Text>Analysis Dashboard</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0} pt={6}>
                <StakeholderNetworkVisualization
                  organizationId={selectedOrganizationId}
                  dealId={selectedDealId || undefined}
                  leadId={selectedLeadId || undefined}
                  onStakeholderSelect={handleStakeholderSelect}
                  height={700}
                />
              </TabPanel>
              
              <TabPanel p={0} pt={6}>
                <StakeholderAnalysisDashboard
                  organizationId={selectedOrganizationId}
                  dealId={selectedDealId || undefined}
                  leadId={selectedLeadId || undefined}
                  onAnalyzeNetwork={handleAnalyzeNetwork}
                  onFindMissingStakeholders={handleFindMissingStakeholders}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Card>
            <CardBody>
              <VStack spacing={4} py={12}>
                <Users size={48} color="#a0aec0" />
                <Heading size="md" color="gray.500">
                  Select an Organization
                </Heading>
                <Text color="gray.500" textAlign="center">
                  Choose an organization from the dropdown above to view its stakeholder network and relationship intelligence.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Demo Information */}
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody>
            <VStack spacing={3} align="start">
              <Heading size="sm" color="blue.800">
                🎉 Mock Data Removed - Now Using Real GraphQL!
              </Heading>
              <Text fontSize="sm" color="blue.700">
                The UI components have been updated to use real GraphQL queries instead of mock data. They now connect to:
              </Text>
              <VStack align="start" fontSize="sm" color="blue.700" spacing={1}>
                <Text>• <strong>analyzeStakeholderNetwork</strong> - For network visualization data</Text>
                <Text>• <strong>findMissingStakeholders</strong> - For stakeholder gap analysis</Text>
                <Text>• <strong>stakeholderAnalyses</strong> - For current stakeholder data</Text>
                <Text>• <strong>organizationRoles</strong> - For organizational structure</Text>
              </VStack>
              <Text fontSize="sm" color="blue.700">
                The components will load real data from your seeded database when you select an organization.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default RelationshipsPage; 