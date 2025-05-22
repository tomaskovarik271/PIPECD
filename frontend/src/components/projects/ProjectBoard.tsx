import React from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Tag } from '@chakra-ui/react'; // Removed Paper
import { WfmWorkflowWithDetails } from '../../stores/useWFMWorkflowStore'; 
import { WfmWorkflowStep } from '../../generated/graphql/graphql'; // Corrected import path for WfmWorkflowStep

// Re-defining MockProject here for clarity, or import if it becomes a shared type
interface MockProject {
  id: string;
  name: string;
  currentStatusId: string; 
}

interface ProjectBoardProps {
  workflow: WfmWorkflowWithDetails;
  projects: MockProject[];
}

interface BoardColumn {
  id: string; // step.id
  title: string; // step.status.name
  step: WfmWorkflowStep; // The full step object
  projects: MockProject[];
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ workflow, projects }) => {
  // Ensure steps are sorted by stepOrder for correct column display
  const sortedSteps = [...workflow.steps].sort((a, b) => a.stepOrder - b.stepOrder);

  // Group projects by their status, mapping to the step ID that corresponds to that status
  const columns: BoardColumn[] = sortedSteps.map(step => {
    const projectsInStep = projects.filter(p => p.currentStatusId === step.status.id);
    return {
      id: step.id,
      title: step.status.name, // Column title is the status name
      step: step,
      projects: projectsInStep,
    };
  });

  // Placeholder for card styling - replace Paper with an appropriate Chakra component or styled Box
  const ProjectCard: React.FC<{ project: MockProject }> = ({ project }) => (
    <Box p={3} borderWidth="1px" borderRadius="md" shadow="sm" mb={3} bg="white" _dark={{ bg: "gray.700" }}>
      <Text fontWeight="medium">{project.name}</Text>
      {/* Add more project details to the card as needed */}
    </Box>
  );

  return (
    <Flex overflowX="auto" py={4} minH="60vh"> {/* Horizontal scroll for columns */}
      {columns.map(column => (
        <Box 
          key={column.id} 
          w={{ base: '300px', md: '350px' }} // Column width
          minW={{ base: '300px', md: '350px' }}
          p={3} 
          mr={4} // Margin between columns
          bg="gray.100" 
          _dark={{ bg: "gray.900" }}
          borderRadius="md"
          shadow="base"
        >
          <HStack mb={4} justify="space-between">
            <Heading size="sm" textTransform="uppercase" letterSpacing="wide">
              {column.title}
            </Heading>
            <Tag size="sm" colorScheme={column.step.status.color || 'gray'} variant="solid">
              {column.projects.length}
            </Tag>
          </HStack>
          <VStack spacing={1} align="stretch" h="full">
            {column.projects.length > 0 ? (
              column.projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <Flex 
                justify="center" 
                align="center" 
                h="100px" 
                borderWidth="2px" 
                borderStyle="dashed" 
                borderColor="gray.300" 
                _dark={{ borderColor: "gray.600" }}
                borderRadius="md"
              >
                <Text fontSize="sm" color="gray.500">No items in this step.</Text>
              </Flex>
            )}
            {/* This VStack will be the droppable area */}
          </VStack>
        </Box>
      ))}
    </Flex>
  );
};

export default ProjectBoard; 