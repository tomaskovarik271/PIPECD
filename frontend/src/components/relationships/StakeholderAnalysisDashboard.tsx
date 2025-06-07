import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Grid,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  IconButton,
  Tooltip,
  useColorModeValue,
  Flex,
  Spacer,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  UserPlus,
  Brain,
  Shield,
  Crown,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye
} from 'lucide-react';
import { gqlClient } from '../../lib/graphqlClient';

// GraphQL queries
const FIND_MISSING_STAKEHOLDERS = `
  query FindMissingStakeholders($organizationId: ID!, $dealId: ID, $leadId: ID, $industryType: String, $dealSize: String) {
    findMissingStakeholders(
      organizationId: $organizationId,
      dealId: $dealId,
      leadId: $leadId,
      industryType: $industryType,
      dealSize: $dealSize
    ) {
      missingRoles
      currentCoverage
      recommendedCoverage
      coveragePercentage
      priorityAdditions
      suggestedActions
    }
  }
`;

const STAKEHOLDER_ANALYSES = `
  query StakeholderAnalyses($organizationId: ID!, $dealId: ID, $leadId: ID) {
    stakeholderAnalyses(
      organizationId: $organizationId,
      dealId: $dealId,
      leadId: $leadId
    ) {
      id
      person {
        id
        first_name
        last_name
        email
      }
      influenceScore
      decisionAuthority
      engagementLevel
      approachStrategy
      nextBestAction
      aiPersonalityProfile
      aiCommunicationStyle
    }
    organizationRoles(organizationId: $organizationId, includeInactive: false) {
      id
      person {
        id
        first_name
        last_name
      }
      roleTitle
      department
      seniorityLevel
      budgetAuthorityUsd
      teamSize
    }
  }
`;

// Types for stakeholder analysis data
interface StakeholderCoverage {
  seniority_coverage: Record<string, number>;
  department_coverage: Record<string, number>;
  total_roles: number;
  analyzed_stakeholders: number;
}

interface MissingStakeholder {
  title: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggested_approach?: string;
}

interface StakeholderRecommendations {
  missing_roles: MissingStakeholder[];
  current_coverage: number;
  recommended_coverage: number;
  coverage_percentage: number;
  priority_additions: MissingStakeholder[];
  suggested_actions: Array<{
    role: string;
    action: string;
    priority: string;
    reason: string;
    suggested_approach: string;
  }>;
}

interface NetworkInsight {
  type: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  data?: any;
}

interface StakeholderAnalysisDashboardProps {
  organizationId: string;
  dealId?: string;
  leadId?: string;
  onAnalyzeNetwork?: () => void;
  onFindMissingStakeholders?: () => void;
}

