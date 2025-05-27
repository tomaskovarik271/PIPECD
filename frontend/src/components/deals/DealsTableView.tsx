import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Heading,
} from '@chakra-ui/react';
import { SettingsIcon, ViewIcon } from '@chakra-ui/icons'; // Assuming ViewIcon for empty state, adjust if needed
import ListPageLayout from '../layout/ListPageLayout';
import SortableTable, { ColumnDefinition } from '../common/SortableTable';
import QuickFilterControls, { QuickFilter } from '../common/QuickFilterControls';
import type { Deal } from '../../stores/useDealsStore';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
}

interface DealsTableViewProps {
  deals: Deal[];
  columns: ColumnDefinition<Deal>[];
  isLoading: boolean;
  error: string | null;
  onNewButtonClick: () => void;
  userPermissions: string[] | null | undefined;
  emptyStateProps: EmptyStateProps;
  onOpenColumnSelector: () => void;
  dealsViewMode: 'table' | 'kanban';
  onSetDealsViewMode: (mode: 'table' | 'kanban') => void;
  availableQuickFilters: QuickFilter[];
  activeQuickFilterKey: string | null;
  onSelectQuickFilter: (key: string | null) => void;
}

const DealsTableView: React.FC<DealsTableViewProps> = ({
  deals,
  columns,
  isLoading,
  error,
  onNewButtonClick,
  userPermissions,
  emptyStateProps,
  onOpenColumnSelector,
  dealsViewMode, // Though this component is specific to table view, it needs to render the switcher
  onSetDealsViewMode,
  availableQuickFilters,
  activeQuickFilterKey,
  onSelectQuickFilter,
}) => {
  return (
    <ListPageLayout
      title="Deals"
      newButtonLabel="New Deal"
      onNewButtonClick={onNewButtonClick}
      isNewButtonDisabled={!userPermissions?.includes('deal:create')}
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && !error && deals.length === 0}
      emptyStateProps={emptyStateProps} // Pass through the pre-defined empty state props
      customControls={
        <HStack spacing={2} my={2}>
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
          <Button leftIcon={<SettingsIcon />} onClick={onOpenColumnSelector} size="sm" variant="outline">
            Columns
          </Button>
        </HStack>
      }
    >
      {!isLoading && !error && deals.length > 0 && (
        <SortableTable<Deal>
          data={deals}
          columns={columns}
          initialSortKey="expected_close_date" // This could be a prop if needs to be dynamic
          initialSortDirection="ascending"     // This could also be a prop
        />
      )}
    </ListPageLayout>
  );
};

export default DealsTableView; 