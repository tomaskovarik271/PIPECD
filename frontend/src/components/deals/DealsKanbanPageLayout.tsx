import React, { useMemo, useCallback, useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  HStack,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,

} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import DealsKanbanPageView from './DealsKanbanPageView';
import type { UserListItem } from '../../stores/useUserListStore';
import type { Deal } from '../../stores/useDealsStore';
import UnifiedPageHeader from '../layout/UnifiedPageHeader';
import { usePageLayoutStyles } from '../../utils/headerUtils';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { useAppStore } from '../../stores/useAppStore';
import { TbCurrencyDollar, TbWorld } from 'react-icons/tb';
import { CurrencyFormatter } from '../../lib/utils/currencyFormatter';
import { LabelFilter } from './LabelFilter';
import { AdvancedFilterBuilder } from '../common/AdvancedFilterBuilder';
import { ConsolidatedFilterBar } from './ConsolidatedFilterBar';
import { getAvailableFilterFields } from '../../utils/filterFields';
import type { DealFilters, FilterCriteria } from '../../types/filters';
import { useSavedFiltersStore } from '../../stores/useSavedFiltersStore';

interface QuickFilter {
  key: string;
  label: string;
  value?: string | number;
  count?: number;
}

interface DealsKanbanPageLayoutProps {
  displayedDeals: Deal[];
  pageIsLoading: boolean;
  dealsError: string | null;
  handleCreateDealClick: () => void;
  activeQuickFilterKey: string | null;
  setActiveQuickFilterKey: (key: string | null) => void;
  availableQuickFilters: QuickFilter[];
  selectedAssignedUserIds: string[];
  setSelectedAssignedUserIds: (userIds: string[]) => void;
  userList: UserListItem[];
  usersLoading: boolean;
  userPermissions: string[] | null | undefined;
  dealsViewMode: 'table' | 'kanban-compact';
  setDealsViewMode: (mode: 'table' | 'kanban-compact') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  kanbanCompactMode: boolean;
  setKanbanCompactMode: (isCompact: boolean) => void;
  selectedLabels: Array<{ labelText: string; colorHex: string }>;
  setSelectedLabels: (labels: Array<{ labelText: string; colorHex: string }>) => void;
  labelFilterLogic: 'AND' | 'OR';
  setLabelFilterLogic: (logic: 'AND' | 'OR') => void;
  showClosedDeals?: boolean;
  onShowClosedDealsChange?: (show: boolean) => void;
  // Advanced filtering props
  isUsingAdvancedFilters?: boolean;
  onApplyAdvancedFilters?: (filters: DealFilters) => void;
  onClearAdvancedFilters?: () => void;
}

