import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Box, 
  Card, 
  CardBody, 
  CardHeader, 
  Heading, 
  Badge, 
  Button, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Spinner,
  Center
} from '@chakra-ui/react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Network,
  User,
  Building2,
  Crown,
  Shield,
  Zap
} from 'lucide-react';
import { gqlClient } from '../../lib/graphqlClient';

// GraphQL query for stakeholder network analysis
const ANALYZE_STAKEHOLDER_NETWORK = `
  query AnalyzeStakeholderNetwork($organizationId: ID!, $dealId: ID, $leadId: ID, $includeInactiveRoles: Boolean) {
    analyzeStakeholderNetwork(
      organizationId: $organizationId, 
      dealId: $dealId, 
      leadId: $leadId, 
      includeInactiveRoles: $includeInactiveRoles
    ) {
      organization {
        id
        name
      }
      stakeholderCount
      roleCount
      relationshipCount
      stakeholders {
        id
        person {
          id
          first_name
          last_name
          email
          phone
        }
        influenceScore
        decisionAuthority
        engagementLevel
        approachStrategy
        nextBestAction
        aiPersonalityProfile
        aiCommunicationStyle
      }
      roles {
        id
        person {
          id
          first_name
          last_name
          email
        }
        roleTitle
        department
        seniorityLevel
        budgetAuthorityUsd
        teamSize
        responsibilities
      }
      relationships {
        id
        fromPerson {
          id
          first_name
          last_name
        }
        toPerson {
          id
          first_name
          last_name
        }
        relationshipType
        relationshipStrength
        isBidirectional
        interactionFrequency
        relationshipContext
      }
      networkInsights
      coverageAnalysis
      influenceMap
    }
  }
`;

