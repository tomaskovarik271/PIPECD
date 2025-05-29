import React, { useMemo } from 'react';
import {
  Box,
  Heading,
  Button,
  HStack,
  VStack,
  Flex,
  ButtonGroup,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useAppStore } from '../../stores/useAppStore';
import DealsKanbanPageView from './DealsKanbanPageView';
import QuickFilterControls, { QuickFilter } from '../common/QuickFilterControls';
import type { UserListItem } from '../../stores/useUserListStore';
import type { Deal } from '../../stores/useDealsStore';
import { useThemeStore } from '../../stores/useThemeStore';

interface DealsKanbanPageLayoutProps {
  displayedDeals: Deal[];
  pageIsLoading: boolean;
  dealsError: string | null;
  handleCreateDealClick: () => void;
  activeQuickFilterKey: string | null;
  setActiveQuickFilterKey: (key: string | null) => void;
  availableQuickFilters: QuickFilter[];
  selectedAssignedUserId: string | null;
  setSelectedAssignedUserId: (userId: string | null) => void;
  userList: UserListItem[];
  usersLoading: boolean;
  userPermissions: string[] | null | undefined;
  dealsViewMode: 'table' | 'kanban';
  setDealsViewMode: (mode: 'table' | 'kanban') => void;
}

const DealsKanbanPageLayout: React.FC<DealsKanbanPageLayoutProps> = ({
  displayedDeals,
  pageIsLoading,
  dealsError,
  handleCreateDealClick,
  activeQuickFilterKey,
  setActiveQuickFilterKey,
  availableQuickFilters,
  selectedAssignedUserId,
  setSelectedAssignedUserId,
  userList,
  usersLoading,
  userPermissions,
  dealsViewMode, 
  setDealsViewMode,
}) => {
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const currentThemeName = useThemeStore((state) => state.currentTheme);
  const isModernTheme = currentThemeName === 'modern';

  const sidebarWidth = isSidebarCollapsed ? "70px" : (isModernTheme ? "280px" : "200px");
  const pageHeaderHeight = isModernTheme ? "auto" : "72px";
  const headerPaddingY = isModernTheme ? "24px" : 4;
  const headerPaddingX = isModernTheme ? "32px" : 6;

  const modernButtonHeight = "40px";
  const modernButtonSize = "md";

  const totalValue = useMemo(() => displayedDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0), [displayedDeals]);
  const averageDealSize = useMemo(() => totalValue / (displayedDeals.length || 1), [totalValue, displayedDeals.length]);

  return (
    <VStack spacing={0} align="stretch" w="100%" h="100%">
      <Flex
        direction={isModernTheme ? "column" : "row"}
        alignItems={isModernTheme ? "stretch" : "center"}
        justifyContent="space-between"
        py={headerPaddingY}
        px={headerPaddingX}
        bg={isModernTheme ? 'background.content' : { base: 'gray.50', _dark: 'gray.900' }}
        position="fixed"
        top="0"
        left={sidebarWidth}
        width={`calc(100% - ${sidebarWidth})`}
        minH={pageHeaderHeight}
        zIndex="sticky"
        transition="left 0.2s ease-in-out, width 0.2s ease-in-out, background 0.2s ease-in-out"
        borderBottomWidth={isModernTheme ? "1px" : "1px"} 
        borderColor={isModernTheme ? 'border.default' : { base: 'gray.200', _dark: 'gray.700' }}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={isModernTheme ? 4 : 0}>
          <Heading as="h2" size={isModernTheme ? "xl" : "lg"} color={isModernTheme ? 'text.default' : undefined}>
            Deals
          </Heading>
          <HStack spacing={isModernTheme ? 3 : 2}>
            {isModernTheme && dealsViewMode === 'table' && (
              <InputGroup size={modernButtonSize} maxW="280px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={"gray.400"} />
                </InputLeftElement>
                <Input 
                  type="search" 
                  placeholder="Search deals..." 
                  borderRadius="md"
                  bg={"gray.700"}
                  color={"white"}
                  borderColor={"gray.500"}
                  height={modernButtonHeight}
                  _placeholder={{
                    color: "gray.400"
                  }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #3182ce"
                  }}
                />
              </InputGroup>
            )}
            <Select
              placeholder="Assigned User"
              size={isModernTheme ? modernButtonSize : "sm"}
              height={isModernTheme ? modernButtonHeight : undefined}
              value={selectedAssignedUserId || ''}
              onChange={(e) => setSelectedAssignedUserId(e.target.value || null)}
              isDisabled={usersLoading}
              minW="180px"
              borderRadius="md"
              bg={isModernTheme ? "gray.700" : undefined}
              color={isModernTheme ? "white" : undefined}
              borderColor={isModernTheme ? "gray.500" : undefined}
              iconColor={isModernTheme ? "gray.400" : undefined}
              _focus={{
                borderColor: isModernTheme ? "blue.400" : undefined,
                boxShadow: isModernTheme ? "0 0 0 1px #3182ce" : undefined
              }}
            >
              <option value="">All Users</option>
              <option value="unassigned">Unassigned</option>
              {userList.map(user => (
                <option key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </option>
              ))}
            </Select>

            <ButtonGroup size={isModernTheme ? modernButtonSize : "sm"} isAttached variant="outline">
              <Button 
                onClick={() => setDealsViewMode('table')} 
                isActive={dealsViewMode === 'table'}
                height={isModernTheme ? modernButtonHeight : undefined}
                bg={isModernTheme ? (dealsViewMode === 'table' ? "blue.600" : "gray.700") : undefined}
                color={isModernTheme ? "white" : undefined}
                borderColor={isModernTheme ? "gray.500" : undefined}
                _hover={isModernTheme ? {
                  bg: "gray.600",
                  borderColor: "gray.400"
                } : {}}
                _active={isModernTheme ? {
                  bg: "blue.700"
                } : {}}
              >
                Table
              </Button>
              <Button 
                onClick={() => setDealsViewMode('kanban')} 
                isActive={dealsViewMode === 'kanban'}
                height={isModernTheme ? modernButtonHeight : undefined}
                bg={isModernTheme ? (dealsViewMode === 'kanban' ? "blue.600" : "gray.700") : undefined}
                color={isModernTheme ? "white" : undefined}
                borderColor={isModernTheme ? "gray.500" : undefined}
                _hover={isModernTheme ? {
                  bg: "gray.600",
                  borderColor: "gray.400"
                } : {}}
                _active={isModernTheme ? {
                  bg: "blue.700"
                } : {}}
              >
                Kanban
              </Button>
            </ButtonGroup>

            <QuickFilterControls
              availableFilters={availableQuickFilters}
              activeFilterKey={activeQuickFilterKey}
              onSelectFilter={setActiveQuickFilterKey}
              isModernTheme={isModernTheme}
              buttonProps={isModernTheme ? {
                bg: "gray.700",
                color: "white",
                borderColor: "gray.500",
                size: modernButtonSize,
                height: modernButtonHeight,
                _hover: {
                  bg: "gray.600",
                  borderColor: "gray.400"
                },
                _active: {
                  bg: "blue.600",
                  borderColor: "blue.500"
                }
              } : {}}
            />

            <Button
              colorScheme={isModernTheme ? "brand" : "blue"}
              onClick={handleCreateDealClick}
              isDisabled={!userPermissions?.includes('deal:create')}
              size={isModernTheme ? modernButtonSize : "md"}
              height={isModernTheme ? modernButtonHeight : undefined}
              minW={isModernTheme ? "120px" : undefined}
              leftIcon={isModernTheme ? <AddIcon /> : undefined}
            >
              New Deal
            </Button>
          </HStack>
        </Flex>
        {isModernTheme && (
          <StatGroup mt={2} borderTopWidth="1px" borderColor="border.divider" pt={3}>
            <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Total Value</StatLabel>
              <StatNumber fontSize="lg" color="white">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Avg. Deal Size</StatLabel>
              <StatNumber fontSize="lg" color="white">${averageDealSize.toLocaleString('en-US', { maximumFractionDigits: 0 })}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Win Rate</StatLabel>
              <StatNumber fontSize="lg" color="white">--%</StatNumber>
            </Stat>
             <Stat>
              <StatLabel color="gray.300" fontWeight="medium">Open Deals</StatLabel>
              <StatNumber fontSize="lg" color="white">{displayedDeals.length}</StatNumber>
            </Stat>
          </StatGroup>
        )}
      </Flex>

      <Box
        flexGrow={1}
        overflowY="auto"
        h="100%"
        pt={`calc(${typeof pageHeaderHeight === 'string' && pageHeaderHeight.endsWith('px') ? pageHeaderHeight : '72px'} + ${isModernTheme ? '90px' : '1rem'})`}
        px={headerPaddingX}
      >
        <DealsKanbanPageView
          deals={displayedDeals}
          isLoading={pageIsLoading}
          error={dealsError}
          onNewButtonClick={handleCreateDealClick}
          userPermissions={userPermissions}
        />
      </Box>
    </VStack>
  );
};

export default DealsKanbanPageLayout; 