export const StakeholderAnalysisDashboard: React.FC<StakeholderAnalysisDashboardProps> = ({
  organizationId,
  dealId,
  leadId,
  onAnalyzeNetwork,
  onFindMissingStakeholders
}) => {
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [coverage, setCoverage] = useState<StakeholderCoverage | null>(null);
  const [recommendations, setRecommendations] = useState<StakeholderRecommendations | null>(null);
  const [insights, setInsights] = useState<NetworkInsight[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Move useColorModeValue to top level to avoid hooks order violation
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const summaryBg = useColorModeValue('blue.50', 'blue.900');
  const summaryTextColor = useColorModeValue('blue.700', 'blue.200');

  // Fetch analysis data using GraphQL
  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      try {
        // Fetch missing stakeholders and current stakeholder analyses
        const [missingData, stakeholderData] = await Promise.all([
          gqlClient.request(FIND_MISSING_STAKEHOLDERS, {
            organizationId,
            dealId,
            leadId,
            industryType: undefined, // Could be passed as prop
            dealSize: undefined // Could be passed as prop
          }) as any,
          gqlClient.request(STAKEHOLDER_ANALYSES, {
            organizationId,
            dealId,
            leadId
          }) as any
        ]);

        const missingStakeholders = missingData.findMissingStakeholders;
        const stakeholders = stakeholderData.stakeholderAnalyses || [];
        const roles = stakeholderData.organizationRoles || [];

        // Transform missing stakeholders data
        setRecommendations({
          missing_roles: Array.isArray(missingStakeholders.missingRoles) 
            ? missingStakeholders.missingRoles 
            : Object.values(missingStakeholders.missingRoles || {}),
          current_coverage: missingStakeholders.currentCoverage || stakeholders.length,
          recommended_coverage: missingStakeholders.recommendedCoverage || stakeholders.length + 3,
          coverage_percentage: missingStakeholders.coveragePercentage || 0,
          priority_additions: Array.isArray(missingStakeholders.priorityAdditions)
            ? missingStakeholders.priorityAdditions
            : Object.values(missingStakeholders.priorityAdditions || {}),
          suggested_actions: Array.isArray(missingStakeholders.suggestedActions)
            ? missingStakeholders.suggestedActions
            : Object.values(missingStakeholders.suggestedActions || {})
        });

        // Calculate coverage from roles data
        const seniorityMap: Record<string, number> = {};
        const departmentMap: Record<string, number> = {};

        roles.forEach((role: any) => {
          const seniority = role.seniorityLevel || 'unknown';
          const department = role.department || 'unknown';
          
          seniorityMap[seniority] = (seniorityMap[seniority] || 0) + 1;
          departmentMap[department] = (departmentMap[department] || 0) + 1;
        });

        setCoverage({
          seniority_coverage: seniorityMap,
          department_coverage: departmentMap,
          total_roles: roles.length,
          analyzed_stakeholders: stakeholders.length
        });

        // Generate insights based on the data
        const generatedInsights: NetworkInsight[] = [];
        
        if (stakeholders.length === 0) {
          generatedInsights.push({
            type: 'risk_alert',
            message: 'No stakeholder analyses found for this organization',
            priority: 'high'
          });
        } else {
          const averageInfluence = stakeholders.reduce((sum: number, s: any) => sum + (s.influenceScore || 0), 0) / stakeholders.length;
          generatedInsights.push({
            type: 'opportunity',
            message: `Average influence score: ${averageInfluence.toFixed(1)}/10`,
            priority: averageInfluence >= 7 ? 'medium' : 'low'
          });
        }

        if (missingStakeholders.coveragePercentage < 70) {
          generatedInsights.push({
            type: 'coverage_gap',
            message: `Coverage below 70% - missing key stakeholders in decision process`,
            priority: 'high'
          });
        }

        setInsights(generatedInsights);

      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [organizationId, dealId, leadId]);

  const handleRefresh = async () => {
    try {
      // Fetch missing stakeholders and current stakeholder analyses
      const [missingData, stakeholderData] = await Promise.all([
        gqlClient.request(FIND_MISSING_STAKEHOLDERS, {
          organizationId,
          dealId,
          leadId,
          industryType: undefined,
          dealSize: undefined
        }) as any,
        gqlClient.request(STAKEHOLDER_ANALYSES, {
          organizationId,
          dealId,
          leadId
        }) as any
      ]);

      const missingStakeholders = missingData.findMissingStakeholders;
      const stakeholders = stakeholderData.stakeholderAnalyses || [];
      const roles = stakeholderData.organizationRoles || [];

      // Transform missing stakeholders data
      setRecommendations({
        missing_roles: Array.isArray(missingStakeholders.missingRoles) 
          ? missingStakeholders.missingRoles 
          : Object.values(missingStakeholders.missingRoles || {}),
        current_coverage: missingStakeholders.currentCoverage || stakeholders.length,
        recommended_coverage: missingStakeholders.recommendedCoverage || stakeholders.length + 3,
        coverage_percentage: missingStakeholders.coveragePercentage || 0,
        priority_additions: Array.isArray(missingStakeholders.priorityAdditions)
          ? missingStakeholders.priorityAdditions
          : Object.values(missingStakeholders.priorityAdditions || {}),
        suggested_actions: Array.isArray(missingStakeholders.suggestedActions)
          ? missingStakeholders.suggestedActions
          : Object.values(missingStakeholders.suggestedActions || {})
      });

      // Calculate coverage from roles data
      const seniorityMap: Record<string, number> = {};
      const departmentMap: Record<string, number> = {};

      roles.forEach((role: any) => {
        const seniority = role.seniorityLevel || 'unknown';
        const department = role.department || 'unknown';
        
        seniorityMap[seniority] = (seniorityMap[seniority] || 0) + 1;
        departmentMap[department] = (departmentMap[department] || 0) + 1;
      });

      setCoverage({
        seniority_coverage: seniorityMap,
        department_coverage: departmentMap,
        total_roles: roles.length,
        analyzed_stakeholders: stakeholders.length
      });

      // Generate insights based on the data
      const generatedInsights: NetworkInsight[] = [];
      
      if (stakeholders.length === 0) {
        generatedInsights.push({
          type: 'risk_alert',
          message: 'No stakeholder analyses found for this organization',
          priority: 'high'
        });
      } else {
        const averageInfluence = stakeholders.reduce((sum: number, s: any) => sum + (s.influenceScore || 0), 0) / stakeholders.length;
        generatedInsights.push({
          type: 'opportunity',
          message: `Average influence score: ${averageInfluence.toFixed(1)}/10`,
          priority: averageInfluence >= 7 ? 'medium' : 'low'
        });
      }

      if (missingStakeholders.coveragePercentage < 70) {
        generatedInsights.push({
          type: 'coverage_gap',
          message: `Coverage below 70% - missing key stakeholders in decision process`,
          priority: 'high'
        });
      }

      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error refreshing analysis data:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getSeniorityIcon = (level: string) => {
    switch (level) {
      case 'c_level': return <Crown size={16} />;
      case 'vp': return <Shield size={16} />;
      case 'director': return <Target size={16} />;
      case 'manager': return <Users size={16} />;
      default: return <Users size={16} />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Stakeholder Analysis Dashboard</Heading>
        </CardHeader>
        <CardBody>
          <Center h="64">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Analyzing stakeholder network...</Text>
            </VStack>
          </Center>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={6} w="full">
      {/* Header with Actions */}
      <Card w="full">
        <CardHeader>
          <Flex align="center">
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              <Brain size={20} />
              Stakeholder Analysis Dashboard
            </Heading>
            <Spacer />
            <HStack>
              <IconButton
                aria-label="Refresh analysis"
                icon={<Spinner size="sm" />}
                size="sm"
                variant="outline"
                onClick={handleRefresh}
              />
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Eye size={16} />}
                onClick={onAnalyzeNetwork}
              >
                View Network
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<UserPlus size={16} />}
                onClick={onFindMissingStakeholders}
              >
                Find Missing
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
      </Card>

      {/* Coverage Overview */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4} w="full">
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Coverage Percentage</StatLabel>
              <StatNumber color={recommendations?.coverage_percentage && recommendations.coverage_percentage >= 75 ? 'green.500' : 'orange.500'}>
                {recommendations?.coverage_percentage.toFixed(1)}%
              </StatNumber>
              <StatHelpText>
                <StatArrow type={recommendations?.coverage_percentage && recommendations.coverage_percentage >= 75 ? 'increase' : 'decrease'} />
                {recommendations?.current_coverage} of {recommendations?.recommended_coverage} roles covered
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Stakeholders</StatLabel>
              <StatNumber>{coverage?.analyzed_stakeholders}</StatNumber>
              <StatHelpText>
                Across {Object.keys(coverage?.department_coverage || {}).length} departments
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>High Priority Gaps</StatLabel>
              <StatNumber color="red.500">
                {recommendations?.missing_roles.filter(r => r.priority === 'high').length || 0}
              </StatNumber>
              <StatHelpText>
                Critical roles missing
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>C-Level Coverage</StatLabel>
              <StatNumber color="blue.500">
                {coverage?.seniority_coverage.c_level || 0}
              </StatNumber>
              <StatHelpText>
                Executive stakeholders mapped
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Network Insights */}
      {insights.length > 0 && (
        <Card w="full">
          <CardHeader>
            <Heading size="md" mb={4}>
              <HStack spacing={2}>
                <Brain size={20} />
                <Text>Network Intelligence Insights</Text>
              </HStack>
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              {insights.map((insight, index) => (
                <Box
                  key={index}
                  p={4}
                  borderRadius="lg"
                  bg="gray.700"
                  border="1px"
                  borderColor="gray.600"
                  w="full"
                  shadow="lg"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: insight.priority === 'high' ? 'red.400' :
                                 insight.priority === 'medium' ? 'orange.400' :
                                 'blue.400',
                    shadow: insight.priority === 'high' ? '0 0 20px rgba(239, 68, 68, 0.3)' :
                            insight.priority === 'medium' ? '0 0 20px rgba(251, 146, 60, 0.3)' :
                            '0 0 20px rgba(59, 130, 246, 0.3)',
                    transform: 'translateY(-2px)'
                  }}
                  _dark={{
                    bg: "gray.800",
                    borderColor: "gray.600",
                    _hover: {
                      borderColor: insight.priority === 'high' ? 'red.400' :
                                   insight.priority === 'medium' ? 'orange.400' :
                                   'blue.400',
                      shadow: insight.priority === 'high' ? '0 0 20px rgba(239, 68, 68, 0.4)' :
                              insight.priority === 'medium' ? '0 0 20px rgba(251, 146, 60, 0.4)' :
                              '0 0 20px rgba(59, 130, 246, 0.4)',
                    }
                  }}
                >
                  <HStack spacing={3} align="start">
                    <Box flexShrink={0} mt={1}>
                      {insight.priority === 'high' && <AlertTriangle size={20} color="#e53e3e" />}
                      {insight.priority === 'medium' && <Target size={20} color="#d69e2e" />}
                      {!insight.priority && <TrendingUp size={20} color="#3182ce" />}
                    </Box>
                    <Box flex={1}>
                      <Text 
                        fontSize="md" 
                        fontWeight="medium"
                        color="white"
                        _dark={{ color: "gray.100" }}
                        lineHeight="1.5"
                      >
                        {insight.message}
                      </Text>
                      {insight.priority && (
                        <Badge 
                          mt={2}
                          colorScheme={
                            insight.priority === 'high' ? 'red' :
                            insight.priority === 'medium' ? 'orange' :
                            'blue'
                          }
                          size="sm"
                          variant="solid"
                        >
                          {insight.priority.toUpperCase()} PRIORITY
                        </Badge>
                      )}
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Coverage Breakdown */}
      <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6} w="full">
        {/* Seniority Coverage */}
        <Card>
          <CardHeader>
            <Heading size="sm" display="flex" alignItems="center" gap={2}>
              <Crown size={16} />
              Seniority Level Coverage
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {Object.entries(coverage?.seniority_coverage || {}).map(([level, count]) => (
                <Box key={level} w="full">
                  <Flex justify="space-between" mb={1}>
                    <HStack>
                      {getSeniorityIcon(level)}
                      <Text fontSize="sm" textTransform="capitalize">
                        {level.replace('_', ' ')}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold">{count}</Text>
                  </Flex>
                  <Progress 
                    value={(count / Math.max(...Object.values(coverage?.seniority_coverage || {}))) * 100}
                    size="sm"
                    colorScheme={count > 0 ? 'blue' : 'gray'}
                    bg="gray.100"
                  />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Department Coverage */}
        <Card>
          <CardHeader>
            <Heading size="sm" display="flex" alignItems="center" gap={2}>
              <Building2 size={16} />
              Department Coverage
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {Object.entries(coverage?.department_coverage || {}).map(([dept, count]) => (
                <Box key={dept} w="full">
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm">{dept}</Text>
                    <HStack spacing={1}>
                      <Text fontSize="sm" fontWeight="bold">{count}</Text>
                      {count === 0 ? (
                        <XCircle size={12} color="#e53e3e" />
                      ) : (
                        <CheckCircle size={12} color="#38a169" />
                      )}
                    </HStack>
                  </Flex>
                  <Progress 
                    value={(count / Math.max(...Object.values(coverage?.department_coverage || {}))) * 100}
                    size="sm"
                    colorScheme={count > 0 ? 'green' : 'red'}
                    bg="gray.100"
                  />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Missing Stakeholders & Recommendations */}
      <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6} w="full">
        {/* Priority Missing Roles */}
        <Card>
          <CardHeader>
            <Heading size="sm" display="flex" alignItems="center" gap={2}>
              <AlertTriangle size={16} />
              Priority Missing Roles
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {recommendations?.priority_additions.map((role, index) => (
                <Box key={index} p={4} border="1px" borderColor={borderColor} borderRadius="md" w="full">
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="semibold">{role.title}</Text>
                      <Badge colorScheme={getPriorityColor(role.priority)}>
                        {role.priority.toUpperCase()}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      <strong>Why:</strong> {role.reason}
                    </Text>
                    {role.suggested_approach && (
                      <Text fontSize="sm" color="blue.600">
                        <strong>Approach:</strong> {role.suggested_approach}
                      </Text>
                    )}
                    <Button size="xs" variant="outline" leftIcon={<UserPlus size={12} />}>
                      Add Stakeholder
                    </Button>
                  </VStack>
                </Box>
              )) || <Text fontSize="sm" color="gray.500">No high-priority gaps identified</Text>}
            </VStack>
          </CardBody>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <Heading size="sm" display="flex" alignItems="center" gap={2}>
              <Target size={16} />
              Recommended Actions
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {recommendations?.suggested_actions.slice(0, 5).map((action, index) => (
                <Box key={index} p={4} border="1px" borderColor={borderColor} borderRadius="md" w="full">
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="semibold" fontSize="sm">{action.action}</Text>
                      <Badge colorScheme={getPriorityColor(action.priority)} size="sm">
                        {action.priority.toUpperCase()}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">
                      {action.suggested_approach}
                    </Text>
                    <HStack spacing={2}>
                      <Button size="xs" colorScheme="blue">
                        Take Action
                      </Button>
                      <Button size="xs" variant="outline" leftIcon={<Clock size={10} />}>
                        Schedule
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              )) || <Text fontSize="sm" color="gray.500">No actions required</Text>}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Summary Card */}
      <Card w="full" bg={summaryBg} borderColor={borderColor}>
        <CardHeader>
          <Heading size="sm" color={summaryTextColor}>📊 Analysis Summary</Heading>
        </CardHeader>
        <CardBody>
          <Text fontSize="sm" color={summaryTextColor}>
            Your stakeholder network has <strong>{recommendations?.coverage_percentage.toFixed(1)}% coverage</strong> with{' '}
            <strong>{coverage?.analyzed_stakeholders} mapped stakeholders</strong> across{' '}
            <strong>{Object.keys(coverage?.department_coverage || {}).length} departments</strong>.{' '}
            Focus on engaging <strong>{recommendations?.missing_roles.filter(r => r.priority === 'high').length} high-priority missing roles</strong>{' '}
            to strengthen your position and increase deal probability.
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
}; 