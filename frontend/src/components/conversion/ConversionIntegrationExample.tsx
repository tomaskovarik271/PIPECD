import React, { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Heading
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiHistory } from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';
import { 
  ConvertLeadModal, 
  ConvertDealModal, 
  BulkConvertLeadsModal,
  ConversionHistoryPanel,
  useLeadConversion,
  useDealConversion,
  ConversionHelpers
} from './index';

// Example usage component showing how to integrate conversion functionality
export function ConversionIntegrationExample() {
  const colors = useThemeColors();
  
  // Modal states
  const { isOpen: isLeadModalOpen, onOpen: openLeadModal, onClose: closeLeadModal } = useDisclosure();
  const { isOpen: isDealModalOpen, onOpen: openDealModal, onClose: closeDealModal } = useDisclosure();
  const { isOpen: isBulkModalOpen, onOpen: openBulkModal, onClose: closeBulkModal } = useDisclosure();

  // Example data
  const [selectedLead] = useState({
    id: 'lead_123',
    name: 'Microsoft Enterprise Opportunity',
    contact_name: 'John Doe',
    contact_email: 'john.doe@microsoft.com',
    contact_phone: '+1-555-0123',
    company_name: 'Microsoft Corporation',
    estimated_value: 75000,
    estimated_close_date: '2024-06-15',
    lead_score: 85,
    source: 'Website',
    description: 'Enterprise software licensing opportunity'
  });

  const [selectedDeal] = useState({
    id: 'deal_456',
    name: 'Microsoft Enterprise Deal',
    amount: 75000,
    currency: 'USD',
    expected_close_date: '2024-06-15',
    person: {
      id: 'person_123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@microsoft.com',
      phone: '+1-555-0123'
    },
    organization: {
      id: 'org_456',
      name: 'Microsoft Corporation'
    },
    currentWfmStep: {
      id: 'step_123',
      name: 'Qualification',
      status: {
        id: 'status_123',
        name: 'In Progress',
        color: 'blue'
      }
    }
  });

  const [selectedLeads] = useState([
    {
      id: 'lead_1',
      name: 'Google Cloud Migration',
      contact_name: 'Jane Smith',
      contact_email: 'jane.smith@google.com',
      company_name: 'Google LLC',
      estimated_value: 120000,
      lead_score: 90
    },
    {
      id: 'lead_2', 
      name: 'AWS Infrastructure Setup',
      contact_name: 'Bob Johnson',
      contact_email: 'bob.johnson@amazon.com',
      company_name: 'Amazon Web Services',
      estimated_value: 95000,
      lead_score: 75
    },
    {
      id: 'lead_3',
      name: 'Small Business Package',
      contact_name: 'Alice Brown',
      contact_email: 'alice@smallbiz.com',
      company_name: 'Small Business Inc',
      estimated_value: 5000,
      lead_score: 45
    }
  ]);

  // Hooks for conversion functionality
  const leadConversion = useLeadConversion(selectedLead.id);
  const dealConversion = useDealConversion(selectedDeal.id);

  const handleConversionComplete = (result: any) => {
    console.log('Conversion completed:', result);
    // Here you would typically:
    // 1. Refresh data
    // 2. Navigate to the new entity
    // 3. Show success message
    // 4. Update any parent component state
  };

  // Helper functions to show conversion recommendations
  const leadRecommendation = ConversionHelpers.getConversionRecommendation(selectedLead, 'lead');
  const dealRecommendation = ConversionHelpers.getConversionRecommendation(selectedDeal, 'deal');

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color={colors.text.primary}>
            Bi-Directional Conversion System
          </Heading>
          <Text color={colors.text.muted}>
            Complete lead-deal conversion system with intelligent validation and WFM integration
          </Text>
        </Box>

        {/* Lead Conversion Example */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Icon as={FiTrendingUp} color={colors.accent.primary} />
                <Heading size="md">Lead to Deal Conversion</Heading>
              </HStack>
              <Badge 
                colorScheme={leadRecommendation.recommend ? 'green' : 'orange'}
                variant="subtle"
              >
                {leadRecommendation.recommend ? 'Recommended' : 'Review Required'}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Lead Info */}
              <Box p={4} bg={colors.background.elevated} borderRadius="md">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="semibold">{selectedLead.name}</Text>
                  <Badge colorScheme="blue">Score: {selectedLead.lead_score}</Badge>
                </HStack>
                <Text fontSize="sm" color={colors.text.muted}>
                  {selectedLead.contact_name} • {selectedLead.company_name} • ${selectedLead.estimated_value?.toLocaleString()}
                </Text>
                <Text fontSize="sm" color={colors.text.muted} mt={1}>
                  {leadRecommendation.reason}
                </Text>
              </Box>

              {/* Actions */}
              <HStack spacing={3}>
                <Button
                  colorScheme="blue"
                  onClick={openLeadModal}
                  leftIcon={<Icon as={FiTrendingUp} />}
                  isDisabled={!ConversionHelpers.canConvertLeadToDeal(selectedLead)}
                >
                  Convert to Deal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon as={FiHistory} />}
                  onClick={() => {/* Show history */}}
                >
                  View History
                </Button>
              </HStack>

              {/* Conversion History */}
              {leadConversion.conversionHistory.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Recent Conversions</Text>
                  <ConversionHistoryPanel 
                    entityType="lead" 
                    entityId={selectedLead.id}
                    showTitle={false}
                  />
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Deal Conversion Example */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Icon as={FiTrendingDown} color={colors.accent.secondary} />
                <Heading size="md">Deal to Lead Conversion</Heading>
              </HStack>
              <Badge 
                colorScheme={dealRecommendation.recommend ? 'orange' : 'red'}
                variant="subtle"
              >
                {dealRecommendation.recommend ? 'Allowed' : 'Blocked'}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Deal Info */}
              <Box p={4} bg={colors.background.elevated} borderRadius="md">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="semibold">{selectedDeal.name}</Text>
                  <Badge colorScheme="blue">{selectedDeal.currentWfmStep?.status?.name}</Badge>
                </HStack>
                <Text fontSize="sm" color={colors.text.muted}>
                  {selectedDeal.person?.first_name} {selectedDeal.person?.last_name} • {selectedDeal.organization?.name} • ${selectedDeal.amount?.toLocaleString()}
                </Text>
                <Text fontSize="sm" color={colors.text.muted} mt={1}>
                  {dealRecommendation.reason}
                </Text>
              </Box>

              {/* Actions */}
              <HStack spacing={3}>
                <Button
                  colorScheme="orange"
                  onClick={openDealModal}
                  leftIcon={<Icon as={FiTrendingDown} />}
                  isDisabled={!ConversionHelpers.canConvertDealToLead(selectedDeal)}
                >
                  Convert to Lead
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon as={FiHistory} />}
                  onClick={() => {/* Show history */}}
                >
                  View History
                </Button>
              </HStack>

              {/* Conversion History */}
              {dealConversion.conversionHistory.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Recent Conversions</Text>
                  <ConversionHistoryPanel 
                    entityType="deal" 
                    entityId={selectedDeal.id}
                    showTitle={false}
                  />
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Bulk Conversion Example */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Icon as={FiRefreshCw} color={colors.accent.tertiary} />
                <Heading size="md">Bulk Lead Conversion</Heading>
              </HStack>
              <Badge colorScheme="purple" variant="subtle">
                {selectedLeads.length} Leads
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Leads Preview */}
              <Box>
                <Text fontWeight="semibold" mb={3}>Selected Leads</Text>
                <VStack spacing={2} align="stretch">
                  {selectedLeads.map(lead => {
                    const canConvert = ConversionHelpers.canConvertLeadToDeal(lead);
                    ConversionHelpers.getConversionRecommendation(lead, 'lead');
                    
                    return (
                      <HStack 
                        key={lead.id} 
                        p={3} 
                        bg={colors.background.elevated} 
                        borderRadius="md"
                        justify="space-between"
                      >
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">{lead.name}</Text>
                          <Text fontSize="xs" color={colors.text.muted}>
                            {lead.contact_name} • {lead.company_name}
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Badge colorScheme={lead.lead_score >= 70 ? 'green' : lead.lead_score >= 50 ? 'yellow' : 'red'}>
                            {lead.lead_score}
                          </Badge>
                          <Badge colorScheme={canConvert && recommendation.recommend ? 'green' : 'orange'}>
                            {canConvert && recommendation.recommend ? 'Ready' : 'Review'}
                          </Badge>
                        </HStack>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>

              {/* Actions */}
              <HStack spacing={3}>
                <Button
                  colorScheme="purple"
                  onClick={openBulkModal}
                  leftIcon={<Icon as={FiRefreshCw} />}
                >
                  Bulk Convert Leads
                </Button>
                <Text fontSize="sm" color={colors.text.muted}>
                  Convert multiple leads to deals with intelligent validation
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Integration Notes */}
        <Card>
          <CardHeader>
            <Heading size="md">Integration Guide</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={2}>How to Integrate</Text>
                <VStack spacing={2} align="start" fontSize="sm" color={colors.text.muted}>
                  <Text>1. Import conversion components: <code>ConvertLeadModal</code>, <code>ConvertDealModal</code></Text>
                  <Text>2. Use conversion hooks: <code>useLeadConversion</code>, <code>useDealConversion</code></Text>
                  <Text>3. Add conversion buttons to your lead/deal detail pages</Text>
                  <Text>4. Include <code>ConversionHistoryPanel</code> to show audit trail</Text>
                  <Text>5. Use <code>ConversionHelpers</code> for validation and recommendations</Text>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>Features Included</Text>
                <VStack spacing={1} align="start" fontSize="sm" color={colors.text.muted}>
                  <Text>✅ Bi-directional conversion (Lead ↔ Deal)</Text>
                  <Text>✅ Intelligent validation with WFM status checks</Text>
                  <Text>✅ Bulk conversion with progress tracking</Text>
                  <Text>✅ Complete audit trail and history</Text>
                  <Text>✅ Real-time updates via GraphQL subscriptions</Text>
                  <Text>✅ Smart entity creation (Person, Organization)</Text>
                  <Text>✅ Activity preservation and conversion tracking</Text>
                  <Text>✅ Full TypeScript support</Text>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Modals */}
      <ConvertLeadModal
        isOpen={isLeadModalOpen}
        onClose={closeLeadModal}
        lead={selectedLead}
        onConversionComplete={handleConversionComplete}
      />

      <ConvertDealModal
        isOpen={isDealModalOpen}
        onClose={closeDealModal}
        deal={selectedDeal}
        onConversionComplete={handleConversionComplete}
      />

      <BulkConvertLeadsModal
        isOpen={isBulkModalOpen}
        onClose={closeBulkModal}
        leads={selectedLeads}
        onConversionComplete={handleConversionComplete}
      />
    </Box>
  );
}

