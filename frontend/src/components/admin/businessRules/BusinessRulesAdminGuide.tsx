import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Code,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  useColorModeValue,
  Heading,
  OrderedList,
  UnorderedList,
  ListItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { 
  FiBook, 
  FiPlay, 
  FiSettings, 
  FiZap, 
  FiShield, 
  FiBarChart,
  FiHelpCircle,
  FiTarget,
  FiCpu,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiUsers,
  FiMail,
  FiEdit,
  FiMonitor,
  FiTrendingUp,
  FiLifeBuoy,
  FiBook as FiGraduationCap
} from 'react-icons/fi';

interface BusinessRulesAdminGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessRulesAdminGuide: React.FC<BusinessRulesAdminGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  
  const QuickStartSection = () => (
    <VStack spacing={6} align="stretch">
      <Card bg={cardBg}>
        <CardHeader>
          <HStack>
            <Icon as={FiTarget} color={accentColor} />
            <Heading size="md">🎯 What is the Business Rules Engine?</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <Text fontSize="md" lineHeight="1.6">
            The Business Rules Engine is PipeCD's powerful automation system that monitors your CRM data 
            and automatically triggers actions when specific conditions are met. Think of it as your digital 
            assistant that never sleeps - watching for important events and ensuring nothing falls through the cracks.
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiPlay} color={successColor} />
            <Heading size="md">🚀 Quick Start: Your First Rule</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <OrderedList spacing={3} pl={4}>
            <ListItem>Click <Badge colorScheme="blue">Create Business Rule</Badge></ListItem>
            <ListItem>Choose <Badge colorScheme="green">High Value Deal Alert</Badge> template</ListItem>
            <ListItem>Set conditions: <Code>amount {'>'} 50000</Code></ListItem>
            <ListItem>Set action: <Code>NOTIFY_OWNER</Code></ListItem>
            <ListItem>Write message: <Code>"High value deal detected: {`{{deal_name}}`} - Amount: {`{{deal_amount}}`}"</Code></ListItem>
            <ListItem>Click <Badge colorScheme="blue">Save & Activate</Badge></ListItem>
          </OrderedList>
          
          <Alert status="success" mt={4}>
            <AlertIcon />
            <Text><strong>Congratulations!</strong> Your rule will now automatically notify deal owners when high-value deals are created.</Text>
          </Alert>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiZap} color={warningColor} />
            <Heading size="md">⚡ Rule Types Overview</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Badge colorScheme="green" size="lg">EVENT_BASED</Badge>
              <Text>Trigger when something happens (deal created, lead converted)</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="blue" size="lg">FIELD_CHANGE</Badge>
              <Text>Trigger when specific fields change (amount, assignment, status)</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="orange" size="lg">TIME_BASED</Badge>
              <Text>Trigger on schedule (daily checks, follow-up reminders) <em>- Coming Soon</em></Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );

  const RuleComponentsSection = () => (
    <VStack spacing={6} align="stretch">
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiSettings} color={accentColor} />
                <Heading size="md">Trigger Configuration</Heading>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardHeader>
                  <Text fontWeight="bold">EVENT_BASED Triggers</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem><Badge colorScheme="green">DEAL_CREATED</Badge> - When new deals are created</ListItem>
                    <ListItem><Badge colorScheme="green">DEAL_UPDATED</Badge> - When deals are modified</ListItem>
                    <ListItem><Badge colorScheme="green">DEAL_ASSIGNED</Badge> - When deals are assigned to users</ListItem>
                    <ListItem><Badge colorScheme="orange">LEAD_CREATED</Badge> - When new leads are created (Coming Soon)</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <Text fontWeight="bold">FIELD_CHANGE Triggers</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem><Code>amount</Code> - Deal value changes</ListItem>
                    <ListItem><Code>assigned_to_user_id</Code> - Ownership changes</ListItem>
                    <ListItem><Code>status</Code> - Deal/lead status changes</ListItem>
                    <ListItem><Code>close_date</Code> - Estimated close date changes</ListItem>
                    <ListItem><Code>Any custom field</Code> - Monitor any field for changes</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiEye} color={accentColor} />
                <Heading size="md">Conditions System</Heading>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Operator</Th>
                    <Th>Description</Th>
                    <Th>Example</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td><Code>EQUALS</Code></Td>
                    <Td>Exact match</Td>
                    <Td><Code>status = "ACTIVE"</Code></Td>
                  </Tr>
                  <Tr>
                    <Td><Code>GREATER_THAN</Code></Td>
                    <Td>Numeric comparison</Td>
                    <Td><Code>amount {'>'} 50000</Code></Td>
                  </Tr>
                  <Tr>
                    <Td><Code>CONTAINS</Code></Td>
                    <Td>Text contains</Td>
                    <Td><Code>name contains "Corp"</Code></Td>
                  </Tr>
                  <Tr>
                    <Td><Code>IS_NOT_NULL</Code></Td>
                    <Td>Field has value</Td>
                    <Td><Code>assigned_to is not empty</Code></Td>
                  </Tr>
                  <Tr>
                    <Td><Code>OLDER_THAN</Code></Td>
                    <Td>Date comparison</Td>
                    <Td><Code>close_date older than 7 days</Code></Td>
                  </Tr>
                  <Tr>
                    <Td><Code>INCREASED_BY_PERCENT</Code></Td>
                    <Td>Percentage change</Td>
                    <Td><Code>amount increased by 25%</Code></Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiRefreshCw} color={accentColor} />
                <Heading size="md">Actions System</Heading>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              <Card bg={successColor + ".50"}>
                <CardBody>
                  <HStack>
                    <Badge colorScheme="green">NOTIFY_OWNER</Badge>
                    <Text>Send notification to entity owner</Text>
                  </HStack>
                  <Code mt={2} display="block" p={3} bg="white" fontSize="sm">
                    {`{
  "type": "NOTIFY_OWNER",
  "template": "Deal Alert",
  "message": "Your deal {{deal_name}} needs attention",
  "priority": 3
}`}
                  </Code>
                </CardBody>
              </Card>

              <Card bg={successColor + ".50"}>
                <CardBody>
                  <HStack>
                    <Badge colorScheme="green">NOTIFY_USER</Badge>
                    <Text>Send notification to specific user</Text>
                  </HStack>
                  <Code mt={2} display="block" p={3} bg="white" fontSize="sm">
                    {`{
  "type": "NOTIFY_USER",
  "target": "user-uuid",
  "message": "Deal {{deal_name}} requires review",
  "priority": 2
}`}
                  </Code>
                </CardBody>
              </Card>

              <Card bg={warningColor + ".50"}>
                <CardBody>
                  <HStack>
                    <Badge colorScheme="orange">CREATE_TASK</Badge>
                    <Text>Create follow-up task (Coming Soon)</Text>
                  </HStack>
                </CardBody>
              </Card>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );

  const TemplateVariablesSection = () => (
    <VStack spacing={6} align="stretch">
      <Alert status="info">
        <AlertIcon />
        <Text>Template variables make your notifications dynamic by inserting real data from your CRM entities.</Text>
      </Alert>

      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiTarget} color={accentColor} />
                <Text fontWeight="bold">Deal Variables</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Variable</Th>
                    <Th>Output Example</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td><Code>{`{{deal_name}}`}</Code></Td>
                    <Td>"ACME Corporation Deal"</Td>
                  </Tr>
                  <Tr>
                    <Td><Code>{`{{deal_amount}}`}</Code></Td>
                    <Td>"EUR 75,000.00" (formatted with currency)</Td>
                  </Tr>
                  <Tr>
                    <Td><Code>{`{{deal_currency}}`}</Code></Td>
                    <Td>"EUR"</Td>
                  </Tr>
                  <Tr>
                    <Td><Code>{`{{deal_stage}}`}</Code></Td>
                    <Td>"Negotiation"</Td>
                  </Tr>
                  <Tr>
                    <Td><Code>{`{{deal_owner}}`}</Code></Td>
                    <Td>"John Smith"</Td>
                  </Tr>
                  <Tr>
                    <Td><Code>{`{{deal_close_date}}`}</Code></Td>
                    <Td>"2025-02-15"</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiUsers} color={accentColor} />
                <Text fontWeight="bold">Lead & Contact Variables</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardHeader>
                  <Text fontWeight="bold">Lead Variables</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem><Code>{`{{lead_name}}`}</Code> → "Jane Doe"</ListItem>
                    <ListItem><Code>{`{{lead_email}}`}</Code> → "jane@company.com"</ListItem>
                    <ListItem><Code>{`{{lead_value}}`}</Code> → "USD 25,000.00"</ListItem>
                    <ListItem><Code>{`{{lead_source}}`}</Code> → "Website Form"</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontWeight="bold">Organization Variables</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem><Code>{`{{organization_name}}`}</Code> → "ACME Corporation"</ListItem>
                    <ListItem><Code>{`{{organization_website}}`}</Code> → "https://acme.com"</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontWeight="bold">Person Variables</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem><Code>{`{{person_name}}`}</Code> → "John Smith"</ListItem>
                    <ListItem><Code>{`{{person_email}}`}</Code> → "john@company.com"</ListItem>
                    <ListItem><Code>{`{{person_phone}}`}</Code> → "(555) 123-4567"</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiClock} color={accentColor} />
                <Text fontWeight="bold">Universal Variables</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <UnorderedList spacing={2}>
              <ListItem><Code>{`{{entity_id}}`}</Code> → Entity UUID</ListItem>
              <ListItem><Code>{`{{entity_name}}`}</Code> → Context-aware entity name</ListItem>
              <ListItem><Code>{`{{current_date}}`}</Code> → "2025-01-20"</ListItem>
              <ListItem><Code>{`{{current_time}}`}</Code> → "2025-01-20 14:30:00"</ListItem>
            </UnorderedList>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Card bg={cardBg}>
        <CardHeader>
          <HStack>
            <Icon as={FiEdit} color={accentColor} />
            <Text fontWeight="bold">Template Examples</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="semibold" mb={2}>Professional Notifications:</Text>
              <Code display="block" p={3} bg="white" fontSize="sm">
                "High value opportunity: {`{{deal_name}}`} worth {`{{deal_amount}}`} requires immediate attention."
              </Code>
            </Box>
            
            <Box>
              <Text fontWeight="semibold" mb={2}>Rich Context Messages:</Text>
              <Code display="block" p={3} bg="white" fontSize="sm">
                "🚨 URGENT: Deal {`{{deal_name}}`} value dropped by 25% to {`{{deal_amount}}`}. Immediate review required."
              </Code>
            </Box>
            
            <Box>
              <Text fontWeight="semibold" mb={2}>Assignment Updates:</Text>
              <Code display="block" p={3} bg="white" fontSize="sm">
                "✅ SUCCESS: You are now responsible for {`{{deal_name}}`} ({`{{deal_amount}}`}) closing on {`{{deal_close_date}}`}."
              </Code>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );

  const ExamplesSection = () => (
    <VStack spacing={6} align="stretch">
      <Alert status="success">
        <AlertIcon />
        <Text>These examples are production-ready and can be copied directly into your business rules.</Text>
      </Alert>

      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Badge colorScheme="green">EXAMPLE 1</Badge>
                <Text fontWeight="bold">High Value Deal Alert</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Code display="block" p={4} bg="white" fontSize="sm" whiteSpace="pre-wrap">
{`Entity: DEAL
Trigger: EVENT_BASED (DEAL_CREATED)
Conditions:
  - amount GREATER_THAN 50000
Actions:
  - NOTIFY_OWNER: "High value deal detected: {{deal_name}} - Amount: {{deal_amount}}"`}
            </Code>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Badge colorScheme="blue">EXAMPLE 2</Badge>
                <Text fontWeight="bold">Deal Assignment Notification</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Code display="block" p={4} bg="white" fontSize="sm" whiteSpace="pre-wrap">
{`Entity: DEAL
Trigger: FIELD_CHANGE (assigned_to_user_id)
Conditions:
  - assigned_to_user_id IS_NOT_NULL
Actions:
  - NOTIFY_OWNER: "You have been assigned to deal: {{deal_name}} with amount {{deal_amount}}"`}
            </Code>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Badge colorScheme="orange">EXAMPLE 3</Badge>
                <Text fontWeight="bold">Deal Value Change Alert</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Code display="block" p={4} bg="white" fontSize="sm" whiteSpace="pre-wrap">
{`Entity: DEAL
Trigger: FIELD_CHANGE (amount)
Conditions:
  - amount DECREASED_BY_PERCENT 25
Actions:
  - NOTIFY_OWNER: "Deal value decreased: {{deal_name}} is now {{deal_amount}}"
  - Priority: 3 (HIGH)`}
            </Code>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Badge colorScheme="purple">EXAMPLE 4</Badge>
                <Text fontWeight="bold">Enterprise Deal Alert</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Code display="block" p={4} bg="white" fontSize="sm" whiteSpace="pre-wrap">
{`Entity: DEAL
Trigger: EVENT_BASED (DEAL_CREATED)
Conditions:
  - amount GREATER_THAN 100000 AND
  - organization_name CONTAINS "Corporation"
Actions:
  - NOTIFY_USER (manager): "Enterprise deal created: {{deal_name}} for {{organization_name}} worth {{deal_amount}}"`}
            </Code>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Badge colorScheme="red">EXAMPLE 5</Badge>
                <Text fontWeight="bold">Lost Deal Recovery</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Code display="block" p={4} bg="white" fontSize="sm" whiteSpace="pre-wrap">
{`Entity: DEAL
Trigger: FIELD_CHANGE (status)
Conditions:
  - status EQUALS "LOST" AND
  - amount GREATER_THAN 25000
Actions:
  - CREATE_TASK: "Analyze lost deal: {{deal_name}} - conduct post-mortem"
  - NOTIFY_OWNER: "High-value deal lost: {{deal_name}} ({{deal_amount}}) - review required"`}
            </Code>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );

  const TroubleshootingSection = () => (
    <VStack spacing={6} align="stretch">
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiAlertTriangle} color={warningColor} />
                <Text fontWeight="bold">Common Problems</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardHeader>
                  <Text fontWeight="bold" color="red.500">Rule not triggering</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem>✅ Verify rule status is ACTIVE</ListItem>
                    <ListItem>✅ Check trigger configuration matches test scenario</ListItem>
                    <ListItem>✅ Confirm entity type and conditions are correct</ListItem>
                    <ListItem>✅ Review rule execution logs for errors</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontWeight="bold" color="red.500">Template variables showing as {`{{variable}}`}</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem>✅ Check variable name spelling and case</ListItem>
                    <ListItem>✅ Verify entity data contains the referenced field</ListItem>
                    <ListItem>✅ Ensure proper template syntax with double braces</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontWeight="bold" color="red.500">Notifications not appearing</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem>✅ Check user permissions for target notifications</ListItem>
                    <ListItem>✅ Verify notification center is functioning</ListItem>
                    <ListItem>✅ Review notification table for created records</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontWeight="bold" color="red.500">Performance issues</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem>✅ Simplify complex condition logic</ListItem>
                    <ListItem>✅ Reduce rule execution frequency</ListItem>
                    <ListItem>✅ Monitor database query performance</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FiTrendingUp} color={accentColor} />
                <Text fontWeight="bold">Best Practices</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardHeader>
                  <Text fontWeight="bold">Rule Design Principles</Text>
                </CardHeader>
                <CardBody>
                  <OrderedList spacing={2}>
                    <ListItem><strong>Start Simple:</strong> Begin with basic rules and add complexity gradually</ListItem>
                    <ListItem><strong>Use Descriptive Names:</strong> Make rule purposes clear to other admins</ListItem>
                    <ListItem><strong>Test Thoroughly:</strong> Always test rules in test mode before activation</ListItem>
                    <ListItem><strong>Monitor Performance:</strong> Watch for rules that trigger too frequently</ListItem>
                    <ListItem><strong>Regular Reviews:</strong> Periodically audit rules for relevance and effectiveness</ListItem>
                  </OrderedList>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text fontWeight="bold">Notification Guidelines</Text>
                </CardHeader>
                <CardBody>
                  <UnorderedList spacing={2}>
                    <ListItem><strong>Clear Messaging:</strong> Use template variables to provide context</ListItem>
                    <ListItem><strong>Appropriate Priorities:</strong> Reserve urgent notifications for true emergencies</ListItem>
                    <ListItem><strong>Actionable Content:</strong> Include next steps or required actions</ListItem>
                    <ListItem><strong>Consistent Formatting:</strong> Use standardized message templates</ListItem>
                  </UnorderedList>
                </CardBody>
              </Card>

              <Alert status="info" mt={4}>
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Priority Guidelines:</Text>
                  <UnorderedList>
                    <ListItem><Badge colorScheme="gray">Priority 1 (Low):</Badge> Informational updates, routine notifications</ListItem>
                    <ListItem><Badge colorScheme="blue">Priority 2 (Medium):</Badge> Standard business alerts, assignment changes</ListItem>
                    <ListItem><Badge colorScheme="orange">Priority 3 (High):</Badge> Important issues requiring attention</ListItem>
                    <ListItem><Badge colorScheme="red">Priority 4 (Urgent):</Badge> Critical problems needing immediate action</ListItem>
                  </UnorderedList>
                </VStack>
              </Alert>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );

  const SecuritySection = () => (
    <VStack spacing={6} align="stretch">
      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiShield} color={successColor} />
            <Heading size="md">🔐 Security & Permissions</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>Role-Based Access:</Text>
              <UnorderedList spacing={2}>
                <ListItem><strong>Admin Rights Required:</strong> Create and modify business rules</ListItem>
                <ListItem><strong>Rule Execution:</strong> Rules respect existing entity permissions</ListItem>
                <ListItem><strong>Notifications:</strong> Only sent to authorized users</ListItem>
                <ListItem><strong>Audit Trails:</strong> Complete execution history maintained</ListItem>
              </UnorderedList>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>Data Privacy:</Text>
              <UnorderedList spacing={2}>
                <ListItem>Template variables only include data users have permission to see</ListItem>
                <ListItem>Sensitive fields are automatically filtered</ListItem>
                <ListItem>Full compliance with data protection regulations</ListItem>
              </UnorderedList>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );

  const SupportSection = () => (
    <VStack spacing={6} align="stretch">
      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiLifeBuoy} color={accentColor} />
            <Heading size="md">🆘 Getting Help</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Icon as={FiBook} color={accentColor} />
              <Text><strong>Documentation:</strong> Review this manual and system documentation</Text>
            </HStack>
            <HStack>
              <Icon as={FiMonitor} color={accentColor} />
              <Text><strong>Logs:</strong> Check rule execution logs for detailed error information</Text>
            </HStack>
            <HStack>
              <Icon as={FiMail} color={accentColor} />
              <Text><strong>Support:</strong> Contact system administrators for complex issues</Text>
            </HStack>
            <HStack>
              <Icon as={FiUsers} color={accentColor} />
              <Text><strong>Community:</strong> Share experiences with other PipeCD administrators</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={cardBg}>
        <CardHeader>
          <HStack>
            <Icon as={FiGraduationCap} color={warningColor} />
            <Heading size="md">🔮 Coming Soon</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>Phase 2 Features:</Text>
              <UnorderedList spacing={1}>
                <ListItem><Badge colorScheme="orange">TIME_BASED Rules</Badge> - Scheduled rule execution</ListItem>
                <ListItem><Badge colorScheme="orange">CREATE_TASK</Badge> - Automatically generate follow-up tasks</ListItem>
                <ListItem><Badge colorScheme="orange">SEND_EMAIL</Badge> - Send email notifications</ListItem>
                <ListItem><Badge colorScheme="orange">UPDATE_FIELD</Badge> - Automatically update entity fields</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>Phase 3 Features:</Text>
              <UnorderedList spacing={1}>
                <ListItem>Advanced scheduling with complex time configurations</ListItem>
                <ListItem>Workflow integration with WFM stages</ListItem>
                <ListItem>External integrations via webhooks</ListItem>
                <ListItem>Analytics dashboard for rule effectiveness</ListItem>
              </UnorderedList>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      <Alert status="info">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">System Resources:</Text>
          <UnorderedList>
            <ListItem><strong>System Status:</strong> Monitor business rules engine health in Admin → System Health</ListItem>
            <ListItem><strong>Training:</strong> Request administrator training sessions for complex scenarios</ListItem>
            <ListItem><strong>Updates:</strong> Stay informed about new features and improvements</ListItem>
          </UnorderedList>
        </VStack>
      </Alert>
    </VStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" maxH="90vh">
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          <HStack>
            <Icon as={FiBook} color={accentColor} />
            <Text>Business Rules Engine - Administrator Guide</Text>
            <Badge colorScheme="blue" ml="auto">v1.0</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0} overflow="hidden">
          <Tabs index={activeTab} onChange={setActiveTab} isLazy h="full">
            <TabList px={6} pt={4} flexWrap="wrap">
              <Tab>
                <HStack>
                  <Icon as={FiPlay} />
                  <Text>Quick Start</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiCpu} />
                  <Text>Rule Components</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiEdit} />
                  <Text>Template Variables</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiCheckCircle} />
                  <Text>Examples</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiHelpCircle} />
                  <Text>Troubleshooting</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiShield} />
                  <Text>Security</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FiLifeBuoy} />
                  <Text>Support</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels h="calc(90vh - 200px)" overflowY="auto">
              <TabPanel p={6}>
                <QuickStartSection />
              </TabPanel>
              <TabPanel p={6}>
                <RuleComponentsSection />
              </TabPanel>
              <TabPanel p={6}>
                <TemplateVariablesSection />
              </TabPanel>
              <TabPanel p={6}>
                <ExamplesSection />
              </TabPanel>
              <TabPanel p={6}>
                <TroubleshootingSection />
              </TabPanel>
              <TabPanel p={6}>
                <SecuritySection />
              </TabPanel>
              <TabPanel p={6}>
                <SupportSection />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BusinessRulesAdminGuide; 