const DealsKanbanPageLayout: React.FC<DealsKanbanPageLayoutProps> = ({
  displayedDeals,
  pageIsLoading,
  dealsError,
  handleCreateDealClick,
  selectedAssignedUserIds,
  setSelectedAssignedUserIds,
  userList,
  usersLoading: _usersLoading,
  userPermissions,
  dealsViewMode, 
  setDealsViewMode,
  searchTerm,
  onSearchChange,
  kanbanCompactMode,
  setKanbanCompactMode: _setKanbanCompactMode,
  selectedLabels,
  setSelectedLabels,
  labelFilterLogic,
  setLabelFilterLogic,
  showClosedDeals = false,
  onShowClosedDealsChange,
  // Advanced filtering props
  isUsingAdvancedFilters = false,
  onApplyAdvancedFilters,
  onClearAdvancedFilters,
}) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const pageLayoutStyles = usePageLayoutStyles(true);
  
  // Advanced filter state
  const { 
    isOpen: isAdvancedFilterOpen, 
    onOpen: onOpenAdvancedFilter, 
    onClose: onCloseAdvancedFilter 
  } = useDisclosure();
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);
  
  // Saved filters functionality
  const { savedFilters, addSavedFilter } = useSavedFiltersStore();
  
  // Currency display mode from app store
  const { 
    currencyDisplayMode, 
    setCurrencyDisplayMode, 
    baseCurrencyForConversion,
    setBaseCurrencyForConversion 
  } = useAppStore();

  // Simple exchange rates for demo (in production, this would come from the database)
  const EXCHANGE_RATES: Record<string, Record<string, number>> = {
    'USD': { 'EUR': 0.85, 'GBP': 0.75, 'CHF': 0.92, 'USD': 1.0 },
    'EUR': { 'USD': 1.18, 'GBP': 0.88, 'CHF': 1.08, 'EUR': 1.0 },
    'GBP': { 'USD': 1.33, 'EUR': 1.14, 'CHF': 1.23, 'GBP': 1.0 },
    'CHF': { 'USD': 1.09, 'EUR': 0.93, 'GBP': 0.81, 'CHF': 1.0 },
  };

  // Calculate statistics for the header with multi-currency support
  const totalValueFormatted = useMemo(() => {
    if (currencyDisplayMode === 'converted') {
      // Convert all amounts to base currency
      const totalInBaseCurrency = displayedDeals.reduce((sum, deal) => {
        const amount = deal.amount || 0;
        const currency = deal.currency || 'USD';
        const rate = EXCHANGE_RATES[currency]?.[baseCurrencyForConversion] || 1;
        return sum + (amount * rate);
      }, 0);
      
      return CurrencyFormatter.format(totalInBaseCurrency, baseCurrencyForConversion, { precision: 0 });
    } else {
      // Mixed currency display
      return CurrencyFormatter.formatMixedCurrencyTotal(
        displayedDeals.map(deal => ({ amount: deal.amount, currency: deal.currency })),
        'EUR'
      );
    }
  }, [displayedDeals, currencyDisplayMode, baseCurrencyForConversion]);
  
  const averageDealSizeFormatted = useMemo(() => {
    if (displayedDeals.length === 0) return '€0';
    
    if (currencyDisplayMode === 'converted') {
      // Convert all amounts to base currency and calculate average
      const totalInBaseCurrency = displayedDeals.reduce((sum, deal) => {
        const amount = deal.amount || 0;
        const currency = deal.currency || 'USD';
        const rate = EXCHANGE_RATES[currency]?.[baseCurrencyForConversion] || 1;
        return sum + (amount * rate);
      }, 0);
      
      const avgAmount = totalInBaseCurrency / displayedDeals.length;
      return CurrencyFormatter.format(avgAmount, baseCurrencyForConversion, { precision: 0 });
    } else {
      // For average in mixed mode, use the most common currency
      const currencyGroups = displayedDeals.reduce((acc, deal) => {
        const currency = deal.currency || 'EUR';
        if (!acc[currency]) {
          acc[currency] = { total: 0, count: 0 };
        }
        acc[currency].total += deal.amount || 0;
        acc[currency].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      const currencies = Object.keys(currencyGroups);
      if (currencies.length === 0) return '€0';
      
      // Use the currency with the most deals
      const primaryCurrency = currencies.sort((a, b) => currencyGroups[b].count - currencyGroups[a].count)[0];
      const avgAmount = currencyGroups[primaryCurrency].total / currencyGroups[primaryCurrency].count;
      
      return CurrencyFormatter.format(avgAmount, primaryCurrency, { precision: 0 });
    }
  }, [displayedDeals, currencyDisplayMode, baseCurrencyForConversion]);

  const winRate = useMemo(() => {
    const closedDeals = displayedDeals.filter(d => d.currentWfmStep?.isFinalStep);
    const wonDeals = closedDeals.filter(d => d.currentWfmStep?.status?.name?.toLowerCase().includes('won'));
    return closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
  }, [displayedDeals]);

  const openDealsCount = useMemo(() => 
    displayedDeals.filter(d => !d.currentWfmStep?.isFinalStep).length, 
    [displayedDeals]
  );

  const statistics = useMemo(() => [
    {
      label: 'Total Value',
      value: totalValueFormatted
    },
    {
      label: 'Avg. Deal Size',
      value: averageDealSizeFormatted
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`
    },
    {
      label: 'Open Deals',
      value: openDealsCount
    }
  ], [totalValueFormatted, averageDealSizeFormatted, winRate, openDealsCount]);

  // Helper function to get user display name
  const getUserDisplayName = useCallback((userId: string) => {
    if (userId === 'unassigned') return 'Unassigned';
    const user = userList.find(u => u.id === userId);
    return user?.display_name || user?.email || userId;
  }, [userList]);

  // Handle removing a selected user
  const removeSelectedUser = useCallback((userIdToRemove: string) => {
    setSelectedAssignedUserIds(selectedAssignedUserIds.filter(id => id !== userIdToRemove));
  }, [selectedAssignedUserIds, setSelectedAssignedUserIds]);

  // Handle menu option changes
  const handleMenuOptionChange = useCallback((values: string | string[]) => {
    const valueArray = Array.isArray(values) ? values : [values];
    setSelectedAssignedUserIds(valueArray);
  }, [setSelectedAssignedUserIds]);

  // Advanced filter handlers
  const handleApplyAdvancedFilters = useCallback((filters: DealFilters) => {
    if (onApplyAdvancedFilters) {
      onApplyAdvancedFilters(filters);
    }
    onCloseAdvancedFilter();
  }, [onApplyAdvancedFilters, onCloseAdvancedFilter]);

  const handleClearAdvancedFilters = useCallback(() => {
    setFilterCriteria([]);
    if (onClearAdvancedFilters) {
      onClearAdvancedFilters();
    }
  }, [onClearAdvancedFilters]);

  // Enhanced secondary actions with currency display toggle
  const secondaryActions = (
    <HStack spacing={3}>
      {/* Currency Display Mode Toggle - Cleaner Design */}
      <HStack spacing={2} bg={colors.bg.elevated} p={1} borderRadius="md" borderWidth="1px" borderColor={colors.border.default}>
        <Button
          size="sm"
          variant={currencyDisplayMode === 'mixed' ? 'solid' : 'ghost'}
          colorScheme={currencyDisplayMode === 'mixed' ? 'blue' : undefined}
          leftIcon={<TbWorld size={14} />}
          onClick={() => setCurrencyDisplayMode('mixed')}
          fontSize="xs"
          px={3}
          py={1}
          h="32px"
        >
          Mixed
        </Button>
        <Button
          size="sm"
          variant={currencyDisplayMode === 'converted' ? 'solid' : 'ghost'}
          colorScheme={currencyDisplayMode === 'converted' ? 'blue' : undefined}
          leftIcon={<TbCurrencyDollar size={14} />}
          onClick={() => setCurrencyDisplayMode('converted')}
          fontSize="xs"
          px={3}
          py={1}
          h="32px"
        >
          Convert
        </Button>
      </HStack>

      {/* Base Currency Selector (only show when in converted mode) */}
      {currencyDisplayMode === 'converted' && (
        <Select
          value={baseCurrencyForConversion}
          onChange={(e) => setBaseCurrencyForConversion(e.target.value)}
          size="sm"
          width="80px"
          fontSize="xs"
          {...styles.input}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="CHF">CHF</option>
        </Select>
      )}

      {/* Existing User Filter */}
      {userList.length > 0 && (
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            size="md"
            height="40px"
            minW="120px"
            {...styles.button.secondary}
          >
            {selectedAssignedUserIds.length === 0 
              ? 'All Users' 
              : selectedAssignedUserIds.length === 1 
                ? userList.find(u => u.id === selectedAssignedUserIds[0])?.display_name || 'User'
                : `${selectedAssignedUserIds.length} Users`
            }
          </MenuButton>
          <MenuList>
            <MenuOptionGroup 
              value={selectedAssignedUserIds} 
              type="checkbox"
              onChange={(values) => setSelectedAssignedUserIds(values as string[])}
            >
              {userList.map(user => (
                <MenuItemOption key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      )}

      {/* Consolidated Filters */}
      <ConsolidatedFilterBar
        selectedLabels={selectedLabels}
        onLabelsChange={setSelectedLabels}
        labelFilterLogic={labelFilterLogic}
        onLogicChange={setLabelFilterLogic}
        isUsingAdvancedFilters={isUsingAdvancedFilters}
        onOpenAdvancedFilter={onOpenAdvancedFilter}
        onClearAdvancedFilters={handleClearAdvancedFilters}
        showClosedDeals={showClosedDeals}
        onShowClosedDealsChange={onShowClosedDealsChange}
        showColumnSelector={false}
        isDisabled={pageIsLoading}
      />
    </HStack>
  );

  return (
    <>
      <UnifiedPageHeader
        title="Deals"
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search deals..."
        primaryButtonLabel="New Deal"
        onPrimaryButtonClick={handleCreateDealClick}
        requiredPermission="deal:create"
        userPermissions={userPermissions || []}
        showViewModeSwitch={true}
        viewMode={dealsViewMode}
        onViewModeChange={(mode) => {
          if (mode === 'table' || mode === 'kanban-compact') {
            setDealsViewMode(mode);
          }
        }}
        supportedViewModes={['table', 'kanban-compact']}
        secondaryActions={secondaryActions}
        statistics={statistics}
      />

      <Box sx={pageLayoutStyles.container}>
        <DealsKanbanPageView
          deals={displayedDeals}
          isLoading={pageIsLoading}
          error={dealsError}
          onNewButtonClick={handleCreateDealClick}
          userPermissions={userPermissions}
          isCompact={kanbanCompactMode}
        />
      </Box>

      {/* Advanced Filter Modal */}
      <Modal isOpen={isAdvancedFilterOpen} onClose={onCloseAdvancedFilter} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>Advanced Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AdvancedFilterBuilder
              availableFields={getAvailableFilterFields()}
              onApplyFilters={handleApplyAdvancedFilters}
              onSaveFilter={addSavedFilter}
              savedFilters={savedFilters}
              initialFilters={filterCriteria}
              onFiltersChange={setFilterCriteria}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DealsKanbanPageLayout; 