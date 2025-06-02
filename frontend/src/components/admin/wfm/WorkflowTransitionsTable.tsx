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
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { WfmWorkflowTransition } from '../../../generated/graphql/graphql';
import { getStepName } from './WorkflowStepsTable';

interface WorkflowTransitionsTableProps {
  transitions: WfmWorkflowTransition[];
  onEditTransition: (transition: WfmWorkflowTransition) => void;
  onDeleteTransition: (transitionId: string) => void;
  submitting?: boolean;
}

export const WorkflowTransitionsTable: React.FC<WorkflowTransitionsTableProps> = ({
  transitions,
  onEditTransition,
  onDeleteTransition,
  submitting = false,
}) => {
  if (transitions.length === 0) {
    return (
      <Text color="gray.500" fontStyle="italic">
        No transitions defined for this workflow yet.
      </Text>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="md" overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
          <Tr>
            <Th>Name</Th>
            <Th>From Step</Th>
            <Th>To Step</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transitions.map((transition) => (
            <Tr key={transition.id}>
              <Td>
                {transition.name || (
                  <Text fontStyle="italic" color="gray.400">
                    Unnamed Transition
                  </Text>
                )}
              </Td>
              <Td>
                {getStepName(transition.fromStep)} ({transition.fromStep.status.name})
              </Td>
              <Td>
                {getStepName(transition.toStep)} ({transition.toStep.status.name})
              </Td>
              <Td>
                <Tooltip label="Edit Transition Name">
                  <IconButton 
                    icon={<EditIcon />} 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onEditTransition(transition)} 
                    aria-label={`Edit transition ${transition.name || 'unnamed'}`}
                    isDisabled={submitting} 
                  />
                </Tooltip>
                <Tooltip label="Delete Transition">
                  <IconButton 
                    icon={<DeleteIcon />} 
                    size="sm" 
                    variant="ghost" 
                    colorScheme="red" 
                    onClick={() => onDeleteTransition(transition.id)} 
                    aria-label={`Delete transition ${transition.name || 'unnamed'}`}
                    isDisabled={submitting}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}; 