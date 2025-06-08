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
import LeadsKanbanPageView from './LeadsKanbanPageView';
import type { UserListItem } from '../../stores/useUserListStore';
import type { Lead } from '../../stores/useLeadsStore';
import UnifiedPageHeader from '../layout/UnifiedPageHeader';
import { usePageLayoutStyles } from '../../utils/headerUtils';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';
import { useLeadTheme } from '../../hooks/useLeadTheme';

interface LeadsKanbanPageLayoutProps {
  displayedLeads: Lead[];
  pageIsLoading: boolean;
  leadsError: string | null;
  handleCreateLeadClick: () => void;
  selectedAssignedUserIds: string[];
  setSelectedAssignedUserIds: (userIds: string[]) => void;
  userList: UserListItem[];
  usersLoading: boolean;
  userPermissions: string[] | null | undefined;
  leadsViewMode: 'table' | 'kanban';
  setLeadsViewMode: (mode: 'table' | 'kanban') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const LeadsKanbanPageLayout: React.FC<LeadsKanbanPageLayoutProps> = ({
  displayedLeads,
  pageIsLoading,
  leadsError,
  handleCreateLeadClick,
  selectedAssignedUserIds,
  setSelectedAssignedUserIds,
  userList,
  usersLoading,
  userPermissions,
  leadsViewMode, 
  setLeadsViewMode,
  searchTerm,
  onSearchChange,
}) => {
  const colors = useThemeColors();
  const leadTheme = useLeadTheme();
  const styles = useThemeStyles();
  const pageLayoutStyles = usePageLayoutStyles(true);

  // Calculate statistics for the header (lead-specific)
  const totalValue = useMemo(() => displayedLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0), [displayedLeads]);
  const averageLeadScore = useMemo(() => displayedLeads.length > 0 ? displayedLeads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / displayedLeads.length : 0, [displayedLeads]);
  const qualificationRate = useMemo(() => {
    const qualifiedLeads = displayedLeads.filter(l => l.isQualified);
    const unqualifiedLeads = displayedLeads.filter(l => !l.isQualified);
    return displayedLeads.length > 0 ? Math.round((qualifiedLeads.length / displayedLeads.length) * 100) : 0;
  }, [displayedLeads]);

  const unqualifiedLeadsCount = useMemo(() => 
    displayedLeads.filter(l => !l.isQualified).length, 
    [displayedLeads]
  );

  const statistics = useMemo(() => [
    {
      label: 'Total Value',
      value: totalValue,
      formatter: (value: string | number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)),
      color: leadTheme.colors.metrics.totalValue
    },
    {
      label: 'Avg. Score',
      value: Math.round(averageLeadScore),
      color: leadTheme.colors.metrics.avgScore
    },
    {
      label: 'Qualification Rate',
      value: `${qualificationRate}%`,
      color: leadTheme.colors.metrics.qualificationRate
    },
    {
      label: 'Unqualified Leads',
      value: unqualifiedLeadsCount,
      color: leadTheme.colors.metrics.unqualified
    }
  ], [totalValue, averageLeadScore, qualificationRate, unqualifiedLeadsCount, leadTheme.colors.metrics]);

  // Helper function to get user display name
  const getUserDisplayName = useCallback((userId: string) => {
    if (userId === 'unassigned') return 'Unassigned';
    const user = userList.find(u => u.id === userId);
    return user ? (user.display_name || user.email) : 'Unknown User';
  }, [userList]);

  // Helper function to remove selected user
  const removeSelectedUser = useCallback((userId: string) => {
    setSelectedAssignedUserIds(selectedAssignedUserIds.filter(id => id !== userId));
  }, [selectedAssignedUserIds, setSelectedAssignedUserIds]);

  // Handle menu option change
  const handleMenuOptionChange = useCallback((value: string | string[]) => {
    const newSelectedIds = Array.isArray(value) ? value : [value];
    setSelectedAssignedUserIds(newSelectedIds);
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
        title="Leads"
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search leads..."
        primaryButtonLabel="Create Lead"
        onPrimaryButtonClick={handleCreateLeadClick}
        requiredPermission="lead:create"
        userPermissions={userPermissions || []}
        showViewModeSwitch={true}
        viewMode={leadsViewMode}
        onViewModeChange={setLeadsViewMode}
        secondaryActions={secondaryActions}
        statistics={statistics}
      />

      <Box 
        sx={{
          ...pageLayoutStyles.container,
          bg: leadTheme.colors.bg.primary,
        }}
      >
        <LeadsKanbanPageView
          leads={displayedLeads}
          isLoading={pageIsLoading}
          error={leadsError}
          onNewButtonClick={handleCreateLeadClick}
          userPermissions={userPermissions}
        />
      </Box>
    </>
  );
};

export default LeadsKanbanPageLayout; 