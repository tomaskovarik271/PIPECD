import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Collapse,
  useDisclosure,
  Image,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListIcon,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiArrowRight, 
  FiArrowLeft, 
  FiCalendar, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiInfo, 
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiLink,
  FiZap,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiGrid,
  FiList,
  FiToggleLeft,
  FiAlertTriangle,
  FiTarget,
} from 'react-icons/fi';
import { useThemeColors } from '../../hooks/useThemeColors';

interface FeatureHelpTipsProps {
  feature: 'deal-to-lead-conversion' | 'lead-to-deal-conversion' | 'meeting-scheduling' | 'deals-overview' | 'kanban-vs-table' | 'task-indicators';
  isOpen?: boolean;
  onToggle?: () => void;
}

export const FeatureHelpTips: React.FC<FeatureHelpTipsProps> = ({ 
  feature, 
  isOpen = false, 
  onToggle 
}) => {
  const colors = useThemeColors();
  const { isOpen: isExpanded, onToggle: toggleExpanded } = useDisclosure({ defaultIsOpen: isOpen });

  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');

  const renderDealToLeadConversionTips = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="info" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>Deal → Lead Conversion</AlertTitle>
          <AlertDescription>
            Sometimes deals need to step back in the sales process. This powerful feature maintains all data while moving prospects back to nurturing phase.
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiTrendingDown} color="orange.500" />
              <Heading size="sm">Why Convert Deal → Lead?</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Prospect was unqualified
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Wrong timing - too early
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Budget constraints
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Needs more nurturing
              </ListItem>
            </List>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiZap} color="blue.500" />
              <Heading size="sm">What Happens Automatically</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Deal data → Lead data mapping
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Contact info preserved
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                WFM status updated
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Conversion history tracked
              </ListItem>
            </List>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px solid" borderColor={colors.border.subtle}>
        <HStack mb={3}>
          <Icon as={FiArrowLeft} color="orange.500" />
          <Text fontWeight="semibold">Conversion Flow</Text>
        </HStack>
        <HStack spacing={4} justify="center" flexWrap="wrap">
          <Badge colorScheme="blue" p={2} borderRadius="md">Deal: "ABC Corp - $50K"</Badge>
          <Icon as={FiArrowRight} color="orange.500" />
          <Badge colorScheme="orange" p={2} borderRadius="md">Lead: "ABC Corp - Nurture"</Badge>
        </HStack>
        <Text fontSize="sm" color={colors.text.muted} mt={2} textAlign="center">
          All contact info, notes, and history preserved
        </Text>
      </Box>

      <Alert status="warning" variant="subtle">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Pro Tip</AlertTitle>
          <AlertDescription fontSize="sm">
            The converted lead will appear in your leads pipeline with "deal_conversion" source. 
            You can continue nurturing and convert back to deal when ready!
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );

  const renderLeadToDealConversionTips = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="success" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>Lead → Deal Conversion</AlertTitle>
          <AlertDescription>
            When leads are qualified and ready to buy, this feature creates deals with proper WFM integration and entity management.
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiTrendingUp} color="green.500" />
              <Heading size="sm">Smart Entity Creation</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Auto-creates Person if needed
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Auto-creates Organization if needed
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Links all entities properly
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Kanban-ready immediately
              </ListItem>
            </List>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiZap} color="blue.500" />
              <Heading size="sm">WFM Integration</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Creates "Sales Deal" WFM project
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Sets proper workflow stage
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Updates lead to "Converted"
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Maintains audit trail
              </ListItem>
            </List>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px solid" borderColor={colors.border.subtle}>
        <HStack mb={3}>
          <Icon as={FiArrowRight} color="green.500" />
          <Text fontWeight="semibold">Conversion Flow</Text>
        </HStack>
        <VStack spacing={3}>
          <HStack spacing={4} justify="center" flexWrap="wrap">
            <Badge colorScheme="orange" p={2} borderRadius="md">Lead: "Qualified Prospect"</Badge>
            <Icon as={FiArrowRight} color="green.500" />
            <Badge colorScheme="blue" p={2} borderRadius="md">Deal: "Active Opportunity"</Badge>
          </HStack>
          <HStack spacing={2} fontSize="sm" color={colors.text.muted}>
            <Text>+</Text>
            <Badge size="sm" colorScheme="green">Person Created</Badge>
            <Text>+</Text>
            <Badge size="sm" colorScheme="blue">Organization Created</Badge>
            <Text>+</Text>
            <Badge size="sm" colorScheme="purple">WFM Project</Badge>
          </HStack>
        </VStack>
      </Box>

      <Alert status="info" variant="subtle">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Smart Duplicate Detection</AlertTitle>
          <AlertDescription fontSize="sm">
            The system automatically checks for existing people and organizations to avoid duplicates. 
            It will link to existing entities or create new ones as needed.
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );

  const renderMeetingSchedulingTips = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="info" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>Calendar-Native Meeting Scheduling</AlertTitle>
          <AlertDescription>
            PipeCD integrates directly with Google Calendar for zero-friction meeting scheduling with automatic CRM context.
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiCalendar} color="blue.500" />
              <Heading size="sm">How It Works</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Opens Google Calendar instantly
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Pre-fills deal context & contacts
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Auto-adds Google Meet link
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Syncs back to PipeCD timeline
              </ListItem>
            </List>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiLink} color="green.500" />
              <Heading size="sm">Smart Integration</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Meeting appears in timeline automatically
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                No manual data entry required
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Uses familiar Google Calendar interface
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                CRM context preserved seamlessly
              </ListItem>
            </List>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px solid" borderColor={colors.border.subtle}>
        <HStack mb={3}>
          <Icon as={FiCalendar} color="blue.500" />
          <Text fontWeight="semibold">Meeting Flow</Text>
        </HStack>
        <VStack spacing={3}>
          <HStack spacing={4} justify="center" flexWrap="wrap" fontSize="sm">
            <Badge colorScheme="blue" p={2} borderRadius="md">Click "Schedule Meeting"</Badge>
            <Icon as={FiArrowRight} color="blue.500" />
            <Badge colorScheme="green" p={2} borderRadius="md">Google Calendar Opens</Badge>
            <Icon as={FiArrowRight} color="blue.500" />
            <Badge colorScheme="purple" p={2} borderRadius="md">Auto-Syncs to Timeline</Badge>
          </HStack>
          <Text fontSize="sm" color={colors.text.muted} textAlign="center">
            No manual data entry required - everything is pre-filled!
          </Text>
        </VStack>
      </Box>

      <Alert status="success" variant="subtle">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Zero Learning Curve</AlertTitle>
          <AlertDescription fontSize="sm">
            Use your familiar Google Calendar interface while PipeCD automatically handles the CRM integration. 
            Meetings appear in your timeline with full deal context - no additional steps needed!
          </AlertDescription>
        </Box>
      </Alert>

      <Box p={3} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
        <HStack mb={2}>
          <Icon as={FiClock} color="orange.500" />
          <Text fontWeight="semibold" fontSize="sm" color="orange.700">Smart Scheduling</Text>
        </HStack>
        <Text fontSize="sm" color="orange.600">
          The system suggests next business hour timing and automatically includes deal participants as attendees.
        </Text>
      </Box>
    </VStack>
  );

  const renderDealsOverviewTips = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="info" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>Deals Overview & Management</AlertTitle>
          <AlertDescription>
            Your central hub for managing all sales opportunities with powerful filtering, views, and insights.
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiEye} color="blue.500" />
              <Heading size="sm">View Options</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Table View:</strong> Detailed data in columns
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Kanban View:</strong> Visual pipeline stages
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Custom Columns:</strong> Show what matters most
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Real-time Stats:</strong> Total value, win rate, etc.
              </ListItem>
            </List>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiFilter} color="purple.500" />
              <Heading size="sm">Smart Features</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Global Search:</strong> Find deals instantly
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Task Indicators:</strong> See overdue/due today
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Quick Actions:</strong> Edit, convert, delete
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                <strong>Multi-Currency:</strong> Automatic totals
              </ListItem>
            </List>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );

  const renderKanbanVsTableTips = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="info" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>Kanban vs Table Views</AlertTitle>
          <AlertDescription>
            Choose the perfect view for your workflow - visual pipeline management or detailed data analysis.
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card size="sm" borderColor="blue.200" borderWidth="2px">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiGrid} color="blue.500" />
              <Heading size="sm">Kanban View</Heading>
              <Badge colorScheme="blue" size="sm">Visual</Badge>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Visual pipeline with drag & drop
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                See deal progression at a glance
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Perfect for sales team meetings
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Shows task indicators on cards
              </ListItem>
            </List>
            <Text fontSize="xs" color="blue.600" mt={2} fontStyle="italic">
              Best for: Pipeline reviews, team collaboration
            </Text>
          </CardBody>
        </Card>

        <Card size="sm" borderColor="purple.200" borderWidth="2px">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiList} color="purple.500" />
              <Heading size="sm">Table View</Heading>
              <Badge colorScheme="purple" size="sm">Data</Badge>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Detailed data in sortable columns
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Custom field visibility control
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Perfect for data analysis
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheckCircle} color="green.500" />
                Export and reporting ready
              </ListItem>
            </List>
            <Text fontSize="xs" color="purple.600" mt={2} fontStyle="italic">
              Best for: Data analysis, reporting, detailed review
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
        <HStack mb={2}>
          <Icon as={FiToggleLeft} color="blue.500" />
          <Text fontWeight="semibold" fontSize="sm" color="blue.700">Quick Switching</Text>
        </HStack>
        <Text fontSize="sm" color="blue.600">
          Use the view toggle in the header to instantly switch between Kanban and Table views. Your preferences are saved automatically.
        </Text>
      </Box>
    </VStack>
  );

  const renderTaskIndicatorsTips = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="info" variant="left-accent">
        <AlertIcon />
        <Box>
          <AlertTitle>Task Indicators on Deal Cards</AlertTitle>
          <AlertDescription>
            Visual badges show when deals have tasks due today or overdue, helping you prioritize your work.
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Heading size="sm">Due Today</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="start" spacing={2}>
              <HStack>
                <Badge colorScheme="orange" variant="solid" fontSize="xs">
                  <Icon as={FiClock} mr={1} />
                  2 Due Today
                </Badge>
                <Text fontSize="sm">Orange badge with clock icon</Text>
              </HStack>
              <Text fontSize="sm" color={colors.text.muted}>
                Shows tasks that need attention today. Click the deal to see task details and take action.
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card size="sm">
          <CardHeader pb={2}>
            <HStack>
              <Icon as={FiAlertTriangle} color="red.500" />
              <Heading size="sm">Overdue</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="start" spacing={2}>
              <HStack>
                <Badge colorScheme="red" variant="solid" fontSize="xs">
                  <Icon as={FiAlertTriangle} mr={1} />
                  1 Overdue
                </Badge>
                <Text fontSize="sm">Red badge with warning icon</Text>
              </HStack>
              <Text fontSize="sm" color={colors.text.muted}>
                Urgent tasks that are past due. These require immediate attention to keep deals moving.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box p={4} bg={colors.bg.elevated} borderRadius="md" border="1px solid" borderColor={colors.border.subtle}>
        <HStack mb={3}>
          <Icon as={FiTarget} color="green.500" />
          <Text fontWeight="semibold">Smart Prioritization</Text>
        </HStack>
        <List spacing={2} fontSize="sm">
          <ListItem>
            <ListIcon as={FiCheckCircle} color="green.500" />
            <strong>Hover for Details:</strong> See task names and due dates in tooltips
          </ListItem>
          <ListItem>
            <ListIcon as={FiCheckCircle} color="green.500" />
            <strong>Quick Navigation:</strong> Click deal card to manage tasks directly
          </ListItem>
          <ListItem>
            <ListIcon as={FiCheckCircle} color="green.500" />
            <strong>Visual Priority:</strong> Red (overdue) takes precedence over orange (due today)
          </ListItem>
        </List>
      </Box>

      <Alert status="success" variant="subtle">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Never Miss a Follow-up</AlertTitle>
          <AlertDescription fontSize="sm">
            Task indicators ensure you never miss important follow-ups, helping you maintain momentum on every deal in your pipeline.
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );

  const getFeatureTitle = () => {
    switch (feature) {
      case 'deal-to-lead-conversion':
        return 'Deal → Lead Conversion';
      case 'lead-to-deal-conversion':
        return 'Lead → Deal Conversion';
      case 'meeting-scheduling':
        return 'Calendar-Native Meeting Scheduling';
      case 'deals-overview':
        return 'Deals Overview & Management';
      case 'kanban-vs-table':
        return 'Kanban vs Table Views';
      case 'task-indicators':
        return 'Task Indicators on Deal Cards';
      default:
        return 'Feature Help';
    }
  };

  const getFeatureIcon = () => {
    switch (feature) {
      case 'deal-to-lead-conversion':
        return FiTrendingDown;
      case 'lead-to-deal-conversion':
        return FiTrendingUp;
      case 'meeting-scheduling':
        return FiCalendar;
      case 'deals-overview':
        return FiEye;
      case 'kanban-vs-table':
        return FiGrid;
      case 'task-indicators':
        return FiTarget;
      default:
        return FiInfo;
    }
  };

  const renderContent = () => {
    switch (feature) {
      case 'deal-to-lead-conversion':
        return renderDealToLeadConversionTips();
      case 'lead-to-deal-conversion':
        return renderLeadToDealConversionTips();
      case 'meeting-scheduling':
        return renderMeetingSchedulingTips();
      case 'deals-overview':
        return renderDealsOverviewTips();
      case 'kanban-vs-table':
        return renderKanbanVsTableTips();
      case 'task-indicators':
        return renderTaskIndicatorsTips();
      default:
        return null;
    }
  };

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
    >
      <HStack
        p={3}
        cursor="pointer"
        onClick={onToggle || toggleExpanded}
        _hover={{ bg: useColorModeValue('blue.100', 'blue.800') }}
        transition="background-color 0.2s"
      >
        <Icon as={getFeatureIcon()} color="blue.500" />
        <Text fontWeight="semibold" flex={1}>
          {getFeatureTitle()} - Help & Tips
        </Text>
        <Icon as={isExpanded ? FiChevronUp : FiChevronDown} color="blue.500" />
      </HStack>
      
      <Collapse in={isExpanded}>
        <Box p={4} borderTop="1px solid" borderColor={borderColor}>
          {renderContent()}
        </Box>
      </Collapse>
    </Box>
  );
};

export default FeatureHelpTips; 