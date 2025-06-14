import React, { useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,

} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import DealsKanbanPageView from './DealsKanbanPageView';
import type { UserListItem } from '../../stores/useUserListStore';
import type { Deal } from '../../stores/useDealsStore';
import UnifiedPageHeader from '../layout/UnifiedPageHeader';
import { usePageLayoutStyles } from '../../utils/headerUtils';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

interface DealsKanbanPageLayoutProps {
  displayedDeals: Deal[];
  pageIsLoading: boolean;
  dealsError: string | null;
  handleCreateDealClick: () => void;
  activeQuickFilterKey: string | null;
  setActiveQuickFilterKey: (key: string | null) => void;
  availableQuickFilters: any[];
  selectedAssignedUserIds: string[];
  setSelectedAssignedUserIds: (userIds: string[]) => void;
  userList: UserListItem[];
  usersLoading: boolean;
  userPermissions: string[] | null | undefined;
  dealsViewMode: 'table' | 'kanban' | 'kanban-compact';
  setDealsViewMode: (mode: 'table' | 'kanban' | 'kanban-compact') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  kanbanCompactMode: boolean;
  setKanbanCompactMode: (isCompact: boolean) => void;
}

const DealsKanbanPageLayout: React.FC<DealsKanbanPageLayoutProps> = ({
  displayedDeals,
  pageIsLoading,
  dealsError,
  handleCreateDealClick,
  selectedAssignedUserIds,
  setSelectedAssignedUserIds,
  userList,
  usersLoading,
  userPermissions,
  dealsViewMode, 
  setDealsViewMode,
  searchTerm,
  onSearchChange,
  kanbanCompactMode,
  setKanbanCompactMode,
}) => {
  const colors = useThemeColors();
  const styles = useThemeStyles();
  const pageLayoutStyles = usePageLayoutStyles(true);

  // Calculate statistics for the header (same as table view)
  const totalValue = useMemo(() => displayedDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0), [displayedDeals]);
  const averageDealSize = useMemo(() => displayedDeals.length > 0 ? totalValue / displayedDeals.length : 0, [totalValue, displayedDeals.length]);
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
      value: totalValue,
      formatter: (value: number | string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
    },
    {
      label: 'Avg. Deal Size',
      value: averageDealSize,
      formatter: (value: number | string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`
    },
    {
      label: 'Open Deals',
      value: openDealsCount
    }
  ], [totalValue, averageDealSize, winRate, openDealsCount]);

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

  // Secondary actions (multi-select assigned user filter for kanban)
  const secondaryActions = (
    <VStack spacing={2} align="stretch" minW="200px">
      <Menu closeOnSelect={false}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          size="md"
          height="40px"
          minW="180px"
          bg={colors.bg.input}
          color={colors.text.primary}
          borderColor={colors.border.input}
          _hover={{
            bg: colors.component.button.secondaryHover,
            borderColor: colors.border.focus
          }}
          textAlign="left"
          fontWeight="normal"
          isDisabled={usersLoading}
        >
          {selectedAssignedUserIds.length === 0 ? 'Assigned User' : `${selectedAssignedUserIds.length} selected`}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup 
            type="checkbox" 
            value={selectedAssignedUserIds}
            onChange={handleMenuOptionChange}
          >
            <MenuItemOption value="unassigned">Unassigned</MenuItemOption>
            {userList.map(user => (
              <MenuItemOption key={user.id} value={user.id}>
                {user.display_name || user.email}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      
      {/* Selected users tags */}
      {selectedAssignedUserIds.length > 0 && (
        <HStack spacing={1} wrap="wrap" maxW="200px">
          {selectedAssignedUserIds.map(userId => (
            <Tag 
              key={userId} 
              size="sm" 
              colorScheme="blue" 
              variant="subtle"
              bg={colors.interactive.default}
              color={colors.text.onAccent}
            >
              <TagLabel>{getUserDisplayName(userId)}</TagLabel>
              <TagCloseButton onClick={() => removeSelectedUser(userId)} />
            </Tag>
          ))}
        </HStack>
      )}
    </VStack>
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
          if (mode === 'table' || mode === 'kanban' || mode === 'kanban-compact') {
            setDealsViewMode(mode);
          }
        }}
        supportedViewModes={['table', 'kanban', 'kanban-compact']}
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
    </>
  );
};

export default DealsKanbanPageLayout; 