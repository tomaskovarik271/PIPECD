import React from 'react';
import {
  Box,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons'; // For empty state
import EmptyState from '../common/EmptyState';
import LeadsKanbanView from './LeadsKanbanView';
import type { Lead } from '../../stores/useLeadsStore';

interface LeadsKanbanPageViewProps {
  leads: Lead[]; // Filtered leads for empty state
  isLoading: boolean;
  error: string | null;
  onNewButtonClick: () => void; // For EmptyState action
  userPermissions: string[] | null | undefined; // For EmptyState action
}

const LeadsKanbanPageView: React.FC<LeadsKanbanPageViewProps> = ({
  leads,
  isLoading,
  error,
  onNewButtonClick,
  userPermissions,
}) => {
  if (isLoading) {
    return <Flex justify="center" align="center" minH="300px" w="100%"><Spinner size="xl" /></Flex>;
  }
  if (error) {
    return <Alert status="error" m={4}><AlertIcon />{error}</Alert>;
  }
  if (leads.length === 0) {
    return (
      <Box m={4}>
        <EmptyState
          icon={ViewIcon}
          title="No Leads Found"
          message="Get started by creating your first lead or try a different filter."
          actionButtonLabel="Create Lead"
          onActionButtonClick={onNewButtonClick}
          isActionButtonDisabled={!userPermissions?.includes('lead:create')}
        />
      </Box>
    );
  }

  // This Box will now be the direct parent of LeadsKanbanView and handle its horizontal scroll
  return (
    <Box 
      w="100%" 
      h="100%" // Ensure it tries to take full height of its container in LeadsPage
      overflowX="auto" // Enable horizontal scrolling for the LeadsKanbanView
    >
      <LeadsKanbanView leads={leads} />
    </Box>
  );
};

export default LeadsKanbanPageView; 