// Types for our visualization data
interface StakeholderNode {
  id: string;
  name: string;
  title: string;
  department?: string;
  influenceScore: number;
  decisionAuthority: 'FINAL_DECISION' | 'STRONG_INFLUENCE' | 'RECOMMENDER' | 'INFLUENCER' | 'GATEKEEPER' | 'END_USER' | 'BLOCKER';
  engagementLevel: 'CHAMPION' | 'SUPPORTER' | 'NEUTRAL' | 'SKEPTIC' | 'BLOCKER';
  seniorityLevel?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTOR' | 'VP' | 'C_LEVEL' | 'FOUNDER';
  email?: string;
  phone?: string;
  avatar?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface RelationshipLink {
  source: string | StakeholderNode;
  target: string | StakeholderNode;
  type: 'REPORTS_TO' | 'MANAGES' | 'INFLUENCES' | 'COLLABORATES_WITH' | 'MENTORS' | 'PARTNERS_WITH';
  strength: number;
  bidirectional: boolean;
}

interface NetworkInsight {
  type: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  data?: any;
}

interface StakeholderNetworkData {
  organization: {
    id: string;
    name: string;
  };
  stakeholder_count: number;
  role_count: number;
  relationship_count: number;
  stakeholders: any[];
  roles: any[];
  relationships: any[];
  network_insights: NetworkInsight[];
  coverage_analysis: {
    seniority_coverage: Record<string, number>;
    department_coverage: Record<string, number>;
    total_roles: number;
    analyzed_stakeholders: number;
  };
  influence_map: Record<string, any>;
}

interface StakeholderNetworkVisualizationProps {
  organizationId: string;
  dealId?: string;
  leadId?: string;
  onStakeholderSelect?: (stakeholder: StakeholderNode) => void;
  height?: number;
}

export const StakeholderNetworkVisualization: React.FC<StakeholderNetworkVisualizationProps> = ({
  organizationId,
  dealId,
  leadId,
  onStakeholderSelect,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [networkData, setNetworkData] = useState<StakeholderNetworkData | null>(null);
  const [selectedNode, setSelectedNode] = useState<StakeholderNode | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [viewMode, setViewMode] = useState<'influence' | 'hierarchy' | 'engagement'>('influence');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch network data using GraphQL
  useEffect(() => {
    const fetchNetworkData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await gqlClient.request(ANALYZE_STAKEHOLDER_NETWORK, {
          organizationId,
          dealId,
          leadId,
          includeInactiveRoles: false
        }) as any;

        const networkAnalysis = data.analyzeStakeholderNetwork;
        
        // Transform GraphQL response to component format
        const transformedData: StakeholderNetworkData = {
          organization: networkAnalysis.organization,
          stakeholder_count: networkAnalysis.stakeholderCount,
          role_count: networkAnalysis.roleCount,
          relationship_count: networkAnalysis.relationshipCount,
          stakeholders: networkAnalysis.stakeholders.map((stakeholder: any) => ({
            id: stakeholder.id,
            person: stakeholder.person,
            influence_score: stakeholder.influenceScore,
            decision_authority: stakeholder.decisionAuthority,
            engagement_level: stakeholder.engagementLevel,
            role_title: networkAnalysis.roles.find((role: any) => role.person.id === stakeholder.person.id)?.roleTitle || 'Unknown Role',
            seniority_level: networkAnalysis.roles.find((role: any) => role.person.id === stakeholder.person.id)?.seniorityLevel,
            department: networkAnalysis.roles.find((role: any) => role.person.id === stakeholder.person.id)?.department
          })),
          roles: networkAnalysis.roles,
          relationships: networkAnalysis.relationships.map((rel: any) => ({
            from_person_id: rel.fromPerson.id,
            to_person_id: rel.toPerson.id,
            relationship_type: rel.relationshipType,
            relationship_strength: rel.relationshipStrength,
            is_bidirectional: rel.isBidirectional
          })),
          network_insights: Array.isArray(networkAnalysis.networkInsights) 
            ? networkAnalysis.networkInsights 
            : Object.values(networkAnalysis.networkInsights || {}),
          coverage_analysis: typeof networkAnalysis.coverageAnalysis === 'object' 
            ? networkAnalysis.coverageAnalysis 
            : {
                seniority_coverage: {},
                department_coverage: {},
                total_roles: networkAnalysis.roleCount,
                analyzed_stakeholders: networkAnalysis.stakeholderCount
              },
          influence_map: networkAnalysis.influenceMap || {}
        };
        
        setNetworkData(transformedData);
      } catch (error) {
        console.error('Error fetching network data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load stakeholder network');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, [organizationId, dealId, leadId]);

  // Process data for D3 visualization
  const { nodes, links } = useMemo(() => {
    if (!networkData) return { nodes: [], links: [] };

    const nodes: StakeholderNode[] = networkData.stakeholders.map(stakeholder => ({
      id: stakeholder.person.id,
      name: `${stakeholder.person.first_name} ${stakeholder.person.last_name}`,
      title: stakeholder.role_title || 'Unknown Role',
      department: stakeholder.department,
      influenceScore: stakeholder.influence_score || 5,
      decisionAuthority: stakeholder.decision_authority,
      engagementLevel: stakeholder.engagement_level,
      seniorityLevel: stakeholder.seniority_level,
      email: stakeholder.person.email,
      phone: stakeholder.person.phone
    }));

    const links: RelationshipLink[] = networkData.relationships.map(rel => ({
      source: rel.from_person_id,
      target: rel.to_person_id,
      type: rel.relationship_type,
      strength: rel.relationship_strength || 5,
      bidirectional: rel.is_bidirectional || false
    }));

    return { nodes, links };
  }, [networkData]);

  // D3 Force Simulation
  useEffect(() => {
    if (!nodes.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create main group
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Color scales based on view mode
    const getNodeColor = (node: StakeholderNode) => {
      switch (viewMode) {
        case 'influence':
          return d3.scaleSequential(d3.interpolateReds)
            .domain([1, 10])(node.influenceScore);
        case 'engagement':
          const engagementColors = {
            CHAMPION: '#22c55e',
            SUPPORTER: '#84cc16', 
            NEUTRAL: '#64748b',
            SKEPTIC: '#f59e0b',
            BLOCKER: '#ef4444'
          };
          return engagementColors[node.engagementLevel];
        case 'hierarchy':
          const hierarchyColors = {
            FOUNDER: '#7c3aed',
            C_LEVEL: '#dc2626',
            VP: '#ea580c',
            DIRECTOR: '#d97706',
            MANAGER: '#65a30d',
            LEAD: '#059669',
            SENIOR: '#0891b2',
            MID: '#3b82f6',
            ENTRY: '#6366f1'
          };
          return hierarchyColors[node.seniorityLevel || 'MID'];
        default:
          return '#64748b';
      }
    };

    // Create force simulation with improved parameters
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-400).distanceMax(300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50).strength(0.9))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Create links with improved styling
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#64748b")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: RelationshipLink) => {
        // More subtle line thickness based on relationship strength
        return Math.max(1.5, Math.min(4, d.strength * 0.8));
      })
      .attr("stroke-dasharray", (d: RelationshipLink) => {
        // Different line styles for different relationship types
        switch (d.type) {
          case 'REPORTS_TO': return '0';
          case 'COLLABORATES_WITH': return '3,3';
          case 'INFLUENCES': return '5,2';
          default: return '0';
        }
      });

    // Create nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer");

    // Node circles with improved visibility and consistency
    node.append("circle")
      .attr("r", (d: StakeholderNode) => {
        // More consistent sizing based on influence
        const baseSize = 22;
        const influenceBonus = (d.influenceScore - 5) * 2;
        return Math.max(18, Math.min(32, baseSize + influenceBonus));
      })
      .attr("fill", getNodeColor)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2.5)
      .attr("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.4))");

    // Authority indicators - improved positioning and styling
    node.append("text")
      .attr("class", "authority-icon")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-family", "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif")
      .attr("font-size", "14px")
      .attr("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.8))")
      .style("user-select", "none")
      .text((d: StakeholderNode) => {
        switch (d.decisionAuthority) {
          case 'FINAL_DECISION': return '👑';
          case 'STRONG_INFLUENCE': return '⚡';
          case 'GATEKEEPER': return '🛡️';
          default: return '';
        }
      });

    // Background rectangles for text labels to improve readability
    const labelGroup = node.append("g")
      .attr("class", "text-labels");

    // Calculate text dimensions and add background
    labelGroup.each(function(d: StakeholderNode) {
      const group = d3.select(this);
      
      // Create background rectangle first
      const bg = group.append("rect")
        .attr("x", 35)
        .attr("y", -16)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", "rgba(30, 41, 59, 0.95)")
        .attr("stroke", "rgba(148, 163, 184, 0.4)")
        .attr("stroke-width", 1)
        .attr("filter", "drop-shadow(0 2px 8px rgba(0,0,0,0.4))");
      
      // Name text - improved styling
      const nameText = group.append("text")
        .attr("dx", 40)
        .attr("dy", "-2")
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("fill", "#f8fafc")
        .attr("font-family", "system-ui, -apple-system, BlinkMacSystemFont, sans-serif")
        .text(d.name);
      
      // Title text - improved styling and contrast
      const titleText = group.append("text")
        .attr("dx", 40)
        .attr("dy", "12")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("fill", "#cbd5e1")
        .attr("font-family", "system-ui, -apple-system, BlinkMacSystemFont, sans-serif")
        .text(d.title);
      
      // Calculate background size based on text with proper padding
      const nameBBox = (nameText.node() as SVGTextElement)?.getBBox() || { width: 0, height: 0 };
      const titleBBox = (titleText.node() as SVGTextElement)?.getBBox() || { width: 0, height: 0 };
      const maxWidth = Math.max(nameBBox.width, titleBBox.width);
      
      bg.attr("width", maxWidth + 16)
        .attr("height", 36);
    });

    // Node interactions
    node
      .on("click", (event: MouseEvent, d: StakeholderNode) => {
        setSelectedNode(d);
        onStakeholderSelect?.(d);
      })
      .on("dblclick", (event: MouseEvent, d: StakeholderNode) => {
        // Double-click to release node from fixed position
        d.fx = null;
        d.fy = null;
        simulation.alphaTarget(0.1).restart();
        setTimeout(() => simulation.alphaTarget(0), 100);
      })
      .on("mouseover", function(event: MouseEvent, d: StakeholderNode) {
        // Highlight connected nodes
        const connectedNodeIds = new Set();
        links.forEach(link => {
          if (link.source === d.id) connectedNodeIds.add(link.target);
          if (link.target === d.id) connectedNodeIds.add(link.source);
        });

        node.style("opacity", (n: StakeholderNode) => connectedNodeIds.has(n.id) || n.id === d.id ? 1 : 0.3);
        link.style("opacity", (l: RelationshipLink) => l.source === d.id || l.target === d.id ? 1 : 0.1);
      })
      .on("mouseout", function() {
        node.style("opacity", 1);
        link.style("opacity", 0.6);
      });

    // Drag behavior
    const drag = d3.drag<any, StakeholderNode>()
      .on("start", (event: d3.D3DragEvent<any, StakeholderNode, StakeholderNode>, d: StakeholderNode) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event: d3.D3DragEvent<any, StakeholderNode, StakeholderNode>, d: StakeholderNode) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event: d3.D3DragEvent<any, StakeholderNode, StakeholderNode>, d: StakeholderNode) => {
        if (!event.active) simulation.alphaTarget(0);
        // Keep the node fixed at its dragged position
        // d.fx = null;
        // d.fy = null;
      });

    node.call(drag);

    // Simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: StakeholderNode) => `translate(${d.x},${d.y})`);
    });

    setSimulationRunning(true);
    setTimeout(() => setSimulationRunning(false), 3000);

    return () => {
      simulation.stop();
    };
  }, [nodes, links, viewMode, onStakeholderSelect]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md" display="flex" alignItems="center" gap={2}>
            <Network size={20} />
            Stakeholder Network
          </Heading>
        </CardHeader>
        <CardBody>
          <Center h="96">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Loading stakeholder network...</Text>
            </VStack>
          </Center>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md" display="flex" alignItems="center" gap={2}>
            <Network size={20} />
            Stakeholder Network
          </Heading>
        </CardHeader>
        <CardBody>
          <Center h="96">
            <VStack spacing={4}>
              <AlertTriangle size={48} color="#e53e3e" />
              <Text fontSize="lg" fontWeight="medium" color="red.600">
                Failed to Load Network
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {error}
              </Text>
              <Button 
                colorScheme="blue" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </VStack>
          </Center>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={4} w="full">
      {/* Network Overview Cards */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} w="full">
        <Card>
          <CardBody p={4}>
            <HStack>
              <Users size={20} color="#3182ce" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Stakeholders</Text>
                <Text fontSize="2xl" fontWeight="bold">{networkData?.stakeholder_count || 0}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody p={4}>
            <HStack>
              <Building2 size={20} color="#38a169" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Roles Mapped</Text>
                <Text fontSize="2xl" fontWeight="bold">{networkData?.role_count || 0}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody p={4}>
            <HStack>
              <Network size={20} color="#805ad5" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Connections</Text>
                <Text fontSize="2xl" fontWeight="bold">{networkData?.relationship_count || 0}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody p={4}>
            <HStack>
              <TrendingUp size={20} color="#dd6b20" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Avg Influence</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {networkData?.network_insights
                    .find(i => i.type === 'influence_distribution')
                    ?.data?.average?.toFixed(1) || 'N/A'}
                </Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Main Visualization */}
      <Card w="full">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              <Network size={20} />
              Stakeholder Network Map
            </Heading>
            <Tabs 
              defaultIndex={0}
              onChange={(index: number) => {
                const modes = ['influence', 'engagement', 'hierarchy'];
                setViewMode(modes[index] as any);
              }}
            >
              <TabList>
                <Tab>Influence</Tab>
                <Tab>Engagement</Tab>
                <Tab>Hierarchy</Tab>
              </TabList>
            </Tabs>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box position="relative">
            <svg
              ref={svgRef}
              width="100%"
              height={height}
              style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            
            {/* View Mode Legend */}
            <Box 
              position="absolute" 
              top={4} 
              left={4} 
              bg="white" 
              p={4} 
              borderRadius="lg" 
              shadow="xl" 
              border="2px solid #e2e8f0"
              minW="200px"
              _dark={{
                bg: "gray.800",
                border: "2px solid #4a5568"
              }}
            >
              <Text fontWeight="bold" fontSize="md" mb={3} color="gray.800" _dark={{ color: "white" }}>
                Legend - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
              </Text>
              {viewMode === 'influence' && (
                <VStack spacing={2} fontSize="sm" align="start">
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="red.300" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Low Influence (1-3)</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="red.600" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>High Influence (8-10)</Text>
                  </HStack>
                </VStack>
              )}
              {viewMode === 'engagement' && (
                <VStack spacing={2} fontSize="sm" align="start">
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="green.500" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Champion</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="green.400" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Supporter</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="gray.500" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Neutral</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="yellow.500" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Skeptic</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="red.500" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Blocker</Text>
                  </HStack>
                </VStack>
              )}
              {viewMode === 'hierarchy' && (
                <VStack spacing={2} fontSize="sm" align="start">
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="purple.600" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Founder</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="red.600" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>C-Level</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="orange.600" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>VP</Text>
                  </HStack>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg="blue.600" border="1px solid #CBD5E0"></Box>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Director/Manager</Text>
                  </HStack>
                </VStack>
              )}
              
              {/* Authority Icons */}
              <Box mt={4} pt={3} borderTop="2px solid #e2e8f0" _dark={{ borderTop: "2px solid #4a5568" }}>
                <Text fontWeight="bold" fontSize="sm" mb={2} color="gray.800" _dark={{ color: "white" }}>Decision Authority</Text>
                <VStack spacing={2} fontSize="sm" align="start">
                  <HStack>
                    <Text fontSize="lg">👑</Text>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Final Decision</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="lg">⚡</Text>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Strong Influence</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="lg">🛡️</Text>
                    <Text fontWeight="medium" color="gray.700" _dark={{ color: "gray.200" }}>Gatekeeper</Text>
                  </HStack>
                </VStack>
              </Box>
            </Box>

            {/* Loading Indicator */}
            {simulationRunning && (
              <Box 
                position="absolute" 
                top={4} 
                right={4} 
                bg="white" 
                p={2} 
                borderRadius="md" 
                shadow="lg" 
                border="1px solid #e2e8f0"
              >
                <HStack fontSize="sm">
                  <Spinner size="sm" color="blue.500" />
                  <Text>Optimizing layout...</Text>
                </HStack>
              </Box>
            )}

            {/* Interaction Help */}
            <Box 
              position="absolute" 
              bottom={4} 
              right={4} 
              bg="blue.50" 
              p={3} 
              borderRadius="md" 
              shadow="lg" 
              border="1px solid #bee3f8"
              fontSize="xs"
              maxW="200px"
              _dark={{
                bg: "blue.900",
                border: "1px solid #2c5aa0"
              }}
            >
              <Text fontWeight="semibold" color="blue.800" mb={1} _dark={{ color: "blue.200" }}>
                💡 Interaction Tips
              </Text>
              <VStack spacing={1} align="start" color="blue.700" _dark={{ color: "blue.300" }}>
                <Text>• Click to select stakeholder</Text>
                <Text>• Drag to reposition nodes</Text>
                <Text>• Double-click to release position</Text>
                <Text>• Hover to highlight connections</Text>
              </VStack>
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Network Insights */}
      {networkData?.network_insights && networkData.network_insights.length > 0 && (
        <Card w="full">
          <CardHeader>
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              <Zap size={20} />
              Network Insights
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              {networkData.network_insights.map((insight, index) => (
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

      {/* Selected Node Details */}
      {selectedNode && (
        <Card w="full">
          <CardHeader>
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              <User size={20} />
              Stakeholder Details: {selectedNode.name}
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
              <Box>
                <Text fontWeight="semibold" mb={2}>Basic Info</Text>
                <VStack spacing={1} fontSize="sm" align="start">
                  <Text><strong>Title:</strong> {selectedNode.title}</Text>
                  <Text><strong>Department:</strong> {selectedNode.department || 'N/A'}</Text>
                  <Text><strong>Email:</strong> {selectedNode.email || 'N/A'}</Text>
                  <Text><strong>Phone:</strong> {selectedNode.phone || 'N/A'}</Text>
                </VStack>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={2}>Influence & Authority</Text>
                <VStack spacing={2}>
                  <Badge 
                    colorScheme={selectedNode.influenceScore >= 8 ? 'red' : 
                                 selectedNode.influenceScore >= 6 ? 'blue' : 'gray'}
                  >
                    Influence: {selectedNode.influenceScore}/10
                  </Badge>
                  <Badge variant="outline">
                    {selectedNode.decisionAuthority.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge 
                    colorScheme={selectedNode.seniorityLevel === 'C_LEVEL' ? 'red' :
                                 selectedNode.seniorityLevel === 'VP' ? 'blue' : 'gray'}
                  >
                    {selectedNode.seniorityLevel?.replace('_', ' ').toUpperCase() || 'Unknown'}
                  </Badge>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>Engagement</Text>
                <VStack spacing={2}>
                  <Badge 
                    colorScheme={
                      selectedNode.engagementLevel === 'CHAMPION' ? 'green' :
                      selectedNode.engagementLevel === 'SUPPORTER' ? 'blue' :
                      selectedNode.engagementLevel === 'BLOCKER' ? 'red' : 'gray'
                    }
                  >
                    {selectedNode.engagementLevel.toUpperCase()}
                  </Badge>
                  <VStack spacing={1}>
                    <Button size="sm" variant="outline" w="full">
                      View Full Profile
                    </Button>
                    <Button size="sm" variant="outline" w="full">
                      Schedule Meeting
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            </Grid>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}; 