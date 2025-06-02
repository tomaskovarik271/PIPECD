import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  IconButton,
  Badge,
  Tag,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { WfmWorkflowStep } from '../../../generated/graphql/graphql';

interface WorkflowStepsTableProps {
  steps: WfmWorkflowStep[];
  onEditStep: (step: WfmWorkflowStep) => void;
  onDeleteStep: (step: WfmWorkflowStep) => void;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
  submitting?: boolean;
  selectedStepId?: string | null;
}

const getStepName = (step: WfmWorkflowStep): string => {
  if (step.metadata && typeof step.metadata === 'object' && 'name' in step.metadata) {
    return String(step.metadata.name);
  }
  return `Step ${step.stepOrder}`;
};

const getStepDescription = (step: WfmWorkflowStep): string | null => {
  if (step.metadata && typeof step.metadata === 'object' && 'description' in step.metadata) {
    return String(step.metadata.description);
  }
  return null;
};

export const WorkflowStepsTable: React.FC<WorkflowStepsTableProps> = ({
  steps,
  onEditStep,
  onDeleteStep,
  onMoveStep,
  submitting = false,
  selectedStepId = null,
}) => {
  if (steps.length === 0) {
    return (
      <Text color="gray.500" fontStyle="italic">
        No steps defined for this workflow yet.
      </Text>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="md" overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
          <Tr>
            <Th>Order</Th>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Initial/Final</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {steps.map((step, index) => (
            <Tr key={step.id}>
              <Td textAlign="center">
                <HStack spacing={1}>
                  <Tooltip label="Move Up">
                    <IconButton 
                      size="xs" 
                      variant="ghost" 
                      icon={<ArrowUpIcon />} 
                      aria-label="Move Up" 
                      isDisabled={index === 0 || submitting} 
                      onClick={() => onMoveStep(index, 'up')} 
                    />
                  </Tooltip>
                  <Badge colorScheme="gray">{index + 1}</Badge>
                  <Tooltip label="Move Down">
                    <IconButton 
                      size="xs" 
                      variant="ghost" 
                      icon={<ArrowDownIcon />} 
                      aria-label="Move Down" 
                      isDisabled={index === steps.length - 1 || submitting} 
                      onClick={() => onMoveStep(index, 'down')} 
                    />
                  </Tooltip>
                </HStack>
              </Td>
              <Td>
                <Text fontWeight="medium">{getStepName(step)}</Text>
                {getStepDescription(step) && (
                  <Text fontSize="xs" color="gray.500">
                    {getStepDescription(step)}
                  </Text>
                )}
              </Td>
              <Td>
                <Tag colorScheme={step.status.color || 'gray'} size="sm">
                  {step.status.name}
                </Tag>
              </Td>
              <Td>
                {step.isInitialStep && <Badge colorScheme="cyan" mr={1}>Initial</Badge>}
                {step.isFinalStep && <Badge colorScheme="purple">Final</Badge>}
              </Td>
              <Td>
                <HStack spacing={1}>
                  <Tooltip label="Edit Step">
                    <IconButton 
                      icon={<EditIcon />} 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onEditStep(step)} 
                      isLoading={submitting && selectedStepId === step.id} 
                      isDisabled={submitting} 
                      aria-label={`Edit step ${getStepName(step)}`}
                    />
                  </Tooltip>
                  <Tooltip label="Delete Step">
                    <IconButton 
                      icon={<DeleteIcon />} 
                      size="sm" 
                      variant="ghost" 
                      colorScheme="red" 
                      onClick={() => onDeleteStep(step)} 
                      isLoading={submitting && selectedStepId === step.id} 
                      isDisabled={submitting} 
                      aria-label={`Delete step ${getStepName(step)}`}
                    />
                  </Tooltip>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

// Export utility functions for use in other components
export { getStepName, getStepDescription }; 