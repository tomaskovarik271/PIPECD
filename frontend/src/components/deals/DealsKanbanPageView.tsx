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
import DealsKanbanView from './DealsKanbanView';
import type { Deal } from '../../stores/useDealsStore';

interface DealsKanbanPageViewProps {
  deals: Deal[]; // Filtered deals for empty state
  isLoading: boolean;
  error: string | null;
  onNewButtonClick: () => void; // For EmptyState action
  userPermissions: string[] | null | undefined; // For EmptyState action
  isCompact?: boolean; // Whether to show compact view
}

const DealsKanbanPageView: React.FC<DealsKanbanPageViewProps> = ({
  deals,
  isLoading,
  error,
  onNewButtonClick, // Keep for EmptyState
  userPermissions, // Keep for EmptyState
  isCompact = false,
}) => {
  if (isLoading) {
    return <Flex justify="center" align="center" minH="300px" w="100%"><Spinner size="xl" /></Flex>;
  }
  if (error) {
    return <Alert status="error" m={4}><AlertIcon />{error}</Alert>;
  }
  if (deals.length === 0) {
    return (
      <Box m={4}>
        <EmptyState
          icon={ViewIcon}
          title="No Deals Found"
          message="Get started by creating your first deal or try a different filter."
          actionButtonLabel="New Deal"
          onActionButtonClick={onNewButtonClick}
          isActionButtonDisabled={!userPermissions?.includes('deal:create')}
        />
      </Box>
    );
  }

  // This Box will now be the direct parent of DealsKanbanView and handle its horizontal scroll
  return (
    <Box 
      w="100%" 
      h="100%" // Ensure it tries to take full height of its container in DealsPage
      overflowX="auto" // Enable horizontal scrolling for the DealsKanbanView
      // Styling for the scrollbar can be inherited or applied here if specific
      // sx={{ ... }} // For custom scrollbar like in DealsKanbanView if needed at this level
    >
      <DealsKanbanView deals={deals} isCompact={isCompact} />
    </Box>
  );
};

export default DealsKanbanPageView; 