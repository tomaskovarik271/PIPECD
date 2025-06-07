import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Text,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Badge,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { Network, RefreshCw, Settings, Eye, Filter } from 'lucide-react';
import { CrossEntityNetworkVisualization } from '../components/relationships/CrossEntityNetworkVisualization';

const CrossEntityNetworkPage: React.FC = () => {
  const [includeDeals, setIncludeDeals] = useState(true);
  const [includeLeads, setIncludeLeads] = useState(true);
  const [includeOrganizations, setIncludeOrganizations] = useState(true);
  const [includePeople, setIncludePeople] = useState(true);
  const [maxDegrees, setMaxDegrees] = useState(3);
  const toast = useToast();

  const handleRefresh = () => {
    toast({
      title: 'Network Refreshed',
      description: 'Cross-entity network data has been reloaded',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleNodeSelect = (node: any) => {
    toast({
      title: `Selected: ${node.name}`,
      description: `${node.type} - Click to view details`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="full" p={0}>
      <Box bg="gray.50" minH="100vh" p={6}>
        {/* Header */}
        <Card mb={6}>
          <CardHeader>
            <Flex align="center">
              <HStack spacing={3}>
                <Network size={24} color="#3b82f6" />
                <Heading size="lg">Cross-Entity Network Analysis</Heading>
              </HStack>
              <Spacer />
              <HStack spacing={2}>
                <Button
                  leftIcon={<RefreshCw size={16} />}
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
                <Button
                  leftIcon={<Settings size={16} />}
                  variant="ghost"
                  size="sm"
                >
                  Settings
                </Button>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody pt={0}>
            <Text color="gray.600" fontSize="sm">
              Visualize relationships across all entities in your CRM - deals, leads, people, and organizations. 
              Use the controls below to customize what data is included in your network analysis.
            </Text>
          </CardBody>
        </Card>

        {/* Entity Type Controls */}
        <Card mb={6}>
          <CardHeader>
            <HStack spacing={2}>
              <Filter size={18} />
              <Heading size="md">Entity Filters</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={8} wrap="wrap">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="deals-toggle" mb="0" fontSize="sm">
                  💰 Include Deals
                </FormLabel>
                <Switch
                  id="deals-toggle"
                  isChecked={includeDeals}
                  onChange={(e) => setIncludeDeals(e.target.checked)}
                  colorScheme="green"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="leads-toggle" mb="0" fontSize="sm">
                  🎯 Include Leads
                </FormLabel>
                <Switch
                  id="leads-toggle"
                  isChecked={includeLeads}
                  onChange={(e) => setIncludeLeads(e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="orgs-toggle" mb="0" fontSize="sm">
                  🏢 Include Organizations
                </FormLabel>
                <Switch
                  id="orgs-toggle"
                  isChecked={includeOrganizations}
                  onChange={(e) => setIncludeOrganizations(e.target.checked)}
                  colorScheme="orange"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="people-toggle" mb="0" fontSize="sm">
                  👤 Include People
                </FormLabel>
                <Switch
                  id="people-toggle"
                  isChecked={includePeople}
                  onChange={(e) => setIncludePeople(e.target.checked)}
                  colorScheme="purple"
                />
              </FormControl>
            </HStack>

            <Box mt={4}>
              <HStack spacing={4}>
                <Badge colorScheme="blue" p={2}>
                  <HStack>
                    <Eye size={14} />
                    <Text fontSize="xs">
                      {[includeDeals && 'Deals', includeLeads && 'Leads', includeOrganizations && 'Organizations', includePeople && 'People']
                        .filter(Boolean)
                        .join(', ')} visible
                    </Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="gray" p={2}>
                  <Text fontSize="xs">Max Degrees: {maxDegrees}</Text>
                </Badge>
              </HStack>
            </Box>
          </CardBody>
        </Card>

        {/* Network Visualization */}
        <CrossEntityNetworkVisualization
          includeDeals={includeDeals}
          includeLeads={includeLeads}
          includeOrganizations={includeOrganizations}
          includePeople={includePeople}
          maxDegrees={maxDegrees}
          height={800}
          onNodeSelect={handleNodeSelect}
        />
      </Box>
    </Container>
  );
};

export default CrossEntityNetworkPage; 