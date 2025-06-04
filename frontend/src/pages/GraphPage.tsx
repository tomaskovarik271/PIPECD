import React from 'react';
import { Box, Container, VStack, Text, useBreakpointValue } from '@chakra-ui/react';
import { useThemeColors } from '../hooks/useThemeColors';
import { GraphView } from '../components/common/GraphView';

export const GraphPage: React.FC = () => {
  const colors = useThemeColors();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const graphHeight = useBreakpointValue({ base: 400, md: 600, lg: 700 });
  const graphWidth = useBreakpointValue({ base: 350, md: 800, lg: 1000 });

  return (
    <Container maxW="full" p={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text 
            fontSize={isMobile ? "2xl" : "3xl"} 
            fontWeight="bold" 
            color={colors.text.primary}
            mb={2}
          >
            Network Graph
          </Text>
          <Text fontSize="lg" color={colors.text.secondary}>
            Explore the relationships between your contacts, organizations, deals, and leads in an interactive 3D network visualization.
          </Text>
        </Box>

        <Box>
          <GraphView 
            height={graphHeight} 
            width={graphWidth}
          />
        </Box>

        <Box 
          p={4} 
          bg={colors.bg.surface} 
          borderRadius="md" 
          border="1px solid" 
          borderColor={colors.border.default}
        >
          <VStack align="start" spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color={colors.text.primary}>
              How to Use the Network Graph
            </Text>
            <VStack align="start" spacing={2} fontSize="sm" color={colors.text.secondary}>
              <Text>• <strong>Navigate:</strong> Use mouse to rotate, zoom, and pan around the 3D space</Text>
              <Text>• <strong>Click nodes:</strong> Click on any node to focus the camera and see details</Text>
              <Text>• <strong>Filter entities:</strong> Use the switches to show/hide different types of data</Text>
              <Text>• <strong>Node colors:</strong> Blue = People, Green = Organizations, Orange = Deals, Purple = Leads</Text>
              <Text>• <strong>Node sizes:</strong> Larger nodes represent higher values (e.g., bigger deals)</Text>
              <Text>• <strong>Edge types:</strong> Lines show relationships like "works at", "belongs to", "converted to"</Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}; 