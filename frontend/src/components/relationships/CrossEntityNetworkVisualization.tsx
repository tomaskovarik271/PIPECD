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
  Center,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Tooltip,
  IconButton,
  Flex
} from '@chakra-ui/react';
import { 
  Network, 
  Users, 
  Building2, 
  DollarSign, 
  Target,
  Eye,
  EyeOff,
  Layers,
  Filter,
  Zap,
  TrendingUp,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

// GraphQL queries for different entity types
const GET_DEALS_FOR_NETWORK_QUERY = gql`
  query GetDealsForNetwork {
    deals {
      id
      name
      amount
      expected_close_date
      organization_id
      currentWfmStatus {
        name
        color
      }
      organization {
        id
        name
      }
      assignedToUser {
        id
        display_name
      }
    }
  }
`;

const GET_LEADS_FOR_NETWORK_QUERY = gql`
  query GetLeadsForNetwork($filters: LeadFilters) {
    leads(filters: $filters) {
      id
      name
      lead_score
      qualificationStatus
      estimated_value
      contact_name
      contact_email
      company_name
      assignedToUser {
        id
        display_name
      }
    }
  }
`;

const GET_ORGANIZATIONS_FOR_NETWORK_QUERY = gql`
  query GetOrganizationsForNetwork {
    organizations {
      id
      name
      address
      notes
    }
  }
`;

const GET_STAKEHOLDER_ANALYSES_FOR_NETWORK_QUERY = gql`
  query GetStakeholderAnalysesForNetwork($organizationId: ID, $dealId: ID, $leadId: ID) {
    stakeholderAnalyses(organizationId: $organizationId, dealId: $dealId, leadId: $leadId) {
      id
      influenceScore
      decisionAuthority
      engagementLevel
      person {
        id
        first_name
        last_name
        email
        organization_id
      }
      organization {
        id
        name
      }
    }
  }
`;

const GET_PERSON_RELATIONSHIPS_FOR_NETWORK_QUERY = gql`
  query GetPersonRelationshipsForNetwork($organizationId: ID!) {
    organizationPersonRelationships(organizationId: $organizationId) {
      id
      relationshipType
      relationshipStrength
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
    }
  }
`;

interface CrossEntityNode {
  id: string;
  name: string;
  type: 'DEAL' | 'LEAD' | 'ORGANIZATION' | 'PERSON';
  data: any;
  subtitle?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface CrossEntityLink {
  source: string | CrossEntityNode;
  target: string | CrossEntityNode;
  type: string;
  strength: number;
}

interface CrossEntityNetworkVisualizationProps {
  includeDeals?: boolean;
  includeLeads?: boolean;
  includeOrganizations?: boolean;
  includePeople?: boolean;
  dealIds?: string[];
  leadIds?: string[];
  organizationIds?: string[];
  personIds?: string[];
  maxDegrees?: number;
  height?: number;
  onNodeSelect?: (node: CrossEntityNode) => void;
  selectedOrganizationId?: string;
  selectedDealId?: string;
}

export const CrossEntityNetworkVisualization: React.FC<CrossEntityNetworkVisualizationProps> = ({
  includeDeals = true,
  includeLeads = true,
  includeOrganizations = true,
  includePeople = true,
  dealIds,
  leadIds,
  organizationIds,
  personIds,
  maxDegrees = 3,
  height = 700,
  onNodeSelect,
  selectedOrganizationId,
  selectedDealId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<CrossEntityNode | null>(null);
  const [centralDeal, setCentralDeal] = useState<any | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'neo4j' | 'force' | 'hierarchical'>('neo4j');
  const [colorMode, setColorMode] = useState<'type' | 'value' | 'activity' | 'distance'>('distance');
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSize, setNodeSize] = useState(10);
  const [linkStrength, setLinkStrength] = useState(0.3);
  const [visibleTypes, setVisibleTypes] = useState(['DEAL', 'LEAD', 'ORGANIZATION', 'PERSON']);

  // Fetch different entity types separately
  const { data: dealsData, loading: dealsLoading } = useQuery(GET_DEALS_FOR_NETWORK_QUERY, {
    skip: !includeDeals
  });

  const { data: leadsData, loading: leadsLoading } = useQuery(GET_LEADS_FOR_NETWORK_QUERY, {
    skip: !includeLeads
  });

  const { data: organizationsData, loading: organizationsLoading } = useQuery(GET_ORGANIZATIONS_FOR_NETWORK_QUERY, {
    skip: !includeOrganizations
  });

  const { data: stakeholderData, loading: stakeholderLoading } = useQuery(GET_STAKEHOLDER_ANALYSES_FOR_NETWORK_QUERY, {
    variables: {
      organizationId: organizationIds?.[0],
      dealId: dealIds?.[0],
      leadId: leadIds?.[0]
    },
    skip: !includePeople
  });

  const { data: relationshipsData, loading: relationshipsLoading } = useQuery(GET_PERSON_RELATIONSHIPS_FOR_NETWORK_QUERY, {
    variables: { organizationId: organizationIds?.[0] || '' },
    skip: !includePeople || !organizationIds?.[0]
  });

  const loading = dealsLoading || leadsLoading || organizationsLoading || stakeholderLoading || relationshipsLoading;

  // Transform data to D3 format
  const { nodes, links, networkStats } = useMemo(() => {
    const nodes: CrossEntityNode[] = [];
    const links: CrossEntityLink[] = [];

    // Add deal nodes
    if (includeDeals && visibleTypes.includes('DEAL') && dealsData?.deals) {
      dealsData.deals.forEach((deal: any) => {
        nodes.push({
          id: `deal-${deal.id}`,
          name: deal.name,
          type: 'DEAL',
          subtitle: deal.amount ? `$${deal.amount.toLocaleString()}` : 'No value set',
          data: deal
        });

        // Create link between deal and organization
        if (deal.organization_id && includeOrganizations && visibleTypes.includes('ORGANIZATION')) {
          links.push({
            source: `deal-${deal.id}`,
            target: `organization-${deal.organization_id}`,
            type: 'DEAL_ORGANIZATION',
            strength: 1
          });
        }
      });
    }

    // Add lead nodes
    if (includeLeads && visibleTypes.includes('LEAD') && leadsData?.leads) {
      leadsData.leads.forEach((lead: any) => {
        nodes.push({
          id: `lead-${lead.id}`,
          name: lead.name,
          type: 'LEAD',
          subtitle: lead.company_name || 'Unknown Company',
          data: lead
        });
      });
    }

    // Add organization nodes
    if (includeOrganizations && visibleTypes.includes('ORGANIZATION') && organizationsData?.organizations) {
      organizationsData.organizations.forEach((org: any) => {
        nodes.push({
          id: `organization-${org.id}`,
          name: org.name,
          type: 'ORGANIZATION',
          subtitle: 'Organization',
          data: org
        });
      });
    }

    // Add person nodes from stakeholder analysis
    if (includePeople && visibleTypes.includes('PERSON') && stakeholderData?.stakeholderAnalyses) {
      stakeholderData.stakeholderAnalyses.forEach((analysis: any) => {
        const person = analysis.person;
        if (person) {
          nodes.push({
            id: `person-${person.id}`,
            name: `${person.first_name} ${person.last_name}`,
            type: 'PERSON',
            subtitle: person.email || 'Contact',
            data: { ...person, ...analysis }
          });

          // Create link between person and organization
          if (person.organization_id && includeOrganizations && visibleTypes.includes('ORGANIZATION')) {
            links.push({
              source: `person-${person.id}`,
              target: `organization-${person.organization_id}`,
              type: 'PERSON_WORKS_AT',
              strength: 1
            });
          }
        }
      });
    }

    // Add person-to-person relationships
    if (relationshipsData?.organizationPersonRelationships) {
      relationshipsData.organizationPersonRelationships.forEach((rel: any) => {
        const sourceId = `person-${rel.fromPerson.id}`;
        const targetId = `person-${rel.toPerson.id}`;
        
        // Only add link if both nodes exist
        if (nodes.find(n => n.id === sourceId) && nodes.find(n => n.id === targetId)) {
          links.push({
            source: sourceId,
            target: targetId,
            type: rel.relationshipType || 'COLLEAGUE',
            strength: rel.relationshipStrength / 10 || 0.5
          });
        }
      });
    }

    // Calculate network statistics
    const stats = {
      totalNodes: nodes.length,
      totalRelationships: links.length,
      nodeBreakdown: {
        dealCount: nodes.filter(n => n.type === 'DEAL').length,
        leadCount: nodes.filter(n => n.type === 'LEAD').length,
        organizationCount: nodes.filter(n => n.type === 'ORGANIZATION').length,
        personCount: nodes.filter(n => n.type === 'PERSON').length,
      }
    };

    return { nodes, links, networkStats: stats };
  }, [
    dealsData, 
    leadsData, 
    organizationsData, 
    stakeholderData, 
    relationshipsData,
    includeDeals, 
    includeLeads, 
    includeOrganizations, 
    includePeople, 
    visibleTypes
  ]);

  // Color schemes for different node types
  const getNodeColor = (node: CrossEntityNode) => {
    switch (colorMode) {
      case 'type':
        switch (node.type) {
          case 'DEAL': return node.id === `deal-${centralDeal?.id}` ? '#ff6b35' : '#22c55e';
          case 'LEAD': return '#3b82f6';
          case 'ORGANIZATION': return '#f59e0b';
          case 'PERSON': return '#8b5cf6';
          default: return '#64748b';
        }
      case 'value':
        // Color by monetary value for deals/leads
        if (node.type === 'DEAL' && node.data.amount) {
          return d3.scaleSequential(d3.interpolateGreens)
            .domain([0, 1000000])(node.data.amount);
        }
        if (node.type === 'LEAD' && node.data.estimated_value) {
          return d3.scaleSequential(d3.interpolateBlues)
            .domain([0, 500000])(node.data.estimated_value);
        }
        return '#64748b';
      case 'activity':
        // Color by activity level or status
        if (node.type === 'DEAL' && node.data.currentWfmStatus?.color) {
          return node.data.currentWfmStatus.color;
        }
        if (node.type === 'LEAD') {
          const scoreColors: Record<string, string> = {
            'QUALIFIED': '#22c55e',
            'WORKING': '#f59e0b', 
            'NEW': '#3b82f6',
            'LOST': '#ef4444'
          };
          return scoreColors[node.data.qualificationStatus] || '#64748b';
        }
        return '#64748b';
      case 'distance':
        // Color by relationship distance from central deal
        if (node.id === `deal-${centralDeal?.id}`) {
          return '#ff3030'; // Central deal is bright red
        }
        if (node.type === 'ORGANIZATION' && centralDeal?.organization_id === node.data.id) {
          return '#ff8c42'; // Direct organization connection
        }
        if (node.type === 'PERSON' && centralDeal) {
          return '#ffad5a'; // People connected to the deal
        }
        if (node.type === 'LEAD') {
          return '#a8dadc'; // Leads are peripheral
        }
        return '#64748b'; // Other deals
      default:
        return '#64748b';
    }
  };

  const getNodeSize = (node: CrossEntityNode) => {
    const baseSize = nodeSize + 10; // Make nodes larger by default
    
    // Central deal should be largest
    if (node.id === `deal-${centralDeal?.id}`) {
      return baseSize * 1.5;
    }
    
    // Size by importance/value
    if (node.type === 'DEAL' && node.data.amount) {
      return Math.max(baseSize, Math.min(baseSize * 1.3, baseSize + node.data.amount / 300000));
    }
    if (node.type === 'LEAD' && node.data.lead_score) {
      return Math.max(baseSize, baseSize + node.data.lead_score / 20);
    }
    if (node.type === 'ORGANIZATION') {
      return baseSize * 1.2; // Organizations slightly larger
    }
    if (node.type === 'PERSON' && node.data.influenceScore) {
      return Math.max(baseSize, baseSize + node.data.influenceScore / 15);
    }
    
    return baseSize;
  };

  const getNodeIcon = (node: CrossEntityNode) => {
    switch (node.type) {
      case 'DEAL': return '💰';
      case 'LEAD': return '🎯';
      case 'ORGANIZATION': return '🏢';
      case 'PERSON': return '👤';
      default: return '◯';
    }
  };

  // Select the first deal as central deal when deals data loads
  React.useEffect(() => {
    if (dealsData?.deals?.length > 0 && !centralDeal) {
      setCentralDeal(dealsData.deals[0]);
    }
  }, [dealsData, centralDeal]);

  // Auto-set central deal based on context
  React.useEffect(() => {
    if (selectedDealId && dealsData?.deals) {
      const contextDeal = dealsData.deals.find((deal: any) => deal.id === selectedDealId);
      if (contextDeal && contextDeal.id !== centralDeal?.id) {
        setCentralDeal(contextDeal);
      }
    } else if (selectedOrganizationId && dealsData?.deals && !selectedDealId) {
      // If organization is selected but no specific deal, pick first deal from that org
      const orgDeals = dealsData.deals.filter((deal: any) => deal.organization_id === selectedOrganizationId);
      if (orgDeals.length > 0 && (!centralDeal || centralDeal.organization_id !== selectedOrganizationId)) {
        setCentralDeal(orgDeals[0]);
      }
    } else if (!selectedOrganizationId && !selectedDealId && dealsData?.deals?.length > 0 && !centralDeal) {
      // Fallback: set first available deal
      setCentralDeal(dealsData.deals[0]);
    }
  }, [selectedDealId, selectedOrganizationId, dealsData, centralDeal]);

  // Filter central deal options by selected organization
  const centralDealOptions = React.useMemo(() => {
    if (!dealsData?.deals) return [];
    
    let filteredDeals = dealsData.deals;
    
    // Filter by organization if one is selected
    if (selectedOrganizationId) {
      filteredDeals = filteredDeals.filter((deal: any) => deal.organization_id === selectedOrganizationId);
    }
    
    return filteredDeals;
  }, [dealsData?.deals, selectedOrganizationId]);

  // Check if central deal selection should be disabled
  const isCentralDealDisabled = !!selectedDealId;

  // Helper function to navigate to entity detail pages
  const navigateToEntityDetail = (node: CrossEntityNode) => {
    const entityId = node.data.id;
    
    switch (node.type) {
      case 'DEAL':
        navigate(`/deals/${entityId}`);
        break;
      case 'ORGANIZATION':
        navigate(`/organizations/${entityId}`);
        break;
      case 'PERSON':
        navigate(`/people/${entityId}`);
        break;
      case 'LEAD':
        // Lead detail page not found in routing, navigate to leads page
        navigate('/leads');
        break;
      default:
        console.warn('Unknown entity type for navigation:', node.type);
    }
  };

  // D3 Force Simulation
  useEffect(() => {
    if (!nodes.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous content
    svg.selectAll("*").remove();

    // Add dark background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#1e293b")
      .attr("rx", 8);

    // Create main group with zoom
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Create simulation based on layout mode
    let simulation: d3.Simulation<CrossEntityNode, undefined>;
    
    switch (layoutMode) {
      case 'neo4j':
        simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120).strength(linkStrength))
          .force("charge", d3.forceManyBody().strength(-500))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collision", d3.forceCollide().radius((node: any) => getNodeSize(node as CrossEntityNode) + 15))
          .force("radial", d3.forceRadial((d: CrossEntityNode) => {
            if (d.id === `deal-${centralDeal?.id}`) return 0; // Central deal at center
            if (d.type === 'ORGANIZATION' && centralDeal?.organization_id === d.data.id) return 150; // Org close
            if (d.type === 'PERSON') return 250; // People in middle ring
            if (d.type === 'LEAD') return 350; // Leads in outer ring
            return 300; // Other deals
          }, width / 2, height / 2).strength(0.8));
        break;
      case 'force':
        simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100).strength(linkStrength))
          .force("charge", d3.forceManyBody().strength(-400))
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("collision", d3.forceCollide().radius((node: any) => getNodeSize(node as CrossEntityNode) + 10));
        break;
      case 'hierarchical':
        simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
          .force("charge", d3.forceManyBody().strength(-300))
          .force("x", d3.forceX().x(d => {
            // Arrange by type in columns
            const typeOrder = ['ORGANIZATION', 'PERSON', 'LEAD', 'DEAL'];
            const index = typeOrder.indexOf((d as CrossEntityNode).type);
            return (width / 5) * (index + 1);
          }).strength(0.5))
          .force("y", d3.forceY(height / 2).strength(0.1));
        break;
    }

    // Create links with improved styling
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#64748b")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: CrossEntityLink) => {
        if (layoutMode === 'neo4j') {
          // Thicker lines for central deal connections
          const isCentralConnection = 
            (d.source as any).id === `deal-${centralDeal?.id}` || 
            (d.target as any).id === `deal-${centralDeal?.id}`;
          return isCentralConnection ? 4 : Math.max(2, d.strength * 3);
        }
        return Math.max(1.5, d.strength * 2);
      })
      .attr("stroke-dasharray", (d: CrossEntityLink) => {
        // Different line styles for different relationship types
        switch (d.type) {
          case 'PERSON_WORKS_AT': return '0';
          case 'DEAL_ORGANIZATION': return '0';
          case 'COLLEAGUE': return '3,3';
          case 'MANAGER': return '5,5';
          default: return '0';
        }
      });

    // Create node groups
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer");

    // Node circles with improved styling
    node.append("circle")
      .attr("r", getNodeSize)
      .attr("fill", getNodeColor)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", (d: CrossEntityNode) => {
        if (layoutMode === 'neo4j' && d.id === `deal-${centralDeal?.id}`) {
          return 4;
        }
        return 2.5;
      })
      .attr("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.4))");

    // Node icons
    node.append("text")
      .text(getNodeIcon)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", d => getNodeSize(d) * 0.5)
      .attr("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.8))")
      .style("user-select", "none")
      .attr("pointer-events", "none");

    // Node labels with professional backgrounds (similar to stakeholder map)
    if (showLabels) {
      const labelGroup = node.append("g")
        .attr("class", "text-labels");

      labelGroup.each(function(d: CrossEntityNode) {
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
          .attr("font-size", (d: any) => {
            if (layoutMode === 'neo4j' && d.id === `deal-${centralDeal?.id}`) {
              return "14px";
            }
            return "12px";
          })
          .attr("font-weight", (d: any) => {
            if (layoutMode === 'neo4j' && d.id === `deal-${centralDeal?.id}`) {
              return "700";
            }
            return "600";
          })
          .attr("fill", "#f8fafc")
          .attr("font-family", "system-ui, -apple-system, BlinkMacSystemFont, sans-serif")
          .text((d: any) => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);
        
        // Subtitle text
        const subtitleText = group.append("text")
          .attr("dx", 40)
          .attr("dy", "12")
          .attr("font-size", "10px")
          .attr("font-weight", "500")
          .attr("fill", "#cbd5e1")
          .attr("font-family", "system-ui, -apple-system, BlinkMacSystemFont, sans-serif")
          .text((d: any) => d.subtitle || '');
        
        // Calculate background size based on text with proper padding
        const nameBBox = (nameText.node() as SVGTextElement)?.getBBox() || { width: 0, height: 0 };
        const subtitleBBox = (subtitleText.node() as SVGTextElement)?.getBBox() || { width: 0, height: 0 };
        const maxWidth = Math.max(nameBBox.width, subtitleBBox.width);
        
        bg.attr("width", maxWidth + 16)
          .attr("height", 36);
      });
    }

    // Node interactions
    node
      .on("click", (event: MouseEvent, d: CrossEntityNode) => {
        setSelectedNode(d);
        onNodeSelect?.(d);
      })
      .on("dblclick", (event: MouseEvent, d: CrossEntityNode) => {
        d.fx = null;
        d.fy = null;
        simulation?.alphaTarget(0.1).restart();
        setTimeout(() => simulation?.alphaTarget(0), 100);
      })
      .on("mouseover", function(event: MouseEvent, d: CrossEntityNode) {
        // Highlight connected nodes
        const connectedNodeIds = new Set();
        links.forEach(link => {
          if ((link.source as any).id === d.id) connectedNodeIds.add((link.target as any).id);
          if ((link.target as any).id === d.id) connectedNodeIds.add((link.source as any).id);
        });

        node.style("opacity", (n: CrossEntityNode) => connectedNodeIds.has(n.id) || n.id === d.id ? 1 : 0.3);
        link.style("opacity", (l: CrossEntityLink) => 
          (l.source as any).id === d.id || (l.target as any).id === d.id ? 1 : 0.1
        );
      })
      .on("mouseout", function() {
        node.style("opacity", 1);
        link.style("opacity", 0.6);
      });

    // Drag behavior
    const drag = d3.drag<any, CrossEntityNode>()
      .on("start", (event: d3.D3DragEvent<any, CrossEntityNode, CrossEntityNode>, d: CrossEntityNode) => {
        if (!event.active) simulation?.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event: d3.D3DragEvent<any, CrossEntityNode, CrossEntityNode>, d: CrossEntityNode) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event: d3.D3DragEvent<any, CrossEntityNode, CrossEntityNode>, d: CrossEntityNode) => {
        if (!event.active) simulation?.alphaTarget(0);
      });

    node.call(drag);

    // Update positions on tick
    simulation?.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: CrossEntityNode) => `translate(${d.x},${d.y})`);
    });

    setSimulationRunning(true);
    simulation?.on("end", () => setSimulationRunning(false));

    return () => {
      simulation?.stop();
    };
  }, [nodes, links, layoutMode, colorMode, showLabels, nodeSize, linkStrength, centralDeal]);

  if (loading) {
    return (
      <Center h={height}>
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading cross-entity network...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Network Statistics */}
      <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4}>
        <Card>
          <CardBody p={4}>
            <HStack>
              <DollarSign size={20} color="#22c55e" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Deals</Text>
                <Text fontSize="2xl" fontWeight="bold">{networkStats?.nodeBreakdown.dealCount || 0}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody p={4}>
            <HStack>
              <Target size={20} color="#3b82f6" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Leads</Text>
                <Text fontSize="2xl" fontWeight="bold">{networkStats?.nodeBreakdown.leadCount || 0}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody p={4}>
            <HStack>
              <Building2 size={20} color="#f59e0b" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Organizations</Text>
                <Text fontSize="2xl" fontWeight="bold">{networkStats?.nodeBreakdown.organizationCount || 0}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody p={4}>
            <HStack>
              <Users size={20} color="#8b5cf6" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">People</Text>
                <Text fontSize="2xl" fontWeight="bold">{networkStats?.nodeBreakdown.personCount || 0}</Text>
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
                <Text fontSize="2xl" fontWeight="bold">{networkStats?.totalRelationships || 0}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Main Content: Graph + Controls Side by Side */}
      <Flex gap={4} align="stretch">
        {/* Main Visualization - Left Side */}
        <Box flex="1" minW="0">
          <Card w="full">
            <CardHeader>
              <HStack justify="space-between" wrap="wrap">
                <Heading size="md" display="flex" alignItems="center" gap={2}>
                  <Network size={20} />
                  Cross-Entity Network Map
                </Heading>
                <Tabs 
                  defaultIndex={colorMode === 'distance' ? 0 : colorMode === 'type' ? 1 : colorMode === 'value' ? 2 : 3}
                  onChange={(index: number) => {
                    const modes = ['distance', 'type', 'value', 'activity'];
                    setColorMode(modes[index] as any);
                  }}
                >
                  <TabList>
                    <Tab>Distance</Tab>
                    <Tab>Type</Tab>
                    <Tab>Value</Tab>
                    <Tab>Activity</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}></TabPanel>
                    <TabPanel p={0}></TabPanel>
                    <TabPanel p={0}></TabPanel>
                    <TabPanel p={0}></TabPanel>
                  </TabPanels>
                </Tabs>
              </HStack>
            </CardHeader>
            <CardBody>
              <Box position="relative">
                <svg
                  ref={svgRef}
                  width="100%"
                  height={height}
                  style={{ borderRadius: '8px' }}
                />
                
                {/* Help Icon for Interaction Tips */}
                <Tooltip 
                  label={
                    <VStack spacing={1} align="start" fontSize="xs">
                      <Text fontWeight="semibold">💡 Interaction Tips</Text>
                      <Text>• Click to select entity</Text>
                      <Text>• Drag to reposition nodes</Text>
                      <Text>• Double-click to release position</Text>
                      <Text>• Hover to highlight connections</Text>
                    </VStack>
                  }
                  placement="left"
                  hasArrow
                  bg="blue.600"
                  color="white"
                  borderRadius="md"
                  p={3}
                >
                  <IconButton
                    position="absolute"
                    top={4}
                    right={4}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    icon={<HelpCircle size={16} />}
                    aria-label="Interaction Tips"
                    bg="rgba(255, 255, 255, 0.9)"
                    _hover={{ bg: "rgba(255, 255, 255, 1)" }}
                  />
                </Tooltip>

                {/* Loading Indicator */}
                {simulationRunning && (
                  <Box 
                    position="absolute" 
                    top={4} 
                    right={selectedNode ? 4 : 60} 
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

                {/* Selected Node Info */}
                {selectedNode && (
                  <Box
                    position="absolute"
                    top={4}
                    left={4}
                    bg="white"
                    p={4}
                    borderRadius="md"
                    shadow="lg"
                    border="1px solid #e2e8f0"
                    maxW="280px"
                    _dark={{
                      bg: "gray.800",
                      border: "1px solid #4a5568"
                    }}
                  >
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" w="full">
                        <HStack>
                          <Text fontSize="lg">{getNodeIcon(selectedNode)}</Text>
                          <Text fontWeight="bold" fontSize="sm">{selectedNode.name}</Text>
                        </HStack>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="Close"
                          icon={<Text fontSize="xs">✕</Text>}
                          onClick={() => setSelectedNode(null)}
                        />
                      </HStack>
                      
                      <Badge colorScheme="blue" size="sm">{selectedNode.type}</Badge>
                      
                      <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                        {selectedNode.subtitle}
                      </Text>
                      
                      {selectedNode.type === 'DEAL' && selectedNode.data.amount && (
                        <Text fontSize="xs">Value: ${selectedNode.data.amount.toLocaleString()}</Text>
                      )}
                      {selectedNode.type === 'LEAD' && selectedNode.data.lead_score && (
                        <Text fontSize="xs">Score: {selectedNode.data.lead_score}/100</Text>
                      )}
                      {selectedNode.type === 'PERSON' && selectedNode.data.influenceScore && (
                        <Text fontSize="xs">Influence: {selectedNode.data.influenceScore}/10</Text>
                      )}
                      
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<ExternalLink size={12} />}
                        onClick={() => navigateToEntityDetail(selectedNode)}
                        w="full"
                      >
                        View Details
                      </Button>
                    </VStack>
                  </Box>
                )}
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Control Panels - Right Side */}
        <Box w="350px" flexShrink={0}>
          <VStack spacing={4} align="stretch">
            {/* Central Deal Selection */}
            <Card>
              <CardHeader py={3}>
                <Heading size="sm">
                  Central Deal
                  {selectedDealId && (
                    <Badge ml={2} colorScheme="blue" fontSize="xs">
                      Context Locked
                    </Badge>
                  )}
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <Select 
                  value={centralDeal?.id || ''} 
                  onChange={(e) => {
                    const deal = centralDealOptions.find((d: any) => d.id === e.target.value);
                    setCentralDeal(deal || null);
                  }}
                  placeholder={
                    selectedOrganizationId 
                      ? `Select deal from organization...`
                      : "Select a central deal"
                  }
                  isDisabled={isCentralDealDisabled}
                >
                  {centralDealOptions.map((deal: any) => (
                    <option key={deal.id} value={deal.id}>
                      💰 {deal.name} (${deal.amount?.toLocaleString() || 'N/A'})
                    </option>
                  ))}
                </Select>
                {isCentralDealDisabled && (
                  <Text fontSize="xs" color="blue.600" mt={2}>
                    Central deal is set by Analysis Context
                  </Text>
                )}
                {selectedOrganizationId && centralDealOptions.length === 0 && (
                  <Text fontSize="xs" color="orange.600" mt={2}>
                    No deals found for selected organization
                  </Text>
                )}
              </CardBody>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader py={3}>
                <Heading size="sm">Legend - {colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}</Heading>
              </CardHeader>
              <CardBody pt={0}>
                {colorMode === 'distance' && (
                  <VStack spacing={2} align="stretch">
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#ff3030" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Central Deal</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#ff8c42" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Connected Org</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#ffad5a" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">People</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#a8dadc" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Leads</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#64748b" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Other Deals</Text>
                    </HStack>
                  </VStack>
                )}
                
                {colorMode === 'type' && (
                  <VStack spacing={2} align="stretch">
                    <HStack>
                      <Text fontSize="lg">💰</Text>
                      <Text fontSize="sm" fontWeight="medium">Deals</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="lg">🎯</Text>
                      <Text fontSize="sm" fontWeight="medium">Leads</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="lg">🏢</Text>
                      <Text fontSize="sm" fontWeight="medium">Organizations</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="lg">👤</Text>
                      <Text fontSize="sm" fontWeight="medium">People</Text>
                    </HStack>
                  </VStack>
                )}

                {colorMode === 'value' && (
                  <VStack spacing={2} align="stretch">
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#22c55e" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">High Value</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#84cc16" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Medium Value</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#64748b" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Low/No Value</Text>
                    </HStack>
                  </VStack>
                )}

                {colorMode === 'activity' && (
                  <VStack spacing={2} align="stretch">
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#22c55e" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Qualified</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#f59e0b" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Working</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#3b82f6" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">New</Text>
                    </HStack>
                    <HStack>
                      <Box w={4} h={4} borderRadius="full" bg="#ef4444" border="1px solid #CBD5E0"></Box>
                      <Text fontSize="sm" fontWeight="medium">Lost</Text>
                    </HStack>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Entity Type Filters */}
            <Card>
              <CardHeader py={3}>
                <Heading size="sm">Visible Entity Types</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <CheckboxGroup value={visibleTypes} onChange={(values) => setVisibleTypes(values as string[])}>
                  <VStack spacing={2} align="stretch">
                    <Checkbox value="DEAL">💰 Deals</Checkbox>
                    <Checkbox value="LEAD">🎯 Leads</Checkbox>
                    <Checkbox value="ORGANIZATION">🏢 Organizations</Checkbox>
                    <Checkbox value="PERSON">👤 People</Checkbox>
                  </VStack>
                </CheckboxGroup>
              </CardBody>
            </Card>

            {/* Layout Controls */}
            <Card>
              <CardHeader py={3}>
                <Heading size="sm">Layout & Display</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Layout Mode</FormLabel>
                    <Select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value as any)}>
                      <option value="neo4j">Neo4j-Style Radial</option>
                      <option value="force">Force-Directed</option>
                      <option value="hierarchical">Hierarchical</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel fontSize="sm" mb="0">Show Labels</FormLabel>
                    <Switch isChecked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Visual Controls */}
            <Card>
              <CardHeader py={3}>
                <Heading size="sm">Visual Controls</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Node Size</FormLabel>
                    <Slider value={nodeSize} onChange={setNodeSize} min={4} max={20} step={1}>
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Link Strength</FormLabel>
                    <Slider value={linkStrength} onChange={setLinkStrength} min={0.1} max={1} step={0.1}>
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </VStack>
  );
};

export default CrossEntityNetworkVisualization; 