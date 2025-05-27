import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  Spinner,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons'; // Assuming ViewIcon for empty state
import QuickFilterControls, { QuickFilter } from '../common/QuickFilterControls';
import EmptyState from '../common/EmptyState';
import DealsKanbanView from './DealsKanbanView'; // The actual Kanban board
import type { Deal } from '../../stores/useDealsStore'; // For the deals prop, though KanbanView might have its own needs

interface DealsKanbanPageViewProps {
  deals: Deal[]; // Filtered deals to determine if empty state should be shown
  isLoading: boolean;
  error: string | null;
  onNewButtonClick: () => void;
  userPermissions: string[] | null | undefined;
  dealsViewMode: 'table' | 'kanban';
  onSetDealsViewMode: (mode: 'table' | 'kanban') => void;
  availableQuickFilters: QuickFilter[];
  activeQuickFilterKey: string | null;
  onSelectQuickFilter: (key: string | null) => void;
}

const DealsKanbanPageView: React.FC<DealsKanbanPageViewProps> = ({
  deals,
  isLoading,
  error,
  onNewButtonClick,
  userPermissions,
  dealsViewMode,
  onSetDealsViewMode,
  availableQuickFilters,
  activeQuickFilterKey,
  onSelectQuickFilter,
}) => {
  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Flex justifyContent="space-between" alignItems="center" mb={0} mt={2} px={6}>
        <Heading as="h2" size="lg">
          Deals
        </Heading>
        <HStack spacing={2}>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button 
              onClick={() => onSetDealsViewMode('table')} 
              isActive={dealsViewMode === 'table'}
            >
              Table
            </Button>
            <Button 
              onClick={() => onSetDealsViewMode('kanban')} 
              isActive={dealsViewMode === 'kanban'}
            >
              Kanban
            </Button>
          </ButtonGroup>
          <QuickFilterControls
            availableFilters={availableQuickFilters}
            activeFilterKey={activeQuickFilterKey}
            onSelectFilter={onSelectQuickFilter}
          />
          <Button
            colorScheme="blue"
            onClick={onNewButtonClick}
            isDisabled={!userPermissions?.includes('deal:create')}
            size="md"
          >
            New Deal
          </Button>
        </HStack>
      </Flex>

      {isLoading && (
        <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>
      )}
      {!isLoading && error && (
        <Alert status="error" mx={6}><AlertIcon />{error}</Alert>
      )}
      {!isLoading && !error && deals.length === 0 && (
        <Box mx={6}>
          <EmptyState
            icon={ViewIcon}
            title="No Deals Found"
            message="Get started by creating your first deal or try a different filter."
            actionButtonLabel="New Deal"
            onActionButtonClick={onNewButtonClick}
            isActionButtonDisabled={!userPermissions?.includes('deal:create')}
          />
        </Box>
      )}
      {!isLoading && !error && deals.length > 0 && (
        // DealsKanbanView might internally fetch/process deals differently based on stages
        // For now, we just render it. It will use the deals from useDealsStore.
        <DealsKanbanView /> 
      )}
    </VStack>
  );
};

export default DealsKanbanPageView; 