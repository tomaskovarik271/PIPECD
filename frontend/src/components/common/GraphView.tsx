import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, VStack, HStack, Text, Switch, Button, Select, Spinner, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useThemeColors } from '../../hooks/useThemeColors';

// Dynamic imports to handle loading issues
const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));
const ForceGraph3D = React.lazy(() => import('react-force-graph-3d'));

const GET_GRAPH_DATA = gql`
  query GetGraphData($filters: GraphFilters) {
    getGraphData(filters: $filters) {
      nodes {
        id
        type
        label
        color
        size
        data
      }
      edges {
        id
        source
        target
        type
        label
        color
      }
      summary {
        totalNodes
        totalEdges
        nodesByType
        edgesByType
      }
    }
  }
`;

interface GraphViewProps {
  height?: number;
  width?: number;
}

export const GraphView: React.FC<GraphViewProps> = ({ 
  height = 600, 
  width = 800 
}) => {
  const colors = useThemeColors();
  const toast = useToast();
  const fgRef = useRef<any>();
  
  const [filters, setFilters] = useState({
    entityTypes: ['PERSON', 'ORGANIZATION', 'DEAL', 'LEAD'],
    maxNodes: 100,
    includeActivities: false,
    includeWFMProjects: false,
  });

  const { data, loading, error, refetch } = useQuery(GET_GRAPH_DATA, {
    variables: { filters },
    errorPolicy: 'all',
  });

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [use3D, setUse3D] = useState(true);
  const [graphError, setGraphError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.getGraphData) {
      const { nodes, edges } = data.getGraphData;
      
      // Transform data for react-force-graph
      const transformedData = {
        nodes: nodes.map((node: any) => ({
          id: node.id,
          name: node.label,
          type: node.type,
          color: node.color,
          size: node.size,
          data: node.data,
        })),
        links: edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          label: edge.label,
          color: edge.color,
        })),
      };
      
      setGraphData(transformedData);
    }
  }, [data]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    
    // Focus camera on clicked node (3D only)
    if (fgRef.current && use3D) {
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
      
      fgRef.current.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
        node, // lookAt
        3000  // ms transition duration
      );
    }

    toast({
      title: `${node.type}: ${node.name}`,
      description: `Click to view details`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast, use3D]);

  const handleEntityTypeChange = (entityType: string, isEnabled: boolean) => {
    setFilters(prev => ({
      ...prev,
      entityTypes: isEnabled 
        ? [...prev.entityTypes, entityType]
        : prev.entityTypes.filter(type => type !== entityType),
    }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const resetCamera = () => {
    if (fgRef.current) {
      if (use3D) {
        fgRef.current.cameraPosition(
          { x: 0, y: 0, z: 400 }, // position
          { x: 0, y: 0, z: 0 },   // lookAt
          3000 // transition duration
        );
      } else {
        fgRef.current.zoom(1, 1000);
      }
    }
  };

  const GraphComponent = ({ graphData, width, height }: any) => {
    const [graphLoadError, setGraphLoadError] = useState(false);

    if (use3D && !graphLoadError) {
      return (
        <React.Suspense fallback={
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
            <VStack>
              <Spinner size="xl" color={colors.interactive.default} />
              <Text color={colors.text.secondary}>Loading 3D visualization...</Text>
            </VStack>
          </Box>
        }>
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            width={width}
            height={height}
            backgroundColor={colors.bg.surface}
            
            // Node configuration
            nodeLabel={(node: any) => `
              <div style="color: white; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px; font-size: 12px;">
                <strong>${node.type}</strong><br/>
                ${node.name}
              </div>
            `}
            nodeColor={(node: any) => node.color}
            nodeVal={(node: any) => node.size}
            nodeRelSize={1}
            onNodeClick={handleNodeClick}
            
            // Link configuration
            linkLabel={(link: any) => link.label || link.type}
            linkColor={(link: any) => link.color}
            linkWidth={1.5}
            linkOpacity={0.6}
            
            // Physics configuration
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            numDimensions={3}
            
            // Camera configuration
            controlType="orbit"
            showNavInfo={false}
            onEngineStop={() => setGraphLoadError(false)}
          />
        </React.Suspense>
      );
    }

    // 2D Fallback
    return (
      <React.Suspense fallback={
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <VStack>
            <Spinner size="xl" color={colors.interactive.default} />
            <Text color={colors.text.secondary}>Loading 2D visualization...</Text>
          </VStack>
        </Box>
      }>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={width}
          height={height}
          backgroundColor={colors.bg.surface}
          
          // Node configuration
          nodeLabel={(node: any) => `${node.type}: ${node.name}`}
          nodeColor={(node: any) => node.color}
          nodeVal={(node: any) => node.size}
          nodeRelSize={4}
          onNodeClick={handleNodeClick}
          
          // Link configuration
          linkLabel={(link: any) => link.label || link.type}
          linkColor={(link: any) => link.color}
          linkWidth={2}
          
          // Physics configuration
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </React.Suspense>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <VStack>
          <Spinner size="xl" color={colors.interactive.default} />
          <Text color={colors.text.secondary}>Loading network graph...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height={height}
        bg={colors.bg.surface}
        borderRadius="md"
        border="1px solid"
        borderColor={colors.border.default}
      >
        <VStack>
          <Text color={colors.text.error} fontSize="lg" fontWeight="bold">
            Error loading graph data
          </Text>
          <Text color={colors.text.secondary} textAlign="center">
            {error.message}
          </Text>
          <Button onClick={handleRefresh} colorScheme="blue" size="sm">
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  const summary = data?.getGraphData?.summary;

  return (
    <VStack spacing={4} align="stretch">
      {/* Controls */}
      <Box 
        p={4} 
        bg={colors.bg.surface} 
        borderRadius="md" 
        border="1px solid" 
        borderColor={colors.border.default}
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" wrap="wrap">
            <HStack>
              <Text fontSize="lg" fontWeight="bold" color={colors.text.primary}>
                Network Graph {use3D ? '(3D)' : '(2D)'}
              </Text>
              {summary && (
                <Text fontSize="sm" color={colors.text.secondary}>
                  {summary.totalNodes} nodes, {summary.totalEdges} connections
                </Text>
              )}
            </HStack>
            <HStack>
              <Switch
                isChecked={use3D}
                onChange={(e) => setUse3D(e.target.checked)}
                size="sm"
              />
              <Text fontSize="sm" color={colors.text.secondary}>3D</Text>
              <Button onClick={resetCamera} size="sm" variant="outline">
                Reset View
              </Button>
              <Button onClick={handleRefresh} size="sm" colorScheme="blue">
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Entity Type Filters */}
          <HStack wrap="wrap" spacing={6}>
            {[
              { key: 'PERSON', label: 'People', color: '#3182ce' },
              { key: 'ORGANIZATION', label: 'Organizations', color: '#38a169' },
              { key: 'DEAL', label: 'Deals', color: '#d69e2e' },
              { key: 'LEAD', label: 'Leads', color: '#805ad5' },
            ].map(({ key, label, color }) => (
              <HStack key={key} spacing={2}>
                <Box 
                  w={3} 
                  h={3} 
                  borderRadius="full" 
                  bg={color}
                />
                <Switch
                  isChecked={filters.entityTypes.includes(key)}
                  onChange={(e) => handleEntityTypeChange(key, e.target.checked)}
                  size="sm"
                />
                <Text fontSize="sm" color={colors.text.secondary}>
                  {label}
                  {summary?.nodesByType?.[key] && ` (${summary.nodesByType[key]})`}
                </Text>
              </HStack>
            ))}
          </HStack>

          {/* Advanced Options */}
          <HStack wrap="wrap" spacing={6}>
            <HStack>
              <Switch
                isChecked={filters.includeActivities}
                onChange={(e) => setFilters(prev => ({ ...prev, includeActivities: e.target.checked }))}
                size="sm"
              />
              <Text fontSize="sm" color={colors.text.secondary}>
                Include Activities
              </Text>
            </HStack>
            <HStack>
              <Switch
                isChecked={filters.includeWFMProjects}
                onChange={(e) => setFilters(prev => ({ ...prev, includeWFMProjects: e.target.checked }))}
                size="sm"
              />
              <Text fontSize="sm" color={colors.text.secondary}>
                Include Workflows
              </Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color={colors.text.secondary}>
                Max Nodes:
              </Text>
              <Select
                value={filters.maxNodes}
                onChange={(e) => setFilters(prev => ({ ...prev, maxNodes: parseInt(e.target.value) }))}
                size="sm"
                width="80px"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </Select>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {graphError && (
        <Alert status="warning">
          <AlertIcon />
          {graphError}
        </Alert>
      )}

      {/* Graph Visualization */}
      <Box 
        position="relative"
        bg={colors.bg.surface}
        borderRadius="md"
        border="1px solid"
        borderColor={colors.border.default}
        overflow="hidden"
        height={height}
      >
        <GraphComponent 
          graphData={graphData}
          width={width}
          height={height}
        />
        
        {/* Selected Node Info */}
        {selectedNode && (
          <Box
            position="absolute"
            top={4}
            right={4}
            p={3}
            bg={colors.bg.overlay}
            borderRadius="md"
            border="1px solid"
            borderColor={colors.border.default}
            maxWidth="250px"
            backdropFilter="blur(10px)"
          >
            <VStack align="start" spacing={2}>
              <HStack>
                <Box 
                  w={3} 
                  h={3} 
                  borderRadius="full" 
                  bg={selectedNode.color}
                />
                <Text fontSize="sm" fontWeight="bold" color={colors.text.primary}>
                  {selectedNode.type}
                </Text>
              </HStack>
              <Text fontSize="sm" color={colors.text.primary} fontWeight="medium">
                {selectedNode.name}
              </Text>
              <Button 
                size="xs" 
                colorScheme="blue"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </VStack>
          </Box>
        )}
      </Box>
    </VStack>
  );
}; 