// Example of how to add conversion buttons to existing pages
export function LeadDetailPageConversionButton({ lead }: { lead: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const canConvert = ConversionHelpers.canConvertLeadToDeal(lead);
  const recommendation = ConversionHelpers.getConversionRecommendation(lead, 'lead');

  if (!canConvert) return null;

  return (
    <>
      <Button
        colorScheme={recommendation.recommend ? 'blue' : 'gray'}
        size="sm"
        onClick={onOpen}
        leftIcon={<Icon as={FiTrendingUp} />}
      >
        Convert to Deal
      </Button>
      
      <ConvertLeadModal
        isOpen={isOpen}
        onClose={onClose}
        lead={lead}
        onConversionComplete={(result) => {
          // Handle successful conversion
          console.log('Lead converted:', result);
        }}
      />
    </>
  );
}

export function DealDetailPageConversionButton({ deal }: { deal: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const canConvert = ConversionHelpers.canConvertDealToLead(deal);
  const recommendation = ConversionHelpers.getConversionRecommendation(deal, 'deal');

  if (!canConvert) return null;

  return (
    <>
      <Button
        colorScheme="orange"
        size="sm"
        variant="outline"
        onClick={onOpen}
        leftIcon={<Icon as={FiTrendingDown} />}
      >
        Convert to Lead
      </Button>
      
      <ConvertDealModal
        isOpen={isOpen}
        onClose={onClose}
        deal={deal}
        onConversionComplete={(result) => {
          // Handle successful conversion
          console.log('Deal converted:', result);
        }}
      />
    </>
  );
} 