import React from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  VStack,
  InputGroup,
  InputLeftElement,
  Input,
  IconButton,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAppStore } from '../../stores/useAppStore';
import { useThemeColors, useThemeStyles } from '../../hooks/useThemeColors';

interface PageStatistic {
  label: string;
  value: number | string;
  formatter?: (value: number | string) => string;
}

interface UnifiedPageHeaderProps {
  title: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  primaryButtonLabel?: string;
  onPrimaryButtonClick?: () => void;
  isPrimaryButtonDisabled?: boolean;
  secondaryActions?: React.ReactNode;
  viewMode?: 'table' | 'kanban';
  onViewModeChange?: (mode: 'table' | 'kanban') => void;
  showViewModeSwitch?: boolean;
  statistics?: PageStatistic[];
  userPermissions?: string[];
  requiredPermission?: string;
}

const UnifiedPageHeader: React.FC<UnifiedPageHeaderProps> = ({
  title,
  searchTerm,
  onSearchChange,
  showSearch = false,
  searchPlaceholder = "Search...",
  primaryButtonLabel,
  onPrimaryButtonClick,
  isPrimaryButtonDisabled = false,
  secondaryActions,
  viewMode,
  onViewModeChange,
  showViewModeSwitch = false,
  statistics,
  userPermissions,
  requiredPermission,
}) => {
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  
  const colors = useThemeColors();
  const styles = useThemeStyles();

  const sidebarWidth = isSidebarCollapsed ? "70px" : "280px";

  const canShowPrimaryButton = !requiredPermission || userPermissions?.includes(requiredPermission);

  return (
    <Box
      position="fixed"
      top="0"
      left={sidebarWidth}
      width={`calc(100% - ${sidebarWidth})`}
      py={6}
      px={8}
      bg={colors.bg.content}
      borderBottomWidth="1px"
      borderColor={colors.border.default}
      zIndex="sticky"
      transition="left 0.2s ease-in-out, width 0.2s ease-in-out"
      boxShadow="sm"
    >
      {/* Main header row */}
      <Flex justifyContent="space-between" alignItems="center" mb={statistics ? 4 : 0}>
        <Heading 
          as="h2" 
          size="xl"
          color={colors.text.primary}
        >
          {title}
        </Heading>
        
        <HStack spacing={3}>
          {/* Search input */}
          {showSearch && onSearchChange && (
            <InputGroup size="md" maxW="280px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={colors.text.muted} />
              </InputLeftElement>
              <Input 
                type="search" 
                placeholder={searchPlaceholder}
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                borderRadius="md"
                {...styles.input}
              />
            </InputGroup>
          )}
          
          {/* View mode switcher */}
          {showViewModeSwitch && onViewModeChange && viewMode && (
            <HStack spacing={1}>
              <IconButton
                aria-label="Table view"
                icon={<HamburgerIcon />}
                size="md"
                variant={viewMode === 'table' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'table' ? 'blue' : undefined}
                bg={viewMode === 'table' ? colors.interactive.default : colors.component.button.secondary}
                borderColor={colors.border.input}
                color={viewMode === 'table' ? colors.text.onAccent : colors.text.primary}
                _hover={{
                  bg: viewMode === 'table' ? colors.interactive.hover : colors.component.button.secondaryHover
                }}
                onClick={() => onViewModeChange('table')}
              />
              <IconButton
                aria-label="Kanban view"
                icon={<ViewIcon />}
                size="md"
                variant={viewMode === 'kanban' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'kanban' ? 'blue' : undefined}
                bg={viewMode === 'kanban' ? colors.interactive.default : colors.component.button.secondary}
                borderColor={colors.border.input}
                color={viewMode === 'kanban' ? colors.text.onAccent : colors.text.primary}
                _hover={{
                  bg: viewMode === 'kanban' ? colors.interactive.hover : colors.component.button.secondaryHover
                }}
                onClick={() => onViewModeChange('kanban')}
              />
            </HStack>
          )}
          
          {/* Secondary actions */}
          {secondaryActions}
          
          {/* Primary action button */}
          {canShowPrimaryButton && primaryButtonLabel && onPrimaryButtonClick && (
            <Button
              {...styles.button.primary}
              onClick={onPrimaryButtonClick}
              isDisabled={isPrimaryButtonDisabled}
              size="md"
            >
              {primaryButtonLabel}
            </Button>
          )}
        </HStack>
      </Flex>
      
      {/* Statistics row */}
      {statistics && statistics.length > 0 && (
        <Box
          pt={4}
          borderTopWidth="1px"
          borderColor={colors.border.divider}
        >
          <StatGroup 
            gap={{ base: 4, md: 8 }}
            justifyContent="space-between"
            flexWrap={{ base: "wrap", lg: "nowrap" }}
          >
            {statistics.map((stat, index) => (
              <Stat 
                key={index} 
                textAlign="center"
                minW={{ base: "120px", md: "140px" }}
                flex={{ base: "1 1 auto", lg: "1" }}
              >
                <StatLabel 
                  color={colors.text.secondary}
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="medium"
                >
                  {stat.label}
                </StatLabel>
                <StatNumber 
                  color={colors.text.primary}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                >
                  {stat.formatter ? stat.formatter(stat.value) : stat.value}
                </StatNumber>
              </Stat>
            ))}
          </StatGroup>
        </Box>
      )}
    </Box>
  );
};

export default UnifiedPageHeader; 